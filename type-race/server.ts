import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Types
interface Player {
    id: string;
    name: string;
    carId: string;
    progress: number;
    wpm: number;
    finished: boolean;
    finishTime?: number;
}

interface RoomSettings {
    wordCount: number;
    includeCapitals: boolean;
    useAI: boolean;
    mode: 'multiplayer' | 'solo';
}

interface Room {
    id: string;
    hostId: string;
    players: Map<string, Player>;
    settings: RoomSettings;
    state: 'waiting' | 'countdown' | 'racing' | 'finished';
    text: string;
    createdAt: number;
    startTime?: number;
}

// In-memory room storage
const rooms = new Map<string, Room>();

// Helper to generate unique room ID
function generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Helper to serialize room for client
function serializeRoom(room: Room) {
    return {
        id: room.id,
        hostId: room.hostId,
        players: Array.from(room.players.values()),
        settings: room.settings,
        state: room.state,
        text: room.state !== 'waiting' ? room.text : '', // Don't send text until race starts
        startTime: room.startTime
    };
}

// Cleanup old rooms (older than 1 hour)
function cleanupOldRooms() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [roomId, room] of rooms) {
        if (room.createdAt < oneHourAgo) {
            rooms.delete(roomId);
            console.log(`Cleaned up old room: ${roomId}`);
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldRooms, 10 * 60 * 1000);

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log("Client connected:", socket.id);

        // Create a new room
        socket.on("create-room", (data: { playerName: string; carId: string; settings: RoomSettings; text: string }, callback) => {
            const roomId = generateRoomId();

            const player: Player = {
                id: socket.id,
                name: data.playerName || 'Player',
                carId: data.carId || 'c1',
                progress: 0,
                wpm: 0,
                finished: false
            };

            const room: Room = {
                id: roomId,
                hostId: socket.id,
                players: new Map([[socket.id, player]]),
                settings: data.settings,
                state: 'waiting',
                text: data.text,
                createdAt: Date.now()
            };

            rooms.set(roomId, room);
            socket.join(roomId);

            console.log(`Room created: ${roomId} by ${socket.id}`);

            callback({ success: true, roomId, room: serializeRoom(room) });
        });

        // Join an existing room
        socket.on("join-room", (data: { roomId: string; playerName: string; carId: string }, callback) => {
            const room = rooms.get(data.roomId.toUpperCase());

            if (!room) {
                callback({ success: false, error: 'Room not found' });
                return;
            }

            if (room.state !== 'waiting') {
                callback({ success: false, error: 'Race already in progress' });
                return;
            }

            if (room.players.size >= 4) {
                callback({ success: false, error: 'Room is full (max 4 players)' });
                return;
            }

            const player: Player = {
                id: socket.id,
                name: data.playerName || 'Player',
                carId: data.carId || 'c1',
                progress: 0,
                wpm: 0,
                finished: false
            };

            room.players.set(socket.id, player);
            socket.join(data.roomId.toUpperCase());

            // Notify all players in room
            io.to(room.id).emit('player-joined', {
                player,
                room: serializeRoom(room)
            });

            console.log(`Player ${socket.id} joined room ${room.id}`);

            callback({ success: true, room: serializeRoom(room) });
        });

        // Get room info (for join page preview)
        socket.on("get-room", (roomId: string, callback) => {
            const room = rooms.get(roomId.toUpperCase());

            if (!room) {
                callback({ success: false, error: 'Room not found' });
                return;
            }

            callback({
                success: true,
                room: {
                    id: room.id,
                    playerCount: room.players.size,
                    state: room.state,
                    settings: room.settings
                }
            });
        });

        // Start race (host only)
        socket.on("start-race", (roomId: string, callback) => {
            const room = rooms.get(roomId);

            if (!room) {
                callback({ success: false, error: 'Room not found' });
                return;
            }

            if (room.hostId !== socket.id) {
                callback({ success: false, error: 'Only host can start the race' });
                return;
            }

            room.state = 'countdown';

            // Notify all players
            io.to(roomId).emit('race-countdown', {
                room: serializeRoom(room)
            });

            // After 3 seconds, start the race
            setTimeout(() => {
                room.state = 'racing';
                room.startTime = Date.now();

                io.to(roomId).emit('race-start', {
                    text: room.text,
                    startTime: room.startTime,
                    room: serializeRoom(room)
                });
            }, 3500);

            callback({ success: true });
        });

        // Update progress during race
        socket.on("race-progress", (data: { roomId: string; progress: number; wpm: number }) => {
            const room = rooms.get(data.roomId);

            if (!room || room.state !== 'racing') return;

            const player = room.players.get(socket.id);
            if (!player) return;

            player.progress = data.progress;
            player.wpm = data.wpm;

            // Check if finished
            if (data.progress >= 100 && !player.finished) {
                player.finished = true;
                player.finishTime = Date.now() - (room.startTime || 0);
            }

            // Broadcast to all players in room
            socket.to(data.roomId).emit('player-progress', {
                playerId: socket.id,
                progress: data.progress,
                wpm: data.wpm,
                finished: player.finished,
                finishTime: player.finishTime
            });

            // Check if all players finished
            const allFinished = Array.from(room.players.values()).every(p => p.finished);
            if (allFinished) {
                room.state = 'finished';
                io.to(data.roomId).emit('race-finished', {
                    room: serializeRoom(room)
                });
            }
        });

        // Leave room
        socket.on("leave-room", (roomId: string) => {
            handleLeaveRoom(socket, roomId);
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);

            // Find and leave any rooms this socket was in
            for (const [roomId, room] of rooms) {
                if (room.players.has(socket.id)) {
                    handleLeaveRoom(socket, roomId);
                }
            }
        });

        function handleLeaveRoom(socket: Socket, roomId: string) {
            const room = rooms.get(roomId);
            if (!room) return;

            room.players.delete(socket.id);
            socket.leave(roomId);

            // If room is empty, delete it
            if (room.players.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted (empty)`);
                return;
            }

            // If host left, assign new host
            if (room.hostId === socket.id) {
                const newHost = room.players.keys().next().value;
                if (newHost) {
                    room.hostId = newHost;
                }
            }

            // Notify remaining players
            io.to(roomId).emit('player-left', {
                playerId: socket.id,
                newHostId: room.hostId,
                room: serializeRoom(room)
            });
        }
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});

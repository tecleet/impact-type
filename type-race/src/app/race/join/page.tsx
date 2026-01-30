"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import NeonButton from '@/components/NeonButton';
import Link from 'next/link';

interface RoomInfo {
    id: string;
    playerCount: number;
    state: 'waiting' | 'countdown' | 'racing' | 'finished';
    settings: {
        wordCount: number;
        mode: string;
    };
}

function JoinRaceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const socket = useSocket();
    const { stats } = usePlayerStats();

    const [roomId, setRoomId] = useState(searchParams.get('room') || '');
    const [playerName, setPlayerName] = useState('');
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Auto-lookup room if ID is in URL
    useEffect(() => {
        const roomFromUrl = searchParams.get('room');
        if (roomFromUrl) {
            setRoomId(roomFromUrl.toUpperCase());
            lookupRoom(roomFromUrl);
        }
    }, [searchParams, socket]);

    const lookupRoom = async (id: string) => {
        if (!socket || !id || id.length < 4) {
            setRoomInfo(null);
            return;
        }

        setIsLoading(true);
        setError('');

        socket.emit('get-room', id.toUpperCase(), (response: { success: boolean; error?: string; room?: RoomInfo }) => {
            setIsLoading(false);
            if (response.success && response.room) {
                setRoomInfo(response.room);
            } else {
                setRoomInfo(null);
                if (id.length >= 6) {
                    setError(response.error || 'Room not found');
                }
            }
        });
    };

    const handleRoomIdChange = (value: string) => {
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setRoomId(cleaned);
        setError('');

        if (cleaned.length >= 6) {
            lookupRoom(cleaned);
        } else {
            setRoomInfo(null);
        }
    };

    const handleJoin = () => {
        if (!socket || !roomId || !roomInfo) return;

        setIsJoining(true);
        setError('');

        socket.emit('join-room', {
            roomId: roomId.toUpperCase(),
            playerName: playerName || 'Player',
            carId: stats.selectedCarId
        }, (response: { success: boolean; error?: string; room?: unknown }) => {
            setIsJoining(false);
            if (response.success) {
                router.push(`/race/${roomId.toUpperCase()}`);
            } else {
                setError(response.error || 'Failed to join room');
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)]">
            {/* Logo */}
            <Link href="/" className="absolute top-8 left-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-white hover:opacity-80 transition-opacity">
                TECLEET
            </Link>

            <div className="max-w-md w-full p-8 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-green)] box-glow">
                <h1 className="text-3xl font-bold mb-8 text-[var(--neon-green)] text-center text-glow">
                    JOIN RACE
                </h1>

                <div className="space-y-6">
                    {/* Room ID Input */}
                    <div>
                        <label className="block text-[var(--neon-green)] mb-2 font-mono">ROOM CODE</label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => handleRoomIdChange(e.target.value)}
                            placeholder="XXXXXX"
                            className="w-full bg-black/50 border border-gray-700 rounded p-4 text-white font-mono text-center text-2xl tracking-[0.5em] focus:border-[var(--neon-green)] focus:outline-none uppercase"
                            maxLength={6}
                        />
                        {isLoading && (
                            <div className="text-gray-500 text-sm mt-2 text-center">Looking up room...</div>
                        )}
                    </div>

                    {/* Room Info Preview */}
                    {roomInfo && (
                        <div className="p-4 border border-gray-700 rounded bg-black/30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Room</span>
                                <span className="text-white font-bold">{roomInfo.id}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Players</span>
                                <span className="text-white">{roomInfo.playerCount}/4</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Status</span>
                                <span className={`font-bold ${roomInfo.state === 'waiting' ? 'text-[var(--neon-green)]' : 'text-yellow-500'}`}>
                                    {roomInfo.state === 'waiting' ? 'OPEN' : roomInfo.state.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Words</span>
                                <span className="text-white">{roomInfo.settings.wordCount}</span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-500 rounded text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Player Name (Optional) */}
                    <div>
                        <label className="block text-gray-400 mb-2 font-mono text-sm">YOUR NAME (OPTIONAL)</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Anonymous Racer"
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-gray-500 focus:outline-none"
                            maxLength={20}
                        />
                    </div>

                    {/* Join Button */}
                    <NeonButton
                        className="w-full mt-4"
                        variant="green"
                        onClick={handleJoin}
                        disabled={!roomInfo || roomInfo.state !== 'waiting' || isJoining}
                    >
                        {isJoining ? 'JOINING...' : roomInfo?.state !== 'waiting' ? 'RACE IN PROGRESS' : 'JOIN RACE'}
                    </NeonButton>

                    {/* Or Create */}
                    <div className="text-center text-gray-500 text-sm">
                        or
                    </div>

                    <Link href="/race/create" className="block">
                        <NeonButton variant="blue" className="w-full">
                            CREATE NEW RACE
                        </NeonButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function JoinRacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-[var(--neon-green)] font-mono animate-pulse">LOADING...</div>
            </div>
        }>
            <JoinRaceContent />
        </Suspense>
    );
}

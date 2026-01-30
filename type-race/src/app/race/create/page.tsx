"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import NeonButton from '@/components/NeonButton';
import { WordCount, generateQuote } from '@/lib/quotes';
import Link from 'next/link';
import { Copy, Check, Users, User } from 'lucide-react';

export default function CreateRacePage() {
    const router = useRouter();
    const socket = useSocket();
    const { stats } = usePlayerStats();

    const [wordCount, setWordCount] = useState<WordCount>(25);
    const [includeCapitals, setIncludeCapitals] = useState(true);
    const [useAI, setUseAI] = useState(false);
    const [mode, setMode] = useState<'multiplayer' | 'solo'>('multiplayer');
    const [playerName, setPlayerName] = useState('');

    // Waiting room state
    const [isWaiting, setIsWaiting] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [players, setPlayers] = useState<Array<{ id: string; name: string; carId: string }>>([]);
    const [copied, setCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Listen for room events
    useEffect(() => {
        if (!socket) return;

        socket.on('player-joined', (data: { player: { id: string; name: string; carId: string }; room: { players: Array<{ id: string; name: string; carId: string }> } }) => {
            setPlayers(data.room.players);
        });

        socket.on('player-left', (data: { room: { players: Array<{ id: string; name: string; carId: string }> } }) => {
            setPlayers(data.room.players);
        });

        socket.on('race-countdown', () => {
            // Navigate to game room
            router.push(`/race/${roomId}`);
        });

        return () => {
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('race-countdown');
        };
    }, [socket, roomId, router]);

    const handleCreate = () => {
        if (mode === 'solo') {
            // Solo mode - go directly to race with bot opponents
            const params = new URLSearchParams({
                words: wordCount.toString(),
                caps: includeCapitals ? 'true' : 'false',
                ai: useAI ? 'true' : 'false',
                mode: 'solo'
            });
            const soloRoomId = `solo-${Date.now()}`;
            router.push(`/race/${soloRoomId}?${params.toString()}`);
            return;
        }

        // Multiplayer mode - create room on server
        if (!socket) {
            alert('Connecting to server... Please try again.');
            return;
        }

        setIsCreating(true);

        const text = generateQuote({ wordCount, includeCapitals, useAI }).text;

        socket.emit('create-room', {
            playerName: playerName || 'Host',
            carId: stats.selectedCarId,
            settings: {
                wordCount,
                includeCapitals,
                useAI,
                mode
            },
            text
        }, (response: { success: boolean; roomId?: string; room?: { players: Array<{ id: string; name: string; carId: string }> } }) => {
            setIsCreating(false);
            if (response.success && response.roomId && response.room) {
                setRoomId(response.roomId);
                setPlayers(response.room.players);
                setIsWaiting(true);
            } else {
                alert('Failed to create room. Please try again.');
            }
        });
    };

    const handleStartRace = () => {
        if (!socket || !roomId) return;

        socket.emit('start-race', roomId, (response: { success: boolean; error?: string }) => {
            if (!response.success) {
                alert(response.error || 'Failed to start race');
            }
            // Race will start via race-countdown event
        });
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/race/join?room=${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Waiting Room UI
    if (isWaiting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)]">
                <Link href="/" className="absolute top-8 left-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-white hover:opacity-80 transition-opacity">
                    TECLEET
                </Link>

                <div className="max-w-md w-full p-8 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-green)] box-glow">
                    <h1 className="text-2xl font-bold mb-2 text-[var(--neon-green)] text-center">
                        WAITING FOR PLAYERS
                    </h1>

                    {/* Room Code Display */}
                    <div className="text-center mb-6">
                        <div className="text-gray-400 text-sm mb-2">ROOM CODE</div>
                        <div className="text-4xl font-black text-white tracking-[0.3em] mb-4">
                            {roomId}
                        </div>

                        {/* Copy Invite Link */}
                        <button
                            onClick={copyInviteLink}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 border border-gray-700 rounded hover:border-[var(--neon-green)] transition-colors text-sm"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-[var(--neon-green)]" />
                                    <span className="text-[var(--neon-green)]">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400">Copy Invite Link</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Players List */}
                    <div className="mb-6">
                        <div className="text-gray-400 text-sm mb-3">PLAYERS ({players.length}/4)</div>
                        <div className="space-y-2">
                            {players.map((player, idx) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-3 p-3 bg-black/30 rounded border border-gray-800"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--neon-green)] flex items-center justify-center text-black font-bold">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">{player.name}</div>
                                        {idx === 0 && <div className="text-xs text-[var(--neon-green)]">HOST</div>}
                                    </div>
                                </div>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: 4 - players.length }).map((_, idx) => (
                                <div
                                    key={`empty-${idx}`}
                                    className="flex items-center gap-3 p-3 bg-black/10 rounded border border-gray-800 border-dashed"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-600 font-bold">
                                        ?
                                    </div>
                                    <div className="text-gray-600">Waiting...</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settings Summary */}
                    <div className="text-center text-gray-500 text-sm mb-6">
                        {wordCount} words • {includeCapitals ? 'Capitals' : 'No capitals'} • {useAI ? 'AI Text' : 'Classic'}
                    </div>

                    {/* Start Button */}
                    <NeonButton
                        className="w-full"
                        variant="green"
                        onClick={handleStartRace}
                    >
                        START RACE ({players.length} player{players.length !== 1 ? 's' : ''})
                    </NeonButton>

                    <button
                        onClick={() => {
                            socket?.emit('leave-room', roomId);
                            setIsWaiting(false);
                            setRoomId('');
                            setPlayers([]);
                        }}
                        className="w-full mt-4 text-gray-500 hover:text-red-400 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Create Room UI
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)]">
            {/* Logo */}
            <Link href="/" className="absolute top-8 left-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-white hover:opacity-80 transition-opacity">
                TECLEET
            </Link>

            <div className="max-w-md w-full p-8 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-green)] box-glow">
                <h1 className="text-3xl font-bold mb-8 text-[var(--neon-green)] text-center text-glow">
                    CREATE RACE
                </h1>

                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-[var(--neon-green)] mb-2 font-mono">MODE</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('multiplayer')}
                                className={`flex-1 py-3 border rounded transition-all font-bold flex items-center justify-center gap-2 ${mode === 'multiplayer'
                                    ? 'bg-[var(--neon-green)] text-black border-[var(--neon-green)]'
                                    : 'border-gray-700 text-gray-500 hover:border-gray-500'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                Multiplayer
                            </button>
                            <button
                                onClick={() => setMode('solo')}
                                className={`flex-1 py-3 border rounded transition-all font-bold flex items-center justify-center gap-2 ${mode === 'solo'
                                    ? 'bg-[var(--neon-green)] text-black border-[var(--neon-green)]'
                                    : 'border-gray-700 text-gray-500 hover:border-gray-500'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                Solo
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                            {mode === 'multiplayer' ? 'Race with friends via invite link' : 'Practice alone with AI opponents'}
                        </div>
                    </div>

                    {/* Player Name (for multiplayer) */}
                    {mode === 'multiplayer' && (
                        <div>
                            <label className="block text-gray-400 mb-2 font-mono text-sm">YOUR NAME</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Host"
                                className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[var(--neon-green)] focus:outline-none"
                                maxLength={20}
                            />
                        </div>
                    )}

                    {/* Word Count Selection */}
                    <div>
                        <label className="block text-[var(--neon-green)] mb-2 font-mono">WORD COUNT</label>
                        <div className="flex gap-2">
                            {([10, 25, 50] as WordCount[]).map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setWordCount(count)}
                                    className={`flex-1 py-3 border rounded transition-all font-bold text-lg ${wordCount === count
                                        ? 'bg-[var(--neon-green)] text-black border-[var(--neon-green)]'
                                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                            {wordCount === 10 && "Quick Sprint • ~15 seconds"}
                            {wordCount === 25 && "Standard Race • ~30 seconds"}
                            {wordCount === 50 && "Marathon • ~1 minute"}
                        </div>
                    </div>

                    {/* Capitalization Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
                        <div>
                            <label className="text-[var(--neon-green)] font-mono">CAPITALS</label>
                            <div className="text-xs text-gray-500">Include uppercase letters</div>
                        </div>
                        <button
                            onClick={() => setIncludeCapitals(!includeCapitals)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${includeCapitals ? 'bg-[var(--neon-green)]' : 'bg-gray-800'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeCapitals ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {/* AI Generated Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
                        <div>
                            <label className="text-[var(--neon-green)] font-mono">AI TEXT</label>
                            <div className="text-xs text-gray-500">Use AI-generated phrases</div>
                        </div>
                        <button
                            onClick={() => setUseAI(!useAI)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${useAI ? 'bg-[var(--neon-green)]' : 'bg-gray-800'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useAI ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    <NeonButton
                        className="w-full mt-8"
                        variant="green"
                        onClick={handleCreate}
                        disabled={isCreating}
                    >
                        {isCreating ? 'CREATING...' : mode === 'solo' ? 'START SOLO' : 'CREATE ROOM'}
                    </NeonButton>
                </div>
            </div>
        </div>
    );
}

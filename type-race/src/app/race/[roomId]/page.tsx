"use client";

import { useEffect, useState, use, useMemo, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import TypingArea from "@/components/TypingArea";
import { useSocket } from "@/hooks/useSocket";
import NeonButton from "@/components/NeonButton";
import Link from "next/link";
import { generateQuote, WordCount } from "@/lib/quotes";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { getCarById } from "@/lib/cars";
import Countdown from '@/components/Countdown';
import { motion } from 'framer-motion';
import Scene3D from "@/components/game/3d/Scene3D";
import { Copy, Check } from 'lucide-react';

interface Racer {
    id: string;
    name: string;
    progress: number;
    carId: string;
    wpm: number;
    finished: boolean;
    finishTime?: number;
}

type RoomState = 'waiting' | 'countdown' | 'racing' | 'finished';

export default function GameRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = use(params);
    const roomId = resolvedParams.roomId;
    const searchParams = useSearchParams();
    const socket = useSocket();
    const { stats, updateMaxWpm } = usePlayerStats();

    // Determine mode from URL or room ID prefix
    const isSoloMode = roomId.startsWith('solo-') || searchParams.get('mode') === 'solo';

    // Get settings from URL params
    const wordCount = (parseInt(searchParams.get('words') || '25') || 25) as WordCount;
    const includeCapitals = searchParams.get('caps') !== 'false';
    const useAI = searchParams.get('ai') === 'true';

    const [text, setText] = useState("");
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finishTime, setFinishTime] = useState<number | null>(null);

    // Room states
    const [roomState, setRoomState] = useState<RoomState>(isSoloMode ? 'countdown' : 'waiting');
    const [showCountdown, setShowCountdown] = useState(isSoloMode);
    const [raceStarted, setRaceStarted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sound toggle
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Racers (real players or bots)
    const [opponents, setOpponents] = useState<Racer[]>([]);

    // Initialize based on mode
    useEffect(() => {
        if (isSoloMode) {
            // Solo mode: generate text and add bots
            const quote = generateQuote({ wordCount, includeCapitals, useAI });
            setText(quote.text);
            setOpponents([
                { id: "bot-1", name: "GlitchRunner", progress: 0, carId: 'c6', wpm: 0, finished: false },
                { id: "bot-2", name: "CyberSamurai", progress: 0, carId: 'c19', wpm: 0, finished: false },
            ]);
        }
    }, [isSoloMode, wordCount, includeCapitals, useAI]);

    // Socket event handlers for multiplayer
    useEffect(() => {
        if (isSoloMode || !socket) return;

        // Join room if we haven't already (coming from direct URL)
        socket.emit('get-room', roomId, (response: { success: boolean; room?: { state: RoomState; playerCount: number } }) => {
            if (response.success && response.room) {
                setRoomState(response.room.state);
            }
        });

        // Player joined
        socket.on('player-joined', (data: { room: { players: Racer[]; hostId: string } }) => {
            setOpponents(data.room.players.filter((p: Racer) => p.id !== socket.id));
            setIsHost(data.room.hostId === socket.id);
        });

        // Player left
        socket.on('player-left', (data: { room: { players: Racer[]; hostId: string } }) => {
            setOpponents(data.room.players.filter((p: Racer) => p.id !== socket.id));
            setIsHost(data.room.hostId === socket.id);
        });

        // Race countdown started
        socket.on('race-countdown', () => {
            setRoomState('countdown');
            setShowCountdown(true);
        });

        // Race started
        socket.on('race-start', (data: { text: string; startTime: number }) => {
            setText(data.text);
            setStartTime(data.startTime);
            setRoomState('racing');
        });

        // Player progress update
        socket.on('player-progress', (data: { playerId: string; progress: number; wpm: number; finished: boolean; finishTime?: number }) => {
            setOpponents(prev => prev.map(p =>
                p.id === data.playerId
                    ? { ...p, progress: data.progress, wpm: data.wpm, finished: data.finished, finishTime: data.finishTime }
                    : p
            ));
        });

        // Race finished
        socket.on('race-finished', () => {
            setRoomState('finished');
        });

        return () => {
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('race-countdown');
            socket.off('race-start');
            socket.off('player-progress');
            socket.off('race-finished');
        };
    }, [socket, roomId, isSoloMode]);

    const handleCountdownComplete = useCallback(() => {
        setShowCountdown(false);
        setRaceStarted(true);
        const start = Date.now();
        setStartTime(start);
        setRoomState('racing');
    }, []);

    // Timer and bot simulation
    useEffect(() => {
        if (!raceStarted || !startTime) return;

        // Timer
        const timerInt = setInterval(() => {
            if (!isFinished) {
                setElapsed((Date.now() - startTime) / 1000);
            }
        }, 100);

        // Bot simulation (solo mode only)
        let botInterval: NodeJS.Timeout | null = null;
        if (isSoloMode) {
            botInterval = setInterval(() => {
                setOpponents(prev => prev.map(op => {
                    if (op.finished) return op;

                    // Smoother bot progress based on simulated WPM
                    const botWpm = 30 + Math.random() * 30;
                    const progressPerSecond = botWpm / 60 * 5; // Approximate characters per second
                    const progressIncrement = progressPerSecond * 0.2; // 200ms interval
                    const newProgress = Math.min(100, op.progress + progressIncrement + Math.random() * 0.3);

                    if (newProgress >= 100 && !op.finished) {
                        return {
                            ...op,
                            progress: 100,
                            wpm: Math.round(botWpm),
                            finished: true,
                            finishTime: Date.now() - startTime
                        };
                    }

                    return {
                        ...op,
                        progress: newProgress,
                        wpm: Math.round(botWpm)
                    };
                }));
            }, 200);
        }

        return () => {
            clearInterval(timerInt);
            if (botInterval) clearInterval(botInterval);
        };
    }, [raceStarted, startTime, isFinished, isSoloMode]);

    const handleProgress = (p: number, currentWpm: number) => {
        setProgress(p);
        setWpm(currentWpm);

        // Send to server in multiplayer mode
        if (!isSoloMode && socket) {
            socket.emit("race-progress", { roomId, progress: p, wpm: currentWpm });
        }
    };

    const handleComplete = (finalWpm: number) => {
        setIsFinished(true);
        setFinishTime(elapsed);
        updateMaxWpm(finalWpm);
    };

    // Calculate rankings
    const rankings = useMemo(() => {
        const allRacers: Racer[] = [
            {
                id: 'player',
                name: 'YOU',
                progress,
                carId: stats.selectedCarId,
                wpm,
                finished: isFinished,
                finishTime: finishTime ? finishTime * 1000 : undefined
            },
            ...opponents
        ];

        return allRacers.sort((a, b) => {
            if (a.finished && b.finished) {
                return (a.finishTime || 0) - (b.finishTime || 0);
            }
            if (a.finished) return -1;
            if (b.finished) return 1;
            return b.progress - a.progress;
        });
    }, [progress, wpm, isFinished, finishTime, opponents, stats.selectedCarId]);

    const copyInviteLink = () => {
        const link = `${window.location.origin}/race/join?room=${roomId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Loading state
    if (!text && raceStarted) {
        return <div className="text-[var(--neon-green)] p-10 text-center">Loading race...</div>;
    }

    const playerCar = getCarById(stats.selectedCarId);

    // Waiting Room (Multiplayer only - when race hasn't started)
    if (!isSoloMode && roomState === 'waiting' && !showCountdown && !raceStarted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[var(--background)]">
                <div className="max-w-md w-full p-8 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-green)] box-glow">
                    <h1 className="text-2xl font-bold mb-4 text-[var(--neon-green)] text-center">
                        WAITING FOR HOST
                    </h1>

                    <div className="text-center mb-6">
                        <div className="text-gray-400 text-sm mb-2">ROOM CODE</div>
                        <div className="text-4xl font-black text-white tracking-[0.3em] mb-4">
                            {roomId}
                        </div>

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

                    <div className="text-center text-gray-500">
                        <div className="animate-pulse">Waiting for host to start the race...</div>
                    </div>

                    <Link href="/" className="block mt-6">
                        <NeonButton variant="blue" className="w-full">
                            LEAVE ROOM
                        </NeonButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-mono overflow-hidden">
            {/* Header */}
            <header className="flex-none flex justify-between items-center px-6 py-3 border-b border-[var(--glass-border)] bg-black/40 backdrop-blur-sm z-20">
                {/* Logo - links to home */}
                <Link href="/" className="text-xl font-black text-[var(--neon-green)] hover:text-white transition-colors tracking-widest">
                    TECLEET
                </Link>

                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-sm font-bold text-gray-400">
                            {isSoloMode ? 'SOLO PRACTICE' : <>ROOM: <span className="text-white font-mono">{roomId}</span></>}
                        </h1>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center w-24">
                        <div className="text-[10px] text-gray-500 tracking-wider">TIME</div>
                        <div className="text-2xl font-black text-[var(--neon-green)] font-mono tabular-nums leading-none">
                            {raceStarted ? elapsed.toFixed(1) : "0.0"}s
                        </div>
                    </div>

                    <div className="text-right w-24">
                        <div className="text-[10px] text-gray-500 tracking-wider">STATUS</div>
                        <div className={`text-xl font-bold ${isFinished ? 'text-white' : 'text-[var(--neon-green)]'}`}>
                            {!raceStarted ? "READY" : isFinished ? "DONE" : "RACING"}
                        </div>
                    </div>

                    {/* Sound Toggle */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded border transition-all duration-200 text-xs ${soundEnabled ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-[rgba(0,255,0,0.1)]' : 'border-gray-800 text-gray-600 bg-gray-900'}`}
                    >
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                </div>
            </header>

            {/* Countdown Overlay */}
            {showCountdown && (
                <div className="absolute inset-0 z-50">
                    <Countdown seconds={3} onComplete={handleCountdownComplete} />
                </div>
            )}

            {/* Main Game Flex Container */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* 3D Scene Area */}
                <div className="flex-1 relative min-h-0 bg-gray-900/20">
                    <Scene3D
                        myCarId={playerCar.id}
                        wpm={raceStarted ? wpm : 0}
                        progress={progress}
                        isRacing={raceStarted}
                        opponents={opponents}
                    />
                </div>

                {/* HUD: Typing Area */}
                <div className="flex-none bg-black/80 border-t border-[var(--glass-border)] p-6 pb-8 backdrop-blur-md z-10">
                    <div className="max-w-4xl mx-auto">
                        {text ? (
                            <TypingArea
                                text={text}
                                onProgress={handleProgress}
                                onComplete={handleComplete}
                                engineType={playerCar.engineType}
                                soundEnabled={soundEnabled}
                            />
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Waiting for race to start...
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Overlay */}
                {isFinished && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-lg p-8 border border-[var(--neon-green)] bg-black box-glow rounded-xl text-center"
                        >
                            <h2 className="text-5xl font-black text-[var(--neon-green)] mb-2 text-glow tracking-tighter">FINISH</h2>
                            <div className="my-8 space-y-2">
                                <p className="text-2xl text-gray-400">
                                    RANK <span className="text-white font-black text-3xl">#{rankings.findIndex(r => r.id === 'player') + 1}</span>
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-[var(--neon-dim)] rounded border border-[var(--neon-green)]">
                                        <div className="text-xs text-[var(--neon-green)]">SPEED</div>
                                        <div className="text-3xl font-bold text-white">{wpm} WPM</div>
                                    </div>
                                    <div className="p-4 bg-[var(--neon-dim)] rounded border border-[var(--neon-green)]">
                                        <div className="text-xs text-[var(--neon-green)]">TIME</div>
                                        <div className="text-3xl font-bold text-white">{finishTime?.toFixed(2)}s</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <Link href="/race/create" className="flex-1">
                                    <NeonButton variant="blue" className="w-full">RACE AGAIN</NeonButton>
                                </Link>
                                <Link href="/garage" className="flex-1">
                                    <NeonButton variant="green" className="w-full">GARAGE</NeonButton>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

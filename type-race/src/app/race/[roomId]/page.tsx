"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import TypingArea from "@/components/TypingArea";
import { useSocket } from "@/hooks/useSocket";
import NeonButton from "@/components/NeonButton";
import Link from "next/link";
import { generateQuote, WordCount } from "@/lib/quotes";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { getCarById } from "@/lib/cars";
import NeonCar from '@/components/NeonCar';
import Countdown from '@/components/Countdown';
import { motion } from 'framer-motion';
import Scene3D from "@/components/game/3d/Scene3D";

interface Racer {
    id: string;
    name: string;
    progress: number;
    carId: string;
    wpm: number;
    finished: boolean;
    finishTime?: number;
}

export default function GameRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = use(params);
    const roomId = resolvedParams.roomId;
    const searchParams = useSearchParams();
    const socket = useSocket();
    const { stats, updateMaxWpm } = usePlayerStats();

    // Get settings from URL params
    const wordCount = (parseInt(searchParams.get('words') || '25') || 25) as WordCount;
    const includeCapitals = searchParams.get('caps') !== 'false';
    const useAI = searchParams.get('ai') === 'true';

    const [text, setText] = useState("");
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finishTime, setFinishTime] = useState<number | null>(null);

    // Race states
    const [showCountdown, setShowCountdown] = useState(true);
    const [raceStarted, setRaceStarted] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Sound toggle
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Racers (including bots)
    const [opponents, setOpponents] = useState<Racer[]>([
        { id: "bot-1", name: "GlitchRunner", progress: 0, carId: 'c6', wpm: 0, finished: false },
        { id: "bot-2", name: "CyberSamurai", progress: 0, carId: 'c19', wpm: 0, finished: false },
    ]);

    useEffect(() => {
        const quote = generateQuote({ wordCount, includeCapitals, useAI });
        setText(quote.text);
    }, [wordCount, includeCapitals, useAI]);

    const handleCountdownComplete = () => {
        setShowCountdown(false);
        setRaceStarted(true);
        const start = Date.now();
        setStartTime(start);
    };

    useEffect(() => {
        if (!raceStarted || !startTime) return;

        // Timer
        const timerInt = setInterval(() => {
            if (!isFinished) {
                setElapsed((Date.now() - startTime) / 1000);
            }
        }, 100);

        // Bot simulation
        const interval = setInterval(() => {
            setOpponents(prev => prev.map(op => {
                if (op.finished) return op;

                const newProgress = Math.min(100, op.progress + Math.random() * 2 + 0.5);
                const newWpm = Math.round(30 + Math.random() * 40); // Random WPM for bots

                if (newProgress >= 100 && !op.finished) {
                    return {
                        ...op,
                        progress: 100,
                        wpm: newWpm,
                        finished: true,
                        finishTime: Date.now() - startTime
                    };
                }

                return {
                    ...op,
                    progress: newProgress,
                    wpm: newWpm
                };
            }));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInt);
        };
    }, [raceStarted, startTime, isFinished]);

    const handleProgress = (p: number, currentWpm: number) => {
        setProgress(p);
        setWpm(currentWpm);

        if (socket) {
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

        // Sort by: finished first (by time), then by progress
        return allRacers.sort((a, b) => {
            if (a.finished && b.finished) {
                return (a.finishTime || 0) - (b.finishTime || 0);
            }
            if (a.finished) return -1;
            if (b.finished) return 1;
            return b.progress - a.progress;
        });
    }, [progress, wpm, isFinished, finishTime, opponents, stats.selectedCarId]);

    if (!text) return <div className="text-[var(--neon-pink)] p-10">Loading Grid...</div>;

    const playerCar = getCarById(stats.selectedCarId);

    // Calculate car position - clamp between 0 and track width minus car width
    const getCarPosition = (prog: number) => {
        // Car should start at left edge (0%) and end at right edge (100%)
        // But we need to account for car width so it doesn't overflow
        const clampedProgress = Math.max(0, Math.min(100, prog));
        return `${clampedProgress}%`;
    };

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
                            RACE ID: <span className="text-white font-mono">{roomId}</span>
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

            {/* Countdown Overlay - Absolute Center */}
            {showCountdown && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Countdown seconds={3} onComplete={handleCountdownComplete} />
                </div>
            )}

            {/* Main Game Flex Container */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* 3D Scene Area - Takes available space */}
                <div className="flex-1 relative min-h-0 bg-gray-900/20">
                    <Scene3D
                        myCarId={playerCar.id}
                        wpm={raceStarted ? wpm : 0}
                        progress={progress}
                        opponents={opponents}
                    />
                </div>

                {/* HUD: Typing Area - Fixed bottom section */}
                <div className="flex-none bg-black/80 border-t border-[var(--glass-border)] p-6 pb-8 backdrop-blur-md z-10">
                    <div className="max-w-4xl mx-auto">
                        <TypingArea
                            text={text}
                            onProgress={handleProgress}
                            onComplete={handleComplete}
                            engineType={playerCar.engineType}
                            soundEnabled={soundEnabled}
                        />
                    </div>
                </div>

                {/* Results Overlay (Centered) */}
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

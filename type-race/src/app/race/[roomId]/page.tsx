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
        <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-mono">
            {/* Countdown Overlay */}
            {showCountdown && <Countdown seconds={3} onComplete={handleCountdownComplete} />}

            {/* Header */}
            <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                {/* Logo - links to home */}
                <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] hover:opacity-80 transition-opacity">
                    TECLEET
                </Link>

                <div>
                    <h1 className="text-xl font-bold text-[var(--neon-pink)]">
                        RACE: <span className="text-white">{roomId}</span>
                    </h1>
                    <div className="text-xs text-gray-500 mt-1">
                        {wordCount} WORDS {includeCapitals ? "• CAPS" : "• NO CAPS"} {useAI && "• AI"}
                    </div>
                </div>

                {/* Timer Display */}
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">TIME</div>
                    <div className="text-4xl font-black text-[var(--neon-yellow)] font-mono tabular-nums">
                        {raceStarted ? elapsed.toFixed(1) : "0.0"}s
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">STATUS</div>
                    <div className={`text-xl font-bold ${isFinished ? 'text-[var(--neon-green)]' : 'text-[var(--neon-blue)]'}`}>
                        {!raceStarted ? "READY" : isFinished ? "FINISHED" : "RACING"}
                    </div>
                </div>

                {/* Sound Toggle */}
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${soundEnabled ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-[rgba(0,255,0,0.1)]' : 'border-gray-600 text-gray-500 bg-gray-900'}`}
                >
                    {soundEnabled ? '🔊 ON' : '🔇 OFF'}
                </button>
            </header>

            {/* Main 3D Scene Area */}
            <div className="lg:col-span-3 relative">
                <Scene3D
                    myCarId={playerCar.id}
                    wpm={raceStarted ? wpm : 0}
                    progress={progress}
                    opponents={opponents}
                />

                {/* HUD: Typing Area Overlay */}
                <div className="absolute inset-x-0 bottom-8 max-w-4xl mx-auto px-4">
                    <TypingArea
                        text={text}
                        onProgress={handleProgress}
                        onComplete={handleComplete}
                        engineType={playerCar.engineType}
                        soundEnabled={soundEnabled}
                    />
                </div>
            </div>

            {/* Sidebar Stats (Hidden for now, can be moved below) */}
            {isFinished && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-3 mt-8 p-6 border border-[var(--neon-green)] bg-[rgba(0,255,0,0.1)] rounded-xl text-center"
                >
                    <h2 className="text-4xl font-black text-[var(--neon-green)] mb-2 text-glow">RACE COMPLETE</h2>
                    <p className="text-2xl mb-2">
                        Your Rank: <span className="text-[var(--neon-yellow)] font-black">#{rankings.findIndex(r => r.id === 'player') + 1}</span>
                    </p>
                    <p className="text-xl mb-8">
                        Final: <span className="text-white font-bold">{wpm} WPM</span> in <span className="text-white">{finishTime?.toFixed(2)}s</span>
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link href="/race/create">
                            <NeonButton variant="blue">Race Again</NeonButton>
                        </Link>
                        <Link href="/garage">
                            <NeonButton variant="green">Go to Garage</NeonButton>
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState, use } from "react";
import TypingArea from "@/components/TypingArea";
import ProgressBar from "@/components/ProgressBar";
import { useSocket } from "@/hooks/useSocket";
import NeonButton from "@/components/NeonButton";
import Link from "next/link";

// Mock Text
const RACE_TEXT = "The quick brown fox jumps over the lazy dog. Neon lights flash in the cyberpunk city as data streams flow through the grid. Speed is everything in this digital realm.";

export default function GameRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = use(params);
    const roomId = resolvedParams.roomId;
    const socket = useSocket();

    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Mock Opponents state
    const [opponents, setOpponents] = useState([
        { id: "bot-1", name: "GlitchRunner", progress: 0 },
        { id: "bot-2", name: "CyberSamurai", progress: 0 },
    ]);

    useEffect(() => {
        if (!socket) return;

        // Join room
        socket.emit("join-room", roomId);

        // Listen for updates (mock)
        socket.on("user-joined", (userId) => {
            console.log("User joined:", userId);
        });

        // Simulate bot progress for demo
        const interval = setInterval(() => {
            setOpponents(prev => prev.map(op => ({
                ...op,
                progress: Math.min(100, op.progress + Math.random() * 2)
            })));
        }, 1000);

        return () => clearInterval(interval);

    }, [socket, roomId]);

    const handleProgress = (p: number, currentWpm: number) => {
        setProgress(p);
        setWpm(currentWpm);
        // Emit progress to server
        if (socket) {
            socket.emit("race-progress", { roomId, progress: p, wpm: currentWpm });
        }
    };

    const handleComplete = (finalWpm: number) => {
        setIsFinished(true);
        // Emit finish
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-mono">
            <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-[var(--neon-pink)]">
                    RACE: <span className="text-white">{roomId}</span>
                </h1>
                <div className="text-[var(--neon-blue)]">
                    STATUS: {isFinished ? "FINISHED" : "RACING"}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Area */}
                <div className="lg:col-span-2 space-y-8">
                    <TypingArea
                        text={RACE_TEXT}
                        onProgress={handleProgress}
                        onComplete={handleComplete}
                    />

                    {isFinished && (
                        <div className="mt-8 p-6 border border-[var(--neon-green)] bg-[rgba(0,255,0,0.1)] rounded-xl text-center">
                            <h2 className="text-3xl font-bold text-[var(--neon-green)] mb-4">RACE COMPLETE</h2>
                            <p className="text-xl mb-6">Final WPM: {wpm}</p>
                            <Link href="/">
                                <NeonButton variant="green">Return to Lobby</NeonButton>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar / Leaderboard */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-bold mb-6 text-[var(--neon-yellow)] border-b border-gray-800 pb-2">
                        LEADERBOARD
                    </h3>

                    <div className="space-y-6">
                        <ProgressBar
                            progress={progress}
                            playerName="YOU"
                            isSelf
                            color="var(--neon-pink)"
                        />

                        {opponents.map(op => (
                            <ProgressBar
                                key={op.id}
                                progress={op.progress}
                                playerName={op.name}
                                color="var(--neon-blue)"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

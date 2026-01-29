"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface TypingAreaProps {
    text: string;
    onProgress: (progress: number, wpm: number) => void;
    onComplete: (wpm: number) => void;
}

export default function TypingArea({ text, onProgress, onComplete }: TypingAreaProps) {
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCompleted) return;

        const val = e.target.value;

        if (!startTime) {
            setStartTime(Date.now());
        }

        setInput(val);

        // Calculate Progress
        const progress = (val.length / text.length) * 100;

        // Calculate WPM
        // Words = characters / 5
        const timeElapsedMin = (Date.now() - (startTime || Date.now())) / 60000;
        const currentWpm = timeElapsedMin > 0 ? Math.round((val.length / 5) / timeElapsedMin) : 0;

        setWpm(currentWpm);
        onProgress(progress, currentWpm);

        if (val === text) {
            setIsCompleted(true);
            onComplete(currentWpm);
        }
    }, [text, startTime, isCompleted, onProgress, onComplete]);

    // Prevent pasting
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-blue)] box-glow">
            <div className="mb-4 text-xl font-mono text-gray-400 break-words leading-relaxed relative">
                {/* Render Characters */}
                {text.split("").map((char, index) => {
                    let color = "text-gray-500";
                    if (index < input.length) {
                        color = input[index] === char ? "text-[var(--neon-green)] text-glow" : "text-[var(--neon-pink)] decoration-line-through";
                    }
                    // Cursor
                    const isCursor = index === input.length;

                    return (
                        <span key={index} className={`${color} relative`}>
                            {isCursor && (
                                <motion.span
                                    layoutId="cursor"
                                    className="absolute left-0 -top-1 w-[2px] h-6 bg-[var(--neon-yellow)]"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                />
                            )}
                            {char}
                        </span>
                    );
                })}
            </div>

            <input
                type="text"
                value={input}
                onChange={handleInput}
                onPaste={handlePaste}
                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default"
                autoFocus
            />

            <div className="flex justify-between mt-4 text-[var(--neon-blue)] font-bold">
                <div>WPM: {wpm}</div>
                {isCompleted && <div className="text-[var(--neon-green)]">COMPLETED!</div>}
            </div>
        </div>
    );
}

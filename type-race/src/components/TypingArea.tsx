"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { EngineType } from "@/lib/sounds";
import { useSoundEngine } from "@/hooks/useSoundEngine";

interface TypingAreaProps {
    text: string;
    onProgress: (progress: number, wpm: number) => void;
    onComplete: (wpm: number) => void;
    engineType?: EngineType;
    soundEnabled?: boolean;
}

export default function TypingArea({
    text,
    onProgress,
    onComplete,
    engineType = 'v8',
    soundEnabled = true
}: TypingAreaProps) {
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastUpdateRef = useRef<number>(0);

    const { startEngine, stopEngine, onCorrectKeystroke, onErrorKeystroke, onBackspace } = useSoundEngine(engineType);

    // Focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Stop engine when complete or sound disabled
    useEffect(() => {
        if (isCompleted || !soundEnabled) {
            stopEngine();
        }
    }, [isCompleted, soundEnabled, stopEngine]);

    // Count correct characters (for progress - car only moves on correct input)
    const getCorrectCount = useCallback((inputStr: string) => {
        let correct = 0;
        for (let i = 0; i < inputStr.length; i++) {
            if (inputStr[i] === text[i]) {
                correct++;
            } else {
                break; // Stop at first error - car can't go past errors!
            }
        }
        return correct;
    }, [text]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCompleted) return;

        const val = e.target.value;
        const prevLen = input.length;
        const isBackspaceKey = val.length < prevLen;

        // Start engine on first keystroke (if sound enabled)
        if (!startTime) {
            setStartTime(Date.now());
            if (soundEnabled) startEngine();
        }

        // Handle sound based on input type (only if sound enabled)
        if (soundEnabled) {
            if (isBackspaceKey) {
                onBackspace();
            } else if (val.length > prevLen) {
                const newCharIndex = val.length - 1;
                const isCorrect = val[newCharIndex] === text[newCharIndex];
                if (isCorrect) onCorrectKeystroke();
                else onErrorKeystroke();
            }
        }

        setInput(val);

        // Calculate Progress - ONLY correct consecutive characters count!
        const correctCount = getCorrectCount(val);
        const progress = (correctCount / text.length) * 100;

        // Calculate WPM based on correct characters
        const timeElapsedMin = (Date.now() - (startTime || Date.now())) / 60000;
        const currentWpm = timeElapsedMin > 0 ? Math.round((correctCount / 5) / timeElapsedMin) : 0;

        setWpm(currentWpm);

        // Throttling updates to parent (scene re-render)
        // Update immediately if finished or if enough time passed (100ms)
        const now = Date.now();
        if (val === text || now - lastUpdateRef.current > 100) {
            onProgress(progress, currentWpm);
            lastUpdateRef.current = now;
        }

        // Only complete if entire text matches exactly
        if (val === text) {
            setIsCompleted(true);
            onComplete(currentWpm);
        }
    }, [text, startTime, isCompleted, input, onProgress, onComplete, startEngine, onCorrectKeystroke, onErrorKeystroke, onBackspace, getCorrectCount, soundEnabled]);

    // Prevent pasting
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
    };

    // Click to focus
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            className="w-full max-w-3xl mx-auto p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-blue)] box-glow cursor-text relative"
            onClick={handleContainerClick}
        >
            {/* Timer display */}
            <div className="absolute top-4 right-4 text-[var(--neon-yellow)] font-mono text-sm">
                WPM: <span className="text-xl font-bold">{wpm}</span>
            </div>

            <div className="mb-4 text-xl font-mono text-gray-400 break-words leading-relaxed relative pr-16 select-none">
                {/* Render Characters */}
                {text.split("").map((char, index) => {
                    let color = "text-gray-500";
                    let decoration = "";

                    if (index < input.length) {
                        if (input[index] === char) {
                            color = "text-[var(--neon-green)]";
                        } else {
                            // WRONG CHARACTER: RED and Strikethrough
                            color = "text-red-500 font-bold";
                            decoration = "line-through decoration-red-500";
                        }
                    }

                    // Cursor
                    const isCursor = index === input.length;

                    return (
                        <span
                            key={index}
                            className={`${color} relative ${decoration}`}
                            style={index < input.length && input[index] === char ? {
                                textShadow: '0 0 8px var(--neon-green)'
                            } : {}}
                        >
                            {isCursor && (
                                <motion.span
                                    layoutId="cursor"
                                    className="absolute left-0 -top-1 w-[3px] h-7 bg-[var(--neon-yellow)] rounded"
                                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                                    style={{ boxShadow: '0 0 10px var(--neon-yellow)' }}
                                />
                            )}
                            {char}
                        </span>
                    );
                })}
            </div>

            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                onPaste={handlePaste}
                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-text"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
            />

            <div className="flex justify-between mt-4 text-sm text-gray-500">
                <div>
                    {input.length} / {text.length} chars
                </div>
                {isCompleted && (
                    <div className="text-[var(--neon-green)] font-bold animate-pulse">
                        ✓ RACE COMPLETE!
                    </div>
                )}
            </div>
        </div>
    );
}

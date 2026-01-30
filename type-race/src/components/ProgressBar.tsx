import React from 'react';
import { motion } from 'framer-motion';
import NeonCar from './NeonCar';

interface ProgressBarProps {
    progress: number; // 0 to 100
    playerName: string;
    isSelf?: boolean;
    color?: string;
}

export default function ProgressBar({ progress, playerName, isSelf = false, color = 'var(--neon-blue)' }: ProgressBarProps) {
    // Use a fixed color for self to stand out, or the passed color
    const carColor = isSelf ? 'var(--neon-pink)' : color;

    return (
        <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm font-mono" style={{ color: 'var(--foreground)' }}>
                <span className={isSelf ? "text-[var(--neon-yellow)] font-bold" : "text-gray-400"}>
                    {playerName} {isSelf && "(YOU)"}
                </span>
                <span className="text-gray-500">{Math.round(progress)}%</span>
            </div>

            {/* Track */}
            <div className="h-8 relative border-b border-gray-800">
                <motion.div
                    className="absolute top-0 transform -translate-x-full"
                    style={{ left: `${progress}%` }}
                    animate={{ left: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.2 }}
                >
                    <NeonCar color={carColor} className="w-16 h-8 text-[var(--foreground)]" />
                </motion.div>
            </div>
        </div>
    );
}

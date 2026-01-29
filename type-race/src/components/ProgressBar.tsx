import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // 0 to 100
    playerName: string;
    isSelf?: boolean;
    color?: string;
}

export default function ProgressBar({ progress, playerName, isSelf = false, color = 'var(--neon-blue)' }: ProgressBarProps) {
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm font-mono">
                <span className={isSelf ? "text-[var(--neon-yellow)] font-bold" : "text-gray-400"}>
                    {playerName} {isSelf && "(YOU)"}
                </span>
                <span className="text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
                <motion.div
                    className="h-full relative"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.2 }}
                >
                    {/* Glowing tip */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                </motion.div>
            </div>
        </div>
    );
}

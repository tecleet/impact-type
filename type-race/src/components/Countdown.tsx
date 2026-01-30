"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
    seconds?: number;
    onComplete: () => void;
}

export default function Countdown({ seconds = 3, onComplete }: CountdownProps) {
    const [count, setCount] = useState(seconds);
    const [showGo, setShowGo] = useState(false);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else if (count === 0 && !showGo) {
            setShowGo(true);
            setTimeout(() => {
                onComplete();
            }, 500);
        }
    }, [count, showGo, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                {count > 0 ? (
                    <motion.div
                        key={count}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-[200px] font-black text-[var(--neon-blue)] text-glow"
                        style={{
                            textShadow: '0 0 50px var(--neon-blue), 0 0 100px var(--neon-blue)'
                        }}
                    >
                        {count}
                    </motion.div>
                ) : showGo ? (
                    <motion.div
                        key="go"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-[150px] font-black text-[var(--neon-green)] uppercase tracking-widest"
                        style={{
                            textShadow: '0 0 50px var(--neon-green), 0 0 100px var(--neon-green)'
                        }}
                    >
                        GO!
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="absolute bottom-20 text-gray-400 text-xl font-mono">
                Get Ready...
            </div>
        </div>
    );
}

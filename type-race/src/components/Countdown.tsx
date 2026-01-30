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
            }, 600);
        }
    }, [count, showGo, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
            {/* Background Scanlines Effect */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)'
                }}
            />

            {/* Ready Prompt */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-500 tracking-[0.5em] mb-8"
            >
                GET READY
            </motion.div>

            <AnimatePresence mode="wait">
                {count > 0 ? (
                    <motion.div
                        key={count}
                        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: 1,
                            rotate: 0,
                        }}
                        exit={{ scale: 2.5, opacity: 0, y: -50 }}
                        transition={{
                            duration: 0.4,
                            scale: { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
                        }}
                        className="text-[280px] font-black text-[var(--neon-green)] leading-none"
                        style={{
                            textShadow: '0 0 60px #00ff00, 0 0 120px #00ff00, 0 0 180px #00ff00',
                            WebkitTextStroke: '4px rgba(255,255,255,0.2)'
                        }}
                    >
                        {count}
                    </motion.div>
                ) : showGo ? (
                    <motion.div
                        key="go"
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                        exit={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-[200px] font-black text-white uppercase tracking-[0.2em] leading-none"
                        style={{
                            textShadow: '0 0 60px #ffffff, 0 0 120px #00ff00',
                        }}
                    >
                        GO!
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Revving Engine Animation */}
            <div className="absolute bottom-20 flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scaleY: [0.3, 1, 0.5, 0.8, 0.3],
                            opacity: [0.5, 1, 0.7, 0.9, 0.5]
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1
                        }}
                        className="w-3 h-16 bg-[var(--neon-green)] rounded-full"
                        style={{ boxShadow: '0 0 10px #00ff00' }}
                    />
                ))}
            </div>

            {/* Bottom Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-10 text-gray-600 text-sm font-mono tracking-widest"
            >
                ENGINES WARMING UP...
            </motion.div>
        </div>
    );
}

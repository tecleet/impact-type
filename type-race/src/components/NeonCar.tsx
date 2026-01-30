"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface NeonCarProps {
    color?: string;
    className?: string;
    pathData?: string;
    animate?: boolean;
}

export default function NeonCar({
    color = '#05d9e8',
    className,
    pathData,
    animate = true
}: NeonCarProps) {
    const defaultPath = "M 10 28 L 15 20 L 45 20 L 55 28 Z M 20 20 L 25 12 L 40 12 L 45 20";

    return (
        <svg
            viewBox="0 0 120 40"
            className={className}
            style={{
                filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 3px ${color})`,
                color: color
            }}
        >
            {/* Main Body */}
            <path
                fill={`${color}22`}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                d={pathData || defaultPath}
            />

            {/* Animated Wheels */}
            <g>
                {/* Front Wheel */}
                <motion.g
                    animate={animate ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                    style={{ transformOrigin: "18px 28px" }}
                >
                    <circle cx="18" cy="28" r="6" fill="#111" stroke="currentColor" strokeWidth="2" />
                    <line x1="18" y1="22" x2="18" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <line x1="12" y1="28" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </motion.g>

                {/* Rear Wheel */}
                <motion.g
                    animate={animate ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                    style={{ transformOrigin: "85px 28px" }}
                >
                    <circle cx="85" cy="28" r="6" fill="#111" stroke="currentColor" strokeWidth="2" />
                    <line x1="85" y1="22" x2="85" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <line x1="79" y1="28" x2="91" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </motion.g>
            </g>

            {/* Exhaust Glow */}
            <motion.ellipse
                cx="5"
                cy="26"
                rx="4"
                ry="2"
                fill={color}
                opacity="0.6"
                animate={animate ? {
                    opacity: [0.3, 0.8, 0.3],
                    scaleX: [0.8, 1.2, 0.8]
                } : {}}
                transition={{ repeat: Infinity, duration: 0.15, ease: "easeInOut" }}
            />

            {/* Headlights */}
            <motion.circle
                cx="105"
                cy="24"
                r="3"
                fill="white"
                opacity="0.9"
                animate={animate ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
            />

            {/* Speed Lines */}
            {animate && (
                <g opacity="0.4">
                    <motion.line
                        x1="-5" y1="20" x2="-15" y2="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={{ x: [0, -5, 0], opacity: [0.2, 0.6, 0.2] }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                    />
                    <motion.line
                        x1="-5" y1="26" x2="-20" y2="26"
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={{ x: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.15 }}
                    />
                    <motion.line
                        x1="-5" y1="32" x2="-12" y2="32"
                        stroke="currentColor"
                        strokeWidth="2"
                        animate={{ x: [0, -4, 0], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 0.25 }}
                    />
                </g>
            )}
        </svg>
    );
}

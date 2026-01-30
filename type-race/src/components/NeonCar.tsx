import React from 'react';

interface NeonCarProps {
    color?: string;
    className?: string;
}

export default function NeonCar({ color = '#05d9e8', className }: NeonCarProps) {
    return (
        <svg
            viewBox="0 0 100 40"
            className={className}
            style={{
                filter: `drop-shadow(0 0 5px ${color})`,
                color: color
            }}
        >
            {/* Simple futuristic car shape */}
            <path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                d="M 10 30 L 20 15 L 60 15 L 75 30 Z M 20 15 L 30 5 L 50 5 L 60 15"
            />
            <rect x="15" y="30" width="10" height="5" fill="currentColor" opacity="0.8" />
            <rect x="65" y="30" width="10" height="5" fill="currentColor" opacity="0.8" />
            <line x1="10" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />

            {/* Speed lines */}
            <line x1="5" y1="30" x2="0" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="8" y1="25" x2="2" y2="25" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        </svg>
    );
}

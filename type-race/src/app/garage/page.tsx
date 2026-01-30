"use client";

import { usePlayerStats } from '@/hooks/usePlayerStats';
import { ALL_CARS, CarModel } from '@/lib/cars';
import NeonCar from '@/components/NeonCar';
import NeonButton from '@/components/NeonButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GaragePreview3D from '@/components/game/garage/GaragePreview3D';

export default function GaragePage() {
    const { stats, selectCar, loaded } = usePlayerStats();

    if (!loaded) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--neon-blue)]">Loading Garage...</div>;

    const currentCar = ALL_CARS.find(c => c.id === stats.selectedCarId) || ALL_CARS[0];

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono p-8">
            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <Link href="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] hover:opacity-80 transition-opacity">
                    TECLEET
                </Link>
                <h1 className="text-2xl font-black italic text-[var(--neon-pink)] text-glow">
                    GARAGE
                </h1>
                <div className="text-right">
                    <div className="text-sm text-gray-500">MAX SPEED RECORD</div>
                    <div className="text-2xl font-bold text-[var(--neon-yellow)]">{stats.maxWpm} WPM</div>
                </div>
            </header>

            {/* Showcase */}
            <div className="flex flex-col items-center justify-center py-12 bg-gray-900/30 rounded-xl border border-gray-800 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,217,232,0.1)_0%,transparent_70%)]" style={{ pointerEvents: 'none' }} />

                <h2 className="text-xl text-[var(--neon-blue)] mb-8 tracking-widest uppercase">Equipped Ride</h2>

                <div className="relative z-10 w-full h-64 md:h-80">
                    <GaragePreview3D car={currentCar} />
                </div>

                <div className="mt-8 text-2xl font-bold text-white">{currentCar.name}</div>
                <div className="text-[var(--neon-green)] text-sm uppercase tracking-widest">{currentCar.type} CLASS</div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {ALL_CARS.map((car) => {
                    const isLocked = stats.maxWpm < car.requiredWpm;
                    const isSelected = car.id === stats.selectedCarId;

                    return (
                        <div
                            key={car.id}
                            onClick={() => !isLocked && selectCar(car.id)}
                            className={`
                                relative p-4 rounded-xl border transition-all cursor-pointer group
                                ${isSelected ? 'border-[var(--neon-pink)] bg-[rgba(255,42,109,0.1)] box-glow' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}
                                ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                            `}
                        >
                            {/* Car Preview */}
                            <div className="h-20 flex items-center justify-center mb-4">
                                <NeonCar color={isLocked ? '#555' : car.color} className="w-full h-full" />
                            </div>

                            {/* Info */}
                            <div className="text-center">
                                <div className="font-bold text-sm truncate">{car.name}</div>
                                <div className="text-xs text-gray-500 uppercase mt-1">{car.type}</div>
                            </div>

                            {/* Lock Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                                    <div className="text-[var(--neon-pink)] font-bold text-xl">LOCKED</div>
                                    <div className="text-xs text-gray-400 mt-1">REQ: {car.requiredWpm} WPM</div>
                                </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-[var(--neon-green)] rounded-full box-glow" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-8 right-8 z-50">
                <Link href="/">
                    <NeonButton variant="blue">Back to Lobby</NeonButton>
                </Link>
            </div>
        </div>
    );
}

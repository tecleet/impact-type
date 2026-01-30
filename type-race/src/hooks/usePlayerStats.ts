"use client";

import { useState, useEffect } from 'react';

const STORAGE_KEY_STATS = 'type-race-stats-v1';

export interface PlayerStats {
    maxWpm: number;
    selectedCarId: string;
    racesCompleted: number;
}

export const usePlayerStats = () => {
    const [stats, setStats] = useState<PlayerStats>({
        maxWpm: 0,
        selectedCarId: 'c1',
        racesCompleted: 0
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_STATS);
        if (stored) {
            setStats(JSON.parse(stored));
        }
        setLoaded(true);
    }, []);

    const saveStats = (newStats: PlayerStats) => {
        setStats(newStats);
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
    };

    const updateMaxWpm = (wpm: number) => {
        if (wpm > stats.maxWpm) {
            saveStats({
                ...stats,
                maxWpm: wpm
            });
            return true; // New record
        }
        return false;
    };

    const selectCar = (carId: string) => {
        saveStats({
            ...stats,
            selectedCarId: carId
        });
    };

    const incrementRaces = () => {
        saveStats({
            ...stats,
            racesCompleted: stats.racesCompleted + 1
        });
    };

    return {
        stats,
        loaded,
        updateMaxWpm,
        selectCar,
        incrementRaces
    };
};

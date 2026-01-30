"use client";

import { useEffect, useRef, useCallback } from 'react';
import {
    startEngineSound,
    stopEngineSound,
    revOnKeystroke,
    dropOnBackspace,
    engineMisfire,
    idleDown,
    turnOffEngine,
    restartEngine,
    ENGINE_PROFILES,
    EngineType
} from '@/lib/sounds';

export const useSoundEngine = (engineType: EngineType = 'v8') => {
    const isActiveRef = useRef(false);
    const isEngineOffRef = useRef(false);
    const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const offTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const profile = ENGINE_PROFILES[engineType];

    const startEngine = useCallback(() => {
        if (!isActiveRef.current) {
            startEngineSound(profile);
            isActiveRef.current = true;
            isEngineOffRef.current = false;
        }
    }, [profile]);

    const stopEngine = useCallback(() => {
        stopEngineSound();
        isActiveRef.current = false;
        isEngineOffRef.current = false;
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        if (offTimeoutRef.current) clearTimeout(offTimeoutRef.current);
    }, []);

    const clearTimeouts = useCallback(() => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        if (offTimeoutRef.current) clearTimeout(offTimeoutRef.current);
    }, []);

    const setIdleTimeouts = useCallback(() => {
        clearTimeouts();

        // Idle after 1s of no activity
        idleTimeoutRef.current = setTimeout(() => {
            console.log('Engine idling down...');
            idleDown();

            // Off after 2 more seconds (3s total from last keystroke)
            offTimeoutRef.current = setTimeout(() => {
                console.log('Engine turning off...');
                turnOffEngine();
                isEngineOffRef.current = true;
            }, 2000);
        }, 1000);
    }, [clearTimeouts]);

    // Called on CORRECT forward keystroke
    const onCorrectKeystroke = useCallback(() => {
        if (isEngineOffRef.current) {
            console.log('Restarting engine...');
            restartEngine();
            isEngineOffRef.current = false;
        }

        revOnKeystroke();
        setIdleTimeouts();
    }, [setIdleTimeouts]);

    // Called on ERROR keystroke
    const onErrorKeystroke = useCallback(() => {
        engineMisfire();
        setIdleTimeouts();
    }, [setIdleTimeouts]);

    // Called on backspace
    const onBackspace = useCallback(() => {
        dropOnBackspace();
        setIdleTimeouts();
    }, [setIdleTimeouts]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopEngine();
        };
    }, [stopEngine]);

    return {
        startEngine,
        stopEngine,
        onCorrectKeystroke,
        onErrorKeystroke,
        onBackspace
    };
};

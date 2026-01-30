// Realistic Engine Sound Synthesis
export type EngineType = 'v8' | 'v12' | 'electric' | 'turbo';

export interface SoundProfile {
    engineType: EngineType;
    cylinders: number;
    idleRpm: number;
    maxRpm: number;
    baseFreq: number;
}

export const ENGINE_PROFILES: Record<EngineType, SoundProfile> = {
    v8: {
        engineType: 'v8',
        cylinders: 8,
        idleRpm: 800,
        maxRpm: 7000,
        baseFreq: 45
    },
    v12: {
        engineType: 'v12',
        cylinders: 12,
        idleRpm: 1000,
        maxRpm: 9000,
        baseFreq: 60
    },
    electric: {
        engineType: 'electric',
        cylinders: 0,
        idleRpm: 0,
        maxRpm: 15000,
        baseFreq: 200
    },
    turbo: {
        engineType: 'turbo',
        cylinders: 4,
        idleRpm: 900,
        maxRpm: 7500,
        baseFreq: 50
    }
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Engine components
let noiseNode: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;
let noiseFilter: BiquadFilterNode | null = null;

let lowOsc: OscillatorNode | null = null;
let lowGain: GainNode | null = null;

let midOsc: OscillatorNode | null = null;
let midGain: GainNode | null = null;

let pulseOsc: OscillatorNode | null = null; // For cylinder pulse feel
let pulseGain: GainNode | null = null;

let currentProfile: SoundProfile | null = null;
let engineLoop: ReturnType<typeof setInterval> | null = null;

// State
let currentRpm = 0;
let targetRpm = 0;
let isRunning = false;
let lastUpdateTime = 0;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContext;
}

// Create noise buffer for rumble
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // Pink noise (better for engine rumble than brown)
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compesate for low amplitude
    }

    return buffer;
}
let lastOut = 0;

export function startEngineSound(profile: SoundProfile): void {
    try {
        const ctx = getAudioContext();

        // Resume context if suspended (common browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        stopEngineSound();

        currentProfile = profile;
        currentRpm = profile.idleRpm;
        targetRpm = profile.idleRpm;
        isRunning = true;
        lastUpdateTime = ctx.currentTime;

        // Master gain
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
        masterGain.connect(ctx.destination);

        if (profile.engineType === 'electric') {
            // Electric: smooth whine
            // Main tone
            lowOsc = ctx.createOscillator();
            lowGain = ctx.createGain();
            lowOsc.type = 'sine';
            lowOsc.frequency.setValueAtTime(profile.baseFreq, ctx.currentTime);
            lowGain.gain.setValueAtTime(0.4, ctx.currentTime);
            lowOsc.connect(lowGain);
            lowGain.connect(masterGain);
            lowOsc.start();

            // High harmonic
            midOsc = ctx.createOscillator();
            midGain = ctx.createGain();
            midOsc.type = 'triangle';
            midOsc.frequency.setValueAtTime(profile.baseFreq * 2, ctx.currentTime);
            midGain.gain.setValueAtTime(0.1, ctx.currentTime);
            midOsc.connect(midGain);
            midGain.connect(masterGain);
            midOsc.start();
        } else {
            // Combustion engine: noise + harmonics + pulse

            // 1. Noise rumble (Filtered Pink Noise)
            noiseNode = ctx.createBufferSource();
            noiseNode.buffer = createNoiseBuffer(ctx);
            noiseNode.loop = true;

            noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.Q.value = 1;
            noiseFilter.frequency.setValueAtTime(80, ctx.currentTime); // Lower rumble (was 100)

            noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.15, ctx.currentTime); // Less noise (was 0.4)

            noiseNode.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(masterGain);
            noiseNode.start();

            // 2. Main Cylinder Firing (Fundamental)
            lowOsc = ctx.createOscillator();
            lowGain = ctx.createGain();

            // Texture depends on engine type
            if (profile.engineType === 'v8') {
                lowOsc.type = 'triangle'; // Smoother for V8 (was sawtooth)
            } else if (profile.engineType === 'v12') {
                lowOsc.type = 'sine'; // Even smoother for V12
            } else {
                lowOsc.type = 'triangle';
            }

            lowOsc.frequency.setValueAtTime(profile.baseFreq, ctx.currentTime);
            lowGain.gain.setValueAtTime(0.4, ctx.currentTime); // Slightly higher tonal gain to compensate for less noise

            // Filter the main note to remove harsh buzz
            const lowFilter = ctx.createBiquadFilter();
            lowFilter.type = 'lowpass';
            lowFilter.frequency.value = 300; // Lower cutoff (was 400)

            lowOsc.connect(lowFilter);
            lowFilter.connect(lowGain);
            lowGain.connect(masterGain);
            lowOsc.start();

            // 3. Harmonic / Turbo Whine / Growl
            midOsc = ctx.createOscillator();
            midGain = ctx.createGain();

            if (profile.engineType === 'turbo') {
                midOsc.type = 'sine'; // Turbo whistle
            } else {
                midOsc.type = 'triangle'; // Smoother harmonic (was sawtooth)
            }

            midOsc.frequency.setValueAtTime(profile.baseFreq * 1.5, ctx.currentTime);
            midGain.gain.setValueAtTime(0.1, ctx.currentTime); // Lower harmonic influence (was 0.15)

            // Filter mid too
            const midFilter = ctx.createBiquadFilter();
            midFilter.type = 'lowpass';
            midFilter.frequency.value = 500; // (was 600)

            midOsc.connect(midFilter);
            midFilter.connect(midGain);
            midGain.connect(masterGain);
            midOsc.start();
        }

        // High frequency update loop for smoother physics
        engineLoop = setInterval(() => {
            if (!isRunning || !currentProfile) return;
            updateEngineInternals();
        }, 16); // ~60fps updates

    } catch (e) {
        console.error("Failed to start engine sound", e);
    }
}

function updateEngineInternals(): void {
    if (!currentProfile || !masterGain || !audioContext) return;

    try {
        const ctx = audioContext;
        const profile = currentProfile;
        const now = ctx.currentTime;

        // Use time delta for consistent physics
        const dt = Math.min(0.1, now - lastUpdateTime);
        lastUpdateTime = now;

        // RPM Physics: Fast up, slow down
        const rpmDiff = targetRpm - currentRpm;

        if (rpmDiff > 0) {
            // Revving up (aggressive)
            currentRpm += rpmDiff * 15.0 * dt;
        } else {
            // Revving down (engine braking/inertia)
            currentRpm += rpmDiff * 2.0 * dt;
        }

        // Clamp RPM
        currentRpm = Math.max(profile.idleRpm * 0.5, Math.min(profile.maxRpm * 1.1, currentRpm));

        // Calculate ratio 0..1
        const rpmRatio = Math.max(0, (currentRpm - profile.idleRpm) / (profile.maxRpm - profile.idleRpm));

        // Use slight lookahead time for audio scheduling to prevent clicking
        const time = now + 0.02;

        if (profile.engineType === 'electric') {
            // Electric whine
            if (lowOsc) {
                const freq = profile.baseFreq + (rpmRatio * 800);
                lowOsc.frequency.setTargetAtTime(freq, time, 0.05);
            }
            if (midOsc) {
                const freq = (profile.baseFreq * 2) + (rpmRatio * 1600);
                midOsc.frequency.setTargetAtTime(freq, time, 0.05);
            }
            // Add volume swell
            const vol = 0.2 + (rpmRatio * 0.3);
            masterGain.gain.setTargetAtTime(targetRpm > 0 ? vol : 0, time, 0.1);

        } else {
            // Combustion engine scheduling

            // Fundamental Frequency matches RPM harmonics
            // V8 fires 4 times per rev, so freq = (RPM / 60) * 4
            // But for audio pleasingness, we sometimes scale it down
            const fundamental = (currentRpm / 60) * (profile.cylinders / 3);

            // Update filters and oscillators
            if (noiseFilter) {
                // Filter opens up with RPM
                const filterFreq = 80 + (rpmRatio * 200); // Keep rumble low
                noiseFilter.frequency.setTargetAtTime(filterFreq, time, 0.05);
            }

            if (lowOsc) {
                // Main engine note
                lowOsc.frequency.setTargetAtTime(fundamental, time, 0.05);
            }

            if (midOsc) {
                // Harmonic follows main note
                // Turbo whines higher
                const harmonic = profile.engineType === 'turbo'
                    ? fundamental * 4 + (rpmRatio * 1000)
                    : fundamental * 1.5;

                midOsc.frequency.setTargetAtTime(harmonic, time, 0.05);
            }

            // Volume modulation
            // Higher RPM = Louder
            const load = Math.max(0, rpmDiff); // Simulate engine load
            const baseVol = 0.1 + (rpmRatio * 0.2); // Smoother volume curve
            const loadVol = Math.min(0.2, load * 0.005); // Add volume under load

            const totalVol = targetRpm > 10 ? Math.min(0.5, baseVol + loadVol) : 0;

            masterGain.gain.setTargetAtTime(totalVol, time, 0.05);
        }

    } catch {
        // Ignore errors to prevent crash
    }
}

// Rev on correct keystroke - INSTANT response
export function revOnKeystroke(): void {
    if (!currentProfile) return;

    // Add significant RPM immediately
    const boost = 800;
    targetRpm = Math.min(currentProfile.maxRpm, targetRpm + boost);

    // Resume audio context if needed (interaction requirement)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Misfire on error
export function engineMisfire(): void {
    if (!currentProfile) return;

    // Drop RPM significantly
    targetRpm = Math.max(currentProfile.idleRpm, targetRpm * 0.5);

    // Stutter effect
    if (masterGain && audioContext) {
        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.setTargetAtTime(0.2, now + 0.1, 0.05);
    }
}

// Drop on backspace
export function dropOnBackspace(): void {
    if (!currentProfile) return;

    const drop = 500;
    targetRpm = Math.max(currentProfile.idleRpm, targetRpm - drop);
}

// Idle down logic
export function idleDown(): void {
    if (!currentProfile) return;
    targetRpm = currentProfile.idleRpm;
}

// Turn off - volume goes to ZERO
export function turnOffEngine(): void {
    if (!currentProfile) return;
    targetRpm = 0;
}

// Restart
export function restartEngine(): void {
    if (!currentProfile) return;
    targetRpm = currentProfile.idleRpm;
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

export function stopEngineSound(): void {
    try {
        isRunning = false;
        if (engineLoop) {
            clearInterval(engineLoop);
            engineLoop = null;
        }

        const nodes = [noiseNode, lowOsc, midOsc, pulseOsc];
        const gains = [noiseGain, lowGain, midGain, pulseGain, masterGain];

        nodes.forEach(node => {
            if (node) {
                try { node.stop(); node.disconnect(); } catch { }
            }
        });

        gains.forEach(gain => {
            if (gain) {
                try { gain.disconnect(); } catch { }
            }
        });

        if (noiseFilter) try { noiseFilter.disconnect(); } catch { }

        noiseNode = null; noiseGain = null; noiseFilter = null;
        lowOsc = null; lowGain = null;
        midOsc = null; midGain = null;
        pulseOsc = null; pulseGain = null;
        masterGain = null;
    } catch { }
}

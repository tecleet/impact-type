"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NeonButton from '@/components/NeonButton';
import { WordCount } from '@/lib/quotes';
import Link from 'next/link';

export default function CreateRacePage() {
    const router = useRouter();
    const [wordCount, setWordCount] = useState<WordCount>(25);
    const [includeCapitals, setIncludeCapitals] = useState(true);
    const [useAI, setUseAI] = useState(false);
    const [roomId, setRoomId] = useState(`race-${Math.floor(Math.random() * 10000)}`);

    const handleCreate = () => {
        const params = new URLSearchParams({
            words: wordCount.toString(),
            caps: includeCapitals ? 'true' : 'false',
            ai: useAI ? 'true' : 'false'
        });

        router.push(`/race/${roomId}?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)]">
            {/* Logo */}
            <Link href="/" className="absolute top-8 left-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] hover:opacity-80 transition-opacity">
                TECLEET
            </Link>

            <div className="max-w-md w-full p-8 bg-gray-900/50 backdrop-blur-md rounded-xl border border-[var(--neon-pink)] box-glow">
                <h1 className="text-3xl font-bold mb-8 text-[var(--neon-pink)] text-center text-glow">
                    SETUP RACE
                </h1>

                <div className="space-y-6">
                    {/* Room ID */}
                    <div>
                        <label className="block text-[var(--neon-blue)] mb-2 font-mono">ROOM ID</label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[var(--neon-blue)] focus:outline-none"
                        />
                    </div>

                    {/* Word Count Selection */}
                    <div>
                        <label className="block text-[var(--neon-blue)] mb-2 font-mono">WORD COUNT</label>
                        <div className="flex gap-2">
                            {([10, 25, 50] as WordCount[]).map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setWordCount(count)}
                                    className={`flex-1 py-3 border rounded transition-all font-bold text-lg ${wordCount === count
                                        ? 'bg-[var(--neon-blue)] text-black border-[var(--neon-blue)] box-glow'
                                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                            {wordCount === 10 && "Quick Sprint • ~15 seconds"}
                            {wordCount === 25 && "Standard Race • ~30 seconds"}
                            {wordCount === 50 && "Marathon • ~1 minute"}
                        </div>
                    </div>

                    {/* Capitalization Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
                        <div>
                            <label className="text-[var(--neon-yellow)] font-mono">CAPITALS</label>
                            <div className="text-xs text-gray-500">Include uppercase letters</div>
                        </div>
                        <button
                            onClick={() => setIncludeCapitals(!includeCapitals)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${includeCapitals ? 'bg-[var(--neon-yellow)]' : 'bg-gray-800'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeCapitals ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    {/* AI Generated Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
                        <div>
                            <label className="text-[var(--neon-green)] font-mono">AI TEXT</label>
                            <div className="text-xs text-gray-500">Use AI-generated phrases</div>
                        </div>
                        <button
                            onClick={() => setUseAI(!useAI)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${useAI ? 'bg-[var(--neon-green)]' : 'bg-gray-800'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useAI ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>

                    <NeonButton
                        className="w-full mt-8"
                        variant="pink"
                        onClick={handleCreate}
                    >
                        START ENGINE
                    </NeonButton>
                </div>
            </div>
        </div>
    );
}

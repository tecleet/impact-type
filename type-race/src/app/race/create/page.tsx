"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NeonButton from '@/components/NeonButton';
import { QuoteLength } from '@/lib/quotes';

export default function CreateRacePage() {
    const router = useRouter();
    const [length, setLength] = useState<QuoteLength>('medium');
    const [useAI, setUseAI] = useState(false);
    const [roomId, setRoomId] = useState(`race-${Math.floor(Math.random() * 10000)}`);

    const handleCreate = () => {
        // Encode settings in URL query params for simplicity in this demo
        // In a real app, this would be stored in the DB linked to roomId
        const params = new URLSearchParams({
            len: length,
            ai: useAI ? 'true' : 'false'
        });

        router.push(`/race/${roomId}?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)]">
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

                    {/* Difficulty / Length */}
                    <div>
                        <label className="block text-[var(--neon-blue)] mb-2 font-mono">DIFFICULTY</label>
                        <div className="flex gap-2">
                            {(['short', 'medium', 'long'] as QuoteLength[]).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLength(l)}
                                    className={`flex-1 py-2 border rounded transition-all font-bold uppercase text-sm ${length === l
                                            ? 'bg-[var(--neon-blue)] text-black border-[var(--neon-blue)] box-glow'
                                            : 'border-gray-700 text-gray-500 hover:border-gray-500'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Mode */}
                    <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
                        <label className="text-[var(--neon-green)] font-mono">AI GENERATED TEXT</label>
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

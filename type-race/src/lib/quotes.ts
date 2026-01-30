export type QuoteLength = 'short' | 'medium' | 'long';

export interface Quote {
    id: string;
    text: string;
    source: string;
    length: QuoteLength;
}

// A larger set of default quotes
const DEFAULT_QUOTES: Quote[] = [
    // Short (10-25 words)
    { id: 's1', length: 'short', source: 'The Matrix', text: "There is no spoon. It is not the spoon that bends, it is only yourself." },
    { id: 's2', length: 'short', source: 'Star Wars', text: "Do. Or do not. There is no try. Fear is the path to the dark side." },
    { id: 's3', length: 'short', source: 'Terminator', text: "I'll be back. Hasta la vista, baby. The future is not set." },
    { id: 's4', length: 'short', source: 'Inception', text: "You must'nt be afraid to dream a little bigger, darling." },

    // Medium (25-50 words)
    { id: 'm1', length: 'medium', source: 'Blade Runner', text: "I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhäuser Gate. All those moments will be lost in time, like tears in rain." },
    { id: 'm2', length: 'medium', source: 'Dune', text: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me." },

    // Long (50+ words)
    { id: 'l1', length: 'long', source: 'Cyberpunk 2077', text: "In Night City, you can be anyone you want to be. The only limit is your imagination and how much you're willing to pay. But remember, every choice has a price, and sometimes the price is higher than you can afford. So choose wisely, choom, because once you're in, there's no way out." },
    { id: 'l2', length: 'long', source: 'Neuromancer', text: "The sky above the port was the color of television, tuned to a dead channel. It's not like I'm using, Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. It's like my body's developed this massive drug deficiency." }
];

// Mock "AI" Text Generator
const AI_FRAGMENTS = [
    "The neural network parses the data stream,",
    "creating a reality that transcends the physical realm.",
    "Neon lights flicker in the digital rain,",
    "while the algorithm optimized for maximum efficiency.",
    "Encrypted packets flow through the fiber optic veins,",
    "pulsing with the heartbeat of the machine city.",
    "System integrity is critical for survival in this sector.",
    "Hacking the mainframe requires precision and speed."
];

export function generateAIQuote(length: QuoteLength): Quote {
    let count = 2; // short
    if (length === 'medium') count = 4;
    if (length === 'long') count = 8;

    const selected = [];
    const pool = [...AI_FRAGMENTS];

    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
    }

    return {
        id: `ai-${Date.now()}`,
        text: selected.join(" "),
        source: "AI Generator",
        length
    };
}

export function getQuote(length: QuoteLength, useAI: boolean = false): Quote {
    if (useAI) {
        return generateAIQuote(length);
    }

    const filtered = DEFAULT_QUOTES.filter(q => q.length === length);
    if (filtered.length === 0) return DEFAULT_QUOTES[0]; // fallback

    return filtered[Math.floor(Math.random() * filtered.length)];
}

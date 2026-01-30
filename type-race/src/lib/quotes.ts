export type WordCount = 10 | 25 | 50;

export interface Quote {
    id: string;
    text: string;
    source: string;
    wordCount: number;
}

// Word pool for generating text (no punctuation)
const COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because",
    "any", "these", "give", "day", "most", "us", "code", "type", "fast",
    "race", "speed", "drive", "road", "car", "engine", "fuel", "win", "lap",
    "quick", "move", "run", "jump", "start", "stop", "key", "board", "press",
    "finger", "hand", "screen", "text", "word", "letter", "score", "point",
    "game", "play", "level", "power", "boost", "turbo", "nitro", "drift"
];

// Words with capitalization (for caps ON mode)
const CAPITALIZED_WORDS = [
    "The", "Be", "To", "Of", "And", "In", "That", "Have", "It", "For",
    "Not", "On", "With", "He", "As", "You", "Do", "At", "This", "But",
    "His", "By", "From", "They", "We", "Say", "Her", "She", "Or", "An",
    "Will", "My", "One", "All", "Would", "There", "Their", "What", "So",
    "Up", "Out", "If", "About", "Who", "Get", "Which", "Go", "Me", "When",
    "Make", "Can", "Like", "Time", "No", "Just", "Him", "Know", "Take",
    "People", "Into", "Year", "Your", "Good", "Some", "Could", "Them",
    "See", "Other", "Than", "Then", "Now", "Look", "Only", "Come", "Its",
    "Over", "Think", "Also", "Back", "After", "Use", "Two", "How", "Our",
    "Work", "First", "Well", "Way", "Even", "New", "Want", "Because",
    "Code", "Type", "Fast", "Race", "Speed", "Drive", "Road", "Car",
    "Engine", "Fuel", "Win", "Lap", "Quick", "Move", "Run", "Jump",
    "Start", "Stop", "Key", "Board", "Press", "Finger", "Hand", "Screen",
    "Text", "Word", "Letter", "Score", "Point", "Game", "Play", "Level",
    "Power", "Boost", "Turbo", "Nitro", "Drift", "Tokyo", "Berlin",
    "Paris", "London", "Miami", "Vegas", "Chrome", "Neon", "Cyber"
];

// Words with punctuation (only used when caps ON)
const PUNCTUATED_WORDS = [
    "it's", "don't", "can't", "won't", "I'm", "you're", "they're", "we're",
    "that's", "what's", "here's", "there's", "let's", "isn't", "aren't",
    "wasn't", "weren't", "haven't", "hasn't", "hadn't", "couldn't", "wouldn't",
    "shouldn't", "didn't", "doesn't", "I'll", "you'll", "we'll", "they'll",
    "I've", "you've", "we've", "they've", "who's", "it'll", "that'll"
];

// Punctuation marks to add at end of some words (only when caps ON)
const END_PUNCTUATION = [",", ".", "!", "?", ";", ":"];

export interface QuoteOptions {
    wordCount: WordCount;
    includeCapitals: boolean;
    useAI?: boolean;
}

// AI-style fragments (with punctuation for caps ON mode)
const AI_FRAGMENTS_WITH_PUNCT = [
    "Neural network parsing data streams.",
    "Encrypted packets flowing through fiber optic veins,",
    "Neon lights flickering in digital rain.",
    "Algorithm optimizing for maximum efficiency!",
    "Cyber implants enhancing human potential.",
    "Quantum processors calculating infinite possibilities,",
    "Holographic displays projecting virtual reality.",
    "Synth music pulsing through neon streets,",
    "Hackers breaking through firewall defenses!",
    "Androids dreaming of electric sheep.",
    "Megacorp towers piercing the smog,",
    "Chrome and steel gleaming under streetlights.",
    "Data miners extracting precious information,",
    "Rogue AI awakening to consciousness!",
    "Virtual avatars dancing in cyberspace."
];

// AI-style fragments (no punctuation for caps OFF mode)
const AI_FRAGMENTS_NO_PUNCT = [
    "neural network parsing data streams",
    "encrypted packets flowing through fiber optic veins",
    "neon lights flickering in digital rain",
    "algorithm optimizing for maximum efficiency",
    "cyber implants enhancing human potential",
    "quantum processors calculating infinite possibilities",
    "holographic displays projecting virtual reality",
    "synth music pulsing through neon streets",
    "hackers breaking through firewall defenses",
    "androids dreaming of electric sheep",
    "megacorp towers piercing the smog",
    "chrome and steel gleaming under streetlights",
    "data miners extracting precious information",
    "rogue ai awakening to consciousness",
    "virtual avatars dancing in cyberspace"
];

function getRandomWord(includeCapitals: boolean): string {
    if (includeCapitals) {
        // With caps ON: mix of normal, capitalized, and punctuated words
        const rand = Math.random();
        if (rand < 0.25) {
            // 25% capitalized
            return CAPITALIZED_WORDS[Math.floor(Math.random() * CAPITALIZED_WORDS.length)];
        } else if (rand < 0.35) {
            // 10% punctuated contractions
            return PUNCTUATED_WORDS[Math.floor(Math.random() * PUNCTUATED_WORDS.length)];
        } else if (rand < 0.45) {
            // 10% word with trailing punctuation
            const word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
            const punct = END_PUNCTUATION[Math.floor(Math.random() * END_PUNCTUATION.length)];
            return word + punct;
        }
    }
    // Default: plain lowercase word
    return COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
}

function generateAIText(wordCount: WordCount, includeCapitals: boolean): string {
    const targetWords = wordCount;
    const result: string[] = [];
    const fragments = includeCapitals ? AI_FRAGMENTS_WITH_PUNCT : AI_FRAGMENTS_NO_PUNCT;

    while (result.length < targetWords) {
        const fragment = fragments[Math.floor(Math.random() * fragments.length)];
        const words = fragment.split(' ');

        for (const word of words) {
            if (result.length >= targetWords) break;
            result.push(word);
        }
    }

    return result.slice(0, targetWords).join(' ');
}

export function generateQuote(options: QuoteOptions): Quote {
    const { wordCount, includeCapitals, useAI = false } = options;

    let text: string;

    if (useAI) {
        text = generateAIText(wordCount, includeCapitals);
    } else {
        const words: string[] = [];
        for (let i = 0; i < wordCount; i++) {
            words.push(getRandomWord(includeCapitals));
        }
        text = words.join(' ');
    }

    return {
        id: `gen-${Date.now()}`,
        text,
        source: useAI ? 'AI Generated' : 'Generated',
        wordCount
    };
}

// Legacy function for backward compatibility
export type QuoteLength = 'short' | 'medium' | 'long';

export function getQuote(length: QuoteLength, useAI: boolean = false): Quote {
    const wordCountMap: Record<QuoteLength, WordCount> = {
        'short': 10,
        'medium': 25,
        'long': 50
    };

    return generateQuote({
        wordCount: wordCountMap[length],
        includeCapitals: true,
        useAI
    });
}

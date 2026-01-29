import NeonButton from "@/components/NeonButton";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)] relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--neon-blue)_0%,_transparent_70%)]" />

      <h1 className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] text-glow tracking-tighter z-10">
        NEON TYPE
      </h1>

      <p className="text-xl md:text-2xl text-gray-400 mb-12 font-mono text-center z-10 max-w-xl">
        Race against the world in real-time.
        <br />
        Type fast. Glow brighter.
      </p>

      <div className="flex flex-col md:flex-row gap-6 z-10">
        <Link href="/race/create">
          <NeonButton variant="pink" className="w-48 text-lg">
            Create Race
          </NeonButton>
        </Link>
        <Link href="/race/join">
          <NeonButton variant="blue" className="w-48 text-lg">
            Join Race
          </NeonButton>
        </Link>
      </div>

      <footer className="absolute bottom-8 text-gray-600 font-mono text-sm">
        built with Next.js + Socket.io + Redis
      </footer>
    </main>
  );
}

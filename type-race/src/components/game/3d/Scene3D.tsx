import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense } from 'react';
import Track3D from './Track3D';
import Car3D from './Car3D';
import { getCarById } from '@/lib/cars';

interface Scene3DProps {
    myCarId: string;
    wpm: number;
    progress: number;
    opponents: {
        id: string;
        carId: string;
        progress: number;
        wpm: number;
    }[];
}

export default function Scene3D({ myCarId, wpm, progress, opponents }: Scene3DProps) {
    const myCar = getCarById(myCarId);

    return (
        <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow-2xl border-2 border-[var(--neon-pink)] relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={60} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

                <Suspense fallback={null}>
                    {/* The Track */}
                    <Track3D speed={wpm} />

                    {/* My Car (Always Center) */}
                    <Car3D
                        color={myCar.color}
                        type={myCar.type}
                        lane={0}
                        progress={progress}
                        isMyCar={true}
                    />

                    {/* Opponents (Calculated positions based on relative progress) */}
                    {opponents.map((opp, idx) => {
                        const oppCar = getCarById(opp.carId);
                        // Convert progress difference to Z position
                        // If opp is ahead (higher progress), z should be negative (further away)
                        // Scale: 1% progress = 2 units of distance
                        const relProgress = opp.progress - progress;
                        const zPos = -relProgress * 2;

                        // Don't render if too far
                        if (Math.abs(zPos) > 100) return null;

                        return (
                            <group key={opp.id} position={[0, 0, zPos]}>
                                <Car3D
                                    color={oppCar.color}
                                    type={oppCar.type}
                                    lane={idx % 2 === 0 ? 1 : -1} // Alternate lanes
                                    progress={opp.progress}
                                />
                            </group>
                        );
                    })}

                    {/* Environment */}
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <fog attach="fog" args={['#050505', 10, 80]} />
                </Suspense>

                {/* Post Processing */}
                <EffectComposer>
                    {/* Bloom for Neon Glow */}
                    <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={2.0} />
                </EffectComposer>

                {/* Camera Control - Locked for Race but smooth */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    target={[0, 0, -4]} // Look slightly ahead of car to frame it higher
                    maxPolarAngle={Math.PI / 2.5}
                />
            </Canvas>

            {/* Cinematic Borders (optional visual flair) */}
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Speed Overlay */}
            <div className="absolute top-6 right-6 text-right">
                <div className="text-5xl font-black italic text-[var(--neon-yellow)] text-stroke-black leading-none">
                    {Math.round(wpm)}
                </div>
                <div className="text-xs font-bold text-[var(--neon-blue)] tracking-[0.2em] mt-1">VELOCITY</div>
            </div>
        </div>
    );
}

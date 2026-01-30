import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Text } from '@react-three/drei';
import { Bloom, EffectComposer, ChromaticAberration } from '@react-three/postprocessing';
import { Suspense, useMemo } from 'react';
import Track3D from './Track3D';
import Car3D from './Car3D';
import { getCarById } from '@/lib/cars';
import * as THREE from 'three';

interface Scene3DProps {
    myCarId: string;
    wpm: number;
    progress: number;
    isRacing: boolean;
    opponents: {
        id: string;
        carId: string;
        progress: number;
        wpm: number;
    }[];
}

export default function Scene3D({ myCarId, wpm, progress, isRacing, opponents }: Scene3DProps) {
    const myCar = getCarById(myCarId);

    // Show finish line when close to end
    const showFinishLine = progress > 85;

    return (
        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-[var(--neon-green)] relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 3.5, 7]} fov={65} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <spotLight position={[10, 15, 10]} angle={0.4} penumbra={1} intensity={1.5} castShadow color="#ffffff" />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00ff00" />
                <pointLight position={[10, 5, -10]} intensity={0.3} color="#00ff00" />

                <Suspense fallback={null}>
                    {/* The Track - now uses progress-based movement */}
                    <Track3D myProgress={progress} isRacing={isRacing} />

                    {/* My Car (Always Center at Z=0) */}
                    <Car3D
                        color={myCar.color}
                        type={myCar.type}
                        lane={0}
                        isMoving={isRacing && wpm > 0}
                        isMyCar={true}
                    />

                    {/* Opponents - positioned based on progress difference */}
                    {opponents.map((opp, idx) => {
                        const oppCar = getCarById(opp.carId);

                        // Calculate relative position
                        // If opponent has higher progress, they are AHEAD (negative Z = further down the track)
                        // If opponent has lower progress, they are BEHIND (positive Z = behind camera)
                        const progressDiff = opp.progress - progress;
                        // Scale: 1% progress difference = 1.5 units of Z distance
                        const zPos = -progressDiff * 1.5;

                        // Don't render if too far behind (off camera) or way ahead
                        if (zPos > 20 || zPos < -80) return null;

                        return (
                            <group key={opp.id} position={[0, 0, zPos]}>
                                <Car3D
                                    color={oppCar.color}
                                    type={oppCar.type}
                                    lane={idx % 2 === 0 ? 1 : -1}
                                    isMoving={opp.wpm > 0}
                                />
                            </group>
                        );
                    })}

                    {/* Finish Line */}
                    {showFinishLine && <FinishLine zPosition={-(100 - progress) * 1.5 - 5} />}

                    {/* Environment */}
                    <Stars radius={150} depth={80} count={3000} factor={3} saturation={0} fade speed={0.5} />
                    <fog attach="fog" args={['#001100', 15, 100]} />
                </Suspense>

                {/* Post Processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                    <ChromaticAberration offset={wpm > 50 ? [0.001, 0.001] : [0, 0]} />
                </EffectComposer>

                {/* Camera Control - Locked */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    target={[0, 0.5, -3]}
                    maxPolarAngle={Math.PI / 2.5}
                />
            </Canvas>

            {/* Cinematic Top Gradient */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none" />

            {/* Speed Overlay */}
            <div className="absolute top-4 right-4 text-right">
                <div className="text-5xl font-black italic text-[var(--neon-green)] leading-none" style={{ textShadow: '0 0 20px #00ff00' }}>
                    {Math.round(wpm)}
                </div>
                <div className="text-[10px] font-bold text-gray-400 tracking-[0.3em] mt-1">WPM</div>
            </div>

            {/* Progress Bar at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                    className="h-full bg-[var(--neon-green)] transition-all duration-100"
                    style={{ width: `${progress}%`, boxShadow: '0 0 10px #00ff00' }}
                />
            </div>
        </div>
    );
}

// Finish Line Component
function FinishLine({ zPosition }: { zPosition: number }) {
    // Create checkered pattern texture
    const checkerTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        const size = 8;
        for (let y = 0; y < 64; y += size) {
            for (let x = 0; x < 64; x += size) {
                ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, size, size);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 1);
        return texture;
    }, []);

    return (
        <group position={[0, 0, zPosition]}>
            {/* Finish Banner Arch */}
            {/* Left Pole */}
            <mesh position={[-6, 3, 0]}>
                <boxGeometry args={[0.4, 6, 0.4]} />
                <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Right Pole */}
            <mesh position={[6, 3, 0]}>
                <boxGeometry args={[0.4, 6, 0.4]} />
                <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Top Banner */}
            <mesh position={[0, 5.8, 0]}>
                <boxGeometry args={[12.4, 1.2, 0.3]} />
                <meshStandardMaterial map={checkerTexture} />
            </mesh>

            {/* Ground Checkered Strip */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[12, 2]} />
                <meshStandardMaterial map={checkerTexture} />
            </mesh>

            {/* Glow Lights on Arch */}
            <pointLight position={[-5, 5, 0.5]} color="#00ff00" intensity={3} distance={8} />
            <pointLight position={[5, 5, 0.5]} color="#00ff00" intensity={3} distance={8} />
            <pointLight position={[0, 6, 0.5]} color="#ffffff" intensity={2} distance={10} />
        </group>
    );
}

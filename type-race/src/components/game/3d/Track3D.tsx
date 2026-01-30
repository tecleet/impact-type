import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Track3D({ speed }: { speed: number }) {
    const gridRef = useRef<THREE.Mesh>(null);
    const pillarsRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        // Move grid floor backwards to simulate speed
        if (gridRef.current) {
            // Speed factor: standard speed is 10, plus WPM influence
            // We map WPM (0-150) to a reasonable movement speed
            const velocity = (speed * 0.2 + 5) * delta;

            // Texture offset loop (manual UV shift not needed with just movement, but keeping logic if texture used)
        }

        const moveSpeed = (speed * 0.2 + 10) * delta;

        // Move pillars
        if (pillarsRef.current) {
            pillarsRef.current.children.forEach((pillar) => {
                pillar.position.z += moveSpeed;
                if (pillar.position.z > 10) {
                    pillar.position.z = -100 - Math.random() * 20;
                }
            });
        }

        // Move Particles
        if (particlesRef.current) {
            particlesRef.current.children.forEach((p) => {
                p.position.z += moveSpeed * 1.5; // Particles move faster
                if (p.position.z > 10) {
                    p.position.z = -50 - Math.random() * 50;
                    p.position.x = (Math.random() - 0.5) * 30;
                    p.position.y = Math.random() * 10;
                }
            });
        }
    });

    return (
        <group>
            {/* Infinite Floor - High Reflection */}
            <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial
                    color="#050505"
                    roughness={0.05} // Very smooth -> Wet road look
                    metalness={0.9} // Metallic
                    emissive="#0a0a0a"
                />
            </mesh>
            {/* Grid Line Overlay - for Vaporwave grid */}
            <gridHelper args={[200, 50, 0xff00ff, 0x1f0b2e]} position={[0, 0.01, 0]} />

            {/* Moving Pillars for speed reference */}
            <group ref={pillarsRef}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <Pillar key={i} x={i % 2 === 0 ? 12 : -12} z={-i * 10} />
                ))}
            </group>

            {/* Speed Particles */}
            <group ref={particlesRef}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <mesh key={i} position={[(Math.random() - 0.5) * 30, Math.random() * 10, -Math.random() * 100]}>
                        <boxGeometry args={[0.05, 0.05, 0.8]} />
                        <meshBasicMaterial color="#fff" transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>

            {/* Background Sun/Neon City vibe */}
            <mesh position={[0, 10, -80]}>
                <circleGeometry args={[20, 32]} />
                <meshBasicMaterial color="#ff00ff" />
            </mesh>
            <gridHelper args={[200, 50, 0xff00ff, 0x000000]} position={[0, 10, -79]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
    );
}

function Pillar({ x, z }: { x: number, z: number }) {
    return (
        <mesh position={[x, 2, z]}>
            <boxGeometry args={[1, 4, 1]} />
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={2}
            />
        </mesh>
    );
}

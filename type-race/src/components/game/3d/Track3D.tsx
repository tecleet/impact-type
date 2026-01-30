import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Track3DProps {
    myProgress: number;      // Player's current progress (0-100)
    isRacing: boolean;       // Whether race is active
}

export default function Track3D({ myProgress, isRacing }: Track3DProps) {
    const laneMarkingsRef = useRef<THREE.Group>(null);
    const guardrailsRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Group>(null);
    const sparksRef = useRef<THREE.Group>(null);
    const buildingsRef = useRef<THREE.Group>(null);

    // Track progress changes to calculate movement
    const prevProgressRef = useRef(myProgress);
    const accumulatedMovementRef = useRef(0);

    // Create road texture procedurally
    const roadTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Asphalt base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 512, 512);

        // Add some noise for texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const gray = Math.random() * 30 + 20;
            ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 20);
        return texture;
    }, []);

    useFrame((state, delta) => {
        // Don't animate if not racing
        if (!isRacing) {
            prevProgressRef.current = myProgress;
            return;
        }

        // Calculate progress delta (how much progress increased this frame)
        const progressDelta = Math.max(0, myProgress - prevProgressRef.current);
        prevProgressRef.current = myProgress;

        // Convert progress to movement speed
        // 100% progress = full track length movement
        // Each 1% progress moves objects by ~1.5 units
        const moveSpeed = progressDelta * 1.5;

        // Accumulate for texture offset
        accumulatedMovementRef.current += moveSpeed;

        // Only animate if there's movement (player is typing)
        if (moveSpeed <= 0) return;

        // Animate road texture scrolling
        if (roadTexture) {
            roadTexture.offset.y -= moveSpeed * 0.015;
        }

        // Move lane markings
        if (laneMarkingsRef.current) {
            laneMarkingsRef.current.children.forEach((mark) => {
                mark.position.z += moveSpeed;
                if (mark.position.z > 15) {
                    mark.position.z = -150 + Math.random() * 10;
                }
            });
        }

        // Move guardrails
        if (guardrailsRef.current) {
            guardrailsRef.current.children.forEach((rail) => {
                rail.position.z += moveSpeed;
                if (rail.position.z > 15) {
                    rail.position.z = -150;
                }
            });
        }

        // Move buildings
        if (buildingsRef.current) {
            buildingsRef.current.children.forEach((building) => {
                building.position.z += moveSpeed * 0.3;
                if (building.position.z > 30) {
                    building.position.z = -200 - Math.random() * 100;
                }
            });
        }

        // Speed Particles - only show when moving fast
        if (particlesRef.current && progressDelta > 0.3) {
            particlesRef.current.children.forEach((p) => {
                p.position.z += moveSpeed * 3;
                if (p.position.z > 10) {
                    p.position.z = -80 - Math.random() * 50;
                    p.position.x = (Math.random() - 0.5) * 15;
                    p.position.y = Math.random() * 3 + 0.5;
                }
            });
        }

        // Sparks - only at very fast typing
        if (sparksRef.current && progressDelta > 0.5) {
            sparksRef.current.children.forEach((spark) => {
                spark.position.z += moveSpeed * 4;
                spark.position.y -= delta * 5;
                if (spark.position.z > 5 || spark.position.y < 0) {
                    spark.position.z = -2 - Math.random() * 3;
                    spark.position.x = (Math.random() - 0.5) * 3;
                    spark.position.y = 0.1 + Math.random() * 0.3;
                }
            });
        }
    });

    return (
        <group>
            {/* Main Road Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -70]} receiveShadow>
                <planeGeometry args={[12, 300]} />
                <meshStandardMaterial
                    map={roadTexture}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Road Edges - Yellow Lines */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.8, 0.01, -70]}>
                <planeGeometry args={[0.15, 300]} />
                <meshBasicMaterial color="#ffcc00" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.8, 0.01, -70]}>
                <planeGeometry args={[0.15, 300]} />
                <meshBasicMaterial color="#ffcc00" />
            </mesh>

            {/* Lane Markings - Dashed White Lines */}
            <group ref={laneMarkingsRef}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -i * 4]}>
                        <planeGeometry args={[0.2, 2]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                ))}
            </group>

            {/* Guardrails */}
            <group ref={guardrailsRef}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <Guardrail key={i} x={7} z={-i * 5} />
                ))}
                {Array.from({ length: 30 }).map((_, i) => (
                    <Guardrail key={`r-${i}`} x={-7} z={-i * 5} />
                ))}
            </group>

            {/* City Buildings in Background */}
            <group ref={buildingsRef}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <Building
                        key={i}
                        x={i % 2 === 0 ? 20 + Math.random() * 15 : -20 - Math.random() * 15}
                        z={-i * 15 - 50}
                        height={10 + Math.random() * 30}
                    />
                ))}
            </group>

            {/* Speed Lines / Particles */}
            <group ref={particlesRef}>
                {Array.from({ length: 60 }).map((_, i) => (
                    <mesh key={i} position={[(Math.random() - 0.5) * 15, Math.random() * 3 + 0.5, -Math.random() * 100]}>
                        <boxGeometry args={[0.02, 0.02, 0.8]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>

            {/* Sparks (Fast Typing) */}
            <group ref={sparksRef}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <mesh key={i} position={[(Math.random() - 0.5) * 3, 0.1, -Math.random() * 5]}>
                        <boxGeometry args={[0.03, 0.03, 0.1]} />
                        <meshBasicMaterial color="#ff8800" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>

            {/* Ground plane beyond road */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -70]}>
                <planeGeometry args={[500, 400]} />
                <meshStandardMaterial color="#0a0a0a" />
            </mesh>

            {/* Sky/Fog backdrop */}
            <mesh position={[0, 30, -200]}>
                <planeGeometry args={[500, 100]} />
                <meshBasicMaterial color="#001100" transparent opacity={0.8} />
            </mesh>
        </group>
    );
}

function Guardrail({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            {/* Post */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.1, 0.8, 0.1]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Rail */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.05, 0.15, 5]} />
                <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Reflector */}
            <mesh position={[x > 0 ? -0.1 : 0.1, 0.5, 0]}>
                <boxGeometry args={[0.02, 0.1, 0.1]} />
                <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

function Building({ x, z, height }: { x: number; z: number; height: number }) {
    const width = 5 + Math.random() * 10;
    const depth = 5 + Math.random() * 10;

    // Random window glow
    const windowColor = Math.random() > 0.7 ? '#00ff00' : (Math.random() > 0.5 ? '#ffff00' : '#ffffff');

    return (
        <group position={[x, height / 2, z]}>
            {/* Main building */}
            <mesh>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
            {/* Windows (emissive strips) */}
            {Array.from({ length: Math.floor(height / 3) }).map((_, i) => (
                <mesh key={i} position={[x > 0 ? -width / 2 - 0.01 : width / 2 + 0.01, -height / 2 + i * 3 + 2, 0]}>
                    <planeGeometry args={[0.5, 1.5]} />
                    <meshBasicMaterial color={windowColor} transparent opacity={0.3 + Math.random() * 0.5} />
                </mesh>
            ))}
        </group>
    );
}

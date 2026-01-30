import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Car3DProps {
    color: string;
    type?: 'starter' | 'speedster' | 'muscle' | 'cyber' | 'hyper' | 'legend';
    lane: number;
    isMoving?: boolean;
    isMyCar?: boolean;
}

export default function Car3D({ color, lane, type = 'starter', isMyCar, isMoving = false }: Car3DProps) {
    const group = useRef<THREE.Group>(null);

    const xPos = lane * 2.5;

    useFrame((state, delta) => {
        if (!group.current) return;

        // Bobbing effect
        group.current.position.y = Math.sin(state.clock.getElapsedTime() * 15) * 0.015 + 0.35;
    });

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.2
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: "#111",
        roughness: 0.1,
        metalness: 0.9
    });

    // Render different car bodies based on type
    const renderBody = () => {
        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.3 });
        const shinyMaterial = new THREE.MeshStandardMaterial({ color: color, metalness: 0.9, roughness: 0.1 });

        switch (type) {
            case 'cyber': // Cybertruck style - Angular
                return (
                    <group>
                        {/* Main Wedge Body */}
                        <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
                            <cylinderGeometry args={[0.6, 1.3, 3, 4, 1]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        {/* Wireframe Overlay */}
                        <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 4, Math.PI / 2]} scale={[1.01, 1.01, 1.01]}>
                            <cylinderGeometry args={[0.6, 1.3, 3, 4, 1]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        {/* Lightbar */}
                        <mesh position={[0, 0.55, -1.45]}>
                            <boxGeometry args={[1.2, 0.05, 0.1]} />
                            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
                        </mesh>
                    </group>
                );

            case 'hyper':
                return (
                    <group>
                        {/* Needle Body */}
                        <mesh position={[0, 0.35, 0]}>
                            <boxGeometry args={[0.6, 0.3, 3.2]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        <mesh position={[0, 0.35, 0]} scale={[1.01, 1.01, 1.01]}>
                            <boxGeometry args={[0.6, 0.3, 3.2]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        {/* Side Pods */}
                        <mesh position={[0.5, 0.25, 0]}>
                            <boxGeometry args={[0.4, 0.4, 1.5]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        <mesh position={[0.5, 0.25, 0]} scale={[1.01, 1.01, 1.01]}>
                            <boxGeometry args={[0.4, 0.4, 1.5]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        <mesh position={[-0.5, 0.25, 0]}>
                            <boxGeometry args={[0.4, 0.4, 1.5]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        <mesh position={[-0.5, 0.25, 0]} scale={[1.01, 1.01, 1.01]}>
                            <boxGeometry args={[0.4, 0.4, 1.5]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        {/* Rear Wing */}
                        <mesh position={[0, 0.7, 1.4]}>
                            <boxGeometry args={[1.5, 0.1, 0.4]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        <mesh position={[0, 0.5, 1.4]}>
                            <boxGeometry args={[0.2, 0.4, 0.4]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                );

            case 'muscle': // Wide, Boxy
                return (
                    <group>
                        {/* Main block */}
                        <mesh position={[0, 0.3, 0]}>
                            <boxGeometry args={[1.3, 0.5, 3]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        <mesh position={[0, 0.3, 0]} scale={[1.01, 1.01, 1.01]}>
                            <boxGeometry args={[1.3, 0.5, 3]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        {/* Roof */}
                        <mesh position={[0, 0.7, -0.3]}>
                            <boxGeometry args={[1.1, 0.35, 1.5]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                        {/* Hood Scoop */}
                        <mesh position={[0, 0.56, -1.0]}>
                            <boxGeometry args={[0.6, 0.1, 0.8]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                    </group>
                );

            case 'starter':
            default: // Hatchback/Sedan
                return (
                    <group>
                        {/* Lower Body */}
                        <mesh position={[0, 0.3, 0]}>
                            <boxGeometry args={[1.2, 0.5, 2.6]} />
                            <primitive object={shinyMaterial} />
                        </mesh>
                        <mesh position={[0, 0.3, 0]} scale={[1.01, 1.01, 1.01]}>
                            <boxGeometry args={[1.2, 0.5, 2.6]} />
                            <primitive object={wireframeMaterial} />
                        </mesh>

                        {/* Upper Cabin */}
                        <mesh position={[0, 0.7, -0.2]}>
                            <boxGeometry args={[1.0, 0.4, 1.4]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    </group>
                );
        }
    };

    return (
        <group ref={group} position={[xPos, 0, 0]}>
            {/* Render the specific car body type */}
            {renderBody()}

            {/* Common Elements */}

            {/* Glow Underbody - Only for my car */}
            {isMyCar && (
                <pointLight position={[0, -0.5, 0]} color={color} intensity={3} distance={5} />
            )}

            {/* Rear Lights (Generic) */}
            <mesh position={[-0.4, 0.3, 1.4]}>
                <boxGeometry args={[0.2, 0.1, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0.4, 0.3, 1.4]}>
                <boxGeometry args={[0.2, 0.1, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>

            {/* Headlights (Generic if not Cyber) */}
            {type !== 'cyber' && (
                <>
                    <mesh position={[-0.4, 0.3, -1.3]}>
                        <boxGeometry args={[0.2, 0.1, 0.1]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
                    </mesh>
                    <mesh position={[0.4, 0.3, -1.3]}>
                        <boxGeometry args={[0.2, 0.1, 0.1]} />
                        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
                    </mesh>
                </>
            )}

            {/* Forward Beams */}
            <spotLight
                position={[0, 0.5, -1.2]}
                angle={0.6}
                penumbra={0.4}
                intensity={8}
                distance={25}
                color="#fff"
                target-position={[0, 0, -20]}
            />

            {/* Wheels - Individual with proper rotation */}
            <Wheel position={[0.65, 0.22, 0.9]} side="right" isMoving={isMoving} />
            <Wheel position={[-0.65, 0.22, 0.9]} side="left" isMoving={isMoving} />
            <Wheel position={[0.65, 0.22, -0.9]} side="right" isMoving={isMoving} />
            <Wheel position={[-0.65, 0.22, -0.9]} side="left" isMoving={isMoving} />
        </group>
    );
}

function Wheel({ position, side, isMoving }: { position: [number, number, number]; side: 'left' | 'right'; isMoving: boolean }) {
    const wheelRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (wheelRef.current && isMoving) {
            // Rotate on X axis for forward roll - only when moving
            wheelRef.current.rotation.x -= delta * 25;
        }
    });

    return (
        <group ref={wheelRef} position={position}>
            {/* Tire */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.28, 0.28, 0.22, 24]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>

            {/* Tire Tread (Ring around tire) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.28, 0.03, 8, 24]} />
                <meshStandardMaterial color="#111111" roughness={1} />
            </mesh>

            {/* Rim - Outer facing */}
            <mesh position={[side === 'right' ? 0.12 : -0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
                <meshStandardMaterial color="#888888" metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Rim Center Cap */}
            <mesh position={[side === 'right' ? 0.13 : -0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
                <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Rim Spokes */}
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh
                    key={i}
                    position={[side === 'right' ? 0.11 : -0.11, 0, 0]}
                    rotation={[i * (Math.PI / 2.5), 0, Math.PI / 2]}
                >
                    <boxGeometry args={[0.02, 0.25, 0.015]} />
                    <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
                </mesh>
            ))}
        </group>
    );
}

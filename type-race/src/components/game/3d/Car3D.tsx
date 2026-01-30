import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Car3DProps {
    color: string;
    type?: 'starter' | 'speedster' | 'muscle' | 'cyber' | 'hyper' | 'legend';
    lane: number;
    progress: number;
    isMyCar?: boolean;
}

export default function Car3D({ color, lane, type = 'starter', isMyCar }: Car3DProps) {
    const group = useRef<THREE.Group>(null);
    const wheels = useRef<THREE.Group>(null);

    const xPos = lane * 2.5;

    useFrame((state, delta) => {
        if (!group.current) return;

        // Bobbing effect
        group.current.position.y = Math.sin(state.clock.getElapsedTime() * 15) * 0.015 + 0.35;

        // Spin wheels
        if (wheels.current) {
            wheels.current.rotation.x -= delta * 20;
        }
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

            {/* Wheels Group - Adjust position based on car length */}
            <group ref={wheels}>
                <Wheel position={[0.6, 0.25, 0.9]} />
                <Wheel position={[-0.6, 0.25, 0.9]} />
                <Wheel position={[0.6, 0.25, -0.9]} />
                <Wheel position={[-0.6, 0.25, -0.9]} />
            </group>
        </group>
    );
}

function Wheel({ position }: { position: [number, number, number] }) {
    return (
        <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
            {/* Rim */}
            <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
                <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
            </mesh>
        </mesh>
    );
}

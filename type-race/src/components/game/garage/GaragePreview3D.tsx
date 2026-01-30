import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Car3D from '../3d/Car3D';
import { CarModel } from '@/lib/cars';
import * as THREE from 'three';

interface GaragePreview3DProps {
    car: CarModel;
}

function SpinningCar({ car }: { car: CarModel }) {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Slow spin
            group.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={group}>
            <Car3D
                color={car.color}
                type={car.type}
                lane={0}
                isMoving={false}
                isMyCar={true} // Triggers underglow
            />
        </group>
    );
}

export default function GaragePreview3D({ car }: GaragePreview3DProps) {
    return (
        <div className="w-full h-full relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />

                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, 0, -10]} intensity={0.5} color="#ff00ff" />

                    {/* The Car */}
                    <SpinningCar car={car} />

                    {/* Floor Reflection */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial
                            color="#111"
                            roughness={0.1}
                            metalness={0.8}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>

                    {/* Neon Grid Floor */}
                    <gridHelper args={[20, 20, 0xff00ff, 0x111111]} position={[0, 0, 0]} />

                    <Environment preset="city" />
                </Suspense>

                {/* Post Processing for Glow */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                </EffectComposer>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.5}
                    autoRotate={false}
                />
            </Canvas>
        </div>
    );
}

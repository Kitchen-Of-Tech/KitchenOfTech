"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, Html } from "@react-three/drei";
import * as THREE from "three";

// Service icons that float around the laptop
const services: Array<{ name: string; position: [number, number, number]; color: string }> = [
  { name: "Web Dev", position: [-1.8, 0.8, 0.5], color: "#3b82f6" },
  { name: "Mobile", position: [1.8, 0.8, 0.5], color: "#8b5cf6" },
  { name: "UI/UX", position: [0, 1.5, -0.5], color: "#06b6d4" },
  { name: "AI/ML", position: [-1.5, -0.5, 1], color: "#a855f7" },
  { name: "Cloud", position: [1.5, -0.5, 1], color: "#3b82f6" },
  { name: "Marketing", position: [0, -0.8, 0.2], color: "#8b5cf6" },
];

// Custom optimized laptop using basic geometries
function Laptop() {
  const laptopRef = useRef<THREE.Group>(null);
  
  // Create materials once
  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ 
      color: "#1a1a1a",
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 0.5
    }),
    screen: new THREE.MeshStandardMaterial({ 
      color: "#0a0a0a",
      metalness: 0.1,
      roughness: 0.1,
      emissive: "#050505",
      emissiveIntensity: 0.2
    }),
    keyboard: new THREE.MeshStandardMaterial({ 
      color: "#0a0a0a",
      metalness: 0.3,
      roughness: 0.8
    }),
    accent: new THREE.MeshStandardMaterial({ 
      color: "#8b5cf6",
      metalness: 0.8,
      roughness: 0.2,
      emissive: "#8b5cf6",
      emissiveIntensity: 0.5
    })
  }), []);

  useFrame((state) => {
    if (laptopRef.current) {
      // Gentle rotation
      laptopRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      // Subtle floating
      laptopRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <group ref={laptopRef} position={[0, 0, 0]} rotation={[-0.1, 0, 0]}>
      {/* Laptop Base (Bottom) */}
      <mesh position={[0, -0.05, 0]} material={materials.body}>
        <boxGeometry args={[2.2, 0.1, 1.5]} />
      </mesh>
      
      {/* Keyboard Area */}
      <mesh position={[0, 0.01, 0]} material={materials.keyboard}>
        <boxGeometry args={[2, 0.02, 1.3]} />
      </mesh>
      
      {/* Trackpad */}
      <mesh position={[0, 0.03, 0.4]} material={materials.body}>
        <boxGeometry args={[0.8, 0.01, 0.5]} />
      </mesh>
      
      {/* Screen Back (Lid) */}
      <group position={[0, 0.85, -0.72]} rotation={[-0.2, 0, 0]}>
        <mesh material={materials.body}>
          <boxGeometry args={[2.2, 1.5, 0.08]} />
        </mesh>
        
        {/* Screen Display - Dark Background */}
        <mesh position={[0, 0, 0.045]} material={materials.screen}>
          <boxGeometry args={[2, 1.3, 0.02]} />
        </mesh>
        
        {/* Logo on Screen as a plane with texture */}
        <mesh position={[0, 0, 0.07]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.9]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            transparent
            opacity={0.9}
          >
            <primitive 
              attach="map" 
              object={(() => {
                const loader = new THREE.TextureLoader();
                const texture = loader.load('/logo.svg');
                texture.needsUpdate = true;
                return texture;
              })()}
            />
          </meshStandardMaterial>
        </mesh>
        
        {/* Screen Glow Effect - Subtle */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.95, 1.25, 0.01]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            transparent
            opacity={0.2}
          />
        </mesh>
        
        {/* Camera notch */}
        <mesh position={[0, 0.7, 0.05]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>
      
      {/* Purple Accent Line */}
      <mesh position={[0, 0.02, -0.73]} material={materials.accent}>
        <boxGeometry args={[2.2, 0.02, 0.02]} />
      </mesh>
      
      {/* Logo Badge */}
      <mesh position={[0, 0.015, -0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function FloatingService({ name, position, color }: { name: string; position: [number, number, number]; color: string }) {
  return (
    <Float
      speed={0.8}
      rotationIntensity={0.1}
      floatIntensity={0.4}
      floatingRange={[-0.15, 0.15]}
    >
      <group position={position}>
        {/* Service Name as HTML - Optimized */}
        <Html
          position={[0, 0, 0]}
          center
          distanceFactor={2.5}
          occlude
          zIndexRange={[0, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textShadow: `0 2px 20px ${color}, 0 0 40px ${color}90, 0 0 8px rgba(0,0,0,1)`,
              background: `linear-gradient(135deg, ${color}60, ${color}40)`,
              padding: '12px 24px',
              borderRadius: '25px',
              backdropFilter: 'blur(12px)',
              border: `2px solid ${color}`,
              boxShadow: `0 6px 30px ${color}50, 0 0 20px ${color}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
              letterSpacing: '0.5px',
            }}
          >
            {name}
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={45} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
        target={[0, 0.3, 0]}
        makeDefault
      />

      {/* Optimized Lighting Setup */}
      <ambientLight intensity={1.5} color="#ffffff" />
      
      {/* Main key light */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2} 
        color="#ffffff"
      />
      
      {/* Purple backlight glow */}
      <pointLight 
        position={[0, 0.5, -3]} 
        intensity={8} 
        color="#8b5cf6"
        distance={8}
        decay={2}
      />
      
      {/* Additional purple accent lights */}
      <pointLight 
        position={[-2, 0.8, -2]} 
        intensity={4} 
        color="#a855f7"
        distance={6}
        decay={2}
      />
      <pointLight 
        position={[2, 0.8, -2]} 
        intensity={4} 
        color="#7c3aed"
        distance={6}
        decay={2}
      />
      
      {/* Fill light from front */}
      <pointLight 
        position={[0, -1, 3]} 
        intensity={2} 
        color="#3b82f6"
        distance={8}
        decay={2}
      />

      {/* Custom 3D Laptop */}
      <Laptop />

      {/* Floating Services */}
      {services.map((service) => (
        <FloatingService
          key={service.name}
          name={service.name}
          position={service.position}
          color={service.color}
        />
      ))}
    </>
  );
}

export function Laptop3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows={false}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
        dpr={[1, 2]}
        frameloop="always"
        performance={{ min: 0.5 }}
        className="!h-full !w-full"
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

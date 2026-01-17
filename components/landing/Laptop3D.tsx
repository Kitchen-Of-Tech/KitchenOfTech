"use client";

import { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, Html } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";

// Service icons that float around the laptop - Adjusted positions for smaller laptop
const services: Array<{ name: string; position: [number, number, number]; color: string }> = [
  { name: "Web Dev", position: [-1.2, 0.6, 0.3], color: "#3b82f6" },
  { name: "Mobile", position: [1.2, 0.6, 0.3], color: "#8b5cf6" },
  { name: "UI/UX", position: [0, 1.2, -0.3], color: "#06b6d4" },
  { name: "AI/ML", position: [-1, -0.3, 0.8], color: "#a855f7" },
  { name: "Cloud", position: [1, -0.3, 0.8], color: "#3b82f6" },
  { name: "Marketing", position: [0, -0.6, 0], color: "#8b5cf6" },
];

function Laptop() {
  const laptopRef = useRef<THREE.Group>(null);
  
  // Load the laptop materials (MTL) first, then the OBJ model
  const materials = useLoader(MTLLoader, '/models/obj/laptop.mtl');
  const obj = useLoader(OBJLoader, '/models/obj/laptop.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  useFrame((state) => {
    if (laptopRef.current) {
      laptopRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      laptopRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Setup the model with optimizations
  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          
          // Disable shadows for performance
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          
          // Optimize material
          if (mesh.material) {
            const material = mesh.material as THREE.Material;
            material.needsUpdate = false;
          }
          
          // Frustum culling optimization
          mesh.frustumCulled = true;
        }
      });

      // Center the model
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
    }
  }, [obj]);

  return (
    <group ref={laptopRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[0.0375, 0.0375, 0.0375]}>
      <primitive object={obj} />
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
      <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={45} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 0, 0]}
        makeDefault
      />

      {/* Optimized Lighting - Reduced lights for performance */}
      <ambientLight intensity={2.5} color="#ffffff" />
      
      {/* Single key light */}
      <directionalLight 
        position={[5, 8, 8]} 
        intensity={2.5} 
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Strong Purple Light Source Behind Laptop */}
      <pointLight 
        position={[0, 0, -2.5]} 
        intensity={5} 
        color="#9333ea"
        distance={10}
      />
      <spotLight
        position={[0, 1, -3]}
        angle={0.8}
        penumbra={0.5}
        intensity={4}
        color="#a855f7"
        distance={12}
        target-position={[0, 0, 0]}
      />
      
      {/* Additional purple glow accents */}
      <pointLight 
        position={[-0.8, 0.3, -2]} 
        intensity={3} 
        color="#8b5cf6"
        distance={7}
      />
      <pointLight 
        position={[0.8, -0.3, -2]} 
        intensity={3} 
        color="#7c3aed"
        distance={7}
      />

      {/* 3D Laptop */}
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
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 1.5]}
        frameloop="demand"
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

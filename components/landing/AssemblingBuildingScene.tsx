'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type PieceSpec = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  delay: number;
  opacity: number;
  from: [number, number, number];
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  castShadow?: boolean;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function AnimatedPiece({ spec }: { spec: PieceSpec }) {
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const cycle = (clock.elapsedTime % 14.5) / 14.5;
    const build = cycle < 0.84 ? cycle / 0.84 : 1;
    const reveal = smoothstep(spec.delay, Math.min(spec.delay + 0.075, 1), build);
    const pulse = Math.sin((clock.elapsedTime + spec.delay * 9) * 1.45) * 0.01;

    mesh.position.set(
      spec.position[0] + spec.from[0] * (1 - reveal),
      spec.position[1] + spec.from[1] * (1 - reveal) + pulse,
      spec.position[2] + spec.from[2] * (1 - reveal)
    );
    mesh.scale.set(
      spec.scale[0] * (0.82 + reveal * 0.18),
      spec.scale[1] * Math.max(0.001, reveal),
      spec.scale[2] * (0.82 + reveal * 0.18)
    );
    material.opacity = reveal * spec.opacity;
    material.emissiveIntensity = reveal * (spec.emissiveIntensity ?? 0);
  });

  return (
    <mesh ref={ref} castShadow={spec.castShadow ?? true} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color={spec.color}
        emissive={spec.emissive ?? '#000000'}
        transparent
        opacity={0}
        roughness={spec.roughness ?? 0.28}
        metalness={spec.metalness ?? 0.22}
      />
    </mesh>
  );
}

function ConstructionCrane() {
  const hook = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const cycle = (clock.elapsedTime % 14.5) / 14.5;
    const lift = Math.sin(cycle * Math.PI * 2) * 0.28;
    if (hook.current) {
      hook.current.position.set(-0.28 + Math.sin(clock.elapsedTime * 0.32) * 0.18, 1.26 + lift, -0.05);
    }
    if (cable.current) {
      cable.current.scale.y = 1.18 - lift * 0.38;
      cable.current.position.y = 1.82 + lift * 0.12;
    }
  });

  const steel = new THREE.Color('#FFB238');

  return (
    <group position={[-1.72, 0.02, 0.12]} rotation={[0, 0.07, 0]}>
      <mesh castShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[0.055, 2.55, 0.055]} />
        <meshStandardMaterial color={steel} roughness={0.36} metalness={0.38} />
      </mesh>
      <mesh castShadow position={[0.58, 2.47, 0]}>
        <boxGeometry args={[1.86, 0.045, 0.045]} />
        <meshStandardMaterial color={steel} roughness={0.34} metalness={0.42} />
      </mesh>
      <mesh castShadow position={[-0.35, 2.43, 0]}>
        <boxGeometry args={[0.62, 0.04, 0.04]} />
        <meshStandardMaterial color="#C99A35" roughness={0.42} metalness={0.34} />
      </mesh>
      <mesh castShadow position={[0.07, 2.32, 0]}>
        <boxGeometry args={[0.18, 0.11, 0.14]} />
        <meshStandardMaterial color="#F2C15D" roughness={0.32} metalness={0.36} />
      </mesh>
      <mesh ref={cable} castShadow position={[0.62, 1.86, -0.02]}>
        <boxGeometry args={[0.012, 1.18, 0.012]} />
        <meshStandardMaterial color="#D9E4E8" roughness={0.18} metalness={0.68} />
      </mesh>
      <group ref={hook}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.08, 0.12]} />
          <meshStandardMaterial color="#E7F5F8" roughness={0.26} metalness={0.42} />
        </mesh>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.05, 0.14, 0.05]} />
          <meshStandardMaterial color="#E7F5F8" roughness={0.26} metalness={0.42} />
        </mesh>
      </group>
    </group>
  );
}

function ConstructionDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(130 * 3);
    for (let i = 0; i < 130; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 3.7;
      data[i * 3 + 1] = Math.random() * 3.8 - 0.65;
      data[i * 3 + 2] = (Math.random() - 0.5) * 2.3;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.08;
    pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#FFD28A" transparent opacity={0.42} sizeAttenuation />
    </points>
  );
}

function CitySilhouette() {
  return (
    <group position={[2.9, -1.18, -1.7]} rotation={[0, -0.18, 0]}>
      {[
        [-1.2, 0.36, 0, 0.28, 0.72],
        [-0.72, 0.56, 0.12, 0.34, 1.12],
        [-0.15, 0.42, -0.02, 0.3, 0.84],
        [0.38, 0.68, 0.08, 0.42, 1.36],
        [1.02, 0.48, 0, 0.36, 0.96],
      ].map(([x, y, z, width, height]) => (
        <mesh key={`${x}-${height}`} position={[x, y, z]}>
          <boxGeometry args={[width, height, 0.22]} />
          <meshStandardMaterial color="#1C140E" transparent opacity={0.68} roughness={0.74} metalness={0.18} />
        </mesh>
      ))}
    </group>
  );
}

function FoundationSite() {
  return (
    <group position={[0.05, -0.24, 0.05]}>
      <mesh receiveShadow rotation={[0, -0.08, 0]}>
        <boxGeometry args={[3.55, 0.12, 2.28]} />
        <meshStandardMaterial color="#3A2114" roughness={0.86} metalness={0.04} />
      </mesh>
      <mesh receiveShadow position={[0, 0.07, 0]} rotation={[0, -0.08, 0]}>
        <boxGeometry args={[2.7, 0.11, 1.65]} />
        <meshStandardMaterial color="#74624E" roughness={0.72} metalness={0.1} />
      </mesh>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
        <mesh key={`rebar-x-${x}`} castShadow position={[x, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 1.66, 10]} />
          <meshStandardMaterial color="#5A392B" roughness={0.45} metalness={0.56} />
        </mesh>
      ))}
      {[-0.55, -0.22, 0.12, 0.45].map((z) => (
        <mesh key={`rebar-z-${z}`} castShadow position={[0, 0.18, z]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 2.56, 10]} />
          <meshStandardMaterial color="#6D4634" roughness={0.45} metalness={0.56} />
        </mesh>
      ))}
      <mesh castShadow position={[-1.36, 0.2, 0.88]} rotation={[0, -0.24, 0]}>
        <boxGeometry args={[0.46, 0.24, 0.34]} />
        <meshStandardMaterial color="#D96F20" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[-1.18, 0.43, 0.88]} rotation={[0, -0.24, 0]}>
        <boxGeometry args={[0.18, 0.24, 0.24]} />
        <meshStandardMaterial color="#F3B34F" roughness={0.44} metalness={0.16} />
      </mesh>
    </group>
  );
}

function WarmLightRibbons() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.12;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.42) * 0.04;
  });

  return (
    <group ref={group} position={[0.9, 1.55, 0.15]}>
      {[
        ['#FF7A1A', 0.92, 1.42, 0.25],
        ['#FFD36A', 0.72, 1.18, -0.18],
        ['#57D6C9', 0.56, 0.92, 0.08],
      ].map(([color, radius, height, z], index) => (
        <mesh key={`${color}-${index}`} position={[0, Number(height), Number(z)]} rotation={[Math.PI / 2.16, 0, index * 0.55]}>
          <torusGeometry args={[Number(radius), 0.006, 8, 86, Math.PI * 1.32]} />
          <meshStandardMaterial color={String(color)} emissive={String(color)} emissiveIntensity={0.8} transparent opacity={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function BuildingModel() {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  const specs = useMemo<PieceSpec[]>(() => {
    const pieces: PieceSpec[] = [];
    const floors = 24;

    pieces.push({
      position: [0, -0.12, 0],
      scale: [2.45, 0.2, 1.6],
      color: '#61513F',
      delay: 0,
      opacity: 0.94,
      from: [0, -0.9, 0],
      roughness: 0.66,
      metalness: 0.08,
    });

    for (let floor = 0; floor < floors; floor += 1) {
      const y = floor * 0.155 + 0.02;
      const taper = Math.max(0.76, 1 - floor * 0.007);
      const delay = floor / (floors + 10);
      const side = floor % 2 === 0 ? -1 : 1;

      pieces.push({
        position: [0, y, 0],
        scale: [1.76 * taper, 0.034, 1.12 * taper],
        color: floor % 2 ? '#D8CEC0' : '#F4E9D8',
        delay,
        opacity: 0.86,
        from: [0, -1.15, 0],
        roughness: 0.52,
        metalness: 0.12,
      });

      pieces.push({
        position: [-0.34, y + 0.065, 0.06],
        scale: [0.38 * taper, 0.135, 0.42 * taper],
        color: '#BBA88F',
        delay: delay + 0.018,
        opacity: 0.82,
        from: [0, -0.95, 0],
        roughness: 0.55,
        metalness: 0.08,
      });

      pieces.push({
        position: [0, y + 0.078, -0.59 * taper],
        scale: [1.58 * taper, 0.102, 0.018],
        color: '#9ED4E6',
        delay: delay + 0.034,
        opacity: 0.62,
        from: [0, 0.18, -0.7],
        roughness: 0.08,
        metalness: 0.7,
        emissive: '#37B6E4',
        emissiveIntensity: 0.055,
      });

      pieces.push({
        position: [0.89 * taper, y + 0.078, 0],
        scale: [0.018, 0.102, 1.04 * taper],
        color: '#9BE0CD',
        delay: delay + 0.048,
        opacity: 0.56,
        from: [0.65, 0.12, 0],
        roughness: 0.08,
        metalness: 0.62,
        emissive: '#5FF8D1',
        emissiveIntensity: 0.035,
      });

      pieces.push({
        position: [-0.89 * taper, y + 0.078, 0],
        scale: [0.018, 0.102, 1.04 * taper],
        color: '#7EB9EF',
        delay: delay + 0.055,
        opacity: 0.52,
        from: [-0.58, 0.12, 0],
        roughness: 0.08,
        metalness: 0.62,
        emissive: '#55A9FF',
        emissiveIntensity: 0.025,
      });

      for (const x of [-0.78 * taper, 0.78 * taper]) {
        for (const z of [-0.48 * taper, 0.48 * taper]) {
          pieces.push({
            position: [x, y + 0.077, z],
            scale: [0.035, 0.15, 0.035],
            color: '#F6EEE0',
            delay: delay + 0.025,
            opacity: 0.72,
            from: [side * 0.25, -0.85, 0],
            roughness: 0.24,
            metalness: 0.5,
          });
        }
      }

      if (floor % 4 === 0) {
        pieces.push({
          position: [0.16, y + 0.096, 0.61 * taper],
          scale: [1.22 * taper, 0.038, 0.045],
          color: '#FFE2A9',
          delay: delay + 0.065,
          opacity: 0.62,
          from: [0, 0.22, 0.45],
          roughness: 0.12,
          metalness: 0.46,
          emissive: '#FF9F2E',
          emissiveIntensity: 0.08,
        });
      }

      if (floor % 6 === 2) {
        pieces.push({
          position: [0.76 * taper, y + 0.116, -0.18],
          scale: [0.035, 0.115, 0.42 * taper],
          color: '#FF814A',
          delay: delay + 0.07,
          opacity: 0.58,
          from: [0.42, 0.2, -0.18],
          roughness: 0.12,
          metalness: 0.44,
          emissive: '#FF5C1B',
          emissiveIntensity: 0.12,
        });
      }

      if (floor % 7 === 3) {
        pieces.push({
          position: [-0.72 * taper, y + 0.112, 0.24],
          scale: [0.035, 0.105, 0.34 * taper],
          color: '#F9C35B',
          delay: delay + 0.074,
          opacity: 0.52,
          from: [-0.36, 0.22, 0.12],
          roughness: 0.18,
          metalness: 0.38,
          emissive: '#FFB000',
          emissiveIntensity: 0.07,
        });
      }
    }

    pieces.push({
      position: [0, floors * 0.155 + 0.05, 0],
      scale: [1.18, 0.17, 0.76],
      color: '#F3DFC3',
      delay: 0.76,
      opacity: 0.84,
      from: [0.25, 0.8, -0.4],
      roughness: 0.28,
      metalness: 0.18,
    });

    pieces.push({
      position: [0.44, floors * 0.155 + 0.22, -0.08],
      scale: [0.42, 0.16, 0.42],
      color: '#A8DDEB',
      delay: 0.81,
      opacity: 0.68,
      from: [0.58, 0.65, -0.35],
      roughness: 0.08,
      metalness: 0.66,
      emissive: '#87F7FF',
      emissiveIntensity: 0.06,
    });

    return pieces;
  }, []);

  useFrame(({ clock, camera }) => {
    const elapsed = clock.elapsedTime;
    const scale = isMobile ? 1.12 : 1.68;
    const baseX = isMobile ? -0.32 : 2.42;
    const baseY = isMobile ? -1.96 : -0.76;

    if (group.current) {
      group.current.position.set(baseX, baseY + Math.sin(elapsed * 0.48) * 0.018, 0);
      group.current.rotation.y = (isMobile ? -0.46 : -0.62) + Math.sin(elapsed * 0.13) * 0.1;
      group.current.scale.setScalar(scale);
    }

    camera.position.x = (isMobile ? 5.6 : 5.45) + Math.sin(elapsed * 0.1) * 0.4;
    camera.position.y = isMobile ? 3.65 : 4.08;
    camera.position.z = (isMobile ? 7.1 : 6.45) + Math.cos(elapsed * 0.1) * 0.34;
    camera.lookAt(isMobile ? 0.1 : 1.08, isMobile ? 1.08 : 1.5, 0);
  });

  return (
    <group ref={group}>
      <FoundationSite />
      <ConstructionCrane />
      <ConstructionDust />
      <WarmLightRibbons />

      {specs.map((spec, index) => (
        <AnimatedPiece key={`${index}-${spec.position.join('-')}`} spec={spec} />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#160D08']} />
      <fog attach="fog" args={['#160D08', 8, 19]} />
      <ambientLight intensity={1.12} />
      <hemisphereLight color="#FFE2A8" groundColor="#2C160B" intensity={0.92} />
      <directionalLight position={[4, 8, 5]} intensity={3.45} castShadow />
      <spotLight position={[0.8, 6, 3.6]} angle={0.42} penumbra={0.6} intensity={4.6} color="#FFF2DC" castShadow />
      <pointLight position={[-4, 3, 2]} intensity={5.8} color="#FF8A1C" />
      <pointLight position={[4, 4.6, -2]} intensity={4.2} color="#62D9D4" />
      <pointLight position={[1.8, 2.6, 2.2]} intensity={3.8} color="#FFD36A" />
      <pointLight position={[-2.4, 1.4, -1.3]} intensity={2.2} color="#8DFFCF" />
      <CitySilhouette />
      <BuildingModel />
      <mesh position={[0, -1.36, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#21120A" roughness={0.82} metalness={0.12} />
      </mesh>
    </>
  );
}

export function AssemblingBuildingScene() {
  return (
    <div className="absolute inset-0 z-0 bg-[#160d08]">
      <Canvas
        shadows
        dpr={[1, 1.7]}
        camera={{ position: [5.2, 4, 6.4], fov: 40, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false }}
        className="h-full w-full"
      >
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(255,123,26,0.16)_0%,transparent_36%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen bg-[linear-gradient(115deg,rgba(255,114,24,0.24)_0%,rgba(255,211,106,0.16)_38%,rgba(87,214,201,0.12)_70%,rgba(0,0,0,0)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.7px,transparent_0.7px)] [background-size:4px_4px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.25)_43%,rgba(0,0,0,0)_100%)]" />
    </div>
  );
}

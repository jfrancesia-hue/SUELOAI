'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Sparkles as DreiSparkles } from '@react-three/drei';
import { Building2, CircleDollarSign, MapPin, Play, ShieldCheck, TrendingUp } from 'lucide-react';
import type { Group } from 'three';
import { AdditiveBlending } from 'three';

type Point3 = [number, number, number];

const cities = [
  { name: 'Asunción', country: 'PY', position: [0.18, 0.15, 0.18], color: '#10B981' },
  { name: 'Buenos Aires', country: 'AR', position: [0.34, -0.72, 0.12], color: '#06B6D4' },
  { name: 'Montevideo', country: 'UY', position: [0.52, -0.65, 0.16], color: '#F5C542' },
  { name: 'Santa Cruz', country: 'BO', position: [-0.22, 0.02, 0.12], color: '#8B5CF6' },
] satisfies { name: string; country: string; position: Point3; color: string }[];

const latamPoints: Point3[] = [
  [-0.58, 1.25, 0], [-0.36, 1.1, 0], [-0.2, 0.94, 0], [-0.08, 0.74, 0],
  [-0.16, 0.52, 0], [-0.04, 0.34, 0], [0.18, 0.18, 0], [0.36, -0.02, 0],
  [0.48, -0.28, 0], [0.42, -0.55, 0], [0.24, -0.86, 0], [0.08, -1.12, 0],
  [-0.02, -1.38, 0], [-0.12, -1.62, 0], [-0.24, -1.84, 0], [-0.34, -1.58, 0],
  [-0.34, -1.22, 0], [-0.42, -0.82, 0], [-0.54, -0.44, 0], [-0.44, -0.12, 0],
  [-0.62, 0.18, 0], [-0.72, 0.48, 0], [-0.68, 0.78, 0], [-0.58, 1.25, 0],
];

const assetCards = [
  {
    title: 'Torre Asunción',
    city: 'Asunción, PY',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=82&auto=format&fit=crop',
    score: 'A+',
    metric: '14.2%',
    position: 'right-5 top-5',
    className: 'rotate-[2deg]',
  },
  {
    title: 'Renta Córdoba',
    city: 'Córdoba, AR',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=82&auto=format&fit=crop',
    score: 'A',
    metric: 'USD 100',
    position: 'left-5 bottom-[92px]',
    className: '-rotate-[2deg]',
  },
];

function LatamShape() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.16 - 0.18;
    groupRef.current.rotation.x = -0.18 + Math.sin(clock.elapsedTime * 0.18) * 0.035;
  });

  const tokenPositions = useMemo(
    () => [
      [-0.65, 0.8, 0.34],
      [0.48, -0.18, 0.38],
      [-0.12, -1.32, 0.32],
    ],
    []
  );

  return (
    <group ref={groupRef} scale={1.34} position={[0, -0.02, 0]}>
      <Line points={latamPoints} color="#2DD4BF" lineWidth={1.4} transparent opacity={0.68} />
      <Line points={latamPoints.map(([x, y, z]) => [x * 0.93, y * 0.93, z - 0.03] as Point3)} color="#8B5CF6" lineWidth={0.75} transparent opacity={0.28} />

      {latamPoints.slice(0, -1).map(([x, y, z], index) => (
        <mesh key={`${x}-${y}-${index}`} position={[x, y, z + 0.02]}>
          <sphereGeometry args={[index % 4 === 0 ? 0.022 : 0.014, 12, 12]} />
          <meshStandardMaterial color={index % 3 === 0 ? '#10B981' : '#06B6D4'} emissive={index % 3 === 0 ? '#10B981' : '#06B6D4'} emissiveIntensity={0.8} roughness={0.35} />
        </mesh>
      ))}

      {cities.map((city, index) => (
        <group key={city.name} position={city.position}>
          <Float speed={1.2 + index * 0.12} rotationIntensity={0.08} floatIntensity={0.16}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.045, 0.42 + index * 0.06, 6]} />
              <meshStandardMaterial color={city.color} emissive={city.color} emissiveIntensity={0.5} metalness={0.3} roughness={0.28} />
            </mesh>
            <mesh position={[0.08, -0.08, 0]}>
              <boxGeometry args={[0.07, 0.26, 0.07]} />
              <meshStandardMaterial color="#F8FAFC" emissive="#06B6D4" emissiveIntensity={0.13} roughness={0.4} />
            </mesh>
          </Float>
          <mesh>
            <sphereGeometry args={[0.055, 18, 18]} />
            <meshBasicMaterial color={city.color} transparent opacity={0.85} blending={AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {cities.slice(1).map((city) => (
        <Line
          key={`flow-${city.name}`}
          points={[cities[0].position, city.position]}
          color={city.color}
          lineWidth={1.1}
          transparent
          opacity={0.42}
        />
      ))}

      {tokenPositions.map(([x, y, z], index) => (
        <Float key={`${x}-${y}`} speed={1.6} rotationIntensity={0.7} floatIntensity={0.25}>
          <mesh position={[x, y, z]}>
            <torusGeometry args={[0.08, 0.012, 12, 32]} />
            <meshStandardMaterial color={index === 2 ? '#F5C542' : '#10B981'} emissive={index === 2 ? '#F5C542' : '#10B981'} emissiveIntensity={0.65} metalness={0.65} roughness={0.18} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0.2, 4.2], fov: 40 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.65} />
      <pointLight position={[2.2, 2.6, 3]} intensity={2.8} color="#10B981" />
      <pointLight position={[-2.4, -1.6, 2.5]} intensity={1.7} color="#06B6D4" />
      <DreiSparkles count={42} scale={[4.8, 3.2, 1.6]} size={1.4} speed={0.25} color="#F8FAFC" opacity={0.42} />
      <LatamShape />
    </Canvas>
  );
}

function FallbackMap() {
  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F]/70">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_72%_62%,rgba(6,182,212,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
      <div className="absolute inset-8 rounded-full border border-emerald-300/20" />
      {cities.map((city, index) => (
        <div
          key={city.name}
          className="absolute rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-md"
          style={{
            left: `${28 + index * 14}%`,
            top: `${28 + (index % 2) * 30}%`,
          }}
        >
          {city.name}
        </div>
      ))}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
        {assetCards.map((asset) => (
          <div key={asset.title} className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.08] backdrop-blur-xl">
            <div className="relative h-24">
              <Image src={asset.image} alt={asset.title} fill sizes="50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07111F]/80" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-semibold text-white">{asset.title}</p>
              <p className="mt-1 text-[10px] text-white/45">{asset.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: (typeof assetCards)[number] }) {
  return (
    <div
      className={`absolute hidden w-[210px] overflow-hidden rounded-[22px] border border-white/12 bg-[#07111F]/62 shadow-[0_24px_70px_-28px_rgba(0,0,0,1)] backdrop-blur-xl lg:block ${asset.position} ${asset.className}`}
    >
      <div className="relative h-28">
        <Image src={asset.image} alt={asset.title} fill sizes="210px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#07111F]/88" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/22 bg-emerald-300/12 px-2 py-1 text-[10px] font-semibold text-emerald-200 backdrop-blur-md">
          <ShieldCheck className="h-3 w-3" strokeWidth={2} />
          Score {asset.score}
        </div>
      </div>
      <div className="p-3.5">
        <p className="font-display text-base font-bold leading-tight text-white">{asset.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/48">
          <MapPin className="h-3 w-3" strokeWidth={1.8} />
          {asset.city}
        </p>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] text-white/48">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-300" strokeWidth={2} />
            Retorno
          </span>
          <span className="font-mono text-[12px] font-semibold text-emerald-300">{asset.metric}</span>
        </div>
      </div>
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="absolute bottom-5 right-5 hidden w-[250px] overflow-hidden rounded-[24px] border border-white/12 bg-[#07111F]/68 shadow-[0_24px_70px_-30px_rgba(6,182,212,0.9)] backdrop-blur-xl xl:block">
      <div className="relative h-32">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=82&auto=format&fit=crop"
          alt="Video preview de seguimiento de obra"
          fill
          sizes="250px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-[#07111F]/90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/14 backdrop-blur-xl">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" strokeWidth={2} />
          </div>
        </div>
        <div className="absolute left-3 top-3 rounded-lg border border-cyan-300/24 bg-cyan-300/12 px-2 py-1 text-[10px] font-semibold text-cyan-100 backdrop-blur-md">
          Obra en vivo
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-semibold text-white">Seguimiento visual</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/48">
          Cámaras, updates y reportes trimestrales para ver el avance real.
        </p>
      </div>
    </div>
  );
}

export default function LatamInvestmentMap() {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    setUseFallback(reduced || narrow);
  }, []);

  if (useFallback) return <FallbackMap />;

  return (
    <div className="relative h-full min-h-[460px] overflow-hidden rounded-[32px] border border-white/10 bg-[#07111F]/55 shadow-[0_30px_100px_-42px_rgba(16,185,129,0.45)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.2),transparent_32%),radial-gradient(circle_at_78%_60%,rgba(139,92,246,0.16),transparent_36%)]" />
      <Scene />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0)_40%,rgba(7,17,31,0.55)_100%)]" />
      <div className="absolute left-5 top-5 grid gap-2">
        {cities.map((city) => (
          <div
            key={city.name}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#07111F]/55 px-3 py-2 text-xs font-semibold text-white/78 shadow-xl backdrop-blur-xl"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: city.color }} />
            {city.name}
            <span className="font-mono text-white/38">{city.country}</span>
          </div>
        ))}
      </div>
      {assetCards.map((asset) => (
        <AssetCard key={asset.title} asset={asset} />
      ))}
      <VideoPreview />
      <div className="absolute bottom-5 left-5 flex max-w-[360px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70 backdrop-blur-xl">
        <span className="flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4 text-emerald-300" strokeWidth={1.8} />
          Capital real fluyendo entre proyectos LATAM
        </span>
        <span className="font-mono text-emerald-300">LIVE</span>
      </div>
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 translate-y-20 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-[11px] font-semibold text-white/62 backdrop-blur-xl lg:flex">
        <Building2 className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
        Activos reales, no promesas
      </div>
    </div>
  );
}

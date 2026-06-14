import { useRef, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import type { Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Position3D } from '../lib/constellation';

interface ExperimentNodeProps {
  position: Position3D;
  thumbnail: string;
  title: string;
  slug: string;
  baseUrl: string;
}

export function ExperimentNode({
  position,
  thumbnail,
  title,
  slug,
  baseUrl,
}: ExperimentNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const base = baseUrl.replace(/\/$/, '');
  const thumbnailUrl = `${base}/cavalry/${thumbnail}`;

  const texture = useLoader(TextureLoader, thumbnailUrl);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    window.location.href = `${base}/experiments/${slug}`;
  };

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.6, 0.9]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={hovered ? 1 : 0.85}
      />
    </mesh>
  );
}

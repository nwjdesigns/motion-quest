import { useRef, useState, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, Vector3 } from 'three';
import type { Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Position3D } from '../lib/constellation';
import { PixelationMaterial } from './PixelationMaterial';

interface ExperimentNodeProps {
  position: Position3D;
  thumbnail: string;
  title: string;
  slug: string;
  baseUrl: string;
}

const springStiffness = 8;
const springDamping = 5;

export function ExperimentNode({
  position,
  thumbnail,
  title,
  slug,
  baseUrl,
}: ExperimentNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const velocityRef = useRef(new Vector3());
  const [hovered, setHovered] = useState(false);

  const base = baseUrl.replace(/\/$/, '');
  const thumbnailUrl = `${base}/cavalry/${thumbnail}`;

  const texture = useLoader(TextureLoader, thumbnailUrl);

  const material = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uTexture.value = texture;
    if (texture.image) {
      mat.uniforms.uResolution.value.set(texture.image.width, texture.image.height);
    }
    return mat;
  }, [texture]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05);

    const current = meshRef.current.position;
    const target = position;
    const vel = velocityRef.current;

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dz = target.z - current.z;

    vel.x += dx * springStiffness * dt;
    vel.y += dy * springStiffness * dt;
    vel.z += dz * springStiffness * dt;

    vel.x *= Math.exp(-springDamping * dt);
    vel.y *= Math.exp(-springDamping * dt);
    vel.z *= Math.exp(-springDamping * dt);

    current.x += vel.x * dt;
    current.y += vel.y * dt;
    current.z += vel.z * dt;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    window.location.href = `${base}/experiments/${slug}`;
  };

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        material.uniforms.uOpacity.value = 1;
      }}
      onPointerOut={() => {
        setHovered(false);
        material.uniforms.uOpacity.value = 0.85;
      }}
      material={material}
    >
      <planeGeometry args={[1.6, 0.9]} />
    </mesh>
  );
}

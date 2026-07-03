import { useRef, useState, useMemo } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, Vector3 } from 'three';
import type { Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Position3D } from '../lib/constellation';
import { PixelationMaterial } from './PixelationMaterial';
import { serializeCameraState } from '../lib/camera-state';

export const MARQUEE_MIN = -9;
export const MARQUEE_MAX = 9;
const MARQUEE_RANGE = MARQUEE_MAX - MARQUEE_MIN;

function wrapX(x: number): number {
  return ((x - MARQUEE_MIN) % MARQUEE_RANGE + MARQUEE_RANGE) % MARQUEE_RANGE + MARQUEE_MIN;
}

interface ExperimentNodeProps {
  position: Position3D;
  thumbnail: string;
  title: string;
  slug: string;
  baseUrl: string;
  marqueeOffsetRef?: React.RefObject<number>;
  marqueeSpeedFactor?: number;
  marqueePhase?: number;
  index?: number;
  livePositionsRef?: React.RefObject<Float32Array>;
}

const springStiffness = 8;
const springDamping = 5;

// Target area for all nodes regardless of aspect ratio.
const planeArea = 1.6 * 0.9;

export function ExperimentNode({
  position,
  thumbnail,
  title,
  slug,
  baseUrl,
  marqueeOffsetRef,
  marqueeSpeedFactor = 1,
  marqueePhase = 0,
  index = 0,
  livePositionsRef,
}: ExperimentNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const velocityRef = useRef(new Vector3());
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  const base = baseUrl.replace(/\/$/, '');
  const thumbnailUrl = `${base}/cavalry/${thumbnail}`;

  const texture = useLoader(TextureLoader, thumbnailUrl);

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9;
  const planeWidth = Math.sqrt(planeArea * aspect);
  const planeHeight = planeArea / planeWidth;

  const material = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uTexture.value = texture;
    if (texture.image) {
      mat.uniforms.uResolution.value.set(texture.image.width, texture.image.height);
    }
    return mat;
  }, [texture]);

  useFrame(({ camera }, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05);

    const current = meshRef.current.position;
    const vel = velocityRef.current;

    if (marqueeOffsetRef) {
      current.x = wrapX(position.x + marqueePhase + marqueeOffsetRef.current * marqueeSpeedFactor);
    } else {
      const dx = position.x - current.x;
      vel.x += dx * springStiffness * dt;
      vel.x *= Math.exp(-springDamping * dt);
      current.x += vel.x * dt;
    }

    const dy = position.y - current.y;
    const dz = position.z - current.z;
    vel.y += dy * springStiffness * dt;
    vel.z += dz * springStiffness * dt;
    vel.y *= Math.exp(-springDamping * dt);
    vel.z *= Math.exp(-springDamping * dt);
    current.y += vel.y * dt;
    current.z += vel.z * dt;

    meshRef.current.quaternion.copy(camera.quaternion);

    if (livePositionsRef?.current) {
      const off = index * 3;
      livePositionsRef.current[off] = current.x;
      livePositionsRef.current[off + 1] = current.y;
      livePositionsRef.current[off + 2] = current.z;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    sessionStorage.setItem(
      'mq-camera',
      serializeCameraState({
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        target: { x: 0, y: 0, z: 0 },
        zoom: camera.zoom,
      }),
    );

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
      <planeGeometry args={[planeWidth, planeHeight]} />
    </mesh>
  );
}

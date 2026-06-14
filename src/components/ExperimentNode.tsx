import { useRef, useState, useMemo } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, Vector3, Matrix4 } from 'three';
import type { Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Position3D } from '../lib/constellation';
import { PixelationMaterial } from './PixelationMaterial';
import { serializeCameraState } from '../lib/camera-state';
import { projectToScreen } from '../lib/projection';
import type { ScreenRect } from '../lib/morph';

interface ExperimentNodeProps {
  position: Position3D;
  thumbnail: string;
  title: string;
  slug: string;
  baseUrl: string;
  onNavigate?: (slug: string, screenRect: ScreenRect) => void;
}

const springStiffness = 8;
const springDamping = 5;

export function ExperimentNode({
  position,
  thumbnail,
  title,
  slug,
  baseUrl,
  onNavigate,
}: ExperimentNodeProps) {
  const meshRef = useRef<Mesh>(null);
  const velocityRef = useRef(new Vector3());
  const [hovered, setHovered] = useState(false);
  const { camera, size } = useThree();

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

    sessionStorage.setItem(
      'mq-camera',
      serializeCameraState({
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        target: { x: 0, y: 0, z: 0 },
        zoom: camera.zoom,
      }),
    );

    if (onNavigate && meshRef.current) {
      const vpMatrix = new Matrix4()
        .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      const m = vpMatrix.elements;
      const worldPos = meshRef.current.position;

      const center = projectToScreen(
        { x: worldPos.x, y: worldPos.y, z: worldPos.z },
        Array.from(m),
        size.width,
        size.height,
      );

      const halfW = 80;
      const halfH = 45;
      const rect: ScreenRect = {
        x: center.x - halfW,
        y: center.y - halfH,
        width: halfW * 2,
        height: halfH * 2,
      };

      onNavigate(slug, rect);
      return;
    }

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

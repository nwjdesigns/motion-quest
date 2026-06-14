import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Object3D,
  SphereGeometry,
  ShaderMaterial,
  Color,
} from 'three';
import { generateParticles } from '../lib/particles';
import { getThemeColors, type Theme } from '../lib/theme';

const PARTICLE_COUNT = 200;
const DRIFT_SPEED = 0.15;
const SPREAD = 10;

const particleVertexShader = /* glsl */ `
varying vec4 vClipPos;

void main() {
  vec4 instancePos = instanceMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * modelViewMatrix * instancePos;
  vClipPos = clip;
  gl_Position = clip;
}
`;

const particleFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uThreshold;
uniform float uFalloff;
uniform float uBaseOpacity;

varying vec4 vClipPos;

void main() {
  vec2 ndc = vClipPos.xy / vClipPos.w;
  float dist = length(ndc);

  float level = 0.0;
  if (dist > uThreshold && uThreshold < 1.0) {
    float t = clamp((dist - uThreshold) / (1.0 - uThreshold), 0.0, 1.0);
    level = pow(t, 1.0 / uFalloff);
  }

  float opacity = uBaseOpacity * (1.0 - level * 0.7);
  gl_FragColor = vec4(uColor, opacity);
}
`;

interface AmbientParticlesProps {
  theme: Theme;
}

export function AmbientParticles({ theme }: AmbientParticlesProps) {
  const colors = getThemeColors(theme);
  const meshRef = useRef<InstancedMesh>(null);

  const particles = useMemo(() => generateParticles(PARTICLE_COUNT, {
    spread: SPREAD,
    minScale: 0.02,
    maxScale: 0.12,
    seed: 31,
  }), []);

  const driftOffsets = useMemo(() =>
    particles.map(() => ({
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      ampX: 0.3 + Math.random() * 0.7,
      ampY: 0.3 + Math.random() * 0.7,
      ampZ: 0.2 + Math.random() * 0.5,
      freqX: 0.3 + Math.random() * 0.4,
      freqY: 0.2 + Math.random() * 0.3,
      freqZ: 0.15 + Math.random() * 0.25,
    })),
  [particles]);

  const geometry = useMemo(() => new SphereGeometry(1, 6, 6), []);

  const material = useMemo(() => new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(...colors.particleColor) },
      uThreshold: { value: 0.3 },
      uFalloff: { value: 2.0 },
      uBaseOpacity: { value: 0.2 },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
  }), []);

  useEffect(() => {
    material.uniforms.uColor.value.setRGB(...colors.particleColor);
  }, [theme, material]);

  const dummy = useMemo(() => new Object3D(), []);

  useMemo(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * DRIFT_SPEED;

    particles.forEach((p, i) => {
      const d = driftOffsets[i];
      dummy.position.set(
        p.x + Math.sin(t * d.freqX + d.phaseX) * d.ampX,
        p.y + Math.sin(t * d.freqY + d.phaseY) * d.ampY,
        p.z + Math.sin(t * d.freqZ + d.phaseZ) * d.ampZ,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, PARTICLE_COUNT]}
    />
  );
}

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js';

interface OrbitControlsProps {
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  initialTarget?: { x: number; y: number; z: number };
}

export function OrbitControls({
  enablePan = true,
  minDistance = 0,
  maxDistance = Infinity,
  initialTarget,
}: OrbitControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enablePan = enablePan;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    if (initialTarget) {
      controls.target.set(initialTarget.x, initialTarget.y, initialTarget.z);
    }
    controlsRef.current = controls;
    return () => controls.dispose();
  }, [camera, gl, enablePan, minDistance, maxDistance, initialTarget]);

  useFrame(() => controlsRef.current?.update());

  return null;
}

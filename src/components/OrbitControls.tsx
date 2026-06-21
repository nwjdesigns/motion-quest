import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js';

interface OrbitControlsProps {
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  initialTarget?: { x: number; y: number; z: number };
  /** Reports the per-frame azimuthal rotation delta (radians) of the camera. */
  onOrbitDelta?: (deltaRadians: number) => void;
}

export function OrbitControls({
  enablePan = true,
  minDistance = 0,
  maxDistance = Infinity,
  initialTarget,
  onOrbitDelta,
}: OrbitControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<ThreeOrbitControls | null>(null);
  const prevAzimuthRef = useRef<number | null>(null);

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enablePan = enablePan;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    if (initialTarget) {
      controls.target.set(initialTarget.x, initialTarget.y, initialTarget.z);
    }
    controlsRef.current = controls;
    prevAzimuthRef.current = controls.getAzimuthalAngle();
    return () => controls.dispose();
  }, [camera, gl, enablePan, minDistance, maxDistance, initialTarget]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.update();
    if (onOrbitDelta) {
      const azimuth = controls.getAzimuthalAngle();
      const prev = prevAzimuthRef.current;
      if (prev !== null) onOrbitDelta(azimuth - prev);
      prevAzimuthRef.current = azimuth;
    }
  });

  return null;
}

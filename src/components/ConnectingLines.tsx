import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Vector3,
  Raycaster,
  Vector2,
} from 'three';
import { computeProximityGraph, type Point3D } from '../lib/proximity';
import type { Theme } from '../lib/theme';

const ACTIVATION_RADIUS = 5;
const MAX_SEGMENTS = 500;

interface ConnectingLinesProps {
  positions: Point3D[];
  theme: Theme;
}

export function ConnectingLines({ positions, theme }: ConnectingLinesProps) {
  const lineBase = theme === 'dark' ? 0.5 : 0.3;
  const linesRef = useRef<LineSegments>(null);
  const mouseRef = useRef(new Vector2());
  const raycaster = useMemo(() => new Raycaster(), []);
  const worldCursor = useMemo(() => new Vector3(), []);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const posArray = new Float32Array(MAX_SEGMENTS * 6);
    const colorArray = new Float32Array(MAX_SEGMENTS * 6);
    geo.setAttribute('position', new Float32BufferAttribute(posArray, 3));
    geo.setAttribute('color', new Float32BufferAttribute(colorArray, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [],
  );

  useMemo(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;

    raycaster.setFromCamera(mouseRef.current, camera);
    const cursorDir = raycaster.ray.direction;
    const cursorOrigin = raycaster.ray.origin;
    worldCursor.copy(cursorDir).multiplyScalar(12).add(cursorOrigin);

    const graph = computeProximityGraph(
      positions,
      { x: worldCursor.x, y: worldCursor.y, z: worldCursor.z },
      ACTIVATION_RADIUS,
    );

    const posAttr = geometry.getAttribute('position') as Float32BufferAttribute;
    const colorAttr = geometry.getAttribute('color') as Float32BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colorAttr.array as Float32Array;
    let segIdx = 0;

    for (const conn of graph.cursorToThumbnail) {
      if (segIdx >= MAX_SEGMENTS) break;
      const t = positions[conn.index];
      const i = segIdx * 6;
      posArr[i] = worldCursor.x;
      posArr[i + 1] = worldCursor.y;
      posArr[i + 2] = worldCursor.z;
      posArr[i + 3] = t.x;
      posArr[i + 4] = t.y;
      posArr[i + 5] = t.z;
      const brightness = conn.opacity * lineBase;
      colArr[i] = brightness;
      colArr[i + 1] = brightness;
      colArr[i + 2] = brightness;
      colArr[i + 3] = brightness;
      colArr[i + 4] = brightness;
      colArr[i + 5] = brightness;
      segIdx++;
    }

    for (const conn of graph.thumbnailToThumbnail) {
      if (segIdx >= MAX_SEGMENTS) break;
      const a = positions[conn.indexA];
      const b = positions[conn.indexB];
      const i = segIdx * 6;
      posArr[i] = a.x;
      posArr[i + 1] = a.y;
      posArr[i + 2] = a.z;
      posArr[i + 3] = b.x;
      posArr[i + 4] = b.y;
      posArr[i + 5] = b.z;
      const brightness = conn.opacity * (lineBase * 0.6);
      colArr[i] = brightness;
      colArr[i + 1] = brightness;
      colArr[i + 2] = brightness;
      colArr[i + 3] = brightness;
      colArr[i + 4] = brightness;
      colArr[i + 5] = brightness;
      segIdx++;
    }

    geometry.setDrawRange(0, segIdx * 2);
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return <lineSegments ref={linesRef} geometry={geometry} material={material} />;
}

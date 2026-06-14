import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from './OrbitControls';
import {
  computeConstellationLayout,
  type ConstellationInput,
} from '../lib/constellation';
import { computeGridLayout } from '../lib/grid-layout';
import { computeSpiralLayout } from '../lib/spiral-layout';
import { ExperimentNode } from './ExperimentNode';

export type LayoutMode = 'constellation' | 'grid' | 'spiral';

export interface ExperimentData {
  id: string;
  thumbnail: string;
  title: string;
}

interface ConstellationSceneProps {
  experiments: ExperimentData[];
  baseUrl: string;
  layout?: LayoutMode;
}

export default function ConstellationScene({
  experiments,
  baseUrl,
  layout = 'constellation',
}: ConstellationSceneProps) {
  const inputs: ConstellationInput[] = useMemo(
    () => experiments.map((exp, index) => ({ id: exp.id, index })),
    [experiments],
  );

  const positions = useMemo(() => {
    switch (layout) {
      case 'grid':
        return computeGridLayout(inputs);
      case 'spiral':
        return computeSpiralLayout(inputs);
      default:
        return computeConstellationLayout(inputs);
    }
  }, [inputs, layout]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={1} />

        <Suspense fallback={null}>
          {experiments.map((exp, i) => (
            <ExperimentNode
              key={exp.id}
              position={positions[i]}
              thumbnail={exp.thumbnail}
              title={exp.title}
              slug={exp.id}
              baseUrl={baseUrl}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from './OrbitControls';
import {
  computeConstellationLayout,
  type ConstellationInput,
} from '../lib/constellation';
import { ExperimentNode } from './ExperimentNode';

export interface ExperimentData {
  id: string;
  thumbnail: string;
  title: string;
}

interface ConstellationSceneProps {
  experiments: ExperimentData[];
  baseUrl: string;
}

export default function ConstellationScene({
  experiments,
  baseUrl,
}: ConstellationSceneProps) {
  const inputs: ConstellationInput[] = experiments.map((exp, index) => ({
    id: exp.id,
    index,
  }));

  const positions = computeConstellationLayout(inputs);

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

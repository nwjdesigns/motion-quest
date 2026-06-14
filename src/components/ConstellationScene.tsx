import { Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from './OrbitControls';
import { AmbientParticles } from './AmbientParticles';
import { ConnectingLines } from './ConnectingLines';
import {
  computeConstellationLayout,
  type ConstellationInput,
} from '../lib/constellation';
import { computeGridLayout } from '../lib/grid-layout';
import { computeSpiralLayout } from '../lib/spiral-layout';
import { ExperimentNode } from './ExperimentNode';
import { UIPanel, type ExternalLink } from './UIPanel';
import { ThemeProvider, useTheme } from './ThemeContext';
import { resolveInitialTheme, type Theme } from '../lib/theme';

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
  links?: ExternalLink[];
  workWithMeUrl?: string;
}

function SceneBackground() {
  const { colors } = useTheme();
  return <color attach="background" args={[colors.background]} />;
}

function ThemedScene({
  experiments,
  baseUrl,
  initialLayout,
  links,
  workWithMeUrl,
}: {
  experiments: ExperimentData[];
  baseUrl: string;
  initialLayout: LayoutMode;
  links: ExternalLink[];
  workWithMeUrl?: string;
}) {
  const [layout, setLayout] = useState<LayoutMode>(initialLayout);
  const { theme, colors, toggleTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mq-theme', theme);
  }, [theme]);

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
    <div style={{ width: '100vw', height: '100vh', background: colors.background, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneBackground />
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

        <ConnectingLines positions={positions} theme={theme} />
        <AmbientParticles theme={theme} />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={30}
        />
      </Canvas>

      <UIPanel
        layout={layout}
        onLayoutChange={setLayout}
        links={links}
        workWithMeUrl={workWithMeUrl}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    </div>
  );
}

export default function ConstellationScene({
  experiments,
  baseUrl,
  layout: initialLayout = 'constellation',
  links = [],
  workWithMeUrl,
}: ConstellationSceneProps) {
  const initial = useMemo(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('mq-theme') : null;
    const prefersDark = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;
    return resolveInitialTheme(stored, prefersDark);
  }, []);

  return (
    <ThemeProvider initialTheme={initial}>
      <ThemedScene
        experiments={experiments}
        baseUrl={baseUrl}
        initialLayout={initialLayout}
        links={links}
        workWithMeUrl={workWithMeUrl}
      />
    </ThemeProvider>
  );
}

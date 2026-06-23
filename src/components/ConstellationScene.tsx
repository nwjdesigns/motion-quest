import { Suspense, useState, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
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
import { TopBar } from './TopBar';
import { FooterBar } from './FooterBar';
import { ThemeProvider, useTheme } from './ThemeContext';
import { useLayoutShortcuts } from '../hooks/useLayoutShortcuts';
import { useMarkBehaviour } from '../hooks/useMarkBehaviour';
import { HOMEPAGE_SCALE } from '../lib/mark-engine';
import { useEntranceChoreography } from '../hooks/useEntranceChoreography';
import { resolveInitialTheme, type Theme } from '../lib/theme';
import { deserializeCameraState } from '../lib/camera-state';

export type LayoutMode = 'constellation' | 'grid' | 'spiral';

export interface ExperimentData {
  id: string;
  thumbnail: string;
  title: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

interface ConstellationSceneProps {
  experiments: ExperimentData[];
  baseUrl: string;
  layout?: LayoutMode;
  footerLinks?: FooterLink[];
}

function SceneBackground() {
  const { colors } = useTheme();
  return <color attach="background" args={[colors.background]} />;
}

function ThemedScene({
  experiments,
  baseUrl,
  initialLayout,
  footerLinks,
  initialCameraState,
}: {
  experiments: ExperimentData[];
  baseUrl: string;
  initialLayout: LayoutMode;
  footerLinks: FooterLink[];
  initialCameraState: { position: [number, number, number]; target: { x: number; y: number; z: number } } | null;
}) {
  const [layout, setLayout] = useState<LayoutMode>(initialLayout);
  const { theme, colors, toggleTheme } = useTheme();
  const [markHover, setMarkHover] = useState(false);
  useLayoutShortcuts(setLayout);

  // Mark behaviour engine
  const mark = useMarkBehaviour({
    targetScale: HOMEPAGE_SCALE,
    loading: false,
    hover: markHover,
  });

  // Choreographed entrance on initial load
  const entrance = useEntranceChoreography(experiments.length);
  const sceneId =
    experiments.length > 0 ? `node-${experiments.length - 1}` : 'particles';
  const enterStyle = (id: string): CSSProperties => {
    const p = entrance.progressFor(id);
    return {
      opacity: p,
      transform: `translateY(${(1 - p) * 8}px)`,
      transition: 'none',
      willChange: 'opacity, transform',
    };
  };

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

  const cameraPosition: [number, number, number] = initialCameraState?.position ?? [0, 0, 12];

  return (
    <div style={{ width: '100vw', height: '100vh', background: colors.background, position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', opacity: entrance.progressFor(sceneId), willChange: 'opacity' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
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
          initialTarget={initialCameraState?.target}
          onOrbitDelta={mark.setOrbitVelocity}
        />
      </Canvas>
      </div>

      <div style={enterStyle('topbar')}>
        <TopBar
          theme={theme}
          onThemeToggle={toggleTheme}
          markRotation={mark.rotationAngle}
          markScale={mark.scale}
          onMarkHoverChange={setMarkHover}
        />
      </div>
      <div style={enterStyle('footer')}>
        <FooterBar links={footerLinks} />
      </div>
    </div>
  );
}

export default function ConstellationScene({
  experiments,
  baseUrl,
  layout: initialLayout = 'constellation',
  footerLinks = [],
}: ConstellationSceneProps) {
  const initial = useMemo(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('mq-theme') : null;
    const prefersDark = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;
    return resolveInitialTheme(stored, prefersDark);
  }, []);

  const initialCameraState = useMemo(() => {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mq-camera') : null;
    if (!raw) return null;
    const state = deserializeCameraState(raw);
    if (!state) return null;
    return {
      position: [state.position.x, state.position.y, state.position.z] as [number, number, number],
      target: state.target,
    };
  }, []);

  return (
    <ThemeProvider initialTheme={initial}>
      <ThemedScene
        experiments={experiments}
        baseUrl={baseUrl}
        initialLayout={initialLayout}
        footerLinks={footerLinks}
        initialCameraState={initialCameraState}
      />
    </ThemeProvider>
  );
}

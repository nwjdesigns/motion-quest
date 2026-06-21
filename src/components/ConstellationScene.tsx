import { Suspense, useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import type { ScreenRect } from '../lib/morph';
import { centreScreenRect } from '../lib/transition-orchestrator';
import { buildChromeExitStyle } from '../lib/morph-animation';
import { MorphSnapshot } from './MorphSnapshot';

interface ReverseMorphData {
  sourceRect: ScreenRect;
  slug: string;
  timestamp: number;
}

function readReverseMorphData(): ReverseMorphData | null {
  try {
    const raw = sessionStorage.getItem('mq-reverse-morph');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > 5000) {
      sessionStorage.removeItem('mq-reverse-morph');
      return null;
    }
    return data as ReverseMorphData;
  } catch {
    return null;
  }
}

function ReverseMorphOverlay({
  sourceRect,
  targetCentre,
  onComplete,
}: {
  sourceRect: ScreenRect;
  targetCentre: { x: number; y: number };
  onComplete: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    el.style.left = `${sourceRect.x}px`;
    el.style.top = `${sourceRect.y}px`;
    el.style.width = `${sourceRect.width}px`;
    el.style.height = `${sourceRect.height}px`;
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetSize = 160;
        el.style.left = `${targetCentre.x - targetSize / 2}px`;
        el.style.top = `${targetCentre.y - targetSize / 2}px`;
        el.style.width = `${targetSize}px`;
        el.style.height = `${targetSize * (9 / 16)}px`;
        el.style.opacity = '0';
        el.style.transform = 'scale(0.5)';
      });
    });

    const onEnd = () => onComplete();
    el.addEventListener('transitionend', onEnd, { once: true });

    const fallback = setTimeout(onEnd, 500);
    return () => clearTimeout(fallback);
  }, [sourceRect, targetCentre, onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        background: 'var(--mq-bg, #0a0a0a)',
        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '4px',
      }}
    />
  );
}

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
  const [morphState, setMorphState] = useState<{ slug: string; rect: ScreenRect; thumbnailUrl: string } | null>(null);
  const [markHover, setMarkHover] = useState(false);
  const [chromeExiting, setChromeExiting] = useState(false);
  const [reverseMorph, setReverseMorph] = useState<ReverseMorphData | null>(null);
  useLayoutShortcuts(setLayout);

  useEffect(() => {
    const data = readReverseMorphData();
    if (data) {
      sessionStorage.removeItem('mq-reverse-morph');
      setReverseMorph(data);
    }
  }, []);

  // Mark behaviour engine
  const mark = useMarkBehaviour({
    targetScale: HOMEPAGE_SCALE,
    loading: morphState !== null,
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

  const handleNavigate = useCallback((slug: string, rect: ScreenRect | null, thumbnailUrl: string) => {
    mark.triggerNav('forward');
    const resolvedRect = rect ?? centreScreenRect(window.innerWidth, window.innerHeight);
    setMorphState({ slug, rect: resolvedRect, thumbnailUrl });
  }, [mark]);

  const cameraPosition: [number, number, number] = initialCameraState?.position ?? [0, 0, 12];

  const chromeExitStyle = chromeExiting ? buildChromeExitStyle() : undefined;
  const chromeExitStyleFooter = chromeExiting ? { ...buildChromeExitStyle(), transform: 'translateY(8px)' } : undefined;

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
              onNavigate={handleNavigate}
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

      <div style={chromeExitStyle ?? enterStyle('topbar')}>
        <TopBar
          theme={theme}
          onThemeToggle={toggleTheme}
          markRotation={mark.rotationAngle}
          markScale={mark.scale}
          onMarkHoverChange={setMarkHover}
        />
      </div>
      <div style={chromeExitStyleFooter ?? enterStyle('footer')}>
        <FooterBar links={footerLinks} />
      </div>

      {morphState && (
        <MorphSnapshot
          sourceRect={morphState.rect}
          thumbnailUrl={morphState.thumbnailUrl}
          slug={morphState.slug}
          baseUrl={baseUrl}
          onChromeExit={() => setChromeExiting(true)}
        />
      )}

      {reverseMorph && (
        <ReverseMorphOverlay
          sourceRect={reverseMorph.sourceRect}
          targetCentre={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
          onComplete={() => setReverseMorph(null)}
        />
      )}
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

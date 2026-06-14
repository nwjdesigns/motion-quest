import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';
import {
  deriveNames,
  formatDate,
  yamlQuote,
  renderExperimentMarkdown,
  publishScene,
} from '../scripts/publish.mjs';
import { experimentSchema } from '../src/schemas/experiment';

describe('deriveNames', () => {
  test('derives slug, scene file, and thumbnail file from a .cv path', () => {
    expect(deriveNames('/Users/x/scenes/fractal-bloom.cv')).toEqual({
      slug: 'fractal-bloom',
      sceneFile: 'fractal-bloom.cv',
      thumbFile: 'fractal-bloom.png',
    });
  });

  test('strips the directory and keeps only the base name', () => {
    expect(deriveNames('deep/nested/path/foo.cv').slug).toBe('foo');
  });

  test('accepts an uppercase .CV extension', () => {
    expect(deriveNames('BAR.CV')).toEqual({
      slug: 'BAR',
      sceneFile: 'BAR.cv',
      thumbFile: 'BAR.png',
    });
  });

  test('throws when the path is not a .cv file', () => {
    expect(() => deriveNames('something.png')).toThrow();
  });
});

describe('formatDate', () => {
  test('formats a date as YYYY-MM-DD', () => {
    expect(formatDate(new Date(2026, 5, 14))).toBe('2026-06-14');
  });

  test('zero-pads month and day', () => {
    expect(formatDate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('yamlQuote', () => {
  test('wraps a plain string in double quotes', () => {
    expect(yamlQuote('Fractal Bloom')).toBe('"Fractal Bloom"');
  });

  test('escapes embedded double quotes', () => {
    expect(yamlQuote('a "quoted" title')).toBe('"a \\"quoted\\" title"');
  });

  test('escapes backslashes', () => {
    expect(yamlQuote('back\\slash')).toBe('"back\\\\slash"');
  });
});

describe('renderExperimentMarkdown', () => {
  const opts = {
    title: 'Fractal Bloom',
    date: new Date(2026, 5, 14),
    description: 'Recursive branching',
    scene: 'fractal-bloom.cv',
    thumbnail: 'fractal-bloom.png',
  };

  test('produces frontmatter that passes the content collection schema', () => {
    const md = renderExperimentMarkdown(opts);
    const fm = md.split('---')[1];
    const data = yaml.load(fm);
    const result = experimentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('includes the title, scene, and thumbnail values', () => {
    const md = renderExperimentMarkdown(opts);
    expect(md).toContain('title: "Fractal Bloom"');
    expect(md).toContain('scene: "fractal-bloom.cv"');
    expect(md).toContain('thumbnail: "fractal-bloom.png"');
    expect(md).toContain('date: 2026-06-14');
  });

  test('passes schema even with an empty description', () => {
    const md = renderExperimentMarkdown({ ...opts, description: '' });
    const data = yaml.load(md.split('---')[1]);
    expect(experimentSchema.safeParse(data).success).toBe(true);
  });
});

describe('publishScene', () => {
  let root: string;

  function setup() {
    root = mkdtempSync(join(tmpdir(), 'mq-publish-'));
    const srcDir = join(root, 'src');
    mkdirSync(srcDir, { recursive: true });
    const paths = {
      scenesDir: join(root, 'public', 'cavalry', 'scenes'),
      thumbsDir: join(root, 'public', 'cavalry'),
      contentDir: join(root, 'content', 'experiments'),
    };
    return { srcDir, paths };
  }

  afterEach(() => {
    if (root && existsSync(root)) rmSync(root, { recursive: true, force: true });
  });

  test('copies the scene, copies the thumbnail, and writes the markdown', () => {
    const { srcDir, paths } = setup();
    const scenePath = join(srcDir, 'bloom.cv');
    writeFileSync(scenePath, 'SCENE-DATA');
    writeFileSync(join(srcDir, 'bloom.png'), 'PNG-DATA');

    const result = publishScene({
      scenePath,
      title: 'Bloom',
      date: new Date(2026, 5, 14),
      paths,
    });

    expect(existsSync(join(paths.scenesDir, 'bloom.cv'))).toBe(true);
    expect(existsSync(join(paths.thumbsDir, 'bloom.png'))).toBe(true);
    expect(existsSync(join(paths.contentDir, 'bloom.md'))).toBe(true);
    expect(readFileSync(join(paths.scenesDir, 'bloom.cv'), 'utf8')).toBe('SCENE-DATA');
    expect(result.warnings).toHaveLength(0);
  });

  test('the written markdown passes schema validation', () => {
    const { srcDir, paths } = setup();
    const scenePath = join(srcDir, 'bloom.cv');
    writeFileSync(scenePath, 'SCENE');
    writeFileSync(join(srcDir, 'bloom.png'), 'PNG');

    publishScene({ scenePath, title: 'Bloom', date: new Date(2026, 5, 14), paths });

    const md = readFileSync(join(paths.contentDir, 'bloom.md'), 'utf8');
    const data = yaml.load(md.split('---')[1]);
    expect(experimentSchema.safeParse(data).success).toBe(true);
  });

  test('warns but does not throw when the thumbnail is missing', () => {
    const { srcDir, paths } = setup();
    const scenePath = join(srcDir, 'bloom.cv');
    writeFileSync(scenePath, 'SCENE');
    // no bloom.png written

    const result = publishScene({ scenePath, title: 'Bloom', date: new Date(2026, 5, 14), paths });

    expect(existsSync(join(paths.scenesDir, 'bloom.cv'))).toBe(true);
    expect(existsSync(join(paths.contentDir, 'bloom.md'))).toBe(true);
    expect(existsSync(join(paths.thumbsDir, 'bloom.png'))).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('calls the commit hook with created files when commit is requested', () => {
    const { srcDir, paths } = setup();
    const scenePath = join(srcDir, 'bloom.cv');
    writeFileSync(scenePath, 'SCENE');
    writeFileSync(join(srcDir, 'bloom.png'), 'PNG');

    let committed: string[] | null = null;
    publishScene(
      { scenePath, title: 'Bloom', date: new Date(2026, 5, 14), paths, commit: true },
      { commitFiles: (files: string[]) => { committed = files; } },
    );

    expect(committed).not.toBeNull();
    expect(committed!.length).toBe(3);
  });

  test('does not call the commit hook when commit is not requested', () => {
    const { srcDir, paths } = setup();
    const scenePath = join(srcDir, 'bloom.cv');
    writeFileSync(scenePath, 'SCENE');
    writeFileSync(join(srcDir, 'bloom.png'), 'PNG');

    let called = false;
    publishScene(
      { scenePath, title: 'Bloom', date: new Date(2026, 5, 14), paths },
      { commitFiles: () => { called = true; } },
    );

    expect(called).toBe(false);
  });
});

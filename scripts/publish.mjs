#!/usr/bin/env node
// Publishing CLI for Cavalry Lab experiments.
//
// Usage:
//   node scripts/publish.mjs <scene.cv> "<title>" [--description "..."] [--commit]
//
// Copies the scene into public/cavalry/scenes/, the matching <name>.png
// thumbnail into public/cavalry/, and writes a schema-valid markdown entry
// into src/content/experiments/. With --commit, stages and commits the result.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Derive the slug + scene/thumbnail filenames from a `.cv` scene path. */
export function deriveNames(scenePath) {
  const file = basename(scenePath);
  const match = file.match(/^(.*)\.cv$/i);
  if (!match) {
    throw new Error(`Expected a .cv scene file, got: ${scenePath}`);
  }
  const slug = match[1];
  return { slug, sceneFile: `${slug}.cv`, thumbFile: `${slug}.png` };
}

/** Format a Date as YYYY-MM-DD (local calendar date). */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Wrap a string as a YAML double-quoted scalar, escaping `\` and `"`. */
export function yamlQuote(str) {
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Render a content-collection markdown file for an experiment. */
export function renderExperimentMarkdown({ title, date, description = '', scene, thumbnail, body = '' }) {
  const frontmatter = [
    '---',
    `title: ${yamlQuote(title)}`,
    `date: ${formatDate(date)}`,
    `description: ${yamlQuote(description)}`,
    `scene: ${yamlQuote(scene)}`,
    `thumbnail: ${yamlQuote(thumbnail)}`,
    '---',
  ].join('\n');
  return `${frontmatter}\n\n${body}`.trimEnd() + '\n';
}

/**
 * Publish a scene: copy the scene + thumbnail and write the markdown entry.
 * Pure of git; pass `commitFiles` to react to the `commit` flag.
 *
 * @returns {{ slug: string, created: string[], warnings: string[] }}
 */
export function publishScene(
  { scenePath, title, description = '', date = new Date(), paths, commit = false },
  { commitFiles } = {},
) {
  const { slug, sceneFile, thumbFile } = deriveNames(scenePath);
  const created = [];
  const warnings = [];

  if (!existsSync(scenePath)) {
    throw new Error(`Scene file not found: ${scenePath}`);
  }

  mkdirSync(paths.scenesDir, { recursive: true });
  mkdirSync(paths.thumbsDir, { recursive: true });
  mkdirSync(paths.contentDir, { recursive: true });

  const sceneDest = join(paths.scenesDir, sceneFile);
  copyFileSync(scenePath, sceneDest);
  created.push(sceneDest);

  const thumbSrc = join(dirname(scenePath), thumbFile);
  if (existsSync(thumbSrc)) {
    const thumbDest = join(paths.thumbsDir, thumbFile);
    copyFileSync(thumbSrc, thumbDest);
    created.push(thumbDest);
  } else {
    warnings.push(`Thumbnail not found: ${thumbSrc} (skipped). Add ${thumbFile} later.`);
  }

  const mdDest = join(paths.contentDir, `${slug}.md`);
  writeFileSync(
    mdDest,
    renderExperimentMarkdown({ title, date, description, scene: sceneFile, thumbnail: thumbFile }),
  );
  created.push(mdDest);

  if (commit && commitFiles) {
    commitFiles(created);
  }

  return { slug, created, warnings };
}

// --- CLI entry -------------------------------------------------------------

function parseArgs(argv) {
  const positional = [];
  let description = '';
  let commit = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--commit') {
      commit = true;
    } else if (arg === '--description') {
      description = argv[++i] ?? '';
    } else if (arg.startsWith('--description=')) {
      description = arg.slice('--description='.length);
    } else {
      positional.push(arg);
    }
  }

  return { scenePath: positional[0], title: positional[1], description, commit };
}

function gitCommit(repoRoot, files, slug) {
  const rel = files.map((f) => f.replace(`${repoRoot}/`, ''));
  execFileSync('git', ['-C', repoRoot, 'add', ...rel], { stdio: 'inherit' });
  execFileSync('git', ['-C', repoRoot, 'commit', '-m', `Publish experiment: ${slug}`], {
    stdio: 'inherit',
  });
}

function main() {
  const { scenePath, title, description, commit } = parseArgs(process.argv.slice(2));

  if (!scenePath || !title) {
    console.error('Usage: node scripts/publish.mjs <scene.cv> "<title>" [--description "..."] [--commit]');
    process.exit(1);
  }

  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const paths = {
    scenesDir: join(repoRoot, 'public', 'cavalry', 'scenes'),
    thumbsDir: join(repoRoot, 'public', 'cavalry'),
    contentDir: join(repoRoot, 'src', 'content', 'experiments'),
  };

  let result;
  try {
    result = publishScene(
      { scenePath, title, description, paths, commit },
      { commitFiles: (files) => gitCommit(repoRoot, files, deriveNames(scenePath).slug) },
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  for (const w of result.warnings) console.warn(`Warning: ${w}`);
  console.log(`Published "${title}" as ${result.slug}:`);
  for (const f of result.created) console.log(`  + ${f.replace(`${repoRoot}/`, '')}`);
  if (commit) console.log('Committed.');
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main();
}

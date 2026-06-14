import { describe, it, expect } from 'vitest';
import { validateSceneResponse } from '../public/cavalry/scene-loader.js';

// Minimal Response-like stub: only the bits validateSceneResponse reads.
function fakeResponse({
  ok = true,
  status = 200,
  contentType = 'application/octet-stream',
}: {
  ok?: boolean;
  status?: number;
  contentType?: string;
}) {
  return {
    ok,
    status,
    headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? contentType : null) },
  };
}

describe('validateSceneResponse', () => {
  it('accepts a 200 response carrying scene bytes', () => {
    const result = validateSceneResponse(fakeResponse({ ok: true, status: 200 }));
    expect(result.ok).toBe(true);
  });

  it('rejects a 404 and reports the status', () => {
    // The real bug: a missing .cv returns a 404 HTML page that was parsed as a scene.
    const result = validateSceneResponse(fakeResponse({ ok: false, status: 404, contentType: 'text/html' }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain('404');
  });

  it('rejects a 200 that serves an HTML page (SPA / static-host fallback)', () => {
    const result = validateSceneResponse(
      fakeResponse({ ok: true, status: 200, contentType: 'text/html; charset=utf-8' }),
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// Guard the boundary where scene bytes enter the player. A missing .cv file is
// served as a 404 HTML page (and some static hosts serve a 200 HTML fallback);
// feeding that to the WASM parser yields a blank white scene instead of an
// error. Validate the response before treating it as scene data.
export function validateSceneResponse(res) {
  if (!res.ok) {
    return { ok: false, error: `Scene not found (${res.status})` };
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    return { ok: false, error: 'Scene not found' };
  }

  return { ok: true };
}

import { ShaderMaterial, Vector2 } from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec4 vClipPos;

void main() {
  vUv = uv;
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vClipPos = clip;
  gl_Position = clip;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform float uThreshold;
uniform float uFalloff;
uniform float uMaxBlockSize;
uniform float uOpacity;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec4 vClipPos;

void main() {
  vec2 ndc = vClipPos.xy / vClipPos.w;
  float dist = length(ndc);

  float level = 0.0;
  if (dist > uThreshold && uThreshold < 1.0) {
    float t = clamp((dist - uThreshold) / (1.0 - uThreshold), 0.0, 1.0);
    level = pow(t, 1.0 / uFalloff);
  }

  vec2 texCoord = vUv;
  if (level > 0.001) {
    float blockSize = mix(1.0, uMaxBlockSize, level);
    vec2 blocks = uResolution / blockSize;
    texCoord = floor(vUv * blocks + 0.5) / blocks;
  }

  vec4 color = texture2D(uTexture, texCoord);
  gl_FragColor = vec4(color.rgb, color.a * uOpacity);
}
`;

export class PixelationMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTexture: { value: null },
        uThreshold: { value: 0.3 },
        uFalloff: { value: 2.0 },
        uMaxBlockSize: { value: 16.0 },
        uOpacity: { value: 0.85 },
        uResolution: { value: new Vector2(256, 144) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });
  }
}

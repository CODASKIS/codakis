/**
 * Générateur d'avatar style GitHub (identicon).
 * Port TypeScript de https://github.com/rrivera/identicon
 */

const MOVE_UP = 0x80;
const MOVE_DOWN = 0x40;
const MOVE_LEFT = 0x20;
const MOVE_RIGHT = 0x10;
const FILL_POINT = 0x0a;
const MIN_SIZE = 4;

const DEFAULT_NAMESPACE = "codakis";
const DEFAULT_BLOCK_SIZE = 5;
const DEFAULT_DENSITY = 3;

type Point = { x: number; y: number };

type CanvasState = {
  size: number;
  pointsMap: Map<number, Map<number, number>>;
  minY: number;
  maxY: number;
  filledPoints: number;
};

type IdenticonColors = {
  fill: string;
  background: string;
};

export type IdenticonOptions = {
  namespace?: string;
  blockSize?: number;
  density?: number;
  pixels?: number;
};

function sha256(input: string): Uint8Array {
  const data = new TextEncoder().encode(input);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const padded = new Uint8Array(((data.length + 9 + 63) >> 6) << 6);
  padded.set(data);
  padded[data.length] = 0x80;
  const bitLen = data.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen, false);

  for (let offset = 0; offset < padded.length; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i += 1) {
    outView.setUint32(i * 4, H[i], false);
  }
  return out;
}

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return {
    intn(max: number): number {
      if (max <= 0) return 0;
      state = (state * 1664525 + 1013904223) >>> 0;
      return state % max;
    },
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

function hueToRgb(p: number, q: number, t: number): number {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * ((2 / 3 - value) * 6);
  return p;
}

function fillColorFromHash(hashBytes: Uint8Array): string {
  const cb1 = hashBytes[0];
  const cb2 = hashBytes[1];
  let h = (cb1 + cb2) % 360;
  let s = (cb1 % 30) + 60;
  let l = (cb2 % 20) + 40;

  if ((h >= 50 && h <= 85) || (h >= 170 && h <= 190)) {
    s = 80;
    l -= 20;
  } else if (h > 85 && h < 170) {
    l -= 10;
  }

  const [r, g, b] = hslToRgb(h / 360, s / 100, l / 100);
  return `rgb(${r},${g},${b})`;
}

function generatorText(text: string, namespace: string): string {
  return namespace ? `${text}:${namespace}` : text;
}

function getFillValue(control: number): number {
  return control & FILL_POINT ? 1 : 0;
}

function nextPoint(control: number, point: Point, width: number, height: number): Point {
  const next = { ...point };
  if (control & MOVE_UP) next.y -= 1;
  if (control & MOVE_DOWN) next.y += 1;
  if (control & MOVE_LEFT) next.x -= 1;
  if (control & MOVE_RIGHT) next.x += 1;

  const maxX = width - 1;
  const maxY = height - 1;
  if (next.x > maxX) next.x = 0;
  else if (next.x < 0) next.x = maxX;
  if (next.y > maxY) next.y = 0;
  else if (next.y < 0) next.y = maxY;
  return next;
}

function mirrorSymmetric(point: Point, size: number): Point {
  return { x: size - point.x - 1, y: point.y };
}

function drawIdenticon(text: string, namespace: string, size: number, density: number): { canvas: CanvasState; colors: IdenticonColors } {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Text can't be empty");
  }
  if (size < MIN_SIZE) {
    throw new Error(`Size cannot be less than ${MIN_SIZE}`);
  }
  if (density < 1) {
    throw new Error("Density cannot be less than 1");
  }

  let drawableWidth = Math.floor(size / 2);
  if (size % 2 === 1) {
    drawableWidth += 1;
  }

  const hashBytes = sha256(generatorText(trimmed, namespace));
  const hashBytesLen = hashBytes.length;
  const rand = createSeededRandom(size);
  const colors: IdenticonColors = {
    fill: fillColorFromHash(hashBytes),
    background: "rgb(240,240,240)",
  };

  const canvas: CanvasState = {
    size,
    pointsMap: new Map(),
    minY: size,
    maxY: 0,
    filledPoints: 0,
  };

  let i = 0;
  let readBytes = 0;
  let hasCompletedCycle = false;
  let current: Point = { x: 0, y: 0 };
  const bytesToRead = density * size;
  const workingHash = new Uint8Array(hashBytes);

  while (readBytes < bytesToRead) {
    if (hasCompletedCycle) {
      workingHash[i] ^= rand.intn(255);
    }

    if (i === 0) {
      current = {
        x: rand.intn(drawableWidth),
        y: rand.intn(size),
      };
    }

    const value = getFillValue(workingHash[i]);
    if (value !== 0) {
      if (!canvas.pointsMap.has(current.y)) {
        canvas.pointsMap.set(current.y, new Map());
      }
      const row = canvas.pointsMap.get(current.y)!;
      const firstTimeFilled = !row.has(current.x) || row.get(current.x) === 0;
      row.set(current.x, (row.get(current.x) ?? 0) + value);
      if (firstTimeFilled) {
        canvas.filledPoints += 1;
      }

      if (current.y < canvas.minY) canvas.minY = current.y;
      if (current.y > canvas.maxY) canvas.maxY = current.y;

      const oddDiff = size % 2;
      if (current.x < drawableWidth - oddDiff) {
        const mirror = mirrorSymmetric(current, size);
        if (!canvas.pointsMap.has(mirror.y)) {
          canvas.pointsMap.set(mirror.y, new Map());
        }
        const mirrorRow = canvas.pointsMap.get(mirror.y)!;
        const mirrorFirst = !mirrorRow.has(mirror.x) || mirrorRow.get(mirror.x) === 0;
        mirrorRow.set(mirror.x, (mirrorRow.get(mirror.x) ?? 0) + value);
        if (mirrorFirst) {
          canvas.filledPoints += 1;
        }
      }
    }

    current = nextPoint(workingHash[i], current, drawableWidth, size);
    i += 1;
    readBytes += 1;

    if (i === hashBytesLen - 1) {
      i = 0;
      hasCompletedCycle = true;
    }
  }

  return { canvas, colors };
}

function identiconSvg(text: string, options: IdenticonOptions = {}): string {
  const namespace = options.namespace ?? DEFAULT_NAMESPACE;
  const blockSize = options.blockSize ?? DEFAULT_BLOCK_SIZE;
  const density = options.density ?? DEFAULT_DENSITY;
  const pixels = options.pixels ?? 128;

  const { canvas, colors } = drawIdenticon(text, namespace, blockSize, density);
  const padding = Math.floor(pixels / (blockSize * MIN_SIZE));
  const drawableArea = pixels - padding * 2;
  const cellSize = Math.floor(drawableArea / blockSize);
  const centeredPadding = padding + Math.floor((drawableArea % blockSize) / 2);

  const rects: string[] = [];
  for (const [y, row] of canvas.pointsMap.entries()) {
    for (const [x] of row.entries()) {
      const rx = cellSize * x + centeredPadding;
      const ry = cellSize * y + centeredPadding;
      rects.push(
        `<rect x="${rx}" y="${ry}" width="${cellSize}" height="${cellSize}" fill="${colors.fill}" />`,
      );
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="0 0 ${pixels} ${pixels}" role="img" aria-hidden="true">`,
    `<rect width="${pixels}" height="${pixels}" fill="${colors.background}" />`,
    rects.join(""),
    "</svg>",
  ].join("");
}

const identiconCache = new Map<string, string>();

export function getIdenticonDataUrl(text: string, pixels = 128, options: IdenticonOptions = {}): string {
  const seed = text.trim() || "User";
  const cacheKey = `${seed}|${pixels}|${options.namespace ?? DEFAULT_NAMESPACE}|${options.blockSize ?? DEFAULT_BLOCK_SIZE}|${options.density ?? DEFAULT_DENSITY}`;
  const cached = identiconCache.get(cacheKey);
  if (cached) return cached;

  const svg = identiconSvg(seed, { ...options, pixels });
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  identiconCache.set(cacheKey, dataUrl);
  return dataUrl;
}

export function getIdenticonSvg(text: string, options: IdenticonOptions = {}): string {
  return identiconSvg(text.trim() || "User", options);
}

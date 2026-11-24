import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const root = resolve(process.cwd());
const outDir = join(root, "assets/icons");
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let k = 0; k < 8; k += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([length, name, data, crc]);
}

function encodePng(width, height, painter) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = painter(x / width, y / height, x, y);
      const offset = row + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

const PLUM = rgb("#7a5cc4");
const PLUM_DEEP = rgb("#5c3f9e");
const PEACH = rgb("#e98d6d");
const CREAM = rgb("#fffaf2");
const GOLD = rgb("#ffcf8a");

function roundedInside(u, v, radius) {
  const dx = Math.max(Math.abs(u - 0.5) - (0.5 - radius), 0);
  const dy = Math.max(Math.abs(v - 0.5) - (0.5 - radius), 0);
  return Math.hypot(dx, dy) <= radius;
}

function artwork(u, v, { maskable = false, wide = false } = {}) {
  const gradient = clamp01(u * 0.55 + v * 0.45);
  let base = [
    mix(PLUM_DEEP[0], PEACH[0], gradient),
    mix(PLUM_DEEP[1], PEACH[1], gradient),
    mix(PLUM_DEEP[2], PEACH[2], gradient)
  ];

  const glow = Math.exp(-((u - 0.28) ** 2 + (v - 0.24) ** 2) * 10);
  base = base.map((channel, index) => mix(channel, CREAM[index], glow * 0.16));

  if (wide) {
    const halo = Math.exp(-((u - 0.82) ** 2 + (v - 0.3) ** 2) * 9);
    base = base.map((channel, index) => mix(channel, GOLD[index], halo * 0.35));
  }

  let alpha = 1;
  if (!maskable && !wide) {
    alpha = roundedInside(u, v, 0.215) ? 1 : 0;
  }

  const thickness = wide ? 0.011 : 0.02;
  for (let wave = 0; wave < 3; wave += 1) {
    const baseV = wide ? 0.46 + wave * 0.12 : 0.36 + wave * 0.135;
    const amplitude = wide ? 0.07 : 0.055;
    const frequency = wide ? Math.PI * 3.4 : Math.PI * 2.6;
    const y = baseV + amplitude * Math.sin(u * frequency + wave * 0.9);
    const distance = Math.abs(v - y);
    const strength = 1 - smoothstep(thickness * 0.55, thickness, distance);
    const weight = wave === 1 ? 1 : wave === 0 ? 0.78 : 0.6;
    if (strength > 0) {
      base = base.map((channel, index) => mix(channel, CREAM[index], strength * weight));
    }
  }

  const dotX = wide ? 0.86 : 0.73;
  const dotY = wide ? 0.24 : 0.27;
  const dotRadius = wide ? 0.055 : 0.075;
  const dotDistance = Math.hypot(u - dotX, v - dotY);
  const dot = 1 - smoothstep(dotRadius * 0.82, dotRadius, dotDistance);
  if (dot > 0) {
    base = base.map((channel, index) => mix(channel, GOLD[index], dot));
  }

  const grain = ((u * 92821 + v * 68917) * 43758.5453) % 1;
  const noise = (grain - 0.5) * (wide ? 3 : 4);
  return [
    Math.round(clamp01((base[0] + noise) / 255) * 255),
    Math.round(clamp01((base[1] + noise) / 255) * 255),
    Math.round(clamp01((base[2] + noise) / 255) * 255),
    Math.round(alpha * 255)
  ];
}

function write(name, width, height, options) {
  const png = encodePng(width, height, (u, v) => artwork(u, v, options));
  writeFileSync(join(outDir, name), png);
  console.log(`Wrote assets/icons/${name} · ${width}×${height} · ${(png.length / 1024).toFixed(1)} KB`);
}

write("icon-192.png", 192, 192);
write("icon-512.png", 512, 512);
write("icon-maskable-512.png", 512, 512, { maskable: true });
write("og.png", 1200, 630, { wide: true, maskable: true });

console.log("Icons ready.");

import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  arrangementOptions,
  decodeHash,
  defaultMix,
  deriveSeed,
  encodeHash,
  loadSettings,
  normalizeMix,
  normalizeSettings,
  saveSettings
} from "../assets/js/state.js";
import { PART_ORDER } from "../assets/js/composer.js";

function memoryStore() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    }
  };
}

test("normalizeSettings clamps and repairs values", () => {
  const settings = normalizeSettings({
    prompt: "x".repeat(400),
    presetId: "not-real",
    key: 13,
    scale: "not-a-scale",
    tempo: 500,
    bars: 10,
    variation: -3,
    seed: "s".repeat(200),
    loop: false,
    master: 2,
    mix: { pad: { volume: 5, muted: 1, solo: 0 } }
  });
  assert.equal(settings.prompt.length, 280);
  assert.equal(settings.presetId, "lofi");
  assert.equal(settings.key, 1);
  assert.equal(settings.scale, "auto");
  assert.equal(settings.tempo, 200);
  assert.equal(settings.bars, 12);
  assert.equal(settings.variation, 0);
  assert.equal(settings.seed.length, 80);
  assert.equal(settings.loop, false);
  assert.equal(settings.master, 1);
  assert.equal(settings.mix.pad.volume, 1);
  assert.equal(settings.mix.pad.muted, true);
  assert.equal(settings.mix.pad.solo, false);
});

test("normalizeSettings defaults are stable", () => {
  const settings = normalizeSettings();
  assert.equal(settings.presetId, DEFAULT_SETTINGS.presetId);
  assert.equal(settings.tempo, DEFAULT_SETTINGS.tempo);
  assert.equal(settings.bars, DEFAULT_SETTINGS.bars);
  assert.equal(settings.loop, true);
  assert.equal(settings.master, 0.85);
});

test("defaultMix includes every part", () => {
  const mix = defaultMix("ambient");
  assert.deepEqual(Object.keys(mix).sort(), [...PART_ORDER].sort());
  for (const part of PART_ORDER) {
    assert.ok(mix[part].volume >= 0 && mix[part].volume <= 1);
    assert.equal(mix[part].muted, false);
    assert.equal(mix[part].solo, false);
  }
});

test("normalizeMix keeps known lanes and clamps volume", () => {
  const mix = normalizeMix({ pad: { volume: 9 }, bass: { muted: true } }, "lofi");
  assert.equal(mix.pad.volume, 1);
  assert.equal(mix.bass.muted, true);
  assert.equal(mix.drums.volume, defaultMix("lofi").drums.volume);
});

test("deriveSeed prefers a custom seed, then the prompt", () => {
  assert.equal(deriveSeed({ prompt: "", seed: "" }), "softwave");
  assert.equal(deriveSeed({ prompt: "rainy", seed: "" }), "rainy");
  assert.equal(deriveSeed({ prompt: "rainy", seed: "  custom  " }), "custom");
});

test("arrangementOptions maps auto scale to null", () => {
  const options = arrangementOptions({
    prompt: "neon drive",
    presetId: "synthwave",
    key: 9,
    scale: "auto",
    tempo: 120,
    bars: 24,
    variation: 4
  });
  assert.equal(options.seed, "neon drive");
  assert.equal(options.presetId, "synthwave");
  assert.equal(options.key, 9);
  assert.equal(options.scale, null);
  assert.equal(options.bars, 24);
  assert.equal(options.variation, 4);

  const major = arrangementOptions({ prompt: "x", presetId: "chill", scale: "major" });
  assert.equal(major.scale, "major");
});

test("encodeHash and decodeHash round-trip shareable fields", () => {
  const settings = normalizeSettings({
    prompt: "rainy study",
    seed: "custom",
    presetId: "chill",
    key: 3,
    scale: "major",
    tempo: 100,
    bars: 16,
    variation: 2
  });
  const hash = encodeHash(settings);
  const decoded = decodeHash(`#${hash}`);
  assert.equal(decoded.prompt, "rainy study");
  assert.equal(decoded.seed, "custom");
  assert.equal(decoded.presetId, "chill");
  assert.equal(decoded.key, "3");
  assert.equal(decoded.scale, "major");
  assert.equal(decoded.tempo, "100");
  assert.equal(decoded.bars, "16");
  assert.equal(decoded.variation, "2");
});

test("empty prompt and seed survive a share link", () => {
  const settings = normalizeSettings({ prompt: "", seed: "", presetId: "cinematic" });
  const decoded = decodeHash(`#${encodeHash(settings)}`);
  assert.equal(decoded.prompt, "");
  assert.equal(decoded.seed, "");
});

test("decodeHash ignores empty and unknown fragments", () => {
  assert.equal(decodeHash(""), null);
  assert.equal(decodeHash("#"), null);
  assert.equal(decodeHash("#unknown=1"), null);
  assert.equal(decodeHash("#studio"), null);
  assert.deepEqual(decodeHash("#preset=chill"), { presetId: "chill" });
});

test("loadSettings and saveSettings use storage safely", () => {
  const store = memoryStore();
  const settings = normalizeSettings({ prompt: "saved", presetId: "uplifting", tempo: 130 });
  assert.equal(saveSettings(settings, store), true);
  assert.ok(store.getItem(STORAGE_KEY).includes("uplifting"));
  assert.deepEqual(loadSettings(store), normalizeSettings(settings));

  store.setItem(STORAGE_KEY, "{not json");
  assert.deepEqual(loadSettings(store), normalizeSettings());

  assert.equal(saveSettings(settings, null), false);
  assert.deepEqual(loadSettings(null), normalizeSettings());
});

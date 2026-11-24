import test from "node:test";
import assert from "node:assert/strict";

import {
  PRESETS,
  PRESET_IDS,
  PRESET_ORDER,
  getPreset,
  makeTitle,
  parsePrompt
} from "../assets/js/presets.js";
import { Rng } from "../assets/js/seed.js";

test("all presets are ordered and complete", () => {
  assert.equal(PRESET_ORDER.length, 6);
  for (const id of PRESET_ORDER) {
    const preset = PRESETS[id];
    assert.ok(preset, id);
    assert.equal(preset.id, id);
    assert.ok(preset.name && preset.tagline && preset.blurb);
    assert.ok(preset.tempo >= 40 && preset.tempo <= 200);
    assert.ok(preset.progression.length > 0);
    assert.ok(preset.bassPattern.length === 16);
    assert.ok(preset.levels && preset.reverb && preset.delay);
  }
  assert.deepEqual([...PRESET_IDS].sort(), [...PRESET_ORDER].sort());
});

test("getPreset falls back to lofi", () => {
  assert.equal(getPreset("synthwave").id, "synthwave");
  assert.equal(getPreset("missing").id, "lofi");
});

test("parsePrompt maps moods, tempo and scale", () => {
  assert.equal(parsePrompt("rainy lofi study session").presetId, "lofi");
  assert.equal(parsePrompt("neon 80s retro drive").presetId, "synthwave");
  assert.equal(parsePrompt("a sad cinematic score").presetId, "cinematic");
  assert.equal(parsePrompt("a sad cinematic score").scale, "minor");
  assert.equal(parsePrompt("happy sunny morning").scale, "major");
  assert.ok(parsePrompt("fast dance party").tempoDelta > 0);
  assert.ok(parsePrompt("slow calm sleep").tempoDelta < 0);
  assert.equal(parsePrompt("").matched, false);
});

test("makeTitle prefers prompt words", () => {
  assert.equal(makeTitle("neon city drive", new Rng("title")), "Neon City Drive");
  assert.equal(makeTitle("rainy study", new Rng("title")), "Rainy Study");
});

test("makeTitle falls back to adjective and noun", () => {
  const title = makeTitle("music", new Rng("title"));
  assert.match(title, /^[A-Z][a-z]+ [A-Z][a-z]+$/);
  assert.equal(makeTitle("music", new Rng("title")), title);
  assert.match(makeTitle("the rain", new Rng("title")), /^[A-Z][a-z]+ [A-Z][a-z]+$/);
});

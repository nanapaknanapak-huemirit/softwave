import test from "node:test";
import assert from "node:assert/strict";

import {
  PRESETS,
  PRESET_CATEGORIES,
  PRESET_IDS,
  PRESET_ORDER,
  getPreset,
  makeTitle,
  parsePrompt
} from "../assets/js/presets.js";
import { buildArrangement, countNotes } from "../assets/js/composer.js";
import { Rng } from "../assets/js/seed.js";
import { SCALES } from "../assets/js/theory.js";

const DRUM_KEYS = ["kick", "snare", "hat", "clap", "perc", "tom", "crash"];

test("all presets are ordered, categorized and complete", () => {
  assert.equal(PRESET_ORDER.length, 18);
  const categoryIds = PRESET_CATEGORIES.map((category) => category.id);
  for (const id of PRESET_ORDER) {
    const preset = PRESETS[id];
    assert.ok(preset, id);
    assert.equal(preset.id, id);
    assert.ok(categoryIds.includes(preset.category), `${id} category`);
    assert.ok(preset.name && preset.tagline && preset.blurb);
    assert.ok(preset.tempo >= 40 && preset.tempo <= 200);
    assert.ok(SCALES[preset.scale], `${id} scale`);
    assert.ok(preset.progression.length > 0);
    assert.equal(preset.bassPattern.length, 16);
    assert.ok(preset.levels && preset.reverb && preset.delay);
    for (const lane of ["pad", "bass", "lead", "arp", "melody"]) {
      assert.ok(preset[lane], `${id} ${lane}`);
    }
    for (const key of DRUM_KEYS) {
      const pattern = preset.drums[key];
      if (typeof pattern !== "string" || !pattern) continue;
      assert.equal(pattern.length, 16, `${id} ${key} pattern`);
    }
  }
  assert.deepEqual([...PRESET_IDS].sort(), [...PRESET_ORDER].sort());
  for (const category of PRESET_CATEGORIES) {
    assert.ok(
      PRESET_ORDER.some((id) => PRESETS[id].category === category.id),
      `${category.id} has presets`
    );
  }
});

test("every preset can build a short arrangement", () => {
  for (const id of PRESET_ORDER) {
    const arrangement = buildArrangement({ presetId: id, bars: 8, seed: `test-${id}` });
    assert.equal(arrangement.presetId, id);
    assert.equal(arrangement.bars, 8);
    assert.ok(arrangement.parts.pad.length > 0, `${id} pad`);
    assert.ok(arrangement.parts.bass.length > 0, `${id} bass`);
    assert.ok(countNotes(arrangement) > 0, `${id} notes`);
  }
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

test("parsePrompt maps the expanded palette", () => {
  assert.equal(parsePrompt("city pop tokyo").presetId, "citypop");
  assert.equal(parsePrompt("late night downtempo").presetId, "downtempo");
  assert.equal(parsePrompt("trip hop bristol").presetId, "triphop");
  assert.equal(parsePrompt("vaporwave mall cassette").presetId, "vaporwave");
  assert.equal(parsePrompt("dreamy ethereal clouds").presetId, "dreamy");
  assert.equal(parsePrompt("melancholy lonely").presetId, "melancholic");
  assert.equal(parsePrompt("dark suspense thriller").presetId, "suspense");
  assert.equal(parsePrompt("deep focus coding").presetId, "focus");
  assert.equal(parsePrompt("sleepy bedtime").presetId, "sleep");
  assert.equal(parsePrompt("meditation mindfulness").presetId, "meditation");
  assert.equal(parsePrompt("gym workout cardio").presetId, "workout");
  assert.equal(parsePrompt("gaming speedrun").presetId, "gaming");
});

test("parsePrompt uses word boundaries", () => {
  assert.equal(parsePrompt("chillhop").presetId, "lofi");
  assert.equal(parsePrompt("chill out").presetId, "chill");
  assert.equal(parsePrompt("forest").matched, false);
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

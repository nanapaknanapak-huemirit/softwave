import test from "node:test";
import assert from "node:assert/strict";

import {
  PART_ORDER,
  buildArrangement,
  countNotes,
  flatten,
  normalizeBars,
  planSections
} from "../assets/js/composer.js";

const OPTIONS = {
  seed: "rainy study",
  prompt: "rainy study",
  presetId: "lofi",
  key: 4,
  bars: 16,
  tempo: 90,
  variation: 0
};

test("normalizeBars rounds to fours and clamps", () => {
  assert.equal(normalizeBars(3), 8);
  assert.equal(normalizeBars(8), 8);
  assert.equal(normalizeBars(10), 12);
  assert.equal(normalizeBars(33), 32);
  assert.equal(normalizeBars(200), 128);
  assert.equal(normalizeBars("nope"), 32);
});

test("planSections sums to the requested bars", () => {
  for (const bars of [8, 12, 16, 24, 32, 48, 64, 128]) {
    const sections = planSections(bars);
    assert.equal(sections.reduce((sum, section) => sum + section.bars, 0), bars);
    assert.ok(sections.every((section) => section.bars > 0));
  }
  const large = planSections(32);
  assert.equal(large[0].name, "Intro");
  assert.equal(large[large.length - 1].name, "Outro");
});

test("buildArrangement is deterministic for the same seed", () => {
  const a = buildArrangement(OPTIONS);
  const b = buildArrangement(OPTIONS);
  assert.equal(a.title, "Rainy Study");
  assert.equal(a.totalBeats, 64);
  assert.equal(a.bars, 16);
  assert.equal(a.tempo, 90);
  assert.equal(a.keyName, "E");
  assert.equal(a.scaleName, "Dorian");
  assert.deepEqual(a.parts, b.parts);
  assert.deepEqual(a.sections, b.sections);

  const other = buildArrangement({ ...OPTIONS, variation: 1 });
  assert.notDeepEqual(a.parts, other.parts);
});

test("every lane is populated for a 16-bar lo-fi sketch", () => {
  const arrangement = buildArrangement(OPTIONS);
  for (const part of PART_ORDER) {
    assert.ok(arrangement.parts[part].length > 0, `${part} should have notes`);
  }
  assert.ok(countNotes(arrangement) > 100);
});

test("notes sit inside the arrangement and flatten sorts them", () => {
  const arrangement = buildArrangement(OPTIONS);
  const total = arrangement.totalBeats;
  for (const part of PART_ORDER) {
    for (const note of arrangement.parts[part]) {
      assert.ok(note.beat >= 0, `${part} beat is not negative`);
      assert.ok(note.beat < total, `${part} beat is inside the loop`);
      if (part !== "drums") {
        assert.ok(Number.isFinite(note.midi));
        assert.ok(note.midi > 0 && note.midi < 128);
        assert.ok(note.dur > 0);
      }
      assert.ok(note.velocity > 0 && note.velocity <= 1);
    }
  }

  const events = flatten(arrangement);
  assert.equal(events.length, countNotes(arrangement));
  for (let i = 1; i < events.length; i += 1) {
    assert.ok(events[i].beat >= events[i - 1].beat);
  }
});

test("preset and key overrides are respected", () => {
  const arrangement = buildArrangement({
    ...OPTIONS,
    presetId: "synthwave",
    scale: "minor",
    key: 9,
    tempo: 140
  });
  assert.equal(arrangement.presetId, "synthwave");
  assert.equal(arrangement.scale, "minor");
  assert.equal(arrangement.keyName, "A");
  assert.equal(arrangement.tempo, 140);
  assert.ok(arrangement.parts.arp.length > arrangement.parts.melody.length);
});

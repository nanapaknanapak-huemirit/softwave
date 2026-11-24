import test from "node:test";
import assert from "node:assert/strict";

import {
  SCALES,
  chordMidi,
  chordPitchClasses,
  fitVoicing,
  nearestScalePitch,
  pitchClass,
  scaleDegree,
  scaleStepForPitch
} from "../assets/js/theory.js";

test("scales are seven-note sets starting at zero", () => {
  for (const [name, scale] of Object.entries(SCALES)) {
    assert.equal(scale.length, 7, name);
    assert.equal(scale[0], 0, name);
    assert.ok(scale.every((step) => step >= 0 && step < 12), name);
  }
});

test("scaleDegree walks octaves", () => {
  assert.equal(scaleDegree(60, "major", 0), 60);
  assert.equal(scaleDegree(60, "major", 1), 62);
  assert.equal(scaleDegree(60, "major", 7), 72);
  assert.equal(scaleDegree(60, "minor", -1), 58);
  assert.equal(scaleDegree(60, "bogus", 2), 64);
});

test("chordMidi builds stacked thirds", () => {
  assert.deepEqual(chordMidi(60, "major", 0, 3), [60, 64, 67]);
  assert.deepEqual(chordMidi(60, "major", 0, 4), [60, 64, 67, 71]);
  assert.deepEqual(chordMidi(60, "minor", 0, 3), [60, 63, 67]);
});

test("fitVoicing stays inside its bounds", () => {
  const fitted = fitVoicing([30, 40, 90], 48, 76);
  assert.ok(fitted.every((note) => note >= 48 && note <= 76));
  assert.ok(fitted[0] <= fitted[fitted.length - 1]);
});

test("pitch helpers agree with MIDI note numbers", () => {
  assert.equal(pitchClass(60), 0);
  assert.equal(pitchClass(61), 1);
  assert.equal(pitchClass(-1), 11);
  assert.equal(nearestScalePitch(61, 60, "major"), 60);
  assert.equal(nearestScalePitch(61, 60, "minor"), 60);
  assert.equal(scaleStepForPitch(64, 60, "major"), 2);
});

test("chordPitchClasses returns a set of pitch classes", () => {
  const classes = chordPitchClasses(60, "major", 0, 4);
  assert.ok(classes.has(0));
  assert.ok(classes.has(4));
  assert.ok(classes.has(7));
  assert.ok(classes.has(11));
  assert.ok(!classes.has(2));
});

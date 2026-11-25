import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeLine,
  analyzeLyrics,
  buildLyricRhythm,
  countSyllables,
  lyricSummary,
  melodyFingerprint,
  planLyricPhrases
} from "../assets/js/lyrics.js";
import { Rng } from "../assets/js/seed.js";

test("countSyllables handles common words", () => {
  assert.equal(countSyllables("hello"), 2);
  assert.equal(countSyllables("world"), 1);
  assert.equal(countSyllables("the"), 1);
  assert.equal(countSyllables("make"), 1);
  assert.equal(countSyllables("table"), 2);
  assert.equal(countSyllables("little"), 2);
  assert.equal(countSyllables("rhythm"), 1);
  assert.equal(countSyllables("don't"), 1);
  assert.equal(countSyllables("beautiful"), 3);
  assert.equal(countSyllables("well-known"), 2);
  assert.equal(countSyllables("42"), 1);
  assert.equal(countSyllables("hmm"), 1);
  assert.equal(countSyllables(""), 0);
});

test("analyzeLine records words, syllables and word stress", () => {
  const line = analyzeLine("Hello world");
  assert.equal(line.text, "Hello world");
  assert.deepEqual(line.words, ["Hello", "world"]);
  assert.equal(line.syllables, 3);
  assert.deepEqual(line.stress, [true, false, true]);
});

test("analyzeLyrics keeps stanzas and totals", () => {
  const analysis = analyzeLyrics("Hello world\n\nSecond line here\nThird line");
  assert.equal(analysis.lineCount, 3);
  assert.equal(analysis.stanzaCount, 2);
  assert.equal(analysis.syllableCount, 9);
  assert.equal(analysis.lines[0].stanza, 0);
  assert.equal(analysis.lines[1].stanza, 1);
  assert.equal(analysis.lines[2].stanza, 1);
});

test("planLyricPhrases fits lines into the available bars", () => {
  const lines = analyzeLyrics("one line\ntwo line\nthree line\nfour line").lines;
  const roomy = planLyricPhrases(lines, 8);
  assert.equal(roomy.barsPerLine, 2);
  assert.equal(roomy.capacity, 4);
  assert.equal(roomy.placed.length, 4);
  assert.equal(roomy.extra.length, 0);

  const tight = planLyricPhrases(lines, 3);
  assert.equal(tight.barsPerLine, 1);
  assert.equal(tight.capacity, 3);
  assert.equal(tight.placed.length, 3);
  assert.equal(tight.extra.length, 1);

  const empty = planLyricPhrases([], 8);
  assert.equal(empty.capacity, 0);
  assert.equal(empty.placed.length, 0);
});

test("buildLyricRhythm gives one note per syllable and caps overflow", () => {
  const line = analyzeLine("one two three four");
  const roomy = buildLyricRhythm(line, 8, new Rng("rhythm"));
  assert.equal(roomy.notes.length, 4);
  assert.equal(roomy.overflow, 0);
  for (const note of roomy.notes) {
    assert.ok(note.beat >= 0 && note.beat < 8);
    assert.ok(note.dur > 0);
  }

  const crowded = analyzeLine("a a a a a a a a a a a a a a a a a a a a");
  const tight = buildLyricRhythm(crowded, 4, new Rng("rhythm"));
  assert.equal(tight.notes.length, 16);
  assert.equal(tight.overflow, 4);
});

test("buildLyricRhythm is deterministic", () => {
  const line = analyzeLine("original melody guide");
  const a = buildLyricRhythm(line, 8, new Rng("same"));
  const b = buildLyricRhythm(line, 8, new Rng("same"));
  assert.deepEqual(a.notes, b.notes);
});

test("melodyFingerprint is stable and lyrics-sensitive", () => {
  const notes = [
    { midi: 60 },
    { midi: 62 },
    { midi: 64 }
  ];
  const a = melodyFingerprint("seed", "hello", notes);
  const b = melodyFingerprint("seed", "hello", notes);
  const c = melodyFingerprint("seed", "goodbye", notes);
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[0-9a-f]{8}$/);
});

test("lyricSummary formats the live hint", () => {
  const summary = lyricSummary("Hello world\nSecond line");
  assert.equal(summary.lineCount, 2);
  assert.equal(summary.syllableCount, 6);
  assert.equal(summary.text, "2 lines · 6 syllables");
});

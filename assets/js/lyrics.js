import { hashString } from "./seed.js";

function stripWord(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9'-]/g, "")
    .replace(/^[-']+|[-']+$/g, "");
}

export function countSyllables(word) {
  const text = stripWord(word);
  if (!text) return 0;
  if (text.includes("-")) {
    return text
      .split("-")
      .filter(Boolean)
      .reduce((sum, part) => sum + countSyllables(part), 0);
  }
  if (/^[0-9]+$/.test(text)) return 1;

  let normalized = text.replace(/'/g, "");
  if (normalized.length <= 2) return 1;
  if (normalized.endsWith("e") && !/[aeiouy]e$/.test(normalized)) {
    normalized = normalized.slice(0, -1);
  }

  const groups = normalized.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  if (/[^aeiouy]le$/.test(text)) count += 1;
  return Math.max(1, count);
}

export function analyzeLine(line) {
  const text = String(line ?? "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const stress = [];
  let syllables = 0;
  for (const word of words) {
    const count = countSyllables(word);
    syllables += count;
    for (let i = 0; i < count; i += 1) stress.push(i === 0);
  }
  return { text, words, syllables, stress };
}

export function analyzeLyrics(input) {
  const rawLines = String(input ?? "").replace(/\r\n?/g, "\n").split("\n");
  const lines = [];
  let stanza = 0;
  let pendingBreak = false;

  for (const raw of rawLines) {
    const text = raw.trim();
    if (!text) {
      if (lines.length) pendingBreak = true;
      continue;
    }
    if (pendingBreak) {
      stanza += 1;
      pendingBreak = false;
    }
    const line = analyzeLine(text);
    lines.push({ ...line, index: lines.length, stanza });
  }

  return {
    lines,
    lineCount: lines.length,
    syllableCount: lines.reduce((sum, line) => sum + line.syllables, 0),
    stanzaCount: lines.length ? stanza + 1 : 0
  };
}

export function planLyricPhrases(lines, availableBars) {
  const bars = Math.max(0, Math.floor(Number(availableBars) || 0));
  if (!lines.length || bars <= 0) {
    return { barsPerLine: 0, capacity: 0, placed: [], extra: lines.slice() };
  }
  const barsPerLine = lines.length * 2 <= bars ? 2 : 1;
  const capacity = Math.floor(bars / barsPerLine);
  return {
    barsPerLine,
    capacity,
    placed: lines.slice(0, capacity),
    extra: lines.slice(capacity)
  };
}

export function buildLyricRhythm(line, beats, rng) {
  const totalBeats = Math.max(0.5, Number(beats) || 0);
  const syllables = Math.max(0, line?.syllables ?? 0);
  const maxNotes = Math.max(1, Math.floor(totalBeats * 4));
  const count = Math.min(syllables, maxNotes);
  if (!count) return { notes: [], overflow: 0 };

  const spacing = Math.min(1, totalBeats / count);
  const grid = 0.25;
  const step = Math.max(grid, Math.round(spacing / grid) * grid);
  const notes = [];

  for (let i = 0; i < count; i += 1) {
    const beat = Math.min(totalBeats - grid, i * step);
    const next = i + 1 < count ? Math.min(totalBeats, (i + 1) * step) : totalBeats;
    const dur = Math.max(grid, (next - beat) * (rng ? rng.float(0.88, 0.96) : 0.92));
    notes.push({
      beat,
      dur,
      stress: Boolean(line?.stress?.[i])
    });
  }

  return { notes, overflow: syllables - count };
}

export function melodyFingerprint(seed, lyrics, notes) {
  const intervals = [];
  let previous = null;
  for (const note of notes) {
    if (previous !== null) intervals.push(Math.round(note.midi) - previous);
    previous = Math.round(note.midi);
  }
  return hashString(`${seed}|${lyrics}|${intervals.join(",")}`)
    .toString(16)
    .padStart(8, "0");
}

export function lyricSummary(text) {
  const analysis = analyzeLyrics(text);
  const label = analysis.syllableCount === 1 ? "syllable" : "syllables";
  return {
    ...analysis,
    text: `${analysis.lineCount} ${analysis.lineCount === 1 ? "line" : "lines"} · ${analysis.syllableCount} ${label}`
  };
}

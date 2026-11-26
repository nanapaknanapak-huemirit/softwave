import { analyzeLine, countSyllables } from "./lyrics.js";
import { rhymeKey, suggestRhymes } from "./rhymes.js";

export const SECTION_TYPES = [
  { id: "intro", name: "Intro" },
  { id: "verse", name: "Verse" },
  { id: "chorus", name: "Chorus" },
  { id: "bridge", name: "Bridge" },
  { id: "outro", name: "Outro" }
];

const SECTION_TYPE_IDS = new Set(SECTION_TYPES.map((type) => type.id));
const DEFAULT_LINE_COUNT = 4;
const MAX_LINE_LENGTH = 160;
let sequence = 0;

function nextId(prefix) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function sectionName(type) {
  return SECTION_TYPES.find((entry) => entry.id === type)?.name || "Verse";
}

function normalizeType(value) {
  return SECTION_TYPE_IDS.has(value) ? value : "verse";
}

function defaultTypeForIndex(index) {
  return ["verse", "chorus", "verse", "chorus", "bridge", "outro"][index] || "verse";
}

export function createLine(text = "") {
  return { id: nextId("line"), text: String(text).slice(0, MAX_LINE_LENGTH) };
}

export function createSection(type = "verse", lineCount = DEFAULT_LINE_COUNT) {
  const count = Math.max(1, Math.floor(Number(lineCount) || DEFAULT_LINE_COUNT));
  return {
    id: nextId("section"),
    type: normalizeType(type),
    lines: Array.from({ length: count }, () => createLine(""))
  };
}

export function createDraft(options = {}) {
  const title = String(options.title ?? "Untitled draft");
  const sections =
    Array.isArray(options.sections) && options.sections.length
      ? options.sections
      : [createSection("verse")];
  return { id: options.id || nextId("draft"), title, sections };
}

export function draftToText(draft) {
  if (!draft || !Array.isArray(draft.sections)) return "";
  const blocks = [];
  for (const section of draft.sections) {
    const lines = (section.lines || [])
      .map((line) => String(line.text ?? "").trim())
      .filter(Boolean);
    if (lines.length) blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n");
}

export function textToDraft(text, options = {}) {
  const raw = String(text ?? "").replace(/\r\n?/g, "\n");
  const stanzas = raw
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length);

  const sections = stanzas.map((lines, index) => ({
    id: nextId("section"),
    type: defaultTypeForIndex(index),
    lines: lines.map((line) => createLine(line))
  }));

  return createDraft({
    ...options,
    sections: sections.length ? sections : undefined
  });
}

export function lineStats(text) {
  const analysis = analyzeLine(text);
  const lastWord = analysis.words.length ? analysis.words[analysis.words.length - 1] : "";
  return {
    text: analysis.text,
    words: analysis.words,
    syllables: analysis.syllables,
    lastWord,
    rhymeKey: rhymeKey(lastWord)
  };
}

export function sectionStats(section) {
  let lines = 0;
  let syllables = 0;
  for (const line of section?.lines || []) {
    const stats = lineStats(line.text);
    if (stats.text) lines += 1;
    syllables += stats.syllables;
  }
  return { lines, syllables };
}

export function draftStats(draft) {
  let lines = 0;
  let syllables = 0;
  for (const section of draft?.sections || []) {
    const stats = sectionStats(section);
    lines += stats.lines;
    syllables += stats.syllables;
  }
  return { lines, syllables };
}

export function findSection(draft, sectionId) {
  return draft?.sections?.find((section) => section.id === sectionId) || null;
}

export function addSection(draft, type = "verse", lineCount = DEFAULT_LINE_COUNT) {
  return { ...draft, sections: [...draft.sections, createSection(type, lineCount)] };
}

export function removeSection(draft, sectionId) {
  return {
    ...draft,
    sections: draft.sections.filter((section) => section.id !== sectionId)
  };
}

export function moveSection(draft, sectionId, delta) {
  const index = draft.sections.findIndex((section) => section.id === sectionId);
  if (index < 0) return draft;
  const target = Math.min(draft.sections.length - 1, Math.max(0, index + delta));
  if (target === index) return draft;
  const sections = [...draft.sections];
  const [moved] = sections.splice(index, 1);
  sections.splice(target, 0, moved);
  return { ...draft, sections };
}

export function setSectionType(draft, sectionId, type) {
  return {
    ...draft,
    sections: draft.sections.map((section) =>
      section.id === sectionId ? { ...section, type: normalizeType(type) } : section
    )
  };
}

export function addLine(draft, sectionId) {
  return {
    ...draft,
    sections: draft.sections.map((section) =>
      section.id === sectionId
        ? { ...section, lines: [...section.lines, createLine("")] }
        : section
    )
  };
}

export function removeLine(draft, sectionId, lineId) {
  return {
    ...draft,
    sections: draft.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const lines = section.lines.filter((line) => line.id !== lineId);
      return { ...section, lines: lines.length ? lines : [createLine("")] };
    })
  };
}

export function setLine(draft, sectionId, lineId, text) {
  return {
    ...draft,
    sections: draft.sections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        lines: section.lines.map((line) =>
          line.id === lineId ? { ...line, text: String(text).slice(0, MAX_LINE_LENGTH) } : line
        )
      };
    })
  };
}

export function replaceLastWord(text, word) {
  const value = String(text ?? "");
  const next = String(word ?? "").trim();
  if (!next) return value;
  if (!value.trim()) return next;
  if (/[A-Za-z']+\s*$/.test(value)) {
    return value.replace(/[A-Za-z']+\s*$/, next);
  }
  return `${value.replace(/\s+$/, "")} ${next}`;
}

export function sectionLabel(section) {
  return sectionName(section?.type);
}

export { countSyllables, rhymeKey, suggestRhymes };

import test from "node:test";
import assert from "node:assert/strict";

import {
  SECTION_TYPES,
  addLine,
  addSection,
  createDraft,
  createSection,
  draftStats,
  draftToText,
  lineStats,
  moveSection,
  removeLine,
  removeSection,
  replaceLastWord,
  sectionLabel,
  setLine,
  setSectionType,
  textToDraft
} from "../assets/js/songwriter.js";
import { rhymeKey, suggestRhymes } from "../assets/js/rhymes.js";

test("rhymeKey groups words that share a final sound", () => {
  assert.equal(rhymeKey("night"), rhymeKey("light"));
  assert.equal(rhymeKey("love"), rhymeKey("above"));
  assert.equal(rhymeKey("day"), rhymeKey("away"));
  assert.notEqual(rhymeKey("night"), rhymeKey("day"));
  assert.equal(rhymeKey(""), "");
});

test("suggestRhymes returns original, limited, on-device hints", () => {
  const night = suggestRhymes("night", 4);
  assert.equal(night.length, 4);
  assert.ok(night.includes("light"));
  assert.ok(!night.includes("night"));

  const love = suggestRhymes("love");
  assert.ok(love.includes("above"));
  assert.ok(!love.includes("love"));

  const lime = suggestRhymes("lime");
  assert.ok(lime.includes("time"));

  assert.deepEqual(suggestRhymes("", 5), []);
  assert.deepEqual(suggestRhymes("night", 0), []);
});

test("lineStats reports syllables, last word and rhyme key", () => {
  const stats = lineStats("Hello world");
  assert.equal(stats.syllables, 3);
  assert.deepEqual(stats.words, ["Hello", "world"]);
  assert.equal(stats.lastWord, "world");
  assert.equal(stats.rhymeKey, rhymeKey("world"));
  assert.equal(lineStats("").syllables, 0);
});

test("textToDraft and draftToText round-trip stanzas", () => {
  const text = "First line here\nSecond line\n\nChorus line one\nChorus line two";
  const draft = textToDraft(text);
  assert.equal(draft.sections.length, 2);
  assert.equal(draft.sections[0].type, "verse");
  assert.equal(draft.sections[1].type, "chorus");
  assert.equal(draftToText(draft), text);
});

test("empty text becomes one empty section and serializes back to empty", () => {
  const draft = textToDraft("");
  assert.equal(draft.sections.length, 1);
  assert.equal(draft.sections[0].lines.length, 4);
  assert.equal(draftToText(draft), "");
});

test("section operations are immutable", () => {
  const draft = createDraft({ title: "Draft" });
  const first = draft.sections[0];

  const added = addSection(draft, "chorus");
  assert.equal(added.sections.length, 2);
  assert.equal(draft.sections.length, 1);
  assert.equal(sectionLabel(added.sections[1]), "Chorus");

  const retyped = setSectionType(added, added.sections[1].id, "bridge");
  assert.equal(retyped.sections[1].type, "bridge");
  assert.equal(added.sections[1].type, "chorus");

  const moved = moveSection(added, added.sections[1].id, -1);
  assert.equal(moved.sections[0].id, added.sections[1].id);
  assert.equal(added.sections[0].id, first.id);

  const removed = removeSection(added, added.sections[1].id);
  assert.equal(removed.sections.length, 1);
  assert.equal(added.sections.length, 2);

  assert.deepEqual(moveSection(draft, "missing", 1), draft);
});

test("line operations update text and keep the original draft intact", () => {
  const draft = createDraft({ title: "Draft" });
  const section = draft.sections[0];
  const line = section.lines[0];

  const updated = setLine(draft, section.id, line.id, "A brand new line");
  assert.equal(updated.sections[0].lines[0].text, "A brand new line");
  assert.equal(draft.sections[0].lines[0].text, "");

  const withLine = addLine(updated, section.id);
  assert.equal(withLine.sections[0].lines.length, 5);

  const removed = removeLine(withLine, section.id, line.id);
  assert.equal(removed.sections[0].lines.length, 4);
  assert.ok(!removed.sections[0].lines.some((entry) => entry.id === line.id));

  const onlyLine = createDraft({
    sections: [createSection("verse", 1)]
  });
  const kept = removeLine(onlyLine, onlyLine.sections[0].id, onlyLine.sections[0].lines[0].id);
  assert.equal(kept.sections[0].lines.length, 1);
});

test("draftStats counts filled lines and syllables", () => {
  const draft = textToDraft("Hello world\n\nA second line");
  const stats = draftStats(draft);
  assert.equal(stats.lines, 2);
  assert.equal(stats.syllables, 3 + 4);
});

test("replaceLastWord swaps the final word for a rhyme", () => {
  assert.equal(replaceLastWord("I saw the light", "night"), "I saw the night");
  assert.equal(replaceLastWord("I saw the light ", "night"), "I saw the night");
  assert.equal(replaceLastWord("", "night"), "night");
  assert.equal(replaceLastWord("I saw the light", ""), "I saw the light");
  assert.equal(replaceLastWord("I saw the ", "night"), "I saw night");
});

test("SECTION_TYPES exposes the expected labels", () => {
  assert.deepEqual(
    SECTION_TYPES.map((type) => type.id),
    ["intro", "verse", "chorus", "bridge", "outro"]
  );
});

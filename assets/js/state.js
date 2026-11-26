import { PART_ORDER, normalizeBars } from "./composer.js";
import { PRESETS, getPreset } from "./presets.js";
import { SCALES } from "./theory.js";
import { clamp } from "./util.js";

export const STORAGE_KEY = "softwave:v1";

export const DEFAULT_SETTINGS = Object.freeze({
  prompt: "",
  mode: "instrumental",
  lyrics: "",
  presetId: "lofi",
  key: 0,
  scale: "auto",
  tempo: 76,
  bars: 32,
  variation: 0,
  seed: "",
  loop: true,
  master: 0.85,
  mix: null
});

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function defaultMix(presetId) {
  const preset = getPreset(presetId);
  const mix = {};
  for (const part of PART_ORDER) {
    mix[part] = {
      volume: clamp(preset.levels?.[part] ?? 0.5, 0, 1),
      muted: false,
      solo: false
    };
  }
  return mix;
}

export function normalizeMix(raw, presetId) {
  const base = defaultMix(presetId);
  if (!raw || typeof raw !== "object") return base;
  for (const part of PART_ORDER) {
    const entry = raw[part];
    if (!entry || typeof entry !== "object") continue;
    base[part] = {
      volume: clamp(toNumber(entry.volume, base[part].volume), 0, 1),
      muted: Boolean(entry.muted),
      solo: Boolean(entry.solo)
    };
  }
  return base;
}

export function normalizeSettings(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const presetId = Object.prototype.hasOwnProperty.call(PRESETS, source.presetId)
    ? source.presetId
    : "lofi";
  const preset = getPreset(presetId);
  const scale =
    source.scale === "auto" || Object.prototype.hasOwnProperty.call(SCALES, source.scale)
      ? source.scale
      : "auto";

  const tempo = clamp(Math.round(toNumber(source.tempo, preset.tempo)), 40, 200);
  const key = ((Math.round(toNumber(source.key, 0)) % 12) + 12) % 12;
  const variation = clamp(Math.round(toNumber(source.variation, 0)), 0, 9999);
  const master = clamp(toNumber(source.master, DEFAULT_SETTINGS.master), 0, 1);

  return {
    prompt: String(source.prompt ?? "").slice(0, 280),
    mode: source.mode === "lyrics" ? "lyrics" : "instrumental",
    lyrics: String(source.lyrics ?? "").slice(0, 2000),
    presetId,
    key,
    scale,
    tempo,
    bars: normalizeBars(toNumber(source.bars, DEFAULT_SETTINGS.bars)),
    variation,
    seed: String(source.seed ?? "").slice(0, 80),
    loop: source.loop === undefined ? true : Boolean(source.loop),
    master,
    mix: normalizeMix(source.mix, presetId)
  };
}

export function deriveSeed(settings) {
  const custom = String(settings?.seed ?? "").trim();
  if (custom) return custom;
  const prompt = String(settings?.prompt ?? "").trim();
  return prompt || "softwave";
}

export function arrangementOptions(settings) {
  const normalized = normalizeSettings(settings);
  return {
    seed: deriveSeed(normalized),
    presetId: normalized.presetId,
    mode: normalized.mode,
    lyrics: normalized.lyrics,
    key: normalized.key,
    scale: normalized.scale === "auto" ? null : normalized.scale,
    tempo: normalized.tempo,
    bars: normalized.bars,
    prompt: normalized.prompt,
    variation: normalized.variation
  };
}

function getStore(store) {
  if (store !== undefined) return store;
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadSettings(store) {
  const target = getStore(store);
  if (!target) return normalizeSettings();
  try {
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return normalizeSettings();
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return normalizeSettings();
  }
}

export function saveSettings(settings, store) {
  const target = getStore(store);
  if (!target) return false;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
    return true;
  } catch {
    return false;
  }
}

export const DRAFTS_KEY = "softwave:lyrics-drafts:v1";
const MAX_DRAFTS = 50;

export function normalizeDraft(raw) {
  if (!raw || typeof raw !== "object") return null;
  const text = String(raw.text ?? "").slice(0, 2000);
  if (!text.trim()) return null;
  const name = String(raw.name ?? "Draft").trim().slice(0, 60) || "Draft";
  const id =
    String(raw.id ?? "").trim() ||
    `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const updatedAt = Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : Date.now();
  return { id, name, text, updatedAt };
}

export function loadDrafts(store) {
  const target = getStore(store);
  if (!target) return [];
  try {
    const raw = target.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeDraft).filter(Boolean).slice(0, MAX_DRAFTS);
  } catch {
    return [];
  }
}

export function saveDrafts(drafts, store) {
  const target = getStore(store);
  if (!target) return false;
  try {
    const clean = (Array.isArray(drafts) ? drafts : [])
      .map(normalizeDraft)
      .filter(Boolean)
      .slice(0, MAX_DRAFTS);
    target.setItem(DRAFTS_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

export function encodeHash(settings) {
  const normalized = normalizeSettings(settings);
  const params = new URLSearchParams();
  params.set("prompt", normalized.prompt);
  params.set("seed", normalized.seed);
  params.set("mode", normalized.mode);
  if (normalized.lyrics) params.set("lyrics", normalized.lyrics);
  params.set("preset", normalized.presetId);
  params.set("key", String(normalized.key));
  params.set("scale", normalized.scale);
  params.set("tempo", String(normalized.tempo));
  params.set("bars", String(normalized.bars));
  params.set("variation", String(normalized.variation));
  return params.toString();
}

export function decodeHash(hash) {
  const text = String(hash ?? "").replace(/^#/, "");
  if (!text) return null;
  let params;
  try {
    params = new URLSearchParams(text);
  } catch {
    return null;
  }

  const partial = {};
  let found = false;

  if (params.has("prompt")) {
    partial.prompt = params.get("prompt");
    found = true;
  }
  if (params.has("mode")) {
    partial.mode = params.get("mode");
    found = true;
  }
  if (params.has("lyrics")) {
    partial.lyrics = params.get("lyrics");
    found = true;
  }
  if (params.has("preset")) {
    partial.presetId = params.get("preset");
    found = true;
  }
  if (params.has("key")) {
    partial.key = params.get("key");
    found = true;
  }
  if (params.has("scale")) {
    partial.scale = params.get("scale");
    found = true;
  }
  if (params.has("tempo")) {
    partial.tempo = params.get("tempo");
    found = true;
  }
  if (params.has("bars")) {
    partial.bars = params.get("bars");
    found = true;
  }
  if (params.has("variation")) {
    partial.variation = params.get("variation");
    found = true;
  }
  if (params.has("seed")) {
    partial.seed = params.get("seed");
    found = true;
  }
  if (params.has("loop")) {
    partial.loop = params.get("loop") !== "0";
    found = true;
  }
  if (params.has("master")) {
    partial.master = params.get("master");
    found = true;
  }

  if (!found) return null;
  return partial;
}

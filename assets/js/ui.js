import { PART_ORDER, PART_LABELS, PART_COLORS } from "./composer.js";
import { PRESETS, PRESET_CATEGORIES, PRESET_ORDER } from "./presets.js";
import { clamp } from "./util.js";

export function renderPresets(container, activeId, onSelect) {
  if (!container) return;
  container.textContent = "";
  for (const category of PRESET_CATEGORIES) {
    const ids = PRESET_ORDER.filter((id) => PRESETS[id]?.category === category.id);
    if (!ids.length) continue;

    const group = document.createElement("div");
    group.className = "preset-group";
    group.dataset.category = category.id;

    const label = document.createElement("p");
    label.className = "preset-group-label";
    label.textContent = category.name;

    const list = document.createElement("div");
    list.className = "preset-list";
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", category.name);

    for (const id of ids) {
      const preset = PRESETS[id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-chip";
      button.dataset.preset = id;
      button.setAttribute("aria-pressed", "false");

      const name = document.createElement("span");
      name.className = "preset-name";
      name.textContent = preset.name;

      const tagline = document.createElement("span");
      tagline.className = "preset-tagline";
      tagline.textContent = preset.tagline;

      button.append(name, tagline);
      button.addEventListener("click", () => onSelect(id));
      list.append(button);
    }

    group.append(label, list);
    container.append(group);
  }
  updatePresetSelection(container, activeId);
}

export function updatePresetSelection(container, activeId) {
  if (!container) return;
  for (const button of container.querySelectorAll("[data-preset]")) {
    const active = button.dataset.preset === activeId;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

export function renderMixer(container, mix, onChange) {
  if (!container) return;
  container.textContent = "";
  for (const part of PART_ORDER) {
    const state = mix?.[part] || { volume: 0.5, muted: false, solo: false };
    const strip = document.createElement("div");
    strip.className = "mix-strip";
    strip.dataset.part = part;
    strip.style.setProperty("--mix-color", PART_COLORS[part]);

    const head = document.createElement("div");
    head.className = "mix-head";

    const dot = document.createElement("span");
    dot.className = "mix-dot";
    dot.setAttribute("aria-hidden", "true");

    const words = document.createElement("div");
    words.className = "mix-words";
    const name = document.createElement("span");
    name.className = "mix-name";
    name.textContent = PART_LABELS[part];
    const value = document.createElement("span");
    value.className = "mix-value";
    value.textContent = `${Math.round(state.volume * 100)}%`;
    words.append(name, value);
    head.append(dot, words);

    const range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.step = "1";
    range.value = String(Math.round(state.volume * 100));
    range.setAttribute("aria-label", `${PART_LABELS[part]} volume`);
    range.addEventListener("input", () => {
      onChange(part, { volume: Number(range.value) / 100 });
    });

    const buttons = document.createElement("div");
    buttons.className = "mix-buttons";

    const mute = document.createElement("button");
    mute.type = "button";
    mute.className = "mix-toggle";
    mute.textContent = "M";
    mute.title = `Mute ${PART_LABELS[part]}`;
    mute.setAttribute("aria-label", `Mute ${PART_LABELS[part]}`);
    mute.setAttribute("aria-pressed", "false");
    mute.addEventListener("click", () => {
      const current = container.querySelector(`[data-part="${part}"]`);
      const muted = current?.classList.contains("is-muted") ?? false;
      onChange(part, { muted: !muted });
    });

    const solo = document.createElement("button");
    solo.type = "button";
    solo.className = "mix-toggle";
    solo.textContent = "S";
    solo.title = `Solo ${PART_LABELS[part]}`;
    solo.setAttribute("aria-label", `Solo ${PART_LABELS[part]}`);
    solo.setAttribute("aria-pressed", "false");
    solo.addEventListener("click", () => {
      const current = container.querySelector(`[data-part="${part}"]`);
      const soloed = current?.classList.contains("is-solo") ?? false;
      onChange(part, { solo: !soloed });
    });

    buttons.append(mute, solo);
    strip.append(head, range, buttons);
    container.append(strip);
  }
  updateMixer(container, mix);
}

export function updateMixer(container, mix) {
  if (!container || !mix) return;
  for (const part of PART_ORDER) {
    const strip = container.querySelector(`[data-part="${part}"]`);
    if (!strip) continue;
    const state = mix[part] || { volume: 0.5, muted: false, solo: false };
    const range = strip.querySelector('input[type="range"]');
    const value = strip.querySelector(".mix-value");
    const [mute, solo] = strip.querySelectorAll(".mix-toggle");
    const percent = Math.round(clamp(state.volume, 0, 1) * 100);
    if (range) range.value = String(percent);
    if (value) value.textContent = `${percent}%`;
    strip.classList.toggle("is-muted", Boolean(state.muted));
    strip.classList.toggle("is-solo", Boolean(state.solo));
    if (mute) {
      mute.classList.toggle("is-on", Boolean(state.muted));
      mute.setAttribute("aria-pressed", String(Boolean(state.muted)));
    }
    if (solo) {
      solo.classList.toggle("is-on", Boolean(state.solo));
      solo.setAttribute("aria-pressed", String(Boolean(state.solo)));
    }
  }
}

export function renderTags(container, values) {
  if (!container) return;
  container.textContent = "";
  for (const value of values) {
    if (!value) continue;
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = value;
    container.append(tag);
  }
}

const DRUM_HEIGHT = {
  kick: 0.76,
  snare: 0.44,
  clap: 0.44,
  hat: 0.16,
  perc: 0.3,
  tom: 0.58,
  crash: 0.08
};

export function drawArrangement(canvas, arrangement, beat = 0) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height || 248));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const dark = Boolean(window.matchMedia?.("(prefers-color-scheme: dark)")?.matches);
  const labelColor = dark ? "#a89db8" : "#6d6476";
  const laneFill = dark ? "rgba(255,255,255,0.05)" : "rgba(42,36,49,0.045)";
  const laneLine = dark ? "rgba(244,239,248,0.09)" : "rgba(42,36,49,0.08)";
  const sectionFill = dark ? "rgba(255,255,255,0.032)" : "rgba(42,36,49,0.028)";
  const gridColor = dark ? "rgba(244,239,248,0.07)" : "rgba(42,36,49,0.07)";
  const playheadColor = "#d07a3f";

  const pad = { left: 46, right: 12, top: 26, bottom: 10 };
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const plotHeight = Math.max(1, height - pad.top - pad.bottom);
  const font = '600 9px "SFMono-Regular", ui-monospace, monospace';

  if (!arrangement) {
    ctx.fillStyle = labelColor;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillText("Generate a track to see its arrangement", width / 2, height / 2);
    return;
  }

  const totalBeats = Math.max(1, arrangement.totalBeats);
  const beatToX = (value) => pad.left + (clamp(value, 0, totalBeats) / totalBeats) * plotWidth;
  const laneHeight = plotHeight / PART_ORDER.length;

  for (const part of PART_ORDER) {
    const laneTop = pad.top + PART_ORDER.indexOf(part) * laneHeight;
    ctx.fillStyle = laneFill;
    ctx.fillRect(pad.left, laneTop + 2, plotWidth, laneHeight - 4);
    if (PART_ORDER.indexOf(part) > 0) {
      ctx.strokeStyle = laneLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, laneTop);
      ctx.lineTo(pad.left + plotWidth, laneTop);
      ctx.stroke();
    }
    ctx.fillStyle = labelColor;
    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(PART_LABELS[part].toUpperCase(), 8, laneTop + laneHeight / 2);
  }

  let cursorBar = 0;
  arrangement.sections.forEach((section, index) => {
    const startBeat = cursorBar * arrangement.beatsPerBar;
    const endBeat = (cursorBar + section.bars) * arrangement.beatsPerBar;
    const x = beatToX(startBeat);
    const w = beatToX(endBeat) - x;
    if (index % 2 === 0) {
      ctx.fillStyle = sectionFill;
      ctx.fillRect(x, pad.top, w, plotHeight);
    }
    ctx.strokeStyle = laneLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + plotHeight);
    ctx.stroke();
    if (w > 34) {
      ctx.fillStyle = labelColor;
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(section.name.toUpperCase(), x + w / 2, 16);
    }
    cursorBar += section.bars;
  });

  const totalBars = Math.max(1, arrangement.bars);
  const barStep = totalBars > 64 ? 8 : totalBars > 32 ? 4 : totalBars > 16 ? 2 : 1;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let bar = barStep; bar < totalBars; bar += barStep) {
    const x = beatToX(bar * arrangement.beatsPerBar);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + plotHeight);
    ctx.stroke();
  }

  const ranges = {};
  for (const part of PART_ORDER) {
    if (part === "drums") continue;
    const notes = arrangement.parts[part] || [];
    let min = Infinity;
    let max = -Infinity;
    for (const note of notes) {
      if (note.midi < min) min = note.midi;
      if (note.midi > max) max = note.midi;
    }
    ranges[part] = { min, max };
  }

  for (const part of PART_ORDER) {
    const laneTop = pad.top + PART_ORDER.indexOf(part) * laneHeight;
    const notes = arrangement.parts[part] || [];
    ctx.fillStyle = PART_COLORS[part];
    if (part === "drums") {
      for (const hit of notes) {
        const x = beatToX(hit.beat);
        const y = laneTop + laneHeight * (DRUM_HEIGHT[hit.type] ?? 0.5);
        ctx.globalAlpha = 0.45 + clamp(hit.velocity, 0, 1) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const range = ranges[part];
      const span = Math.max(1, range.max - range.min);
      for (const note of notes) {
        const x = beatToX(note.beat);
        const w = Math.max(2, (note.dur / totalBeats) * plotWidth);
        const ratio = (note.midi - range.min) / span;
        const y = laneTop + 4 + (1 - ratio) * (laneHeight - 8);
        ctx.globalAlpha = 0.5 + clamp(note.velocity, 0, 1) * 0.45;
        ctx.fillRect(x, y - 2.4, w, 4.8);
      }
    }
  }
  ctx.globalAlpha = 1;

  const playheadX = beatToX(beat);
  ctx.strokeStyle = playheadColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(playheadX, pad.top - 4);
  ctx.lineTo(playheadX, pad.top + plotHeight);
  ctx.stroke();
  ctx.fillStyle = playheadColor;
  ctx.beginPath();
  ctx.moveTo(playheadX - 4, pad.top - 8);
  ctx.lineTo(playheadX + 4, pad.top - 8);
  ctx.lineTo(playheadX, pad.top - 2);
  ctx.closePath();
  ctx.fill();
}

export function showToast(stack, message, tone = "info", timeout = 3600) {
  if (!stack) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${tone}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  stack.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 260);
  }, timeout);
}

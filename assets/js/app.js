import { PART_LABELS, PART_ORDER, buildArrangement } from "./composer.js";
import { Transport } from "./engine.js";
import { midiBlob, wavBlob } from "./export.js";
import { PRESETS, PRESET_ORDER } from "./presets.js";
import { renderArrangement } from "./render.js";
import { SCALE_LABELS, SCALE_IDS } from "./theory.js";
import {
  arrangementOptions,
  decodeHash,
  defaultMix,
  encodeHash,
  loadSettings,
  normalizeMix,
  normalizeSettings,
  saveSettings
} from "./state.js";
import { NOTE_NAMES, $, clamp, downloadBlob, formatBars, formatTime, slugify } from "./util.js";
import {
  drawArrangement,
  renderMixer,
  renderPresets,
  renderTags,
  showToast,
  updateMixer,
  updatePresetSelection
} from "./ui.js";

const BARS_OPTIONS = [8, 16, 24, 32, 48, 64, 96, 128];

const els = {
  prompt: $("#prompt-input"),
  generate: $("#generate-btn"),
  reroll: $("#reroll-btn"),
  presets: $("#preset-list"),
  key: $("#key-select"),
  scale: $("#scale-select"),
  tempo: $("#tempo-range"),
  tempoOut: $("#tempo-output"),
  bars: $("#bars-select"),
  seed: $("#seed-input"),
  seedHint: $("#seed-hint"),
  variation: $("#variation-output"),
  share: $("#share-btn"),
  title: $("#track-title"),
  eyebrow: $("#track-eyebrow"),
  meta: $("#track-meta"),
  tags: $("#track-tags"),
  play: $("#play-btn"),
  playLabel: $("#play-label"),
  playIcon: $("#play-icon"),
  stop: $("#stop-btn"),
  loop: $("#loop-btn"),
  seek: $("#seek-range"),
  current: $("#time-current"),
  total: $("#time-total"),
  master: $("#master-range"),
  masterOut: $("#master-output"),
  canvas: $("#arrangement-canvas"),
  canvasHint: $("#canvas-hint"),
  mixer: $("#mixer-list"),
  exportWav: $("#export-wav"),
  exportMidi: $("#export-midi"),
  exportStatus: $("#export-status"),
  exportCard: document.querySelector(".export-card"),
  help: $("#help-btn"),
  footerHelp: $("#footer-help"),
  helpDialog: $("#help-dialog"),
  closeHelp: $("#close-help"),
  install: $("#install-btn"),
  toast: $("#toast-stack"),
  live: $("#live-region")
};

const transport = new Transport();
let settings = loadSettings();
let arrangement = null;
let dirty = true;
let lastPaint = 0;
let exportBusy = false;
let installPrompt = null;
let tempoTimer = 0;
let seedTimer = 0;
let promptTimer = 0;

function debounceWithTimer(callback, wait, getTimer, setTimer) {
  return (...args) => {
    clearTimeout(getTimer());
    setTimer(
      setTimeout(() => {
        setTimer(0);
        callback(...args);
      }, wait)
    );
  };
}

const commitTempo = debounceWithTimer(
  () => {
    captureForm();
    generate({ autoplay: transport.playing });
  },
  240,
  () => tempoTimer,
  (value) => {
    tempoTimer = value;
  }
);

const commitSeed = debounceWithTimer(
  () => {
    captureForm();
    generate({ autoplay: transport.playing });
  },
  320,
  () => seedTimer,
  (value) => {
    seedTimer = value;
  }
);

const persistPrompt = debounceWithTimer(
  () => {
    captureForm();
    saveSettings(settings);
  },
  420,
  () => promptTimer,
  (value) => {
    promptTimer = value;
  }
);

function option(value, label) {
  const node = document.createElement("option");
  node.value = String(value);
  node.textContent = label;
  return node;
}

function populateControls() {
  els.key.append(...NOTE_NAMES.map((name, index) => option(index, name)));
  els.scale.append(option("auto", "Preset scale"));
  for (const id of SCALE_IDS) {
    els.scale.append(option(id, SCALE_LABELS[id] || id));
  }
  els.bars.append(...BARS_OPTIONS.map((bars) => option(bars, `${bars} bars`)));
}

function syncControls() {
  els.prompt.value = settings.prompt;
  els.key.value = String(settings.key);
  els.scale.value = settings.scale;
  els.tempo.value = String(settings.tempo);
  els.tempoOut.textContent = `${settings.tempo} BPM`;
  els.bars.value = String(settings.bars);
  els.seed.value = settings.seed;
  els.master.value = String(Math.round(settings.master * 100));
  els.masterOut.textContent = `${Math.round(settings.master * 100)}%`;
  els.variation.textContent = `Variation ${settings.variation}`;
  els.loop.setAttribute("aria-pressed", String(settings.loop));
  els.loop.classList.toggle("is-on", settings.loop);
  updatePresetSelection(els.presets, settings.presetId);
  updateSeedHint();
}

function updateSeedHint() {
  const seed = settings.seed.trim() || settings.prompt.trim() || "softwave";
  els.seedHint.textContent = seed;
}

function formValues() {
  return {
    prompt: els.prompt.value,
    seed: els.seed.value,
    key: els.key.value,
    scale: els.scale.value,
    tempo: els.tempo.value,
    bars: els.bars.value
  };
}

function captureForm() {
  settings = normalizeSettings({ ...settings, ...formValues() });
  updateSeedHint();
  els.tempoOut.textContent = `${settings.tempo} BPM`;
  els.variation.textContent = `Variation ${settings.variation}`;
}

function setStatus(message, tone = "") {
  els.exportStatus.textContent = message;
  els.exportStatus.className = tone ? `status-line is-${tone}` : "status-line";
}

function updateTrack() {
  if (!arrangement) return;
  els.title.textContent = arrangement.title;
  els.eyebrow.textContent = arrangement.presetName;
  els.meta.textContent = `${arrangement.keyName} ${arrangement.scaleName} · ${arrangement.tempo} BPM · ${arrangement.bars} bars · ${formatTime(arrangement.duration)}`;
  const seedTag = arrangement.seed.length > 20 ? `${arrangement.seed.slice(0, 20)}…` : arrangement.seed;
  renderTags(els.tags, [
    `${arrangement.tempo} BPM`,
    `${arrangement.keyName} ${arrangement.scaleName}`,
    `${arrangement.bars} bars`,
    `seed · ${seedTag}`
  ]);
  els.seek.max = String(arrangement.totalBeats);
  els.seek.value = "0";
  els.total.textContent = formatTime(arrangement.duration);
  els.current.textContent = "0:00";
  els.canvasHint.textContent = `Bar ${formatBars(0)} · ${settings.loop ? "loop on" : "loop off"}`;
  document.title = `${arrangement.title} — Softwave`;
}

function updatePosition(beat) {
  if (!arrangement) return;
  const value = clamp(Number(beat) || 0, 0, arrangement.totalBeats);
  els.current.textContent = formatTime(value * arrangement.secondsPerBeat);
  els.canvasHint.textContent = `Bar ${formatBars(value)} · ${settings.loop ? "loop on" : "loop off"}`;
}

function updateTransport() {
  const playing = transport.playing;
  els.play.classList.toggle("is-playing", playing);
  els.playLabel.textContent = playing ? "Pause" : "Play";
  els.playIcon.textContent = playing ? "❚❚" : "▶";
  els.play.setAttribute("aria-label", playing ? "Pause" : "Play");
  els.stop.disabled = !playing && transport.pausedBeat === 0;
  els.loop.setAttribute("aria-pressed", String(settings.loop));
  els.loop.classList.toggle("is-on", settings.loop);
}

function writeHash() {
  try {
    const next = `#${encodeHash(settings)}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  } catch {
    /* history is unavailable in some embeds */
  }
}

async function generate({ autoplay = false, announce = true } = {}) {
  const next = buildArrangement(arrangementOptions(settings));
  next.mix = normalizeMix(settings.mix, settings.presetId);
  settings.mix = next.mix;
  arrangement = next;
  updateTrack();
  updateMixer(els.mixer, settings.mix);
  setStatus("Ready when you are.");
  dirty = true;
  writeHash();
  saveSettings(settings);

  let audioError = null;
  try {
    await transport.load(arrangement);
    transport.setLoop(settings.loop);
    transport.mix?.setMasterVolume(settings.master);
  } catch (error) {
    audioError = error;
    console.error("Softwave audio unavailable:", error);
    setStatus(`Audio unavailable: ${error.message}`, "error");
  }

  updateTransport();
  if (autoplay && !audioError) {
    try {
      await transport.play(0);
    } catch (error) {
      console.error("Softwave playback failed:", error);
      showToast(els.toast, "Press Play to start audio in this browser.", "error");
    }
    updateTransport();
  }

  if (announce) {
    const message = `“${arrangement.title}” · ${arrangement.tempo} BPM · ${arrangement.bars} bars`;
    els.live.textContent = message;
    showToast(els.toast, message, "success");
  }
}

function selectPreset(id) {
  if (!PRESETS[id]) return;
  const wasPlaying = transport.playing;
  const preset = PRESETS[id];
  settings = normalizeSettings({
    ...settings,
    presetId: id,
    tempo: preset.tempo,
    scale: "auto",
    mix: defaultMix(id)
  });
  syncControls();
  updateMixer(els.mixer, settings.mix);
  generate({ autoplay: wasPlaying });
}

async function togglePlay() {
  if (!arrangement) {
    await generate({ autoplay: false, announce: false });
  }
  if (transport.playing) {
    transport.pause();
    const beat = transport.currentBeat();
    els.seek.value = String(beat);
    updatePosition(beat);
    dirty = true;
  } else {
    try {
      await transport.play();
    } catch (error) {
      console.error(error);
      showToast(els.toast, "Audio could not start in this browser.", "error");
    }
  }
  updateTransport();
}

function stopPlayback() {
  transport.stop();
  els.seek.value = "0";
  updatePosition(0);
  dirty = true;
  updateTransport();
}

function toggleLoop() {
  settings.loop = !settings.loop;
  transport.setLoop(settings.loop);
  els.loop.setAttribute("aria-pressed", String(settings.loop));
  els.loop.classList.toggle("is-on", settings.loop);
  saveSettings(settings);
  updatePosition(transport.currentBeat());
}

function reroll() {
  captureForm();
  settings.variation = (settings.variation + 1) % 1000;
  syncControls();
  generate({ autoplay: true });
}

function handleMixChange(part, patch) {
  settings.mix = normalizeMix(
    { ...settings.mix, [part]: { ...settings.mix[part], ...patch } },
    settings.presetId
  );
  if (arrangement) arrangement.mix = settings.mix;
  transport.setMix(settings.mix);
  updateMixer(els.mixer, settings.mix);
  saveSettings(settings);
}

function setExportBusy(busy) {
  exportBusy = busy;
  els.exportWav.disabled = busy;
  els.exportMidi.disabled = busy;
  els.exportCard.classList.toggle("is-busy", busy);
}

async function exportWav() {
  if (exportBusy || !arrangement) return;
  const target = arrangement;
  setExportBusy(true);
  setStatus("Rendering offline audio…", "busy");
  await new Promise((resolve) => setTimeout(resolve, 40));
  try {
    const buffer = await renderArrangement(target);
    const blob = wavBlob(buffer);
    const name = `${slugify(target.title)}-${target.tempo}bpm.wav`;
    downloadBlob(blob, name);
    const size = (blob.size / (1024 * 1024)).toFixed(1);
    setStatus(`WAV ready · ${formatTime(buffer.duration)} · ${size} MB`, "ok");
    showToast(els.toast, `Downloaded ${name}`, "success");
    els.live.textContent = "WAV export finished.";
  } catch (error) {
    console.error("WAV export failed:", error);
    setStatus(`WAV export failed: ${error.message}`, "error");
    showToast(els.toast, "WAV export failed. See the status line.", "error");
  } finally {
    setExportBusy(false);
  }
}

function exportMidi() {
  if (exportBusy || !arrangement) return;
  try {
    setStatus("Writing MIDI…", "busy");
    const blob = midiBlob(arrangement);
    const name = `${slugify(arrangement.title)}-${arrangement.tempo}bpm.mid`;
    downloadBlob(blob, name);
    setStatus(`MIDI ready · 5 tracks · ${arrangement.bars} bars`, "ok");
    showToast(els.toast, `Downloaded ${name}`, "success");
    els.live.textContent = "MIDI export finished.";
  } catch (error) {
    console.error("MIDI export failed:", error);
    setStatus(`MIDI export failed: ${error.message}`, "error");
  }
}

async function copyShareLink() {
  writeHash();
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast(els.toast, "Share link copied — same seed, same track.", "success");
  } catch {
    window.prompt("Copy this share link", url);
  }
}

function openHelp() {
  if (typeof els.helpDialog.showModal === "function") {
    els.helpDialog.showModal();
  } else {
    els.helpDialog.setAttribute("open", "");
  }
}

function closeHelp() {
  if (typeof els.helpDialog.close === "function") {
    els.helpDialog.close();
  } else {
    els.helpDialog.removeAttribute("open");
  }
}

function isTyping(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function handleShortcut(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTyping(event.target)) return;
  const key = event.key.toLowerCase();

  if (event.key === " " || event.code === "Space") {
    if (event.target.closest?.("button, a, summary")) return;
    event.preventDefault();
    togglePlay();
    return;
  }

  if (key === "g") {
    event.preventDefault();
    captureForm();
    generate({ autoplay: true });
  } else if (key === "r") {
    event.preventDefault();
    reroll();
  } else if (key === "l") {
    event.preventDefault();
    toggleLoop();
  } else if (key === "w") {
    event.preventDefault();
    exportWav();
  } else if (key === "m") {
    event.preventDefault();
    exportMidi();
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    if (!arrangement) return;
    event.preventDefault();
    const step = event.shiftKey ? 4 : 1;
    const beat = transport.currentBeat() + (event.key === "ArrowRight" ? step : -step);
    transport.seek(beat);
    els.seek.value = String(clamp(beat, 0, arrangement.totalBeats));
    updatePosition(beat);
    dirty = true;
    updateTransport();
  }
}

function bindEvents() {
  els.generate.addEventListener("click", () => {
    captureForm();
    generate({ autoplay: true });
  });
  els.reroll.addEventListener("click", reroll);
  renderPresets(els.presets, settings.presetId, selectPreset);

  els.key.addEventListener("change", () => {
    captureForm();
    generate({ autoplay: transport.playing });
  });
  els.scale.addEventListener("change", () => {
    captureForm();
    generate({ autoplay: transport.playing });
  });
  els.bars.addEventListener("change", () => {
    captureForm();
    generate({ autoplay: transport.playing });
  });
  els.tempo.addEventListener("input", () => {
    els.tempoOut.textContent = `${els.tempo.value} BPM`;
    commitTempo();
  });
  els.prompt.addEventListener("input", () => {
    updateSeedHint();
    persistPrompt();
  });
  els.seed.addEventListener("input", () => {
    updateSeedHint();
    commitSeed();
  });
  els.share.addEventListener("click", copyShareLink);

  els.play.addEventListener("click", togglePlay);
  els.stop.addEventListener("click", stopPlayback);
  els.loop.addEventListener("click", toggleLoop);
  els.seek.addEventListener("input", () => {
    if (!arrangement) return;
    const beat = Number(els.seek.value);
    transport.seek(beat);
    updatePosition(beat);
    dirty = true;
    updateTransport();
  });
  els.master.addEventListener("input", () => {
    settings.master = clamp(Number(els.master.value) / 100, 0, 1);
    els.masterOut.textContent = `${Math.round(settings.master * 100)}%`;
    transport.mix?.setMasterVolume(settings.master);
    saveSettings(settings);
  });

  renderMixer(els.mixer, settings.mix, handleMixChange);

  els.exportWav.addEventListener("click", exportWav);
  els.exportMidi.addEventListener("click", exportMidi);
  els.help.addEventListener("click", openHelp);
  els.footerHelp.addEventListener("click", openHelp);
  els.closeHelp.addEventListener("click", closeHelp);
  els.helpDialog.addEventListener("click", (event) => {
    if (event.target === els.helpDialog) closeHelp();
  });

  document.addEventListener("keydown", handleShortcut);
  window.addEventListener("hashchange", () => {
    const shared = decodeHash(location.hash);
    if (!shared) return;
    settings = normalizeSettings({ ...settings, ...shared });
    syncControls();
    updateMixer(els.mixer, settings.mix);
    generate({ autoplay: false, announce: true });
  });

  transport.onEnd = () => {
    updateTransport();
    els.seek.value = "0";
    updatePosition(0);
    dirty = true;
  };

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      dirty = true;
    }).observe(els.canvas);
  } else {
    window.addEventListener("resize", () => {
      dirty = true;
    });
  }

  const theme = window.matchMedia?.("(prefers-color-scheme: dark)");
  theme?.addEventListener?.("change", () => {
    dirty = true;
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    els.install.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    els.install.hidden = true;
    showToast(els.toast, "Softwave installed.", "success");
  });
  if (window.matchMedia?.("(display-mode: standalone)").matches) {
    els.install.hidden = true;
  }
  els.install.addEventListener("click", async () => {
    if (!installPrompt) {
      showToast(els.toast, "Use your browser menu → Install app.", "info", 4600);
      return;
    }
    installPrompt.prompt();
    try {
      await installPrompt.userChoice;
    } catch {
      /* the user dismissed the prompt */
    }
    installPrompt = null;
    els.install.hidden = true;
  });
}

function frameLoop(timestamp) {
  if (timestamp - lastPaint >= 32) {
    lastPaint = timestamp;
    const position = transport.position();
    if (transport.playing) {
      els.seek.value = String(position.beat);
      updatePosition(position.beat);
      dirty = true;
    }
    if (dirty && arrangement) {
      drawArrangement(els.canvas, arrangement, position.beat);
      dirty = false;
    }
  }
  requestAnimationFrame(frameLoop);
}

function applySharedHash() {
  const shared = decodeHash(location.hash);
  if (!shared) return;
  settings = normalizeSettings({ ...settings, ...shared });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const secure =
    location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";
  if (!secure) return;
  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.warn("Service worker registration failed:", error);
  });
}

async function init() {
  populateControls();
  applySharedHash();
  syncControls();
  bindEvents();
  updateTransport();
  await generate({ autoplay: false, announce: false });
  registerServiceWorker();
  requestAnimationFrame(frameLoop);
  if (PART_ORDER.length !== Object.keys(PART_LABELS).length) {
    console.warn("Softwave part labels are out of sync.");
  }
  if (PRESET_ORDER.length !== Object.keys(PRESETS).length) {
    console.warn("Softwave preset order is out of sync.");
  }
}

init().catch((error) => {
  console.error("Softwave failed to start:", error);
  setStatus(`Softwave failed to start: ${error.message}`, "error");
});

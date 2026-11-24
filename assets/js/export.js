const DRUM_NOTES = {
  kick: 36,
  snare: 38,
  clap: 39,
  hat: 42,
  perc: 37,
  tom: 45,
  crash: 49
};

function writeAscii(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

export function encodeWav(buffer, { bitDepth = 16 } = {}) {
  if (bitDepth !== 16 && bitDepth !== 32) {
    throw new Error("Only 16-bit and 32-bit WAV are supported.");
  }
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = channels * bytesPerSample;
  const dataSize = length * blockAlign;
  const array = new ArrayBuffer(44 + dataSize);
  const view = new DataView(array);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const data = [];
  for (let channel = 0; channel < channels; channel += 1) {
    data.push(buffer.getChannelData(channel));
  }

  let offset = 44;
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, data[channel][i]));
      if (bitDepth === 16) {
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      } else {
        view.setInt32(offset, sample < 0 ? sample * 0x80000000 : sample * 0x7fffffff, true);
      }
      offset += bytesPerSample;
    }
  }

  return array;
}

function variableLength(value) {
  let buffer = value & 0x7f;
  const bytes = [];
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  for (;;) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bytes;
}

function metaText(text) {
  const data = new TextEncoder().encode(text);
  return [0xff, 0x03, data.length, ...data];
}

function trackChunk(bytes) {
  const length = bytes.length;
  return [
    0x4d, 0x54, 0x72, 0x6b,
    (length >>> 24) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff,
    ...bytes
  ];
}

export function encodeMidi(arrangement) {
  const ppq = 480;
  const tracks = [];
  const tempo = Math.round(60000000 / arrangement.tempo);

  tracks.push([
    0x00, ...metaText("Softwave"),
    0x00, 0xff, 0x51, 0x03,
    (tempo >>> 16) & 0xff, (tempo >>> 8) & 0xff, tempo & 0xff,
    0x00, 0xff, 0x2f, 0x00
  ]);

  const definitions = [
    { part: "pad", channel: 0, program: 88, name: "Pad" },
    { part: "bass", channel: 1, program: 37, name: "Bass" },
    { part: "arp", channel: 2, program: 80, name: "Arp" },
    { part: "melody", channel: 3, program: 79, name: "Melody" },
    { part: "drums", channel: 9, program: null, name: "Drums" }
  ];

  for (const definition of definitions) {
    const events = [];
    if (definition.part === "drums") {
      for (const hit of arrangement.parts.drums) {
        const note = DRUM_NOTES[hit.type] ?? 36;
        const tick = Math.max(0, Math.round(hit.beat * ppq));
        const velocity = Math.max(1, Math.min(127, Math.round(hit.velocity * 127)));
        events.push({ tick, on: true, note, velocity });
        events.push({ tick: tick + Math.round(0.1 * ppq), on: false, note, velocity: 0 });
      }
    } else {
      for (const note of arrangement.parts[definition.part]) {
        const tick = Math.max(0, Math.round(note.beat * ppq));
        const length = Math.max(1, Math.round(note.dur * ppq));
        const velocity = Math.max(1, Math.min(127, Math.round(note.velocity * 127)));
        events.push({ tick, on: true, note: Math.round(note.midi), velocity });
        events.push({ tick: tick + length, on: false, note: Math.round(note.midi), velocity: 0 });
      }
    }

    events.sort((a, b) => a.tick - b.tick || Number(a.on) - Number(b.on));

    const bytes = [0x00, ...metaText(definition.name)];
    if (definition.program !== null) {
      bytes.push(0x00, 0xc0 | definition.channel, definition.program);
    }

    let lastTick = 0;
    for (const event of events) {
      const delta = Math.max(0, event.tick - lastTick);
      bytes.push(...variableLength(delta));
      if (event.on) {
        bytes.push(0x90 | definition.channel, event.note & 0x7f, event.velocity & 0x7f);
      } else {
        bytes.push(0x80 | definition.channel, event.note & 0x7f, 0x00);
      }
      lastTick = event.tick;
    }
    bytes.push(0x00, 0xff, 0x2f, 0x00);
    tracks.push(bytes);
  }

  const header = [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x01,
    0x00, tracks.length,
    0x01, 0xe0
  ];

  const output = [...header];
  for (const track of tracks) {
    output.push(...trackChunk(track));
  }
  return new Uint8Array(output);
}

export function wavBlob(buffer, options = {}) {
  return new Blob([encodeWav(buffer, options)], { type: "audio/wav" });
}

export function midiBlob(arrangement) {
  return new Blob([encodeMidi(arrangement)], { type: "audio/midi" });
}

export { DRUM_NOTES };

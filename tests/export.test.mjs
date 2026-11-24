import test from "node:test";
import assert from "node:assert/strict";

import { encodeMidi, encodeWav, midiBlob, wavBlob } from "../assets/js/export.js";
import { buildArrangement } from "../assets/js/composer.js";

function fakeStereoBuffer() {
  const data = [
    Float32Array.from([0, 0.5, -0.5, 1]),
    Float32Array.from([0, -1, 0.25, 0])
  ];
  return {
    numberOfChannels: 2,
    length: 4,
    sampleRate: 44100,
    duration: 4 / 44100,
    getChannelData(channel) {
      return data[channel];
    }
  };
}

function ascii(view, offset, length) {
  let text = "";
  for (let i = 0; i < length; i += 1) text += String.fromCharCode(view.getUint8(offset + i));
  return text;
}

test("encodeWav writes a valid 16-bit stereo header and data", () => {
  const buffer = fakeStereoBuffer();
  const array = encodeWav(buffer);
  const view = new DataView(array);
  assert.equal(array.byteLength, 44 + 4 * 2 * 2);
  assert.equal(ascii(view, 0, 4), "RIFF");
  assert.equal(view.getUint32(4, true), 36 + 16);
  assert.equal(ascii(view, 8, 4), "WAVE");
  assert.equal(ascii(view, 12, 4), "fmt ");
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 2);
  assert.equal(view.getUint32(24, true), 44100);
  assert.equal(view.getUint16(32, true), 4);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(ascii(view, 36, 4), "data");
  assert.equal(view.getUint32(40, true), 16);
  assert.equal(view.getInt16(44, true), 0);
  assert.equal(view.getInt16(46, true), 0);
  assert.equal(view.getInt16(48, true), Math.floor(0.5 * 0x7fff));
  assert.equal(view.getInt16(50, true), -0x8000);
});

test("encodeWav rejects unsupported bit depths", () => {
  assert.throws(() => encodeWav(fakeStereoBuffer(), { bitDepth: 24 }), /Only 16-bit/);
});

test("encodeMidi writes a type-1 file with five instrument tracks", () => {
  const arrangement = buildArrangement({
    seed: "midi test",
    prompt: "midi test",
    presetId: "chill",
    bars: 8
  });
  const bytes = encodeMidi(arrangement);
  assert.ok(bytes instanceof Uint8Array);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(ascii(view, 0, 4), "MThd");
  assert.equal(view.getUint32(4), 6);
  assert.equal(view.getUint16(8), 1);
  assert.equal(view.getUint16(10), 6);
  assert.equal(view.getUint16(12), 480);

  const text = Buffer.from(bytes).toString("latin1");
  assert.equal((text.match(/MTrk/g) || []).length, 6);
  assert.ok(bytes.length > 200);
});

test("blob helpers expose the right MIME types", () => {
  assert.equal(wavBlob(fakeStereoBuffer()).type, "audio/wav");
  const arrangement = buildArrangement({ seed: "blob", presetId: "lofi", bars: 8 });
  assert.equal(midiBlob(arrangement).type, "audio/midi");
});

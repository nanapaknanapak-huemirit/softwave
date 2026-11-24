# 03 — Arrangement

## Sections

Length is normalised to multiples of four bars between 8 and 128.

- **8 bars**: two halves (A, B).
- **12–15 bars**: short intro and outro with one middle block.
- **16+ bars**: 4-bar intro, 4-bar outro and 4- or 8-bar middle blocks named A, B, A2, B2, A3, B3.
- Intensity rises from Intro → A → B, varies through the middle and drops for the Outro. Each section gets a small deterministic jitter.

## Lanes

| Lane | Role | Register | Entry rule |
| --- | --- | --- | --- |
| Pad | Harmony bed | C3–G5 | Always plays |
| Bass | Root motion | C1–E3 | Intensity ≥ 0.42 |
| Arp | Motion/texture | G3–C7 | Intensity ≥ preset threshold |
| Melody | Hook | C4–G6 | Intensity ≥ preset threshold |
| Drums | Pulse | — | Intensity ≥ preset threshold |

Pad chords are one per bar. Bass and arp are 16-step patterns. Melody phrases are two bars. Drums are per-bar patterns plus fills.

## Timeline

The canvas shows five horizontal lanes. Pitched notes are blocks positioned by beat and pitch range; drum hits are small dots offset by drum type. Section names and boundaries sit above the lanes, bar grid lines below them. A vertical amber playhead follows playback and seeking.

## Mixer

Five strips: Pad, Bass, Arp, Melody, Drums. Each has a volume fader plus mute and solo. The any-solo rule applies: if any lane is soloed, only soloed lanes are audible. Changes are smoothed with short gain targets and applied to the offline render as well.

## Export lengths

WAV duration = `bars × 4 × 60 / tempo` plus a 3-second tail for reverb and release. MIDI uses 480 PPQ, a tempo meta event, five tracks and drums on channel 10.

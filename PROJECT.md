# Softwave — project brief

## Goal

Build a simpler, local alternative to prompt-driven music services: one prompt box in, one original sketch out — instrumental or a melody guide for your own lyrics — with no account, upload or API key. The result should feel immediate, sound intentional and be reproducible from a seed.

## Audience

- Someone who wants background music for a video, study session or prototype without opening a full DAW.
- A creator who wants a starting point they can export as WAV or MIDI and keep working on.
- Anyone who prefers private, on-device tools.

## Scope

In scope:

- One prompt field with 18 preset chips grouped into subgenres, atmospheres and functional music, plus key, scale, tempo and length controls.
- Deterministic composition: sections, chords, bass, arpeggio, melody and drums.
- A lyrics mode that turns lines and syllables into an original, syllable-aligned guide melody.
- A songwriter for composing original lyrics: sections, per-line syllable counts, offline rhyme hints and named local drafts.
- Real-time playback with play/pause, stop, seek, loop and a master volume.
- A five-lane arrangement timeline and a mixer with volume, mute and solo.
- WAV (16-bit stereo) and MIDI (Type-1) export.
- Persistence of settings, mix, prompt and lyrics; a share link using URL parameters.
- Installable PWA shell with offline caching.
- Unit tests, a static check and a deployable `_site/` build.

Out of scope:

- Neural audio generation, synthesized singing, voice cloning or covers.
- Accounts, cloud storage, collaboration or a backend.
- Mobile-native apps or DAW plugin formats.
- Sample libraries or downloaded instruments.

## Design principles

1. **One box, one button.** The prompt is the hero; everything else is optional tuning.
2. **Instant and private.** Composition and rendering stay in the page.
3. **Reproducible.** Same inputs produce the same notes; share links carry the seed.
4. **Musical, not random.** Theory, motifs and section arcs do the work, not noise.
5. **Legible.** The timeline and mixer should explain what the listener is hearing.

## Architecture

Vanilla ES modules, zero runtime dependencies. Pure modules (`seed`, `theory`, `presets`, `lyrics`, `songwriter`, `rhymes`, `composer`, `export`, `state`) are testable in Node. Browser-only modules (`app`, `ui`, `engine`, `render`, `instruments`, `effects`) are kept thin and deterministic where possible.

The app follows the AI-Studio convention: deployable app at the project root, numbered production docs around it, and no changes to `.opencode/`, agents or pipelines.

## Status

`beta` — implementation complete for the scope above. Unit tests, static check and build pass. Real browser audio, visual layout and install flow are **NOT TESTED** automatically and need a human review; see `05-review/review.md`.

## Acceptance criteria

- [x] A new track can be generated from a prompt and a preset.
- [x] The preset palette is grouped and every preset builds a valid arrangement.
- [x] Lyrics mode produces a deterministic, syllable-aligned guide melody.
- [x] The songwriter builds sections, counts syllables, suggests offline rhymes and saves named drafts.
- [x] The same seed and options rebuild the same notes.
- [x] Melody generation uses no corpus, lookup, sampling or network call.
- [x] Play/pause, stop, seek, loop and master volume work in the transport code.
- [x] Mixer changes update the live mix and the exported mix.
- [x] WAV and MIDI encoders produce structurally valid files in tests.
- [x] Settings survive a reload via `localStorage`.
- [x] Share links round-trip prompt, seed, mode, lyrics and musical settings.
- [x] App shell, manifest, icons and service worker are present and checked.
- [ ] Human passes playback, export and PWA checks in Chrome/Firefox.

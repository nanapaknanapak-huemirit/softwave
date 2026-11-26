# 04 — Production report

## Summary

Softwave was scaffolded on 2026-11-22 as a sibling to the Stillwave browser studio. The first session produced the deterministic music core (PRNG, theory, presets, composer), the Web Audio layer (instruments, effects, transport, offline render) and the WAV/MIDI encoders. The second session completed the application shell, styling, state/ui modules, PWA assets, scripts, tests and docs. The third session (2026-11-25) expanded the palette to 18 categorized presets and added the syllable-aligned lyrics melody guide. The fourth session (2026-11-26) added a fully offline lyric songwriter: sections, per-line syllable counts, an original rhyme bank, clickable rhyme hints and named local drafts.

## What was built

- `assets/js/seed.js` — mulberry32 PRNG with string hashing, forks and weighted picks.
- `assets/js/theory.js` — scales, chords, voicings, pitch helpers.
- `assets/js/presets.js` — 18 categorized presets, prompt parsing, title generation.
- `assets/js/lyrics.js` — lyric line parsing, syllable estimation, rhythm planning and melody fingerprints.
- `assets/js/rhymes.js` — hand-written English rhyme bank, rhyme keys and on-device suggestions.
- `assets/js/songwriter.js` — section/line draft model, immutable edits, plain-text serialisation, stats and rhyme helpers.
- `assets/js/composer.js` — section planning, pad/bass/arp/melody/drums, lyrics guide melody, deterministic flatten.
- `assets/js/instruments.js` — subtractive synths and drums.
- `assets/js/effects.js` — reverb, delay, high-pass, compressor, per-lane sends.
- `assets/js/engine.js` — lookahead transport with loop, pause, seek and mix updates.
- `assets/js/render.js` — offline render for export.
- `assets/js/export.js` — 16-bit WAV and Type-1 MIDI writers.
- `assets/js/state.js` — defaults, normalisation, persistence, share hashes and named lyric drafts.
- `assets/js/ui.js` — grouped presets, songwriter sections, mixer, tags, timeline canvas, toasts.
- `assets/js/app.js` — wiring, songwriter controller, shortcuts, install prompt, export flow.
- `index.html`, `assets/css/*` — responsive pastel studio UI with dark-mode tokens.
- PWA shell: manifest, service worker, favicon and generated PNG icons.
- Scripts: static server, integrity checker, site build, icon generator.
- Tests: seed, theory, composer, presets, lyrics, songwriter, export and state suites.
- Docs: concept, music design, arrangement, this report and review.

## Verification performed

```bash
node scripts/make-icons.mjs
npm test
npm run check
npm run build
node scripts/serve.mjs   # checked with a local HTTP request
```

Unit suites cover determinism, musical bounds, prompt mapping, preset categories, lyric parsing, lyric rhythm, songwriter sections/rhymes/serialisation, draft storage, hash round-trips, storage and encoders. The checker validates HTML references, ids, imports, manifest icons, service-worker shell entries, required files and package scripts, and rejects runtime network APIs in `assets/js`. A headless Firefox smoke run (temporary harness, removed afterwards) confirmed the canvas renders, presets update the track, transport/mute/seek controls respond and the help dialog opens with no runtime errors. A later headless screenshot pass at 390, 768 and 1440 px confirmed the grouped preset browser, lyrics mode, mixer and export render in both instrumental and lyrics modes; this pass caught and fixed a desktop column gap and cramped mixer labels. A headless Firefox pass against the built site also verified the v4 service worker: it registers, serves edited HTML immediately on reload (network-first) and falls back to the cached shell when the server is stopped. A final headless pass exercised the songwriter end to end: open lyrics mode, type a line (live syllable count and rhyme chips), click a rhyme, add and reorder sections, change a section type, paste via the raw-text toggle, save a named draft, reload and confirm both lyrics and drafts persist.

## Not verified

- Real speaker playback, browser autoplay policy behaviour and perceived loudness.
- Light/dark theme switching and full interaction layout checks in Chrome and Firefox.
- Service-worker upgrade from a pre-existing stale cache in a real user profile (the v4 install, network-first reload and offline fallback were verified headlessly).
- WAV/MIDI files opened in a DAW.
- Lyric line/syllable alignment and the melody fingerprint in a real browser.
- Songwriter rhyme quality, draft naming and long-lyrics overflow in a real browser profile.

These are marked **NOT TESTED** and need a human pass. See `05-review/review.md`.

## Decisions

- Zero runtime dependencies to keep the project portable and private.
- App at the project root, numbered docs around it, matching AI-Studio convention.
- Seed is derived from the prompt unless the user supplies one; variation is a separate reroll counter.
- Share state lives in the URL fragment so it never reaches a server.
- Icons are generated from code with a tiny PNG encoder, avoiding image-tool dependencies.
- Lyrics reuse the melody lane instead of adding a sixth lane, so the mixer, canvas, renderer and MIDI writer stay unchanged.
- Originality is enforced by construction (no corpus, lookup, sampling or network) and surfaced as a melody fingerprint; it is not a legal guarantee against coincidental similarity.

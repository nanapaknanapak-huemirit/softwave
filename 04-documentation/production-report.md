# 04 — Production report

## Summary

Softwave was scaffolded on 2026-11-22 as a sibling to the Stillwave browser studio. The first session produced the deterministic music core (PRNG, theory, presets, composer), the Web Audio layer (instruments, effects, transport, offline render) and the WAV/MIDI encoders. The second session completed the application shell, styling, state/ui modules, PWA assets, scripts, tests and docs.

## What was built

- `assets/js/seed.js` — mulberry32 PRNG with string hashing, forks and weighted picks.
- `assets/js/theory.js` — scales, chords, voicings, pitch helpers.
- `assets/js/presets.js` — six mood presets, prompt parsing, title generation.
- `assets/js/composer.js` — section planning, pad/bass/arp/melody/drums, deterministic flatten.
- `assets/js/instruments.js` — subtractive synths and drums.
- `assets/js/effects.js` — reverb, delay, high-pass, compressor, per-lane sends.
- `assets/js/engine.js` — lookahead transport with loop, pause, seek and mix updates.
- `assets/js/render.js` — offline render for export.
- `assets/js/export.js` — 16-bit WAV and Type-1 MIDI writers.
- `assets/js/state.js` — defaults, normalisation, persistence, share hashes.
- `assets/js/ui.js` — presets, mixer, tags, timeline canvas, toasts.
- `assets/js/app.js` — wiring, shortcuts, install prompt, export flow.
- `index.html`, `assets/css/*` — responsive pastel studio UI with dark-mode tokens.
- PWA shell: manifest, service worker, favicon and generated PNG icons.
- Scripts: static server, integrity checker, site build, icon generator.
- Tests: seed, theory, composer, presets, export and state suites.
- Docs: concept, music design, arrangement, this report and review.

## Verification performed

```bash
node scripts/make-icons.mjs
npm test
npm run check
npm run build
node scripts/serve.mjs   # checked with a local HTTP request
```

Unit suites cover determinism, musical bounds, prompt mapping, hash round-trips, storage and encoders. The checker validates HTML references, ids, imports, manifest icons, service-worker shell entries, required files and package scripts. A headless Firefox smoke run (temporary harness, removed afterwards) confirmed the canvas renders, presets update the track, transport/mute/seek controls respond and the help dialog opens with no runtime errors.

## Not verified

- Real speaker playback, browser autoplay policy behaviour and perceived loudness.
- Visual layout at phone/tablet/desktop widths in Chrome and Firefox.
- Service-worker install and offline reload in a real browser.
- WAV/MIDI files opened in a DAW.

These are marked **NOT TESTED** and need a human pass. See `05-review/review.md`.

## Decisions

- Zero runtime dependencies to keep the project portable and private.
- App at the project root, numbered docs around it, matching AI-Studio convention.
- Seed is derived from the prompt unless the user supplies one; variation is a separate reroll counter.
- Share state lives in the URL fragment so it never reaches a server.
- Icons are generated from code with a tiny PNG encoder, avoiding image-tool dependencies.

# 05 — Review

## Automated checks

| Check | Result |
| --- | --- |
| `npm test` | pass |
| `npm run check` | pass |
| `npm run build` | pass |
| Static server responds | pass (HTTP 200 for `/` and modules) |
| Icon generation | pass |
| Headless interaction smoke | pass (14 checks: canvas paint, presets, transport toggles, mute, seek, help dialog, no runtime errors) — predates the categorized palette and lyrics mode |
| Headless layout screenshots | pass (1440, 768 and 390 px; instrumental and lyrics modes; grouped presets, mixer labels, no column gaps) |

## Human checks still required

These are **NOT TESTED** by automation and should be confirmed before calling the project `approved`:

1. **Playback** — press Play in Chrome and Firefox; confirm sound, no clicks at loop boundaries, and that pause/resume keeps position.
2. **Autoplay policy** — press Generate from a fresh page and confirm the track starts (the click is a user gesture).
3. **Seeking** — drag the timeline while playing; the playhead should jump without runaway audio.
4. **Mixer** — mute and solo each lane; exported WAV should match the live mix.
5. **WAV export** — open the file in a DAW or media player; confirm duration, stereo and levels.
6. **MIDI export** — open in a DAW; confirm five instrument tracks, tempo, drums on channel 10, sensible notes, and a "Vocal Melody" track name in lyrics mode.
7. **Persistence** — change prompt/preset/mix/lyrics, reload, confirm they return.
8. **Share link** — copy the link, open in a new session, confirm the same title, seed, mode and lyrics.
9. **Responsive layout** — screenshots pass at 390 px, 768 px and 1440 px; still confirm light/dark mode and real interaction at those widths.
10. **PWA** — install, go offline, reload; the shell should still open.
11. **Accessibility** — keyboard-only pass, focus visibility, dialog focus trap, timer/slider labels, mode-toggle labels.
12. **Preset palette** — every one of the 18 chips selects, regenerates and shows the correct category group.
13. **Lyrics mode** — toggle the mode, paste lines, confirm the live line/syllable hint, phrase placement after the intro, overflow warning when lines do not fit, and a stable fingerprint for the same lyrics and seed.
14. **Originality notice** — confirm the lyrics note is visible and the network panel shows no requests during generation or export.

## Known limitations

- Melody register can occasionally sit above the pad's top note; this is musical, not a bug.
- Offline rendering blocks only asynchronously; very long tracks (128 bars) can take several seconds and use a lot of memory.
- The service worker caches all JS eagerly; the cache name was bumped to `softwave-shell-v2` for this release.
- No true mobile install prompt fallback beyond a toast.
- Syllable counting is a heuristic; irregular words may be approximate. The live hint is a guide, not a pronunciation dictionary.
- "Original" means algorithmically generated with no corpus, lookup, sampling or network. It is not a legal guarantee against coincidental similarity; users remain responsible for final clearance.
- Long lyrics produce long share URLs; the field is capped at 2000 characters.

## Suggested next steps

- Add a waveform/progress overlay or per-lane meters.
- Add a small count-in and a metronome toggle for exporting ideas.
- Allow custom chord progressions or a "seed lock" toggle.
- Add manual syllable overrides for lyric lines with irregular pronunciation.
- Extend the headless Firefox smoke pass into a repeatable Playwright suite if the environment gains one.

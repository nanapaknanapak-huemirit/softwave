# 05 — Review

## Automated checks

| Check | Result |
| --- | --- |
| `npm test` | pass |
| `npm run check` | pass |
| `npm run build` | pass |
| Static server responds | pass (HTTP 200 for `/` and modules) |
| Icon generation | pass |
| Headless browser smoke | pass (14 checks: canvas paint, presets, transport toggles, mute, seek, help dialog, no runtime errors) |

## Human checks still required

These are **NOT TESTED** by automation and should be confirmed before calling the project `approved`:

1. **Playback** — press Play in Chrome and Firefox; confirm sound, no clicks at loop boundaries, and that pause/resume keeps position.
2. **Autoplay policy** — press Generate from a fresh page and confirm the track starts (the click is a user gesture).
3. **Seeking** — drag the timeline while playing; the playhead should jump without runaway audio.
4. **Mixer** — mute and solo each lane; exported WAV should match the live mix.
5. **WAV export** — open the file in a DAW or media player; confirm duration, stereo and levels.
6. **MIDI export** — open in a DAW; confirm five tracks, tempo, drums on channel 10 and sensible notes.
7. **Persistence** — change prompt/preset/mix, reload, confirm they return.
8. **Share link** — copy the link, open in a new session, confirm the same title and seed.
9. **Responsive layout** — check 390 px, 768 px and 1440 px widths in light and dark mode.
10. **PWA** — install, go offline, reload; the shell should still open.
11. **Accessibility** — keyboard-only pass, focus visibility, dialog focus trap, timer/slider labels.

## Known limitations

- Melody register can occasionally sit above the pad's top note; this is musical, not a bug.
- Offline rendering blocks only asynchronously; very long tracks (128 bars) can take several seconds and use a lot of memory.
- The service worker caches all JS eagerly; bump the cache name when changing shell files.
- No true mobile install prompt fallback beyond a toast.

## Suggested next steps

- Add a waveform/progress overlay or per-lane meters.
- Add a small count-in and a metronome toggle for exporting ideas.
- Allow custom chord progressions or a "seed lock" toggle.
- Extend the headless Firefox smoke pass into a repeatable Playwright suite if the environment gains one.

# 0xPUZZLE

A 2D platformer where you solve binary and hexadecimal puzzles across 10 levels:
flip bit switches, turn hex dials, wire logic gates, and walk through the exit gate.
Playable on desktop and on phones.

## Play

- **Desktop:** `A`/`D` or arrow keys to move, `W`/`Space` to jump, `E`/`Enter` to interact,
  `H` for a hint, `R` to reset the level. You can also click switches and dials directly.
- **Phone:** an analog stick on the left (push further to walk faster), plus interact and
  jump buttons on the right. Tap switches directly. Rotate your phone sideways for a bigger play area.
- **Fullscreen:** on phones, tap "Play Fullscreen" on the start screen, or use the fullscreen
  button in the top bar. If you rotate to landscape later, a "Tap for fullscreen" button appears,
  and your next touch on the game also enters fullscreen. On iPhone, Safari doesn't allow fullscreen from a web page, so tap
  Share, then "Add to Home Screen", and open the game from your home screen.
- **Sound:** sound effects and background music are on by default. Browsers only allow audio
  after you tap or press a key, so it starts on your first interaction. Use the speaker and
  music buttons in the top bar to mute either one; your choice is remembered. On iPhone, make
  sure the ring/silent switch is not on silent.

## Run locally

Requires Node.js 20.19 or newer (or 22.12+). Check with `node -v`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in dist/
```

## Tech

React, TypeScript, Vite, Tailwind CSS, and the HTML canvas. All sound effects and
music are generated in code with the Web Audio API, so there are no audio files.

## Credits

- Fonts: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P),
  [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), and
  [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), all under the SIL Open Font License.
- Icons: [Lucide](https://lucide.dev) (ISC license).

## License

MIT. Copyright (c) 2026 JM. See [LICENSE](LICENSE).

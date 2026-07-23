# 🎮 Trivia Boy

A retro Game Boy–style trivia game built with **React Native + Expo**. Runs in
the browser and on any phone (iOS / Android) via **Expo Go**, and is fully
responsive to any screen size.

## Features

- **Home screen** — pick a nickname (auto-generates a pixel avatar) and press START.
- **Game screen** — one question at a time, showing your name, avatar, live score,
  and question number with a progress bar. 4 hardcoded questions.
- **Results screen** — final score, number of correct answers (with ★ pips), a
  persistent local leaderboard that highlights your run, and a **Share** button.
- Authentic DMG Game Boy shell (green LCD, D-pad, A/B buttons) that scales to fit
  any viewport — phone, tablet, or browser window.

## Run it

```bash
npm install          # first time only (already done if you scaffolded here)

npm start            # start the Expo dev server (QR code for Expo Go)
# or target a platform directly:
npm run web          # open in a browser
npm run ios          # iOS simulator
npm run android      # Android emulator
```

Scan the QR code from `npm start` with the **Expo Go** app on your phone.

## Project structure

```
App.js                     # root: font loading + screen navigation state
src/
  theme.js                 # DMG color palette + shell colors + layout tuning
  data/questions.js        # the 4 hardcoded questions
  leaderboard.js           # AsyncStorage-backed leaderboard (seeded)
  share.js                 # cross-platform share (native sheet / web clipboard)
  components/
    GameBoyShell.js        # responsive Game Boy device frame
    Avatar.js              # deterministic pixel identicon from nickname
    PixelButton.js         # chunky retro button
  screens/
    HomeScreen.js
    GameScreen.js
    ResultScreen.js
```

## Customizing

- **Questions:** edit `src/data/questions.js` (`correct` is the 0-based index of the
  right answer).
- **Colors:** edit `src/theme.js`.

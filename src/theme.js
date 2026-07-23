// Classic DMG (original GameBoy) 4-shade LCD palette + device shell colors.

export const DMG = {
  darkest: '#0f380f', // text / outlines
  dark: '#306230', // secondary
  mid: '#5a7a1e', // accents
  light: '#8bac0f', // highlights
  lightest: '#9bbc0f', // LCD background
};

export const SHELL = {
  body: '#d3cfc7', // grey-beige plastic
  bodyHi: '#e6e2da', // top highlight
  bodyLo: '#b3aea4', // bottom shadow
  bezel: '#43473a', // dark olive screen frame
  bezelHi: '#5c6150',
  bezelLo: '#2b2e24',
  screenWell: '#20241a', // recessed area behind LCD
  led: '#e2402f', // power LED
  ledOff: '#7a2b24',
  btnFace: '#8a2b52', // A/B magenta buttons
  btnFaceLo: '#6d1f40',
  dpad: '#33352f', // charcoal d-pad
  dpadHi: '#4a4d44',
  pill: '#8f8a80', // start/select pills
  accentBlue: '#2b3a8f',
  accentMag: '#8a2b52',
  ink: '#3a3d31', // label text on body
};

export const FONT = 'PressStart2P_400Regular';

// Layout tuning shared across screens.
export const LAYOUT = {
  maxShellWidth: 460, // cap on large / web screens
  shellAspect: 0.62, // width / height of the device body
};

// Open-Meteo current weather — https://open-meteo.com/
// Detects the player's location (with permission) and returns a silly
// GameBoy-flavored weather blurb for the home screen. Falls back to
// Kuwait City when location is denied or unavailable.

import * as Location from 'expo-location';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 8000;

// Starter cities — also used to name the nearest city to the player.
export const CITIES = [
  { name: 'KUWAIT CITY', lat: 29.3759, lon: 47.9774 },
  { name: 'DUBAI', lat: 25.2048, lon: 55.2708 },
  { name: 'LONDON', lat: 51.5074, lon: -0.1278 },
  { name: 'TOKYO', lat: 35.6762, lon: 139.6503 },
  { name: 'NEW YORK', lat: 40.7128, lon: -74.006 },
];
const DEFAULT_CITY = CITIES[0];

// WMO weather code → silly phrase + condition label.
// 0 clear · 1–3 partly cloudy · 45–48 fog · 51–57 drizzle · 61–67 rain
// 71–77 snow · 80–82 showers · 95+ thunderstorm
function describe(code) {
  if (code === 0) return { label: 'CLEAR', phrase: 'SUN IS OUT. NO EXCUSES FOR WRONG ANSWERS!' };
  if (code >= 1 && code <= 3) return { label: 'CLOUDY', phrase: 'PARTLY CLOUDY, FULLY QUIZZY.' };
  if (code >= 45 && code <= 48) return { label: 'FOG', phrase: 'FOG OUTSIDE. KEEP THE BRAIN FOG INSIDE.' };
  if (code >= 51 && code <= 57) return { label: 'DRIZZLE', phrase: 'LIGHT DRIZZLE, HEAVY TRIVIA.' };
  if (code >= 61 && code <= 67) return { label: 'RAIN', phrase: 'IT IS RAINING FACTS OUT THERE.' };
  if (code >= 71 && code <= 77) return { label: 'SNOW', phrase: 'SNOW WAY YOU ARE LOSING TODAY.' };
  if (code >= 80 && code <= 82) return { label: 'SHOWERS', phrase: 'SHOWER OF QUESTIONS INCOMING.' };
  if (code >= 95) return { label: 'STORM', phrase: 'THUNDER OUTSIDE. BIG BRAIN ENERGY INSIDE.' };
  return { label: 'WEATHER', phrase: 'WEATHER MACHINE CONFUSED. QUIZ ANYWAY.' };
}

// Rough distance ranking is enough to pick the nearest starter city.
function nearestCity(lat, lon) {
  let best = DEFAULT_CITY;
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

// Try to get device coordinates; null if denied/unavailable.
async function getCoords() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<{place: string, temp: number, wind: number, label: string, phrase: string}>}
 * @throws on network failure (caller decides what to show)
 */
export async function getWeatherBlurb() {
  const coords = await getCoords();
  const lat = coords?.lat ?? DEFAULT_CITY.lat;
  const lon = coords?.lon ?? DEFAULT_CITY.lon;
  const place = coords ? `NEAR ${nearestCity(lat, lon).name}` : DEFAULT_CITY.name;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const cw = json.current_weather;
    if (!cw) throw new Error('no current_weather in response');
    const { label, phrase } = describe(cw.weathercode);
    return {
      place,
      temp: Math.round(cw.temperature),
      wind: Math.round(cw.windspeed),
      label,
      phrase,
    };
  } finally {
    clearTimeout(timer);
  }
}

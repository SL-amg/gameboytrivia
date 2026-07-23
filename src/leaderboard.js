import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'triviaboy.leaderboard.v1';
const MAX_ENTRIES = 10;

// Seed scores so the leaderboard never looks empty on first play.
const SEED = [
  { name: 'ZELDA', score: 400, correct: 4 },
  { name: 'MARIO', score: 300, correct: 3 },
  { name: 'SAMUS', score: 200, correct: 2 },
];

export async function loadLeaderboard() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [...SEED];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...SEED];
    return parsed;
  } catch {
    return [...SEED];
  }
}

// Adds an entry, sorts by score desc, trims, and persists. Returns the
// updated list plus the 1-based rank of the entry just added.
export async function submitScore(entry) {
  const current = await loadLeaderboard();
  const withNew = [...current, { ...entry, ts: entry.ts ?? 0 }];
  withNew.sort((a, b) => b.score - a.score);
  const trimmed = withNew.slice(0, MAX_ENTRIES);

  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Non-fatal: leaderboard just won't persist this run.
  }

  // Find the rank of the entry we added (first match by reference-like fields).
  const rank =
    trimmed.findIndex(
      (e) => e.name === entry.name && e.score === entry.score && e.ts === entry.ts
    ) + 1;

  return { list: trimmed, rank: rank || null };
}

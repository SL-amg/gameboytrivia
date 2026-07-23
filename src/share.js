import { Platform, Share, Alert } from 'react-native';

// Share the result across native + web. Returns a short status string used
// to give the player feedback ('shared' | 'copied' | 'unavailable').
export async function shareResult({ nickname, score, correct, total, rank }) {
  const message =
    `🎮 TRIVIA BOY 🎮\n` +
    `${nickname} scored ${score} pts!\n` +
    `${correct}/${total} correct` +
    (rank ? ` • Rank #${rank}` : '') +
    `\nCan you beat me?`;

  if (Platform.OS === 'web') {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Trivia Boy', text: message });
        return 'shared';
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        return 'copied';
      }
    } catch {
      return 'unavailable';
    }
    return 'unavailable';
  }

  // Native (iOS / Android)
  try {
    const res = await Share.share({ message });
    return res.action === Share.sharedAction ? 'shared' : 'dismissed';
  } catch (e) {
    Alert.alert('Share failed', String(e?.message ?? e));
    return 'unavailable';
  }
}

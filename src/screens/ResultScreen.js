import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { DMG, FONT } from '../theme';
import Avatar from '../components/Avatar';
import PixelButton from '../components/PixelButton';
import { submitScore } from '../leaderboard';
import { shareResult } from '../share';

export default function ResultScreen({ nickname, score, correct, total, runId, onPlayAgain, onHome }) {
  const [board, setBoard] = useState(null);
  const [rank, setRank] = useState(null);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const { list, rank } = await submitScore({
        name: nickname,
        score,
        correct,
        ts: runId,
      });
      if (!alive) return;
      setBoard(list);
      setRank(rank);
    })();
    return () => {
      alive = false;
    };
  }, [nickname, score, correct, runId]);

  async function onShare() {
    const status = await shareResult({ nickname, score, correct, total, rank });
    if (status === 'copied') setShareMsg('COPIED TO CLIPBOARD!');
    else if (status === 'shared') setShareMsg('SHARED!');
    else if (status === 'unavailable') setShareMsg('SHARING NOT SUPPORTED');
    else setShareMsg('');
  }

  const allRight = correct === total;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{allRight ? 'PERFECT!' : 'GAME OVER'}</Text>

      <View style={styles.playerRow}>
        <Avatar name={nickname} size={44} />
        <View>
          <Text style={styles.name}>{nickname}</Text>
          {rank ? <Text style={styles.rank}>RANK #{rank}</Text> : null}
        </View>
      </View>

      {/* Score panel */}
      <View style={styles.scorePanel}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{String(score).padStart(4, '0')}</Text>
        <View style={styles.divider} />
        <Text style={styles.correctLine}>
          {correct} / {total} CORRECT
        </Text>
        <View style={styles.pips}>
          {Array.from({ length: total }).map((_, i) => (
            <Text key={i} style={styles.pip}>
              {i < correct ? '★' : '☆'}
            </Text>
          ))}
        </View>
      </View>

      {/* Leaderboard */}
      <Text style={styles.boardTitle}>◆ LEADERBOARD ◆</Text>
      <View style={styles.board}>
        {board == null ? (
          <ActivityIndicator color={DMG.darkest} />
        ) : (
          board.map((e, i) => {
            const isMe = e.ts === runId && e.name === nickname && e.score === score;
            return (
              <View key={i} style={[styles.boardRow, isMe && styles.boardMe]}>
                <Text style={[styles.boardText, styles.boardRank]}>{i + 1}.</Text>
                <Text style={[styles.boardText, styles.boardName]} numberOfLines={1}>
                  {e.name}
                  {isMe ? ' ◀' : ''}
                </Text>
                <Text style={[styles.boardText, styles.boardScore]}>
                  {String(e.score).padStart(4, '0')}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <PixelButton label="SHARE RESULT" size="lg" onPress={onShare} style={styles.wide} />
      {shareMsg ? <Text style={styles.shareMsg}>{shareMsg}</Text> : null}

      <PixelButton
        label="PLAY AGAIN"
        variant="outline"
        size="lg"
        onPress={onPlayAgain}
        style={styles.wide}
      />
      <PixelButton
        label="HOME"
        variant="outline"
        size="md"
        onPress={onHome}
        style={styles.wide}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 18,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT,
    fontSize: 24,
    color: DMG.darkest,
    textAlign: 'center',
    letterSpacing: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  name: {
    fontFamily: FONT,
    fontSize: 15,
    color: DMG.darkest,
  },
  rank: {
    fontFamily: FONT,
    fontSize: 10,
    color: DMG.dark,
    marginTop: 5,
  },
  scorePanel: {
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  scoreLabel: {
    fontFamily: FONT,
    fontSize: 11,
    color: DMG.dark,
  },
  scoreValue: {
    fontFamily: FONT,
    fontSize: 46,
    color: DMG.darkest,
  },
  divider: {
    height: 2,
    alignSelf: 'stretch',
    marginHorizontal: 16,
    backgroundColor: DMG.dark,
    marginVertical: 6,
  },
  correctLine: {
    fontFamily: FONT,
    fontSize: 14,
    color: DMG.darkest,
  },
  pips: {
    flexDirection: 'row',
    gap: 6,
  },
  pip: {
    fontFamily: FONT,
    fontSize: 22,
    color: DMG.darkest,
  },
  boardTitle: {
    fontFamily: FONT,
    fontSize: 13,
    color: DMG.darkest,
    textAlign: 'center',
    marginTop: 2,
  },
  board: {
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.lightest,
    paddingVertical: 4,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 10,
  },
  boardMe: {
    backgroundColor: DMG.light,
  },
  boardText: {
    fontFamily: FONT,
    fontSize: 12,
    color: DMG.darkest,
  },
  boardRank: {
    width: 28,
  },
  boardName: {
    flex: 1,
  },
  boardScore: {
    letterSpacing: 1,
  },
  wide: {
    alignSelf: 'stretch',
  },
  shareMsg: {
    fontFamily: FONT,
    fontSize: 10,
    color: DMG.dark,
    textAlign: 'center',
    marginTop: -6,
  },
});

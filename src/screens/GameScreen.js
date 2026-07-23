import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DMG, FONT } from '../theme';
import Avatar from '../components/Avatar';
import PixelButton from '../components/PixelButton';
import { POINTS_PER_CORRECT } from '../data/questions';

export default function GameScreen({ nickname, questions, onFinish }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null); // chosen answer index
  const [locked, setLocked] = useState(false);

  const q = questions[index];
  const total = questions.length;

  function choose(i) {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const isRight = i === q.correct;
    if (isRight) {
      setScore((s) => s + POINTS_PER_CORRECT);
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    const isLast = index === total - 1;
    if (isLast) {
      onFinish({ score, correct: correctCount });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setLocked(false);
  }

  const answeredRight = locked && selected === q.correct;

  return (
    <View style={styles.root}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Avatar name={nickname} size={26} border={false} />
          <Text style={styles.hudName} numberOfLines={1}>
            {nickname}
          </Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudScore}>SCR {String(score).padStart(4, '0')}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.qNum}>
          Q {index + 1}/{total}
        </Text>
        <View style={styles.progressBar}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressCell,
                i < index && styles.progressDone,
                i === index && styles.progressCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {(q.category || q.difficulty) && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText} numberOfLines={1}>
              {q.category ? q.category.toUpperCase() : ''}
            </Text>
            {q.difficulty ? (
              <Text style={styles.metaDiff}>[{q.difficulty.toUpperCase()}]</Text>
            ) : null}
          </View>
        )}

        <View style={styles.questionBox}>
          <Text style={styles.question}>{q.question}</Text>
        </View>

        <View style={styles.answers}>
          {q.answers.map((a, i) => {
            let state = 'default';
            if (locked) {
              if (i === q.correct) state = 'correct';
              else if (i === selected) state = 'wrong';
              else state = 'disabled';
            }
            return (
              <PixelButton
                key={i}
                label={a}
                variant="outline"
                state={state}
                onPress={locked ? undefined : () => choose(i)}
                style={styles.answerBtn}
              />
            );
          })}
        </View>

        {locked && (
          <View style={styles.feedback}>
            <Text style={[styles.feedbackText, answeredRight ? styles.good : styles.bad]}>
              {answeredRight ? '★ CORRECT! +100' : '✗ NOPE!'}
            </Text>
            <PixelButton
              label={index === total - 1 ? 'SEE RESULTS' : 'NEXT ▶'}
              size="md"
              onPress={next}
              style={styles.nextBtn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: DMG.dark,
    paddingBottom: 6,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  hudName: {
    fontFamily: FONT,
    fontSize: 9,
    color: DMG.darkest,
    flexShrink: 1,
  },
  hudRight: {
    paddingLeft: 6,
  },
  hudScore: {
    fontFamily: FONT,
    fontSize: 9,
    color: DMG.darkest,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  qNum: {
    fontFamily: FONT,
    fontSize: 8,
    color: DMG.dark,
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  progressCell: {
    flex: 1,
    height: 8,
    backgroundColor: DMG.light,
    borderWidth: 1,
    borderColor: DMG.dark,
  },
  progressDone: {
    backgroundColor: DMG.dark,
  },
  progressCurrent: {
    backgroundColor: DMG.darkest,
  },
  body: {
    paddingBottom: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    fontFamily: FONT,
    fontSize: 7,
    color: DMG.dark,
    flexShrink: 1,
  },
  metaDiff: {
    fontFamily: FONT,
    fontSize: 7,
    color: DMG.darkest,
  },
  questionBox: {
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    padding: 12,
    marginTop: 4,
  },
  question: {
    fontFamily: FONT,
    fontSize: 11,
    lineHeight: 18,
    color: DMG.darkest,
  },
  answers: {
    gap: 12,
  },
  answerBtn: {
    alignSelf: 'stretch',
  },
  feedback: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  feedbackText: {
    fontFamily: FONT,
    fontSize: 11,
  },
  good: {
    color: DMG.darkest,
  },
  bad: {
    color: DMG.dark,
  },
  nextBtn: {
    alignSelf: 'stretch',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { DMG, FONT } from '../theme';
import Avatar from '../components/Avatar';
import PixelButton from '../components/PixelButton';

// OpenTDB category codes (from https://opentdb.com/api_config.php).
const CATEGORY_OPTIONS = [
  { label: 'ANY TOPIC', code: null },
  { label: 'GENERAL', code: 9 },
  { label: 'SCIENCE', code: 17 },
  { label: 'COMPUTERS', code: 18 },
  { label: 'MATH', code: 19 },
  { label: 'SPORTS', code: 21 },
  { label: 'GEOGRAPHY', code: 22 },
  { label: 'HISTORY', code: 23 },
  { label: 'ART', code: 25 },
];

const DIFFICULTY_OPTIONS = [
  { label: 'ANY', value: null },
  { label: 'EASY', value: 'easy' },
  { label: 'MEDIUM', value: 'medium' },
  { label: 'HARD', value: 'hard' },
];

// Small selectable pixel chip.
function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {selected ? '▶ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

export default function SetupScreen({ nickname, onStart, onBack }) {
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Player strip */}
      <View style={styles.playerRow}>
        <Avatar name={nickname} size={30} border={false} />
        <Text style={styles.playerName}>{nickname}</Text>
      </View>

      <Text style={styles.heading}>CHOOSE TOPIC</Text>
      <View style={styles.grid}>
        {CATEGORY_OPTIONS.map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            selected={category === c.code}
            onPress={() => setCategory(c.code)}
          />
        ))}
      </View>

      <Text style={styles.heading}>DIFFICULTY</Text>
      <View style={styles.grid}>
        {DIFFICULTY_OPTIONS.map((d) => (
          <Chip
            key={d.label}
            label={d.label}
            selected={difficulty === d.value}
            onPress={() => setDifficulty(d.value)}
          />
        ))}
      </View>

      <PixelButton
        label="START ROUND"
        size="lg"
        onPress={() => onStart({ category, difficulty })}
        style={styles.startBtn}
      />
      <PixelButton
        label="◀ BACK"
        variant="outline"
        size="sm"
        onPress={onBack}
        style={styles.backBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
    justifyContent: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playerName: {
    fontFamily: FONT,
    fontSize: 11,
    color: DMG.darkest,
  },
  heading: {
    fontFamily: FONT,
    fontSize: 10,
    color: DMG.dark,
    textAlign: 'center',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  chip: {
    borderWidth: 2,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minWidth: '30%',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: DMG.darkest,
  },
  chipText: {
    fontFamily: FONT,
    fontSize: 8,
    color: DMG.darkest,
  },
  chipTextSelected: {
    color: DMG.lightest,
  },
  startBtn: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  backBtn: {
    alignSelf: 'center',
    minWidth: 120,
  },
});

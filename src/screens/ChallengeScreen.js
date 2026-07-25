import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { DMG, FONT } from '../theme';
import Avatar from '../components/Avatar';
import PixelButton from '../components/PixelButton';

const MAX_TOPIC_LEN = 40;

export default function ChallengeScreen({ nickname, onStart, onBack }) {
  const [topic, setTopic] = useState('');

  const trimmed = topic.trim();
  const canStart = trimmed.length >= 3;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.playerRow}>
        <Avatar name={nickname} size={30} border={false} />
        <Text style={styles.playerName}>{nickname}</Text>
      </View>

      <Text style={styles.heading}>CHALLENGE MODE</Text>
      <Text style={styles.sub}>
        TYPE ANY TOPIC.{'\n'}THE AI WILL QUIZ YOU ON IT.
      </Text>

      <Text style={styles.label}>YOUR TOPIC</Text>
      <View style={styles.inputWrap}>
        <Text style={styles.caret}>{'>'}</Text>
        <TextInput
          value={topic}
          onChangeText={(t) => setTopic(t.slice(0, MAX_TOPIC_LEN))}
          placeholder="KUWAITI FOOTBALL"
          placeholderTextColor={DMG.dark}
          style={styles.input}
          maxLength={MAX_TOPIC_LEN}
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => canStart && onStart(trimmed)}
        />
      </View>
      <Text style={styles.hint}>
        E.G. KUWAITI FOOTBALL • 90S ANIME • SPACE RACE
      </Text>

      <PixelButton
        label="START CHALLENGE"
        size="lg"
        state={canStart ? 'default' : 'disabled'}
        onPress={() => onStart(trimmed)}
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
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
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
    fontSize: 14,
    color: DMG.darkest,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT,
    fontSize: 8,
    lineHeight: 14,
    color: DMG.dark,
    textAlign: 'center',
  },
  label: {
    fontFamily: FONT,
    fontSize: 9,
    color: DMG.dark,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
  },
  caret: {
    fontFamily: FONT,
    fontSize: 12,
    color: DMG.darkest,
  },
  input: {
    flex: 1,
    fontFamily: FONT,
    fontSize: 10,
    color: DMG.darkest,
    paddingVertical: 8,
    // remove the default web focus outline (no-op on native)
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  hint: {
    fontFamily: FONT,
    fontSize: 6,
    color: DMG.dark,
    textAlign: 'center',
  },
  startBtn: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  backBtn: {
    alignSelf: 'center',
    minWidth: 120,
  },
});

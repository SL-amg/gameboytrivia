import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DMG, FONT } from '../theme';
import Avatar from '../components/Avatar';
import PixelButton from '../components/PixelButton';

export default function ModeScreen({ nickname, onNormal, onChallenge, onBack }) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.playerRow}>
        <Avatar name={nickname} size={30} border={false} />
        <Text style={styles.playerName}>{nickname}</Text>
      </View>

      <Text style={styles.heading}>CHOOSE MODE</Text>

      <View style={styles.modeBlock}>
        <PixelButton
          label="NORMAL PLAY"
          size="lg"
          onPress={onNormal}
          style={styles.modeBtn}
        />
        <Text style={styles.modeDesc}>
          REAL TRIVIA FROM THE OPEN TRIVIA DATABASE. PICK A TOPIC + DIFFICULTY.
        </Text>
      </View>

      <View style={styles.modeBlock}>
        <PixelButton
          label="CHALLENGE MODE"
          variant="outline"
          size="lg"
          onPress={onChallenge}
          style={styles.modeBtn}
        />
        <Text style={styles.modeDesc}>
          TYPE ANY TOPIC — THE AI WRITES 5 CUSTOM QUESTIONS JUST FOR YOU.
        </Text>
      </View>

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
    gap: 14,
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
    marginBottom: 2,
  },
  modeBlock: {
    gap: 8,
  },
  modeBtn: {
    alignSelf: 'stretch',
  },
  modeDesc: {
    fontFamily: FONT,
    fontSize: 7,
    lineHeight: 12,
    color: DMG.dark,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  backBtn: {
    alignSelf: 'center',
    minWidth: 120,
    marginTop: 6,
  },
});

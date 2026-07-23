import React, { useState, useEffect } from 'react';
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
import { getWeatherBlurb } from '../data/weather';

export default function HomeScreen({ onStart }) {
  const [nickname, setNickname] = useState('');
  const [weather, setWeather] = useState(null); // null = loading, false = failed

  const trimmed = nickname.trim();
  const canStart = trimmed.length > 0;

  useEffect(() => {
    let alive = true;
    getWeatherBlurb()
      .then((w) => alive && setWeather(w))
      .catch(() => alive && setWeather(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleWrap}>
        <Text style={styles.title}>TRIVIA</Text>
        <Text style={styles.titleShadow}>QUEST</Text>
      </View>

      <View style={styles.avatarWrap}>
        <Avatar name={trimmed || 'PLAYER'} size={70} />
        <Text style={styles.avatarHint}>
          {canStart ? trimmed.toUpperCase() : 'YOUR HERO'}
        </Text>
      </View>

      <Text style={styles.label}>ENTER NAME</Text>
      <View style={styles.inputWrap}>
        <Text style={styles.caret}>{'>'}</Text>
        <TextInput
          value={nickname}
          onChangeText={(t) => setNickname(t.slice(0, 10))}
          placeholder="PLAYER"
          placeholderTextColor={DMG.dark}
          style={styles.input}
          maxLength={10}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => canStart && onStart(trimmed.toUpperCase())}
        />
      </View>

      <PixelButton
        label="PRESS START"
        size="lg"
        state={canStart ? 'default' : 'disabled'}
        onPress={() => onStart(trimmed.toUpperCase())}
        style={styles.startBtn}
      />

      {/* Weather blurb from Open-Meteo */}
      <View style={styles.weatherBox}>
        {weather === null ? (
          <Text style={styles.weatherPlace}>CHECKING THE SKIES…</Text>
        ) : weather === false ? (
          <Text style={styles.weatherPlace}>WEATHER MACHINE IS NAPPING</Text>
        ) : (
          <>
            <Text style={styles.weatherPlace}>
              ◆ {weather.place} • {weather.label} {weather.temp}°C ◆
            </Text>
            <Text style={styles.weatherPhrase}>{weather.phrase}</Text>
            <Text style={styles.weatherWind}>WIND {weather.wind} KM/H</Text>
          </>
        )}
      </View>

      <Text style={styles.footer}>▲ 5 RANDOM QUESTIONS • BEAT THE BOARD ▲</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 14,
    gap: 14,
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT,
    fontSize: 26,
    color: DMG.darkest,
    letterSpacing: 2,
  },
  titleShadow: {
    fontFamily: FONT,
    fontSize: 20,
    color: DMG.dark,
    letterSpacing: 6,
    marginTop: 4,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 6,
  },
  avatarHint: {
    fontFamily: FONT,
    fontSize: 9,
    color: DMG.darkest,
  },
  label: {
    fontFamily: FONT,
    fontSize: 9,
    color: DMG.dark,
    marginTop: 2,
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
    fontSize: 12,
    color: DMG.darkest,
    paddingVertical: 8,
    // remove the default web focus outline (no-op on native)
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  startBtn: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  weatherBox: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: DMG.dark,
    backgroundColor: DMG.light,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  weatherPlace: {
    fontFamily: FONT,
    fontSize: 8,
    color: DMG.darkest,
    textAlign: 'center',
  },
  weatherPhrase: {
    fontFamily: FONT,
    fontSize: 9,
    lineHeight: 15,
    color: DMG.darkest,
    textAlign: 'center',
  },
  weatherWind: {
    fontFamily: FONT,
    fontSize: 7,
    color: DMG.dark,
  },
  footer: {
    fontFamily: FONT,
    fontSize: 7,
    color: DMG.dark,
    marginTop: 4,
    textAlign: 'center',
  },
});

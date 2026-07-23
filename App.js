import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import GameBoyShell from './src/components/GameBoyShell';
import ErrorBoundary from './src/components/ErrorBoundary';
import PixelButton from './src/components/PixelButton';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import { fetchQuestions, getFallbackQuestions } from './src/data/api';
import { DMG, FONT } from './src/theme';

const QUESTION_COUNT = 5;

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  const [screen, setScreen] = useState('home'); // 'home' | 'setup' | 'loading' | 'game' | 'result'
  const [nickname, setNickname] = useState('PLAYER');
  const [questions, setQuestions] = useState([]);
  const [offline, setOffline] = useState(false); // true when using fallback questions
  const [gameOpts, setGameOpts] = useState({ category: null, difficulty: null });
  const [loadError, setLoadError] = useState('');
  const [result, setResult] = useState({ score: 0, correct: 0 });
  const [runId, setRunId] = useState(0);

  // Fetch a fresh batch from OpenTDB. On failure, show the themed error
  // screen — the player chooses to retry, play offline, or go back.
  const loadAndStart = useCallback(async ({ category, difficulty } = {}) => {
    setScreen('loading');
    try {
      const qs = await fetchQuestions({
        amount: QUESTION_COUNT,
        category: category ?? undefined,
        difficulty: difficulty ?? undefined,
      });
      setQuestions(qs);
      setOffline(false);
      setRunId(Date.now());
      setScreen('game');
    } catch (e) {
      setLoadError(String(e?.message ?? e));
      setScreen('error');
    }
  }, []);

  // Start a round with the built-in question pack (no internet needed).
  const playOffline = useCallback(() => {
    setQuestions(getFallbackQuestions());
    setOffline(true);
    setRunId(Date.now());
    setScreen('game');
  }, []);

  // Home → setup: keep the nickname, then pick topic/difficulty.
  const startGame = useCallback((name) => {
    setNickname(name || 'PLAYER');
    setScreen('setup');
  }, []);

  // Setup → round: remember the choices so PLAY AGAIN reuses them.
  const startRound = useCallback(
    (opts) => {
      setGameOpts(opts);
      loadAndStart(opts);
    },
    [loadAndStart]
  );

  const finishGame = useCallback(({ score, correct }) => {
    setResult({ score, correct });
    setScreen('result');
  }, []);

  const playAgain = useCallback(() => {
    loadAndStart(gameOpts);
  }, [loadAndStart, gameOpts]);

  const goHome = useCallback(() => setScreen('home'), []);

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="dark" />
        <GameBoyShell>
          <ErrorBoundary onReset={goHome}>
          {!fontsLoaded ? (
            <View style={styles.center}>
              <Text style={styles.plainText}>LOADING…</Text>
            </View>
          ) : screen === 'home' ? (
            <HomeScreen onStart={startGame} />
          ) : screen === 'setup' ? (
            <SetupScreen nickname={nickname} onStart={startRound} onBack={goHome} />
          ) : screen === 'loading' ? (
            <View style={styles.center}>
              <Text style={styles.loadingTitle}>DOWNLOADING</Text>
              <Text style={styles.loadingTitle}>QUESTIONS…</Text>
              <Text style={styles.loadingSub}>FROM OPEN TRIVIA DB</Text>
              <View style={styles.loadingBar}>
                <View style={styles.loadingFill} />
              </View>
            </View>
          ) : screen === 'error' ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorFace}>(@_@)</Text>
              <Text style={styles.errorTitle}>CONNECTION{'\n'}ERROR!</Text>
              <Text style={styles.errorMsg}>
                COULD NOT DOWNLOAD{'\n'}QUESTIONS
              </Text>
              <View style={styles.errorBox}>
                <Text style={styles.errorDetail} numberOfLines={3}>
                  {loadError || 'UNKNOWN ERROR'}
                </Text>
              </View>
              <PixelButton
                label="RETRY"
                size="lg"
                onPress={() => loadAndStart(gameOpts)}
                style={styles.errorBtn}
              />
              <PixelButton
                label="PLAY OFFLINE"
                variant="outline"
                size="md"
                onPress={playOffline}
                style={styles.errorBtn}
              />
              <PixelButton
                label="◀ MENU"
                variant="outline"
                size="sm"
                onPress={() => setScreen('setup')}
                style={styles.errorBtnSmall}
              />
            </View>
          ) : screen === 'game' ? (
            <GameScreen
              key={runId}
              nickname={nickname}
              questions={questions}
              onFinish={finishGame}
            />
          ) : (
            <ResultScreen
              nickname={nickname}
              score={result.score}
              correct={result.correct}
              total={questions.length}
              runId={runId}
              onPlayAgain={playAgain}
              onHome={goHome}
            />
          )}
          {screen === 'game' && offline && (
            <View style={styles.offlineTag}>
              <Text style={styles.offlineText}>OFFLINE MODE</Text>
            </View>
          )}
          </ErrorBoundary>
        </GameBoyShell>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#2a2c25',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plainText: {
    // font may not be ready yet; use system font as fallback
    fontSize: 12,
    color: DMG.darkest,
    letterSpacing: 2,
  },
  loadingTitle: {
    fontFamily: FONT,
    fontSize: 14,
    color: DMG.darkest,
  },
  loadingSub: {
    fontFamily: FONT,
    fontSize: 8,
    color: DMG.dark,
    marginTop: 2,
  },
  loadingBar: {
    width: '60%',
    height: 14,
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    marginTop: 10,
  },
  loadingFill: {
    width: '55%',
    height: '100%',
    backgroundColor: DMG.darkest,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  errorFace: {
    fontFamily: FONT,
    fontSize: 20,
    color: DMG.darkest,
  },
  errorTitle: {
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: 24,
    color: DMG.darkest,
    textAlign: 'center',
  },
  errorMsg: {
    fontFamily: FONT,
    fontSize: 9,
    lineHeight: 16,
    color: DMG.dark,
    textAlign: 'center',
  },
  errorBox: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: DMG.dark,
    backgroundColor: DMG.light,
    padding: 8,
  },
  errorDetail: {
    fontFamily: FONT,
    fontSize: 7,
    lineHeight: 12,
    color: DMG.darkest,
  },
  errorBtn: {
    alignSelf: 'stretch',
  },
  errorBtnSmall: {
    alignSelf: 'center',
    minWidth: 120,
  },
  offlineTag: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: DMG.darkest,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlineText: {
    fontFamily: FONT,
    fontSize: 7,
    color: DMG.lightest,
  },
});

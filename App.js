import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import GameBoyShell from './src/components/GameBoyShell';
import ErrorBoundary from './src/components/ErrorBoundary';
import PixelButton from './src/components/PixelButton';
import HomeScreen from './src/screens/HomeScreen';
import ModeScreen from './src/screens/ModeScreen';
import SetupScreen from './src/screens/SetupScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import { fetchQuestions, getFallbackQuestions } from './src/data/api';
import { fetchAiQuestions } from './src/data/ai';
import { DMG, FONT } from './src/theme';

const QUESTION_COUNT = 5;
const SPARE_COUNT = 2; // extra questions powering the "Help Me" swap

// Retro segmented loading bar: blocks fill left-to-right in steps, then loop.
function LoadingBar() {
  const SEGMENTS = 10;
  const [step, setStep] = useState(1);
  useEffect(() => {
    const timer = setInterval(
      () => setStep((s) => (s >= SEGMENTS ? 1 : s + 1)),
      160
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={styles.loadingBar}>
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <View
          key={i}
          style={[styles.loadingSeg, i < step && styles.loadingSegOn]}
        />
      ))}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  // 'home' | 'mode' | 'setup' | 'challenge' | 'loading' | 'error' | 'game' | 'result'
  const [screen, setScreen] = useState('home');
  const [nickname, setNickname] = useState('PLAYER');
  const [questions, setQuestions] = useState([]);
  const [offline, setOffline] = useState(false); // true when using fallback questions
  // {mode:'normal', category, difficulty} or {mode:'ai', topic}
  const [gameOpts, setGameOpts] = useState({ mode: 'normal', category: null, difficulty: null });
  const [loadError, setLoadError] = useState('');
  const [result, setResult] = useState({ score: 0, correct: 0, total: QUESTION_COUNT });
  const [runId, setRunId] = useState(0);

  // Fetch a fresh batch — from OpenTDB (normal) or OpenRouter AI (challenge).
  // On failure, show the themed error screen.
  const loadAndStart = useCallback(async (opts = {}) => {
    setScreen('loading');
    try {
      let qs;
      if (opts.mode === 'ai') {
        qs = await fetchAiQuestions(opts.topic);
      } else {
        const params = {
          category: opts.category ?? undefined,
          difficulty: opts.difficulty ?? undefined,
        };
        try {
          // Ask for spares too so "Help Me" swaps are instant.
          qs = await fetchQuestions({ amount: QUESTION_COUNT + SPARE_COUNT, ...params });
        } catch {
          // Narrow category pools may not have 7 — a plain 5 still works
          // (the game just won't offer swaps).
          qs = await fetchQuestions({ amount: QUESTION_COUNT, ...params });
        }
      }
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

  // Home → mode select: keep the nickname first.
  const startGame = useCallback((name) => {
    setNickname(name || 'PLAYER');
    setScreen('mode');
  }, []);

  // Setup → round: remember the choices so PLAY AGAIN reuses them.
  const startRound = useCallback(
    (opts) => {
      const full = { mode: 'normal', ...opts };
      setGameOpts(full);
      loadAndStart(full);
    },
    [loadAndStart]
  );

  // Challenge → round: AI-generated questions about the typed topic.
  const startChallenge = useCallback(
    (topic) => {
      const full = { mode: 'ai', topic };
      setGameOpts(full);
      loadAndStart(full);
    },
    [loadAndStart]
  );

  const finishGame = useCallback(({ score, correct, total }) => {
    setResult({ score, correct, total: total ?? QUESTION_COUNT });
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
          ) : screen === 'mode' ? (
            <ModeScreen
              nickname={nickname}
              onNormal={() => setScreen('setup')}
              onChallenge={() => setScreen('challenge')}
              onBack={goHome}
            />
          ) : screen === 'setup' ? (
            <SetupScreen
              nickname={nickname}
              onStart={startRound}
              onBack={() => setScreen('mode')}
            />
          ) : screen === 'challenge' ? (
            <ChallengeScreen
              nickname={nickname}
              onStart={startChallenge}
              onBack={() => setScreen('mode')}
            />
          ) : screen === 'loading' ? (
            <View style={styles.center}>
              {gameOpts.mode === 'ai' ? (
                <>
                  <Text style={styles.loadingTitle}>AI IS WRITING</Text>
                  <Text style={styles.loadingTitle}>YOUR QUIZ…</Text>
                  <Text style={styles.loadingSub} numberOfLines={1}>
                    TOPIC: {String(gameOpts.topic || '').toUpperCase()}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.loadingTitle}>DOWNLOADING</Text>
                  <Text style={styles.loadingTitle}>QUESTIONS…</Text>
                  <Text style={styles.loadingSub}>FROM OPEN TRIVIA DB</Text>
                </>
              )}
              <LoadingBar />
            </View>
          ) : screen === 'error' ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorFace}>(@_@)</Text>
              <Text style={styles.errorTitle}>
                {gameOpts.mode === 'ai' ? 'AI TROUBLE!' : 'CONNECTION\nERROR!'}
              </Text>
              <Text style={styles.errorMsg}>
                {gameOpts.mode === 'ai'
                  ? 'THE AI COULD NOT\nWRITE YOUR QUIZ'
                  : 'COULD NOT DOWNLOAD\nQUESTIONS'}
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
                onPress={() => setScreen('mode')}
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
              total={result.total}
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
    height: 18,
    borderWidth: 3,
    borderColor: DMG.darkest,
    backgroundColor: DMG.light,
    marginTop: 10,
    flexDirection: 'row',
    padding: 2,
    gap: 2,
  },
  loadingSeg: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingSegOn: {
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

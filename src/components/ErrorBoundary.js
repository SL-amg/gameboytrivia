import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DMG, FONT } from '../theme';
import PixelButton from './PixelButton';

// Catches any render/lifecycle crash below it and shows a GameBoy-styled
// crash screen instead of a white screen / red box.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a trace for developers; users only see the themed screen.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleRestart = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      const detail = String(this.state.error?.message ?? this.state.error);
      return (
        <View style={styles.root}>
          <Text style={styles.face}>(✖▂✖)</Text>
          <Text style={styles.title}>GAME CRASHED!</Text>
          <Text style={styles.msg}>THE CARTRIDGE GLITCHED.{'\n'}YOUR SCORE IS SAFE.</Text>
          <View style={styles.errBox}>
            <Text style={styles.errText} numberOfLines={4}>
              {detail}
            </Text>
          </View>
          <PixelButton
            label="RESTART"
            size="lg"
            onPress={this.handleRestart}
            style={styles.btn}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 14,
  },
  face: {
    fontFamily: FONT,
    fontSize: 22,
    color: DMG.darkest,
  },
  title: {
    fontFamily: FONT,
    fontSize: 16,
    color: DMG.darkest,
  },
  msg: {
    fontFamily: FONT,
    fontSize: 9,
    lineHeight: 16,
    color: DMG.dark,
    textAlign: 'center',
  },
  errBox: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: DMG.dark,
    backgroundColor: DMG.light,
    padding: 10,
  },
  errText: {
    fontFamily: FONT,
    fontSize: 7,
    lineHeight: 12,
    color: DMG.darkest,
  },
  btn: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
});

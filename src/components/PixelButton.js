import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { DMG, FONT } from '../theme';

// Chunky LCD-styled button. `variant`:
//   'solid'  -> filled dark button, light label (primary actions)
//   'outline'-> light face, dark label (answer options)
export default function PixelButton({
  label,
  onPress,
  variant = 'solid',
  state = 'default', // 'default' | 'correct' | 'wrong' | 'disabled'
  size = 'md',
  style,
  fontSize,
}) {
  const [pressed, setPressed] = useState(false);
  const disabled = state === 'disabled' || !onPress;

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';

  const faceColor = isCorrect
    ? DMG.dark
    : isWrong
    ? DMG.lightest
    : variant === 'solid'
    ? DMG.darkest
    : DMG.light;

  const labelColor =
    isCorrect || variant === 'solid' ? DMG.lightest : DMG.darkest;

  const pad =
    size === 'lg'
      ? { paddingVertical: 16, paddingHorizontal: 18 }
      : size === 'sm'
      ? { paddingVertical: 8, paddingHorizontal: 10 }
      : { paddingVertical: 12, paddingHorizontal: 14 };

  const fs = fontSize ?? (size === 'lg' ? 13 : size === 'sm' ? 8 : 10);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={[styles.wrap, style, disabled && !isCorrect && !isWrong && styles.dim]}
    >
      {/* Bottom shadow slab for the 3D pressed effect. */}
      <View style={[styles.shadow]} />
      <View
        style={[
          styles.face,
          pad,
          { backgroundColor: faceColor },
          isWrong && styles.wrongBorder,
          pressed && !disabled && styles.pressedFace,
        ]}
      >
        <Text
          style={[styles.label, { color: labelColor, fontSize: fs }]}
          numberOfLines={3}
        >
          {isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  dim: {
    opacity: 0.85,
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: -4,
    backgroundColor: DMG.darkest,
    borderRadius: 4,
  },
  face: {
    borderRadius: 4,
    borderWidth: 3,
    borderColor: DMG.darkest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongBorder: {
    borderColor: DMG.dark,
  },
  pressedFace: {
    transform: [{ translateY: 3 }],
  },
  label: {
    fontFamily: FONT,
    textAlign: 'center',
    lineHeight: 16,
  },
});

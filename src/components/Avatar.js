import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { DMG } from '../theme';

// Simple deterministic string hash -> 32-bit int.
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Build a vertically-symmetric 5x5 pixel identicon from the name.
function buildGrid(name) {
  const seed = hashString(name || 'PLAYER');
  const size = 5;
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      // Pull a pseudo-random bit for this cell.
      const bit = (seed >> ((y * 3 + x) % 31)) & 1;
      const alt = (seed >> ((x * 5 + y * 2) % 29)) & 1;
      row[x] = bit === 1 && !(x === 0 && alt === 0);
    }
    // Mirror the left half onto the right.
    for (let x = 0; x < Math.floor(size / 2); x++) {
      row[size - 1 - x] = row[x];
    }
    grid.push(row);
  }
  return grid;
}

export default function Avatar({ name, size = 60, border = true }) {
  const grid = useMemo(() => buildGrid(name), [name]);
  const cell = Math.floor(size / 5);
  const dim = cell * 5;

  return (
    <View
      style={[
        styles.wrap,
        { width: dim, height: dim },
        border && styles.border,
      ]}
    >
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((on, x) => (
            <View
              key={x}
              style={{
                width: cell,
                height: cell,
                backgroundColor: on ? DMG.darkest : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: DMG.light,
    overflow: 'hidden',
  },
  border: {
    borderWidth: 3,
    borderColor: DMG.darkest,
  },
  row: {
    flexDirection: 'row',
  },
});

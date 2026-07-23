import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SHELL, DMG, FONT, LAYOUT } from '../theme';

// The GameBoy device frame. Children render inside the green LCD.
//
// Two modes:
//  - FULLSCREEN (phones / narrow windows): the body stretches edge-to-edge —
//    the phone itself becomes the GameBoy. LCD gets most of the height.
//  - FLOATING (desktop browsers / large tablets): a device-shaped card with
//    fixed aspect ratio, centered on a dark backdrop.
export default function GameBoyShell({ children }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isFullscreen = width <= 600;

  if (isFullscreen) {
    // ---- FULLSCREEN: fill the whole phone display ----
    const s = width / 400; // scale factor for decorative controls
    const px = (n) => Math.max(1, Math.round(n * s));
    // Controls need real height to look right; hide on very short screens.
    const showControls = height >= 640;

    return (
      <View
        style={[
          styles.fsBody,
          {
            paddingTop: Math.max(insets.top, 8),
            paddingBottom: Math.max(insets.bottom, 8),
            paddingLeft: Math.max(insets.left, 10),
            paddingRight: Math.max(insets.right, 10),
          },
        ]}
      >
        {/* Brand line above the screen */}
        <View style={styles.brandRow}>
          <Text style={[styles.brandText, { fontSize: px(10) }]}>TRIVIA BOY</Text>
          <Text style={[styles.brandSub, { fontSize: px(7) }]}>color</Text>
        </View>

        {/* Screen bezel + LCD take all remaining height */}
        <View style={[styles.bezel, { borderRadius: px(12), padding: px(10) }]}>
          <View style={styles.bezelTopRow}>
            <View style={[styles.led, { width: px(8), height: px(8), borderRadius: px(4) }]} />
            <Text style={[styles.bezelLabel, { fontSize: px(6) }]}>
              DOT MATRIX WITH STEREO SOUND
            </Text>
          </View>
          <View style={[styles.screen, { borderRadius: px(4) }]}>{children}</View>
        </View>

        {/* Compact decorative control strip */}
        {showControls && (
          <View style={styles.fsControls}>
            <View style={[styles.dpadWrap, { width: px(64), height: px(64) }]}>
              <View style={[styles.dpadV, { width: px(20), height: px(60) }]} />
              <View style={[styles.dpadH, { width: px(60), height: px(20) }]} />
              <View style={[styles.dpadCenter, { width: px(18), height: px(18), borderRadius: px(9) }]} />
            </View>

            <View style={styles.pillRow}>
              {['SELECT', 'START'].map((p) => (
                <View key={p} style={styles.pillWrap}>
                  <View style={[styles.pill, { width: px(34), height: px(9), borderRadius: px(5) }]} />
                  <Text style={[styles.pillLabel, { fontSize: px(6) }]}>{p}</Text>
                </View>
              ))}
            </View>

            <View style={styles.abWrap}>
              <View style={styles.abCol}>
                <View style={[styles.abBtn, { width: px(38), height: px(38), borderRadius: px(19) }]}>
                  <Text style={[styles.abLabel, { fontSize: px(10) }]}>B</Text>
                </View>
              </View>
              <View style={[styles.abCol, { marginTop: -px(18) }]}>
                <View style={[styles.abBtn, { width: px(38), height: px(38), borderRadius: px(19) }]}>
                  <Text style={[styles.abLabel, { fontSize: px(10) }]}>A</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // ---- FLOATING: device card centered on a dark backdrop ----
  const pad = 12;
  const availW = width - pad * 2;
  const availH = height - pad * 2;

  let bodyW = Math.min(availW, LAYOUT.maxShellWidth);
  let bodyH = bodyW / LAYOUT.shellAspect;
  if (bodyH > availH) {
    bodyH = availH;
    bodyW = bodyH * LAYOUT.shellAspect;
  }

  const ctrlH = bodyH * 0.24;
  const showControls = bodyH > 380;
  const s = bodyW / 400;
  const px = (n) => Math.max(1, Math.round(n * s));

  return (
    <View style={styles.root}>
      <View style={[styles.body, { width: bodyW, height: bodyH, borderRadius: px(26) }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandText, { fontSize: px(9) }]}>TRIVIA BOY</Text>
          <Text style={[styles.brandSub, { fontSize: px(6) }]}>color</Text>
        </View>

        <View style={[styles.bezel, { borderRadius: px(12), padding: px(10) }]}>
          <View style={styles.bezelTopRow}>
            <View style={[styles.led, { width: px(8), height: px(8), borderRadius: px(4) }]} />
            <Text style={[styles.bezelLabel, { fontSize: px(6) }]}>
              DOT MATRIX WITH STEREO SOUND
            </Text>
          </View>
          <View style={[styles.screen, { borderRadius: px(4) }]}>{children}</View>
        </View>

        {showControls && (
          <View style={[styles.controls, { height: ctrlH }]}>
            <View style={[styles.dpadWrap, { width: px(60), height: px(60) }]}>
              <View style={[styles.dpadV, { width: px(20), height: px(58) }]} />
              <View style={[styles.dpadH, { width: px(58), height: px(20) }]} />
              <View style={[styles.dpadCenter, { width: px(18), height: px(18), borderRadius: px(9) }]} />
            </View>

            <View style={styles.abWrap}>
              <View style={styles.abCol}>
                <View style={[styles.abBtn, { width: px(34), height: px(34), borderRadius: px(17) }]}>
                  <Text style={[styles.abLabel, { fontSize: px(9) }]}>B</Text>
                </View>
              </View>
              <View style={[styles.abCol, { marginTop: -px(16) }]}>
                <View style={[styles.abBtn, { width: px(34), height: px(34), borderRadius: px(17) }]}>
                  <Text style={[styles.abLabel, { fontSize: px(9) }]}>A</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {showControls && (
          <View style={[styles.pillRow, styles.pillRowTilt]}>
            {['SELECT', 'START'].map((p) => (
              <View key={p} style={styles.pillWrap}>
                <View style={[styles.pill, { width: px(34), height: px(9), borderRadius: px(5) }]} />
                <Text style={[styles.pillLabel, { fontSize: px(6) }]}>{p}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ---- fullscreen mode ----
  fsBody: {
    flex: 1,
    backgroundColor: SHELL.body,
  },
  fsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },

  // ---- floating mode ----
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2c25',
    padding: 12,
  },
  body: {
    backgroundColor: SHELL.body,
    borderWidth: 2,
    borderColor: SHELL.bodyLo,
    borderBottomWidth: 6,
    borderRightWidth: 4,
    paddingHorizontal: '5%',
    paddingTop: 8,
    // drop shadow for depth (boxShadow on web, native shadow/elevation elsewhere)
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.45)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      },
    }),
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 4,
  },

  // ---- shared pieces ----
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  brandText: {
    fontFamily: FONT,
    color: SHELL.ink,
    letterSpacing: 1,
  },
  brandSub: {
    fontFamily: FONT,
    color: SHELL.accentMag,
    fontStyle: 'italic',
  },
  bezel: {
    flex: 1,
    backgroundColor: SHELL.bezel,
    borderWidth: 2,
    borderColor: SHELL.bezelLo,
    borderTopColor: SHELL.bezelHi,
  },
  bezelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  led: {
    backgroundColor: SHELL.led,
  },
  bezelLabel: {
    fontFamily: FONT,
    color: '#b9bdaa',
    letterSpacing: 0.5,
  },
  screen: {
    flex: 1,
    backgroundColor: DMG.lightest,
    borderWidth: 2,
    borderColor: SHELL.screenWell,
    overflow: 'hidden',
  },
  dpadWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadV: {
    position: 'absolute',
    backgroundColor: SHELL.dpad,
    borderRadius: 3,
  },
  dpadH: {
    position: 'absolute',
    backgroundColor: SHELL.dpad,
    borderRadius: 3,
  },
  dpadCenter: {
    position: 'absolute',
    backgroundColor: SHELL.dpadHi,
  },
  abWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    transform: [{ rotate: '-20deg' }],
  },
  abCol: {
    alignItems: 'center',
  },
  abBtn: {
    backgroundColor: SHELL.btnFace,
    borderWidth: 2,
    borderColor: SHELL.btnFaceLo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abLabel: {
    fontFamily: FONT,
    color: '#f2e6ec',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
  },
  pillRowTilt: {
    paddingBottom: 6,
    transform: [{ rotate: '-20deg' }],
  },
  pillWrap: {
    alignItems: 'center',
    gap: 3,
  },
  pill: {
    backgroundColor: SHELL.pill,
    borderWidth: 1,
    borderColor: '#6f6a60',
  },
  pillLabel: {
    fontFamily: FONT,
    color: SHELL.ink,
  },
});

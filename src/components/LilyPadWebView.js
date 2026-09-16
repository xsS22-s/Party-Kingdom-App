import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';

/**
 * LilyPadWebView
 * ----------------
 * Loads a real LilyPad-hosted page (party booking, Open Jump tickets, gift
 * cards) inside the app. LilyPad is a third-party point-of-sale system Party
 * Kingdom doesn't have API access to, so this WebView is the integration —
 * not a mock of one.
 *
 * How it works:
 *  - `source` is the real LilyPad URL for this flow.
 *  - `onDetectSuccess(url)` is called on every navigation change so the
 *    parent screen can watch for LilyPad's own confirmation/thank-you URL
 *    and swap to a native confirmation screen at the right moment.
 *  - `injectedJavaScript` forces a mobile-friendly viewport, since LilyPad's
 *    hosted pages were built for desktop browsers, not a ~390px app screen.
 */
export default function LilyPadWebView({ source, title, onDetectSuccess, onClose }) {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(source);

  const injectedJavaScript = `
    (function() {
      var meta = document.querySelector('meta[name=viewport]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1');
      } else {
        var m = document.createElement('meta');
        m.name = 'viewport';
        m.content = 'width=device-width, initial-scale=1';
        document.head.appendChild(m);
      }
    })();
    true;
  `;

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    // Adjust these match strings to LilyPad's actual confirmation URL
    // pattern once you've walked through a real booking/purchase.
    const successPatterns = ['thank-you', 'confirmation', 'success', 'receipt'];
    const hit = successPatterns.some((p) => navState.url.toLowerCase().includes(p));
    if (hit && onDetectSuccess) {
      onDetectSuccess(navState.url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.urlPill}>
          <Text style={styles.lock}>🔒</Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {new URL(currentUrl).hostname}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {title ? (
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      ) : null}

      <WebView
        ref={webviewRef}
        source={{ uri: source }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={false}
        originWhitelist={['*']}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.royal} />
          <Text style={styles.loadingText}>Connecting to LilyPad's secure system…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mist },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    paddingBottom: 12,
    backgroundColor: '#E9E9EC',
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D9',
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: colors.ink, marginTop: -2 },
  urlPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  lock: { fontSize: 11 },
  urlText: { fontSize: 12, fontWeight: '600', color: '#3C3C43' },
  titleBar: {
    backgroundColor: colors.mistDeep,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  titleText: { fontSize: 11, fontWeight: '800', color: colors.royalDeep },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mist,
    gap: 14,
  },
  loadingText: { fontSize: 12.5, fontWeight: '600', color: '#6E6E76' },
});

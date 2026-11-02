import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, BackHandler, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';

// A display shell only: do not intercept form data or infer transaction success
// from a URL. LilyPad's own receipt/confirmation stays visible until the user exits.
export default function LilyPadWebView({ source, title, onClose }) {
  const webviewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(source);

  const goBack = useCallback(() => {
    if (canGoBack) webviewRef.current?.goBack();
    else onClose();
  }, [canGoBack, onClose]);

  // Only the focused screen should consume Android's hardware back button.
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack]));

  const openExternal = async (url) => {
    if (!/^(https:\/\/|mailto:|tel:)/i.test(url)) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', 'Please try again or contact Party Kingdom.');
    }
  };

  const openInBrowser = () => {
    Alert.alert(
      'Open in browser?',
      'This opens the form from the beginning. Your progress may not transfer. If you already submitted a payment or waiver, check your confirmation before submitting again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open browser', onPress: () => openExternal(source) },
      ],
    );
  };

  const handleNavigation = (state) => {
    setCurrentUrl(state.url);
    setCanGoBack(state.canGoBack);
  };

  const handleError = () => {
    setLoading(false);
    setFailed(true);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.control}>
            <Text style={styles.controlText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close form" onPress={onClose} style={styles.control}>
            <Text style={styles.controlText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webArea}>
        <WebView
          ref={webviewRef}
          source={{ uri: source }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={['https://*', 'about:blank']}
          onShouldStartLoadWithRequest={({ url }) => {
            if (/^https:\/\//i.test(url) || url === 'about:blank') return true;
            openExternal(url);
            return false;
          }}
          onOpenWindow={({ nativeEvent }) => openExternal(nativeEvent.targetUrl)}
          onNavigationStateChange={handleNavigation}
          onLoadStart={() => { setLoading(true); setFailed(false); }}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          onHttpError={({ nativeEvent }) => {
            // Android can report failures for subresources too; only replace
            // the form with an error message when its main document failed.
            if (nativeEvent.url === currentUrl || nativeEvent.url === source) handleError();
          }}
          renderError={() => <View />}
        />
        {loading && !failed && (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator color={colors.royal} />
            <Text style={styles.body}>Loading LilyPad…</Text>
          </View>
        )}
        {failed && (
          <View style={styles.error}>
            <Text style={styles.errorTitle}>We couldn’t load this page</Text>
            <Text style={styles.body}>
              Check your connection and try again. If you just submitted a payment or waiver,
              check your confirmation before submitting again.
            </Text>
            <TouchableOpacity accessibilityRole="button" style={styles.retry} onPress={() => webviewRef.current?.reload()}>
              <Text style={styles.controlText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity accessibilityRole="button" onPress={openInBrowser} style={styles.browserLink}>
        <Text style={styles.browserText}>Having trouble? Open in browser ↗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mist },
  header: { backgroundColor: colors.royal, paddingHorizontal: 12, paddingBottom: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  control: { minHeight: 44, minWidth: 48, justifyContent: 'center', alignItems: 'center' },
  controlText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  title: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 18, fontWeight: '800' },
  webArea: { flex: 1 },
  webview: { flex: 1, backgroundColor: colors.white },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, padding: 12, backgroundColor: colors.mist, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  error: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.mist, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  errorTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  body: { color: colors.textBody, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  retry: { backgroundColor: colors.royal, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  browserLink: { minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.line },
  browserText: { color: colors.royal, fontSize: 12, fontWeight: '700' },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, radius } from '../theme/colors';
import { LOGO_DATA_URI } from '../assets/imageData';

export function PageHeader({ eyebrow, title, onBack, showLogo }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerText}>
        {onBack && (
          <TouchableOpacity style={styles.backArrow} onPress={onBack}>
            <Text style={styles.backArrowText}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
      {showLogo && <Image source={{ uri: LOGO_DATA_URI }} style={styles.smallLogo} resizeMode="contain" />}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, variant = 'gold' }) {
  return (
    <TouchableOpacity
      style={[styles.btn, styles[`btn_${variant}`], disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.btnText, variant === 'outline' && styles.btnTextOutline]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ReminderCard({ title, body }) {
  return (
    <View style={styles.reminderCard}>
      <Text style={styles.reminderIcon}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderTitle}>{title}</Text>
        <Text style={styles.reminderBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: colors.royal,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerText: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, flex: 1 },
  backArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  backArrowText: { color: colors.white, fontSize: 20, marginTop: -2 },
  eyebrow: {
    fontSize: 11.5,
    letterSpacing: 2,
    color: colors.green,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
  smallLogo: { width: 60, height: 37 },
  btn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_gold: { backgroundColor: colors.green },
  btn_royal: { backgroundColor: colors.royal },
  btn_outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontWeight: '800', fontSize: 15, color: colors.white },
  btnTextOutline: { color: colors.royal },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  reminderCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF6DC',
    borderWidth: 1,
    borderColor: '#F4D77F',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
  },
  reminderIcon: { fontSize: 18 },
  reminderTitle: { fontWeight: '800', fontSize: 13.5, color: '#7A5A00', marginBottom: 3 },
  reminderBody: { fontSize: 12.5, color: '#8A6A00', lineHeight: 18, fontWeight: '600' },
});

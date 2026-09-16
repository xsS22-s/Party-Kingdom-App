import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { colors, radius } from '../theme/colors';
import { PrimaryButton, ReminderCard } from '../components/UI';

const logo = require('../assets/logo.png');

const EXPLORE_ITEMS = [
  { key: 'OpenJump', emoji: '🤾', name: 'Open Jump', desc: 'Drop-in play' },
  { key: 'Book', emoji: '🎂', name: 'Birthday Parties', desc: 'Book now' },
  { key: 'UltimateBash', emoji: '🎉', name: 'Ultimate Bash', desc: 'Go big' },
  { key: 'TeamParties', emoji: '🏆', name: 'Team Parties', desc: 'Sports groups' },
  { key: 'FieldTrips', emoji: '🚌', name: 'Field Trips', desc: 'Schools & groups' },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.h1}>Welcome back,{'\n'}Royal Family</Text>
        <Text style={styles.sub}>Chino's indoor adventure park</Text>
        <View style={styles.btnRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Book a Party" variant="gold" onPress={() => navigation.navigate('Book')} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Sign Waiver" variant="outline" onPress={() => navigation.navigate('Waiver')} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>OPEN JUMP</Text>
            <Text style={styles.infoValue}>7 Days{'\n'}10am – 7:30pm*</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>LOCATION</Text>
            <Text style={styles.infoValue}>3937 Schaefer Ave</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.google.com/maps/search/?api=1&query=3937+Schaefer+Avenue+Chino+CA+91710'
                )
              }
            >
              <Text style={styles.link}>Get directions →</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.footnote}>
          *Fri &amp; Sat open until 8pm · Sun until 2:30pm — see Open Jump for full session times
        </Text>

        <ReminderCard
          title="Grip socks required"
          body="We're a shoeless facility — every guest, kids and adults, needs grip socks in the arenas. Forgot a pair? Grab one at the front desk for $3."
        />

        <Text style={styles.sectionTitle}>Explore the Kingdom</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {EXPLORE_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.chip}
              onPress={() => navigation.navigate(item.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.chipEmoji}>{item.emoji}</Text>
              <Text style={styles.chipName}>{item.name}</Text>
              <Text style={styles.chipDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footerMini}>
          <Text style={styles.footerName}>Need help planning?</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLink} onPress={() => Linking.openURL('tel:9096289900')}>
              <Text style={styles.footerLinkText}>📞 (909) 628-9900</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => Linking.openURL('mailto:info@partykingdomchino.com')}
            >
              <Text style={styles.footerLinkText}>✉️ Email us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist },
  header: {
    backgroundColor: colors.royal,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 22,
  },
  logo: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 90,
    height: 56,
  },
  h1: { fontSize: 28, fontWeight: '800', color: colors.white, lineHeight: 32, maxWidth: '78%' },
  sub: { fontSize: 14.5, color: '#D9CCFF', fontWeight: '600', marginTop: 6 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  content: { padding: 20 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 5 },
  infoValue: { fontWeight: '800', color: colors.ink, fontSize: 14, lineHeight: 19 },
  link: { color: colors.royal, fontSize: 13, fontWeight: '700', marginTop: 2 },
  footnote: { fontSize: 10.5, color: colors.textMuted, fontWeight: '600', marginTop: 6, marginHorizontal: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 26, marginBottom: 12 },
  chipRow: { gap: 10, paddingRight: 20 },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 12,
    minWidth: 128,
  },
  chipEmoji: { fontSize: 22, marginBottom: 8 },
  chipName: { fontWeight: '800', fontSize: 13, color: colors.ink },
  chipDesc: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  footerMini: {
    marginTop: 28,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.mistDeep,
    alignItems: 'center',
  },
  footerName: { fontWeight: '700', fontSize: 14, color: colors.ink },
  footerLinks: { flexDirection: 'row', gap: 10, marginTop: 10 },
  footerLink: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  footerLinkText: { fontSize: 12.5, fontWeight: '700', color: colors.royal },
});

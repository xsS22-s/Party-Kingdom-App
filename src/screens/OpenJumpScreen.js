import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import { colors, radius } from '../theme/colors';
import { PageHeader, PrimaryButton, Card, ReminderCard } from '../components/UI';
import LilyPadWebView from '../components/LilyPadWebView';

// Real LilyPad ticketing URL for Party Kingdom's Open Jump — confirm the
// exact path against the "Buy Tickets" link on partykingdomchino.com/openjump
// before shipping; LilyPad sometimes rotates these paths.
const OPEN_JUMP_TICKETS_URL =
  'https://lilypadpos9.com/partykingdom/onlinesales/tickets1.php';

const jumpBanner = require('../assets/jump-banner.jpg');

export default function OpenJumpScreen({ navigation }) {
  const [showTickets, setShowTickets] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.mist }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <PageHeader eyebrow="Drop-in play" title="Open Jump" onBack={() => navigation.goBack()} />
        <Image source={jumpBanner} style={styles.banner} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={styles.intro}>
            There's plenty of fun for everyone — 7 days a week, 4 sessions a day. All tickets
            are purchased online; ticket sales are final.
          </Text>

          <Text style={styles.h3}>Session Hours</Text>
          <View style={styles.hoursGrid}>
            <HourRow d="Session 1" t="10:00am – 12:00pm" />
            <HourRow d="Session 2" t="12:30pm – 2:30pm" />
            <HourRow d="Session 3" t="3:00pm – 5:00pm" />
            <HourRow d="Session 4" t="5:30pm – 7:30pm" />
          </View>
          <Text style={styles.note}>
            Friday &amp; Saturday open until 8pm · Sundays open until 2:30pm
          </Text>

          <Text style={styles.h3}>Pricing</Text>
          <Card>
            <View style={styles.priceTop}>
              <View>
                <Text style={styles.pname}>Regular Admission</Text>
                <Text style={styles.psub}>1 adult free with paying child</Text>
              </View>
              <Text style={styles.pprice}>$12.99</Text>
            </View>
            <Text style={styles.bullet}>• Additional adult admission $6.99</Text>
            <Text style={styles.bullet}>• Grip socks must be worn</Text>
          </Card>
          <Text style={styles.note}>
            Member / Play Pass holders select Open Jump Members pricing at checkout.
          </Text>

          <View style={styles.eventStrip}>
            <Text style={{ fontSize: 18 }}>🎱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>Bingo Thursdays, 5–8pm</Text>
              <Text style={styles.eventDesc}>A game every hour with great prizes.</Text>
            </View>
          </View>
          <View style={styles.eventStrip}>
            <Text style={{ fontSize: 18 }}>🔫</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>Nerf Wars Fridays, 5–8pm</Text>
              <Text style={styles.eventDesc}>Some exclusions apply — call for details.</Text>
            </View>
          </View>

          <ReminderCard
            title="No outside food or cakes"
            body="No birthday celebrations during Open Jump unless a party is booked. Grip socks required — available at the front desk for $3."
          />

          <View style={{ marginTop: 20 }}>
            <PrimaryButton label="Buy Open Jump Tickets" variant="gold" onPress={() => setShowTickets(true)} />
          </View>
          <View style={{ marginTop: 10 }}>
            <PrimaryButton
              label="Sign the waiver first"
              variant="outline"
              onPress={() => navigation.navigate('Waiver')}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={showTickets} animationType="slide" onRequestClose={() => setShowTickets(false)}>
        <LilyPadWebView
          source={OPEN_JUMP_TICKETS_URL}
          title="Open Jump Tickets"
          onClose={() => setShowTickets(false)}
          onDetectSuccess={() => {
            // LilyPad confirmed the purchase — close the webview and route
            // to a native confirmation screen if you build one.
            setShowTickets(false);
          }}
        />
      </Modal>
    </View>
  );
}

function HourRow({ d, t }) {
  return (
    <View style={styles.hourRow}>
      <Text style={styles.hourLabel}>{d}</Text>
      <Text style={styles.hourValue}>{t}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 130 },
  content: { padding: 20 },
  intro: { fontSize: 13, color: colors.textBody, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  h3: { fontFamily: undefined, fontWeight: '700', fontSize: 16, color: colors.ink, marginTop: 20, marginBottom: 8 },
  hoursGrid: { gap: 4 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hourLabel: { fontSize: 12.5, color: colors.textMuted, fontWeight: '700' },
  hourValue: { fontSize: 12.5, color: colors.ink, fontWeight: '800' },
  note: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 8 },
  priceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pname: { fontWeight: '700', fontSize: 16, color: colors.ink },
  psub: { fontSize: 11.5, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  pprice: { fontWeight: '700', fontSize: 17, color: colors.royalDeep },
  bullet: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 8 },
  eventStrip: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.mistDeep,
    borderRadius: radius.sm,
    padding: 14,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  eventName: { fontWeight: '800', fontSize: 12.5, color: colors.royalDeep },
  eventDesc: { fontSize: 11.5, color: colors.textBody, fontWeight: '600', marginTop: 2 },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { PageHeader, PrimaryButton, Card, ReminderCard } from '../components/UI';

export default function TeamPartiesScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHeader eyebrow="Sports groups" title="Team Parties" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.intro}>
          Team parties run during Open Jump, Monday–Thursday, and are semi-private. All guests
          need grip socks and a completed waiver before they play.
        </Text>

        <Card>
          <View style={styles.top}>
            <View>
              <Text style={styles.pname}>Team Party Entry</Text>
              <Text style={styles.psub}>Adults free</Text>
            </View>
            <Text style={styles.pprice}>
              $12.99<Text style={styles.perChild}>/child</Text>
            </Text>
          </View>
          <Text style={styles.bullet}>• 2-hour team party window, Monday–Thursday</Text>
          <Text style={styles.bullet}>
            • $50 non-refundable deposit reserves a private party room for trophies &amp; pizza (60
            min)
          </Text>
          <Text style={styles.bullet}>• Deposit includes one free 12-slice cheese pizza</Text>
        </Card>

        <Text style={styles.h3}>How it works</Text>
        <View style={{ gap: 8 }}>
          <Step n="1" text="Pick a day, Monday–Thursday" />
          <Step n="2" text="Reserve online under Team Party Private Party Room" />
          <Step n="3" text="Leave the $50 deposit to hold your room" />
          <Step n="4" text="Players pay their own $12.99 entry when they arrive" />
        </View>

        <ReminderCard
          title="No birthday parties during team parties"
          body="Team parties and Open Jump don't mix with birthday celebrations. Grip socks required — available at the front desk for $3."
        />

        <View style={{ marginTop: 20 }}>
          <PrimaryButton label="Reserve a Team Party Room" variant="gold" onPress={() => navigation.navigate('Book')} />
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
  );
}

function Step({ n, text }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={styles.stepNum}>{n}.</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  intro: { fontSize: 13, color: colors.textBody, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pname: { fontWeight: '700', fontSize: 16, color: colors.ink },
  psub: { fontSize: 11.5, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  pprice: { fontWeight: '700', fontSize: 17, color: colors.royalDeep },
  perChild: { fontSize: 11, fontWeight: '700' },
  bullet: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 8 },
  h3: { fontWeight: '700', fontSize: 16, color: colors.ink, marginTop: 20, marginBottom: 8 },
  stepNum: { fontWeight: '800', color: colors.royal, fontSize: 13 },
  stepText: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', flex: 1 },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { PageHeader, PrimaryButton, Card, ReminderCard } from '../components/UI';

export default function UltimateBashScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHeader eyebrow="Go big" title="Ultimate Bash Parties" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.intro}>
          A private party unlike any other — the whole venue is yours for a fun-filled time with
          friends.
        </Text>

        <Card>
          <View style={styles.top}>
            <View>
              <Text style={styles.pname}>Ultimate Bash</Text>
              <Text style={styles.psub}>Private venue, up to 30 kids</Text>
            </View>
            <Text style={styles.pprice}>$2,599</Text>
          </View>
          <Text style={styles.bullet}>• Pizza, drinks &amp; goodie bags</Text>
          <Text style={styles.bullet}>• Snow cone truck, and more</Text>
          <Text style={styles.bullet}>• $500 non-refundable deposit due at booking</Text>
        </Card>

        <Card>
          <View style={styles.top}>
            <View>
              <Text style={styles.pname}>Ultimate Bash Mini</Text>
              <Text style={styles.psub}>Private venue, up to 25 kids</Text>
            </View>
            <Text style={styles.pprice}>$1,899</Text>
          </View>
          <Text style={styles.bullet}>• Pizza, drinks &amp; goodie bags</Text>
          <Text style={styles.bullet}>• $500 non-refundable deposit due at booking</Text>
        </Card>

        <ReminderCard
          title="Grip socks required"
          body="Grip socks must be worn at all times in the play arenas. Available at the front desk for $3."
        />

        <Text style={styles.emailNote}>
          Ultimate Bash parties are booked by email — this isn't part of the online LilyPad flow.
        </Text>
        <PrimaryButton
          label="Email Us to Book"
          variant="gold"
          onPress={() =>
            Linking.openURL('mailto:info@partykingdomchino.com?subject=Ultimate%20Bash%20Party%20Inquiry')
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  intro: { fontSize: 13, color: colors.textBody, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pname: { fontWeight: '700', fontSize: 16, color: colors.ink },
  psub: { fontSize: 11.5, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  pprice: { fontWeight: '700', fontSize: 17, color: colors.royalDeep },
  bullet: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 8 },
  emailNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
});

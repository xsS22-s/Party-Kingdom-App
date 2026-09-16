import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { PageHeader, PrimaryButton, Card, ReminderCard } from '../components/UI';

export default function FieldTripsScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHeader eyebrow="Schools & groups" title="Field Trips" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.intro}>
          3 hours of fun for all ages, Monday–Friday, 10am–1pm or 1:30pm–4:30pm. For day care
          groups, church groups, school-approved events, summer camps, and approved private
          events only.
        </Text>

        <Card>
          <Text style={styles.pname}>Semi-Private Field Trip</Text>
          <Text style={styles.psub}>During Open Jump · 20 kid minimum</Text>
          <Text style={styles.bullet}>• $12.95/child without pizza &amp; drink</Text>
          <Text style={styles.bullet}>• $14.95/child with 2 slices of pizza &amp; a drink</Text>
          <Text style={styles.bullet}>• $5/adult with 2 slices of pizza &amp; a drink</Text>
        </Card>

        <Card>
          <Text style={styles.pname}>Private Field Trip</Text>
          <Text style={styles.psub}>60 kid minimum</Text>
          <Text style={styles.bullet}>• $14.95/child without pizza &amp; drink</Text>
          <Text style={styles.bullet}>• $16.95/child with 2 slices of pizza &amp; a drink</Text>
          <Text style={styles.bullet}>• $5/adult with 2 slices of pizza &amp; a drink</Text>
        </Card>

        <ReminderCard
          title="Weekdays only, headcount is binding"
          body="Field trip pricing isn't valid for weekend, birthday, or team party bookings. If fewer kids show up than your pizza order, you're responsible for that purchase."
        />

        <Text style={styles.emailNote}>
          Field trips are booked by email — this isn't part of the online LilyPad flow.
        </Text>
        <PrimaryButton
          label="Email Us to Book"
          variant="gold"
          onPress={() =>
            Linking.openURL('mailto:info@partykingdomchino.com?subject=Field%20Trip%20Inquiry')
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  intro: { fontSize: 13, color: colors.textBody, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  pname: { fontWeight: '700', fontSize: 16, color: colors.ink },
  psub: { fontSize: 11.5, color: colors.textMuted, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  bullet: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 4 },
  emailNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
});

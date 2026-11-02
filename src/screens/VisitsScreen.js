import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader, PrimaryButton } from '../components/UI';
import { Field, Choices, Notice } from '../components/FormFields';
import { useAppData } from '../state/AppData';
import { VISIT_KINDS, REMINDER_OPTIONS, validateVisit, visitInputs, formatVisit } from '../services/visitTime';
import { REMINDER_STATUS } from '../services/reminders';
import { colors } from '../theme/colors';

const blank = () => ({ kind: 'Open Jump', date: '', time: '', reminder_hours: 0, reference: '' });
export default function VisitsScreen({ navigation }) {
  const { user, owner, visits, reminders, loading, error, saving, refresh, saveVisit, removeVisit, enableReminders } = useAppData();
  const [section, setSection] = useState('upcoming');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState('');
  useEffect(() => { setEditor(null); setFormError(''); }, [owner]);
  const now = Date.now();
  const upcoming = visits.filter((v) => new Date(v.starts_at).getTime() > now);
  const past = visits.filter((v) => new Date(v.starts_at).getTime() <= now).reverse();
  const visible = section === 'upcoming' ? upcoming : past;
  const startEditor = (visit) => {
    setForm(visit ? { ...visit, ...visitInputs(visit.starts_at) } : blank());
    setFormError('');
    setEditor(visit?.id || 'new');
  };
  const set = (key) => (value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = async () => {
    setFormError('');
    try {
      const values = validateVisit(form);
      const warning = await saveVisit(values, editor === 'new' ? undefined : editor);
      setEditor(null);
      setSection('upcoming');
      if (warning) Alert.alert('Visit saved', warning);
    } catch (problem) { setFormError(problem.message || 'Unable to save. Please try again.'); }
  };
  const remove = (visit) => Alert.alert('Remove this visit?', 'This removes the saved visit and its reminder from this phone after syncing. It does not cancel your LilyPad booking.', [
    { text: 'Keep visit', style: 'cancel' },
    { text: 'Remove visit', style: 'destructive', onPress: async () => {
      try { await removeVisit(visit.id); }
      catch (problem) { Alert.alert('Could not remove visit', problem.message); }
    } },
  ]);

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.royal} />}>
        <PageHeader eyebrow="Plan your next adventure" title="My Visits" showLogo />
        <View style={styles.content}>
          <View style={styles.summary}>
            <Text style={styles.summaryNumber}>{upcoming.length}</Text>
            <View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Upcoming {upcoming.length === 1 ? 'visit' : 'visits'}</Text>
              <Text style={styles.body}>{user ? 'Saved to your account' : 'Saved on this phone'}</Text></View>
          </View>
          <Notice>Add a visit after booking with LilyPad. These are your personal plans, not tickets or proof of a reservation.</Notice>
          {!user && <TouchableOpacity onPress={() => navigation.navigate('Account')} accessibilityRole="button" style={styles.accountLink}>
            <Text style={styles.link}>Create an account or sign in →</Text>
          </TouchableOpacity>}
          <PrimaryButton label="+ Add a visit" onPress={() => startEditor()} disabled={loading || saving || Boolean(error)} />
          <Text style={styles.small}>All visit times use California time. Reminders are scheduled on this phone.</Text>
          {Object.values(reminders).includes('permission') && <PrimaryButton label="Enable reminders on this phone" variant="outline" disabled={loading || saving} onPress={async () => {
            try {
              if (!await enableReminders()) Alert.alert('Notifications are off', 'Enable notifications for this app in your phone settings, then return here.');
            } catch { Alert.alert('Unable to enable reminders', 'Please check your phone settings and try again.'); }
          }} />}

          {error ? <><Notice error>{error}</Notice><PrimaryButton label="Try loading again" variant="outline" onPress={refresh} /></> : null}
          <View style={{ marginTop: 22 }}>
            <Choices label="Your visits" options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} value={section} onChange={setSection} />
          </View>
          {loading && !visits.length ? <ActivityIndicator color={colors.royal} /> : null}
          {!loading && !error && !visible.length && <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.summaryTitle}>{section === 'upcoming' ? 'Something fun to look forward to' : 'No past visits yet'}</Text>
            <Text style={[styles.body, { textAlign: 'center', marginTop: 8 }]}>{section === 'upcoming' ? 'Save your next session here and choose when you’d like a reminder.' : 'Your saved visits will appear here after their scheduled time.'}</Text>
          </View>}
          {visible.map((visit) => (
            <View key={visit.id} style={styles.card}>
              <Text style={styles.cardTitle}>{visit.kind === 'Open Jump' ? '🤾 ' : visit.kind === 'Birthday Party' ? '🎂 ' : '🎉 '}{visit.kind}</Text>
              <Text style={styles.date}>{formatVisit(visit.starts_at)}</Text>
              {visit.reference ? <Text style={styles.body}>Booking reference: {visit.reference}</Text> : null}
              <Text style={styles.status}>{REMINDER_STATUS[reminders[visit.id]] || 'Checking reminder…'}</Text>
              <View style={styles.actions}>
                {section === 'upcoming' && <TouchableOpacity disabled={saving || loading || Boolean(error)} accessibilityRole="button" onPress={() => startEditor(visit)} style={styles.action}><Text style={styles.link}>Edit visit</Text></TouchableOpacity>}
                <TouchableOpacity disabled={saving || loading || Boolean(error)} accessibilityRole="button" onPress={() => remove(visit)} style={styles.action}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.small}>Changed your booking? Update your saved visit too. Changes made on another device update here when you reopen or refresh the app.</Text>
        </View>
      </ScrollView>
      <Modal visible={editor !== null} animationType="slide" onRequestClose={() => { if (!saving) setEditor(null); }}>
        <SafeAreaView style={styles.screen}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <Text style={styles.cardTitle}>{editor === 'new' ? 'Add a visit' : 'Edit visit'}</Text>
              <TouchableOpacity disabled={saving} onPress={() => setEditor(null)} accessibilityRole="button" style={styles.action}><Text style={styles.link}>Cancel</Text></TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <Notice>Use the date and time on your LilyPad confirmation. Saving here does not make or change a booking.</Notice>
              <Choices label="Visit type" options={VISIT_KINDS.map((kind) => ({ value: kind, label: kind }))} value={form.kind} onChange={set('kind')} disabled={saving} />
              <Field label="Visit date" value={form.date} onChangeText={set('date')} placeholder="2026-12-15" hint="YYYY-MM-DD" maxLength={10} autoCapitalize="none" editable={!saving} />
              <Field label="Start time — California time" value={form.time} onChangeText={set('time')} placeholder="15:00" hint="24-hour format: 10:00 = 10 AM · 15:00 = 3 PM" maxLength={5} keyboardType="numbers-and-punctuation" editable={!saving} />
              <Choices label="Remind me" options={REMINDER_OPTIONS} value={form.reminder_hours} onChange={set('reminder_hours')} disabled={saving} />
              <Field label="Booking reference (optional)" value={form.reference} onChangeText={set('reference')} placeholder="From your confirmation" maxLength={80} autoCorrect={false} editable={!saving} />
              <Notice>You can enable notifications when you save a reminder. Delivery depends on your phone’s notification settings.</Notice>
              {formError ? <Notice error>{formError}</Notice> : null}
              <PrimaryButton label={saving ? 'Saving…' : 'Save visit'} onPress={submit} disabled={saving} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist }, content: { padding: 20, paddingBottom: 36 },
  summary: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20, padding: 18, borderRadius: 20, backgroundColor: colors.mistDeep },
  summaryNumber: { fontSize: 42, color: colors.royal, fontWeight: '800' }, summaryTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  body: { fontSize: 13, lineHeight: 20, color: colors.textBody }, small: { fontSize: 12, color: colors.textBody, lineHeight: 18, marginVertical: 12 },
  accountLink: { paddingVertical: 12, marginBottom: 12 }, link: { color: colors.royal, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', padding: 24, backgroundColor: colors.white, borderRadius: 18 }, emptyIcon: { fontSize: 36, marginBottom: 14 },
  card: { borderRadius: 18, backgroundColor: colors.white, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 18 }, date: { color: colors.royalDeep, fontSize: 14, fontWeight: '700', lineHeight: 22, marginVertical: 10 },
  status: { fontSize: 12, color: colors.textBody, lineHeight: 18, marginTop: 12 }, actions: { flexDirection: 'row', gap: 18, marginTop: 8 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, remove: { color: '#A3233B', fontSize: 13, fontWeight: '700' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
});

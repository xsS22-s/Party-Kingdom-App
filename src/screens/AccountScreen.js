import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { PageHeader, PrimaryButton, Card } from '../components/UI';
import { Field, Notice } from '../components/FormFields';
import { useAppData } from '../state/AppData';
import { accounts } from '../services/accounts';
import { colors } from '../theme/colors';

export default function AccountScreen({ navigation }) {
  const { user, authReady, authError, accountsConfigured, saving, signOut, deleteAccount } = useAppData();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    setName(user?.user_metadata?.full_name || '');
    setPhone(user?.user_metadata?.phone || '');
    setCode(''); setSentTo(''); setMessage(''); setError('');
  }, [user?.id]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const run = async (action) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); }
    catch (problem) { setError(problem.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  };
  const sendCode = () => run(async () => {
    if (!accounts) throw new Error('Accounts are not available yet. You can still save visits on this phone.');
    const target = (sentTo || email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) throw new Error('Enter a valid email address.');
    const { error: problem } = await accounts.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } });
    if (problem) throw problem;
    setSentTo(target); setCode(''); setCooldown(60);
    setMessage('Check your email for a sign-in code. If this is your first visit, verifying your email will complete your account setup.');
  });
  const verify = () => run(async () => {
    if (!/^\d{6,8}$/.test(code.trim())) throw new Error('Enter the code from your email.');
    const { data, error: problem } = await accounts.auth.verifyOtp({ email: sentTo, token: code.trim(), type: 'email' });
    if (problem) throw problem;
    if (!data.session) throw new Error('Sign-in was not completed. Please request a new code.');
  });
  const saveProfile = () => run(async () => {
    if (!name.trim()) throw new Error('Enter your name.');
    if (name.trim().length > 100) throw new Error('Keep your name under 100 characters.');
    if (phone.trim() && !/^[+\d\s().-]{7,30}$/.test(phone.trim())) throw new Error('Enter a valid phone number or leave it blank.');
    const { error: problem } = await accounts.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } });
    if (problem) throw problem;
    setMessage('Your profile has been saved.');
  });
  const confirmDelete = () => Alert.alert('Delete your Party Kingdom app account?',
    'This permanently deletes your app profile and account visits. It does not cancel LilyPad bookings or delete LilyPad records. Guest visits on this phone stay separate.', [
      { text: 'Keep account', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: () => run(async () => {
        await deleteAccount();
        Alert.alert('Account deleted', 'Your app account and its saved visits have been deleted.');
      }) },
    ]);
  const disabled = busy || saving;
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 36 }}>
        <PageHeader eyebrow="Your Party Kingdom" title="Account" showLogo />
        <View style={styles.content}>
          {!authReady ? <ActivityIndicator color={colors.royal} /> : user ? (
            <>
              <Card>
                <Text style={styles.heading}>Welcome{name ? `, ${name.split(' ')[0]}` : ''}!</Text>
                <Text style={styles.email}>{user.email}</Text>
                <Text style={styles.body}>Your profile and account visits are saved so you can access them on another phone.</Text>
              </Card>
              <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" maxLength={100} editable={!disabled} />
              <Field label="Phone number (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={30} editable={!disabled} />
              {error ? <Notice error>{error}</Notice> : null}
              {message ? <Notice>{message}</Notice> : null}
              <PrimaryButton label={busy ? 'Please wait…' : 'Save profile'} onPress={saveProfile} disabled={disabled} />
              <View style={{ marginTop: 12 }}><PrimaryButton label="View my visits" variant="outline" onPress={() => navigation.navigate('Visits')} disabled={disabled} /></View>
              <View style={styles.explainer}>
                <Notice>This is your Party Kingdom app account. Booking and waiver details are still managed by LilyPad. Your profile will not automatically fill its forms.</Notice>
                <Text style={styles.body}>Visits you saved as a guest remain on this phone. Sign out to view them; they are not automatically moved into this account.</Text>
              </View>
              <TouchableOpacity style={styles.action} disabled={disabled} onPress={() => run(signOut)} accessibilityRole="button"><Text style={styles.link}>Sign out on this phone</Text></TouchableOpacity>
              <TouchableOpacity style={styles.action} disabled={disabled} onPress={confirmDelete} accessibilityRole="button"><Text style={styles.danger}>Delete my app account</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Your next visit, all in one place.</Text>
              <Notice>Create an account or sign in with an email code. Save your name, phone number, and personal visit plans. No password needed.</Notice>
              {!accountsConfigured ? <Card><Text style={styles.body}>Accounts are not available yet. You can still save visits and reminders on this phone without signing in.</Text></Card> : null}
              {authError ? <Notice error>{authError}</Notice> : null}
              {!sentTo ? <>
                <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!disabled} />
                <PrimaryButton label={busy ? 'Sending…' : 'Email me a code'} onPress={sendCode} disabled={disabled || !accountsConfigured || cooldown > 0} />
              </> : <>
                <Text style={styles.body}>Code sent to {sentTo}</Text>
                <Field label="Email verification code" value={code} onChangeText={setCode} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={8} editable={!disabled} />
                <PrimaryButton label={busy ? 'Checking…' : 'Verify & continue'} onPress={verify} disabled={disabled} />
                <TouchableOpacity style={styles.action} disabled={disabled || cooldown > 0} onPress={sendCode} accessibilityRole="button"><Text style={styles.link}>{cooldown ? `Resend code in ${cooldown}s` : 'Send a new code'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.action} disabled={disabled} onPress={() => { setSentTo(''); setCode(''); setMessage(''); setError(''); }} accessibilityRole="button"><Text style={styles.link}>Use a different email</Text></TouchableOpacity>
              </>}
              {error ? <Notice error>{error}</Notice> : null}
              {message ? <Notice>{message}</Notice> : null}
              {!sentTo && cooldown > 0 ? <Notice>Please wait {cooldown}s before requesting another code.</Notice> : null}
              <View style={styles.explainer}>
                <Text style={styles.body}>Guest visits stay on this phone. Account visits are saved separately. This account is independent of your LilyPad booking account.</Text>
              </View>
              <PrimaryButton label="Continue without an account" variant="outline" onPress={() => navigation.navigate('Visits')} disabled={busy} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mist }, content: { padding: 20 },
  heading: { fontSize: 23, lineHeight: 30, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  email: { color: colors.royal, fontWeight: '700', fontSize: 14, marginBottom: 10 },
  body: { color: colors.textBody, fontSize: 13, lineHeight: 21 },
  explainer: { backgroundColor: colors.mistDeep, padding: 16, borderRadius: 16, marginVertical: 20 },
  action: { minHeight: 48, justifyContent: 'center', paddingVertical: 12 },
  link: { color: colors.royal, fontSize: 14, fontWeight: '700' }, danger: { color: '#A3233B', fontSize: 14, fontWeight: '700' },
});

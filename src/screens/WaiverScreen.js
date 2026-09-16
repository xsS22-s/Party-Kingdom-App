import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { colors, radius } from '../theme/colors';
import { PageHeader, PrimaryButton } from '../components/UI';

// Placeholder waiver text. Replace with Party Kingdom's real,
// attorney-reviewed waiver before this ships — this is not legal copy.
const WAIVER_TEXT = `Indoor play activities, including trampoline arenas, obstacle courses, and slides, carry an inherent risk of injury. By signing below, I confirm I am the parent or legal guardian of the participant named above, I assume responsibility for these risks on their behalf, and I agree to Party Kingdom's facility rules, including the grip-sock policy.

I release Party Kingdom, its owners, and staff from liability for ordinary risks associated with play, except where caused by gross negligence.

Replace this placeholder with Party Kingdom's attorney-reviewed waiver before launch.`;

export default function WaiverScreen({ navigation }) {
  const sigRef = useRef(null);
  const [childName, setChildName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!childName.trim()) {
      setError("Add the participant's name");
      return;
    }
    if (!agreed) {
      setError('Please agree to the terms');
      return;
    }
    if (!signature) {
      setError('Please sign above, then tap Confirm on the pad');
      return;
    }
    setError('');
    setSubmitted(true);
    // Real submission would POST childName/guardianName/phone/signature (a
    // base64 PNG from onOK below) to your backend or a LilyPad waiver
    // endpoint here.
  };

  if (submitted) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.mist }}>
        <View style={styles.confirmScreen}>
          <View style={styles.seal}>
            <Text style={{ fontSize: 36 }}>📜</Text>
          </View>
          <Text style={styles.confirmTitle}>Waiver signed!</Text>
          <Text style={styles.confirmSub}>Show this at check-in</Text>
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>Waiver reference</Text>
            <Text style={styles.refCode}>
              WV-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
            </Text>
            <RefLine label="Participant" value={childName} />
            <RefLine
              label="Signed on"
              value={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <RefLine label="Valid for" value="1 year" />
          </View>
          <View style={{ marginTop: 20, width: '100%' }}>
            <PrimaryButton label="Back to home" variant="royal" onPress={() => navigation.navigate('Home')} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.mist }} contentContainerStyle={{ paddingBottom: 40 }}>
      <PageHeader eyebrow="Required before play" title="Online Waiver" showLogo />
      <View style={styles.content}>
        <Text style={styles.intro}>
          Every guest — kids and adults — needs a signed waiver on file before entering the
          arenas. It only takes a minute.
        </Text>

        <Text style={styles.h3}>Participant</Text>
        <Text style={styles.fieldLabel}>Child's full name</Text>
        <TextInput style={styles.input} placeholder="e.g. Maya Lopez" value={childName} onChangeText={setChildName} />

        <Text style={styles.h3}>Parent / guardian</Text>
        <Text style={styles.fieldLabel}>Full name</Text>
        <TextInput style={styles.input} placeholder="Your full name" value={guardianName} onChangeText={setGuardianName} />
        <Text style={styles.fieldLabel}>Phone</Text>
        <TextInput style={styles.input} placeholder="(909) 555-0123" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <Text style={styles.h3}>Acknowledgment of risk</Text>
        <View style={styles.waiverBox}>
          <ScrollView nestedScrollEnabled>
            <Text style={styles.waiverText}>{WAIVER_TEXT}</Text>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I have read and agree to the terms above, on behalf of myself and the participant
            named.
          </Text>
        </TouchableOpacity>

        <Text style={styles.h3}>Signature</Text>
        <View style={styles.sigPad}>
          <SignatureScreen
            ref={sigRef}
            onOK={(sig) => setSignature(sig)}
            onEmpty={() => setSignature(null)}
            descriptionText=""
            webStyle={sigPadWebStyle}
            autoClear={false}
          />
        </View>
        <View style={styles.sigActions}>
          <Text style={styles.sigHint}>Sign, then tap Confirm</Text>
          <TouchableOpacity onPress={() => { sigRef.current?.clearSignature(); setSignature(null); }}>
            <Text style={styles.sigClear}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sigRef.current?.readSignature()}>
            <Text style={styles.sigConfirm}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={{ marginTop: 20 }}>
          <PrimaryButton label="Submit Waiver" variant="gold" onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
}

function RefLine({ label, value }) {
  return (
    <View style={styles.refLine}>
      <Text style={styles.refLineLabel}>{label}</Text>
      <Text style={styles.refLineValue}>{value}</Text>
    </View>
  );
}

// react-native-signature-canvas renders an internal WebView; this trims its
// default UI chrome since we build our own Clear/Confirm buttons above.
const sigPadWebStyle = `
  .m-signature-pad--footer { display: none; margin: 0; }
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  body,html { background-color: #fff; }
`;

const styles = StyleSheet.create({
  content: { padding: 20 },
  intro: { fontSize: 12.5, color: colors.textMuted, fontWeight: '700', lineHeight: 20, marginTop: 0, marginBottom: 6 },
  h3: { fontWeight: '700', fontSize: 18, color: colors.ink, marginTop: 20, marginBottom: 4 },
  fieldLabel: { fontSize: 12.5, fontWeight: '800', color: colors.ink, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    backgroundColor: colors.white,
  },
  waiverBox: {
    height: 150,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  waiverText: { fontSize: 12, lineHeight: 19, color: colors.textBody, fontWeight: '600' },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 14 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.line,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.royal, borderColor: colors.royal },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '800' },
  checkLabel: { fontSize: 12.5, fontWeight: '700', color: colors.ink, lineHeight: 18, flex: 1 },
  sigPad: {
    height: 160,
    borderWidth: 1.5,
    borderColor: '#C5BBE0',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 6,
    backgroundColor: colors.white,
  },
  sigActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sigHint: { fontSize: 11.5, color: colors.textMuted, fontWeight: '700' },
  sigClear: { fontSize: 12.5, fontWeight: '800', color: colors.textMuted },
  sigConfirm: { fontSize: 12.5, fontWeight: '800', color: colors.royal },
  errorText: { color: colors.coral, fontSize: 12.5, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  confirmScreen: { paddingTop: 60, paddingHorizontal: 26, paddingBottom: 40, alignItems: 'center' },
  seal: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.royal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmTitle: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  confirmSub: { fontSize: 13.5, color: colors.textMuted, fontWeight: '700', marginBottom: 24 },
  refCard: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#C5BBE0',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: 18,
    width: '100%',
  },
  refLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' },
  refCode: { fontSize: 20, fontWeight: '600', color: colors.royalDeep, marginTop: 4, marginBottom: 14 },
  refLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  refLineLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  refLineValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
});

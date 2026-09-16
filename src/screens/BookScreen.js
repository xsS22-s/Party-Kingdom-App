import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors, radius } from '../theme/colors';
import { PageHeader, PrimaryButton, ReminderCard } from '../components/UI';
import LilyPadWebView from '../components/LilyPadWebView';

// Real LilyPad booking URL — this is the same hosted flow embedded via
// iframe on partykingdomchino.com/birthday-parties. Confirm the exact path
// still matches before shipping; LilyPad occasionally changes these.
const LILYPAD_BOOKING_URL = 'https://partykingdom.lilypadpos.app/public/onlinebooking/step1.php';

const PACKAGES = {
  royal: {
    name: 'Semi-Private Party — 25 Kids',
    kidsLabel: 'Up to 25 kids',
    weekday: 559.99,
    weekend: 659.99,
    minKids: 25,
    badge: '$100 off',
    features: [
      '90 min semi-private arena play',
      '60 min private party room',
      'All-you-can-drink in party room',
      'Staff + all plates, cups, napkins & utensils',
    ],
  },
  knight: {
    name: 'Semi-Private Party — 15 Kids',
    kidsLabel: 'Up to 15 kids',
    weekday: 489.99,
    weekend: 589.99,
    minKids: 15,
    badge: '$100 off',
    features: [
      '90 min semi-private arena play',
      '60 min private party room',
      'All-you-can-drink in party room',
      'Staff + all plates, cups, napkins & utensils',
    ],
  },
  sunday: {
    name: 'Sunday Private Party',
    kidsLabel: 'Sundays only · 2:30, 3:15 or 4:00pm',
    tier15: 659.99,
    tier25: 759.99,
    minKids: 15,
    sundayOnly: true,
    badge: '$50 off',
    features: [
      '45 min in Arena 1 + 45 min in Arena 2',
      '1 hour private party room',
      'All-you-can-drink in party room',
    ],
  },
};

const STEP_LABELS = ['Choose a package', 'Pick date & time', 'Your details', 'Review & confirm'];

function isWeekendDate(dateStr) {
  if (!dateStr) return true;
  const day = new Date(dateStr + 'T00:00:00').getDay(); // 0 Sun, 6 Sat
  return day === 0 || day === 6;
}

export default function BookScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [partyDate, setPartyDate] = useState(''); // YYYY-MM-DD, wire to a real date picker
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [kidsCount, setKidsCount] = useState(15);
  const [addons, setAddons] = useState({ nerf: false, bags: false });
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const total = useMemo(() => {
    if (!selectedPkg) return 0;
    const p = PACKAGES[selectedPkg];
    let t;
    if (p.sundayOnly) {
      t = kidsCount <= 15 ? p.tier15 : p.tier25;
      t += Math.max(0, kidsCount - 25) * 25;
    } else {
      t = isWeekendDate(partyDate) ? p.weekend : p.weekday;
      t += Math.max(0, kidsCount - p.minKids) * 25;
    }
    if (addons.nerf) t += 24.99;
    if (addons.bags) t += 4 * kidsCount;
    return t;
  }, [selectedPkg, partyDate, kidsCount, addons]);

  const canContinue =
    (step === 1 && selectedPkg) ||
    (step === 2 && partyDate) ||
    step === 3 ||
    step === 4;

  const handleNext = () => {
    if (!canContinue) return;
    if (step < 4) {
      setStep(step + 1);
    } else {
      setShowCheckout(true);
    }
  };

  const handleWebviewSuccess = () => {
    setShowCheckout(false);
    setConfirmed(true);
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedPkg(null);
    setPartyDate('');
    setSelectedSlot(null);
    setKidsCount(15);
    setAddons({ nerf: false, bags: false });
    setConfirmed(false);
  };

  if (confirmed) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.mist }}>
        <View style={styles.confirmScreen}>
          <View style={styles.seal}>
            <Text style={{ fontSize: 40 }}>👑</Text>
          </View>
          <Text style={styles.confirmTitle}>Booking sealed!</Text>
          <Text style={styles.confirmSub}>A confirmation email is on its way</Text>
          <View style={styles.refCard}>
            <Text style={styles.refLabel}>Confirmation code</Text>
            <Text style={styles.refCode}>PK-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</Text>
            <RefLine label="Package" value={PACKAGES[selectedPkg]?.name ?? '—'} />
            <RefLine label="Date & time" value={`${partyDate || '—'}${selectedSlot ? ' · ' + selectedSlot : ''}`} />
            <RefLine label="Deposit" value="$100.00" />
          </View>
          <View style={{ marginTop: 20, width: '100%' }}>
            <PrimaryButton label="Sign the waiver now" variant="royal" onPress={() => navigation.navigate('Waiver')} />
          </View>
          <View style={{ marginTop: 10, width: '100%' }}>
            <PrimaryButton label="Book another party" variant="outline" onPress={resetFlow} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.mist }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <PageHeader eyebrow="Birthday Parties" title="Book a Party" showLogo />

        <View style={styles.progressTrack}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.progressSeg}>
              <View style={[styles.progressFill, i < step && styles.progressDone, i === step && styles.progressActive]} />
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Step {step} of 4 — {STEP_LABELS[step - 1]}
        </Text>

        <View style={styles.content}>
          {step === 1 && (
            <View>
              {Object.entries(PACKAGES).map(([key, p]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.pkgCard, selectedPkg === key && styles.pkgCardSelected]}
                  onPress={() => setSelectedPkg(key)}
                  activeOpacity={0.85}
                >
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                  <View style={styles.pkgTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pname}>{p.name}</Text>
                      <Text style={styles.pkids}>{p.kidsLabel}</Text>
                    </View>
                    <View style={[styles.radio, selectedPkg === key && styles.radioSelected]} />
                  </View>
                  <Text style={styles.pprice}>
                    {p.sundayOnly
                      ? `$${p.tier15.toFixed(2)}–$${p.tier25.toFixed(2)}`
                      : `$${p.weekend.toFixed(2)} weekend · $${p.weekday.toFixed(2)} weekday`}
                  </Text>
                  {p.features.map((f) => (
                    <Text key={f} style={styles.bullet}>• {f}</Text>
                  ))}
                </TouchableOpacity>
              ))}
              <Text style={styles.smallNote}>Additional kids beyond package limit: +$25 each</Text>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.fieldLabel}>Party date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-08-15"
                value={partyDate}
                onChangeText={setPartyDate}
              />
              <Text style={styles.hint}>
                Swap this for a real date picker (e.g. @react-native-community/datetimepicker)
                before shipping.
              </Text>

              <Text style={styles.fieldLabel}>Available time slots</Text>
              <View style={styles.slotGrid}>
                {['10:00 AM', '12:30 PM', '3:00 PM', '5:30 PM'].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slot, selectedSlot === slot && styles.slotSelected]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Number of children</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setKidsCount(Math.max(5, kidsCount - 5))}>
                  <Text style={styles.stepperBtnText}>–</Text>
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{kidsCount}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setKidsCount(Math.min(60, kidsCount + 5))}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Add-ons</Text>
              <AddonRow
                name="Nerf Party"
                price="$24.99"
                on={addons.nerf}
                onToggle={() => setAddons((a) => ({ ...a, nerf: !a.nerf }))}
              />
              <AddonRow
                name="Goodie Bags"
                price="$4 / child"
                on={addons.bags}
                onToggle={() => setAddons((a) => ({ ...a, bags: !a.bags }))}
              />
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.fieldLabel}>Birthday child's name</Text>
              <TextInput style={styles.input} placeholder="e.g. Maya" />
              <Text style={styles.fieldLabel}>Parent / guardian</Text>
              <TextInput style={styles.input} placeholder="Full name" />
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput style={styles.input} placeholder="(909) 555-0123" keyboardType="phone-pad" />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={styles.input} placeholder="you@email.com" keyboardType="email-address" />
              <ReminderCard
                title="Heads up"
                body="A signed waiver is required for every guest entering the arenas — yours can be done right after booking."
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.reviewCard}>
              <ReviewRow label="Package" value={PACKAGES[selectedPkg]?.name ?? '—'} />
              <ReviewRow label="Date & time" value={`${partyDate || '—'}${selectedSlot ? ' · ' + selectedSlot : ''}`} />
              <ReviewRow label="Children" value={`${kidsCount} kids`} />
              <ReviewRow
                label="Add-ons"
                value={
                  [addons.nerf && 'Nerf Party ($24.99)', addons.bags && 'Goodie Bags ($4/child)']
                    .filter(Boolean)
                    .join(', ') || 'None'
                }
              />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              <Text style={styles.smallNote}>
                A $100 non-refundable deposit secures your date. Final pricing and payment are
                completed securely on Party Kingdom's booking system.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          {step > 1 && (
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Back" variant="outline" onPress={() => setStep(step - 1)} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={step === 4 ? 'Continue to Secure Checkout' : 'Continue'}
              variant="gold"
              onPress={handleNext}
              disabled={!canContinue}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCheckout} animationType="slide" onRequestClose={() => setShowCheckout(false)}>
        <LilyPadWebView
          source={LILYPAD_BOOKING_URL}
          title={`${PACKAGES[selectedPkg]?.name ?? ''} · ${partyDate}${selectedSlot ? ' · ' + selectedSlot : ''}`}
          onClose={() => setShowCheckout(false)}
          onDetectSuccess={handleWebviewSuccess}
        />
      </Modal>
    </View>
  );
}

function AddonRow({ name, price, on, onToggle }) {
  return (
    <View style={styles.addonRow}>
      <View>
        <Text style={styles.addonName}>{name}</Text>
        <Text style={styles.addonPrice}>{price}</Text>
      </View>
      <TouchableOpacity style={[styles.switchTrack, on && styles.switchOn]} onPress={onToggle}>
        <View style={[styles.switchKnob, on && styles.switchKnobOn]} />
      </TouchableOpacity>
    </View>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
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

const styles = StyleSheet.create({
  progressTrack: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 18 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.mistDeep, overflow: 'hidden' },
  progressFill: { height: '100%', width: 0, backgroundColor: colors.green },
  progressDone: { width: '100%' },
  progressActive: { width: '55%' },
  stepLabel: {
    paddingHorizontal: 20,
    paddingTop: 12,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  content: { padding: 20 },
  pkgCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
  },
  pkgCardSelected: { borderColor: colors.greenDeep, backgroundColor: '#F3FAEC' },
  badge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: colors.coral,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  pkgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pname: { fontWeight: '700', fontSize: 16.5, color: colors.ink },
  pkids: { fontSize: 12, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.line },
  radioSelected: { borderColor: colors.greenDeep, backgroundColor: colors.greenDeep },
  pprice: { fontWeight: '600', fontSize: 15, color: colors.royalDeep, marginTop: 8 },
  bullet: { fontSize: 12.5, color: colors.textBody, fontWeight: '600', marginTop: 6 },
  smallNote: { fontSize: 11.5, color: colors.textMuted, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  fieldLabel: { fontSize: 12.5, fontWeight: '800', color: colors.ink, marginBottom: 6, marginTop: 14 },
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
  hint: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 6 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  slot: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  slotSelected: { backgroundColor: colors.royal, borderColor: colors.royal },
  slotText: { fontWeight: '800', fontSize: 13.5, color: colors.ink },
  slotTextSelected: { color: colors.white },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 18, fontWeight: '800', color: colors.royal },
  stepperCount: { fontWeight: '600', fontSize: 18, minWidth: 24, textAlign: 'center' },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  addonName: { fontWeight: '800', fontSize: 13.5, color: colors.ink },
  addonPrice: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  switchTrack: {
    width: 44,
    height: 26,
    borderRadius: 20,
    backgroundColor: colors.mistDeep,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  switchOn: { backgroundColor: colors.ok, borderColor: colors.ok },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    marginLeft: 2,
  },
  switchKnobOn: { marginLeft: 20 },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  reviewLabel: { fontSize: 13.5, fontWeight: '700', color: colors.textBody },
  reviewValue: { fontSize: 13.5, fontWeight: '700', color: colors.ink, maxWidth: '60%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
    marginTop: 6,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.ink },
  totalValue: { fontSize: 16, fontWeight: '600', color: colors.royalDeep },
  btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  confirmScreen: { paddingTop: 60, paddingHorizontal: 26, paddingBottom: 40, alignItems: 'center' },
  seal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.coral,
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

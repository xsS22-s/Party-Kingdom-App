import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function Field({ label, hint, style, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}
export function Choices({ label, options, value, onChange, disabled }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => (
          <TouchableOpacity key={String(option.value)} accessibilityRole="radio" accessibilityState={{ checked: value === option.value, disabled }}
            onPress={() => onChange(option.value)} disabled={disabled} style={[styles.choice, value === option.value && styles.selected]}>
            <Text style={[styles.choiceText, value === option.value && styles.selectedText]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
export function Notice({ children, error = false }) {
  return <Text accessibilityRole={error ? 'alert' : undefined} style={[styles.notice, error && styles.error]}>{children}</Text>;
}
const styles = StyleSheet.create({
  field: { marginBottom: 18 }, label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, color: colors.ink, fontSize: 16, minHeight: 48 },
  hint: { color: colors.textBody, fontSize: 12, lineHeight: 18, marginTop: 6 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 12 },
  selected: { backgroundColor: colors.royal, borderColor: colors.royal },
  choiceText: { color: colors.royal, fontSize: 12, fontWeight: '700' }, selectedText: { color: colors.white },
  notice: { color: colors.textBody, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  error: { color: '#A3233B', backgroundColor: '#FFF0F3', padding: 12, borderRadius: 10 },
});

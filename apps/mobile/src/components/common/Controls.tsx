import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme/tokens';

export function ScreenContainer({ children, style }: React.PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.screen, style]}>{children}</View>;
}
export function Field({ label, hint, error, style, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} placeholderTextColor="#9AA0A8" style={[styles.field, props.multiline && styles.multiline, style]} />
    {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>;
}
export function ActionButton({ label, onPress, busy, outline, disabled, icon, style }: {
  label: string; onPress: () => void; busy?: boolean; outline?: boolean; disabled?: boolean; icon?: React.ReactNode; style?: ViewStyle;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={onPress} style={[styles.button, outline && styles.outline, (disabled || busy) && styles.disabled, style]}>
    {busy ? <ActivityIndicator color={outline ? colors.green : colors.white} /> : icon}
    {!busy && <Text style={[styles.buttonText, outline && styles.outlineText]}>{label}</Text>}
  </Pressable>;
}
export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.headingTitle}>{title}</Text>{subtitle ? <Text style={styles.hint}>{subtitle}</Text> : null}</View>{action}</View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  fieldWrap: { marginBottom: 14 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 7 },
  field: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: radius.small, backgroundColor: colors.white, paddingHorizontal: 14, color: colors.ink, fontSize: 14 },
  multiline: { minHeight: 110, paddingTop: 12, textAlignVertical: 'top' },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  error: { color: colors.red, fontSize: 11, marginTop: 5 },
  button: { minHeight: 50, backgroundColor: colors.green, borderRadius: radius.small, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 16 },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  outlineText: { color: colors.ink },
  disabled: { opacity: 0.55 },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  headingTitle: { color: colors.ink, fontSize: 19, fontWeight: '800' },
});

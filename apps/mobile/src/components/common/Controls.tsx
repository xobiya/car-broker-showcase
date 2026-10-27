import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { radius } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeContext';

export function ScreenContainer({ children, style }: React.PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors } = useTheme();
  return <View style={[styles.screen, { backgroundColor: colors.paper }, style]}>{children}</View>;
}

export function Field({
  label,
  hint,
  error,
  style,
  containerStyle,
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fieldWrap, containerStyle]}>
      <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#9AA0A8"
        style={[
          styles.field,
          {
            backgroundColor: colors.white,
            borderColor: error ? colors.red : colors.line,
            color: colors.ink,
          },
          props.multiline && styles.multiline,
          style,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.red }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  busy,
  outline,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  outline?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, shadowColor: colors.primary },
        outline && [styles.outline, { backgroundColor: colors.white, borderColor: colors.line }],
        (disabled || busy) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={outline ? colors.primary : '#FFFFFF'} /> : icon}
      {!busy && (
        <Text style={[styles.buttonText, outline && [styles.outlineText, { color: colors.ink }]]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.heading}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headingTitle, { color: colors.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.hint, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  multiline: { minHeight: 110, paddingTop: 14, textAlignVertical: 'top' },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  error: { fontSize: 12, marginTop: 5 },
  button: {
    minHeight: 54,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  outlineText: {},
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  headingTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
});

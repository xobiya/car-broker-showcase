import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../src/features/auth/SessionContext';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { colors, radius } from '../src/theme/tokens';
import { AppLogo } from '../src/components/common/AppLogo';

const roles = [
  { id: 'buyer', title: 'Buyer', copy: 'Save cars, compare specs & contact brokers.' },
  { id: 'seller', title: 'Seller', copy: 'List and manage your vehicles.' },
  { id: 'broker', title: 'Broker', copy: 'Manage listings, leads & test drives.' },
] as const;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, register } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ returnTo?: string; tab?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [role, setRole] = useState<'buyer' | 'seller' | 'broker'>('buyer');
  const [creating, setCreating] = useState(params.tab === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.tab === 'signup') setCreating(true);
    else if (params.tab === 'signin') setCreating(false);
  }, [params.tab]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError('Enter a valid email address.');
    if (creating && name.trim().length < 2)
      return setError('Your name must be at least 2 characters.');
    if (password.length < (creating ? 6 : 1))
      return setError(
        creating
          ? 'Use at least 6 characters for your password.'
          : 'Enter your password.',
      );

    setBusy(true);
    try {
      if (creating)
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
        });
      else await signIn(email.trim(), password);

      const returnTo = params.returnTo;
      const safeRoute =
        returnTo &&
        (returnTo.startsWith('/vehicles/') ||
          returnTo.startsWith('/(tabs)/') ||
          returnTo.startsWith('/listing-form'))
          ? (returnTo as Href)
          : '/(tabs)';
      router.replace(safeRoute);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not authenticate. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View
        style={[
          styles.top,
          {
            paddingTop: Math.max(insets.top + 8, 44),
            backgroundColor: colors.card,
            borderBottomColor: colors.line,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <AppLogo size="sm" iconOnly />
          <View>
            <Text style={[styles.brandTitle, { color: colors.ink }]}>
              Arif <Text style={{ color: '#FF4846' }}>Car Sell</Text>
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.muted }]}>
              {creating ? t('action.signUp', 'Create Account') : t('action.signIn', 'Sign In')}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sign in"
          style={[styles.close, { backgroundColor: colors.paper, borderColor: colors.line }]}
          onPress={close}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom + 40, 50) },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            {creating ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
          </Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {creating ? 'Start your car journey.' : 'Good to see you again.'}
          </Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {creating
              ? 'Join Arif Auto to save vehicles, compare specs, and connect with certified Ethiopian brokers.'
              : 'Sign in to access your saved vehicles, compare cars, and check viewing schedules.'}
          </Text>

          {creating ? (
            <>
              <Label title="FULL NAME *" inkColor={colors.ink} />
              <TextInput
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Abebe Bikila"
                placeholderTextColor="#969DA5"
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.line, color: colors.ink }]}
              />

              <Label title="PHONE NUMBER (OPTIONAL)" inkColor={colors.ink} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="+251 91 123 4567"
                placeholderTextColor="#969DA5"
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.line, color: colors.ink }]}
              />

              <Text style={[styles.label, { color: colors.ink }]}>I AM JOINING AS</Text>
              <View style={styles.roles}>
                {roles.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: role === item.id }}
                    onPress={() => setRole(item.id)}
                    style={[
                      styles.role,
                      { backgroundColor: colors.card, borderColor: colors.line },
                      role === item.id && [styles.roleActive, { backgroundColor: isDark ? '#2C1B14' : '#FFFBF8' }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleTitle,
                        { color: colors.ink },
                        role === item.id && styles.roleTitleActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.roleCopy, { color: colors.muted }]}>{item.copy}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Label title="EMAIL ADDRESS *" inkColor={colors.ink} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
            placeholderTextColor="#969DA5"
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.line, color: colors.ink }]}
          />

          <Label title="PASSWORD *" inkColor={colors.ink} />
          <View style={[styles.passwordWrap, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete={creating ? 'new-password' : 'current-password'}
              textContentType={creating ? 'newPassword' : 'password'}
              secureTextEntry={!showPassword}
              placeholder={
                creating ? 'At least 6 characters' : 'Enter your password'
              }
              placeholderTextColor="#969DA5"
              style={[styles.passwordInput, { color: colors.ink }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eye}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={colors.muted}
              />
            </Pressable>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            style={[styles.button, { backgroundColor: colors.primary }, busy && { opacity: 0.6 }]}
            onPress={() => void submit()}
          >
            <Text style={styles.buttonText}>
              {busy
                ? 'Please wait…'
                : creating
                ? 'Create Free Account'
                : 'Sign In to Arif Auto'}
            </Text>
            {!busy ? (
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            ) : null}
          </Pressable>

          {/* Toggle question */}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreating((v) => !v);
              setError('');
            }}
            style={styles.switchRow}
          >
            <Text style={[styles.switchPrompt, { color: colors.muted }]}>
              {creating ? 'Already have an account? ' : 'New to Arif Auto? '}
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {creating ? 'Sign in' : 'Create an account'}
              </Text>
            </Text>
          </Pressable>

          {/* Continue as Guest Link */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)')}
            style={styles.guestLinkWrap}
          >
            <Text style={[styles.guestLinkText, { color: colors.primary }]}>
              Skip & Continue as Guest &rsaquo;
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ title, inkColor }: { title: string; inkColor?: string }) {
  return <Text style={[styles.label, inkColor ? { color: inkColor } : null]}>{title}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: radius.medium,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    color: colors.ink,
    fontSize: 14,
  },
  passwordWrap: {
    height: 50,
    borderRadius: radius.medium,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
  },
  eye: {
    padding: 6,
  },
  roles: {
    gap: 8,
    marginTop: 4,
  },
  role: {
    padding: 12,
    borderRadius: radius.medium,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roleActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBF8',
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleCopy: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  error: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  button: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 6,
  },
  switchPrompt: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchLink: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  guestLinkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  guestLinkText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});

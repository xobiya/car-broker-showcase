import React, { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../src/features/auth/SessionContext';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { AppLogo } from '../src/components/common/AppLogo';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { getApiBaseUrl, setApiBaseUrl } from '../src/services/api-client';
import { radius } from '../src/theme/tokens';

const roles = [
  {
    id: 'buyer' as const,
    title: 'Buyer',
    icon: 'cart-outline' as const,
    copy: 'Browse, save cars & contact brokers',
  },
  {
    id: 'seller' as const,
    title: 'Seller',
    icon: 'car-sport-outline' as const,
    copy: 'List cars & manage your Libre deed',
  },
  {
    id: 'broker' as const,
    title: 'Broker',
    icon: 'briefcase-outline' as const,
    copy: 'Licensed agent managing client deals',
  },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signIn, register, signInWithGoogle } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ returnTo?: string; tab?: string }>();

  const [creating, setCreating] = useState(params.tab === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'broker'>('buyer');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Google Auth Modal & State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  // Scroll reference to ensure active input stays above keyboard
  const scrollViewRef = useRef<ScrollView>(null);

  // Server URL Configuration Modal state
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (params.tab === 'signup') setCreating(true);
    else if (params.tab === 'signin') setCreating(false);
  }, [params.tab]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const handleQuickDemo = (demoRole: 'buyer' | 'seller' | 'broker') => {
    setError('');
    setRole(demoRole);
    if (demoRole === 'buyer') {
      setEmail('buyer@arifauto.et');
      setPassword('password123');
    } else if (demoRole === 'seller') {
      setEmail('seller@arifauto.et');
      setPassword('password123');
    } else {
      setEmail('broker@arifauto.et');
      setPassword('password123');
    }
  };

  const handleSaveServerUrl = async (urlToSave?: string) => {
    const target = (urlToSave ?? serverUrlInput).trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      setTestResult('URL must start with http:// or https://');
      return;
    }
    setTestingConnection(true);
    setTestResult('Testing connection to server…');
    try {
      const clean = target.replace(/\/$/, '');
      const resp = await fetch(`${clean}/api/vehicles`, {
        signal: AbortSignal.timeout(5000),
      });
      await setApiBaseUrl(clean);
      setServerUrlInput(clean);
      if (resp.ok) {
        setTestResult('Connected successfully! Saved.');
        setError('');
        setTimeout(() => {
          setShowServerModal(false);
          setTestResult(null);
        }, 1000);
      } else {
        setTestResult(`Server responded with HTTP ${resp.status}. Saved.`);
      }
    } catch (err) {
      const clean = target.replace(/\/$/, '');
      await setApiBaseUrl(clean);
      setServerUrlInput(clean);
      setTestResult(`Saved (${clean}), but could not connect: ${(err as Error).message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError('Please enter a valid email address.');
    }
    if (creating && name.trim().length < 2) {
      return setError('Your name must be at least 2 characters.');
    }
    if (password.length < (creating ? 6 : 1)) {
      return setError(
        creating
          ? 'Use at least 6 characters for your password.'
          : 'Enter your password.',
      );
    }

    setBusy(true);
    try {
      if (creating) {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
        });
      } else {
        await signIn(email.trim(), password);
      }

      navigateAfterAuth();
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

  const navigateAfterAuth = () => {
    const returnTo = params.returnTo;
    const safeRoute =
      returnTo &&
      (returnTo.startsWith('/vehicles/') ||
        returnTo.startsWith('/(tabs)/') ||
        returnTo.startsWith('/listing-form') ||
        returnTo.startsWith('/brokers/'))
        ? (returnTo as Href)
        : '/(tabs)';
    router.replace(safeRoute);
  };

  const handleOpenGoogleModal = () => {
    setError('');
    setGoogleEmailInput(email.trim());
    setGoogleNameInput(name.trim());
    setShowGoogleModal(true);
  };

  const handleContinueWithGoogle = async (targetEmail?: string, targetName?: string) => {
    const chosenEmail = (targetEmail ?? googleEmailInput).trim();
    const chosenName = (targetName ?? googleNameInput).trim();
    if (!/^\S+@\S+\.\S+$/.test(chosenEmail)) {
      Alert.alert('Google Account', 'Please enter a valid Google account email.');
      return;
    }

    setGoogleBusy(true);
    setError('');
    try {
      await signInWithGoogle({
        email: chosenEmail,
        name: chosenName || chosenEmail.split('@')[0],
        role,
      });
      setShowGoogleModal(false);
      navigateAfterAuth();
    } catch (err: any) {
      setError(err?.message || 'Could not authenticate with Google.');
      setShowGoogleModal(false);
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: isDark ? '#0C0E14' : '#F8F9FB' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ---------------------------------------------------- */}
      {/* ARTISTIC TOP & BOTTOM WAVE ACCENTS (Background)      */}
      {/* ---------------------------------------------------- */}
      {/* Top Wave Shapes */}
      <View style={styles.topWaveContainer} pointerEvents="none">
        {/* Layer 1: Deep primary curve */}
        <View
          style={[
            styles.topWaveLayer1,
            { backgroundColor: isDark ? '#3D150B' : '#FFE2D5' },
          ]}
        />
        {/* Layer 2: Main vibrant brand curve */}
        <View
          style={[
            styles.topWaveLayer2,
            { backgroundColor: colors.primary },
          ]}
        />
      </View>

      {/* Bottom Wave Shapes (Rendered strictly under/behind the card) */}
      <View style={styles.bottomWaveContainer} pointerEvents="none">
        {/* Layer 1: Darker accent curve */}
        <View
          style={[
            styles.bottomWaveLayer1,
            { backgroundColor: isDark ? '#230E07' : '#FFD6C2' },
          ]}
        />
        {/* Layer 2: Main primary curve */}
        <View
          style={[
            styles.bottomWaveLayer2,
            { backgroundColor: colors.primary },
          ]}
        />
      </View>

      {/* ---------------------------------------------------- */}
      {/* TOP NAVIGATION HEADER (Close, Server Settings & Prefs)*/}
      {/* ---------------------------------------------------- */}
      <View
        style={[
          styles.topNav,
          { paddingTop: Math.max(insets.top + 6, 42) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sign in"
          onPress={close}
          style={[
            styles.navCircleBtn,
            {
              backgroundColor: isDark ? 'rgba(26, 31, 44, 0.85)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.line,
            },
          ]}
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </Pressable>

        <AppLogo size="sm" />

        <View style={styles.topNavRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Configure server URL"
            onPress={() => {
              setServerUrlInput(getApiBaseUrl());
              setTestResult(null);
              setShowServerModal(true);
            }}
            style={[
              styles.navCircleBtn,
              {
                backgroundColor: isDark ? 'rgba(26, 31, 44, 0.85)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.line,
              },
            ]}
          >
            <Ionicons name="server-outline" size={17} color={colors.primary} />
          </Pressable>
          <QuickHeaderSwitcher />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 260, 300) },
        ]}
      >
        {/* ---------------------------------------------------- */}
        {/* MAIN AUTHENTICATION CARD                             */}
        {/* ---------------------------------------------------- */}
        <View
          style={[
            styles.authCard,
            {
              backgroundColor: isDark ? '#141822' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {/* Main Title matching Mockup */}
          <View style={styles.headerBlock}>
            <Text style={[styles.mainTitle, { color: colors.primary }]}>
              {creating ? 'Sign Up' : 'Log In'}
            </Text>
            <Text style={[styles.mainSubtitle, { color: colors.muted }]}>
              {creating
                ? 'Create your verified account on Arif Auto'
                : 'Welcome back to your Ethiopian car showroom'}
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorBannerRow}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={styles.errorIcon} />
                <View style={styles.errorContent}>
                  <Text style={styles.errorText}>{error}</Text>
                  {(error.toLowerCase().includes('fetch') ||
                    error.toLowerCase().includes('network') ||
                    error.toLowerCase().includes('cleartext') ||
                    error.toLowerCase().includes('10.0.2.2')) && (
                    <Pressable
                      onPress={() => {
                        setServerUrlInput(getApiBaseUrl());
                        setTestResult(null);
                        setShowServerModal(true);
                      }}
                      style={styles.errorActionBtn}
                    >
                      <Ionicons name="settings-outline" size={13} color="#FFFFFF" />
                      <Text style={styles.errorActionBtnText}>
                        Configure Server URL ({getApiBaseUrl()})
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {/* ---------------------------------------------------- */}
          {/* SIGN UP FORM FIELDS                                  */}
          {/* ---------------------------------------------------- */}
          {creating ? (
            <>
              {/* Role Selection: Buyer, Seller, Broker */}
              <View style={styles.roleSection}>
                <Text style={[styles.inputLabel, { color: colors.ink }]}>
                  I AM JOINING AS
                </Text>
                <View style={styles.rolesRow}>
                  {roles.map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Join as ${r.title}`}
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setRole(r.id)}
                        style={[
                          styles.roleCard,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#2C1B14'
                                : '#FFF3EB'
                              : isDark
                              ? '#1C212E'
                              : '#F4F5F7',
                            borderColor: isSelected
                              ? colors.primary
                              : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : '#E5E7EB',
                          },
                        ]}
                      >
                        <Ionicons
                          name={r.icon}
                          size={18}
                          color={isSelected ? colors.primary : colors.muted}
                        />
                        <Text
                          style={[
                            styles.roleTitleText,
                            {
                              color: isSelected ? colors.primary : colors.ink,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {r.title}
                        </Text>
                        {isSelected && (
                          <View
                            style={[
                              styles.roleCheckDot,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={[styles.roleHint, { color: colors.muted }]}>
                  {roles.find((r) => r.id === role)?.copy}
                </Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.ink }]}>
                  FULL NAME
                </Text>
                <View
                  style={[
                    styles.pillInputWrap,
                    {
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={17} color={colors.muted} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholder="e.g. Abebe Bikila"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.pillTextInput, { color: colors.ink }]}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 80, animated: true });
                      }, 100);
                    }}
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.ink }]}>
                  PHONE NUMBER (OPTIONAL)
                </Text>
                <View
                  style={[
                    styles.pillInputWrap,
                    {
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                    },
                  ]}
                >
                  <Ionicons name="call-outline" size={17} color={colors.muted} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholder="+251 91 123 4567"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.pillTextInput, { color: colors.ink }]}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 160, animated: true });
                      }, 100);
                    }}
                  />
                </View>
              </View>
            </>
          ) : null}

          {/* Email Address / Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.ink }]}>
              {creating ? 'EMAIL ADDRESS' : 'EMAIL OR USERNAME'}
            </Text>
            <View
              style={[
                styles.pillInputWrap,
                {
                  backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="mail-outline" size={17} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder={creating ? 'you@example.com' : 'Email or username'}
                placeholderTextColor="#9CA3AF"
                style={[styles.pillTextInput, { color: colors.ink }]}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: creating ? 250 : 100, animated: true });
                  }, 100);
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.ink }]}>
              PASSWORD
            </Text>
            <View
              style={[
                styles.pillInputWrap,
                {
                  backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={17} color={colors.muted} />
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
                placeholderTextColor="#9CA3AF"
                style={[styles.pillTextInput, { color: colors.ink }]}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: creating ? 360 : 180, animated: true });
                  }, 100);
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* REMEMBER ME Checkbox (Matching Mockup) */}
          <View style={styles.rememberMeRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxTouchable}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    backgroundColor: rememberMe
                      ? colors.primary
                      : isDark
                      ? '#1C212E'
                      : '#FFFFFF',
                    borderColor: rememberMe
                      ? colors.primary
                      : isDark
                      ? 'rgba(255, 255, 255, 0.2)'
                      : '#CBD5E1',
                  },
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.rememberMeText,
                  { color: isDark ? '#9CA3AF' : '#64748B' },
                ]}
              >
                REMEMBER ME
              </Text>
            </Pressable>

            {!creating && (
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Password Reset',
                    'A password recovery link has been sent to your registered email address.',
                  )
                }
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>
                  Forgot?
                </Text>
              </Pressable>
            )}
          </View>

          {/* Main Vibrant Pill Action Button (Signup / Log In) */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.mainActionButton,
              {
                backgroundColor: colors.primary,
                opacity: busy ? 0.7 : pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text style={styles.mainActionButtonText}>
              {busy ? 'Please wait…' : creating ? 'Signup' : 'Log in'}
            </Text>
            {!busy && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            )}
          </Pressable>

          {/* OR Divider */}
          <View style={styles.authDividerRow}>
            <View
              style={[
                styles.authDividerLine,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : '#E5E7EB',
                },
              ]}
            />
            <Text
              style={[
                styles.authDividerText,
                { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              OR
            </Text>
            <View
              style={[
                styles.authDividerLine,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : '#E5E7EB',
                },
              ]}
            />
          </View>

          {/* Continue with Google Button (Firebase Google Auth) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={creating ? 'Sign up with Google' : 'Continue with Google'}
            disabled={busy || googleBusy}
            onPress={handleOpenGoogleModal}
            style={({ pressed }) => [
              styles.googleAuthButton,
              {
                backgroundColor: isDark ? '#1C212E' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB',
                opacity: busy || googleBusy ? 0.7 : pressed ? 0.92 : 1,
              },
            ]}
          >
            <View style={styles.googleIconBadge}>
              <Ionicons name="logo-google" size={17} color="#EA4335" />
            </View>
            <Text style={[styles.googleAuthButtonText, { color: colors.ink }]}>
              {creating ? 'Sign up with Google' : 'Continue with Google'}
            </Text>
          </Pressable>

          {/* Switch Mode: "Already have an account? LOG IN" / "Don't Have An Account? Sign Up" */}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreating(!creating);
              setError('');
            }}
            style={styles.switchModeRow}
            hitSlop={6}
          >
            <Text style={[styles.switchPromptText, { color: colors.muted }]}>
              {creating
                ? 'Already have an account? '
                : "Don't Have An Account? "}
              <Text
                style={[
                  styles.switchHighlightText,
                  { color: colors.primary },
                ]}
              >
                {creating ? 'LOG IN' : 'Sign Up'}
              </Text>
            </Text>
          </Pressable>

          {/* ---------------------------------------------------- */}
          {/* QUICK DEMO LOGIN ROLE SELECTOR                       */}
          {/* ---------------------------------------------------- */}
          {!creating && (
            <View style={styles.demoSection}>
              <Text style={[styles.demoSectionTitle, { color: colors.muted }]}>
                QUICK DEMO LOGIN
              </Text>
              <View style={styles.demoChipsRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleQuickDemo('buyer')}
                  style={[
                    styles.demoChip,
                    {
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: role === 'buyer' && email === 'buyer@arifauto.et' ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <Ionicons name="cart-outline" size={13} color={colors.primary} />
                  <Text style={[styles.demoChipText, { color: colors.ink }]}>
                    Buyer
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleQuickDemo('seller')}
                  style={[
                    styles.demoChip,
                    {
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: role === 'seller' && email === 'seller@arifauto.et' ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <Ionicons name="car-sport-outline" size={13} color="#059669" />
                  <Text style={[styles.demoChipText, { color: colors.ink }]}>
                    Seller
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleQuickDemo('broker')}
                  style={[
                    styles.demoChip,
                    {
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: role === 'broker' && email === 'broker@arifauto.et' ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <Ionicons name="briefcase-outline" size={13} color="#2563EB" />
                  <Text style={[styles.demoChipText, { color: colors.ink }]}>
                    Broker
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Continue as Guest Link */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip and continue as guest"
            onPress={() => {
              if (
                params.returnTo &&
                (params.returnTo.startsWith('/listing-form') ||
                  params.returnTo.startsWith('/vehicles/'))
              ) {
                router.replace(params.returnTo as Href);
              } else if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={styles.guestLinkButton}
            hitSlop={8}
          >
            <Text style={[styles.guestLinkButtonText, { color: colors.muted }]}>
              Skip & Continue as Guest &rsaquo;
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      {/* Server URL Configuration Modal */}
      <Modal
        visible={showServerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#141822' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="server" size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.ink }]}>
                  Server URL Settings
                </Text>
              </View>
              <Pressable
                onPress={() => setShowServerModal(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              Enter your backend API address. For physical phones on Wi-Fi, use your computer's LAN IP. If using 4G mobile data, use an ngrok or public URL.
            </Text>

            <View style={styles.modalInputWrap}>
              <Text style={[styles.inputLabel, { color: colors.ink, marginBottom: 6 }]}>
                API BASE URL
              </Text>
              <TextInput
                value={serverUrlInput}
                onChangeText={setServerUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="http://172.26.166.46:3000"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.modalTextInput,
                  {
                    color: colors.ink,
                    backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
                  },
                ]}
              />
            </View>

            {/* Quick Presets */}
            <Text style={[styles.modalPresetsTitle, { color: colors.muted }]}>
              QUICK PRESETS:
            </Text>
            <View style={styles.presetsRow}>
              <Pressable
                onPress={() => handleSaveServerUrl('http://172.26.166.46:3000')}
                style={[styles.presetChip, { borderColor: colors.primary }]}
              >
                <Text style={[styles.presetChipText, { color: colors.primary }]}>
                  Computer Wi-Fi (172.26.166.46)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSaveServerUrl('http://10.0.2.2:3000')}
                style={[styles.presetChip, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}
              >
                <Text style={[styles.presetChipText, { color: colors.muted }]}>
                  Android Emulator (10.0.2.2)
                </Text>
              </Pressable>
            </View>

            {testResult && (
              <View
                style={[
                  styles.testResultBox,
                  {
                    backgroundColor: testResult.includes('success')
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name={testResult.includes('success') ? 'checkmark-circle' : 'information-circle'}
                  size={16}
                  color={testResult.includes('success') ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.testResultText,
                    {
                      color: testResult.includes('success') ? '#10B981' : '#EF4444',
                    },
                  ]}
                >
                  {testResult}
                </Text>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={() => setShowServerModal(false)}
                style={[
                  styles.modalCancelBtn,
                  { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' },
                ]}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.ink }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                disabled={testingConnection}
                onPress={() => handleSaveServerUrl()}
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary, opacity: testingConnection ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.modalSaveBtnText}>
                  {testingConnection ? 'Testing…' : 'Test & Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Firebase Google Auth Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#141822' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.googleIconCircle}>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.ink }]}>
                    {creating ? 'Sign Up with Google' : 'Sign In with Google'}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
                    FIREBASE AUTHENTICATION
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowGoogleModal(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
              {creating
                ? `Create your ${role.toUpperCase()} account in 1 click using Google Firebase auth.`
                : `Sign in to your Arif Car Sell account linked with Google.`}
            </Text>

            {creating && (
              <View style={styles.modalInputWrap}>
                <Text style={[styles.inputLabel, { color: colors.ink, marginBottom: 6 }]}>
                  YOUR NAME
                </Text>
                <TextInput
                  value={googleNameInput}
                  onChangeText={setGoogleNameInput}
                  placeholder="e.g. Feleke Eshetu"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.modalTextInput,
                    {
                      color: colors.ink,
                      backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
                    },
                  ]}
                />
              </View>
            )}

            <View style={styles.modalInputWrap}>
              <Text style={[styles.inputLabel, { color: colors.ink, marginBottom: 6 }]}>
                GOOGLE ACCOUNT EMAIL
              </Text>
              <TextInput
                value={googleEmailInput}
                onChangeText={setGoogleEmailInput}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@gmail.com"
                placeholderTextColor="#9CA3AF"
                style={[
                  styles.modalTextInput,
                  {
                    color: colors.ink,
                    backgroundColor: isDark ? '#1C212E' : '#F3F4F6',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
                  },
                ]}
              />
            </View>

            {/* Quick 1-Tap Google Accounts */}
            <Text style={[styles.modalPresetsTitle, { color: colors.muted }]}>
              ONE-TAP DEMO ACCOUNTS:
            </Text>
            <View style={styles.presetsRow}>
              <Pressable
                onPress={() => void handleContinueWithGoogle('buyer.google@arifauto.et', 'Google Buyer')}
                style={[styles.presetChip, { borderColor: colors.primary }]}
              >
                <Text style={[styles.presetChipText, { color: colors.primary }]}>
                  Buyer Demo (buyer.google@arifauto.et)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleContinueWithGoogle('seller.google@arifauto.et', 'Google Seller')}
                style={[styles.presetChip, { borderColor: '#059669' }]}
              >
                <Text style={[styles.presetChipText, { color: '#059669' }]}>
                  Seller Demo (seller.google@arifauto.et)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleContinueWithGoogle('broker.google@arifauto.et', 'Google Broker')}
                style={[styles.presetChip, { borderColor: '#2563EB' }]}
              >
                <Text style={[styles.presetChipText, { color: '#2563EB' }]}>
                  Broker Demo (broker.google@arifauto.et)
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={() => setShowGoogleModal(false)}
                style={[
                  styles.modalCancelBtn,
                  { borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB' },
                ]}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.muted }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                disabled={googleBusy}
                onPress={() => void handleContinueWithGoogle()}
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary, opacity: googleBusy ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.modalSaveBtnText}>
                  {googleBusy ? 'Signing in…' : 'Continue'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  /* Top Wave Shapes */
  topWaveContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: 180,
    overflow: 'hidden',
    zIndex: 0,
  },
  topWaveLayer1: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 280,
    height: 240,
    borderRadius: 120,
    opacity: 0.85,
    transform: [{ rotate: '25deg' }],
  },
  topWaveLayer2: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 250,
    borderRadius: 130,
    opacity: 0.95,
    transform: [{ rotate: '40deg' }],
  },

  /* Bottom Wave Shapes (Rendered under the form) */
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 200,
    overflow: 'hidden',
    zIndex: 0,
  },
  bottomWaveLayer1: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 260,
    height: 210,
    borderRadius: 105,
    opacity: 0.65,
    transform: [{ rotate: '-20deg' }],
  },
  bottomWaveLayer2: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 300,
    height: 240,
    borderRadius: 120,
    opacity: 0.95,
    transform: [{ rotate: '-35deg' }],
  },

  /* Top Nav Bar */
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 20,
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Content & View */
  scrollView: {
    flex: 1,
    zIndex: 5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    zIndex: 5,
  },

  /* Auth Card */
  authCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
    zIndex: 6,
  },

  /* Title Block */
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 12.5,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Error Banner */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Role Selection */
  roleSection: {
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  roleCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  roleTitleText: {
    fontSize: 12,
    marginTop: 4,
  },
  roleCheckDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleHint: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },

  /* Input Fields */
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pillInputWrap: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  pillTextInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },

  /* Remember Me Row */
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkboxTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Main Action Button */
  mainActionButton: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  /* Switch Mode */
  switchModeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  switchPromptText: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchHighlightText: {
    fontWeight: '800',
  },

  /* Demo Logins */
  demoSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.12)',
    alignItems: 'center',
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  demoChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Guest Link */
  guestLinkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  guestLinkButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Top Nav Right */
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Error Action Button */
  errorBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorIcon: {
    marginTop: 2,
  },
  errorContent: {
    flex: 1,
  },
  errorActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    gap: 6,
  },
  errorActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Server Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },
  modalInputWrap: {
    marginBottom: 12,
  },
  modalTextInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  modalPresetsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  presetChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  testResultText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Auth Divider & Google Button */
  authDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 12,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
  },
  authDividerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  googleAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.2,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleAuthButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});

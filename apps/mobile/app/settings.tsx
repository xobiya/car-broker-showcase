import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Field, SectionHeading } from '../src/components/common/Controls';
import { useSession } from '../src/features/auth/SessionContext';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { radius } from '../src/theme/tokens';

export default function SettingsScreen() {
  const { user, updateProfile, changePassword } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');

  const saveProfile = async () => {
    if (!user) return router.replace('/login');
    if (name.trim().length < 2) return setMessage('Name must be at least 2 characters.');
    setSavingProfile(true);
    setMessage('');
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), bio: bio.trim() });
      setMessage('Profile saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not update your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setMessage('');
    if (!currentPassword) return setMessage('Enter your current password.');
    if (newPassword.length < 6) return setMessage('New password must be at least 6 characters.');
    if (currentPassword === newPassword) return setMessage('Choose a password different from your current one.');
    setSavingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setMessage(result);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.line },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[
            styles.back,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>
          {t('profile.personalDetails', 'Account Settings')}
        </Text>
        <View style={{ marginLeft: 'auto' }}>
          <QuickHeaderSwitcher />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionHeading title="Personal information" subtitle="Update the details attached to your account." />
        <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" />
        <Field label="Email address" value={user?.email ?? ''} editable={false} placeholder="Email" />
        <Field
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+251 …"
          hint="A phone number helps buyers and brokers contact you."
        />
        <Field
          label="About you (optional)"
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={500}
          placeholder="A short introduction"
        />
        <ActionButton label="Save profile" busy={savingProfile} onPress={() => void saveProfile()} />

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        <SectionHeading title="Change password" subtitle="Your current password is required to confirm this change." />
        <Field
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Current password"
        />
        <Field
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="At least 6 characters"
        />
        <ActionButton label="Update password" busy={savingPassword} outline onPress={() => void savePassword()} />

        {message ? (
          <Text
            accessibilityRole="alert"
            style={[styles.feedback, /saved|success|changed/i.test(message) && styles.success]}
          >
            {message}
          </Text>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        <SectionHeading title="Experience" subtitle="Preview the initial welcome and onboarding flow." />
        <ActionButton
          label="View Welcome & Onboarding Screen"
          outline
          onPress={() => router.push('/onboarding')}
        />

        <View style={[styles.divider, { backgroundColor: colors.line }]} />

        <View
          style={[
            styles.info,
            {
              backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
              borderColor: isDark ? '#FF6A26' : '#FFD9C6',
            },
          ]}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.ink }]}>
            Your session token is stored in the device’s secure storage. Account deletion and password recovery are not available through the current backend.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  content: { padding: 20, paddingBottom: 40 },
  divider: { height: 1, marginVertical: 24 },
  feedback: { marginTop: 12, color: '#FF4D4F', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  success: { color: '#10B981' },
  info: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: radius.medium,
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});

import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Field, SectionHeading } from '../src/components/common/Controls';
import { useSession } from '../src/features/auth/SessionContext';
import { colors, radius } from '../src/theme/tokens';

export default function SettingsScreen() {
  const { user, updateProfile, changePassword } = useSession();
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
    setSavingProfile(true); setMessage('');
    try { await updateProfile({ name: name.trim(), phone: phone.trim(), bio: bio.trim() }); setMessage('Profile saved.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update your profile.'); }
    finally { setSavingProfile(false); }
  };
  const savePassword = async () => {
    setMessage('');
    if (!currentPassword) return setMessage('Enter your current password.');
    if (newPassword.length < 6) return setMessage('New password must be at least 6 characters.');
    if (currentPassword === newPassword) return setMessage('Choose a password different from your current one.');
    setSavingPassword(true);
    try { const result = await changePassword(currentPassword, newPassword); setCurrentPassword(''); setNewPassword(''); setMessage(result); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not change password.'); }
    finally { setSavingPassword(false); }
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.ink} /></Pressable><Text style={styles.headerTitle}>Account settings</Text></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SectionHeading title="Personal information" subtitle="Update the details attached to your account." />
      <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" />
      <Field label="Email address" value={user?.email ?? ''} editable={false} placeholder="Email" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+251 …" hint="A phone number helps buyers and brokers contact you." />
      <Field label="About you (optional)" value={bio} onChangeText={setBio} multiline maxLength={500} placeholder="A short introduction" />
      <ActionButton label="Save profile" busy={savingProfile} onPress={() => void saveProfile()} />
      <View style={styles.divider} />
      <SectionHeading title="Change password" subtitle="Your current password is required to confirm this change." />
      <Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" placeholder="Current password" />
      <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" placeholder="At least 6 characters" />
      <ActionButton label="Update password" busy={savingPassword} outline onPress={() => void savePassword()} />
      {message ? <Text accessibilityRole="alert" style={[styles.feedback, /saved|success|changed/i.test(message) && styles.success]}>{message}</Text> : null}
      <View style={styles.divider} />
      <View style={styles.info}><Ionicons name="lock-closed-outline" size={18} color={colors.green} /><Text style={styles.infoText}>Your session token is stored in the device’s secure storage. Account deletion and password recovery are not available through the current backend.</Text></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.paper }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 }, back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink }, content: { paddingHorizontal: 20, paddingBottom: 36 }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 25 }, feedback: { marginTop: 12, color: colors.red, fontSize: 12, lineHeight: 18 }, success: { color: colors.success }, info: { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: colors.mint, borderRadius: radius.small, alignItems: 'flex-start' }, infoText: { flex: 1, color: colors.ink, fontSize: 11, lineHeight: 17 } });

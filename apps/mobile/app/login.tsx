import React, { useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../src/features/auth/SessionContext';
import { colors, radius } from '../src/theme/tokens';

const roles = [
  { id: 'buyer', title: 'Buyer', copy: 'Save cars and contact sellers.' },
  { id: 'seller', title: 'Seller', copy: 'List and manage your vehicle.' },
  { id: 'broker', title: 'Broker', copy: 'Manage listings and buyer leads.' },
] as const;
export default function LoginScreen() {
  const { signIn, register } = useSession();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'broker'>('buyer');
  const [creating, setCreating] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const close = () => router.back();
  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (creating && name.trim().length < 2) return setError('Your name must be at least 2 characters.');
    if (password.length < (creating ? 6 : 1)) return setError(creating ? 'Use at least 6 characters for your password.' : 'Enter your password.');
    setBusy(true);
    try {
      if (creating) await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role });
      else await signIn(email.trim(), password);
      const returnTo = params.returnTo;
      const safeRoute = returnTo && (returnTo.startsWith('/vehicles/') || returnTo.startsWith('/(tabs)/')) ? returnTo as Href : '/(tabs)';
      router.replace(safeRoute);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not authenticate. Please try again.'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.top}><View style={styles.brandMark}><Ionicons name="car-sport" size={25} color={colors.white} /></View><Pressable accessibilityRole="button" accessibilityLabel="Close sign in" style={styles.close} onPress={close}><Ionicons name="close" size={21} color={colors.ink} /></Pressable></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <View style={styles.content}><Text style={styles.eyebrow}>{creating ? 'JOIN ARIF CAR SELL' : 'WELCOME BACK'}</Text><Text style={styles.title}>{creating ? 'Start your next move.' : 'Good to see you.'}</Text><Text style={styles.sub}>{creating ? 'Create an account to save cars, list a vehicle, or connect with local brokers.' : 'Sign in to reach your saved cars, listings and inquiries.'}</Text>
        {creating ? <><Label title="FULL NAME" /><TextInput value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" placeholder="Your name" placeholderTextColor="#969DA5" style={styles.input} /><Label title="PHONE (OPTIONAL)" /><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+251 …" placeholderTextColor="#969DA5" style={styles.input} /><Text style={styles.label}>I’M HERE AS</Text><View style={styles.roles}>{roles.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: role === item.id }} onPress={() => setRole(item.id)} style={[styles.role, role === item.id && styles.roleActive]}><Text style={[styles.roleTitle, role === item.id && styles.roleTitleActive]}>{item.title}</Text><Text style={styles.roleCopy}>{item.copy}</Text></Pressable>)}</View></> : null}
        <Label title="EMAIL ADDRESS" /><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor="#969DA5" style={styles.input} />
        <Label title="PASSWORD" /><View style={styles.passwordWrap}><TextInput value={password} onChangeText={setPassword} autoCapitalize="none" autoComplete={creating ? 'new-password' : 'current-password'} textContentType={creating ? 'newPassword' : 'password'} secureTextEntry={!showPassword} placeholder={creating ? 'At least 6 characters' : 'Enter your password'} placeholderTextColor="#969DA5" style={styles.passwordInput} /><Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword(v => !v)} style={styles.eye}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} /></Pressable></View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} style={[styles.button, busy && { opacity: .6 }]} onPress={() => void submit()}><Text style={styles.buttonText}>{busy ? 'Please wait…' : creating ? 'Create account' : 'Sign in'}</Text>{!busy ? <Ionicons name="arrow-forward" size={17} color={colors.white} /> : null}</Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setCreating(v => !v); setError(''); }}><Text style={styles.note}>{creating ? 'Already have an account? Sign in' : 'New to Arif? Create an account'}</Text></Pressable>
        {!creating ? <Text style={styles.footnote}>Forgotten password? Contact support to recover access. Password reset is not currently available in the backend.</Text> : null}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
function Label({ title }: { title: string }) { return <Text style={styles.label}>{title}</Text>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.paper }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 21, paddingTop: 13 }, brandMark: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }, close: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, scroll: { flexGrow: 1 }, content: { paddingHorizontal: 24, paddingTop: 25, paddingBottom: 35 }, eyebrow: { color: colors.greenDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 7 }, title: { color: colors.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -.7 }, sub: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 15 }, label: { color: colors.ink, fontSize: 10, fontWeight: '900', letterSpacing: .8, marginTop: 13, marginBottom: 7 }, input: { height: 50, borderRadius: 13, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 14, fontSize: 13, color: colors.ink }, passwordWrap: { minHeight: 50, borderRadius: 13, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }, passwordInput: { flex: 1, height: 49, paddingHorizontal: 14, fontSize: 13, color: colors.ink }, eye: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }, roles: { gap: 8 }, role: { minHeight: 60, padding: 11, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }, roleActive: { borderColor: colors.green, backgroundColor: colors.mint }, roleTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, roleTitleActive: { color: colors.greenDark }, roleCopy: { color: colors.muted, fontSize: 10, marginTop: 3 }, error: { color: colors.red, fontSize: 12, marginTop: 11, lineHeight: 17 }, button: { height: 52, backgroundColor: colors.green, borderRadius: 14, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, buttonText: { fontSize: 13, fontWeight: '900', color: colors.white }, note: { fontSize: 12, color: colors.greenDark, textAlign: 'center', lineHeight: 17, marginTop: 17, fontWeight: '800' }, footnote: { textAlign: 'center', color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 17 } });

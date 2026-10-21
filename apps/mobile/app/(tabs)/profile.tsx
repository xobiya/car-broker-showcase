import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../src/features/auth/SessionContext';
import { colors, radius } from '../../src/theme/tokens';
import {
  ActionButton,
  SectionHeading,
} from '../../src/components/common/Controls';

export default function ProfileScreen() {
  const { user, ready, signOut } = useSession();
  const [signingOut, setSigningOut] = React.useState(false);
  const handleSignOut = () =>
    Alert.alert('Sign out of Arif?', 'You can sign back in at any time.', [
      { text: 'Stay signed in', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
            router.replace('/login');
          } catch (e) {
            Alert.alert(
              'Could not sign out',
              e instanceof Error ? e.message : 'Please try again.',
            );
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          {user?.name ? (
            <Text style={styles.initial}>
              {user.name.trim().slice(0, 1).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person-outline" size={25} color={colors.green} />
          )}
        </View>
        <Text style={styles.name}>
          {user?.name || (ready ? 'Welcome to Arif' : 'Loading your account…')}
        </Text>
        <Text style={styles.sub}>
          {user?.email || 'A simpler way to find your next car.'}
        </Text>
        {user ? (
          <View style={styles.role}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        ) : null}
        {user?.verificationStatus ? (
          <Text style={styles.verify}>
            {user.verificationStatus === 'verified'
              ? 'Account verified'
              : `Verification ${user.verificationStatus}`}
          </Text>
        ) : user?.verified ? (
          <Text style={styles.verify}>Account verified</Text>
        ) : null}
      </View>
      {user ? (
        <>
          <View style={styles.actionCard}>
            <SectionHeading
              title="Your marketplace"
              subtitle="Listings, inquiries and appointments."
            />
            <ActionButton
              label="Open vehicle listings"
              onPress={() => router.push('/(tabs)/sell')}
              icon={
                <Ionicons name="car-outline" size={18} color={colors.white} />
              }
            />
          </View>
          <View style={styles.rows}>
            <AccountRow
              icon="heart-outline"
              title="Saved cars"
              subtitle="Your private shortlist"
              onPress={() => router.push('/(tabs)/favorites')}
            />
            <AccountRow
              icon="chatbubble-ellipses-outline"
              title="My inquiries"
              subtitle="Questions sent and received"
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/sell',
                  params: { tab: 'Inquiries' },
                })
              }
            />
            <AccountRow
              icon="settings-outline"
              title="Profile & security"
              subtitle="Contact details and password"
              onPress={() => router.push('/settings')}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: signingOut }}
            disabled={signingOut}
            onPress={handleSignOut}
            style={styles.logout}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.red} />
            <Text style={styles.logoutText}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.signIn}>
          <Text style={styles.signInTitle}>Sign in to make it yours</Text>
          <Text style={styles.sub}>
            Save vehicles, manage your listings and keep track of buyer
            interest.
          </Text>
          <ActionButton
            label="Sign in or create account"
            onPress={() => router.push('/login')}
            style={{ marginTop: 15 }}
          />
        </View>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>ARIF CAR SELL</Text>
        <Text style={styles.footerCopy}>
          Your marketplace, built around trust.
        </Text>
        <Text style={styles.footerCopy}>
          Password reset and account deletion are not supported by the current
          API.
        </Text>
      </View>
    </ScrollView>
  );
}
function AccountRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={19} color={colors.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingBottom: 105 },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  profile: {
    alignItems: 'center',
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.large,
    marginTop: 16,
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    marginBottom: 12,
  },
  initial: { color: colors.green, fontSize: 27, fontWeight: '900' },
  name: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  sub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },
  role: {
    backgroundColor: colors.mint,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  roleText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  verify: {
    marginTop: 8,
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    padding: 15,
    marginTop: 16,
  },
  rows: {
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    paddingHorizontal: 13,
    marginTop: 12,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  rowSub: { color: colors.muted, fontSize: 10, marginTop: 3 },
  logout: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5B2930',
  },
  logoutText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  signIn: {
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    padding: 18,
    marginTop: 16,
  },
  signInTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  footer: { alignItems: 'center', gap: 5, marginTop: 27 },
  footerBrand: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  footerCopy: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSession } from '../src/features/auth/SessionContext';
import { useVehicles } from '../src/features/vehicles/vehicle-queries';
import { AppLogo } from '../src/components/common/AppLogo';
import { useTheme } from '../src/theme/ThemeContext';
import { colors as defaultColors } from '../src/theme/tokens';

export default function RootIndex() {
  const { user, ready } = useSession();
  const { colors, isDark } = useTheme();
  const [minTimerDone, setMinTimerDone] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Prefetch home vehicles to update app content while showing the sync screen
  const vehiclesQuery = useVehicles({ limit: 12, sort: 'newest' });

  // Pulsing animation for the logo
  useEffect(() => {
    if (user) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [user, pulseAnim]);

  // Keep loading screen for at least 1100ms to allow smooth sync experience
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setMinTimerDone(true);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Once sync timer is done and data has loaded or settled, transition to main tabs
  useEffect(() => {
    if (user && minTimerDone && (!vehiclesQuery.isLoading || vehiclesQuery.isError)) {
      router.replace('/(tabs)');
    }
  }, [user, minTimerDone, vehiclesQuery.isLoading, vehiclesQuery.isError]);

  // Wait until session tokens are restored from secure storage
  if (!ready) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#111318' : '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={defaultColors.primary} />
      </View>
    );
  }

  // If not logged in, route to onboarding
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  // If user is already logged in, show the syncing / loading screen until content updates
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111318' : '#0B0D12' }]}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
        <AppLogo size="lg" inverted />
      </Animated.View>

      <View style={styles.syncCard}>
        <Text style={styles.greetingText}>
          Welcome back, {user.name ? user.name.split(' ')[0] : 'Member'}
        </Text>
        <Text style={styles.syncStatusText}>
          Updating showroom & live vehicle content...
        </Text>

        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color="#FF6A26" />
          <Text style={styles.progressSub}>Syncing latest listings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  syncCard: {
    alignItems: 'center',
    maxWidth: 320,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  syncStatusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressSub: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

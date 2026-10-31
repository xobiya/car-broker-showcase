import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeContext';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.helper, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={34} color={colors.muted} />
      <Text style={[styles.title, { color: colors.ink }]}>Couldn’t load data</Text>
      <Text style={[styles.helper, { color: colors.muted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.retry, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  helper: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retry: {
    borderRadius: radius.full,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

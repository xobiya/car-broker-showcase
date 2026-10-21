import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { PageTitle } from '../../src/components/common/PageTitle';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import { useSession } from '../../src/features/auth/SessionContext';
import { useSavedVehicles } from '../../src/features/vehicles/vehicle-queries';
import { colors, radius } from '../../src/theme/tokens';
export default function FavoritesScreen() {
  const { user } = useSession();
  const saved = useSavedVehicles(user?.id);
  const list = (saved.data ?? []).flatMap((item) =>
    item.vehicle ? [item.vehicle] : [],
  );
  const header = (
    <View>
      <PageTitle eyebrow="YOUR SHORTLIST" title="Saved cars" />
      <Text style={styles.sub}>
        {user
          ? 'Vehicles saved to your account.'
          : 'Keep the cars you love close.'}
      </Text>
    </View>
  );
  if (!user)
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          {header}
          <View style={styles.empty}>
            <View style={styles.icon}>
              <Ionicons name="heart-outline" size={25} color={colors.green} />
            </View>
            <Text style={styles.head}>Keep the good ones close</Text>
            <Text style={styles.copy}>
              Sign in to save vehicles and see them here on any device.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  if (saved.isLoading)
    return (
      <View style={styles.screen}>
        {header}
        <LoadingState label="Loading your saved cars…" />
      </View>
    );
  if (saved.error)
    return (
      <View style={styles.screen}>
        {header}
        <ErrorState
          message={saved.error.message}
          onRetry={() => void saved.refetch()}
        />
      </View>
    );
  return (
    <FlatList
      style={styles.screen}
      data={list}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VehicleCard
          vehicle={item}
          onPress={() => router.push(`/vehicles/${item.id}`)}
        />
      )}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.icon}>
            <Ionicons name="heart-outline" size={25} color={colors.green} />
          </View>
          <Text style={styles.head}>Your shortlist is waiting</Text>
          <Text style={styles.copy}>
            Save a vehicle you like and it will appear here.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.buttonText}>Browse cars</Text>
          </Pressable>
        </View>
      }
      refreshing={saved.isRefetching}
      onRefresh={() => void saved.refetch()}
      showsVerticalScrollIndicator={false}
    />
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingBottom: 105 },
  gridRow: { gap: 10, alignItems: 'stretch' },
  sub: { color: colors.muted, fontSize: 12, marginTop: -9, marginBottom: 18 },
  empty: {
    backgroundColor: colors.navySoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.large,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 31,
    marginTop: 22,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  head: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  copy: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 260,
  },
  button: {
    height: 46,
    marginTop: 18,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
});

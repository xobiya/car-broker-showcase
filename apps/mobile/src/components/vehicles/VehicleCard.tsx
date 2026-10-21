import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../features/auth/SessionContext';
import {
  useSavedVehicles,
  useToggleSavedVehicle,
} from '../../features/vehicles/vehicle-queries';
import type { Vehicle } from '../../types/models';
import { colors, radius } from '../../theme/tokens';
import { formatPrice } from '../../utils/currency';
type VehicleCardProps = { vehicle: Vehicle; onPress: () => void };
export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { user } = useSession();
  const savedVehicles = useSavedVehicles(user?.id);
  const toggleSaved = useToggleSavedVehicle(user?.id);
  const imageUri = vehicle.imageUrl || vehicle.gallery?.[0];
  const isSaved = (savedVehicles.data ?? []).some(
    (item) => item.vehicleId === vehicle.id,
  );
  async function handleSave() {
    if (!user)
      return router.push({
        pathname: '/login',
        params: { returnTo: `/vehicles/${vehicle.id}` },
      });
    try {
      await toggleSaved.mutateAsync({ vehicleId: vehicle.id, saved: isSaved });
    } catch (e) {
      Alert.alert(
        'Could not update saved cars',
        e instanceof Error ? e.message : 'Please try again.',
      );
    }
  }
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
          onPress={onPress}
          style={styles.imagePressable}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="car-sport-outline"
                size={42}
                color={colors.green}
              />
            </View>
          )}
        </Pressable>
        {vehicle.condition ? (
          <View style={styles.condition}>
            <Text style={styles.conditionText}>{vehicle.condition}</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? 'Remove from saved cars' : 'Save this car'
          }
          accessibilityState={{
            selected: isSaved,
            disabled: toggleSaved.isPending,
          }}
          disabled={toggleSaved.isPending}
          onPress={handleSave}
          style={styles.heart}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={19}
            color={isSaved ? colors.red : colors.ink}
          />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.body}
      >
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.year}>{vehicle.year}</Text>
        </View>
        <Text numberOfLines={1} style={styles.meta}>
          {(vehicle.mileage || 0).toLocaleString()} km
          {vehicle.transmission ? ` · ${vehicle.transmission}` : ''}
          {vehicle.fuelType ? ` · ${vehicle.fuelType}` : ''}
        </Text>
        <View style={styles.bottomRow}>
          <Text numberOfLines={1} style={styles.price}>
            {formatPrice(vehicle.price)}
          </Text>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text numberOfLines={1} style={styles.meta}>
              {vehicle.location || 'Location not provided'}
            </Text>
          </View>
        </View>
        {vehicle.sellerName ? (
          <Text style={styles.seller}>Seller · {vehicle.sellerName}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.navySoft,
    borderColor: colors.line,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrap: { backgroundColor: colors.mint, height: 132 },
  imagePressable: { flex: 1 },
  image: { height: '100%', resizeMode: 'cover', width: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  condition: {
    position: 'absolute',
    top: 11,
    left: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  conditionText: { color: '#172033', fontSize: 9, fontWeight: '800' },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 10 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: '800' },
  year: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 9,
  },
  price: { flex: 1, color: colors.green, fontSize: 12, fontWeight: '900' },
  location: {
    maxWidth: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seller: { color: colors.muted, fontSize: 9, marginTop: 7 },
});

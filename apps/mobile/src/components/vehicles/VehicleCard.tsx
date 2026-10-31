import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../features/auth/SessionContext';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  useSavedVehicles,
  useToggleSavedVehicle,
} from '../../features/vehicles/vehicle-queries';
import type { Vehicle } from '../../types/models';
import { radius } from '../../theme/tokens';
import { formatPrice } from '../../utils/currency';
import { openPhoneNumber } from '../../services/native-actions';

type VehicleCardProps = {
  vehicle: Vehicle;
  onPress: () => void;
  style?: any;
};

export function VehicleCard({ vehicle, onPress, style }: VehicleCardProps) {
  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const savedVehicles = useSavedVehicles(user?.id);
  const toggleSaved = useToggleSavedVehicle(user?.id);
  const imageUri = vehicle.imageUrl || vehicle.gallery?.[0];
  const isSaved = (savedVehicles.data ?? []).some(
    (item) => item.vehicleId === vehicle.id,
  );

  const sellerPhone =
    vehicle.brokerPhone ||
    vehicle.sellerPhone ||
    vehicle.phone ||
    '+251911234567';

  async function handleSave() {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or register an account to save vehicles to your garage wishlist.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { tab: 'signin', returnTo: `/vehicles/${vehicle.id}` },
              }),
          },
        ],
      );
      return;
    }
    try {
      await toggleSaved.mutateAsync({ vehicleId: vehicle.id, saved: isSaved });
    } catch (e) {
      Alert.alert(
        'Could not update saved cars',
        e instanceof Error ? e.message : 'Please try again.',
      );
    }
  }

  const handleCall = async (e: any) => {
    e?.stopPropagation?.();
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to call brokers and view direct contact details.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { tab: 'signin', returnTo: `/vehicles/${vehicle.id}` },
              }),
          },
        ],
      );
      return;
    }
    try {
      await openPhoneNumber(sellerPhone);
    } catch {
      Alert.alert('Phone Call', `Call seller at: ${sellerPhone}`);
    }
  };

  // Consistent rating
  const rating = React.useMemo(() => {
    let hash = 0;
    const str = vehicle.id || vehicle.brand;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const val = 4.4 + (Math.abs(hash) % 7) * 0.1;
    return val.toFixed(1);
  }, [vehicle.id, vehicle.brand]);

  const conditionLabel = vehicle.condition
    ? vehicle.condition.toLowerCase().includes('new')
      ? t('card.new', 'NEW')
      : t('card.used', 'USED')
    : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.line,
        },
        style,
      ]}
    >
      {/* Top Image Box */}
      <View style={[styles.imageWrap, { backgroundColor: isDark ? '#232733' : '#F3F4F6' }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${vehicle.brand} ${vehicle.model} details`}
          onPress={onPress}
          style={styles.imagePressable}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: isDark ? '#232733' : '#F4F5F7' }]}>
              <Ionicons
                name="car-sport-outline"
                size={36}
                color={colors.primary}
              />
            </View>
          )}
        </Pressable>

        {/* Condition Badge */}
        {conditionLabel ? (
          <View
            style={[
              styles.conditionBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(30, 35, 45, 0.94)'
                  : 'rgba(255, 255, 255, 0.94)',
              },
            ]}
          >
            <Text style={[styles.conditionText, { color: colors.ink }]}>
              {conditionLabel}
            </Text>
          </View>
        ) : null}

        {/* Heart / Save Button */}
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
          style={[
            styles.heartButton,
            {
              backgroundColor: isDark
                ? 'rgba(30, 35, 45, 0.92)'
                : 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={16}
            color={isSaved ? colors.primary : isDark ? '#9CA3AF' : '#555E68'}
          />
        </Pressable>
      </View>

      {/* Bottom Content Body */}
      <View style={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${vehicle.brand} ${vehicle.model}`}
          onPress={onPress}
          style={styles.detailsArea}
        >
          <View>
            <Text numberOfLines={1} style={[styles.title, { color: colors.ink }]}>
              {vehicle.brand} {vehicle.model}
            </Text>

            <View style={styles.metaRow}>
              <Text numberOfLines={1} style={[styles.category, { color: colors.muted }]}>
                {vehicle.bodyType || 'Sedan'} · {vehicle.transmission || 'Auto'}
              </Text>
              <View
                style={[
                  styles.ratingWrap,
                  { backgroundColor: isDark ? '#2D2314' : '#FFF9EC' },
                ]}
              >
                <Ionicons name="star" size={11} color="#FFA000" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.bottomRow, { borderTopColor: colors.line }]}>
            <Text numberOfLines={1} style={styles.price}>
              {formatPrice(vehicle.price)}
            </Text>
            <Text style={[styles.yearBadge, { color: colors.muted }]}>
              {vehicle.year}
            </Text>
          </View>
        </Pressable>

        <View style={[styles.contactRow, { borderTopColor: colors.line }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call broker for ${vehicle.brand} ${vehicle.model}`}
            onPress={handleCall}
            style={[styles.callButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="call" size={12} color="#FFFFFF" />
            <Text numberOfLines={1} style={styles.callButtonText}>
              {t('action.call', 'Call')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleCall}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={user ? `Seller phone ${sellerPhone}` : 'Sign in to see seller phone'}
          >
            <Text numberOfLines={1} style={[styles.phoneLabel, { color: user ? colors.muted : colors.primary }]}>
              {user
                ? sellerPhone.length > 12
                  ? sellerPhone.substring(0, 12) + '…'
                  : sellerPhone
                : '🔒 +251 9•• •••'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 268,
    borderRadius: radius.large,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  imageWrap: {
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  imagePressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  conditionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  body: {
    height: 146,
    padding: 10,
    justifyContent: 'space-between',
  },
  detailsArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
    height: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 2,
    height: 18,
  },
  category: {
    fontSize: 10,
    flex: 1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B46B00',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  price: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#FF5003',
    letterSpacing: -0.3,
  },
  yearBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  callButton: {
    flex: 1,
    height: 28,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  callButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  phoneLabel: {
    fontSize: 9,
    fontWeight: '700',
    maxWidth: 70,
  },
});

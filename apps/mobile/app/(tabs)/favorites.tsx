import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { FavoritesListSkeleton } from '../../src/components/common/Skeleton';
import { useSession } from '../../src/features/auth/SessionContext';
import {
  useSavedVehicles,
  useToggleSavedVehicle,
} from '../../src/features/vehicles/vehicle-queries';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';

export default function FavoritesScreen() {
  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const saved = useSavedVehicles(user?.id);
  const toggleSaved = useToggleSavedVehicle(user?.id);
  const [discountCode, setDiscountCode] = useState('');

  const list = (saved.data ?? []).flatMap((item) =>
    item.vehicle ? [item.vehicle] : [],
  );

  const subtotal = list.reduce((sum, item) => sum + (item.price || 0), 0);
  const vat = list.length > 0 ? 350 : 0;
  const deliveryFee = list.length > 0 ? 150 : 0;
  const total = subtotal + vat + deliveryFee;

  const handleRemove = async (vehicleId: string) => {
    try {
      await toggleSaved.mutateAsync({ vehicleId, saved: true });
    } catch (e) {
      Alert.alert(
        'Could not update',
        e instanceof Error ? e.message : 'Please try again.',
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Top Header */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: colors.white, borderBottomColor: colors.line },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.line }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <Text style={[styles.navTitle, { color: colors.ink }]}>
          {t('nav.saved', 'Saved Vehicles')}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <QuickHeaderSwitcher />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/search')}
            style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.line }]}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      {!user ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Keep the good ones close</Text>
          <Text style={styles.emptySub}>
            Sign in to save vehicles, compare quotes, and access your cart across devices.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/login')}
            style={styles.primaryPillButton}
          >
            <Text style={styles.primaryPillButtonText}>Sign In</Text>
          </Pressable>
        </View>
      ) : saved.isLoading ? (
        <FavoritesListSkeleton />
      ) : saved.error ? (
        <ErrorState
          message={saved.error.message}
          onRetry={() => void saved.refetch()}
        />
      ) : list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="cart-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Save vehicles you are considering and they will be ready for inspection and checkout here.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/search')}
            style={styles.primaryPillButton}
          >
            <Text style={styles.primaryPillButtonText}>Browse Cars</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* List of Cart Items */}
            <View style={styles.itemsList}>
              {list.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Pressable
                    onPress={() => router.push(`/vehicles/${item.id}`)}
                    style={styles.thumbnailWrap}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.thumbnail}
                      />
                    ) : (
                      <Ionicons
                        name="car-sport"
                        size={28}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>

                  <View style={styles.itemInfo}>
                    <Pressable
                      onPress={() => router.push(`/vehicles/${item.id}`)}
                    >
                      <Text numberOfLines={1} style={styles.itemTitle}>
                        {item.brand} {item.model}
                      </Text>
                    </Pressable>
                    <Text style={styles.itemCategory}>
                      {item.bodyType || 'SUV'} · {item.year}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>

                  {/* Quantity / Action Column */}
                  <View style={styles.actionCol}>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>1</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void handleRemove(item.id)}
                      style={styles.trashBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={colors.primary}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Price Summary Breakdown */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Inspection & VAT</Text>
                <Text style={styles.summaryValue}>{formatPrice(vat)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery / Broker Fee</Text>
                <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
            </View>

            {/* Discount Code */}
            <View style={styles.discountWrap}>
              <Text style={styles.discountTitle}>Discount Code (Optional)</Text>
              <TextInput
                value={discountCode}
                onChangeText={setDiscountCode}
                placeholder="Enter Code"
                placeholderTextColor="#9EA3AE"
                style={styles.discountInput}
              />
            </View>
          </ScrollView>

          {/* Sticky Bottom Action */}
          <View style={styles.bottomBar}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (list.length > 0) {
                  router.push({
                    pathname: '/checkout',
                    params: { id: list[0].id },
                  });
                }
              }}
              style={styles.checkoutButton}
            >
              <Text style={styles.checkoutButtonText}>
                Continue to Pay {formatPrice(total)}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: colors.white,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  itemsList: {
    gap: 12,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnailWrap: {
    width: 70,
    height: 70,
    borderRadius: radius.medium,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  trashBtn: {
    padding: 4,
  },
  summaryCard: {
    padding: 16,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  discountWrap: {
    marginBottom: 16,
  },
  discountTitle: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 8,
  },
  discountInput: {
    height: 50,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    fontSize: 13,
    color: colors.ink,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButton: {
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  primaryPillButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPillButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVehicle } from '../src/features/vehicles/vehicle-queries';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { colors, radius } from '../src/theme/tokens';
import { formatPrice } from '../src/utils/currency';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleQuery = useVehicle(id);
  const v = vehicleQuery.data;

  const [address, setAddress] = useState('Bole Medhanialem, Addis Ababa, Ethiopia');
  const [editingAddress, setEditingAddress] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Modals state
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'telebirr' | 'cbe' | 'card' | 'escrow'>('telebirr');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const basePrice = v?.price || 4000;
  const vat = 350;
  const deliveryFee = 150;
  const discountAmount = discountApplied ? 250 : 0;
  const total = Math.max(0, basePrice + vat + deliveryFee - discountAmount);

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'ARIF50' || discountCode.trim().toUpperCase() === 'SAVE') {
      setDiscountApplied(true);
      Alert.alert('Discount Applied', 'You saved 250 on fees!');
    } else if (discountCode.trim()) {
      Alert.alert('Invalid Code', 'Try using promo code: ARIF50');
    }
  };

  const handleConfirmPayment = () => {
    setPaymentSheetOpen(false);
    setTimeout(() => {
      setSuccessModalOpen(true);
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Top Header */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: Math.max(insets.top + 6, 44),
            backgroundColor: colors.white,
            borderBottomColor: colors.line,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.line }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <Text style={[styles.navTitle, { color: colors.ink }]}>Checkout</Text>

        <QuickHeaderSwitcher />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}
      >
        {/* Selected Vehicle Card */}
        <View style={styles.productCard}>
          <View style={styles.productImageWrap}>
            {v?.imageUrl ? (
              <Image source={{ uri: v.imageUrl }} style={styles.productImage} />
            ) : (
              <Ionicons name="car-sport" size={40} color={colors.primary} />
            )}
          </View>

          <View style={styles.productDetails}>
            <Text style={styles.productName}>
              {v ? `${v.brand} ${v.model}` : 'Abracadabra Shirt'}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.productCategory}>
                {v ? `${v.bodyType || 'SUV'} · ${v.year}` : 'Unisex Wear'}
              </Text>
              <Text style={styles.dotSeparator}>|</Text>
              <Ionicons name="star" size={12} color="#FFA000" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
        </View>

        {/* Delivery / Viewing Location Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Delivery / Viewing Address</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditingAddress(!editingAddress)}
              style={styles.editIconBtn}
            >
              <Ionicons name="pencil-outline" size={17} color={colors.ink} />
            </Pressable>
          </View>

          {editingAddress ? (
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter delivery or inspection address"
              style={styles.addressInput}
              autoFocus
              onBlur={() => setEditingAddress(false)}
            />
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>

        {/* Pricing Breakdown Card */}
        <View style={styles.sectionCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceVal}>{formatPrice(basePrice)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Inspection & VAT</Text>
            <Text style={styles.priceVal}>{formatPrice(vat)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery / Broker Fee</Text>
            <Text style={styles.priceVal}>{formatPrice(deliveryFee)}</Text>
          </View>

          {discountApplied ? (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.primary }]}>Discount</Text>
              <Text style={[styles.priceVal, { color: colors.primary }]}>
                -{formatPrice(discountAmount)}
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Discount Code */}
        <View style={styles.discountSection}>
          <Text style={styles.discountLabel}>Discount Code (Optional)</Text>
          <View style={styles.discountInputRow}>
            <TextInput
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholder="Enter Code (e.g. ARIF50)"
              placeholderTextColor="#9EA3AE"
              style={styles.discountInput}
              autoCapitalize="characters"
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleApplyDiscount}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPaymentSheetOpen(true)}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            Continue to Pay {formatPrice(total)}
          </Text>
        </Pressable>
      </View>

      {/* Payment Methods Sheet */}
      <Modal
        visible={paymentSheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentSheetOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPaymentSheetOpen(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Payment Methods</Text>

            {/* Methods */}
            {[
              { id: 'telebirr', name: 'Telebirr', subtitle: 'Instant Mobile Wallet', icon: 'wallet-outline' },
              { id: 'cbe', name: 'CBE Birr', subtitle: 'Commercial Bank of Ethiopia', icon: 'card-outline' },
              { id: 'escrow', name: 'Broker Escrow Deposit', subtitle: '100% Secure Handover', icon: 'shield-checkmark-outline' },
              { id: 'card', name: 'Credit / Debit Card', subtitle: 'Visa · Mastercard ending 4821', icon: 'card' },
            ].map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedMethod(method.id as any)}
                  style={[
                    styles.methodOption,
                    isSelected && styles.methodOptionActive,
                  ]}
                >
                  <View style={styles.methodIconWrap}>
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={isSelected ? colors.primary : colors.ink}
                    />
                  </View>
                  <View style={styles.methodTextWrap}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodSub}>{method.subtitle}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.primary : '#D1D5DB'}
                  />
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              onPress={handleConfirmPayment}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                Confirm & Pay {formatPrice(total)}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Order Confirmed Success Modal */}
      <Modal
        visible={successModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessModalOpen(false)}
      >
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.checkCircleWrap}>
              <Ionicons name="checkmark" size={38} color={colors.white} />
            </View>

            <Text style={styles.successTitle}>Your Order is on its way to you</Text>
            <Text style={styles.successSubtitle}>
              Your booking and vehicle inspection request has been placed successfully. A certified broker will coordinate your handover.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSuccessModalOpen(false);
                router.push('/track');
              }}
              style={styles.trackNowButton}
            >
              <Text style={styles.trackNowText}>Track Now</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSuccessModalOpen(false);
                router.replace('/(tabs)');
              }}
              style={styles.goHomeButton}
            >
              <Text style={styles.goHomeText}>Go Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrap: {
    width: 74,
    height: 74,
    borderRadius: radius.medium,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productCategory: {
    fontSize: 12,
    color: colors.muted,
  },
  dotSeparator: {
    color: '#D1D5DB',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  sectionCard: {
    padding: 16,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  editIconBtn: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 20,
  },
  addressInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.small,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.ink,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  priceVal: {
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
  totalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  discountSection: {
    marginTop: 6,
  },
  discountLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 8,
  },
  discountInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  discountInput: {
    flex: 1,
    height: 50,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    fontSize: 13,
    color: colors.ink,
  },
  applyButton: {
    height: 50,
    paddingHorizontal: 22,
    backgroundColor: colors.ink,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
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
  continueButton: {
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
  continueButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 18,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.medium,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 10,
    gap: 12,
  },
  methodOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextWrap: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  methodSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  checkCircleWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  trackNowButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  trackNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  goHomeButton: {
    paddingVertical: 10,
  },
  goHomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
});

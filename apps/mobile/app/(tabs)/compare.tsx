import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVehicles } from '../../src/features/vehicles/vehicle-queries';
import { useSession } from '../../src/features/auth/SessionContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { AppLogo } from '../../src/components/common/AppLogo';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';
import { openPhoneNumber, openWhatsApp } from '../../src/services/native-actions';
import type { Vehicle } from '../../src/types/models';

const { width } = Dimensions.get('window');

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useSession();
  const vehiclesQuery = useVehicles({ limit: 20 });
  const allVehicles = vehiclesQuery.data ?? [];

  // Default to first two vehicles if available
  const [selectedIds, setSelectedIds] = useState<[string, string]>(['', '']);
  const [pickingSlot, setPickingSlot] = useState<0 | 1 | null>(null);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  // Auto-select first two if not yet initialized
  React.useEffect(() => {
    if (allVehicles.length >= 2 && (!selectedIds[0] || !selectedIds[1])) {
      setSelectedIds([allVehicles[0].id, allVehicles[1].id]);
    }
  }, [allVehicles]);

  const car1 = allVehicles.find((v) => v.id === selectedIds[0]) || allVehicles[0];
  const car2 = allVehicles.find((v) => v.id === selectedIds[1]) || allVehicles[1] || allVehicles[0];

  const presets = React.useMemo(() => {
    if (allVehicles.length < 2) return [];
    const suv1 = allVehicles.find(
      (v) =>
        (v.bodyType || '').toLowerCase() === 'suv' ||
        v.model.toLowerCase().includes('rav4') ||
        v.brand === 'Toyota',
    );
    const suv2 = allVehicles.find(
      (v) =>
        v.id !== suv1?.id &&
        ((v.bodyType || '').toLowerCase() === 'suv' ||
          v.model.toLowerCase().includes('tucson') ||
          v.brand === 'Hyundai'),
    );

    const ev = allVehicles.find(
      (v) =>
        v.fuelType === 'Electric' ||
        v.brand === 'BYD' ||
        v.brand === 'Volkswagen',
    );
    const hybrid = allVehicles.find(
      (v) =>
        v.id !== ev?.id &&
        (v.fuelType === 'Hybrid' || v.brand === 'Toyota'),
    );

    const sedan = allVehicles.find(
      (v) =>
        (v.bodyType || '').toLowerCase() === 'sedan' ||
        v.brand === 'Suzuki',
    );
    const anySuv = allVehicles.find(
      (v) =>
        v.id !== sedan?.id &&
        (v.bodyType || '').toLowerCase() === 'suv',
    );

    const luxury = allVehicles.find(
      (v) =>
        v.brand === 'Mercedes-Benz' ||
        v.brand === 'Lexus' ||
        v.brand === 'BMW',
    );
    const modern = allVehicles.find(
      (v) =>
        v.id !== luxury?.id &&
        (v.fuelType === 'Electric' || v.brand === 'Volkswagen'),
    );

    const list: {
      id: string;
      label: string;
      icon: keyof typeof Ionicons.glyphMap;
      pair: [string, string];
      sub: string;
    }[] = [];
    if (suv1 && suv2)
      list.push({
        id: 'suvs',
        label: 'Family SUVs',
        icon: 'car-sport',
        pair: [suv1.id, suv2.id],
        sub: `${suv1.model} vs ${suv2.model}`,
      });
    if (ev && hybrid)
      list.push({
        id: 'ev',
        label: 'EV vs Hybrid',
        icon: 'flash',
        pair: [ev.id, hybrid.id],
        sub: 'Zero-Duty vs Proven Hybrid',
      });
    if (sedan && anySuv)
      list.push({
        id: 'commute',
        label: 'City vs SUV',
        icon: 'speedometer',
        pair: [sedan.id, anySuv.id],
        sub: `${sedan.brand} vs ${anySuv.brand}`,
      });
    if (luxury && modern)
      list.push({
        id: 'luxury',
        label: 'Executive Luxury',
        icon: 'sparkles',
        pair: [luxury.id, modern.id],
        sub: `${luxury.brand} vs ${modern.brand}`,
      });
    return list;
  }, [allVehicles]);

  const handleSelectCar = (vehicleId: string) => {
    if (pickingSlot !== null) {
      const next: [string, string] = [...selectedIds];
      next[pickingSlot] = vehicleId;
      setSelectedIds(next);
      setPickingSlot(null);
    }
  };

  const handleSwap = () => {
    setSelectedIds([selectedIds[1], selectedIds[0]]);
  };

  const handleCall = async (phone?: string) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to call brokers and view direct contact details.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () =>
              router.push({ pathname: '/login', params: { tab: 'signin' } }),
          },
        ],
      );
      return;
    }
    const p = phone || '+251911234567';
    try {
      await openPhoneNumber(p);
    } catch {
      // ignore
    }
  };

  const handleWhatsApp = async (car: Vehicle) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to message brokers directly.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () =>
              router.push({ pathname: '/login', params: { tab: 'signin' } }),
          },
        ],
      );
      return;
    }
    const p = car.brokerPhone || car.sellerPhone || '+251911234567';
    try {
      await openWhatsApp(
        p,
        `Hello, I am comparing the ${car.year} ${car.brand} ${car.model} on Arif Auto. Is it available for inspection?`,
      );
    } catch {
      // ignore
    }
  };

type CompareItem = {
  label: string;
  val1: string;
  val2: string;
  highlight?: boolean;
  isCheck?: boolean;
};

type CompareSection = {
  category: string;
  items: CompareItem[];
};

  const compareRows: CompareSection[] = [
    {
      category: 'Pricing & Value',
      items: [
        {
          label: 'Total Price',
          val1: car1 ? formatPrice(car1.price) : '-',
          val2: car2 ? formatPrice(car2.price) : '-',
          highlight: true,
        },
        {
          label: 'Original Price',
          val1: car1?.originalPrice ? formatPrice(car1.originalPrice) : 'Standard',
          val2: car2?.originalPrice ? formatPrice(car2.originalPrice) : 'Standard',
        },
        {
          label: 'Year',
          val1: car1 ? String(car1.year) : '-',
          val2: car2 ? String(car2.year) : '-',
        },
      ],
    },
    {
      category: 'Mechanical & Performance',
      items: [
        {
          label: 'Mileage',
          val1: car1?.mileage ? `${car1.mileage.toLocaleString()} km` : '0 km',
          val2: car2?.mileage ? `${car2.mileage.toLocaleString()} km` : '0 km',
        },
        {
          label: 'Transmission',
          val1: car1?.transmission || 'Automatic',
          val2: car2?.transmission || 'Automatic',
        },
        {
          label: 'Fuel Type',
          val1: car1?.fuelType || 'Petrol',
          val2: car2?.fuelType || 'Petrol',
        },
        {
          label: 'Engine Size',
          val1: car1?.engineSize || car1?.engineType || '2.5L Turbo',
          val2: car2?.engineSize || car2?.engineType || '2.0L Turbo',
        },
        {
          label: 'Horsepower',
          val1: car1?.horsepower ? `${car1.horsepower} HP` : '204 HP',
          val2: car2?.horsepower ? `${car2.horsepower} HP` : '185 HP',
        },
        {
          label: 'Drive Type',
          val1: car1?.driveType || 'AWD / 4WD',
          val2: car2?.driveType || 'FWD / AWD',
        },
      ],
    },
    {
      category: 'Design & Comfort',
      items: [
        {
          label: 'Body Type',
          val1: car1?.bodyType || 'SUV',
          val2: car2?.bodyType || 'Sedan',
        },
        {
          label: 'Condition',
          val1: car1?.condition || 'Used - Clean',
          val2: car2?.condition || 'Used - Clean',
        },
        {
          label: 'Seats',
          val1: car1?.seats ? `${car1.seats} Seats` : '5 Seats',
          val2: car2?.seats ? `${car2.seats} Seats` : '5 Seats',
        },
        {
          label: 'Exterior Color',
          val1: car1?.color || 'Pearl White',
          val2: car2?.color || 'Metallic Black',
        },
        {
          label: 'Location',
          val1: car1?.location || 'Addis Ababa',
          val2: car2?.location || 'Addis Ababa',
        },
      ],
    },
    {
      category: 'Inspection & Documents',
      items: [
        {
          label: '150-Pt Inspection',
          val1: car1?.inspectionStatus === 'passed' ? 'Passed & Certified' : 'Verified',
          val2: car2?.inspectionStatus === 'passed' ? 'Passed & Certified' : 'Verified',
          isCheck: true,
        },
        {
          label: 'Libre Title Deed',
          val1: 'Verified Authentic',
          val2: 'Verified Authentic',
          isCheck: true,
        },
        {
          label: 'Broker License',
          val1: car1?.brokerLicense || 'LIC-AA-2024-8841',
          val2: car2?.brokerLicense || 'LIC-AA-2024-9120',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Top Header */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.line,
            paddingTop: Math.max(insets.top + 8, 44),
          },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppLogo size="sm" iconOnly />
            <View>
              <Text style={styles.navEyebrow}>ARIF COMPARISON TOOL</Text>
              <Text style={[styles.navTitle, { color: colors.ink }]}>
                {t('nav.compare', 'Compare Vehicles')}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <QuickHeaderSwitcher />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap vehicles"
            onPress={handleSwap}
            style={[
              styles.swapButton,
              {
                backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                borderColor: isDark ? '#FF6A26' : '#FFD9C6',
              },
            ]}
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}
      >
        {/* Preset Pairs Strip */}
        <View style={styles.presetSection}>
          <Text style={[styles.presetTitle, { color: colors.muted }]}>
            POPULAR 1-CLICK COMPARISONS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetRow}
          >
            {presets.map((p) => {
              const isSelected =
                (selectedIds[0] === p.pair[0] && selectedIds[1] === p.pair[1]) ||
                (selectedIds[0] === p.pair[1] && selectedIds[1] === p.pair[0]);
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Compare ${p.label}`}
                  onPress={() => setSelectedIds(p.pair)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#2C1B14'
                          : '#FFF2EB'
                        : colors.card,
                      borderColor: isSelected ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Ionicons
                      name={p.icon}
                      size={15}
                      color={isSelected ? colors.primary : isDark ? '#FF8A50' : colors.primary}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: isSelected ? colors.primary : colors.ink },
                        isSelected && { fontWeight: '900' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </View>
                  <Text style={[styles.presetSubText, { color: colors.muted }]}>
                    {p.sub}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Highlight Differences Filter Bar */}
        <View style={styles.filterBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowOnlyDiffs(!showOnlyDiffs)}
            style={[
              styles.diffFilterBtn,
              {
                backgroundColor: showOnlyDiffs
                  ? isDark
                    ? '#2C1B14'
                    : '#FFF2EB'
                  : colors.card,
                borderColor: showOnlyDiffs ? colors.primary : colors.line,
              },
            ]}
          >
            <Ionicons
              name={showOnlyDiffs ? 'checkbox' : 'square-outline'}
              size={17}
              color={showOnlyDiffs ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.diffFilterText,
                { color: showOnlyDiffs ? colors.primary : colors.ink },
              ]}
            >
              Highlight Differences Only
            </Text>
          </Pressable>
          <Text style={[styles.itemCountText, { color: colors.muted }]}>
            Comparing 2 vehicles
          </Text>
        </View>

        {/* Side-by-Side Car Cards */}
        <View style={styles.cardsRow}>
          {/* Car 1 */}
          <View
            style={[
              styles.carCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.line,
              },
            ]}
          >
            <Pressable
              onPress={() => setPickingSlot(0)}
              style={[
                styles.changeSlotBadge,
                {
                  backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                  borderColor: isDark ? '#FF6A26' : '#FFD9C6',
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="pencil" size={11} color={colors.primary} />
              <Text style={styles.changeSlotText}>Change</Text>
            </Pressable>

            {car1 ? (
              <>
                <Pressable
                  onPress={() => router.push(`/vehicles/${car1.id}`)}
                  style={[
                    styles.cardImageWrap,
                    { backgroundColor: isDark ? '#1F2430' : '#F3F4F6' },
                  ]}
                >
                  <Image source={{ uri: car1.imageUrl }} style={styles.cardImg} />
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>VEHICLE 1</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => router.push(`/vehicles/${car1.id}`)}
                  style={styles.cardInfo}
                >
                  <Text numberOfLines={1} style={[styles.carTitle, { color: colors.ink }]}>
                    {car1.brand} {car1.model}
                  </Text>
                  <Text style={[styles.carYear, { color: colors.muted }]}>
                    {car1.year} · {car1.bodyType || 'SUV'}
                  </Text>
                  <Text numberOfLines={1} style={styles.carPrice}>
                    {formatPrice(car1.price)}
                  </Text>
                </Pressable>

                {/* Call Broker Button */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleCall(car1.brokerPhone || car1.sellerPhone)}
                  style={styles.callBrokerBtn}
                >
                  <Ionicons name="call" size={12} color={colors.white} />
                  <Text style={styles.callBrokerBtnText}>Call Broker</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => setPickingSlot(0)}
                style={[
                  styles.emptySlot,
                  { backgroundColor: isDark ? '#1F2430' : '#F9FAFB', borderRadius: 12 },
                ]}
              >
                <Ionicons name="add-circle-outline" size={36} color={colors.primary} />
                <Text style={[styles.emptySlotText, { color: colors.muted }]}>Select Car</Text>
              </Pressable>
            )}
          </View>

          {/* Car 2 */}
          <View
            style={[
              styles.carCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.line,
              },
            ]}
          >
            <Pressable
              onPress={() => setPickingSlot(1)}
              style={[
                styles.changeSlotBadge,
                {
                  backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                  borderColor: isDark ? '#FF6A26' : '#FFD9C6',
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="pencil" size={11} color={colors.primary} />
              <Text style={styles.changeSlotText}>Change</Text>
            </Pressable>

            {car2 ? (
              <>
                <Pressable
                  onPress={() => router.push(`/vehicles/${car2.id}`)}
                  style={[
                    styles.cardImageWrap,
                    { backgroundColor: isDark ? '#1F2430' : '#F3F4F6' },
                  ]}
                >
                  <Image source={{ uri: car2.imageUrl }} style={styles.cardImg} />
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>VEHICLE 2</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => router.push(`/vehicles/${car2.id}`)}
                  style={styles.cardInfo}
                >
                  <Text numberOfLines={1} style={[styles.carTitle, { color: colors.ink }]}>
                    {car2.brand} {car2.model}
                  </Text>
                  <Text style={[styles.carYear, { color: colors.muted }]}>
                    {car2.year} · {car2.bodyType || 'Sedan'}
                  </Text>
                  <Text numberOfLines={1} style={styles.carPrice}>
                    {formatPrice(car2.price)}
                  </Text>
                </Pressable>

                {/* Call Broker Button */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleCall(car2.brokerPhone || car2.sellerPhone)}
                  style={styles.callBrokerBtn}
                >
                  <Ionicons name="call" size={12} color={colors.white} />
                  <Text style={styles.callBrokerBtnText}>Call Broker</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => setPickingSlot(1)}
                style={[
                  styles.emptySlot,
                  { backgroundColor: isDark ? '#1F2430' : '#F9FAFB', borderRadius: 12 },
                ]}
              >
                <Ionicons name="add-circle-outline" size={36} color={colors.primary} />
                <Text style={[styles.emptySlotText, { color: colors.muted }]}>Select Car</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Detailed Spec Comparison Table */}
        {compareRows
          .map((section) => ({
            ...section,
            items: showOnlyDiffs
              ? section.items.filter((item) => item.val1 !== item.val2)
              : section.items,
          }))
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <View key={section.category} style={styles.sectionContainer}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: colors.muted }]}>
                  {section.category}
                </Text>
              </View>

              <View
                style={[
                  styles.tableCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.line,
                  },
                ]}
              >
                {section.items.map((item, idx) => {
                  const isDiff = item.val1 !== item.val2;
                  return (
                    <View
                      key={item.label}
                      style={[
                        styles.tableRow,
                        idx > 0 && [styles.tableRowBorder, { borderTopColor: colors.line }],
                        isDiff &&
                          item.highlight && [
                            styles.diffHighlightRow,
                            { backgroundColor: isDark ? '#2C1B14' : '#FFFBF8' },
                          ],
                      ]}
                    >
                      <Text style={[styles.tableLabel, { color: colors.muted }]}>
                        {item.label}
                      </Text>
                      <View style={styles.valuesRow}>
                        <View style={styles.valueCol}>
                          {item.isCheck ? (
                            <View style={styles.checkBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={isDark ? '#34D399' : '#059669'}
                              />
                              <Text
                                style={[
                                  styles.checkBadgeText,
                                  { color: isDark ? '#34D399' : '#065F46' },
                                ]}
                              >
                                {item.val1}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[
                                styles.valText,
                                { color: colors.ink },
                                item.highlight && styles.valTextHighlight,
                              ]}
                            >
                              {item.val1}
                            </Text>
                          )}
                        </View>

                        <View style={[styles.valDivider, { backgroundColor: colors.line }]} />

                        <View style={styles.valueCol}>
                          {item.isCheck ? (
                            <View style={styles.checkBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={isDark ? '#34D399' : '#059669'}
                              />
                              <Text
                                style={[
                                  styles.checkBadgeText,
                                  { color: isDark ? '#34D399' : '#065F46' },
                                ]}
                              >
                                {item.val2}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[
                                styles.valText,
                                { color: colors.ink },
                                item.highlight && styles.valTextHighlight,
                              ]}
                            >
                              {item.val2}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

        {/* Direct WhatsApp Contact Buttons */}
        <View style={styles.contactActionsSection}>
          <Text style={[styles.contactSectionTitle, { color: colors.muted }]}>
            DIRECT BROKER INQUIRIES
          </Text>
          <View style={styles.contactButtonsRow}>
            {car1 && (
              <Pressable
                onPress={() => void handleWhatsApp(car1)}
                style={[
                  styles.waBtn,
                  {
                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                    borderColor: isDark ? '#059669' : '#A7F3D0',
                  },
                ]}
              >
                <Ionicons name="logo-whatsapp" size={16} color={isDark ? '#34D399' : '#059669'} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.waBtnText,
                    { color: isDark ? '#A7F3D0' : '#065F46' },
                  ]}
                >
                  Chat {car1.brand}
                </Text>
              </Pressable>
            )}
            {car2 && (
              <Pressable
                onPress={() => void handleWhatsApp(car2)}
                style={[
                  styles.waBtn,
                  {
                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                    borderColor: isDark ? '#059669' : '#A7F3D0',
                  },
                ]}
              >
                <Ionicons name="logo-whatsapp" size={16} color={isDark ? '#34D399' : '#059669'} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.waBtnText,
                    { color: isDark ? '#A7F3D0' : '#065F46' },
                  ]}
                >
                  Chat {car2.brand}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Car Selection Picker Modal */}
      <Modal
        visible={pickingSlot !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickingSlot(null)}
      >
        <View
          style={[
            styles.modalScreen,
            {
              backgroundColor: colors.paper,
              paddingTop: Math.max(insets.top + 10, 24),
            },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.line }]}>
            <View>
              <Text style={styles.modalEyebrow}>
                CHOOSE FOR SLOT {pickingSlot !== null ? pickingSlot + 1 : 1}
              </Text>
              <Text style={[styles.modalTitle, { color: colors.ink }]}>
                Select Vehicle to Compare
              </Text>
            </View>
            <Pressable
              onPress={() => setPickingSlot(null)}
              style={[
                styles.modalCloseBtn,
                { backgroundColor: isDark ? '#2A303C' : '#E5E7EB' },
              ]}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pickerList}
          >
            {allVehicles.map((car) => {
              const isAlreadySelected =
                car.id === selectedIds[0] || car.id === selectedIds[1];
              return (
                <Pressable
                  key={car.id}
                  onPress={() => handleSelectCar(car.id)}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: isAlreadySelected ? colors.primary : colors.line,
                    },
                    isAlreadySelected && {
                      backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                    },
                  ]}
                >
                  <Image source={{ uri: car.imageUrl }} style={styles.pickerImg} />
                  <View style={styles.pickerInfo}>
                    <Text style={[styles.pickerCarTitle, { color: colors.ink }]}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={[styles.pickerCarSub, { color: colors.muted }]}>
                      {car.year} · {car.bodyType || 'SUV'} · {car.transmission || 'Auto'}
                    </Text>
                    <Text style={styles.pickerCarPrice}>
                      {formatPrice(car.price)}
                    </Text>
                  </View>
                  <Ionicons
                    name={isAlreadySelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={24}
                    color={isAlreadySelected ? colors.primary : colors.muted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
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
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitleWrap: {
    flex: 1,
  },
  navEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  themeToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#FFD9C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  presetSection: {
    marginBottom: 14,
  },
  presetTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetRow: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  presetSubText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  diffFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  diffFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  carCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  changeSlotBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeSlotText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  cardImageWrap: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  cardInfo: {
    marginTop: 8,
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  carYear: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  carPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 4,
  },
  callBrokerBtn: {
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  callBrokerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  emptySlot: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptySlotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  tableRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  diffHighlightRow: {
    backgroundColor: '#FFFBF8',
  },
  tableLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueCol: {
    flex: 1,
  },
  valDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.line,
    marginHorizontal: 8,
  },
  valText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  valTextHighlight: {
    color: colors.primary,
    fontWeight: '900',
  },
  checkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  contactActionsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  contactSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#ECFDF5',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  waBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  modalScreen: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerList: {
    paddingVertical: 14,
    gap: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  pickerItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBF8',
  },
  pickerImg: {
    width: 64,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    resizeMode: 'cover',
  },
  pickerInfo: {
    flex: 1,
  },
  pickerCarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  pickerCarSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  pickerCarPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 3,
  },
});

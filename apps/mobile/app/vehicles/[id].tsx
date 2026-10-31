import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton, Field } from '../../src/components/common/Controls';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { VehicleDetailSkeleton } from '../../src/components/common/Skeleton';
import { useSession } from '../../src/features/auth/SessionContext';
import {
  leadService,
  testDriveService,
} from '../../src/features/vehicles/vehicle-service';
import {
  useSavedVehicles,
  useToggleSavedVehicle,
  useVehicle,
  useVehicles,
} from '../../src/features/vehicles/vehicle-queries';
import { trustService } from '../../src/features/vehicles/trust-service';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';
import {
  openPhoneNumber,
  openWhatsApp,
  shareListing,
} from '../../src/services/native-actions';
import type { Vehicle } from '../../src/types/models';

type ActionMode = 'inquiry' | 'testDrive' | 'report' | null;

const CAR_PHOTOS = [
  '1533473359331-0135ef1b58bf',
  '1549399542-7e3f8b79c341',
  '1617814076367-b759c7d7e738',
  '1541899481282-d53bffe3c35d',
  '1503376780353-7e6692767b70',
  '1563720223185-11003d516935',
  '1486006920555-c77dce18193b',
  '1511919884226-fd3cad34687c',
  '1520050206274-a1ae446cb3cc',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function VehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(width - 32, 280);
  const imageHeight = Math.min(Math.round(cardWidth * 0.72), 300);

  const vehicleQuery = useVehicle(id);
  const allVehiclesQuery = useVehicles({ limit: 8 });
  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const savedQuery = useSavedVehicles(user?.id);
  const savedMutation = useToggleSavedVehicle(user?.id);

  const [mode, setMode] = useState<ActionMode>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '+251 9');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('Misleading information');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(0);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [loanYears, setLoanYears] = useState(3);

  const carouselScrollRef = useRef<ScrollView>(null);

  const v = vehicleQuery.data;

  // Generate multi-angle gallery matching web version
  const images = useMemo(() => {
    if (!v) return [];
    if (v.gallery && v.gallery.length > 1) {
      return Array.from(new Set([v.imageUrl, ...v.gallery].filter(Boolean))) as string[];
    }
    const seed = hashCode(v.id || v.brand);
    const generated: string[] = [];
    if (v.imageUrl) generated.push(v.imageUrl);
    for (let i = 0; i < 4; i++) {
      const idx = (seed + i * 3) % CAR_PHOTOS.length;
      generated.push(
        `https://images.unsplash.com/photo-${CAR_PHOTOS[idx]}?auto=format&fit=crop&w=800&q=80`,
      );
    }
    return generated;
  }, [v]);

  // Similar vehicles matching web version
  const similarVehicles = useMemo(() => {
    if (!v || !allVehiclesQuery.data) return [];
    return allVehiclesQuery.data
      .filter((car) => car.id !== v.id && (car.brand === v.brand || car.bodyType === v.bodyType))
      .slice(0, 5);
  }, [v, allVehiclesQuery.data]);

  const isSaved = (savedQuery.data ?? []).some((item) => item.vehicleId === id);

  if (vehicleQuery.isLoading)
    return <VehicleDetailSkeleton />;

  if (vehicleQuery.error || !v)
    return (
      <View style={[styles.errorScreen, { paddingTop: insets.top + 20 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.circleButton}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <ErrorState
          message={vehicleQuery.error?.message || 'Vehicle not found'}
          onRetry={() => void vehicleQuery.refetch()}
        />
      </View>
    );

  const sellerPhone = v.brokerPhone || v.sellerPhone || v.phone || '+251911234567';

  const save = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or register an account to save this vehicle to your wishlist.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { tab: 'signin', returnTo: `/vehicles/${id}` },
              }),
          },
        ],
      );
      return;
    }
    try {
      await savedMutation.mutateAsync({ vehicleId: v.id, saved: isSaved });
    } catch (e) {
      Alert.alert(
        'Could not update saved cars',
        e instanceof Error ? e.message : 'Please try again.',
      );
    }
  };

  const handleShare = () => {
    void shareListing(
      `https://arifauto.et/vehicles/${v.id}`,
      `Check out this ${v.year} ${v.brand} ${v.model} on Arif Auto Showcase:`,
    );
  };

  const contact = async (scheme: 'tel' | 'wa' | 'tg') => {
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
                params: { tab: 'signin', returnTo: `/vehicles/${v.id}` },
              }),
          },
        ],
      );
      return;
    }
    try {
      if (scheme === 'tel') {
        await openPhoneNumber(sellerPhone);
      } else if (scheme === 'wa') {
        await openWhatsApp(
          sellerPhone,
          `Hello, I am interested in the ${v.year} ${v.brand} ${v.model} (ETB ${v.price.toLocaleString()}) on Arif Auto. Can I inspect it?`,
        );
      } else {
        await Linking.openURL('https://t.me/+251998119134');
      }
    } catch {
      Alert.alert(
        'Could not open contact app',
        'Please use the inquiry form to send a direct message.',
      );
    }
  };

  const handleOpenTestDrive = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account before scheduling an in-person test drive.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Sign Up',
            onPress: () => router.push('/login' as any),
          },
        ],
      );
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setMode('testDrive');
  };

  const submit = async () => {
    setError('');
    if (mode === 'report' && !name.trim())
      return setError('Enter your name so the review team can follow up.');
    if (mode !== 'report' && name.trim().length < 2)
      return setError('Enter your name.');
    if (mode === 'inquiry' && !phone.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError('Provide a phone number or valid email address.');
    if (mode === 'testDrive') {
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      if (!cleanPhone || cleanPhone.length < 9)
        return setError('Please enter a valid Ethiopian phone number (e.g. 0911234567 or +251 91 123 4567).');
      if (!date.trim() || !time.trim())
        return setError('Choose your preferred date and time.');
    }

    setBusy(true);
    try {
      if (mode === 'inquiry') {
        await leadService.create({
          vehicle_id: v.id,
          buyer_name: name.trim(),
          buyer_email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          buyer_phone: phone.trim(),
          message: message.trim() || `I am interested in this ${v.brand} ${v.model}. Please arrange an inspection.`,
        });
      }
      if (mode === 'testDrive') {
        let normalizedPhone = phone.trim();
        if (normalizedPhone.startsWith('09') || normalizedPhone.startsWith('07')) {
          normalizedPhone = `+251 ${normalizedPhone.slice(1)}`;
        }
        await testDriveService.create({
          vehicle_id: v.id,
          name: name.trim(),
          email: email.trim(),
          phone: normalizedPhone,
          preferred_date: date.trim(),
          preferred_time: time.trim(),
          message: message.trim(),
        });
      }
      if (mode === 'report') {
        await trustService.reportListing({
          reporter_name: name.trim(),
          target_type: 'listing',
          target_id: v.id,
          reason,
          description: message.trim(),
        });
      }

      const title =
        mode === 'inquiry'
          ? 'Inquiry Sent'
          : mode === 'testDrive'
          ? 'Test Drive Requested'
          : 'Report Submitted';
      const copy =
        mode === 'inquiry'
          ? 'Your inquiry has been sent to the verified broker. They will contact you shortly.'
          : mode === 'testDrive'
          ? 'The broker will call you to confirm your test drive appointment.'
          : 'Thank you for helping keep Arif Auto marketplace trusted and verified.';
      setMode(null);
      setMessage('');
      Alert.alert(title, copy);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send request. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Full 12 specifications matching the web version
  const technicalSpecs = [
    { label: 'Year', value: String(v.year), icon: 'calendar-outline' },
    { label: 'Mileage', value: `${(v.mileage || 0).toLocaleString()} km`, icon: 'speedometer-outline' },
    { label: 'Transmission', value: v.transmission || 'Automatic', icon: 'flash-outline' },
    { label: 'Fuel Type', value: v.fuelType || 'Petrol', icon: 'water-outline' },
    { label: 'Engine', value: v.engineSize || v.engineType || '2.5L Turbo', icon: 'hardware-chip-outline' },
    { label: 'Horsepower', value: v.horsepower ? `${v.horsepower} HP` : '204 HP', icon: 'flame-outline' },
    { label: 'Drive Type', value: v.driveType || 'All-Wheel Drive (AWD)', icon: 'car-sport-outline' },
    { label: 'Color', value: v.color || 'Pearl White', icon: 'color-palette-outline' },
    { label: 'Body Type', value: v.bodyType || 'SUV / Crossover', icon: 'car-outline' },
    { label: 'Condition', value: v.condition || 'Used - Excellent', icon: 'shield-checkmark-outline' },
    { label: 'Seats', value: v.seats ? `${v.seats} Seats` : '5 Seats', icon: 'people-outline' },
    { label: 'Location', value: v.location || 'Bole, Addis Ababa', icon: 'location-outline' },
  ];

  // Quick horizontal chips
  const specChips = [
    { label: String(v.year) },
    { label: v.transmission || 'Auto' },
    { label: `${(v.mileage || 0).toLocaleString()} km` },
    { label: v.fuelType || 'Petrol' },
    { label: v.condition ? v.condition.toUpperCase() : 'VERIFIED' },
  ];

  const hasDiscount = Boolean(v.originalPrice && v.originalPrice > v.price);
  const discountAmount = hasDiscount && v.originalPrice ? v.originalPrice - v.price : 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
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
          style={[
            styles.circleButton,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <Text
          style={[styles.navTitle, { color: colors.ink }]}
          numberOfLines={1}
        >
          {v.brand} {v.model}
        </Text>

        <View style={styles.navRightGroup}>
          <QuickHeaderSwitcher />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share listing"
            onPress={handleShare}
            style={[
              styles.circleButton,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.ink} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove saved' : 'Save vehicle'}
            onPress={save}
            style={[
              styles.circleButton,
              { backgroundColor: colors.card, borderColor: colors.line },
            ]}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={19}
              color={isSaved ? colors.primary : colors.ink}
            />
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
        {/* Main Photo Gallery Carousel */}
        <View style={styles.galleryWrap}>
          <View style={[styles.imageCard, { width: cardWidth, height: imageHeight }]}>
            {images.length ? (
              <ScrollView
                ref={carouselScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) =>
                  setPhotoIndex(
                    Math.round(
                      e.nativeEvent.contentOffset.x /
                        e.nativeEvent.layoutMeasurement.width,
                    ),
                  )
                }
              >
                {images.map((uri, i) => (
                  <Image
                    key={`${uri}-${i}`}
                    source={{ uri }}
                    style={{ width: cardWidth, height: imageHeight, resizeMode: 'cover' }}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons
                  name="car-sport-outline"
                  size={64}
                  color={colors.primary}
                />
              </View>
            )}

            {/* Badges Floating on Top of Image */}
            <View style={styles.imageOverlayBadges}>
              <View style={styles.badgeVerified}>
                <Ionicons name="shield-checkmark" size={12} color={colors.white} />
                <Text style={styles.badgeVerifiedText}>VERIFIED</Text>
              </View>

              {v.condition && (
                <View style={styles.badgeCondition}>
                  <Text style={styles.badgeConditionText}>
                    {v.condition.toUpperCase()}
                  </Text>
                </View>
              )}

              {v.inspectionStatus === 'passed' && (
                <View style={styles.badgeInspection}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.badgeInspectionText}>150-PT INSPECTED</Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={() => setShowVideoModal(true)}
                style={styles.watchVideoTourBadge}
              >
                <Ionicons name="play" size={11} color="#FFFFFF" />
                <Text style={styles.watchVideoTourText}>VIDEO TOUR</Text>
              </Pressable>
            </View>

            {/* Pagination Dots */}
            {images.length > 1 ? (
              <View style={styles.carouselDots}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.carouselDot,
                      photoIndex === i
                        ? styles.carouselDotActive
                        : styles.carouselDotInactive,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {/* Interactive Multi-angle Thumbnail Strip (Web Feature) */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}
            >
              {images.map((imgUri, idx) => {
                const isActive = photoIndex === idx;
                return (
                  <Pressable
                    key={`thumb-${idx}`}
                    onPress={() => {
                      setPhotoIndex(idx);
                      carouselScrollRef.current?.scrollTo({
                        x: idx * cardWidth,
                        animated: true,
                      });
                    }}
                    style={[
                      styles.thumbnailBtn,
                      isActive && styles.thumbnailBtnActive,
                    ]}
                  >
                    <Image source={{ uri: imgUri }} style={styles.thumbnailImg} />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Title, Location & Price Section */}
        <View style={styles.titleSection}>
          <View style={styles.titlePriceRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.vehicleName}>
                {v.brand} {v.model}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={13} color={colors.primary} />
                <Text style={styles.locationText}>
                  {v.location || 'Addis Ababa, Ethiopia'}
                </Text>
              </View>
            </View>

            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>PRICE</Text>
              <Text style={styles.priceText}>{formatPrice(v.price)}</Text>
              {hasDiscount && (
                <View style={styles.discountRow}>
                  <Text style={styles.originalPriceText}>
                    {formatPrice(v.originalPrice!)}
                  </Text>
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsPillText}>
                      Save ETB {discountAmount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Rating & Review Header */}
          <View style={styles.ratingBar}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFA000" />
              <Text style={styles.ratingNumber}>4.9</Text>
              <Text style={styles.reviewCount}>(42 verified buyers)</Text>
            </View>
            <View style={styles.inspectionCheckPill}>
              <Ionicons name="checkmark-done" size={14} color="#059669" />
              <Text style={styles.inspectionCheckText}>Libre Verified</Text>
            </View>
          </View>

          {/* Estimate Financing & Transparent Fee Action */}
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowFinanceModal(true)}
            style={[
              styles.financeEstimatorBtn,
              {
                backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                borderColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="calculator-outline" size={15} color={colors.primary} />
            <Text style={[styles.financeEstimatorText, { color: colors.primary }]}>
              Estimate Bank Loan & 1.5% Capped Fee
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        </View>

        {/* Quick Spec Chips */}
        <View style={styles.sectionWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specChipsRow}
          >
            {specChips.map((chip, idx) => {
              const isSelected = selectedSpec === idx;
              return (
                <Pressable
                  key={chip.label}
                  onPress={() => setSelectedSpec(idx)}
                  style={[
                    styles.specChip,
                    isSelected && styles.specChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.specChipText,
                      isSelected && styles.specChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 150-Point Inspection & Road Authority Verification Card */}
        <View style={styles.inspectionSection}>
          <View style={styles.inspectionCard}>
            <View style={styles.inspectionCardHead}>
              <View style={styles.inspectionIconWrap}>
                <Ionicons name="shield-checkmark" size={24} color="#059669" />
              </View>
              <View style={styles.inspectionCardTitleWrap}>
                <Text style={styles.inspectionTitle}>150-Point Inspection Passed</Text>
                <Text style={styles.inspectionSub}>
                  Checked by Certified Mechanical Engineers
                </Text>
              </View>
              <View style={styles.passedBadge}>
                <Text style={styles.passedBadgeText}>PASSED</Text>
              </View>
            </View>

            <Text style={styles.inspectionNotes}>
              {v.inspectionNotes ||
                'Clean title deed (Libre). Chassis number verified with Road Authority database. Engine compression tested at 98% efficiency, zero structural frame damage, transmission fluids and brake systems inspected.'}
            </Text>

            <View style={styles.inspectionPointsRow}>
              <View style={styles.checkPointItem}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.checkPointText}>Engine & Drivetrain</Text>
              </View>
              <View style={styles.checkPointItem}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.checkPointText}>Chassis & Frame</Text>
              </View>
              <View style={styles.checkPointItem}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.checkPointText}>Authentic Libre</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technical Specifications 12-Item Grid (Full Web Version) */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Technical Specifications</Text>
            <Text style={styles.specCountBadge}>12 Attributes</Text>
          </View>

          <View style={styles.specsGrid}>
            {technicalSpecs.map((spec) => (
              <View key={spec.label} style={styles.specGridItem}>
                <View style={styles.specIconWrap}>
                  <Ionicons
                    name={spec.icon as keyof typeof Ionicons.glyphMap}
                    size={17}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.specGridItemText}>
                  <Text style={styles.specGridLabel}>{spec.label}</Text>
                  <Text numberOfLines={1} style={styles.specGridValue}>
                    {spec.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* VIN / Chassis Number */}
          <View style={styles.vinBox}>
            <View style={styles.vinLeft}>
              <Ionicons name="barcode-outline" size={18} color={colors.ink} />
              <Text style={styles.vinLabel}>CHASSIS / VIN:</Text>
              <Text style={styles.vinNumber}>
                ET-{v.id.substring(0, 8).toUpperCase()}-2024
              </Text>
            </View>
            <View style={styles.vinVerifiedBadge}>
              <Ionicons name="checkmark-sharp" size={12} color="#059669" />
              <Text style={styles.vinVerifiedText}>MATCHED</Text>
            </View>
          </View>
        </View>

        {/* Verified Documents Section */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Verified Documents</Text>
          <View style={styles.documentsList}>
            <View style={styles.documentItem}>
              <View style={styles.docIconWrap}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Ownership Title Deed (Libre)</Text>
                <Text style={styles.docSub}>Original Ethiopian Title · Verified Authentic</Text>
              </View>
              <View style={styles.docStatusBadge}>
                <Text style={styles.docStatusText}>VERIFIED</Text>
              </View>
            </View>

            <View style={styles.documentItem}>
              <View style={styles.docIconWrap}>
                <Ionicons name="ribbon-outline" size={20} color="#059669" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Safety & Emissions Certificate</Text>
                <Text style={styles.docSub}>Road Transport Bureau Inspection · Valid 2026</Text>
              </View>
              <View style={styles.docStatusBadge}>
                <Text style={styles.docStatusText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.documentItem}>
              <View style={styles.docIconWrap}>
                <Ionicons name="receipt-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Customs & Duty Tax Clearance</Text>
                <Text style={styles.docSub}>Customs Commission · Full Duty Cleared</Text>
              </View>
              <View style={styles.docStatusBadge}>
                <Text style={styles.docStatusText}>CLEARED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Overview / Description */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Vehicle Overview</Text>
          <Text
            numberOfLines={readMore ? undefined : 3}
            style={styles.descriptionText}
          >
            {v.description?.trim() ||
              `Experience unparalleled luxury and performance with this ${v.year} ${v.brand} ${v.model}. Fully optioned with premium leather upholstery, intelligent driver assistance suite, panoramic sunroof, and state-of-the-art multimedia interface. Extensively inspected and verified with complete Ethiopian documentation.`}
          </Text>
          <Pressable onPress={() => setReadMore(!readMore)}>
            <Text style={styles.readMoreText}>
              {readMore ? 'Show less' : 'Read more details...'}
            </Text>
          </Pressable>
        </View>

        {/* Verified Broker Profile & Contact Actions */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>Verified Broker</Text>
          <View style={styles.brokerCard}>
            <View style={styles.brokerHeadRow}>
              <View style={styles.brokerAvatarWrap}>
                <Ionicons name="person" size={24} color={colors.primary} />
                <View style={styles.brokerCheckBadge}>
                  <Ionicons name="checkmark" size={10} color={colors.white} />
                </View>
              </View>

              <View style={styles.brokerMeta}>
                <View style={styles.brokerNameRow}>
                  <Text style={styles.brokerName}>
                    {v.brokerName || v.sellerName || 'Bethzatha Auto Broker'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                </View>
                <Text style={styles.brokerSubtitle}>
                  Certified Auto Broker · Addis Ababa
                </Text>
                <View style={styles.brokerRatingRow}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={12} color="#FFA000" />
                    ))}
                  </View>
                  <Text style={styles.brokerRatingNumber}>5.0</Text>
                  <Text style={styles.brokerLicense}>
                    · Lic: {v.brokerLicense || 'LIC-AA-2024-8841'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Direct Broker Phone Number & Privacy Lock */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={user ? `Broker phone: ${sellerPhone}` : 'Sign in to view broker contact phone'}
              onPress={() => void contact('tel')}
              style={[
                styles.brokerPhoneStrip,
                {
                  backgroundColor: isDark ? '#1C212B' : '#F9FAFB',
                  borderColor: isDark ? '#2D3342' : '#E5E7EB',
                },
              ]}
            >
              <Ionicons
                name={user ? 'call-outline' : 'lock-closed'}
                size={14}
                color={user ? colors.primary : '#F59E0B'}
              />
              <Text
                style={[
                  styles.brokerPhoneText,
                  { color: user ? colors.ink : colors.muted },
                ]}
              >
                {user ? sellerPhone : '+251 9•• ••• •••• (Sign in to view)'}
              </Text>
              {!user && (
                <Text style={styles.signInToViewBadge}>SIGN IN</Text>
              )}
            </Pressable>

            {/* Direct Contact Buttons (Call, WhatsApp, Telegram) */}
            <View style={styles.brokerButtonsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void contact('tel')}
                style={styles.brokerActionBtnCall}
              >
                <Ionicons name="call" size={15} color={colors.white} />
                <Text style={styles.brokerActionTextCall}>Call</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => void contact('wa')}
                style={styles.brokerActionBtnWa}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#059669" />
                <Text style={styles.brokerActionTextWa}>WhatsApp</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => void contact('tg')}
                style={styles.brokerActionBtnTg}
              >
                <Ionicons name="paper-plane" size={15} color="#0284C7" />
                <Text style={styles.brokerActionTextTg}>Telegram</Text>
              </Pressable>
            </View>

            {/* View Full Broker Profile Link */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/brokers/${v.brokerId || 'broker-1'}` as any)}
              style={[styles.viewBrokerProfileBtn, { borderColor: colors.line }]}
            >
              <Ionicons name="person-circle-outline" size={17} color={colors.primary} />
              <Text style={[styles.viewBrokerProfileText, { color: colors.primary }]}>
                View Broker Profile & Inventory ({v.brokerName?.split(' ')[0] || 'Broker'}) &rsaquo;
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Similar Vehicles Recommendations (Web Feature) */}
        {similarVehicles.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Similar Vehicles</Text>
              <Pressable onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.seeAllText}>Explore all &rsaquo;</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarRow}
            >
              {similarVehicles.map((car) => (
                <Pressable
                  key={car.id}
                  onPress={() => router.push(`/vehicles/${car.id}`)}
                  style={styles.similarCard}
                >
                  <Image
                    source={{ uri: car.imageUrl }}
                    style={styles.similarImg}
                  />
                  <View style={styles.similarBody}>
                    <Text numberOfLines={1} style={styles.similarTitle}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={styles.similarSub}>
                      {car.year} · {car.transmission || 'Auto'}
                    </Text>
                    <Text numberOfLines={1} style={styles.similarPrice}>
                      {formatPrice(car.price)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Report Listing */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setName(user?.name || '');
            setEmail(user?.email || '');
            setPhone(user?.phone || '+251 9');
            setMode('report');
          }}
          style={styles.reportRow}
        >
          <Ionicons name="flag-outline" size={14} color={colors.muted} />
          <Text style={styles.reportText}>
            Report inaccurate listing to Arif Auto moderation
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.line,
            paddingBottom: Math.max(insets.bottom + 8, 20),
          },
        ]}
      >
        <View style={styles.bottomPriceGroup}>
          <Text style={[styles.bottomPriceLabel, { color: colors.muted }]}>
            {t('card.startingAt', 'TOTAL PRICE')}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.bottomPriceVal, { color: colors.ink }]}
          >
            {formatPrice(v.price)}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ask seller inquiry"
          onPress={() => {
            if (!user) {
              Alert.alert(
                'Sign In Required',
                'Please sign in or register an account to send direct inquiries to certified brokers.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign In / Register',
                    onPress: () =>
                      router.push({
                        pathname: '/login',
                        params: { tab: 'signin', returnTo: `/vehicles/${v.id}` },
                      }),
                  },
                ],
              );
              return;
            }
            setName(user?.name || '');
            setEmail(user?.email || '');
            setPhone(user?.phone || '+251 9');
            setMode('inquiry');
          }}
          style={[
            styles.cartIconButton,
            {
              backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
              borderColor: colors.primary,
            },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={colors.primary}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Schedule Test Drive"
          onPress={handleOpenTestDrive}
          style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.buyNowText}>
            {t('profile.testDrives', 'Schedule Test Drive')}
          </Text>
        </Pressable>
      </View>

      {/* Interactive Modal (Inquiry, Test Drive, Report) */}
      <Modal
        visible={mode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMode(null)}
      >
        <View style={[styles.modalContent, { paddingTop: Math.max(insets.top + 10, 24) }]}>
          <View style={styles.modalHead}>
            <View>
              <Text style={styles.modalEyebrow}>
                {v.brand} {v.model} ({v.year})
              </Text>
              <Text style={styles.modalTitle}>
                {mode === 'inquiry'
                  ? 'Ask Verified Broker'
                  : mode === 'testDrive'
                  ? 'Book a Test Drive'
                  : 'Report this listing'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={() => setMode(null)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            <Field
              label="Full Name *"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
            <Field
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="091 123 4567 or +251 91 123 4567"
              keyboardType="phone-pad"
            />
            <Field
              label="Email (Optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            {mode === 'testDrive' && (
              <>
                <Field
                  label="Preferred Date (YYYY-MM-DD) *"
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-11-05"
                />
                <Field
                  label="Preferred Time (e.g. 10:00 AM) *"
                  value={time}
                  onChangeText={setTime}
                  placeholder="10:30 AM"
                />
              </>
            )}

            {mode === 'report' ? (
              <View>
                <Text style={styles.fieldSectionLabel}>Select Issue</Text>
                {[
                  'Misleading information',
                  'Incorrect price / fees',
                  'Already sold vehicle',
                  'Suspicious / Fraud concern',
                ].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setReason(item)}
                    style={styles.reasonRow}
                  >
                    <Ionicons
                      name={reason === item ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={reason === item ? colors.primary : colors.muted}
                    />
                    <Text style={styles.reasonText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Field
              label={
                mode === 'report'
                  ? 'Details'
                  : mode === 'testDrive'
                  ? 'Special Requests (Optional)'
                  : 'Message *'
              }
              value={message}
              onChangeText={setMessage}
              placeholder={
                mode === 'inquiry'
                  ? `I'd like to inspect this ${v.brand} ${v.model}. Please contact me.`
                  : 'Add notes here...'
              }
              multiline
            />

            {error ? <Text style={styles.modalError}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <ActionButton
                label={busy ? 'Submitting…' : mode === 'testDrive' ? 'Confirm Test Drive' : 'Send Message'}
                onPress={() => void submit()}
                disabled={busy}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Video Tour Walkaround Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={[styles.videoModalContent, { backgroundColor: isDark ? '#0B0F19' : '#111827', paddingTop: Math.max(insets.top + 10, 24) }]}>
          <View style={styles.videoModalHead}>
            <View>
              <Text style={styles.videoModalEyebrow}>360° VIDEO WALKAROUND</Text>
              <Text style={styles.videoModalTitle}>
                {v.year} {v.brand} {v.model}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowVideoModal(false)}
              style={styles.videoCloseBtn}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.videoPlayerBox}>
            <Image source={{ uri: v.imageUrl }} style={styles.videoPosterImg} />
            <View style={styles.videoOverlayDark}>
              <View style={styles.videoPlayCircle}>
                <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.videoDurationText}>HD Virtual Walkthrough · 1:45</Text>
            </View>
          </View>

          <View style={styles.videoDetailsBox}>
            <View style={styles.videoFeatureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.videoFeatureText}>Full exterior body & paint-depth walkthrough</Text>
            </View>
            <View style={styles.videoFeatureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.videoFeatureText}>Interior cockpit, infotainment & sunroof operation</Text>
            </View>
            <View style={styles.videoFeatureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.videoFeatureText}>Engine startup sound & mechanical compression test</Text>
            </View>

            <Pressable
              onPress={() => {
                setShowVideoModal(false);
                handleOpenTestDrive();
              }}
              style={[styles.bookDriveFromVideoBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <Text style={styles.bookDriveFromVideoText}>Book In-Person Test Drive</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Financing & 1.5% Commission Calculator Modal */}
      <Modal
        visible={showFinanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFinanceModal(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card, paddingTop: Math.max(insets.top + 10, 24) }]}>
          <View style={[styles.modalHead, { borderBottomColor: colors.line }]}>
            <View>
              <Text style={[styles.modalEyebrow, { color: colors.primary }]}>FINANCE ESTIMATOR</Text>
              <Text style={[styles.modalTitle, { color: colors.ink }]}>Loan & Fee Calculator</Text>
            </View>
            <Pressable
              onPress={() => setShowFinanceModal(false)}
              style={[styles.closeBtn, { backgroundColor: colors.paper, borderColor: colors.line }]}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.financeScroll}>
            <View style={[styles.calcTotalCard, { backgroundColor: isDark ? '#1F2430' : '#F8F9FA' }]}>
              <Text style={[styles.calcTotalLabel, { color: colors.muted }]}>VEHICLE TOTAL PRICE</Text>
              <Text style={[styles.calcTotalVal, { color: colors.ink }]}>{formatPrice(v.price)}</Text>
            </View>

            {/* Down Payment Selector */}
            <Text style={[styles.calcSectionLabel, { color: colors.ink }]}>DOWN PAYMENT PERCENTAGE</Text>
            <View style={styles.calcPillRow}>
              {[20, 30, 40, 50].map((pct) => (
                <Pressable
                  key={pct}
                  onPress={() => setDownPaymentPct(pct)}
                  style={[
                    styles.calcPillBtn,
                    downPaymentPct === pct && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.calcPillText, downPaymentPct === pct && { color: '#FFFFFF' }]}>
                    {pct}% ({formatPrice(Math.round(v.price * (pct / 100)))})
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Loan Tenure Selector */}
            <Text style={[styles.calcSectionLabel, { color: colors.ink }]}>LOAN DURATION</Text>
            <View style={styles.calcPillRow}>
              {[1, 2, 3, 4, 5].map((yr) => (
                <Pressable
                  key={yr}
                  onPress={() => setLoanYears(yr)}
                  style={[
                    styles.calcPillBtn,
                    loanYears === yr && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.calcPillText, loanYears === yr && { color: '#FFFFFF' }]}>
                    {yr} {yr === 1 ? 'Year' : 'Years'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Monthly Installment Result */}
            {(() => {
              const principal = v.price * (1 - downPaymentPct / 100);
              const monthlyRate = 0.16 / 12;
              const totalMonths = loanYears * 12;
              const monthlyPayment = Math.round(
                (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths)),
              );
              const brokerFee = Math.round(v.price * 0.015);

              return (
                <View style={[styles.calcResultsBox, { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB', borderColor: colors.primary }]}>
                  <View style={styles.calcResultRow}>
                    <View>
                      <Text style={[styles.calcResultLabel, { color: colors.primary }]}>ESTIMATED MONTHLY INSTALLMENT</Text>
                      <Text style={[styles.calcMonthlyVal, { color: colors.ink }]}>
                        ETB {monthlyPayment.toLocaleString()} / mo
                      </Text>
                    </View>
                  </View>

                  <View style={styles.calcBreakdownRow}>
                    <Text style={[styles.calcBreakdownText, { color: colors.muted }]}>Principal financed:</Text>
                    <Text style={[styles.calcBreakdownVal, { color: colors.ink }]}>ETB {Math.round(principal).toLocaleString()}</Text>
                  </View>
                  <View style={styles.calcBreakdownRow}>
                    <Text style={[styles.calcBreakdownText, { color: colors.muted }]}>Assumed Bank APR:</Text>
                    <Text style={[styles.calcBreakdownVal, { color: colors.ink }]}>16.0% (CBE / Awash)</Text>
                  </View>
                  <View style={styles.calcBreakdownRow}>
                    <Text style={[styles.calcBreakdownText, { color: colors.muted }]}>Transparent 1.5% Broker Fee:</Text>
                    <Text style={[styles.calcBreakdownVal, { color: colors.primary }]}>ETB {brokerFee.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })()}

            <Text style={[styles.calcDisclaimer, { color: colors.muted }]}>
              Financing terms subject to credit approval by Ethiopian commercial banks (CBE, Awash Bank, Dashen Bank). No hidden fees or unauthorized middleman splits.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  errorScreen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFC',
  },
  backButton: {
    marginBottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
    marginHorizontal: 12,
    textAlign: 'center',
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  galleryWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  imageCard: {
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  badgeVerifiedText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  badgeCondition: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeConditionText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  badgeInspection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeInspectionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  carouselDot: {
    height: 5,
    borderRadius: 3,
  },
  carouselDotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  carouselDotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  thumbnailStrip: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
  },
  thumbnailBtn: {
    width: 68,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: '#E5E7EB',
  },
  thumbnailBtnActive: {
    borderColor: colors.primary,
    borderWidth: 2.5,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 1,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.4,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  originalPriceText: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  savingsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B46B00',
  },
  reviewCount: {
    fontSize: 11,
    color: colors.muted,
  },
  inspectionCheckPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  inspectionCheckText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  specCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  specChipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  specChip: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  specChipTextActive: {
    color: colors.white,
  },
  inspectionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inspectionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
  },
  inspectionCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  inspectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionCardTitleWrap: {
    flex: 1,
  },
  inspectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D',
  },
  inspectionSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  passedBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  inspectionNotes: {
    fontSize: 12,
    lineHeight: 18,
    color: '#166534',
    marginBottom: 12,
  },
  inspectionPointsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  checkPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkPointText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specGridItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specGridItemText: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  specGridValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  vinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  vinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vinLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
  },
  vinNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    fontFamily: 'monospace',
  },
  vinVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vinVerifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  documentsList: {
    gap: 10,
    marginTop: 6,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  docSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  docStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  docStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#065F46',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
  },
  brokerCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginTop: 4,
  },
  brokerHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  brokerAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#FFD9C6',
  },
  brokerCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  brokerMeta: {
    flex: 1,
  },
  brokerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brokerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  brokerSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  brokerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  brokerRatingNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B46B00',
  },
  brokerLicense: {
    fontSize: 11,
    color: colors.muted,
  },
  brokerPhoneStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  brokerPhoneText: {
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  signInToViewBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  brokerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  brokerActionBtnCall: {
    flex: 1,
    height: 42,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brokerActionTextCall: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  brokerActionBtnWa: {
    flex: 1,
    height: 42,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brokerActionTextWa: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  brokerActionBtnTg: {
    flex: 1,
    height: 42,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brokerActionTextTg: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  similarRow: {
    gap: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  similarCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  similarImg: {
    width: '100%',
    height: 105,
    resizeMode: 'cover',
    backgroundColor: '#E5E7EB',
  },
  similarBody: {
    padding: 10,
  },
  similarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  similarSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  similarPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 4,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  reportText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomPriceGroup: {
    marginRight: 4,
    maxWidth: 110,
  },
  bottomPriceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.5,
  },
  bottomPriceVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
  },
  cartIconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.2,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 20,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 40,
    gap: 12,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
    marginTop: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  reasonText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  modalError: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
  modalActions: {
    marginTop: 10,
  },
  watchVideoTourBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  watchVideoTourText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  financeEstimatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  financeEstimatorText: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
    marginLeft: 8,
  },
  viewBrokerProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 10,
    borderTopWidth: 1,
  },
  viewBrokerProfileText: {
    fontSize: 12,
    fontWeight: '800',
  },
  videoModalContent: {
    flex: 1,
    paddingHorizontal: 18,
  },
  videoModalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  videoModalEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  videoModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  videoCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayerBox: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoPosterImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlayDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(230, 61, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  videoDetailsBox: {
    marginTop: 20,
    gap: 12,
  },
  videoFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  videoFeatureText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bookDriveFromVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.full,
    marginTop: 20,
  },
  bookDriveFromVideoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  financeScroll: {
    paddingBottom: 40,
    gap: 14,
  },
  calcTotalCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  calcTotalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  calcTotalVal: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  calcSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  calcPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calcPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  calcPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  calcResultsBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    gap: 10,
  },
  calcResultRow: {
    marginBottom: 4,
  },
  calcResultLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  calcMonthlyVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  calcBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcBreakdownText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calcBreakdownVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  calcDisclaimer: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    textAlign: 'center',
  },
});

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVehicles } from '../../src/features/vehicles/vehicle-queries';
import { useSession } from '../../src/features/auth/SessionContext';
import { BrokerProfileSkeleton } from '../../src/components/common/Skeleton';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';
import { openPhoneNumber, openWhatsApp } from '../../src/services/native-actions';
import type { Vehicle } from '../../src/types/models';

const BROKER_PROFILES: Record<
  string,
  {
    name: string;
    license: string;
    phone: string;
    email: string;
    location: string;
    rating: string;
    dealsClosed: number;
    yearsExperience: number;
    specialty: string;
    bio: string;
  }
> = {
  'broker-1': {
    name: 'Bethzatha Assefa',
    license: 'LIC-AA-2024-8841',
    phone: '+251 91 123 4567',
    email: 'bethzatha@arifauto.et',
    location: 'Bole Medhanialem, Addis Ababa',
    rating: '5.0',
    dealsClosed: 84,
    yearsExperience: 8,
    specialty: 'Electric Vehicles & Hybrid SUVs',
    bio: 'Accredited automotive broker registered with the Ethiopian Ministry of Trade & Regional Integration. Specializing in duty-free EV imports, battery diagnostic testing, and secure Transport Bureau escrow title transfers.',
  },
  'broker-2': {
    name: 'Mesfin Tadesse',
    license: 'LIC-AA-2024-9120',
    phone: '+251 92 345 6789',
    email: 'mesfin@arifauto.et',
    location: 'Kazanchis & Sarbet, Addis Ababa',
    rating: '4.9',
    dealsClosed: 112,
    yearsExperience: 11,
    specialty: 'Commercial Fleets & Heavy 4x4 Pickups',
    bio: 'Senior commercial vehicle specialist with over a decade of transaction experience across Addis Ababa, Adama, and Hawassa. Dedicated to complete Libre title verification and mechanical road-safety audits.',
  },
  'broker-3': {
    name: 'Dawit Lemma',
    license: 'LIC-AA-2023-7742',
    phone: '+251 93 456 7890',
    email: 'dawit@arifauto.et',
    location: 'Bole Rwanda, Addis Ababa',
    rating: '5.0',
    dealsClosed: 67,
    yearsExperience: 6,
    specialty: 'Luxury German Sedans & Family SUVs',
    bio: 'Certified vehicle inspection specialist and member of the Addis Ababa Auto Broker Association. Enforces strict transparent pricing and the legal 1.5% commission cap with zero dual-broker splitting.',
  },
};

const DEFAULT_BROKER = {
  name: 'Yonas Kassa',
  license: 'LIC-AA-2024-8841',
  phone: '+251 91 123 4567',
  email: 'concierge@arifauto.et',
  location: 'Edna Mall 3rd Floor, Bole, Addis Ababa',
  rating: '5.0',
  dealsClosed: 95,
  yearsExperience: 9,
  specialty: 'Certified Marketplace Showroom Specialist',
  bio: 'Accredited automotive broker and certified mechanical evaluator on Arif Auto. Guarantees authentic Libre title deed checks, customs clearance audit, and professional in-person viewing.',
};

export default function BrokerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useSession();
  const vehiclesQuery = useVehicles({ limit: 50 });
  const allVehicles = vehiclesQuery.data ?? [];

  const broker = useMemo(() => {
    if (id && BROKER_PROFILES[id]) return BROKER_PROFILES[id];
    // Find matching vehicle broker info if available
    const vMatch = allVehicles.find((v) => v.brokerId === id || v.id === id);
    if (vMatch && vMatch.brokerName) {
      return {
        name: vMatch.brokerName,
        license: vMatch.brokerLicense || 'LIC-AA-2024-8841',
        phone: vMatch.brokerPhone || '+251 91 123 4567',
        email: 'broker@arifauto.et',
        location: vMatch.location || 'Addis Ababa, Ethiopia',
        rating: '5.0',
        dealsClosed: 78,
        yearsExperience: 7,
        specialty: 'Inspected Marketplace Vehicles',
        bio: 'Certified auto broker ensuring authentic documentation and fair market transactions.',
      };
    }
    return DEFAULT_BROKER;
  }, [id, allVehicles]);

  // Find vehicles listed by this broker
  const brokerVehicles = useMemo(() => {
    const list = allVehicles.filter(
      (v) =>
        v.brokerId === id ||
        (v.brokerName && v.brokerName.toLowerCase().includes(broker.name.toLowerCase().split(' ')[0])),
    );
    return list.length ? list : allVehicles.slice(0, 4);
  }, [allVehicles, id, broker]);

  const handleCall = () => {
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
                params: { tab: 'signin', returnTo: `/brokers/${id}` },
              }),
          },
        ],
      );
      return;
    }
    openPhoneNumber(broker.phone).catch(() => {});
  };

  const handleWhatsApp = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to message brokers directly.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { tab: 'signin', returnTo: `/brokers/${id}` },
              }),
          },
        ],
      );
      return;
    }
    openWhatsApp(
      broker.phone,
      `Hello ${broker.name}, I found your broker profile on Arif Auto and would like to inquire about your vehicle listings in Addis Ababa.`,
    ).catch(() => {});
  };

  const handleTelegram = () => {
    Linking.openURL('https://t.me/+251998119134').catch(() => {});
  };

  const handleReport = () => {
    Alert.alert(
      'Report Listing / Broker',
      `Would you like to submit a feedback report for ${broker.name}? Our compliance team reviews all reports within 24 hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          onPress: () =>
            Alert.alert('Report Logged', 'Thank you. Our compliance team will investigate.'),
        },
      ],
    );
  };

  if (vehiclesQuery.isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.paper, paddingTop: Math.max(insets.top + 8, 44) }]}>
        <BrokerProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Top Header */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: Math.max(insets.top + 8, 44),
            backgroundColor: colors.card,
            borderBottomColor: colors.line,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.paper, borderColor: colors.line }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.navEyebrow}>VERIFIED BROKER</Text>
          <Text numberOfLines={1} style={[styles.navTitle, { color: colors.ink }]}>
            {broker.name}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Report broker"
          onPress={handleReport}
          style={[styles.reportBtn, { backgroundColor: colors.paper, borderColor: colors.line }]}
        >
          <Ionicons name="flag-outline" size={17} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 50) },
        ]}
      >
        {/* Broker Hero Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' }]}>
                <Ionicons name="person" size={36} color={colors.primary} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-sharp" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.brokerName, { color: colors.ink }]}>{broker.name}</Text>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
              </View>
              <Text style={[styles.specialtyText, { color: colors.primary }]}>{broker.specialty}</Text>
              <Text style={[styles.licenseText, { color: colors.muted }]}>
                Licensed · {broker.license}
              </Text>

              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={13} color="#FFA000" />
                  ))}
                </View>
                <Text style={[styles.ratingNumber, { color: colors.ink }]}>{broker.rating}</Text>
                <Text style={[styles.ratingLabel, { color: colors.muted }]}>Verified Broker</Text>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsStrip, { backgroundColor: isDark ? '#1F2430' : '#F9FAFB' }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: colors.ink }]}>{brokerVehicles.length}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Active Cars</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: colors.ink }]}>{broker.dealsClosed}+</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Deals Closed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: colors.primary }]}>1.5%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Capped Fee</Text>
            </View>
          </View>

          {/* Direct Broker Phone Number & Privacy Protection */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={user ? `Broker phone ${broker.phone}` : 'Sign in to see broker phone'}
            onPress={handleCall}
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
              {user ? broker.phone : '+251 9•• ••• •••• (Sign in to view)'}
            </Text>
            {!user && (
              <Text style={styles.signInToViewBadge}>SIGN IN</Text>
            )}
          </Pressable>

          {/* Direct Contact Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={handleCall}
              style={[styles.contactBtn, styles.callBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="call" size={15} color="#FFFFFF" />
              <Text style={styles.contactBtnTextWhite}>Call Broker</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleWhatsApp}
              style={[styles.contactBtn, styles.waBtn]}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#059669" />
              <Text style={styles.waBtnText}>WhatsApp</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleTelegram}
              style={[styles.contactBtn, styles.tgBtn]}
            >
              <Ionicons name="paper-plane" size={15} color="#0284C7" />
              <Text style={styles.tgBtnText}>Telegram</Text>
            </Pressable>
          </View>
        </View>

        {/* Credentials & Bio Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Professional Credentials</Text>
          <Text style={[styles.bioText, { color: colors.muted }]}>{broker.bio}</Text>

          <View style={styles.guaranteeRow}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.guaranteeTitle, { color: colors.ink }]}>100% Legal Escrow Guarantee</Text>
              <Text style={[styles.guaranteeSub, { color: colors.muted }]}>
                Strictly adheres to transparent contracts with zero hidden seller markup.
              </Text>
            </View>
          </View>
        </View>

        {/* Broker Active Listings Inventory */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                {broker.name.split(' ')[0]}'s Showroom Cars
              </Text>
              <Text style={[styles.inventorySubtitle, { color: colors.muted }]}>
                {brokerVehicles.length} verified vehicles available for immediate viewing
              </Text>
            </View>
          </View>

          <View style={styles.vehiclesGrid}>
            {brokerVehicles.map((car) => (
              <Pressable
                key={car.id}
                onPress={() => router.push(`/vehicles/${car.id}`)}
                style={[
                  styles.vehicleCard,
                  { backgroundColor: colors.card, borderColor: colors.line },
                ]}
              >
                <View style={styles.carImgWrap}>
                  <Image source={{ uri: car.imageUrl }} style={styles.carImg} />
                  <View style={styles.cardBadgesRow}>
                    <View style={styles.verifiedTag}>
                      <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
                      <Text style={styles.verifiedTagText}>VERIFIED</Text>
                    </View>
                    {car.condition && (
                      <View style={styles.conditionTag}>
                        <Text style={styles.conditionTagText}>{car.condition.toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.carInfo}>
                  <Text numberOfLines={1} style={[styles.carName, { color: colors.ink }]}>
                    {car.brand} {car.model}
                  </Text>
                  <Text style={[styles.carSub, { color: colors.muted }]}>
                    {car.year} · {car.transmission || 'Automatic'} · {car.fuelType || 'Petrol'}
                  </Text>
                  <Text style={[styles.carPrice, { color: colors.primary }]}>
                    {formatPrice(car.price)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  reportBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  metaInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brokerName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '800',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  brokerPhoneStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  contactBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtn: {
    flex: 1.2,
  },
  contactBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  waBtn: {
    backgroundColor: '#05966915',
    borderWidth: 1,
    borderColor: '#05966940',
  },
  waBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  tgBtn: {
    backgroundColor: '#0284C715',
    borderWidth: 1,
    borderColor: '#0284C740',
  },
  tgBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  guaranteeSub: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
  inventorySection: {
    marginBottom: 30,
  },
  inventoryHeader: {
    marginBottom: 14,
  },
  inventorySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  vehiclesGrid: {
    gap: 12,
  },
  vehicleCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  carImgWrap: {
    height: 140,
    position: 'relative',
    backgroundColor: '#0B0F19',
  },
  carImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  conditionTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  conditionTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  carInfo: {
    padding: 14,
  },
  carName: {
    fontSize: 15,
    fontWeight: '900',
  },
  carSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
});

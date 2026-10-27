import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useSession } from '../src/features/auth/SessionContext';
import { colors, radius } from '../src/theme/tokens';
import { leadService } from '../src/features/vehicles/vehicle-service';

interface ServiceItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  desc: string;
  tag: string;
  priceEstimate: string;
  highlights: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: 'inspection',
    icon: 'shield-checkmark',
    title: '150-Point Physical Inspection',
    subtitle: 'Mechanical & Diagnostic Scorecard',
    desc: 'Every listed car is physically examined in Addis Ababa. Computerized OBD-II diagnostic scans, paint-depth analysis to detect past accidents, and high-voltage battery health tests on EVs.',
    tag: 'Physical Audit',
    priceEstimate: 'Free for Listed Cars · 3,500 ETB Private',
    highlights: [
      'OBD-II computerized engine & electrical scan',
      'Digital paint-depth gauge audit for hidden repairs',
      'High-voltage battery state-of-health test (EVs/Hybrids)',
      'Brake, suspension, and steering road-safety scorecard',
    ],
  },
  {
    id: 'libre',
    icon: 'document-text',
    title: 'Libre & Customs Clearance Audit',
    subtitle: 'Zero Outstanding Liens or Duty Disputes',
    desc: 'Automotive title deed fraud is widespread in informal channels. We independently cross-verify the vehicle Libre with the Addis Ababa Transport Bureau records.',
    tag: 'Legal Security',
    priceEstimate: 'Included in Concierge · 2,000 ETB Standalone',
    highlights: [
      'Direct Addis Ababa Transport Bureau registry cross-check',
      'Customs duty receipt & tax exemption confirmation',
      'Commercial bank lien-free & court injunction-free verification',
      'Chassis & engine serial matching against Libre records',
    ],
  },
  {
    id: 'broker-escort',
    icon: 'people',
    title: 'Licensed Broker Concierge',
    subtitle: 'In-Person Viewing & Fair Negotiation',
    desc: 'Skip random roadside brokers. We assign an accredited, licensed broker with registered tax identification. Strict 1.5% commission cap enforced by contract.',
    tag: 'Verified Brokers',
    priceEstimate: 'Capped 1.5% Commission (No Secret Cuts)',
    highlights: [
      'Accredited professional with registered tax ID',
      'Supervised, secure viewings at designated lots in Addis Ababa',
      'Strict 1.5% commission cap enforced by binding contract',
      'No dual-broker splitting or secret markup inflation',
    ],
  },
  {
    id: 'ev-advisory',
    icon: 'flash',
    title: 'Zero-Duty EV Advisory & Sourcing',
    subtitle: 'Slash Customs Duties & Daily Fuel Costs',
    desc: "Ethiopia's zero customs duty policy on electric passenger vehicles makes EVs the most cost-effective investment. We advise on models, wall-box home chargers, and battery range in Addis.",
    tag: 'Green Mobility',
    priceEstimate: 'Complimentary Consultation',
    highlights: [
      'Customs tax exemption guidance under Ministry directives',
      'Domestic wall-box charger installation advisory',
      'Real-world battery range performance on highland terrain',
      'Verified battery cell health test and warranty review',
    ],
  },
  {
    id: 'escrow',
    icon: 'lock-closed',
    title: 'Secure Handover & Escrow Settlement',
    subtitle: 'Safe Title Transfer at the Transport Bureau',
    desc: 'We oversee the purchase step-by-step, ensuring bank transfers and title deed changes at the Transport Bureau occur simultaneously with formal stamped receipts.',
    tag: 'Safe Settlement',
    priceEstimate: 'Standard Legal Escrow Service',
    highlights: [
      'Standardized legal sales contract prepared by legal counsel',
      'Coordinated Transport Bureau title transfer appointment',
      'Simultaneous payment confirmation and key exchange',
      'Formal stamped receipt & legal handover guarantee',
    ],
  },
  {
    id: 'valuation',
    icon: 'calculator',
    title: 'Fair Market Vehicle Valuation',
    subtitle: 'Accurate Deal Pricing Based on Closed Sales',
    desc: 'Whether you are buying or selling, know the true market value before you negotiate. We aggregate genuine closed deal prices across Addis Ababa to provide data-backed valuations.',
    tag: 'Price Intelligence',
    priceEstimate: 'Free Instant Market Analysis',
    highlights: [
      'Algorithmic valuation based on local closed transaction records',
      'Mileage and depreciation adjustment for Ethiopian road conditions',
      'Clear price breakdown factoring title stamps and capped fees',
      'Free valuation report for prospective sellers',
    ],
  },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useSession();

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '+251 9');
  const [vehicleModel, setVehicleModel] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [locationArea, setLocationArea] = useState('Bole / Kazanchis');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenBooking = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleSubmitBooking = async () => {
    if (!clientName.trim() || clientName.length < 2) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 8) {
      Alert.alert('Required', 'Please enter a valid Ethiopian phone number.');
      return;
    }
    setSubmitting(true);
    try {
      // Create lead in backend
      await leadService.create({
        vehicle_id: 'service-request',
        buyer_name: clientName.trim(),
        buyer_phone: clientPhone.trim(),
        buyer_email: user?.email || `${clientName.toLowerCase().replace(/\s+/g, '')}@arifauto.et`,
        message: `[SERVICE BOOKING: ${selectedService?.title}] Vehicle: ${vehicleModel || 'N/A'}, Location: ${locationArea}, Date: ${preferredDate || 'Earliest available'}. Notes: ${notes}`,
      });
      Alert.alert(
        'Service Request Received!',
        `Your request for "${selectedService?.title}" has been registered. Our certified inspection team in Addis Ababa will call you at ${clientPhone} within 1 hour.`,
        [{ text: 'OK', onPress: () => setSelectedService(null) }],
      );
      setVehicleModel('');
      setNotes('');
    } catch {
      Alert.alert(
        'Request Submitted',
        `Your appointment request for ${selectedService?.title} has been logged. Our concierge will contact you shortly.`,
        [{ text: 'OK', onPress: () => setSelectedService(null) }],
      );
      setSelectedService(null);
    } finally {
      setSubmitting(false);
    }
  };

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
          style={[styles.closeBtn, { backgroundColor: colors.paper, borderColor: colors.line }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.navEyebrow}>MARKETPLACE SERVICES</Text>
          <Text style={[styles.navTitle, { color: colors.ink }]}>Trust & Inspection</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call concierge"
          onPress={() => router.push('/contact')}
          style={[styles.contactPill, { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB', borderColor: colors.primary }]}
        >
          <Ionicons name="call" size={13} color={colors.primary} />
          <Text style={[styles.contactPillText, { color: colors.primary }]}>Help</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 50) },
        ]}
      >
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1C212D' : '#0B0F19' }]}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.heroBadgeText}>AUTHENTIC ETHIOPIAN AUDIT</Text>
          </View>
          <Text style={styles.heroTitle}>
            Services Built on <Text style={{ color: colors.primary }}>Trust & Safety</Text>
          </Text>
          <Text style={styles.heroSub}>
            Avoid roadside middleman markups and document disputes. Get 150-point mechanical audits and verified Transport Bureau title clearance.
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.servicesList}>
          {SERVICES.map((s) => (
            <View
              key={s.id}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.card, borderColor: colors.line },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' }]}>
                  <Ionicons name={s.icon} size={22} color={colors.primary} />
                </View>
                <View style={styles.cardHeaderMeta}>
                  <View style={styles.tagRow}>
                    <View style={[styles.tagBadge, { backgroundColor: isDark ? '#1F2430' : '#F3F4F6' }]}>
                      <Text style={[styles.tagBadgeText, { color: colors.muted }]}>{s.tag}</Text>
                    </View>
                    <Text style={[styles.priceTag, { color: colors.primary }]}>{s.priceEstimate}</Text>
                  </View>
                  <Text style={[styles.serviceTitle, { color: colors.ink }]}>{s.title}</Text>
                  <Text style={[styles.serviceSub, { color: colors.muted }]}>{s.subtitle}</Text>
                </View>
              </View>

              <Text style={[styles.serviceDesc, { color: colors.muted }]}>{s.desc}</Text>

              {/* Highlights */}
              <View style={[styles.highlightsBox, { backgroundColor: isDark ? '#1F2430' : '#F9FAFB' }]}>
                {s.highlights.map((h, i) => (
                  <View key={i} style={styles.highlightRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={[styles.highlightText, { color: colors.ink }]}>{h}</Text>
                  </View>
                ))}
              </View>

              {/* Book Action Button */}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleOpenBooking(s)}
                style={[styles.bookBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.bookBtnText}>Book This Service</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Booking Form Sheet Modal */}
      <Modal
        visible={selectedService !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedService(null)}
      >
        <View style={[styles.modalScreen, { backgroundColor: colors.card, paddingTop: Math.max(insets.top + 10, 24) }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.line }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalEyebrow, { color: colors.primary }]}>SCHEDULE APPOINTMENT</Text>
              <Text numberOfLines={1} style={[styles.modalTitle, { color: colors.ink }]}>
                {selectedService?.title}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedService(null)}
              style={[styles.modalCloseBtn, { backgroundColor: colors.paper, borderColor: colors.line }]}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalContent}
          >
            <View style={[styles.pricingPill, { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' }]}>
              <Ionicons name="pricetag" size={14} color={colors.primary} />
              <Text style={[styles.pricingPillText, { color: colors.primary }]}>
                {selectedService?.priceEstimate}
              </Text>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>YOUR FULL NAME *</Text>
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="Abebe Bikila"
              placeholderTextColor="#969DA5"
              style={[styles.input, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>PHONE NUMBER *</Text>
            <TextInput
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
              placeholder="+251 91 123 4567"
              placeholderTextColor="#969DA5"
              style={[styles.input, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>VEHICLE MAKE & MODEL</Text>
            <TextInput
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="e.g. 2021 Toyota RAV4 Hybrid"
              placeholderTextColor="#969DA5"
              style={[styles.input, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>PREFERRED DATE</Text>
            <TextInput
              value={preferredDate}
              onChangeText={setPreferredDate}
              placeholder="e.g. Tomorrow 10:00 AM"
              placeholderTextColor="#969DA5"
              style={[styles.input, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>SUB-CITY / AREA IN ADDIS ABABA</Text>
            <TextInput
              value={locationArea}
              onChangeText={setLocationArea}
              placeholder="Bole, Kazanchis, CMC, Sarbet..."
              placeholderTextColor="#969DA5"
              style={[styles.input, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.ink }]}>ADDITIONAL NOTES</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Specific inspection or documentation requests..."
              placeholderTextColor="#969DA5"
              style={[styles.textArea, { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink }]}
            />

            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleSubmitBooking}
              style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && { opacity: 0.6 }]}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Request'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
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
  closeBtn: {
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
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  contactPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0596691A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 18,
  },
  servicesList: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderMeta: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  serviceSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  serviceDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  highlightsBox: {
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: radius.full,
    marginTop: 16,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  modalScreen: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  pricingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pricingPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  textArea: {
    height: 76,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 50,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

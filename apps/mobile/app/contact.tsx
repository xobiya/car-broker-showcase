import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
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
import { useSession } from '../src/features/auth/SessionContext';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { request } from '../src/services/api-client';
import { radius } from '../src/theme/tokens';

const TOPICS = [
  'Vehicle Inquiry',
  'Test Drive Booking',
  'Sell / List My Car',
  'Inspection Verification',
  'Broker Partnership',
  'General Support',
] as const;

type Topic = (typeof TOPICS)[number];

const FAQS = [
  {
    q: 'How does the physical vehicle verification process work?',
    a: 'Every listed car is inspected on-site in Addis Ababa by certified auto mechanics. We evaluate 150 points covering the powertrain, chassis, transmission, brakes, and electrical systems, along with verifying genuine Libre ownership documentation.',
  },
  {
    q: 'How are broker commission rates capped and disclosed?',
    a: 'All accredited brokers on Arif Auto strictly adhere to a transparent, capped 1.5% commission rate. The exact brokerage fee is itemized before closing negotiations, eliminating unexpected middleman markups.',
  },
  {
    q: 'How can I schedule an in-person test drive?',
    a: 'You can submit an inquiry through any vehicle listing card or use this contact form. Our concierge coordinates a safe, supervised viewing appointment with the assigned verified broker.',
  },
  {
    q: 'How long does listing approval take for sellers and brokers?',
    a: 'Document verification and Libre validation are typically completed within 4 to 12 business hours. If an on-site physical inspection is scheduled, the full certified report is published within 24 hours.',
  },
];

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [topic, setTopic] = useState<Topic>('Vehicle Inquiry');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '+251 9');
  const [email, setEmail] = useState(user?.email ?? '');
  const [vehicleRef, setVehicleRef] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCall = () => {
    Linking.openURL('tel:+251911234567').catch(() => {
      Alert.alert('Phone Call', 'Call our concierge team at +251 91 123 4567');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@arifauto.et').catch(() => {
      Alert.alert('Email', 'Email our support desk at support@arifauto.et');
    });
  };

  const handleDirections = () => {
    const address = 'Bole Medhanialem, Edna Mall Commercial Center, Addis Ababa, Ethiopia';
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });
    Linking.openURL(url).catch(() => {
      Alert.alert('Address', address);
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return Alert.alert('Name Required', 'Please enter your full name.');
    }
    if (!phone.trim() && !email.trim()) {
      return Alert.alert(
        'Contact Required',
        'Please enter either your phone number or email address.',
      );
    }
    if (!message.trim()) {
      return Alert.alert(
        'Message Required',
        'Please enter your message or inquiry details.',
      );
    }

    setSubmitting(true);
    try {
      await request('/api/contact', {
        method: 'POST',
        json: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          topic,
          vehicleRef: vehicleRef.trim(),
          message: message.trim(),
        },
      });

      Alert.alert(
        'Inquiry Submitted',
        t(
          'contact.success',
          'Your inquiry has been submitted! Our Addis Ababa concierge team will contact you within 2 business hours.',
        ),
        [{ text: 'Great' }],
      );

      setMessage('');
      setVehicleRef('');
    } catch (e) {
      Alert.alert(
        'Submission Error',
        e instanceof Error
          ? e.message
          : 'Could not send inquiry. Please try calling our direct phone number.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.line,
            paddingTop: Math.max(insets.top + 8, 48),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.line }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.ink }]}>
          {t('contact.title', 'Contact Us')}
        </Text>
        <QuickHeaderSwitcher />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
      >
        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="business" size={13} color={colors.primary} />
            <Text style={styles.heroBadgeText}>ADDIS ABABA HEADQUARTERS</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.ink }]}>
            {t('contact.title', 'Contact Us')}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            {t(
              'contact.subtitle',
              'Reach our Addis Ababa headquarters, schedule certified inspections, or submit an inquiry.',
            )}
          </Text>
        </View>

        {/* Quick Contact Cards */}
        <View style={styles.quickContactsRow}>
          {/* Phone Hotline */}
          <Pressable
            accessibilityRole="button"
            onPress={handleCall}
            style={[
              styles.quickCard,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={[styles.quickCardIconWrap, { backgroundColor: '#FFF2EB' }]}>
              <Ionicons name="call" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickCardTitle, { color: colors.ink }]}>Phone Hotline</Text>
            <Text style={styles.quickCardVal}>+251 91 123 4567</Text>
            <Text style={styles.quickCardAction}>Tap to call &rsaquo;</Text>
          </Pressable>

          {/* Email Concierge */}
          <Pressable
            accessibilityRole="button"
            onPress={handleEmail}
            style={[
              styles.quickCard,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={[styles.quickCardIconWrap, { backgroundColor: '#EBF5FF' }]}>
              <Ionicons name="mail" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.quickCardTitle, { color: colors.ink }]}>Support Email</Text>
            <Text style={styles.quickCardVal}>support@arifauto.et</Text>
            <Text style={[styles.quickCardAction, { color: '#2563EB' }]}>
              Tap to email &rsaquo;
            </Text>
          </Pressable>
        </View>

        {/* Showroom & Office Info Card */}
        <Pressable
          accessibilityRole="button"
          onPress={handleDirections}
          style={[
            styles.officeCard,
            { backgroundColor: colors.white, borderColor: colors.line },
          ]}
        >
          <View style={styles.officeHeadRow}>
            <View style={styles.officeIconCircle}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.officeTextCol}>
              <Text style={[styles.officeName, { color: colors.ink }]}>
                Showroom & Broker Office
              </Text>
              <Text style={[styles.officeAddr, { color: colors.muted }]}>
                {t(
                  'contact.address',
                  'Bole Medhanialem, Edna Mall Commercial Center, 3rd Floor, Addis Ababa, Ethiopia',
                )}
              </Text>
            </View>
          </View>

          <View style={[styles.officeDivider, { backgroundColor: colors.line }]} />

          <View style={styles.officeHoursRow}>
            <Ionicons name="time-outline" size={16} color={colors.muted} />
            <Text style={[styles.officeHoursText, { color: colors.muted }]}>
              {t(
                'contact.hours',
                'Mon – Sat: 8:30 AM – 6:30 PM | Sun: 9:00 AM – 1:00 PM',
              )}
            </Text>
          </View>
        </Pressable>

        {/* Interactive Inquiry Form */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.white, borderColor: colors.line },
          ]}
        >
          <Text style={[styles.formHeading, { color: colors.ink }]}>
            Send an Inquiry or Book Inspection
          </Text>
          <Text style={[styles.formSub, { color: colors.muted }]}>
            Our verified automotive team will review your request and respond promptly.
          </Text>

          {/* Topic Selector Chips */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>
            {t('contact.topic', 'Select Inquiry Topic')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicScroll}
          >
            {TOPICS.map((item) => {
              const active = topic === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setTopic(item)}
                  style={[
                    styles.topicChip,
                    {
                      backgroundColor: active ? colors.primary : isDark ? '#232733' : '#F3F4F6',
                      borderColor: active ? colors.primary : colors.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      { color: active ? '#FFFFFF' : colors.muted },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Full Name */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>FULL NAME *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('contact.namePlaceholder', 'Your Full Name *')}
            placeholderTextColor="#9EA3AE"
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#232733' : '#F8F9FA',
                borderColor: colors.line,
                color: colors.ink,
              },
            ]}
          />

          {/* Phone */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>
            PHONE NUMBER (+251...) *
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={t('contact.phonePlaceholder', 'Phone Number (+251...) *')}
            placeholderTextColor="#9EA3AE"
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#232733' : '#F8F9FA',
                borderColor: colors.line,
                color: colors.ink,
              },
            ]}
          />

          {/* Email */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>
            EMAIL ADDRESS (OPTIONAL)
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t('contact.emailPlaceholder', 'Email Address (optional)')}
            placeholderTextColor="#9EA3AE"
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#232733' : '#F8F9FA',
                borderColor: colors.line,
                color: colors.ink,
              },
            ]}
          />

          {/* Vehicle Reference ID or Model */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>
            VEHICLE REFERENCE / MODEL (OPTIONAL)
          </Text>
          <TextInput
            value={vehicleRef}
            onChangeText={setVehicleRef}
            placeholder={t(
              'contact.vehicleRefPlaceholder',
              'Vehicle Model / ID (e.g. Toyota RAV4)',
            )}
            placeholderTextColor="#9EA3AE"
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#232733' : '#F8F9FA',
                borderColor: colors.line,
                color: colors.ink,
              },
            ]}
          />

          {/* Message */}
          <Text style={[styles.inputLabel, { color: colors.ink }]}>MESSAGE *</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            placeholder={t(
              'contact.messagePlaceholder',
              'Describe your request, viewing date, or question...',
            )}
            placeholderTextColor="#9EA3AE"
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? '#232733' : '#F8F9FA',
                borderColor: colors.line,
                color: colors.ink,
              },
            ]}
          />

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={handleSubmit}
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="paper-plane" size={17} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {submitting ? 'Submitting…' : t('action.submit', 'Submit Inquiry')}
            </Text>
          </Pressable>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqSectionHeading, { color: colors.ink }]}>
            Frequently Asked Questions
          </Text>

          <View
            style={[
              styles.faqContainer,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.faqItem,
                    index !== FAQS.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.line,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setExpandedFaq(isExpanded ? null : index)}
                    style={styles.faqQuestionRow}
                  >
                    <Text style={[styles.faqQuestion, { color: colors.ink }]}>
                      {faq.q}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                  {isExpanded && (
                    <Text style={[styles.faqAnswer, { color: colors.muted }]}>
                      {faq.a}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  navPlaceholder: {
    width: 38,
  },
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    marginBottom: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 80, 3, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5003',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  quickContactsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.medium,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickCardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickCardVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#878E99',
    marginBottom: 6,
  },
  quickCardAction: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5003',
  },
  officeCard: {
    padding: 16,
    borderRadius: radius.large,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  officeHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  officeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officeTextCol: {
    flex: 1,
  },
  officeName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  officeAddr: {
    fontSize: 12,
    lineHeight: 17,
  },
  officeDivider: {
    height: 1,
    marginVertical: 12,
  },
  officeHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  officeHoursText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 18,
    borderRadius: radius.large,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  topicScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  topicChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    height: 46,
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  textArea: {
    minHeight: 90,
    borderRadius: radius.medium,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.full,
    shadowColor: '#FF5003',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  faqSection: {
    marginBottom: 20,
  },
  faqSectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  faqContainer: {
    borderRadius: radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 14,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});

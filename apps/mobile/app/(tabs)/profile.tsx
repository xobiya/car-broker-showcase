import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../src/features/auth/SessionContext';
import { useTheme, type ThemeMode } from '../../src/theme/ThemeContext';
import { useLanguage, type Locale, localeMetadata } from '../../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { AppLogo } from '../../src/components/common/AppLogo';
import { radius } from '../../src/theme/tokens';

export default function SettingsProfileScreen() {
  const { user, signOut } = useSession();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  const [signingOut, setSigningOut] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleSignOut = () =>
    Alert.alert('Sign out of Arif Auto?', 'You can sign back in at any time.', [
      { text: 'Stay signed in', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
            router.replace('/login');
          } catch (e) {
            Alert.alert(
              'Could not sign out',
              e instanceof Error ? e.message : 'Please try again.',
            );
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);

  const currentThemeLabel =
    themeMode === 'system'
      ? t('theme.system', 'System Default')
      : themeMode === 'light'
      ? t('theme.light', 'Light Mode')
      : t('theme.dark', 'Dark Mode');

  const currentLanguageLabel = `${localeMetadata[locale].nativeName} ${localeMetadata[locale].flag}`;

  // Shared Modals (Theme & Language Selection)
  const renderModals = () => (
    <>
      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setThemeModalVisible(false)}
        >
          <View
            style={[
              styles.pickerModalCard,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.ink }]}>
                  {t('profile.theme', 'Theme Mode')}
                </Text>
              </View>
              <Pressable
                onPress={() => setThemeModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.modalOptionsList}>
              {[
                { id: 'system' as ThemeMode, label: t('theme.system', 'System Default'), icon: 'phone-portrait-outline' },
                { id: 'light' as ThemeMode, label: t('theme.light', 'Light Mode'), icon: 'sunny-outline' },
                { id: 'dark' as ThemeMode, label: t('theme.dark', 'Dark Mode'), icon: 'moon-outline' },
              ].map((opt) => {
                const isSelected = themeMode === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    onPress={async () => {
                      await setThemeMode(opt.id);
                      setThemeModalVisible(false);
                    }}
                    style={[
                      styles.modalOptionRow,
                      { borderColor: isSelected ? colors.primary : colors.line },
                      isSelected && { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' },
                    ]}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Ionicons
                        name={opt.icon as any}
                        size={20}
                        color={isSelected ? colors.primary : colors.muted}
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          { color: isSelected ? colors.primary : colors.ink },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View
            style={[
              styles.pickerModalCard,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="globe-outline" size={22} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.ink }]}>
                  {t('profile.language', 'Language')}
                </Text>
              </View>
              <Pressable
                onPress={() => setLanguageModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.modalOptionsList}>
              {(['en', 'am', 'om'] as const).map((code) => {
                const meta = localeMetadata[code];
                const isSelected = locale === code;
                return (
                  <Pressable
                    key={code}
                    accessibilityRole="button"
                    onPress={async () => {
                      await setLocale(code);
                      setLanguageModalVisible(false);
                    }}
                    style={[
                      styles.modalOptionRow,
                      { borderColor: isSelected ? colors.primary : colors.line },
                      isSelected && { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' },
                    ]}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Text style={styles.flagIcon}>{meta.flag}</Text>
                      <View>
                        <Text
                          style={[
                            styles.modalOptionText,
                            { color: isSelected ? colors.primary : colors.ink },
                          ]}
                        >
                          {meta.nativeName}
                        </Text>
                        <Text style={[styles.modalOptionSub, { color: colors.muted }]}>
                          {meta.name}
                        </Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );

  // For GUEST users: Clean, focused authentication prompt
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.paper }]}>
        <View
          style={[
            styles.navBar,
            { backgroundColor: colors.white, borderBottomColor: colors.line },
          ]}
        >
          <AppLogo size="sm" />

          <QuickHeaderSwitcher />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guestScrollContent}
        >
          <View
            style={[
              styles.guestCard,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={{ marginBottom: 16 }}>
              <AppLogo size="lg" iconOnly />
            </View>

            <Text style={[styles.guestTitle, { color: colors.ink }]}>
              {t('profile.guestTitle', 'Welcome to Arif Auto')}
            </Text>
            <Text style={[styles.guestSubtitle, { color: colors.muted }]}>
              {t(
                'profile.guestSubtitle',
                'Sign in or create an account to post vehicles, schedule test drives, and access verified title escrow.',
              )}
            </Text>

            <View style={styles.guestActionsWrap}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/login?tab=signin')}
                style={[styles.guestPrimaryBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="log-in-outline" size={19} color="#FFFFFF" />
                <Text style={styles.guestPrimaryBtnText}>
                  {t('action.signIn', 'Sign In')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/login?tab=signup')}
                style={[
                  styles.guestSecondaryBtn,
                  {
                    backgroundColor: isDark ? '#2C1B14' : '#FFF2EB',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons name="person-add-outline" size={19} color={colors.primary} />
                <Text style={[styles.guestSecondaryBtnText, { color: colors.primary }]}>
                  {t('action.signUp', 'Create Account / Sign Up')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.guestFooterLinks}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/services')}
                style={styles.guestSubLink}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
                <Text style={[styles.guestSubLinkText, { color: colors.primary }]}>
                  Inspection & Title Services
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/contact')}
                style={styles.guestSubLink}
              >
                <Ionicons name="call-outline" size={14} color={colors.primary} />
                <Text style={[styles.guestSubLinkText, { color: colors.primary }]}>
                  Contact Showroom
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {renderModals()}
      </View>
    );
  }

  // For AUTHENTICATED users: Clean, elegant profile & focused settings
  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: colors.white, borderBottomColor: colors.line },
        ]}
      >
        <Text style={[styles.navTitle, { color: colors.ink }]}>
          {t('profile.title', 'Profile & Settings')}
        </Text>

        <QuickHeaderSwitcher />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact, Modern User Identity Header Card (No Giant Image) */}
        <View style={styles.headerSectionWrap}>
          <View
            style={[
              styles.userCardCompact,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <View style={styles.userCardLeft}>
              <View
                style={[
                  styles.userAvatarIconWrap,
                  { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB' },
                ]}
              >
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>

              <View style={styles.userInfoTextCol}>
                <View style={styles.userNameBadgeRow}>
                  <Text style={[styles.userNameText, { color: colors.ink }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <View
                    style={[
                      styles.rolePill,
                      { backgroundColor: isDark ? '#2C1B14' : '#FFF2EB', borderColor: colors.line },
                    ]}
                  >
                    <Text style={[styles.rolePillText, { color: colors.primary }]}>
                      {(user.role || 'MEMBER').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.userEmailText, { color: colors.muted }]} numberOfLines={1}>
                  {user.email}
                </Text>
                {user.phone ? (
                  <Text style={[styles.userPhoneText, { color: colors.muted }]} numberOfLines={1}>
                    {user.phone}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              onPress={() => router.push('/settings')}
              style={[
                styles.editBtnCompact,
                { backgroundColor: isDark ? '#232733' : '#F4F5F8', borderColor: colors.line },
              ]}
            >
              <Ionicons name="create-outline" size={15} color={colors.ink} />
              <Text style={[styles.editBtnText, { color: colors.ink }]}>
                {t('action.edit', 'Edit')}
              </Text>
            </Pressable>
          </View>

          {/* Dedicated Sell Vehicle Action Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sell Your Vehicle"
            onPress={() => router.push('/listing-form')}
            style={[styles.sellVehiclePrimaryBtn, { backgroundColor: colors.primary }]}
          >
            <View style={styles.sellVehicleBtnLeft}>
              <View style={styles.sellVehicleIconCircle}>
                <Ionicons name="car-sport" size={19} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sellVehicleBtnTitle}>
                  {t('action.postVehicle', '+ Sell Your Vehicle')}
                </Text>
                <Text style={styles.sellVehicleBtnSubtitle}>
                  List with verified Libre & connect with buyers in Ethiopia
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Section 1: Services & Activity */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeader, { color: colors.muted }]}>
            {t('profile.accountActivity', 'MARKETPLACE & ACTIVITY')}
          </Text>

          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            <MenuItem
              icon="time-outline"
              title={t('profile.orderHistory', 'Order & Inspection Tracking')}
              subtitle="Real-time delivery status and inspection reports"
              onPress={() => router.push('/track')}
            />
            <MenuItem
              icon="car-sport-outline"
              title={t('profile.myGarage', 'Manage Listings & Garage')}
              subtitle="View active inventory, buyer leads & post cars"
              onPress={() => router.push('/(tabs)/sell')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Inspection & Escrow Services"
              subtitle="150-Point physical audit, Libre verification, escrow"
              onPress={() => router.push('/services')}
              isLast
            />
          </View>
        </View>

        {/* Section 2: Preferences & Support */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionHeader, { color: colors.muted }]}>
            {t('profile.generalSettings', 'PREFERENCES & SUPPORT')}
          </Text>

          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.white, borderColor: colors.line },
            ]}
          >
            {/* Theme Selector */}
            <MenuItem
              icon="color-palette-outline"
              title={t('profile.theme', 'Theme Mode')}
              subtitle={currentThemeLabel}
              onPress={() => setThemeModalVisible(true)}
            />

            {/* Language Selector */}
            <MenuItem
              icon="globe-outline"
              title={t('profile.language', 'Language')}
              subtitle={currentLanguageLabel}
              onPress={() => setLanguageModalVisible(true)}
            />

            {/* Contact Support */}
            <MenuItem
              icon="call-outline"
              title={t('profile.contactUs', 'Contact Showroom & Support')}
              subtitle="Edna Mall 3rd Floor, Bole, Addis Ababa"
              onPress={() => router.push('/contact')}
            />

            {/* Sign Out */}
            <MenuItem
              icon="log-out-outline"
              title={signingOut ? 'Signing out…' : t('action.signOut', 'Sign Out')}
              subtitle="Sign out from this device"
              onPress={handleSignOut}
              danger
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {renderModals()}
    </View>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  isLast,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
  danger?: boolean;
}) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.menuItemRow,
        isLast && styles.menuItemRowLast,
        { borderBottomColor: isDark ? '#232733' : '#F4F5F8' },
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuItemIconCircle,
            { backgroundColor: isDark ? '#232733' : '#F3F4F6' },
            danger && styles.menuItemIconCircleDanger,
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={danger ? colors.red : colors.ink}
          />
        </View>
        <View style={styles.menuItemTextCol}>
          <Text
            style={[
              styles.menuItemTitle,
              { color: colors.ink },
              danger && styles.menuItemTitleDanger,
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.menuItemSubtitle, { color: colors.muted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={17}
        color={danger ? colors.red : '#C4C8D0'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Authenticated User Identity Card (Clean, modern, no giant avatar)
  headerSectionWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userCardCompact: {
    borderRadius: radius.large,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  userAvatarIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE2D1',
  },
  userInfoTextCol: {
    flex: 1,
  },
  userNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  userEmailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userPhoneText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  editBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sellVehiclePrimaryBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.large,
    shadowColor: '#FF5003',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sellVehicleBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellVehicleIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellVehicleBtnTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sellVehicleBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },

  // Section & Menu Groups
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuGroup: {
    borderRadius: radius.large,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemRowLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  menuItemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIconCircleDanger: {
    backgroundColor: '#FDECEB',
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  menuItemTitleDanger: {
    color: '#FF4D4F',
    fontWeight: '700',
  },

  // Guest Specific Styles
  guestScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 110,
    justifyContent: 'center',
  },
  guestCard: {
    borderRadius: radius.large,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guestIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE2D1',
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  guestActionsWrap: {
    width: '100%',
    gap: 10,
  },
  guestPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.full,
    shadowColor: '#FF5003',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  guestPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  guestSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  guestFooterLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 18,
  },
  guestSubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  guestSubLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.large,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalOptionsList: {
    gap: 10,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.medium,
    borderWidth: 1.5,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOptionSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  flagIcon: {
    fontSize: 22,
  },
});

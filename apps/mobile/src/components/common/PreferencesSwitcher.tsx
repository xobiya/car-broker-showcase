import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeMode } from '../../theme/ThemeContext';
import { useLanguage, type Locale, localeMetadata } from '../../i18n/LanguageContext';
import { radius } from '../../theme/tokens';

export function PreferencesCard() {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  const themes: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'light', label: t('theme.light', 'Light'), icon: 'sunny-outline' },
    { id: 'dark', label: t('theme.dark', 'Dark'), icon: 'moon-outline' },
    { id: 'system', label: t('theme.system', 'Auto'), icon: 'phone-portrait-outline' },
  ];

  const langs: { id: Locale; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'am', label: 'አማርኛ', flag: '🇪🇹' },
    { id: 'om', label: 'Oromoo', flag: '🇪🇹' },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.line,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="options-outline" size={18} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.ink }]}>
          {t('profile.prefTitle', 'Appearance & Language')}
        </Text>
      </View>

      {/* Theme Segmented Switcher */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>
          {t('profile.theme', 'Theme Mode')}
        </Text>
        <View
          style={[
            styles.segmentBar,
            { backgroundColor: isDark ? '#1F2430' : '#F4F5F8', borderColor: colors.line },
          ]}
        >
          {themes.map((item) => {
            const active = themeMode === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => void setThemeMode(item.id)}
                style={[
                  styles.segmentItem,
                  active && [
                    styles.segmentItemActive,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ],
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={active ? '#FFFFFF' : colors.muted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? '#FFFFFF' : colors.muted },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Language Segmented Switcher */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>
          {t('profile.language', 'Language')}
        </Text>
        <View
          style={[
            styles.segmentBar,
            { backgroundColor: isDark ? '#1F2430' : '#F4F5F8', borderColor: colors.line },
          ]}
        >
          {langs.map((item) => {
            const active = locale === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => void setLocale(item.id)}
                style={[
                  styles.segmentItem,
                  active && [
                    styles.segmentItemActive,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ],
                ]}
              >
                <Text style={styles.flagText}>{item.flag}</Text>
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? '#FFFFFF' : colors.muted },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function QuickHeaderSwitcher() {
  const { themeMode, activeTheme, setThemeMode, colors, isDark } = useTheme();
  const { locale, setLocale, locales } = useLanguage();

  const cycleTheme = () => {
    // Toggles between light and dark
    const nextTheme: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    void setThemeMode(nextTheme);
  };

  const cycleLanguage = () => {
    const currentIndex = locales.indexOf(locale);
    const nextLocale = locales[(currentIndex + 1) % locales.length];
    void setLocale(nextLocale);
  };

  return (
    <View
      style={[
        styles.quickTwinBar,
        { backgroundColor: colors.white, borderColor: colors.line },
      ]}
    >
      {/* Theme Toggle Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Toggle light or dark theme"
        onPress={cycleTheme}
        style={styles.quickTwinBtn}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={16}
          color={isDark ? '#FBBF24' : '#FF5003'}
        />
      </Pressable>

      <View style={[styles.quickDivider, { backgroundColor: colors.line }]} />

      {/* Language Toggle Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch language"
        onPress={cycleLanguage}
        style={styles.quickTwinBtn}
      >
        <Text style={styles.quickFlag}>{localeMetadata[locale].flag}</Text>
        <Text style={[styles.quickLangCode, { color: colors.ink }]}>
          {localeMetadata[locale].shortLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionWrap: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  segmentBar: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.full,
  },
  segmentItemActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  flagText: {
    fontSize: 13,
  },
  // Quick Twin Header Switcher
  quickTwinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickTwinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  quickDivider: {
    width: 1,
    height: 16,
  },
  quickFlag: {
    fontSize: 13,
  },
  quickLangCode: {
    fontSize: 11,
    fontWeight: '800',
  },
});

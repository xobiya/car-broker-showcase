import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { radius } from '../../theme/tokens';

const categoryDefs = [
  { key: 'home.allCars', label: 'All Cars', icon: 'apps-outline', param: 'All' },
  { key: 'home.suvs', label: 'SUVs', icon: 'car-sport-outline', param: 'SUV' },
  { key: 'home.sedans', label: 'Sedans', icon: 'car-outline', param: 'Sedan' },
  { key: 'home.luxury', label: 'Luxury', icon: 'diamond-outline', param: 'Luxury' },
  { key: 'home.electric', label: 'Electric', icon: 'flash-outline', param: 'Electric' },
  { key: 'Pickup', label: 'Pickup', icon: 'construct-outline', param: 'Pickup' },
  { key: 'Trucks', label: 'Trucks', icon: 'bus-outline', param: 'Truck' },
] as const;

type VehicleCategoriesProps = {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
};

export function VehicleCategories({
  activeCategory = 'All Cars',
  onSelectCategory,
}: VehicleCategoriesProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const handlePress = (label: string, param: string) => {
    if (onSelectCategory) {
      onSelectCategory(label);
    } else {
      router.push({
        pathname: '/(tabs)/search',
        params: param === 'All' ? {} : { bodyType: param },
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.ink }]}>
          {t('home.categories', 'Categories')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={[styles.seeAll, { color: colors.muted }]}>
            {t('home.viewAll', 'See all')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {categoryDefs.map((category) => {
          const isActive = activeCategory === category.label;
          const displayLabel = t(category.key, category.label);
          return (
            <Pressable
              key={category.label}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${displayLabel} vehicles`}
              accessibilityState={{ selected: isActive }}
              onPress={() => handlePress(category.label, category.param)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.line,
                },
                isActive && styles.pillActive,
              ]}
            >
              <Ionicons
                name={category.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={isActive ? '#FFFFFF' : isDark ? '#9CA3AF' : '#4B5563'}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? '#FFFFFF' : colors.muted },
                  isActive && styles.pillTextActive,
                ]}
              >
                {displayLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pillActive: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    fontWeight: '800',
  },
});

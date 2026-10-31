import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { SearchListSkeleton } from '../../src/components/common/Skeleton';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { useVehicles } from '../../src/features/vehicles/vehicle-queries';
import { useSession } from '../../src/features/auth/SessionContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { colors, radius } from '../../src/theme/tokens';
import type { Vehicle, VehicleFilters } from '../../src/types/models';

const PAGE_SIZE = 20;

const categories: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'All Cars', icon: 'car-sport-outline' },
  { label: 'SUVs', icon: 'shield-checkmark-outline' },
  { label: 'Sedans', icon: 'car-outline' },
  { label: 'Electric', icon: 'flash-outline' },
  { label: 'Luxury', icon: 'diamond-outline' },
  { label: 'Pickups', icon: 'construct-outline' },
  { label: 'Hatchback', icon: 'speedometer-outline' },
];

const sorts = [
  { label: 'Newest', value: 'newest', icon: 'flash-outline' as const },
  { label: 'Price ↑', value: 'price_asc', icon: 'trending-up-outline' as const },
  { label: 'Price ↓', value: 'price_desc', icon: 'trending-down-outline' as const },
  { label: 'Year', value: 'year_desc', icon: 'calendar-outline' as const },
];

const fuels: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'All', icon: 'apps-outline' },
  { label: 'Petrol', icon: 'flame-outline' },
  { label: 'Diesel', icon: 'water-outline' },
  { label: 'Hybrid', icon: 'leaf-outline' },
  { label: 'Electric', icon: 'flash-outline' },
];

const conditions: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'All', icon: 'layers-outline' },
  { label: 'New', icon: 'sparkles-outline' },
  { label: 'Used', icon: 'time-outline' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Vehicle>>(null);
  const searchInputRef = useRef<TextInput>(null);
  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const routeParams = useLocalSearchParams<{
    search?: string;
    bodyType?: string;
    fuelType?: string;
    brand?: string;
    location?: string;
    priceRange?: string;
    condition?: string;
  }>();

  // Search & filter states
  const [query, setQuery] = useState(routeParams.search || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    routeParams.bodyType || 'All Cars',
  );
  const [brand, setBrand] = useState(routeParams.brand || 'All');
  const [condition, setCondition] = useState(routeParams.condition || 'All');
  const [fuel, setFuel] = useState(routeParams.fuelType || 'All');
  const [sort, setSort] = useState('newest');
  const [location, setLocation] = useState(routeParams.location || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (routeParams.search !== undefined) setQuery(routeParams.search);
    if (routeParams.bodyType !== undefined)
      setActiveCategory(routeParams.bodyType);
    if (routeParams.fuelType !== undefined) setFuel(routeParams.fuelType);
    if (routeParams.brand !== undefined) setBrand(routeParams.brand);
    if (routeParams.location !== undefined) setLocation(routeParams.location);
    if (routeParams.condition !== undefined)
      setCondition(routeParams.condition);
  }, [
    routeParams.search,
    routeParams.bodyType,
    routeParams.fuelType,
    routeParams.brand,
    routeParams.location,
    routeParams.condition,
  ]);

  // Query vehicles from service
  const vehiclesQuery = useVehicles({ limit: 60 });
  const allVehicles = vehiclesQuery.data ?? [];

  // Filter & search logic
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle) => {
      // Status check
      if (
        vehicle.status &&
        vehicle.status !== 'approved' &&
        vehicle.status !== 'sold'
      ) {
        return false;
      }

      // Query search
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        const brandMatch = vehicle.brand.toLowerCase().includes(q);
        const modelMatch = vehicle.model.toLowerCase().includes(q);
        const locMatch = (vehicle.location || '').toLowerCase().includes(q);
        if (!brandMatch && !modelMatch && !locMatch) return false;
      }

      // Category check
      if (activeCategory !== 'All Cars') {
        const body = (vehicle.bodyType || '').toLowerCase();
        const fuelType = (vehicle.fuelType || '').toLowerCase();
        const brandName = (vehicle.brand || '').toLowerCase();

        if (activeCategory === 'SUVs') {
          if (!body.includes('suv') && !body.includes('crossover')) return false;
        } else if (activeCategory === 'Sedans') {
          if (!body.includes('sedan') && !body.includes('saloon')) return false;
        } else if (activeCategory === 'Electric') {
          if (!fuelType.includes('electric') && !fuelType.includes('ev'))
            return false;
        } else if (activeCategory === 'Luxury') {
          if (
            (vehicle.price || 0) < 6000000 &&
            !brandName.includes('mercedes') &&
            !brandName.includes('bmw')
          )
            return false;
        } else if (activeCategory === 'Pickups') {
          if (!body.includes('pickup') && !body.includes('truck')) return false;
        } else if (activeCategory === 'Hatchback') {
          if (!body.includes('hatchback')) return false;
        }
      }

      // Fuel filter
      if (fuel !== 'All' && vehicle.fuelType !== fuel) return false;

      // Condition filter
      if (condition !== 'All') {
        if (
          condition === 'New' &&
          vehicle.condition?.toLowerCase() !== 'new'
        )
          return false;
        if (
          condition === 'Used' &&
          vehicle.condition?.toLowerCase() === 'new'
        )
          return false;
      }

      // Location filter
      if (location.trim()) {
        const loc = (vehicle.location || '').toLowerCase();
        if (!loc.includes(location.trim().toLowerCase())) return false;
      }

      // Price filter
      const p = vehicle.price || 0;
      if (minPrice && p < Number(minPrice.replace(/[^\d]/g, ''))) return false;
      if (maxPrice && p > Number(maxPrice.replace(/[^\d]/g, ''))) return false;

      return true;
    });
  }, [
    allVehicles,
    debouncedQuery,
    activeCategory,
    fuel,
    condition,
    location,
    minPrice,
    maxPrice,
  ]);

  // Sort logic
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'year_desc') list.sort((a, b) => b.year - a.year);
    return list;
  }, [filteredVehicles, sort]);

  // Standard Pagination: 20 cars per page
  const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / PAGE_SIZE));
  const currentPageVehicles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedVehicles.slice(start, start + PAGE_SIZE);
  }, [sortedVehicles, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 220 && !showTopBtn) setShowTopBtn(true);
    else if (y <= 220 && showTopBtn) setShowTopBtn(false);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('All Cars');
    setBrand('All');
    setCondition('All');
    setFuel('All');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setFiltersOpen(false);
  };

  const activeFiltersCount =
    (fuel !== 'All' ? 1 : 0) +
    (condition !== 'All' ? 1 : 0) +
    (location.trim() ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const header = (
    <View style={styles.headerContainer}>
      {/* Top Nav Bar with Brand, Quick Switcher, Search, Notifications, Avatar */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavLeft}>
          <Text style={styles.topNavEyebrow}>
            {t('search.eyebrow', 'FIND YOUR MATCH')}
          </Text>
          <Text style={[styles.topNavTitle, { color: colors.ink }]}>
            {t('search.title', 'Search cars')}
          </Text>
        </View>

        <View style={styles.topNavRight}>
          {/* Quick Theme & Language Switcher Pill */}
          <QuickHeaderSwitcher />

          {/* Notification Bell with Orange Dot */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => setNotificationOpen(true)}
            style={[
              styles.topNavIconBtn,
              {
                backgroundColor: colors.white,
                borderColor: colors.line,
              },
            ]}
          >
            <Ionicons name="notifications-outline" size={19} color={colors.ink} />
            <View style={styles.topNavOrangeBadge} />
          </Pressable>

          {/* User Profile Avatar Icon (Default Icon) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="My Profile"
            onPress={() => router.push('/(tabs)/profile')}
            style={[
              styles.topNavAvatarWrap,
              {
                backgroundColor: isDark ? '#2C1B14' : '#FFEFE6',
                borderColor: isDark ? '#FF6A26' : '#FFD9C6',
              },
            ]}
          >
            <Ionicons name="person" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Redesigned Search Bar with Integrated Filter Trigger */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.line,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder', 'Search make, model, Bole, Addis...')}
            placeholderTextColor="#9EA3AE"
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.ink }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          onPress={() => setFiltersOpen(true)}
          style={[
            styles.filterTriggerBtn,
            activeFiltersCount > 0 && styles.filterTriggerBtnActive,
          ]}
        >
          <Ionicons
            name="options"
            size={20}
            color={activeFiltersCount > 0 ? colors.white : colors.ink}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Redesigned Horizontal Category Filter Bar with Representation Icons */}
      <View style={styles.categoryBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <Pressable
                key={cat.label}
                onPress={() => {
                  setActiveCategory(cat.label);
                  setPage(1);
                }}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isActive ? colors.white : colors.ink}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader: Sort Selector with representation icons (NO '20 vehicles page 1 of 1') */}
      <View style={styles.subHeaderRow}>
        <View style={styles.sortHeaderLabelWrap}>
          <Ionicons name="funnel-outline" size={13} color={colors.primary} />
          <Text style={styles.sortHeaderLabel}>Sort & View</Text>
        </View>

        {/* Sort Selector Pills with representation icons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortPillsRow}
        >
          {sorts.map((s) => {
            const isSelected = sort === s.value;
            return (
              <Pressable
                key={s.value}
                onPress={() => setSort(s.value)}
                style={[
                  styles.sortPill,
                  isSelected && styles.sortPillActive,
                ]}
              >
                <Ionicons
                  name={s.icon}
                  size={12}
                  color={isSelected ? colors.white : colors.muted}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    isSelected && styles.sortPillTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  // Pagination Footer Component with Prev and Next navigation between car lists
  const footer = (
    <View style={styles.footerContainer}>
      {totalPages >= 1 && (
        <View style={styles.paginationBar}>
          {/* Previous Button */}
          <Pressable
            disabled={page === 1}
            onPress={() => handlePageChange(page - 1)}
            style={[styles.pageNavBtn, page === 1 && styles.pageNavBtnDisabled]}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={page === 1 ? '#D1D5DB' : colors.ink}
            />
            <Text
              style={[
                styles.pageNavBtnText,
                { color: page === 1 ? '#9CA3AF' : colors.ink },
                page === 1 && styles.pageNavBtnTextDisabled,
              ]}
            >
              {t('search.prev', 'Prev')}
            </Text>
          </Pressable>

          {/* Page Number Pills */}
          <View style={styles.pageNumbersRow}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === page;
              return (
                <Pressable
                  key={`page-${p}`}
                  onPress={() => handlePageChange(p)}
                  style={[
                    styles.pageNumberBtn,
                    { backgroundColor: isCurrent ? colors.primary : isDark ? '#232733' : '#F3F4F6' },
                    isCurrent && styles.pageNumberBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pageNumberText,
                      { color: isCurrent ? '#FFFFFF' : colors.ink },
                      isCurrent && styles.pageNumberTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Next Button */}
          <Pressable
            disabled={page === totalPages}
            onPress={() => handlePageChange(page + 1)}
            style={[
              styles.pageNavBtn,
              { backgroundColor: isDark ? '#232733' : '#F3F4F6' },
              page === totalPages && styles.pageNavBtnDisabled,
            ]}
          >
            <Text
              style={[
                styles.pageNavBtnText,
                { color: page === totalPages ? '#9CA3AF' : colors.ink },
                page === totalPages && styles.pageNavBtnTextDisabled,
              ]}
            >
              {t('search.next', 'Next')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={page === totalPages ? '#9CA3AF' : colors.ink}
            />
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <FlatList
        ref={flatListRef}
        data={currentPageVehicles}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/vehicles/${item.id}`)}
            style={{ flex: 1 }}
          />
        )}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 8, 44),
            paddingBottom: Math.max(insets.bottom + 85, 110),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          vehiclesQuery.isLoading ? (
            <SearchListSkeleton />
          ) : vehiclesQuery.error ? (
            <ErrorState
              message={vehiclesQuery.error.message}
              onRetry={() => void vehiclesQuery.refetch()}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color={colors.muted} />
              <Text style={styles.emptyTitle}>No cars match your criteria</Text>
              <Text style={styles.emptyCopy}>
                Try selecting "All Cars" or clearing your price and fuel
                filters.
              </Text>
              <Pressable onPress={resetFilters} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Clear All Filters</Text>
              </Pressable>
            </View>
          )
        }
      />

      {/* Floating Top Nav Arrow (Scroll to Top Button) */}
      {showTopBtn && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scroll to top"
          onPress={scrollToTop}
          style={[
            styles.scrollToTopBtn,
            { bottom: Math.max(insets.bottom + 80, 96) },
          ]}
        >
          <Ionicons name="arrow-up" size={22} color={colors.white} />
        </Pressable>
      )}

      {/* Advanced Filter Slide-up Modal */}
      <Modal
        visible={filtersOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View style={[styles.filterModal, { paddingTop: Math.max(insets.top + 10, 24) }]}>
          <View style={styles.filterModalHead}>
            <View>
              <Text style={styles.modalEyebrow}>FILTER OPTIONS</Text>
              <Text style={styles.modalTitle}>Refine Your Search</Text>
            </View>
            <Pressable
              onPress={() => setFiltersOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            {/* Fuel Type with representation icons */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeadRow}>
                <Ionicons name="water-outline" size={15} color={colors.primary} />
                <Text style={styles.filterSectionTitle}>Fuel Type</Text>
              </View>
              <View style={styles.filterChipsRow}>
                {fuels.map((f) => (
                  <Pressable
                    key={f.label}
                    onPress={() => setFuel(f.label)}
                    style={[
                      styles.filterChip,
                      fuel === f.label && styles.filterChipActive,
                    ]}
                  >
                    <Ionicons
                      name={f.icon}
                      size={13}
                      color={fuel === f.label ? colors.white : colors.muted}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        fuel === f.label && styles.filterChipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Condition with representation icons */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeadRow}>
                <Ionicons name="shield-outline" size={15} color={colors.primary} />
                <Text style={styles.filterSectionTitle}>Condition</Text>
              </View>
              <View style={styles.filterChipsRow}>
                {conditions.map((c) => (
                  <Pressable
                    key={c.label}
                    onPress={() => setCondition(c.label)}
                    style={[
                      styles.filterChip,
                      condition === c.label && styles.filterChipActive,
                    ]}
                  >
                    <Ionicons
                      name={c.icon}
                      size={13}
                      color={condition === c.label ? colors.white : colors.muted}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        condition === c.label && styles.filterChipTextActive,
                      ]}
                    >
                      {c.label === 'All' ? 'All Conditions' : c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeadRow}>
                <Ionicons name="cash-outline" size={15} color={colors.primary} />
                <Text style={styles.filterSectionTitle}>Price Range (ETB)</Text>
              </View>
              <View style={styles.priceInputsRow}>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="pricetag-outline" size={16} color={colors.muted} />
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    placeholder="Min Price (e.g. 1,000,000)"
                    placeholderTextColor="#9EA3AE"
                    style={styles.priceBox}
                  />
                </View>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="pricetags-outline" size={16} color={colors.muted} />
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    placeholder="Max Price (e.g. 15,000,000)"
                    placeholderTextColor="#9EA3AE"
                    style={styles.priceBox}
                  />
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeadRow}>
                <Ionicons name="location-outline" size={15} color={colors.primary} />
                <Text style={styles.filterSectionTitle}>Location / Sub-city</Text>
              </View>
              <View style={styles.inputWithIcon}>
                <Ionicons name="navigate-outline" size={16} color={colors.muted} />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Bole, Addis Ababa, Hawassa"
                  placeholderTextColor="#9EA3AE"
                  style={styles.locationBox}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActionsRow}>
              <Pressable
                onPress={resetFilters}
                style={styles.modalResetBtn}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setPage(1);
                  setFiltersOpen(false);
                }}
                style={styles.modalApplyBtn}
              >
                <Ionicons name="search" size={16} color={colors.white} />
                <Text style={styles.modalApplyText}>Search</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setNotificationOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setNotificationOpen(false)}
        >
          <View style={styles.notificationCard}>
            <View style={styles.notificationHead}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={styles.notificationTitle}>Notifications</Text>
            </View>
            <Text style={styles.notificationBody}>
              All systems updated! Explore 20+ newly verified listings with genuine Libre documents and certified broker contacts.
            </Text>
            <Pressable
              style={styles.notificationClose}
              onPress={() => setNotificationOpen(false)}
            >
              <Text style={styles.notificationCloseText}>Dismiss</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFC' },
  content: { padding: 16 },
  headerContainer: {
    marginBottom: 14,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 4,
  },
  topNavLeft: {
    gap: 2,
  },
  topNavEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  topNavTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topNavIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topNavOrangeBadge: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  topNavAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEFE6',
    borderWidth: 1.5,
    borderColor: '#FFD9C6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  filterTriggerBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  filterTriggerBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.white,
  },
  categoryBarWrap: {
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  categoryPillTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 12,
  },
  sortHeaderLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.3,
  },
  sortPillsRow: {
    gap: 6,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: '#F3F4F6',
  },
  sortPillActive: {
    backgroundColor: colors.ink,
  },
  sortPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
  },
  sortPillTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  gridRow: {
    gap: 12,
    alignItems: 'stretch',
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: '#F3F4F6',
  },
  pageNavBtnDisabled: {
    opacity: 0.4,
  },
  pageNavBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  pageNavBtnTextDisabled: {
    color: '#9EA3AE',
  },
  pageNumbersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pageNumberBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  pageNumberBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  pageNumberTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  footerCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  scrollToTopBtn: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  empty: {
    marginTop: 30,
    alignItems: 'center',
    padding: 28,
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  resetBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 20,
  },
  filterModalHead: {
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
  modalScroll: {
    paddingVertical: 18,
    gap: 18,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterSectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  priceInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.medium,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    gap: 8,
  },
  priceBox: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  locationBox: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingBottom: 30,
  },
  modalResetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResetText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  modalApplyBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalApplyText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notificationCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.large,
    padding: 22,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  notificationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  notificationBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  notificationClose: {
    marginTop: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  notificationCloseText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});

import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
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
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import { VehicleCategories } from '../../src/components/vehicles/VehicleCategories';
import { QuickHeaderSwitcher } from '../../src/components/common/PreferencesSwitcher';
import { AppLogo } from '../../src/components/common/AppLogo';
import { ShowroomHomeSkeleton } from '../../src/components/common/Skeleton';
import { useVehicles } from '../../src/features/vehicles/vehicle-queries';
import { useSession } from '../../src/features/auth/SessionContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { colors, radius } from '../../src/theme/tokens';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const heroScrollRef = useRef<ScrollView>(null);
  const bannerWidth = Math.max(width - 40, 280);

  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Cars');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'new' | 'used'>('all');

  const vehicles = useVehicles({ limit: 12, sort: 'newest' });

  // Automated Horizontal Scroll Animation for Hero Promo Carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % 3;
        heroScrollRef.current?.scrollTo({
          x: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerWidth]);

  const handlePrevBanner = () => {
    const prev = (bannerIndex - 1 + 3) % 3;
    setBannerIndex(prev);
    heroScrollRef.current?.scrollTo({
      x: prev * bannerWidth,
      animated: true,
    });
  };

  const handleNextBanner = () => {
    const next = (bannerIndex + 1) % 3;
    setBannerIndex(next);
    heroScrollRef.current?.scrollTo({
      x: next * bannerWidth,
      animated: true,
    });
  };

  const handleSearch = () => {
    router.push({
      pathname: '/(tabs)/search',
      params: {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(activeCategory !== 'All Cars' ? { bodyType: activeCategory } : {}),
      },
    });
  };

  const publicVehicles = (vehicles.data ?? []).filter(
    (vehicle) =>
      vehicle.status === 'approved' ||
      vehicle.status === 'sold' ||
      !vehicle.status,
  );

  // Filter based on active category
  const filteredVehicles = publicVehicles.filter((vehicle) => {
    if (activeCategory === 'All Cars') return true;
    const body = (vehicle.bodyType || '').toLowerCase();
    const fuel = (vehicle.fuelType || '').toLowerCase();
    const brand = (vehicle.brand || '').toLowerCase();

    if (activeCategory === 'SUVs') return body.includes('suv') || body.includes('crossover');
    if (activeCategory === 'Sedans') return body.includes('sedan') || body.includes('saloon');
    if (activeCategory === 'Luxury') return (vehicle.price || 0) > 6000000 || brand.includes('mercedes') || brand.includes('bmw') || brand.includes('audi');
    if (activeCategory === 'Electric') return fuel.includes('electric') || fuel.includes('ev');
    if (activeCategory === 'Pickup') return body.includes('pickup') || body.includes('truck');
    if (activeCategory === 'Trucks') return body.includes('truck');
    return true;
  });

  const isGuest = !user;
  const userName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 8, 48),
            paddingBottom: Math.max(insets.bottom + 85, 110),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with App Logo, Profile, Quick Theme & Language Switcher, Notifications */}
        <View style={styles.topBrandBar}>
          <AppLogo size="sm" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <QuickHeaderSwitcher />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => setNotificationOpen(true)}
              style={[
                styles.bellButton,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.line,
                },
              ]}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.ink} />
              <View style={styles.bellBadge} />
            </Pressable>
          </View>
        </View>

        <View style={styles.topHeader}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(user ? '/(tabs)/profile' : '/login')}
            style={styles.userProfileRow}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark ? '#2C1B14' : '#FFEFE6',
                  borderColor: isDark ? '#FF6A26' : '#FFD9C6',
                },
              ]}
            >
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.greeting, { color: colors.ink }]}>
                {isGuest ? t('home.guestGreeting', 'Hello Guest') : `${t('home.greeting', 'Hello')} ${userName}`}
              </Text>
              <Text style={[styles.welcomeSub, { color: colors.muted }]}>
                {isGuest ? t('home.tapToAuth', 'Tap to Sign In / Sign Up') : t('home.welcomeBack', 'Welcome back')}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Punchy Headline */}
        <View style={styles.headlineWrap}>
          <Text style={[styles.headline, { color: colors.ink }]}>
            {t('home.headlinePre', 'Shop ')}
            <Text style={styles.headlineAccent}>{t('home.headlineAccent', 'Vehicles')}</Text>
            {t('home.headlinePost', ' in the easiest way all the time.')}
          </Text>
        </View>

        {/* Search & Filter Bar */}
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
            <Ionicons name="search-outline" size={20} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('home.searchPlaceholder', 'Search for cars, models, Bole...')}
              placeholderTextColor="#9EA3AE"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              style={[styles.searchInput, { color: colors.ink }]}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter search"
            onPress={() => setFilterModalOpen(true)}
            style={styles.filterButton}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Promotional Banner Horizontal Carousel */}
        <View style={styles.promoSection}>
          <View style={styles.promoCarouselWrapper}>
            <ScrollView
              ref={heroScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = Math.round(x / bannerWidth);
                if (idx >= 0 && idx < 3 && idx !== bannerIndex) {
                  setBannerIndex(idx);
                }
              }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / bannerWidth,
                );
                if (idx >= 0 && idx < 3) {
                  setBannerIndex(idx);
                }
              }}
              scrollEventThrottle={16}
            >
              {/* Banner 1: New Collection & Deals */}
              <View style={[styles.promoCard, { width: bannerWidth, backgroundColor: colors.primary }]}>
                <View style={styles.promoPattern} />
                <View style={styles.promoContent}>
                  <Text style={styles.promoBadge}>NEW COLLECTION</Text>
                  <Text numberOfLines={1} style={styles.promoTitle}>Exclusive Car Deals</Text>
                  <Text numberOfLines={2} style={styles.promoSubtitle}>
                    Verified inspections & up to 50% discount on broker fees.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(tabs)/search')}
                    style={styles.promoButton}
                  >
                    <Text style={styles.promoButtonText}>Explore now</Text>
                  </Pressable>
                </View>

                <View style={styles.promoGraphicWrap}>
                  <Ionicons name="car-sport" size={96} color="rgba(255, 255, 255, 0.95)" />
                </View>
              </View>

              {/* Banner 2: 100% Inspected & Libre Title Security */}
              <View style={[styles.promoCard, { width: bannerWidth, backgroundColor: '#1E232B' }]}>
                <View style={styles.promoPattern} />
                <View style={styles.promoContent}>
                  <Text style={[styles.promoBadge, { color: colors.primary }]}>100% INSPECTED</Text>
                  <Text numberOfLines={1} style={styles.promoTitle}>Zero Title Risk</Text>
                  <Text numberOfLines={2} style={styles.promoSubtitle}>
                    Every car verified with Road Authority & clean original Libre.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/services')}
                    style={styles.promoButton}
                  >
                    <Text style={[styles.promoButtonText, { color: '#1E232B' }]}>Our Services</Text>
                  </Pressable>
                </View>

                <View style={styles.promoGraphicWrap}>
                  <Ionicons name="shield-checkmark" size={92} color="rgba(255, 255, 255, 0.92)" />
                </View>
              </View>

              {/* Banner 3: EV & Hybrid Specials */}
              <View style={[styles.promoCard, { width: bannerWidth, backgroundColor: '#0F4C81' }]}>
                <View style={styles.promoPattern} />
                <View style={styles.promoContent}>
                  <Text style={styles.promoBadge}>EV SPECIAL</Text>
                  <Text numberOfLines={1} style={styles.promoTitle}>Electric Revolution</Text>
                  <Text numberOfLines={2} style={styles.promoSubtitle}>
                    Explore BYD Song, Toyota Hybrids & zero emission cars.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/(tabs)/search', params: { fuelType: 'Electric' } })}
                    style={styles.promoButton}
                  >
                    <Text style={[styles.promoButtonText, { color: '#0F4C81' }]}>View EV Cars</Text>
                  </Pressable>
                </View>

                <View style={styles.promoGraphicWrap}>
                  <Ionicons name="flash" size={92} color="rgba(255, 255, 255, 0.92)" />
                </View>
              </View>
            </ScrollView>

            {/* Left Nav Arrow Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous banner"
              onPress={handlePrevBanner}
              style={[styles.heroNavArrow, styles.heroNavArrowLeft]}
            >
              <Ionicons name="chevron-back" size={16} color={colors.white} />
            </Pressable>

            {/* Right Nav Arrow Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next banner"
              onPress={handleNextBanner}
              style={[styles.heroNavArrow, styles.heroNavArrowRight]}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </Pressable>
          </View>

          {/* Carousel Pagination Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  setBannerIndex(idx);
                  heroScrollRef.current?.scrollTo({
                    x: idx * bannerWidth,
                    animated: true,
                  });
                }}
              >
                <View
                  style={[
                    styles.dot,
                    bannerIndex === idx ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <VehicleCategories
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />

        {/* Recommended for you Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>
            {t('home.featured', 'Recommended for you')}
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAllText}>
              {t('home.viewAll', 'See all')}
            </Text>
          </Pressable>
        </View>

        {/* Vehicles Grid / States */}
        {vehicles.isLoading ? (
          <ShowroomHomeSkeleton />
        ) : vehicles.error ? (
          <ErrorState
            message={vehicles.error.message}
            onRetry={() => void vehicles.refetch()}
          />
        ) : filteredVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={44} color={colors.muted} />
            <Text style={styles.emptyTitle}>No cars in this category yet</Text>
            <Text style={styles.emptyText}>Try choosing "All Cars" to see available listings.</Text>
            <Pressable
              style={styles.resetCategoryButton}
              onPress={() => setActiveCategory('All Cars')}
            >
              <Text style={styles.resetCategoryText}>View All Cars</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {Array.from(
              { length: Math.ceil(filteredVehicles.length / 2) },
              (_, row) => (
                <View key={`row-${row}`} style={styles.gridRow}>
                  {filteredVehicles.slice(row * 2, row * 2 + 2).map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onPress={() => router.push(`/vehicles/${vehicle.id}`)}
                      style={styles.gridCard}
                    />
                  ))}
                  {filteredVehicles.length % 2 === 1 &&
                  row === Math.floor(filteredVehicles.length / 2) ? (
                    <View style={styles.gridSpacer} />
                  ) : null}
                </View>
              ),
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFilterModalOpen(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Vehicles</Text>
              <Pressable onPress={() => setFilterModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={styles.filterSectionTitle}>Condition</Text>
            <View style={styles.filterPillsRow}>
              {(['all', 'new', 'used'] as const).map((cond) => (
                <Pressable
                  key={cond}
                  onPress={() => setSelectedCondition(cond)}
                  style={[
                    styles.filterPill,
                    selectedCondition === cond && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedCondition === cond && styles.filterPillTextActive,
                    ]}
                  >
                    {cond === 'all' ? 'All' : cond === 'new' ? 'Brand New' : 'Pre-Owned'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Popular Brands</Text>
            <View style={styles.filterPillsRow}>
              {['All', 'Toyota', 'Hyundai', 'Suzuki', 'Mercedes'].map((br) => (
                <Pressable
                  key={br}
                  onPress={() => setSelectedBrand(br)}
                  style={[
                    styles.filterPill,
                    selectedBrand === br && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedBrand === br && styles.filterPillTextActive,
                    ]}
                  >
                    {br}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.applyFilterButton}
              onPress={() => {
                setFilterModalOpen(false);
                router.push({
                  pathname: '/(tabs)/search',
                  params: {
                    ...(selectedBrand !== 'All' ? { brand: selectedBrand } : {}),
                    ...(selectedCondition !== 'all' ? { condition: selectedCondition } : {}),
                  },
                });
              }}
            >
              <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
            </Pressable>
          </Pressable>
        </Pressable>
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
              Welcome to the new Arif Car Broker mobile experience! You have 3 new verified direct seller listings ready to inspect.
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
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 54,
    paddingBottom: 110,
  },
  topBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEFE6',
    borderWidth: 1.5,
    borderColor: '#FFD9C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  userInfo: {
    gap: 2,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  welcomeSub: {
    fontSize: 12,
    color: colors.muted,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  headlineWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headline: {
    fontSize: 27,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  headlineAccent: {
    color: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  searchBar: {
    flex: 1,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: radius.full,
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
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  promoSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  promoCarouselWrapper: {
    position: 'relative',
    width: '100%',
  },
  heroNavArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroNavArrowLeft: {
    left: 8,
  },
  heroNavArrowRight: {
    right: 8,
  },
  promoCard: {
    height: 148,
    backgroundColor: colors.primary,
    borderRadius: radius.large,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  promoPattern: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  promoBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 15,
  },
  promoButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  promoGraphicWrap: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
  gridSpacer: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  resetCategoryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  resetCategoryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 40,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 10,
    marginBottom: 10,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  applyFilterButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyFilterButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  notificationCard: {
    margin: 24,
    backgroundColor: colors.white,
    borderRadius: radius.large,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  notificationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  notificationBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 18,
  },
  notificationClose: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  notificationCloseText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import { VehicleCategories } from '../../src/components/vehicles/VehicleCategories';
import { useVehicles } from '../../src/features/vehicles/vehicle-queries';
import { useSession } from '../../src/features/auth/SessionContext';
import { colors, radius } from '../../src/theme/tokens';

type Condition = 'all' | 'new' | 'used';

export default function DiscoverScreen() {
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [condition, setCondition] = useState<Condition>('all');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Any Location');
  const [brand, setBrand] = useState('All Brands');
  const [bodyType, setBodyType] = useState('All Types');
  const [budget, setBudget] = useState('Any Budget');
  const vehicles = useVehicles({ limit: 8, sort: 'newest' });

  const cycle = (
    value: string,
    options: string[],
    setter: (value: string) => void,
  ) => setter(options[(options.indexOf(value) + 1) % options.length]);

  const findVehicle = () =>
    router.push({
      pathname: '/(tabs)/search',
      params: {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(bodyType !== 'All Types' ? { bodyType } : {}),
        ...(brand !== 'All Brands' ? { brand } : {}),
        ...(location !== 'Any Location' ? { location } : {}),
        ...(budget !== 'Any Budget' ? { priceRange: budget } : {}),
        ...(condition !== 'all' ? { condition } : {}),
      },
    });

  const publicVehicles = (vehicles.data ?? []).filter(
    (vehicle) =>
      vehicle.status === 'approved' ||
      vehicle.status === 'sold' ||
      !vehicle.status,
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brandText}>
            ARIF <Text style={styles.brandAccent}>CAR SELL</Text>
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open account"
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {user?.name ? (
              <Text style={styles.profileText}>
                {user.name.slice(0, 1).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person-outline" size={16} color={colors.green} />
            )}
            <Ionicons name="chevron-down" size={12} color={colors.muted} />
          </Pressable>
          <Ionicons name="sunny-outline" size={21} color={colors.orange} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={23} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable
            style={styles.menuPanel}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <View style={styles.menuBrand}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.menuLogo}
                />
                <View>
                  <Text style={styles.menuBrandName}>
                    ARIF <Text style={styles.brandAccent}>CAR SELL</Text>
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Verified vehicle marketplace
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                onPress={() => setMenuOpen(false)}
              >
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>
            <MenuLink
              icon="home-outline"
              label="Home"
              onPress={() => {
                setMenuOpen(false);
                router.replace('/(tabs)');
              }}
            />
            <MenuLink
              icon="search-outline"
              label="Browse vehicles"
              onPress={() => {
                setMenuOpen(false);
                router.push('/(tabs)/search');
              }}
            />
            <MenuLink
              icon="heart-outline"
              label="Saved vehicles"
              onPress={() => {
                setMenuOpen(false);
                router.push('/(tabs)/favorites');
              }}
            />
            <MenuLink
              icon="car-outline"
              label="Vehicles"
              onPress={() => {
                setMenuOpen(false);
                router.push('/(tabs)/sell');
              }}
            />
            <MenuLink
              icon="person-outline"
              label={user ? 'My account' : 'Sign in'}
              onPress={() => {
                setMenuOpen(false);
                router.push(user ? '/(tabs)/profile' : '/login');
              }}
            />
            <View style={styles.menuDivider} />
            <Text style={styles.menuSection}>Need help?</Text>
            <MenuLink
              icon="call-outline"
              label="Contact support"
              onPress={() => setMenuOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <ImageBackground
        source={require('../../assets/home-hero.jpg')}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <View style={styles.heroShade}>
          <Text style={styles.heroEyebrow}>FIND YOUR PERFECT CAR</Text>
          <Text style={styles.heroTitle}>
            Looking for a vehicle?{'\n'}You're in the perfect spot.
          </Text>
          <View style={styles.highlights}>
            <Highlight text="High quality at a low cost." />
            <Highlight text="Premium verified services." />
            <Highlight text="24/7 roadside & legal support." />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.finder}>
        <View style={styles.finderTabs}>
          <View style={styles.conditionTabs}>
            <ConditionTab
              label="All cars"
              active={condition === 'all'}
              onPress={() => setCondition('all')}
            />
            <ConditionTab
              label="New cars"
              active={condition === 'new'}
              onPress={() => setCondition('new')}
            />
            <ConditionTab
              label="Used cars"
              active={condition === 'used'}
              onPress={() => setCondition('used')}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.help}
          >
            <Ionicons name="person-outline" size={13} color={colors.muted} />
            <Text style={styles.helpText}>Need help?</Text>
          </Pressable>
        </View>

        <View style={styles.finderFields}>
          <FinderField
            label="Pick Up Location"
            value={location}
            icon="location-outline"
            onPress={() =>
              cycle(
                location,
                ['Any Location', 'Addis Ababa', 'Bole', 'Kazanchis'],
                setLocation,
              )
            }
          />
          <FinderField
            label="Make / Brand"
            value={brand}
            icon="car-outline"
            onPress={() =>
              cycle(
                brand,
                ['All Brands', 'Toyota', 'Hyundai', 'Suzuki', 'Mercedes-Benz'],
                setBrand,
              )
            }
          />
          <FinderField
            label="Vehicle Type"
            value={bodyType}
            icon="options-outline"
            onPress={() =>
              cycle(
                bodyType,
                ['All Types', 'SUV', 'Sedan', 'Hatchback', 'Pickup'],
                setBodyType,
              )
            }
          />
          <FinderField
            label="Max Budget"
            value={budget}
            icon="wallet-outline"
            onPress={() =>
              cycle(
                budget,
                ['Any Budget', 'under-3m', '3m-6m', '6m-10m', 'over-20m'],
                setBudget,
              )
            }
          />
          <View style={styles.finderSearch}>
            <Ionicons name="search-outline" size={17} color={colors.ink} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search make or model"
              placeholderTextColor="#778296"
              onSubmitEditing={findVehicle}
              style={styles.finderInput}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find a vehicle"
            onPress={findVehicle}
            style={styles.findButton}
          >
            <Ionicons name="search-outline" size={16} color={colors.ink} />
            <Text style={styles.findButtonText}>Find a vehicle</Text>
          </Pressable>
        </View>
      </View>

      <VehicleCategories />
      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.eyebrow}>FRESH FROM THE MARKET</Text>
          <Text style={styles.sectionTitle}>Recently added</Text>
        </View>
        <Pressable onPress={findVehicle}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      {vehicles.isLoading ? (
        <LoadingState />
      ) : vehicles.error ? (
        <ErrorState
          message={vehicles.error.message}
          onRetry={() => void vehicles.refetch()}
        />
      ) : publicVehicles.length ? (
        Array.from(
          { length: Math.ceil(publicVehicles.length / 2) },
          (_, row) => (
            <View key={`vehicle-row-${row}`} style={styles.vehicleGridRow}>
              {publicVehicles.slice(row * 2, row * 2 + 2).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() => router.push(`/vehicles/${vehicle.id}`)}
                />
              ))}
              {publicVehicles.length % 2 === 1 &&
              row === Math.floor(publicVehicles.length / 2) ? (
                <View style={styles.gridSpacer} />
              ) : null}
            </View>
          ),
        )
      ) : (
        <View style={styles.empty}>
          <Ionicons name="car-outline" size={30} color={colors.muted} />
          <Text style={styles.emptyTitle}>No public vehicles right now</Text>
          <Text style={styles.emptyCopy}>Check back for new listings.</Text>
        </View>
      )}
      <Text style={styles.footer}>ARIF CAR SELL · አሪፍ መኪና ሽያጭ</Text>
    </ScrollView>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <View style={styles.highlight}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={11} color={colors.ink} />
      </View>
      <Text style={styles.highlightText}>{text}</Text>
    </View>
  );
}

function MenuLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.menuLink}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={19} color={colors.green} />
      </View>
      <Text style={styles.menuLinkText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}

function ConditionTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.conditionTab, active && styles.conditionTabActive]}
    >
      <Text
        style={[styles.conditionText, active && styles.conditionTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FinderField({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        onPress={onPress}
        style={styles.fieldControl}
      >
        <Ionicons name={icon} size={15} color={colors.muted} />
        <Text numberOfLines={1} style={styles.fieldValue}>
          {value.replaceAll('-', '–')}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 105 },
  vehicleGridRow: { flexDirection: 'row', gap: 10 },
  gridSpacer: { flex: 1, marginBottom: 12 },
  header: {
    height: 58,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.black,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D9E0EA',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
    resizeMode: 'contain',
  },
  brandText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  brandAccent: { color: colors.green },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuButton: { padding: 4 },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.62)',
    alignItems: 'flex-end',
  },
  menuPanel: {
    width: '86%',
    maxWidth: 360,
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: 56,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: 12,
  },
  menuBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: colors.white,
    padding: 3,
  },
  menuBrandName: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  menuSubtitle: { color: colors.muted, fontSize: 10, marginTop: 4 },
  menuLink: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.line}99`,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLinkText: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '700' },
  menuDivider: { height: 1, backgroundColor: colors.line, marginVertical: 18 },
  menuSection: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  profileButton: {
    height: 32,
    minWidth: 47,
    paddingHorizontal: 8,
    borderRadius: 17,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  profileText: { color: colors.green, fontWeight: '900', fontSize: 13 },
  hero: { height: 361, backgroundColor: '#1A2435' },
  heroImage: { resizeMode: 'cover' },
  heroShade: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 92,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 10, 20, .59)',
  },
  heroEyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  highlights: { gap: 7, marginTop: 15 },
  highlight: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(4, 8, 16, .72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  check: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  finder: {
    marginHorizontal: 11,
    marginTop: -36,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.navy,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  finderTabs: {
    minHeight: 36,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionTabs: { flexDirection: 'row', gap: 4 },
  conditionTab: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16 },
  conditionTabActive: { backgroundColor: colors.green },
  conditionText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  conditionTextActive: { color: colors.ink },
  help: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helpText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  finderFields: { gap: 9, paddingTop: 12 },
  field: {},
  fieldLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 5,
  },
  fieldControl: {
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  fieldValue: { flex: 1, color: colors.ink, fontSize: 11, fontWeight: '800' },
  finderSearch: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  finderInput: { flex: 1, color: colors.ink, fontSize: 11 },
  findButton: {
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  findButtonText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  sectionHeading: {
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 5,
  },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  seeAll: { color: colors.green, fontSize: 11, fontWeight: '800' },
  empty: {
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 25,
    backgroundColor: colors.navySoft,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { color: colors.ink, fontWeight: '800', marginTop: 8 },
  emptyCopy: { color: colors.muted, fontSize: 11, marginTop: 5 },
  footer: {
    color: '#687488',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 25,
  },
});

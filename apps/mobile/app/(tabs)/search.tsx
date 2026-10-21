import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageTitle } from '../../src/components/common/PageTitle';
import {
  ErrorState,
  LoadingState,
} from '../../src/components/common/RequestState';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import { useInfiniteVehicles } from '../../src/features/vehicles/vehicle-queries';
import { colors, radius } from '../../src/theme/tokens';
import type { VehicleFilters } from '../../src/types/models';

const fuels = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const sorts = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Year', value: 'year_desc' },
];
export default function SearchScreen() {
  const routeParams = useLocalSearchParams<{
    search?: string;
    bodyType?: string;
    brand?: string;
    location?: string;
    priceRange?: string;
    condition?: string;
  }>();
  const [query, setQuery] = useState(routeParams.search || '');
  const [bodyType, setBodyType] = useState(routeParams.bodyType || 'All');
  const [brand, setBrand] = useState(routeParams.brand || 'All');
  const [condition, setCondition] = useState(routeParams.condition || 'All');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [fuel, setFuel] = useState('All');
  const [sort, setSort] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (routeParams.search !== undefined) setQuery(routeParams.search);
    if (routeParams.bodyType !== undefined) setBodyType(routeParams.bodyType);
    if (routeParams.brand !== undefined) setBrand(routeParams.brand);
    if (routeParams.location !== undefined) setLocation(routeParams.location);
    if (routeParams.condition !== undefined)
      setCondition(routeParams.condition);
    if (routeParams.priceRange) {
      const [minimum, maximum] = routeParams.priceRange.split('-');
      if (minimum && minimum !== 'under')
        setMinPrice(minimum.replace('m', '000000'));
      if (maximum && maximum !== 'over')
        setMaxPrice(maximum.replace('m', '000000'));
    }
  }, [
    routeParams.search,
    routeParams.bodyType,
    routeParams.brand,
    routeParams.location,
    routeParams.priceRange,
    routeParams.condition,
  ]);
  const filters = useMemo<VehicleFilters>(
    () => ({
      search: debouncedQuery || undefined,
      brand: brand === 'All' || brand === 'All Brands' ? undefined : brand,
      condition: condition === 'All' ? undefined : condition,
      fuelType: fuel === 'All' ? undefined : fuel,
      bodyType: bodyType === 'All' ? undefined : bodyType,
      location:
        location.trim() === 'Any Location'
          ? undefined
          : location.trim() || undefined,
      minPrice: minPrice.replace(/[^\d]/g, '') || undefined,
      maxPrice: maxPrice.replace(/[^\d]/g, '') || undefined,
      sort,
    }),
    [
      debouncedQuery,
      brand,
      condition,
      fuel,
      bodyType,
      location,
      minPrice,
      maxPrice,
      sort,
    ],
  );
  const result = useInfiniteVehicles(filters);
  const vehicles =
    result.data?.pages.flatMap((page) =>
      page.filter(
        (item) =>
          item.status === 'approved' || item.status === 'sold' || !item.status,
      ),
    ) ?? [];
  const reset = () => {
    setQuery('');
    setBrand('All');
    setCondition('All');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setFuel('All');
    setBodyType('All');
    setSort('newest');
  };
  const header = (
    <View>
      <PageTitle eyebrow="FIND YOUR MATCH" title="Search cars" />
      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Make, model or area"
          placeholderTextColor="#9AA0A8"
          style={styles.input}
          returnKeyType="search"
          accessibilityLabel="Search vehicles"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => setQuery('')}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={query ? colors.muted : 'transparent'}
          />
        </Pressable>
      </View>
      <View style={styles.filtersTop}>
        <Text style={styles.filterLabel}>FUEL TYPE</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFiltersOpen((v) => !v)}
          style={styles.advanced}
        >
          <Ionicons name="options-outline" size={16} color={colors.ink} />
          <Text style={styles.advancedText}>Filters</Text>
        </Pressable>
      </View>
      <ScrollChips values={fuels} selected={fuel} onSelect={setFuel} />
      <Text style={[styles.filterLabel, { marginTop: 13, marginBottom: 8 }]}>
        VEHICLE TYPE
      </Text>
      <ScrollChips
        values={['All', 'SUV', 'Sedan', 'Hatchback', 'Pickup']}
        selected={bodyType}
        onSelect={setBodyType}
        compact
      />
      {filtersOpen ? (
        <View style={styles.advancedPanel}>
          <View style={styles.priceRow}>
            <TextInput
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="number-pad"
              placeholder="Min price (ETB)"
              placeholderTextColor="#9AA0A8"
              style={styles.priceInput}
            />
            <TextInput
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="number-pad"
              placeholder="Max price (ETB)"
              placeholderTextColor="#9AA0A8"
              style={styles.priceInput}
            />
          </View>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City or area"
            placeholderTextColor="#9AA0A8"
            style={styles.locationInput}
          />
          <Pressable onPress={reset} style={styles.reset}>
            <Text style={styles.resetText}>Clear all filters</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.sortWrap}>
        <Text style={styles.filterLabel}>SORT BY</Text>
        <ScrollChips
          values={sorts.map((s) => s.label)}
          selected={sorts.find((s) => s.value === sort)?.label || 'Newest'}
          onSelect={(label) =>
            setSort(sorts.find((s) => s.label === label)?.value || 'newest')
          }
          compact
        />
        <Text style={styles.resultCount}>
          {result.isLoading
            ? 'Finding cars…'
            : `${vehicles.length}${result.hasNextPage ? '+' : ''} vehicles`}
        </Text>
      </View>
    </View>
  );
  return (
    <View style={styles.screen}>
      <FlatList
        data={vehicles}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/vehicles/${item.id}`)}
          />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (result.hasNextPage && !result.isFetchingNextPage)
            void result.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={result.isRefetching && !result.isFetchingNextPage}
        onRefresh={() => void result.refetch()}
        ListEmptyComponent={
          result.isLoading ? (
            <LoadingState />
          ) : result.error ? (
            <ErrorState
              message={result.error.message}
              onRetry={() => void result.refetch()}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={30} color={colors.muted} />
              <Text style={styles.emptyTitle}>No cars match those filters</Text>
              <Text style={styles.emptyCopy}>
                Try a wider price range or another location.
              </Text>
              <Pressable onPress={reset}>
                <Text style={styles.resetText}>Clear filters</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          result.isFetchingNextPage ? (
            <ActivityIndicator color={colors.green} style={{ padding: 18 }} />
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />
    </View>
  );
}
function ScrollChips({
  values,
  selected,
  onSelect,
  compact,
}: {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === value }}
          onPress={() => onSelect(value)}
          style={[
            styles.chip,
            compact && styles.compact,
            selected === value && styles.chipActive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selected === value && styles.chipTextActive,
            ]}
          >
            {value}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingBottom: 105 },
  gridRow: { gap: 10, alignItems: 'stretch' },
  search: {
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  input: { flex: 1, color: colors.ink, fontSize: 14 },
  filtersTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  advanced: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  advancedText: { color: colors.ink, fontSize: 10, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 22,
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  compact: { minHeight: 32, paddingHorizontal: 10 },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  chipTextActive: { color: colors.white },
  advancedPanel: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 10,
    gap: 9,
  },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontSize: 12,
  },
  locationInput: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontSize: 12,
  },
  reset: { alignSelf: 'flex-end', padding: 4 },
  resetText: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
  sortWrap: { gap: 9, marginTop: 20, marginBottom: 14 },
  resultCount: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  empty: {
    marginTop: 25,
    alignItems: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyCopy: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});

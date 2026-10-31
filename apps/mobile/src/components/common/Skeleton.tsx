import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const baseColor = isDark ? '#232936' : '#E5E8EF';

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: baseColor,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton for individual vehicle cards (matches VehicleCard dimensions)
 */
export function VehicleCardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.vehicleCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.line,
        },
        style,
      ]}
    >
      {/* Image placeholder with floating badge skeletons */}
      <View style={styles.cardImageContainer}>
        <Skeleton width="100%" height={150} borderRadius={14} />
        <View style={styles.cardFloatingBadges}>
          <Skeleton width={64} height={18} borderRadius={radius.full} />
          <Skeleton width={48} height={18} borderRadius={radius.full} />
        </View>
      </View>

      {/* Content lines */}
      <View style={styles.cardBody}>
        {/* Title & year */}
        <Skeleton width="75%" height={16} borderRadius={6} />
        <Skeleton width="45%" height={12} borderRadius={4} style={{ marginTop: 6 }} />

        {/* Spec pills row */}
        <View style={styles.cardSpecsRow}>
          <Skeleton width={52} height={20} borderRadius={6} />
          <Skeleton width={46} height={20} borderRadius={6} />
          <Skeleton width={54} height={20} borderRadius={6} />
        </View>

        {/* Price & Action button footer */}
        <View style={styles.cardFooter}>
          <Skeleton width={80} height={18} borderRadius={6} />
          <Skeleton width={70} height={30} borderRadius={radius.full} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for the Home / Discover screen
 */
export function ShowroomHomeSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.pageContainer}>
      {/* Promo banner skeleton */}
      <View style={styles.sectionPadding}>
        <Skeleton width="100%" height={155} borderRadius={24} />
      </View>

      {/* Category chips skeleton */}
      <View style={styles.horizontalChipsRow}>
        <Skeleton width={84} height={36} borderRadius={radius.full} />
        <Skeleton width={96} height={36} borderRadius={radius.full} />
        <Skeleton width={80} height={36} borderRadius={radius.full} />
        <Skeleton width={92} height={36} borderRadius={radius.full} />
      </View>

      {/* Section Header skeleton */}
      <View style={[styles.sectionHeaderRow, styles.sectionPadding]}>
        <Skeleton width={140} height={18} borderRadius={6} />
        <Skeleton width={50} height={14} borderRadius={4} />
      </View>

      {/* 2-Column Grid of Vehicle Cards */}
      <View style={styles.gridRow}>
        <View style={{ flex: 1 }}>
          <VehicleCardSkeleton />
        </View>
        <View style={{ flex: 1 }}>
          <VehicleCardSkeleton />
        </View>
      </View>

      <View style={[styles.gridRow, { marginTop: 12 }]}>
        <View style={{ flex: 1 }}>
          <VehicleCardSkeleton />
        </View>
        <View style={{ flex: 1 }}>
          <VehicleCardSkeleton />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for the Vehicle Detail Screen ([id].tsx)
 */
export function VehicleDetailSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.pageContainer}>
      {/* Hero photo gallery carousel */}
      <Skeleton width="100%" height={260} borderRadius={0} />

      <View style={styles.detailBody}>
        {/* Title and status badges */}
        <View style={styles.detailHeaderRow}>
          <Skeleton width="60%" height={24} borderRadius={8} />
          <Skeleton width={80} height={24} borderRadius={radius.full} />
        </View>

        <Skeleton width="40%" height={14} borderRadius={4} style={{ marginTop: 6 }} />

        {/* Big price banner pill */}
        <View style={{ marginTop: 14 }}>
          <Skeleton width="50%" height={28} borderRadius={8} />
        </View>

        {/* 4-Item Quick Specs Grid */}
        <View style={styles.detailSpecsGrid}>
          <Skeleton width="23%" height={68} borderRadius={14} />
          <Skeleton width="23%" height={68} borderRadius={14} />
          <Skeleton width="23%" height={68} borderRadius={14} />
          <Skeleton width="23%" height={68} borderRadius={14} />
        </View>

        {/* Broker identity card */}
        <View
          style={[
            styles.detailCardBox,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="70%" height={16} borderRadius={4} />
              <Skeleton width="45%" height={12} borderRadius={4} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Skeleton width="48%" height={40} borderRadius={radius.full} />
            <Skeleton width="48%" height={40} borderRadius={radius.full} />
          </View>
        </View>

        {/* Inspection & features card */}
        <View
          style={[
            styles.detailCardBox,
            { backgroundColor: colors.card, borderColor: colors.line, marginTop: 14 },
          ]}
        >
          <Skeleton width="50%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
          <Skeleton width="90%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="85%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="75%" height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for the Search List Screen
 */
export function SearchListSkeleton() {
  return (
    <View style={styles.pageContainer}>
      <View style={styles.horizontalChipsRow}>
        <Skeleton width={70} height={32} borderRadius={radius.full} />
        <Skeleton width={90} height={32} borderRadius={radius.full} />
        <Skeleton width={80} height={32} borderRadius={radius.full} />
        <Skeleton width={75} height={32} borderRadius={radius.full} />
      </View>

      <View style={[styles.sectionPadding, { gap: 14, marginTop: 12 }]}>
        <VehicleCardSkeleton />
        <VehicleCardSkeleton />
        <VehicleCardSkeleton />
      </View>
    </View>
  );
}

/**
 * Skeleton for the Favorites Screen
 */
export function FavoritesListSkeleton() {
  return (
    <View style={[styles.pageContainer, styles.sectionPadding, { gap: 14, paddingTop: 14 }]}>
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
    </View>
  );
}

/**
 * Skeleton for the Seller Garage Screen
 */
export function SellerGarageSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.pageContainer, styles.sectionPadding, { gap: 16 }]}>
      {/* Stats summary banner */}
      <View
        style={[
          styles.detailCardBox,
          { backgroundColor: colors.card, borderColor: colors.line },
        ]}
      >
        <Skeleton width="40%" height={14} borderRadius={4} />
        <Skeleton width="70%" height={26} borderRadius={8} style={{ marginTop: 8 }} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Skeleton width="48%" height={36} borderRadius={10} />
          <Skeleton width="48%" height={36} borderRadius={10} />
        </View>
      </View>

      {/* Listings skeletons */}
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
    </View>
  );
}

/**
 * Skeleton for Broker Profile Screen
 */
export function BrokerProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.pageContainer, styles.sectionPadding]}>
      {/* Top Broker Identity */}
      <View style={{ alignItems: 'center', marginVertical: 18, gap: 8 }}>
        <Skeleton width={76} height={76} borderRadius={38} />
        <Skeleton width={160} height={20} borderRadius={6} />
        <Skeleton width={110} height={14} borderRadius={4} />
      </View>

      {/* 3 Stats pill row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        <Skeleton width="31%" height={56} borderRadius={14} />
        <Skeleton width="31%" height={56} borderRadius={14} />
        <Skeleton width="31%" height={56} borderRadius={14} />
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Skeleton width="48%" height={44} borderRadius={radius.full} />
        <Skeleton width="48%" height={44} borderRadius={radius.full} />
      </View>

      {/* Listings */}
      <Skeleton width={140} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
      <VehicleCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  sectionPadding: {
    paddingHorizontal: 16,
  },
  horizontalChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  vehicleCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardFloatingBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  cardBody: {
    marginTop: 10,
  },
  cardSpecsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailBody: {
    padding: 18,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailSpecsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  detailCardBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
});

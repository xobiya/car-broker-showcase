import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../../src/theme/tokens';

const trackingSteps = [
  {
    id: 1,
    title: 'Booking Confirmed',
    time: 'Today | 06:30pm',
    status: 'completed',
    icon: 'checkmark-circle',
  },
  {
    id: 2,
    title: '150-Point Inspection Passed',
    time: 'Verified by Auto Inspector',
    status: 'completed',
    icon: 'shield-checkmark',
  },
  {
    id: 3,
    title: 'In Transit for Handover',
    time: 'Driver en route to Bole Subcity',
    status: 'current',
    icon: 'car-sport',
  },
  {
    id: 4,
    title: 'Vehicle Handover & Libre Transfer',
    time: 'Estimated tomorrow | 02:30pm',
    status: 'upcoming',
    icon: 'key-outline',
  },
];

export default function TrackTabScreen() {
  const insets = useSafeAreaInsets();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Vehicle Request?',
      'Are you sure you want to cancel this booking? Refund policy will apply.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            setTimeout(() => {
              setCancelling(false);
              Alert.alert('Request Cancelled', 'Your booking has been cancelled.');
            }, 600);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) + 10 }]}>
        <Text style={styles.navTitle}>Track Order</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
      >
        {/* Map Illustration Area */}
        <View style={styles.mapCanvas}>
          <View style={styles.mapGridLine1} />
          <View style={styles.mapGridLine2} />
          <View style={styles.mapRoad1} />
          <View style={styles.mapRoad2} />

          {/* Route path */}
          <View style={styles.routePathContainer}>
            <View style={styles.originPin}>
              <View style={styles.pinCenter} />
            </View>

            <View style={styles.routeLineSegment1} />
            <View style={styles.routeLineSegment2} />
            <View style={styles.routeLineSegment3} />

            <View style={styles.destinationPin}>
              <View style={styles.destPinOuter} />
              <View style={styles.destPinCenter} />
            </View>
          </View>

          {/* Map Overlay Badge */}
          <View style={styles.mapLiveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live: En route in Bole, Addis Ababa</Text>
          </View>
        </View>

        {/* Vehicle Preview Card */}
        <View style={styles.itemCard}>
          <View style={styles.itemIconWrap}>
            <Ionicons name="car-sport" size={26} color={colors.primary} />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Toyota Land Cruiser 300 VXR</Text>
            <Text style={styles.itemSub}>Verified Broker Handover | ★ 4.9</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/vehicles/veh-1')}
            style={styles.viewDetailsBtn}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Timeline Tracking Steps */}
        <View style={styles.timelineSection}>
          {trackingSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isLast = idx === trackingSteps.length - 1;

            return (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.indicatorCircle,
                      isCompleted && styles.indicatorCompleted,
                      isCurrent && styles.indicatorCurrent,
                    ]}
                  >
                    <Ionicons
                      name={
                        isCompleted
                          ? 'checkmark'
                          : isCurrent
                          ? (step.icon as any)
                          : 'ellipse-outline'
                      }
                      size={13}
                      color={isCompleted || isCurrent ? colors.white : '#9CA3AF'}
                    />
                  </View>
                  {!isLast ? (
                    <View
                      style={[
                        styles.indicatorLine,
                        isCompleted && styles.indicatorLineCompleted,
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.timelineTextWrap}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      isCurrent && styles.timelineTitleCurrent,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsWrap}>
          <Pressable
            accessibilityRole="button"
            onPress={handleCancel}
            disabled={cancelling}
            style={[styles.cancelButton, cancelling && { opacity: 0.6 }]}
          >
            <Text style={styles.cancelButtonText}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)')}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Go to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  navBar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapCanvas: {
    height: 220,
    backgroundColor: '#F3F4F7',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridLine1: {
    position: 'absolute',
    left: 40,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  mapGridLine2: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  mapRoad1: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-8deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 170,
    width: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '15deg' }],
  },
  routePathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 30,
  },
  originPin: {
    position: 'absolute',
    top: 36,
    left: 50,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  routeLineSegment1: {
    position: 'absolute',
    top: 52,
    left: 60,
    width: 60,
    height: 4,
    backgroundColor: colors.ink,
    transform: [{ rotate: '42deg' }],
  },
  routeLineSegment2: {
    position: 'absolute',
    top: 92,
    left: 104,
    width: 70,
    height: 4,
    backgroundColor: colors.ink,
    transform: [{ rotate: '55deg' }],
  },
  routeLineSegment3: {
    position: 'absolute',
    top: 148,
    left: 140,
    width: 50,
    height: 4,
    backgroundColor: colors.ink,
    transform: [{ rotate: '15deg' }],
  },
  destinationPin: {
    position: 'absolute',
    top: 144,
    left: 185,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destPinOuter: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 80, 3, 0.25)',
  },
  destPinCenter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  mapLiveBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  itemCard: {
    margin: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 11,
    color: colors.muted,
  },
  viewDetailsBtn: {
    padding: 6,
  },
  timelineSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: radius.large,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  indicatorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  indicatorCompleted: {
    backgroundColor: colors.primary,
  },
  indicatorCurrent: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  indicatorLine: {
    width: 2,
    height: 38,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  indicatorLineCompleted: {
    backgroundColor: colors.primary,
  },
  timelineTextWrap: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  timelineTitleCurrent: {
    color: colors.primary,
    fontWeight: '900',
  },
  timelineTime: {
    fontSize: 11,
    color: colors.muted,
  },
  actionsWrap: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cancelButton: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
});

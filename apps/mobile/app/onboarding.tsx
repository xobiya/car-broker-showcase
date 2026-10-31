import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { AppLogo } from '../src/components/common/AppLogo';
import { colors, radius } from '../src/theme/tokens';

// High-resolution curated vehicle photos for the 3-column staggered masonry showcase
const masonryColumns = {
  col1: [
    {
      id: 'c1-1',
      title: 'Land Cruiser 300 VXR',
      tag: 'V6 TWIN-TURBO',
      height: 200,
      image:
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c1-2',
      title: 'Porsche 911 GT',
      tag: 'SPORT COUPE',
      height: 155,
      image:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c1-3',
      title: 'Mercedes G-Wagon',
      tag: 'LUXURY 4X4',
      height: 175,
      image:
        'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=600&q=80',
    },
  ],
  col2: [
    {
      id: 'c2-1',
      title: 'Digital Cockpit',
      tag: 'LEATHER LUXURY',
      height: 150,
      image:
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c2-2',
      title: 'BYD Song Plus EV',
      tag: '100% ELECTRIC',
      height: 210,
      image:
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c2-3',
      title: 'Ferrari Supercar',
      tag: 'PERFORMANCE',
      height: 155,
      image:
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
    },
  ],
  col3: [
    {
      id: 'c3-1',
      title: 'Forged Alloy Rim',
      tag: 'BREMBO BRAKES',
      height: 155,
      image:
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c3-2',
      title: 'Nissan Patrol V8',
      tag: 'PLATINUM OVERLAND',
      height: 205,
      image:
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c3-3',
      title: 'Range Rover Sport',
      tag: '150-PT PASSED',
      height: 165,
      image:
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

const slides = [
  {
    prefix: 'Curated ',
    highlight: 'Vehicles',
    suffix: ' Designed\nAround Your Taste',
    description:
      'Browse styles shaped around your comfort, lifestyle, and personality, and discover vehicles that feel right today and every day.',
  },
  {
    prefix: 'Verified ',
    highlight: 'Brokers',
    suffix: ' & 150-Point\nInspections',
    description:
      'Every listed car includes document verification, mechanical checks, and direct communication with certified brokers in Ethiopia.',
  },
  {
    prefix: 'Seamless ',
    highlight: 'Handover',
    suffix: ' & Escrow\nProtection',
    description:
      'Test drive on your schedule, secure your deposit with escrow protection, and get your title transferred with total peace of mind.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors: themeColors, isDark } = useTheme();
  const { t } = useLanguage();

  // Splash Screen State & Animations (Screen 1 in reference)
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.96)).current;
  const logoTranslateY = useRef(new Animated.Value(12)).current;

  // Carousel & Floating Animation for Masonry Grid
  const [activeSlide, setActiveSlide] = useState(0);
  const textCarouselRef = useRef<ScrollView>(null);
  const slideWidth = width - 48; // padding 24 each side

  // Subtle breathing/floating animations for columns
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  // Splash Screen Auto-dismiss Timer and Entrance
  useEffect(() => {
    // Entrance animation for Splash logo
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(splashScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // After 1.5 seconds, smoothly dissolve into Onboarding (Screen 2)
    const splashTimer = setTimeout(() => {
      dismissSplash();
    }, 1500);

    return () => clearTimeout(splashTimer);
  }, []);

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashScale, {
        toValue: 1.05,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  const replaySplash = () => {
    setShowSplash(true);
    splashOpacity.setValue(1);
    splashScale.setValue(0.96);
    logoTranslateY.setValue(12);

    Animated.parallel([
      Animated.spring(splashScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      dismissSplash();
    }, 1500);
  };

  // Continuous subtle column floating loop for rich masonry experience
  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -8,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 6,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 8,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: -8,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: -6,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim3, {
          toValue: 8,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, []);

  const handleSlideScroll = (index: number) => {
    setActiveSlide(index);
    textCarouselRef.current?.scrollTo({
      x: index * slideWidth,
      animated: true,
    });
  };

  // Navigation Handlers
  const handleGetStarted = () => {
    // Directs user to the sign in / registration page as requested
    router.push({ pathname: '/login', params: { tab: 'signin' } });
  };

  const handleLogIn = () => {
    router.push({ pathname: '/login', params: { tab: 'signin' } });
  };

  const handleExploreGuest = () => {
    router.replace('/(tabs)');
  };

  // Calculate masonry column dimensions
  const horizontalPadding = 16;
  const colGap = 8;
  const colWidth = (width - horizontalPadding * 2 - colGap * 2) / 3;

  return (
    <View style={styles.container}>
      {/* ---------------------------------------------------- */}
      {/* TOP SECTION: 3-COLUMN STAGGERED MASONRY SHOWCASE    */}
      {/* ---------------------------------------------------- */}
      <View style={styles.showcaseSection}>
        {/* Top Header Bar Over Collage */}
        <View
          style={[
            styles.topHeaderBar,
            { paddingTop: Math.max(insets.top + 8, 44) },
          ]}
        >
          <AppLogo size="sm" inverted />

          <View style={styles.headerRightGroup}>
            {/* Replay splash button for convenience */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay splash animation"
              onPress={replaySplash}
              style={styles.replaySplashBtn}
            >
              <Ionicons name="sparkles" size={13} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.replaySplashText}>Intro</Text>
            </Pressable>

            <QuickHeaderSwitcher />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip to showroom"
              onPress={handleGetStarted}
              style={styles.skipPill}
            >
              <Text style={styles.skipPillText}>Skip</Text>
              <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* 3-Column Masonry Collage Grid */}
        <View style={styles.masonryContainer}>
          {/* Column 1 */}
          <Animated.View
            style={[
              styles.masonryColumn,
              { width: colWidth, transform: [{ translateY: floatAnim1 }] },
            ]}
          >
            {masonryColumns.col1.map((item) => (
              <View
                key={item.id}
                style={[styles.masonryCard, { height: item.height }]}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardVignette} />
                <View style={styles.cardMiniBadge}>
                  <Text style={styles.cardMiniBadgeText}>{item.tag}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Column 2 (Offset / Staggered) */}
          <Animated.View
            style={[
              styles.masonryColumn,
              {
                width: colWidth,
                marginTop: -26,
                transform: [{ translateY: floatAnim2 }],
              },
            ]}
          >
            {masonryColumns.col2.map((item) => (
              <View
                key={item.id}
                style={[styles.masonryCard, { height: item.height }]}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardVignette} />
                <View style={styles.cardMiniBadge}>
                  <Text style={styles.cardMiniBadgeText}>{item.tag}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Column 3 */}
          <Animated.View
            style={[
              styles.masonryColumn,
              {
                width: colWidth,
                marginTop: -12,
                transform: [{ translateY: floatAnim3 }],
              },
            ]}
          >
            {masonryColumns.col3.map((item) => (
              <View
                key={item.id}
                style={[styles.masonryCard, { height: item.height }]}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardVignette} />
                <View style={styles.cardMiniBadge}>
                  <Text style={styles.cardMiniBadgeText}>{item.tag}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Soft Dark Shadow Gradient Over Bottom Edge of Collage */}
        <View style={styles.collageBottomFade} />
      </View>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM SHEET: WHITE CARD WITH GET STARTED BUTTON     */}
      {/* ---------------------------------------------------- */}
      <View
        style={[
          styles.sheetCard,
          {
            backgroundColor: isDark ? '#181C24' : '#FFFFFF',
            paddingBottom: Math.max(insets.bottom + 16, 26),
          },
        ]}
      >
        {/* Pagination Indicator Dots (Active Orange Capsule Pill + Inactive Circular Dots) */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <Pressable
              key={`dot-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${i + 1}`}
              onPress={() => handleSlideScroll(i)}
              hitSlop={8}
            >
              <View
                style={[
                  styles.dotBase,
                  activeSlide === i ? styles.dotPillActive : styles.dotCircleInactive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Swipeable Slides Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={textCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / slideWidth);
              if (idx >= 0 && idx < slides.length && idx !== activeSlide) {
                setActiveSlide(idx);
              }
            }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
              if (idx >= 0 && idx < slides.length) {
                setActiveSlide(idx);
              }
            }}
            scrollEventThrottle={16}
          >
            {slides.map((slide, idx) => (
              <View key={idx} style={[styles.slidePage, { width: slideWidth }]}>
                {/* Headline matching "Curated Fashion Designed Around Your Taste" */}
                <Text
                  style={[
                    styles.headline,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  {slide.prefix}
                  <Text style={styles.headlineHighlight}>{slide.highlight}</Text>
                  {slide.suffix}
                </Text>

                {/* Subtitle / Description */}
                <Text
                  style={[
                    styles.subheadline,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  {slide.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Action Group: Get Started Pill Button & Login Link */}
        <View style={styles.actionGroup}>
          {/* Main "Get Started" Vibrant Brand Pill Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.getStartedButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={styles.getStartedButtonText}>
              {t('onboarding.getStarted', 'Get Started')}
            </Text>
          </Pressable>

          {/* "Already have an account? Log In" Row */}
          <View style={styles.loginRow}>
            <Text
              style={[
                styles.loginQuestion,
                { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              {t('onboarding.alreadyHaveAccount', 'Already have an account?')}{' '}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log in to existing account"
              onPress={handleLogIn}
              hitSlop={6}
            >
              <Text
                style={[
                  styles.loginLink,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                {t('action.signIn', 'Log In')}
              </Text>
            </Pressable>
          </View>

          {/* Guest Showroom Access Option */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Explore Showroom as Guest"
            onPress={handleExploreGuest}
            style={styles.guestLinkBtn}
            hitSlop={8}
          >
            <Text style={[styles.guestLinkText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {t('onboarding.exploreGuest', 'Explore Showroom as Guest')} &rsaquo;
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ---------------------------------------------------- */}
      {/* SCREEN 1: MINIMALIST BRAND SPLASH SCREEN OVERLAY    */}
      {/* ---------------------------------------------------- */}
      {showSplash && (
        <Animated.View
          style={[
            styles.splashOverlay,
            {
              opacity: splashOpacity,
              transform: [{ scale: splashScale }],
            },
          ]}
          pointerEvents={showSplash ? 'auto' : 'none'}
        >
          <Pressable
            style={styles.splashContent}
            onPress={dismissSplash}
            accessibilityRole="button"
            accessibilityLabel="Dismiss splash screen"
          >
            <Animated.View
              style={[
                styles.splashLogoContainer,
                { transform: [{ translateY: logoTranslateY }] },
              ]}
            >
              {/* Web Version Official Logo */}
              <AppLogo size="lg" forceDarkText />

              {/* Tagline */}
              <Text style={styles.splashTagline}>ETHIOPIA'S PREMIER AUTO BROKERAGE</Text>
            </Animated.View>

            {/* Bottom iOS Home Indicator Hint */}
            <View style={styles.splashHomeIndicator} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },

  /* Showcase Section & Masonry */
  showcaseSection: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0D0F14',
    overflow: 'hidden',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 80, 3, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replaySplashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  replaySplashText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  skipPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Masonry Grid */
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingTop: 80,
  },
  masonryColumn: {
    gap: 8,
  },
  masonryCard: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E232F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  cardMiniBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 20, 28, 0.78)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardMiniBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.4,
  },
  collageBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(13, 15, 20, 0.7)',
  },

  /* Bottom Sheet Card */
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 12,
  },
  dotBase: {
    height: 4.5,
  },
  dotPillActive: {
    width: 26,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  dotCircleInactive: {
    width: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
  },
  carouselContainer: {
    height: 120,
    justifyContent: 'center',
    marginBottom: 16,
  },
  slidePage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  headlineHighlight: {
    color: colors.primary,
  },
  subheadline: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 320,
  },

  /* Action Buttons */
  actionGroup: {
    gap: 12,
  },
  getStartedButton: {
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  loginQuestion: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    textDecorationLine: 'underline',
  },
  guestLinkBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  /* Splash Screen Overlay */
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  splashLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashEmblem: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 80, 3, 0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  splashBrandText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  splashTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 2,
    marginTop: 6,
  },
  splashHomeIndicator: {
    position: 'absolute',
    bottom: 20,
    width: 135,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#111827',
  },
});

import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  inverted?: boolean;
  forceDarkText?: boolean;
  style?: StyleProp<ViewStyle>;
}

const logoImg = require('../../../assets/logo.png');

export function AppLogo({
  size = 'md',
  iconOnly = false,
  inverted = false,
  forceDarkText = false,
  style,
}: AppLogoProps) {
  const { colors, isDark } = useTheme();

  const dimensions = {
    sm: { box: 34, img: 26, text: 13, gap: 8 },
    md: { box: 42, img: 32, text: 16, gap: 10 },
    lg: { box: 56, img: 44, text: 21, gap: 12 },
  }[size];

  const textColor = inverted
    ? '#FFFFFF'
    : forceDarkText
    ? '#111827'
    : isDark
    ? '#FFFFFF'
    : '#111827';

  return (
    <View style={[styles.container, { gap: dimensions.gap }, style]}>
      {/* Web Version Rounded Logo Badge */}
      <View
        style={[
          styles.badge,
          {
            width: dimensions.box,
            height: dimensions.box,
            borderRadius: dimensions.box * 0.28,
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          },
        ]}
      >
        <Image
          source={logoImg}
          style={{ width: dimensions.img, height: dimensions.img }}
          resizeMode="contain"
        />
      </View>

      {!iconOnly && (
        <Text
          numberOfLines={1}
          style={[
            styles.brandText,
            {
              fontSize: dimensions.text,
              color: textColor,
            },
          ]}
        >
          Arif <Text style={styles.accentText}>Car Sell</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  brandText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.4,
  },
  accentText: {
    color: '#FF4846', // Exact web version brand red/orange accent
  },
});

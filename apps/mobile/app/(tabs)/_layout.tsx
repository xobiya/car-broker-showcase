import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useSession } from '../../src/features/auth/SessionContext';

const icons: Record<
  string,
  {
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
  }
> = {
  index: { active: 'home', inactive: 'home-outline' },
  search: { active: 'compass', inactive: 'compass-outline' },
  sell: { active: 'add', inactive: 'add' },
  compare: { active: 'trophy', inactive: 'trophy-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
  favorites: { active: 'heart', inactive: 'heart-outline' },
  track: { active: 'cube', inactive: 'cube-outline' },
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useSession();
  const handleCenterAddPress = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or register an account to add a vehicle listing.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { tab: 'signin', returnTo: '/listing-form' },
              }),
          },
        ],
      );
      return;
    }
    // Directly open the adding form vehicles as requested
    router.push('/listing-form');
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#8A92A6' : '#8A909D',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Math.max(insets.bottom, 12),
          height: 66,
          paddingTop: 8,
          paddingBottom: 6,
          borderTopWidth: 0,
          borderRadius: 32,
          backgroundColor: isDark ? '#141721' : colors.card,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.line,
        },
        tabBarIcon: ({ focused, color }) => {
          const iconPair = icons[route.name] ?? {
            active: 'ellipse',
            inactive: 'ellipse-outline',
          };
          const iconName = focused ? iconPair.active : iconPair.inactive;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home', 'Home'),
        }}
      />

      {/* 2. Explore Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: t('nav.explore', 'Explore'),
        }}
      />

      {/* 3. Center Add Button (Directly opens the vehicle adding form) */}
      <Tabs.Screen
        name="sell"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <Pressable
              {...props}
              accessibilityRole="button"
              accessibilityLabel="Add car listing"
              onPress={handleCenterAddPress}
              style={[props.style, styles.centerButtonContainer]}
            >
              <View
                style={[
                  styles.centerAddButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: isDark ? '#141721' : '#FFFFFF',
                  },
                ]}
              >
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </View>
            </Pressable>
          ),
        }}
      />

        {/* 4. Ranks Tab (Compare / Rankings) */}
        <Tabs.Screen
          name="compare"
          options={{
            title: t('nav.ranks', 'Ranks'),
          }}
        />

        {/* 5. Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: t('nav.profile', 'Profile'),
          }}
        />

        {/* Hidden internal routes */}
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="track" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  centerAddButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

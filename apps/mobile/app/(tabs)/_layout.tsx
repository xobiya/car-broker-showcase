import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/tokens';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  sell: 'car-outline',
  search: 'search-outline',
  favorites: 'heart-outline',
  profile: 'person-outline',
};
export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: '#6F7B8E',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginBottom: 3 },
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Math.max(insets.bottom, 12),
          height: 70,
          paddingTop: 8,
          paddingBottom: 5,
          borderTopWidth: 0,
          borderRadius: 22,
          backgroundColor: colors.navySoft,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={icons[route.name] ?? 'ellipse-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="sell" options={{ title: 'Vehicles' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
    </Tabs>
  );
}

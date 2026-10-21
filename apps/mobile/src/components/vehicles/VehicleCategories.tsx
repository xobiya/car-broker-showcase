import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius } from '../../theme/tokens';

const categories = [
  { label: 'Sedan', icon: 'car-outline' },
  { label: 'SUV', icon: 'car-sport-outline' },
  { label: 'Hatchback', icon: 'car-outline' },
  { label: 'Pickup', icon: 'car-outline' },
  { label: 'Van', icon: 'bus-outline' },
  { label: 'Bus', icon: 'bus-outline' },
  { label: 'Truck', icon: 'car-outline' },
  { label: 'Machinery', icon: 'construct-outline' },
  { label: 'Motorcycle', icon: 'bicycle-outline' },
] as const;

export function VehicleCategories() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.eyebrow}>BROWSE BY TYPE</Text>
      <Text style={styles.title}>Find the shape you need</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((category) => (
          <Pressable
            key={category.label}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${category.label} vehicles`}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search',
                params: { bodyType: category.label },
              })
            }
            style={styles.item}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={category.icon as keyof typeof Ionicons.glyphMap}
                size={25}
                color={colors.green}
              />
            </View>
            <Text style={styles.label}>{category.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 22 },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
    marginBottom: 13,
  },
  row: { gap: 8, paddingRight: 16 },
  item: {
    width: 82,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  label: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
});

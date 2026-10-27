import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ActionButton, Field, SectionHeading } from '../src/components/common/Controls';
import { ErrorState, LoadingState } from '../src/components/common/RequestState';
import { useSession } from '../src/features/auth/SessionContext';
import {
  useCreateVehicle,
  useUpdateVehicle,
  useVehicle,
} from '../src/features/vehicles/vehicle-queries';
import { uploadFiles } from '../src/features/vehicles/vehicle-service';
import { useTheme } from '../src/theme/ThemeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { QuickHeaderSwitcher } from '../src/components/common/PreferencesSwitcher';
import { radius } from '../src/theme/tokens';
import type { Vehicle } from '../src/types/models';

type ListingFields = {
  brand: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  location: string;
  description: string;
  bodyType: string;
  condition: string;
  fuelType: string;
  transmission: string;
  color: string;
  engineSize: string;
};

const initialFields: ListingFields = {
  brand: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  location: '',
  description: '',
  bodyType: 'SUV',
  condition: 'Used',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  color: '',
  engineSize: '',
};

const fuels = [
  { label: 'Petrol', icon: 'flame-outline' as const },
  { label: 'Diesel', icon: 'water-outline' as const },
  { label: 'Hybrid', icon: 'leaf-outline' as const },
  { label: 'Electric', icon: 'flash-outline' as const },
];

const transmissions = [
  { label: 'Automatic', icon: 'swap-horizontal-outline' as const },
  { label: 'Manual', icon: 'settings-outline' as const },
];

const conditions = [
  { label: 'New', icon: 'sparkles-outline' as const },
  { label: 'Used', icon: 'time-outline' as const },
];

const bodies = [
  'SUV',
  'Sedan',
  'Hatchback',
  'Pickup',
  'Van',
  'Electric',
  'Luxury',
];

const assetMime = (asset: ImagePicker.ImagePickerAsset) =>
  asset.mimeType || 'image/jpeg';
const assetName = (asset: ImagePicker.ImagePickerAsset, index: number) =>
  asset.fileName || `vehicle-${Date.now()}-${index}.jpg`;

export default function ListingFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const { user } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const existing = useVehicle(id || '');
  const create = useCreateVehicle();
  const update = useUpdateVehicle();

  const [fields, setFields] = useState<ListingFields>(initialFields);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [libre, setLibre] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [existingLibre, setExistingLibre] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(id);
  const loading = isEdit && existing.isLoading;
  const saving = busy || create.isPending || update.isPending;

  useEffect(() => {
    const v = existing.data;
    if (!v) return;
    setFields({
      brand: v.brand || '',
      model: v.model || '',
      year: String(v.year || ''),
      price: String(v.price || ''),
      mileage: String(v.mileage || ''),
      location: v.location || '',
      description: v.description || '',
      bodyType: v.bodyType || 'SUV',
      condition: v.condition || 'Used',
      fuelType: v.fuelType || 'Petrol',
      transmission: v.transmission || 'Automatic',
      color: v.color || '',
      engineSize: v.engineSize || '',
    });
    setExistingPhotos(
      [v.imageUrl, ...(v.gallery ?? [])]
        .filter((x): x is string => Boolean(x))
        .filter((x, i, a) => a.indexOf(x) === i),
    );
    setExistingLibre(v.ownershipDocumentUrl || '');
  }, [existing.data]);

  const photoCount = existingPhotos.length + photos.length;
  const updateField = (key: keyof ListingFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const choosePhotos = async () => {
    if (photoCount >= 5) {
      return Alert.alert(
        'Photo limit reached',
        'A listing can include up to 5 photos.',
      );
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(
        'Photo access needed',
        'Please allow photo library access to choose vehicle pictures.',
      );
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - photoCount,
      quality: 0.8,
      exif: false,
    });
    if (!result.canceled) {
      setPhotos((prev) =>
        [...prev, ...result.assets].slice(0, 5 - existingPhotos.length),
      );
    }
  };

  const chooseLibre = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 10 * 1024 * 1024) {
      return Alert.alert('File is too large', 'Please choose a file under 10 MB.');
    }
    setLibre(file);
    setExistingLibre('');
  };

  const removePhoto = (index: number) => {
    if (index < existingPhotos.length) {
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPhotos((prev) =>
        prev.filter((_, i) => i !== index - existingPhotos.length),
      );
    }
  };

  const saveListing = async () => {
    setError('');
    if (!user) {
      return router.push('/login');
    }
    if (!fields.brand.trim() || !fields.model.trim()) {
      return setError('Please enter the make and model (e.g. Toyota RAV4).');
    }
    const year = Number(fields.year);
    const price = Number(fields.price.replace(/[^\d.]/g, ''));
    const mileage = Number(fields.mileage.replace(/\D/g, '') || 0);

    if (
      !Number.isInteger(year) ||
      year < 1980 ||
      year > new Date().getFullYear() + 1
    ) {
      return setError('Please enter a valid model year (e.g. 2022).');
    }
    if (!Number.isFinite(price) || price <= 0) {
      return setError('Please enter a valid price greater than zero.');
    }
    if (!Number.isFinite(mileage) || mileage < 0) {
      return setError('Please enter a valid mileage.');
    }
    if (!fields.location.trim()) {
      return setError('Please add the vehicle city or area (e.g. Addis Ababa, Bole).');
    }
    if (photoCount === 0) {
      return setError('Please add at least one clear vehicle photo.');
    }
    if (!existingLibre && !libre) {
      return setError(
        'Upload genuine vehicle ownership documentation (Libre) for broker review.',
      );
    }

    setBusy(true);
    try {
      let uploadedPhotos: string[] = [];
      if (photos.length) {
        const result = await uploadFiles(
          photos.map((photo, i) => ({
            uri: photo.uri,
            name: assetName(photo, i),
            type: assetMime(photo),
          })),
          'vehicles',
        );
        uploadedPhotos = result.urls;
      }

      let ownershipDocumentUrl = existingLibre;
      if (libre) {
        const result = await uploadFiles(
          [
            {
              uri: libre.uri,
              name: libre.name,
              type: libre.mimeType || 'application/pdf',
            },
          ],
          'documents',
        );
        ownershipDocumentUrl = result.urls[0] || '';
      }

      const gallery = [...existingPhotos, ...uploadedPhotos];
      const body = {
        brand: fields.brand.trim(),
        model: fields.model.trim(),
        year,
        price,
        original_price: price,
        mileage,
        location: fields.location.trim(),
        description: fields.description.trim(),
        fuel_type: fields.fuelType,
        transmission: fields.transmission,
        condition: fields.condition,
        body_type: fields.bodyType,
        color: fields.color.trim(),
        engine_size: fields.engineSize.trim(),
        image_url: gallery[0],
        gallery_images: JSON.stringify(gallery),
        ownership_document_url: ownershipDocumentUrl,
        ownership_document_name: libre?.name || 'Ownership Certificate (Libre)',
      };

      if (isEdit && id) {
        await update.mutateAsync({ id, body });
      } else {
        await create.mutateAsync(body);
      }

      Alert.alert(
        isEdit ? 'Listing Updated' : 'Listing Submitted',
        isEdit
          ? 'Your vehicle changes have been saved.'
          : 'Your listing has been submitted for verified Libre review. An accredited broker will review it shortly.',
        [{ text: 'View My Garage', onPress: () => router.replace('/(tabs)/sell') }],
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save listing. Please check connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.paper }]}>
        <View style={[styles.guestBox, { backgroundColor: colors.white, borderColor: colors.line }]}>
          <Ionicons name="car-outline" size={44} color={colors.primary} />
          <Text style={[styles.title, { color: colors.ink }]}>Sign In to Sell Your Car</Text>
          <Text style={[styles.guestSub, { color: colors.muted }]}>
            Create a verified seller account with authentic Libre documentation to connect with buyers.
          </Text>
          <ActionButton
            label="Sign In / Register"
            onPress={() => router.push('/login')}
            style={{ width: '100%', marginTop: 8 }}
          />
        </View>
      </View>
    );
  }

  if (loading) return <LoadingState label="Loading vehicle details…" />;

  if (isEdit && (existing.error || !existing.data)) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.paper }]}>
        <ErrorState
          message={existing.error?.message || 'Listing not found'}
          onRetry={() => void existing.refetch()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {/* Responsive Safe Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.line,
            paddingTop: Math.max(insets.top + 8, 20),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go Back"
          style={[styles.backBtn, { backgroundColor: isDark ? '#232733' : '#F4F5F8', borderColor: colors.line }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {isEdit ? 'UPDATE LISTING' : 'VERIFIED SELLER PORTAL'}
          </Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {isEdit ? 'Edit Vehicle Details' : 'Post Vehicle for Sale'}
          </Text>
        </View>

        <QuickHeaderSwitcher />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Guarantee Notice */}
        <View
          style={[
            styles.notice,
            {
              backgroundColor: isDark ? '#142820' : '#E8F5E9',
              borderColor: isDark ? '#1E4233' : '#C8E6C9',
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={22} color="#059669" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.noticeHeading, { color: isDark ? '#4ADE80' : '#1B5E20' }]}>
              100% Genuine Libre Verification
            </Text>
            <Text style={[styles.noticeText, { color: isDark ? '#A7F3D0' : '#2E7D32' }]}>
              Every listed vehicle is cross-checked with the Addis Ababa Road & Transport Bureau. Clean title deeds build buyer trust and sell 3x faster.
            </Text>
          </View>
        </View>

        {/* Section 1: Basic Vehicle Specs */}
        <SectionHeading
          title="Vehicle Information"
          subtitle="Essential details buyers filter for in the showroom."
        />

        <View style={[styles.two, isCompact && styles.columnStack]}>
          <Field
            label="Make / Brand *"
            value={fields.brand}
            onChangeText={(v) => updateField('brand', v)}
            placeholder="Toyota"
            autoCapitalize="words"
            containerStyle={styles.half}
          />
          <Field
            label="Model *"
            value={fields.model}
            onChangeText={(v) => updateField('model', v)}
            placeholder="Land Cruiser / RAV4"
            autoCapitalize="words"
            containerStyle={styles.half}
          />
        </View>

        <View style={[styles.two, isCompact && styles.columnStack]}>
          <Field
            label="Model Year *"
            value={fields.year}
            onChangeText={(v) =>
              updateField('year', v.replace(/\D/g, '').slice(0, 4))
            }
            placeholder="2023"
            keyboardType="number-pad"
            containerStyle={styles.half}
          />
          <Field
            label="Asking Price (ETB) *"
            value={fields.price}
            onChangeText={(v) =>
              updateField('price', v.replace(/[^\d.]/g, ''))
            }
            placeholder="4,800,000"
            keyboardType="decimal-pad"
            containerStyle={styles.half}
          />
        </View>

        <View style={[styles.two, isCompact && styles.columnStack]}>
          <Field
            label="Mileage (km) *"
            value={fields.mileage}
            onChangeText={(v) =>
              updateField('mileage', v.replace(/\D/g, ''))
            }
            placeholder="38,000"
            keyboardType="number-pad"
            containerStyle={styles.half}
          />
          <Field
            label="Location in Ethiopia *"
            value={fields.location}
            onChangeText={(v) => updateField('location', v)}
            placeholder="Addis Ababa, Bole"
            autoCapitalize="words"
            containerStyle={styles.half}
          />
        </View>

        {/* Choice: Condition */}
        <ChoiceSelector
          label="Vehicle Condition"
          choices={conditions.map((c) => ({
            value: c.label,
            label: c.label,
            icon: c.icon,
          }))}
          value={fields.condition}
          onChange={(v) => updateField('condition', v)}
        />

        {/* Choice: Fuel Type */}
        <ChoiceSelector
          label="Fuel & Powertrain"
          choices={fuels.map((f) => ({
            value: f.label,
            label: f.label,
            icon: f.icon,
          }))}
          value={fields.fuelType}
          onChange={(v) => updateField('fuelType', v)}
        />

        {/* Choice: Transmission */}
        <ChoiceSelector
          label="Transmission"
          choices={transmissions.map((t) => ({
            value: t.label,
            label: t.label,
            icon: t.icon,
          }))}
          value={fields.transmission}
          onChange={(v) => updateField('transmission', v)}
        />

        {/* Choice: Body Type */}
        <ChoiceSelector
          label="Body Type"
          choices={bodies.map((b) => ({ value: b, label: b }))}
          value={fields.bodyType}
          onChange={(v) => updateField('bodyType', v)}
        />

        <View style={[styles.two, isCompact && styles.columnStack]}>
          <Field
            label="Exterior Color (Optional)"
            value={fields.color}
            onChangeText={(v) => updateField('color', v)}
            placeholder="Pearl White / Black"
            containerStyle={styles.half}
          />
          <Field
            label="Engine Displacement (Optional)"
            value={fields.engineSize}
            onChangeText={(v) => updateField('engineSize', v)}
            placeholder="2.5 L / Dual Motor"
            containerStyle={styles.half}
          />
        </View>

        <Field
          label="Description & Highlights *"
          value={fields.description}
          onChangeText={(v) => updateField('description', v)}
          placeholder="Describe condition, accident history, service records, and special features."
          multiline
          maxLength={1200}
        />

        {/* Section 2: Photos */}
        <SectionHeading
          title="Vehicle Photos"
          subtitle={`${photoCount}/5 photos · The first photo serves as the showroom cover.`}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoScrollRow}
        >
          {/* Add Photo Button */}
          {photoCount < 5 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Photo"
              onPress={() => void choosePhotos()}
              style={[
                styles.addPhotoCard,
                {
                  backgroundColor: isDark ? '#232733' : '#F8F9FA',
                  borderColor: isDark ? '#374151' : '#D1D5DB',
                },
              ]}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                + Add Photo
              </Text>
              <Text style={[styles.addPhotoSub, { color: colors.muted }]}>
                {photoCount}/5
              </Text>
            </Pressable>
          )}

          {/* Photo Previews */}
          {[
            ...existingPhotos.map((uri) => ({ uri, source: 'saved' as const })),
            ...photos.map((asset) => ({ uri: asset.uri, source: 'new' as const })),
          ].map((photo, index) => (
            <View key={`${photo.uri}-${index}`} style={styles.photoWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photoImg} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={() => removePhoto(index)}
                style={styles.removePhotoBadge}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>COVER</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Section 3: Ownership Document (Libre) */}
        <SectionHeading
          title="Ownership Document (Libre)"
          subtitle="Clear photo or PDF of the registered Ethiopian Libre certificate."
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => void chooseLibre()}
          style={[
            styles.documentCard,
            {
              backgroundColor: colors.white,
              borderColor: libre || existingLibre ? '#059669' : colors.line,
            },
          ]}
        >
          <View
            style={[
              styles.documentIconWrap,
              {
                backgroundColor:
                  libre || existingLibre
                    ? 'rgba(5, 150, 105, 0.12)'
                    : isDark
                    ? '#2C1B14'
                    : '#FFF2EB',
              },
            ]}
          >
            <Ionicons
              name={libre || existingLibre ? 'document-text' : 'cloud-upload-outline'}
              size={24}
              color={libre || existingLibre ? '#059669' : colors.primary}
            />
          </View>

          <View style={styles.documentTextCol}>
            <Text style={[styles.documentTitle, { color: colors.ink }]} numberOfLines={1}>
              {libre?.name ||
                (existingLibre
                  ? 'Libre Document Uploaded & Verified'
                  : 'Tap to Upload Libre (ሊብሬ)')}
            </Text>
            <Text style={[styles.documentSub, { color: colors.muted }]}>
              {libre || existingLibre
                ? 'Tap here to change or replace file'
                : 'PDF, JPEG, PNG or WebP · Up to 10 MB'}
            </Text>
          </View>

          <Ionicons
            name={libre || existingLibre ? 'checkmark-circle' : 'chevron-forward'}
            size={22}
            color={libre || existingLibre ? '#059669' : colors.muted}
          />
        </Pressable>

        {/* Error Alert Banner */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit Action Button */}
        <View style={styles.submitWrap}>
          <ActionButton
            label={
              saving
                ? 'Submitting Listing…'
                : isEdit
                ? 'Save Vehicle Changes'
                : 'Submit Listing for Review'
            }
            busy={saving}
            onPress={() => void saveListing()}
            style={styles.submitBtn}
          />
          <Text style={[styles.footnote, { color: colors.muted }]}>
            By submitting, you certify that you possess legal authority to sell this vehicle and that the vehicle Libre documents are genuine.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ChoiceSelector({
  label,
  choices,
  value,
  onChange,
}: {
  label: string;
  choices: Array<{
    value: string;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.choiceWrap}>
      <Text style={[styles.choiceLabel, { color: colors.ink }]}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.choiceRow}
      >
        {choices.map((choice) => {
          const isSelected = value === choice.value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="button"
              onPress={() => onChange(choice.value)}
              style={[
                styles.choiceChip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? '#2C1B14'
                      : '#FFF2EB'
                    : colors.white,
                  borderColor: isSelected ? colors.primary : colors.line,
                },
              ]}
            >
              {choice.icon && (
                <Ionicons
                  name={choice.icon}
                  size={14}
                  color={isSelected ? colors.primary : colors.muted}
                />
              )}
              <Text
                style={[
                  styles.choiceChipText,
                  { color: isSelected ? colors.primary : colors.muted },
                ]}
              >
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.large,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  guestSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  notice: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderRadius: radius.medium,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  noticeHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  two: {
    flexDirection: 'row',
    gap: 12,
  },
  columnStack: {
    flexDirection: 'column',
    gap: 0,
  },
  half: {
    flex: 1,
  },
  choiceWrap: {
    marginBottom: 16,
  },
  choiceLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  choiceRow: {
    gap: 8,
    paddingRight: 10,
  },
  choiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  photoScrollRow: {
    gap: 12,
    paddingBottom: 14,
    paddingRight: 10,
  },
  addPhotoCard: {
    width: 105,
    height: 95,
    borderRadius: radius.medium,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '800',
  },
  addPhotoSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  photoWrap: {
    width: 125,
    height: 95,
    borderRadius: radius.medium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coverBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 14,
    minHeight: 70,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  documentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentTextCol: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  documentSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.medium,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  submitWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtn: {
    minHeight: 52,
  },
  footnote: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    paddingHorizontal: 8,
  },
});

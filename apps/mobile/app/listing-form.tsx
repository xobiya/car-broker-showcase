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
import { ComboDropdown } from '../src/components/common/ComboDropdown';
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
import { formatPrice } from '../src/utils/currency';

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

const ALL_BRANDS = [
  'Toyota',
  'Hyundai',
  'Suzuki',
  'Kia',
  'Mercedes-Benz',
  'BMW',
  'Nissan',
  'Ford',
  'Volkswagen',
  'Mitsubishi',
  'BYD',
  'Jetour',
  'Geely',
  'Isuzu',
  'Chery',
  'Peugeot',
  'Land Rover',
  'Audi',
  'Honda',
  'Mazda',
  'Chevrolet',
  'Jeep',
  'Lexus',
  'Subaru',
];

const BRAND_MODELS: Record<string, string[]> = {
  Toyota: [
    'Land Cruiser 300',
    'Land Cruiser Prado',
    'RAV4',
    'Hilux',
    'Fortuner',
    'Corolla',
    'Corolla Cross',
    'Yaris',
    'Vitz',
    'Rush',
    'HiAce',
    'Camry',
    'Land Cruiser 79',
    'Urban Cruiser',
  ],
  Hyundai: [
    'Tucson',
    'Santa Fe',
    'Elantra',
    'Creta',
    'Kona',
    'Venue',
    'Grand i10',
    'Palisade',
    'Ioniq 5',
    'Sonata',
  ],
  Suzuki: [
    'Dzire',
    'Swift',
    'Jimny',
    'Vitara',
    'Grand Vitara',
    'Ciaz',
    'Baleno',
    'S-Presso',
    'Ertiga',
    'Alto',
  ],
  Kia: [
    'Sportage',
    'Seltos',
    'Sorento',
    'Pegas',
    'Picanto',
    'Carnival',
    'EV6',
    'Sonet',
  ],
  'Mercedes-Benz': [
    'C-Class (C200 / C300)',
    'E-Class (E200 / E300)',
    'S-Class (S500)',
    'GLE 450',
    'GLC 300',
    'G-Wagon (G63)',
    'CLA 200',
    'A-Class',
  ],
  BMW: [
    '3 Series (320i / 330i)',
    '5 Series (520i / 530i)',
    '7 Series',
    'X1',
    'X3',
    'X5',
    'X6',
    'X7',
  ],
  Nissan: [
    'Patrol',
    'X-Trail',
    'Qashqai',
    'Navara',
    'Sunny',
    'Kicks',
    'Altima',
  ],
  Ford: [
    'Ranger',
    'Everest',
    'Explorer',
    'F-150',
    'Edge',
    'EcoSport',
  ],
  Volkswagen: [
    'Tiguan',
    'Touareg',
    'Golf',
    'Passat',
    'ID.4',
    'Amarok',
    'T-Cross',
  ],
  Mitsubishi: [
    'Pajero',
    'Outlander',
    'L200 Pickup',
    'Eclipse Cross',
    'ASX',
  ],
  BYD: [
    'Song Plus',
    'Tang',
    'Han',
    'Atto 3',
    'Seagull',
    'Dolphin',
    'Seal',
  ],
  Jetour: [
    'Dashing',
    'X70 Plus',
    'X90 Plus',
    'T2 Traveller',
  ],
  Geely: [
    'Coolray',
    'Azkarra',
    'Monjaro',
    'Emgrand',
  ],
  Isuzu: [
    'D-Max Pickup',
    'mu-X SUV',
    'NPR Truck',
    'FSR Truck',
  ],
};

const COMMON_MODELS = [
  'RAV4',
  'Land Cruiser',
  'Tucson',
  'Swift',
  'Dzire',
  'Hilux',
  'Corolla',
  'Sportage',
  'C-Class',
  '3 Series',
  'Patrol',
  'Song Plus',
  'Dashing',
];

const YEARS = Array.from({ length: 27 }, (_, i) => String(2026 - i));

const bodies = [
  'SUV',
  'Sedan',
  'Hatchback',
  'Pickup',
  'Van',
  'Electric',
  'Luxury',
];

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

const ENGINE_SIZES = [
  '1.0L',
  '1.2L',
  '1.3L',
  '1.5L',
  '1.6L',
  '1.8L',
  '2.0L',
  '2.0L Turbo',
  '2.4L',
  '2.5L',
  '2.8L Diesel',
  '3.0L V6',
  '3.5L V6',
  '4.0L V6',
  '4.5L V8 Turbo',
  '5.7L V8',
  'Electric (Single Motor)',
  'Electric (Dual Motor AWD)',
];

const COLORS = [
  'Pearl White',
  'Metallic Silver',
  'Jet Black',
  'Dark Grey / Charcoal',
  'Navy Blue',
  'Crimson Red',
  'Golden Bronze',
  'Desert Sand / Beige',
  'Forest Green',
  'Brown',
];

const ETHIOPIAN_LOCATIONS = [
  'Addis Ababa, Bole',
  'Addis Ababa, Kazanchis',
  'Addis Ababa, CMC / Ayat',
  'Addis Ababa, Sarbet',
  'Addis Ababa, Piassa / Arat Kilo',
  'Addis Ababa, Megenagna',
  'Addis Ababa, Gerji / Summit',
  'Addis Ababa, Mexico / Lideta',
  'Addis Ababa, Lebu / Jemo',
  'Addis Ababa, Gotera / Kera',
  'Hawassa',
  'Adama (Nazret)',
  'Bahir Dar',
  'Dire Dawa',
  'Bishoftu (Debre Zeit)',
  'Gondar',
  'Mekelle',
  'Jimma',
];

const STEPS = [
  { id: 1, title: 'Basics', icon: 'car-sport-outline' as const },
  { id: 2, title: 'Specs', icon: 'speedometer-outline' as const },
  { id: 3, title: 'Price & Area', icon: 'cash-outline' as const },
  { id: 4, title: 'Media & Review', icon: 'images-outline' as const },
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

  const { user, ready } = useSession();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const existing = useVehicle(id || '');
  const create = useCreateVehicle();
  const update = useUpdateVehicle();

  const [step, setStep] = useState(1);
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

  // Dynamically compute available model suggestions based on selected brand
  const modelSuggestions = useMemo(() => {
    const currentBrand = fields.brand.trim();
    if (!currentBrand) return COMMON_MODELS;
    const match = Object.keys(BRAND_MODELS).find(
      (b) => b.toLowerCase() === currentBrand.toLowerCase(),
    );
    if (match && BRAND_MODELS[match]) {
      return BRAND_MODELS[match];
    }
    return COMMON_MODELS;
  }, [fields.brand]);

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

  // Step Validation logic
  const validateStep = (targetStep: number): boolean => {
    setError('');
    if (targetStep === 1) {
      if (!fields.brand.trim()) {
        setError('Please select or type the vehicle Brand / Make (e.g. Toyota).');
        return false;
      }
      if (!fields.model.trim()) {
        setError('Please select or type the vehicle Model (e.g. RAV4 / Land Cruiser).');
        return false;
      }
      const year = Number(fields.year);
      if (
        !Number.isInteger(year) ||
        year < 1980 ||
        year > new Date().getFullYear() + 1
      ) {
        setError('Please choose or enter a valid model year (e.g. 2022).');
        return false;
      }
    } else if (targetStep === 2) {
      const mileage = Number(fields.mileage.replace(/\D/g, '') || 0);
      if (!Number.isFinite(mileage) || mileage < 0) {
        setError('Please enter a valid odometer mileage in kilometers.');
        return false;
      }
    } else if (targetStep === 3) {
      const price = Number(fields.price.replace(/[^\d.]/g, ''));
      if (!Number.isFinite(price) || price <= 0) {
        setError('Please enter a valid listing price in ETB.');
        return false;
      }
      if (!fields.location.trim()) {
        setError('Please select or specify the vehicle city / area in Ethiopia.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const saveListing = async () => {
    setError('');
    // Session verification: prompt only if not logged in
    if (!user) {
      Alert.alert(
        'Sign In to Submit Listing',
        'Your vehicle details are saved! Please sign in or register to publish your car listing.',
        [
          { text: 'Keep Editing', style: 'cancel' },
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

    if (!fields.brand.trim() || !fields.model.trim()) {
      setStep(1);
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
      setStep(1);
      return setError('Please enter a valid model year (e.g. 2022).');
    }
    if (!Number.isFinite(price) || price <= 0) {
      setStep(3);
      return setError('Please enter a valid price greater than zero.');
    }
    if (!fields.location.trim()) {
      setStep(3);
      return setError('Please add the vehicle city or area (e.g. Addis Ababa, Bole).');
    }
    if (photoCount === 0) {
      setStep(4);
      return setError('Please add at least one clear vehicle photo.');
    }
    if (!existingLibre && !libre) {
      setStep(4);
      return setError(
        'Please upload genuine vehicle ownership documentation (Libre) for broker review.',
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
          : 'Your vehicle has been submitted for broker review.',
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

  // Wait for session readiness before rendering form
  if (!ready || loading) {
    return <LoadingState label="Loading vehicle details…" />;
  }

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

  const numericPrice = Number(fields.price.replace(/[^\d.]/g, '') || 0);

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.paper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {/* ---------------------------------------------------- */}
      {/* HEADER WITH CLOSE & PREFERENCES                      */}
      {/* ---------------------------------------------------- */}
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
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? '#232733' : '#F4F5F8',
              borderColor: colors.line,
            },
          ]}
          onPress={() => {
            if (step > 1) {
              handlePrevStep();
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
        >
          <Ionicons
            name={step > 1 ? 'arrow-back' : 'close'}
            size={22}
            color={colors.ink}
          />
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {isEdit ? 'EDIT LISTING' : `STEP ${step} OF ${STEPS.length}`}
          </Text>
          <Text style={[styles.title, { color: colors.ink }]}>
            {STEPS[step - 1].title}
          </Text>
        </View>

        <QuickHeaderSwitcher />
      </View>

      {/* ---------------------------------------------------- */}
      {/* STEP PROGRESS BAR & TABS                             */}
      {/* ---------------------------------------------------- */}
      <View
        style={[
          styles.stepperContainer,
          {
            backgroundColor: isDark ? '#141721' : '#FFFFFF',
            borderBottomColor: colors.line,
          },
        ]}
      >
        <View style={styles.stepsRow}>
          {STEPS.map((s) => {
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  if (s.id < step) {
                    setStep(s.id);
                  } else if (s.id === step + 1 && validateStep(step)) {
                    setStep(s.id);
                  }
                }}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : isCompleted
                        ? '#059669'
                        : isDark
                        ? '#22283A'
                        : '#EDEFF2',
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        { color: isActive ? '#FFFFFF' : colors.muted },
                      ]}
                    >
                      {s.id}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepTitleText,
                    {
                      color: isActive
                        ? colors.primary
                        : isCompleted
                        ? colors.ink
                        : colors.muted,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  {s.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* Animated indicator bar */}
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: isDark ? '#232838' : '#E5E7EB' },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: `${(step / STEPS.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT FORM (Based on Active Step)             */}
      {/* ---------------------------------------------------- */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ---------------------------------------------------- */}
        {/* STEP 1: VEHICLE BASICS & MODEL                       */}
        {/* ---------------------------------------------------- */}
        {step === 1 && (
          <View style={styles.stepSection}>
            <SectionHeading
              title="Vehicle Make & Model"
              subtitle="Select from the dropdown or type your car's brand, model, and year."
            />

            {/* Brand Combobox Dropdown + Typing */}
            <ComboDropdown
              label="Make / Brand *"
              value={fields.brand}
              onChangeText={(val) => {
                updateField('brand', val);
              }}
              options={ALL_BRANDS}
              placeholder="e.g. Toyota, Hyundai, Suzuki…"
            />

            {/* Model Combobox Dropdown + Typing (Suggestions based on brand) */}
            <ComboDropdown
              label="Model *"
              value={fields.model}
              onChangeText={(val) => updateField('model', val)}
              options={modelSuggestions}
              placeholder="e.g. RAV4, Land Cruiser, Tucson…"
            />

            <View style={[styles.two, isCompact && styles.columnStack]}>
              {/* Year Combobox Dropdown + Typing */}
              <View style={styles.half}>
                <ComboDropdown
                  label="Model Year *"
                  value={fields.year}
                  onChangeText={(val) =>
                    updateField('year', val.replace(/\D/g, '').slice(0, 4))
                  }
                  options={YEARS}
                  placeholder="e.g. 2022"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.half}>
                <Text style={[styles.label, { color: colors.ink }]}>
                  Condition *
                </Text>
                <View style={styles.conditionRow}>
                  {conditions.map((c) => {
                    const isSelected = fields.condition === c.label;
                    return (
                      <Pressable
                        key={c.label}
                        onPress={() => updateField('condition', c.label)}
                        style={[
                          styles.segmentBtn,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : isDark
                              ? '#1C212E'
                              : '#F3F4F6',
                            borderColor: isSelected
                              ? colors.primary
                              : colors.line,
                          },
                        ]}
                      >
                        <Ionicons
                          name={c.icon}
                          size={15}
                          color={isSelected ? '#FFFFFF' : colors.muted}
                        />
                        <Text
                          style={[
                            styles.segmentBtnText,
                            { color: isSelected ? '#FFFFFF' : colors.ink },
                          ]}
                        >
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Body Type Selection */}
            <Text style={[styles.label, { color: colors.ink, marginTop: 4 }]}>
              Body Type *
            </Text>
            <View style={styles.pillsWrap}>
              {bodies.map((body) => {
                const isSelected = fields.bodyType === body;
                return (
                  <Pressable
                    key={body}
                    onPress={() => updateField('bodyType', body)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? '#1C212E'
                          : '#F3F4F6',
                        borderColor: isSelected ? colors.primary : colors.line,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFFFFF' : colors.ink },
                      ]}
                    >
                      {body}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: MECHANICAL SPECS & DETAILS                   */}
        {/* ---------------------------------------------------- */}
        {step === 2 && (
          <View style={styles.stepSection}>
            <SectionHeading
              title="Specifications & Mechanics"
              subtitle="Choose transmission, fuel type, mileage, engine, and color."
            />

            {/* Transmission */}
            <Text style={[styles.label, { color: colors.ink }]}>
              Transmission *
            </Text>
            <View style={styles.specChipsRow}>
              {transmissions.map((t) => {
                const isSelected = fields.transmission === t.label;
                return (
                  <Pressable
                    key={t.label}
                    onPress={() => updateField('transmission', t.label)}
                    style={[
                      styles.specChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? '#1C212E'
                          : '#F3F4F6',
                        borderColor: isSelected ? colors.primary : colors.line,
                      },
                    ]}
                  >
                    <Ionicons
                      name={t.icon}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.muted}
                    />
                    <Text
                      style={[
                        styles.specChipText,
                        { color: isSelected ? '#FFFFFF' : colors.ink },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Fuel Type */}
            <Text style={[styles.label, { color: colors.ink, marginTop: 14 }]}>
              Fuel Type *
            </Text>
            <View style={styles.pillsWrap}>
              {fuels.map((fuel) => {
                const isSelected = fields.fuelType === fuel.label;
                return (
                  <Pressable
                    key={fuel.label}
                    onPress={() => updateField('fuelType', fuel.label)}
                    style={[
                      styles.pillWithIcon,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? '#1C212E'
                          : '#F3F4F6',
                        borderColor: isSelected ? colors.primary : colors.line,
                      },
                    ]}
                  >
                    <Ionicons
                      name={fuel.icon}
                      size={15}
                      color={isSelected ? '#FFFFFF' : colors.muted}
                    />
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFFFFF' : colors.ink },
                      ]}
                    >
                      {fuel.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Mileage */}
            <Field
              label="Mileage (km) *"
              value={fields.mileage}
              onChangeText={(v) =>
                updateField('mileage', v.replace(/\D/g, ''))
              }
              placeholder="e.g. 45000"
              keyboardType="numeric"
              containerStyle={{ marginTop: 8 }}
            />

            {/* Engine Size Combobox Dropdown + Typing */}
            <ComboDropdown
              label="Engine Size"
              value={fields.engineSize}
              onChangeText={(v) => updateField('engineSize', v)}
              options={ENGINE_SIZES}
              placeholder="Select or type e.g. 2.0L Turbo / 2.5L…"
              autoCapitalize="none"
              containerStyle={{ marginTop: 4 }}
            />

            {/* Exterior Color Combobox Dropdown + Typing */}
            <ComboDropdown
              label="Exterior Color"
              value={fields.color}
              onChangeText={(v) => updateField('color', v)}
              options={COLORS}
              placeholder="Select or type e.g. Pearl White, Jet Black…"
              containerStyle={{ marginTop: 4 }}
            />
          </View>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: PRICING & LOCATION                           */}
        {/* ---------------------------------------------------- */}
        {step === 3 && (
          <View style={styles.stepSection}>
            <SectionHeading
              title="Pricing & Location"
              subtitle="Set your asking price in Ethiopian Birr and where the car is located."
            />

            {/* Price Input with Live Formatted Display */}
            <Field
              label="Asking Price (ETB) *"
              value={fields.price}
              onChangeText={(v) => updateField('price', v.replace(/[^\d.]/g, ''))}
              placeholder="e.g. 3850000"
              keyboardType="numeric"
            />
            {numericPrice > 0 && (
              <View
                style={[
                  styles.priceFormattedCard,
                  {
                    backgroundColor: isDark ? '#1C2333' : '#F0F9FF',
                    borderColor: isDark ? '#2B3954' : '#BAE6FD',
                  },
                ]}
              >
                <Ionicons name="pricetag" size={17} color={colors.primary} />
                <Text
                  style={[styles.priceFormattedText, { color: colors.primary }]}
                >
                  {formatPrice(numericPrice)}
                </Text>
              </View>
            )}

            {/* Location in Ethiopia Combobox Dropdown + Typing */}
            <View style={{ marginTop: 12 }}>
              <ComboDropdown
                label="City / Region in Ethiopia *"
                value={fields.location}
                onChangeText={(val) => updateField('location', val)}
                options={ETHIOPIAN_LOCATIONS}
                placeholder="Choose or type e.g. Addis Ababa, Bole…"
              />
            </View>

            {/* Description */}
            <Field
              label="Vehicle Description & Key Features"
              value={fields.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Highlight condition, maintenance history, sunroof, leather seats, 360 camera, etc."
              multiline
              numberOfLines={4}
              containerStyle={{ marginTop: 8 }}
            />
          </View>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: MEDIA, LIBRE DEED & FINAL REVIEW             */}
        {/* ---------------------------------------------------- */}
        {step === 4 && (
          <View style={styles.stepSection}>
            <SectionHeading
              title="Media & Verification"
              subtitle="Upload car photos and ownership title deed (Libre)."
            />

            {/* Photo Upload Section */}
            <View
              style={[
                styles.uploadCard,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.line,
                },
              ]}
            >
              <View style={styles.uploadHead}>
                <View>
                  <Text style={[styles.uploadTitle, { color: colors.ink }]}>
                    Vehicle Photos ({photoCount}/5) *
                  </Text>
                  <Text style={[styles.uploadSub, { color: colors.muted }]}>
                    First image is used as the showroom cover.
                  </Text>
                </View>
                <ActionButton
                  label="Add Photos"
                  icon={<Ionicons name="camera-outline" size={16} color="#FFFFFF" />}
                  onPress={choosePhotos}
                  disabled={photoCount >= 5}
                />
              </View>

              {photoCount > 0 ? (
                <View style={styles.photoGrid}>
                  {existingPhotos.map((uri, i) => (
                    <View key={`existing-${i}`} style={styles.photoItem}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      {i === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>COVER</Text>
                        </View>
                      )}
                      <Pressable
                        onPress={() => removePhoto(i)}
                        style={styles.deletePhotoBtn}
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                  {photos.map((asset, i) => (
                    <View
                      key={`new-${i}`}
                      style={styles.photoItem}
                    >
                      <Image
                        source={{ uri: asset.uri }}
                        style={styles.photoThumb}
                      />
                      {existingPhotos.length === 0 && i === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>COVER</Text>
                        </View>
                      )}
                      <Pressable
                        onPress={() => removePhoto(existingPhotos.length + i)}
                        style={styles.deletePhotoBtn}
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Pressable
                  onPress={choosePhotos}
                  style={[
                    styles.emptyDropzone,
                    {
                      borderColor: colors.line,
                      backgroundColor: isDark ? '#1C212E' : '#F9FAFB',
                    },
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={38}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.dropzoneTitle, { color: colors.ink }]}
                  >
                    Tap to upload photos
                  </Text>
                  <Text style={[styles.dropzoneSub, { color: colors.muted }]}>
                    Upload up to 5 clear exterior & interior shots
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Libre Document Upload Section */}
            <View
              style={[
                styles.uploadCard,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.line,
                  marginTop: 14,
                },
              ]}
            >
              <View style={styles.uploadHead}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadTitle, { color: colors.ink }]}>
                    Vehicle Title Deed (Libre) *
                  </Text>
                  <Text style={[styles.uploadSub, { color: colors.muted }]}>
                    Upload genuine title deed for broker review.
                  </Text>
                </View>
                <ActionButton
                  label={libre || existingLibre ? 'Change' : 'Upload'}
                  icon={
                    <Ionicons
                      name="document-attach-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                  }
                  onPress={chooseLibre}
                />
              </View>

              {libre || existingLibre ? (
                <View
                  style={[
                    styles.documentRow,
                    {
                      backgroundColor: isDark ? '#1A2920' : '#E8F5E9',
                      borderColor: '#059669',
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#059669"
                  />
                  <View style={styles.documentTextCol}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.documentTitle,
                        { color: isDark ? '#A7F3D0' : '#166534' },
                      ]}
                    >
                      {libre?.name || 'Verified Title Deed (Libre)'}
                    </Text>
                    <Text
                      style={[
                        styles.documentSub,
                        { color: isDark ? '#6EE7B7' : '#15803D' },
                      ]}
                    >
                      {libre?.size
                        ? `${(libre.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission`
                        : 'Document Attached'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={chooseLibre}
                  style={[
                    styles.emptyDropzone,
                    {
                      borderColor: colors.line,
                      backgroundColor: isDark ? '#1C212E' : '#F9FAFB',
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={36}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.dropzoneTitle, { color: colors.ink }]}
                  >
                    Tap to attach Libre certificate
                  </Text>
                  <Text style={[styles.dropzoneSub, { color: colors.muted }]}>
                    Supports PDF, PNG, JPG under 10 MB
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ---------------------------------------------------- */}
            {/* FINAL SUMMARY PREVIEW CARD                           */}
            {/* ---------------------------------------------------- */}
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#181C28' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.line,
                },
              ]}
            >
              <Text style={[styles.summaryHeading, { color: colors.ink }]}>
                Listing Summary
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryKey, { color: colors.muted }]}>
                    Car
                  </Text>
                  <Text style={[styles.summaryVal, { color: colors.ink }]}>
                    {fields.year} {fields.brand} {fields.model}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryKey, { color: colors.muted }]}>
                    Price
                  </Text>
                  <Text style={[styles.summaryVal, { color: colors.primary }]}>
                    {numericPrice > 0 ? formatPrice(numericPrice) : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryKey, { color: colors.muted }]}>
                    Specs
                  </Text>
                  <Text style={[styles.summaryVal, { color: colors.ink }]}>
                    {fields.transmission} • {fields.fuelType} • {fields.mileage || '0'} km
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryKey, { color: colors.muted }]}>
                    Location
                  </Text>
                  <Text style={[styles.summaryVal, { color: colors.ink }]}>
                    {fields.location || 'Not specified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ---------------------------------------------------- */}
      {/* FIXED STEPPER BOTTOM ACTION BAR                      */}
      {/* ---------------------------------------------------- */}
      <View
        style={[
          styles.footerBar,
          {
            backgroundColor: isDark ? '#141721' : '#FFFFFF',
            borderTopColor: colors.line,
            paddingBottom: Math.max(insets.bottom + 8, 16),
          },
        ]}
      >
        {step > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous Step"
            onPress={handlePrevStep}
            style={[
              styles.navBtnSecondary,
              {
                backgroundColor: isDark ? '#1E2333' : '#F3F4F6',
                borderColor: colors.line,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={17} color={colors.ink} />
            <Text style={[styles.navBtnSecondaryText, { color: colors.ink }]}>
              Back
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)');
            }}
            style={[
              styles.navBtnSecondary,
              {
                backgroundColor: isDark ? '#1E2333' : '#F3F4F6',
                borderColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.navBtnSecondaryText, { color: colors.muted }]}>
              Cancel
            </Text>
          </Pressable>
        )}

        {step < 4 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to next step"
            onPress={handleNextStep}
            style={[
              styles.navBtnPrimary,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.navBtnPrimaryText}>
              Next: {STEPS[step].title}
            </Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit Vehicle Listing"
            onPress={saveListing}
            disabled={saving}
            style={[
              styles.navBtnPrimary,
              {
                backgroundColor: colors.primary,
                opacity: saving ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name={saving ? 'hourglass-outline' : 'checkmark-done'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.navBtnPrimaryText}>
              {saving
                ? 'Submitting Listing…'
                : isEdit
                ? 'Update Vehicle'
                : 'Post Vehicle for Sale'}
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* Stepper Tab Bar */
  stepperContainer: {
    borderBottomWidth: 1,
    paddingTop: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitleText: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  /* Scroll Content */
  content: {
    padding: 16,
  },
  stepSection: {
    gap: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },

  /* Form Layout */
  two: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  columnStack: {
    flexDirection: 'column',
    gap: 8,
  },

  /* Pills & Selector Chips */
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  conditionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  segmentBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  specChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  specChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  specChipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Price formatted banner */
  priceFormattedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginTop: -4,
  },
  priceFormattedText: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Upload Cards */
  uploadCard: {
    borderRadius: radius.medium,
    borderWidth: 1,
    padding: 14,
  },
  uploadHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  uploadSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  emptyDropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    borderRadius: radius.medium,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 6,
  },
  dropzoneTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  dropzoneSub: {
    fontSize: 11.5,
  },

  /* Photo Grid */
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    width: 78,
    height: 78,
    borderRadius: radius.small,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Document Row */
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.medium,
    borderWidth: 1,
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
    fontWeight: '600',
    marginTop: 2,
  },

  /* Summary Card */
  summaryCard: {
    borderRadius: radius.medium,
    borderWidth: 1,
    padding: 16,
    marginTop: 14,
  },
  summaryHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  summaryGrid: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12.5,
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },

  /* Error Box */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.medium,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  /* Fixed Bottom Nav Bar */
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  navBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  navBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: radius.medium,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ActionButton, Field, SectionHeading } from '../src/components/common/Controls';
import { ErrorState, LoadingState } from '../src/components/common/RequestState';
import { useSession } from '../src/features/auth/SessionContext';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '../src/features/vehicles/vehicle-queries';
import { uploadFiles } from '../src/features/vehicles/vehicle-service';
import { colors, radius } from '../src/theme/tokens';
import type { Vehicle } from '../src/types/models';

type ListingFields = { brand: string; model: string; year: string; price: string; mileage: string; location: string; description: string; bodyType: string; condition: string; fuelType: string; transmission: string; color: string; engineSize: string };
const initialFields: ListingFields = { brand: '', model: '', year: '', price: '', mileage: '', location: '', description: '', bodyType: '', condition: 'Used', fuelType: 'Petrol', transmission: 'Automatic', color: '', engineSize: '' };
const fuels = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const transmissions = ['Automatic', 'Manual'];
const conditions = ['New', 'Used'];
const bodies = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Other'];
const assetMime = (asset: ImagePicker.ImagePickerAsset) => asset.mimeType || 'image/jpeg';
const assetName = (asset: ImagePicker.ImagePickerAsset, index: number) => asset.fileName || `vehicle-${Date.now()}-${index}.jpg`;

export default function ListingFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useSession();
  const existing = useVehicle(id || '');
  const create = useCreateVehicle();
  const update = useUpdateVehicle();
  const [fields, setFields] = useState(initialFields);
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
    setFields({ brand: v.brand || '', model: v.model || '', year: String(v.year || ''), price: String(v.price || ''), mileage: String(v.mileage || ''), location: v.location || '', description: v.description || '', bodyType: v.bodyType || '', condition: v.condition || 'Used', fuelType: v.fuelType || 'Petrol', transmission: v.transmission || 'Automatic', color: v.color || '', engineSize: v.engineSize || '' });
    setExistingPhotos([v.imageUrl, ...(v.gallery ?? [])].filter((x): x is string => Boolean(x)).filter((x, i, a) => a.indexOf(x) === i));
    setExistingLibre(v.ownershipDocumentUrl || '');
  }, [existing.data]);

  const photoCount = existingPhotos.length + photos.length;
  const updateField = (key: keyof ListingFields, value: string) => setFields(prev => ({ ...prev, [key]: value }));
  const choosePhotos = async () => {
    if (photoCount >= 5) return Alert.alert('Photo limit reached', 'A listing can include up to five photos.');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Photo access needed', 'Allow photo library access to choose vehicle pictures.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5 - photoCount, quality: 0.78, exif: false });
    if (!result.canceled) setPhotos(prev => [...prev, ...result.assets].slice(0, 5 - existingPhotos.length));
  };
  const chooseLibre = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 10 * 1024 * 1024) return Alert.alert('File is too large', 'Choose a file under 10 MB.');
    setLibre(file);
    setExistingLibre('');
  };
  const removePhoto = (index: number) => {
    if (index < existingPhotos.length) setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    else setPhotos(prev => prev.filter((_, i) => i !== index - existingPhotos.length));
  };

  const saveListing = async () => {
    setError('');
    if (!user) return router.push('/login');
    if (!fields.brand.trim() || !fields.model.trim()) return setError('Enter the make and model.');
    const year = Number(fields.year), price = Number(fields.price), mileage = Number(fields.mileage || 0);
    if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1) return setError('Enter a valid model year.');
    if (!Number.isFinite(price) || price <= 0) return setError('Enter a price greater than zero.');
    if (!Number.isFinite(mileage) || mileage < 0) return setError('Enter a valid mileage.');
    if (!fields.location.trim()) return setError('Add the vehicle city or area.');
    if (photoCount === 0) return setError('Add at least one vehicle photo.');
    if (!existingLibre && !libre) return setError('Upload the vehicle ownership document (Libre) for review.');
    setBusy(true);
    try {
      let uploadedPhotos: string[] = [];
      if (photos.length) {
        const result = await uploadFiles(photos.map((photo, i) => ({ uri: photo.uri, name: assetName(photo, i), type: assetMime(photo) })), 'vehicles');
        uploadedPhotos = result.urls;
      }
      let ownershipDocumentUrl = existingLibre;
      if (libre) {
        const result = await uploadFiles([{ uri: libre.uri, name: libre.name, type: libre.mimeType || 'application/pdf' }], 'documents');
        ownershipDocumentUrl = result.urls[0] || '';
      }
      const gallery = [...existingPhotos, ...uploadedPhotos];
      const body = {
        brand: fields.brand.trim(), model: fields.model.trim(), year, price, original_price: price, mileage,
        location: fields.location.trim(), description: fields.description.trim(), fuel_type: fields.fuelType,
        transmission: fields.transmission, condition: fields.condition, body_type: fields.bodyType,
        color: fields.color.trim(), engine_size: fields.engineSize.trim(), image_url: gallery[0],
        gallery_images: JSON.stringify(gallery), ownership_document_url: ownershipDocumentUrl,
        ownership_document_name: libre?.name || 'Ownership Certificate (Libre)',
      };
      if (isEdit && id) await update.mutateAsync({ id, body });
      else await create.mutateAsync(body);
      Alert.alert(isEdit ? 'Listing updated' : 'Listing submitted', isEdit ? 'Your changes have been saved.' : 'Your listing is now waiting for marketplace review.', [{ text: 'Done', onPress: () => router.replace('/(tabs)/sell') }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this listing. Check your connection and try again.');
    } finally { setBusy(false); }
  };

  if (!user) return <View style={styles.center}><Text style={styles.title}>Sign in to list a car</Text><ActionButton label="Sign in" onPress={() => router.push('/login')} /></View>;
  if (loading) return <LoadingState />;
  if (isEdit && (existing.error || !existing.data)) return <View style={styles.screen}><ErrorState message={existing.error?.message || 'Listing not found'} onRetry={() => void existing.refetch()} /></View>;

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.back} onPress={() => router.back()}><Ionicons name="close" size={22} color={colors.ink} /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>{isEdit ? 'UPDATE YOUR VEHICLE' : 'SELL WITH CONFIDENCE'}</Text><Text style={styles.title}>{isEdit ? 'Edit listing' : 'List your car'}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={20} color={colors.green} /><Text style={styles.noticeText}>Listings are reviewed before they appear in the public marketplace. Provide accurate details and clear photos.</Text></View>
      <SectionHeading title="Vehicle details" subtitle="Start with the basics buyers use to compare cars." />
      <View style={styles.two}><Field label="Make" value={fields.brand} onChangeText={v => updateField('brand', v)} placeholder="Toyota" autoCapitalize="words" style={styles.half} /><Field label="Model" value={fields.model} onChangeText={v => updateField('model', v)} placeholder="Land Cruiser" autoCapitalize="words" style={styles.half} /></View>
      <View style={styles.two}><Field label="Year" value={fields.year} onChangeText={v => updateField('year', v.replace(/\D/g, '').slice(0, 4))} placeholder="2022" keyboardType="number-pad" style={styles.half} /><Field label="Price (ETB)" value={fields.price} onChangeText={v => updateField('price', v.replace(/[^\d.]/g, ''))} placeholder="3,500,000" keyboardType="decimal-pad" style={styles.half} /></View>
      <View style={styles.two}><Field label="Mileage (km)" value={fields.mileage} onChangeText={v => updateField('mileage', v.replace(/\D/g, ''))} placeholder="45000" keyboardType="number-pad" style={styles.half} /><Field label="City / area" value={fields.location} onChangeText={v => updateField('location', v)} placeholder="Addis Ababa, Bole" style={styles.half} /></View>
      <Choice label="Condition" choices={conditions} value={fields.condition} onChange={v => updateField('condition', v)} />
      <Choice label="Fuel" choices={fuels} value={fields.fuelType} onChange={v => updateField('fuelType', v)} />
      <Choice label="Transmission" choices={transmissions} value={fields.transmission} onChange={v => updateField('transmission', v)} />
      <Choice label="Body type" choices={bodies} value={fields.bodyType} onChange={v => updateField('bodyType', v)} />
      <View style={styles.two}><Field label="Color (optional)" value={fields.color} onChangeText={v => updateField('color', v)} placeholder="Silver" style={styles.half} /><Field label="Engine (optional)" value={fields.engineSize} onChangeText={v => updateField('engineSize', v)} placeholder="2.8 L" style={styles.half} /></View>
      <Field label="Description" value={fields.description} onChangeText={v => updateField('description', v)} placeholder="Describe the vehicle's condition, features and service history." multiline maxLength={1200} />
      <SectionHeading title="Vehicle photos" subtitle={`${photoCount}/5 photos · The first photo is used as the cover.`} />
      {photoCount ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>{[...existingPhotos.map(uri => ({ uri, source: 'saved' as const })), ...photos.map(asset => ({ uri: asset.uri, source: 'new' as const }))].map((photo, index) => <View key={`${photo.uri}-${index}`} style={styles.photoWrap}><Image source={{ uri: photo.uri }} style={styles.photo} /><Pressable accessibilityRole="button" accessibilityLabel="Remove photo" onPress={() => removePhoto(index)} style={styles.removePhoto}><Ionicons name="close" size={14} color={colors.white} /></Pressable>{index === 0 ? <View style={styles.cover}><Text style={styles.coverText}>COVER</Text></View> : null}</View>)}</ScrollView> : null}
      <ActionButton label="Choose photos" outline icon={<Ionicons name="images-outline" size={18} color={colors.ink} />} onPress={() => void choosePhotos()} disabled={photoCount >= 5} style={styles.secondary} />
      <SectionHeading title="Ownership document" subtitle="A clear photo or PDF of the Libre is required for the review." />
      <Pressable accessibilityRole="button" onPress={() => void chooseLibre()} style={styles.document}><Ionicons name={libre || existingLibre ? 'document-text' : 'cloud-upload-outline'} size={22} color={colors.green} /><View style={{ flex: 1 }}><Text style={styles.documentTitle}>{libre?.name || (existingLibre ? 'Ownership document added' : 'Choose document')}</Text><Text style={styles.documentSub}>PDF, JPEG, PNG or WebP · up to 10 MB</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton label={isEdit ? 'Save changes' : 'Submit listing for review'} busy={saving} onPress={() => void saveListing()} style={styles.submit} />
      <Text style={styles.footnote}>By submitting, you confirm that the information and ownership document are accurate.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
function Choice({ label, choices, value, onChange }: { label: string; choices: string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.choiceWrap}><Text style={styles.choiceLabel}>{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{choices.map(choice => <Pressable key={choice} onPress={() => onChange(choice)} style={[styles.chip, value === choice && styles.chipOn]}><Text style={[styles.chipText, value === choice && styles.chipTextOn]}>{choice}</Text></Pressable>)}</ScrollView></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.paper }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, eyebrow: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, title: { color: colors.ink, fontSize: 23, fontWeight: '900', marginTop: 3 }, content: { paddingHorizontal: 18, paddingBottom: 34 }, notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.mint, borderRadius: 16, padding: 14, marginBottom: 23 }, noticeText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 18 }, two: { flexDirection: 'row', gap: 10 }, half: { flex: 1 }, choiceWrap: { marginBottom: 14 }, choiceLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8 }, choiceRow: { gap: 7 }, chip: { paddingHorizontal: 13, minHeight: 38, justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }, chipOn: { backgroundColor: colors.mint, borderColor: colors.green }, chipText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, chipTextOn: { color: colors.greenDark }, photoRow: { gap: 10, paddingBottom: 10 }, photoWrap: { width: 116, height: 93, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.mint }, photo: { width: '100%', height: '100%', resizeMode: 'cover' }, removePhoto: { position: 'absolute', top: 5, right: 5, width: 28, height: 28, borderRadius: 14, backgroundColor: '#181B20CC', alignItems: 'center', justifyContent: 'center' }, cover: { position: 'absolute', bottom: 5, left: 5, borderRadius: 5, backgroundColor: colors.white, paddingHorizontal: 6, paddingVertical: 3 }, coverText: { fontSize: 8, color: colors.ink, fontWeight: '900' }, secondary: { marginBottom: 22 }, document: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.medium, padding: 14, minHeight: 68, marginBottom: 6 }, documentTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, documentSub: { color: colors.muted, fontSize: 10, marginTop: 4 }, error: { color: colors.red, fontSize: 12, marginTop: 9, lineHeight: 18 }, submit: { marginTop: 18 }, footnote: { textAlign: 'center', color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 11 }, center: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 } });

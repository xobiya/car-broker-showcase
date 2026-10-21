import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Field } from '../../src/components/common/Controls';
import { ErrorState, LoadingState } from '../../src/components/common/RequestState';
import { useSession } from '../../src/features/auth/SessionContext';
import { leadService, testDriveService } from '../../src/features/vehicles/vehicle-service';
import { useSavedVehicles, useToggleSavedVehicle, useVehicle } from '../../src/features/vehicles/vehicle-queries';
import { trustService } from '../../src/features/vehicles/trust-service';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';
import { openPhoneNumber, openWhatsApp } from '../../src/services/native-actions';

type ActionMode = 'inquiry' | 'testDrive' | 'report' | null;
export default function VehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleQuery = useVehicle(id);
  const { user } = useSession();
  const savedQuery = useSavedVehicles(user?.id);
  const savedMutation = useToggleSavedVehicle(user?.id);
  const [mode, setMode] = useState<ActionMode>(null);
  const [name, setName] = useState(user?.name ?? ''); const [email, setEmail] = useState(user?.email ?? ''); const [phone, setPhone] = useState(user?.phone ?? '');
  const [message, setMessage] = useState(''); const [date, setDate] = useState(''); const [time, setTime] = useState(''); const [reason, setReason] = useState('Misleading information');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [photoIndex, setPhotoIndex] = useState(0);
  const v = vehicleQuery.data;
  const images = useMemo(() => v ? Array.from(new Set([v.imageUrl, ...(v.gallery ?? [])].filter((x): x is string => Boolean(x)))) : [], [v]);
  const isSaved = (savedQuery.data ?? []).some(item => item.vehicleId === id);
  if (vehicleQuery.isLoading) return <LoadingState label="Loading vehicle details…" />;
  if (vehicleQuery.error || !v) return <View style={styles.screen}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.ink} /></Pressable><ErrorState message={vehicleQuery.error?.message || 'Vehicle not found'} onRetry={() => void vehicleQuery.refetch()} /></View>;
  const sellerPhone = v.brokerPhone || v.sellerPhone || v.phone;
  const save = async () => {
    if (!user) return router.push({ pathname: '/login', params: { returnTo: `/vehicles/${id}` } });
    try { await savedMutation.mutateAsync({ vehicleId: v.id, saved: isSaved }); }
    catch (e) { Alert.alert('Could not update saved cars', e instanceof Error ? e.message : 'Please try again.'); }
  };
  const contact = async (scheme: 'tel' | 'https') => {
    if (!sellerPhone) return setMode('inquiry');
    try {
      if (scheme === 'tel') {
        await openPhoneNumber(sellerPhone);
      } else {
        await openWhatsApp(sellerPhone, `Hello, I am interested in the ${v.year} ${v.brand} ${v.model}.`);
      }
    } catch { Alert.alert('Could not open contact app', 'Please use the inquiry form to reach the seller.'); }
  };
  const submit = async () => {
    setError('');
    if (mode === 'report' && !name.trim()) return setError('Enter your name so the review team can follow up if needed.');
    if (mode !== 'report' && name.trim().length < 2) return setError('Enter your name.');
    if (mode === 'inquiry' && !phone.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Provide a phone number or valid email address.');
    if (mode === 'testDrive' && !phone.trim()) return setError('A phone number is required to confirm a test drive.');
    if (mode === 'testDrive' && (!date.trim() || !time.trim())) return setError('Choose your preferred date and time.');
    if (mode === 'inquiry' && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    try {
      if (mode === 'inquiry') await leadService.create({ vehicle_id: v.id, buyer_name: name.trim(), buyer_email: email.trim(), buyer_phone: phone.trim(), message: message.trim() });
      if (mode === 'testDrive') await testDriveService.create({ vehicle_id: v.id, name: name.trim(), email: email.trim(), phone: phone.trim(), preferred_date: date.trim(), preferred_time: time.trim(), message: message.trim() });
      if (mode === 'report') await trustService.reportListing({ reporter_name: name.trim(), target_type: 'listing', target_id: v.id, reason, description: message.trim() });
      const title = mode === 'inquiry' ? 'Inquiry sent' : mode === 'testDrive' ? 'Request received' : 'Report submitted';
      const copy = mode === 'inquiry' ? 'Your question has been sent to the listing team.' : mode === 'testDrive' ? 'The seller will contact you to confirm your preferred time.' : 'Thank you. The marketplace team will review this listing.';
      setMode(null); setMessage(''); Alert.alert(title, copy);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not send your request. Try again.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.screen}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.gallery}>
        {images.length ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width))}>{images.map((uri, i) => <Image key={`${uri}-${i}`} source={{ uri }} style={styles.image} />)}</ScrollView> : <View style={styles.placeholder}><Ionicons name="car-sport-outline" size={58} color={colors.green} /></View>}
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={[styles.roundAction, styles.back]}><Ionicons name="arrow-back" size={20} color={colors.ink} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={isSaved ? 'Remove saved vehicle' : 'Save vehicle'} onPress={() => void save()} disabled={savedMutation.isPending} style={[styles.roundAction, styles.save]}><Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? colors.red : colors.ink} /></Pressable>
        {images.length > 1 ? <View style={styles.counter}><Text style={styles.counterText}>{photoIndex + 1} / {images.length}</Text></View> : null}
      </View>
      <View style={styles.details}>
        <View style={styles.metaTop}><View style={styles.status}><View style={[styles.dot, { backgroundColor: v.status === 'sold' ? colors.muted : colors.success }]} /><Text style={styles.statusText}>{v.status === 'sold' ? 'SOLD' : 'AVAILABLE'}</Text></View>{v.brokerVerified ? <View style={styles.verified}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={styles.verifiedText}>Verified broker</Text></View> : null}</View>
        <Text style={styles.title}>{v.year} {v.brand} {v.model}</Text>
        <Text style={styles.location}><Ionicons name="location-outline" size={15} color={colors.muted} />  {v.location || 'Location not provided'}</Text>
        <Text style={styles.price}>{formatPrice(v.price)}</Text>
        <View style={styles.specs}>{[["speedometer-outline", `${(v.mileage || 0).toLocaleString()} km`], ["flash-outline", v.fuelType || 'Fuel not listed'], ["git-compare-outline", v.transmission || 'Transmission not listed']].map(([icon, label]) => <View key={label} style={styles.spec}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.green} /><Text numberOfLines={2} style={styles.specText}>{label}</Text></View>)}</View>
        <Section title="Vehicle details" />
        <View style={styles.detailGrid}>{[['Condition', v.condition], ['Body type', v.bodyType], ['Color', v.color], ['Engine', v.engineSize], ['Seats', v.seats ? String(v.seats) : undefined], ['Doors', v.doors ? String(v.doors) : undefined]].filter((x): x is [string, string] => Boolean(x[1])).map(([label, value]) => <View key={label} style={styles.detailItem}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>)}</View>
        <Section title="About this car" /><Text style={styles.description}>{v.description?.trim() || 'No description has been provided for this vehicle.'}</Text>
        {v.inspectionStatus && v.inspectionStatus !== 'not_inspected' ? <View style={styles.inspection}><Ionicons name={v.inspectionStatus === 'passed' ? 'checkmark-circle' : 'information-circle'} size={20} color={v.inspectionStatus === 'passed' ? colors.success : colors.warning} /><View style={{ flex: 1 }}><Text style={styles.inspectionTitle}>Inspection: {v.inspectionStatus.replace('_', ' ')}</Text>{v.inspectionNotes ? <Text style={styles.description}>{v.inspectionNotes}</Text> : null}{v.inspectionDate ? <Text style={styles.muted}>{v.inspectionDate}</Text> : null}</View></View> : null}
        <Section title="Seller information" />
        <View style={styles.seller}><View style={styles.sellerIcon}><Ionicons name="person-outline" size={20} color={colors.green} /></View><View style={{ flex: 1 }}><Text style={styles.sellerName}>{v.sellerName || v.brokerName || 'Vehicle seller'}</Text><Text style={styles.muted}>{v.sellerRole === 'broker' ? 'Broker' : v.sellerRole === 'seller' ? 'Direct seller' : 'Marketplace member'}</Text></View>{v.brokerVerified ? <Ionicons name="checkmark-circle" size={19} color={colors.success} /> : null}</View>
        <Pressable accessibilityRole="button" onPress={() => { setName(user?.name || ''); setEmail(user?.email || ''); setPhone(user?.phone || ''); setMode('report'); }} style={styles.report}><Ionicons name="flag-outline" size={15} color={colors.muted} /><Text style={styles.reportText}>Report this listing</Text></Pressable>
      </View>
    </ScrollView>
    <View style={styles.actionBar}><Pressable accessibilityRole="button" onPress={() => { setName(user?.name || ''); setEmail(user?.email || ''); setPhone(user?.phone || ''); setMode('inquiry'); }} style={styles.secondaryButton}><Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.green} /><Text style={styles.secondaryText}>Ask seller</Text></Pressable><Pressable accessibilityRole="button" onPress={() => void contact('https')} style={styles.whatsApp}><Ionicons name="logo-whatsapp" size={18} color={colors.white} /><Text style={styles.primaryText}>WhatsApp</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { setName(user?.name || ''); setEmail(user?.email || ''); setPhone(user?.phone || ''); setMode('testDrive'); }} style={styles.testDrive}><Text style={styles.primaryText}>Test drive</Text></Pressable></View>
    <Modal visible={mode !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMode(null)}><View style={styles.modal}><View style={styles.modalHead}><View><Text style={styles.modalEyebrow}>{v.brand} {v.model}</Text><Text style={styles.modalTitle}>{mode === 'inquiry' ? 'Ask the seller' : mode === 'testDrive' ? 'Request a test drive' : 'Report this listing'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close form" onPress={() => setMode(null)} style={styles.close}><Ionicons name="close" size={20} color={colors.ink} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
      {mode === 'report' ? <><Field label="Your name" value={name} onChangeText={setName} placeholder="Name" autoCapitalize="words" /><Text style={styles.fieldLabel}>WHAT IS THE ISSUE?</Text>{['Misleading information', 'Suspected fraud', 'Incorrect availability', 'Other'].map(item => <Pressable key={item} onPress={() => setReason(item)} style={styles.reason}><Ionicons name={reason === item ? 'radio-button-on' : 'radio-button-off'} size={18} color={reason === item ? colors.green : colors.muted} /><Text style={styles.reasonText}>{item}</Text></Pressable>)}<Field label="Details (optional)" value={message} onChangeText={setMessage} placeholder="Help our team understand the issue." multiline /></> : <><Field label="Your name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Full name" /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" /><Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+251 …" hint={mode === 'inquiry' ? 'Add a phone number or email so the seller can reply.' : 'The seller needs a phone number to confirm the appointment.'} />{mode === 'testDrive' ? <><Field label="Preferred date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" /><Field label="Preferred time" value={time} onChangeText={setTime} placeholder="e.g. 10:30 AM" /></> : null}<Field label={mode === 'testDrive' ? 'Message (optional)' : 'Your question'} value={message} onChangeText={setMessage} multiline placeholder={mode === 'testDrive' ? 'Anything the seller should know?' : 'Ask about condition, history or viewing times.'} /></>}
      {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}<ActionButton label={mode === 'inquiry' ? 'Send inquiry' : mode === 'testDrive' ? 'Send test-drive request' : 'Submit report'} busy={busy} onPress={() => void submit()} style={{ marginTop: 12 }} />
    </ScrollView></View></Modal>
  </View>;
}
function Section({ title }: { title: string }) { return <Text style={styles.section}>{title}</Text>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.white }, scroll: { paddingBottom: 24 }, gallery: { height: 320, backgroundColor: colors.mint }, image: { width: 390, height: 320, resizeMode: 'cover' }, placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' }, roundAction: { position: 'absolute', top: 46, width: 42, height: 42, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, back: { left: 17 }, save: { right: 17 }, counter: { position: 'absolute', bottom: 14, right: 15, backgroundColor: '#181B20C7', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 }, counterText: { color: colors.white, fontSize: 10, fontWeight: '800' }, details: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 }, metaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, status: { flexDirection: 'row', alignItems: 'center', gap: 6 }, dot: { width: 7, height: 7, borderRadius: 4 }, statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: colors.muted }, verified: { flexDirection: 'row', alignItems: 'center', gap: 4 }, verifiedText: { color: colors.success, fontWeight: '700', fontSize: 10 }, title: { fontSize: 25, fontWeight: '900', color: colors.ink, marginTop: 8 }, location: { fontSize: 12, color: colors.muted, marginTop: 7 }, price: { fontSize: 22, fontWeight: '900', color: colors.greenDark, marginTop: 14 }, specs: { flexDirection: 'row', paddingVertical: 16, marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }, spec: { flex: 1, alignItems: 'center', gap: 7, paddingHorizontal: 3 }, specText: { color: colors.muted, fontSize: 10, textAlign: 'center' }, section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 22, marginBottom: 9 }, detailGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 15, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, detailItem: { width: '50%', padding: 12, borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.line }, detailLabel: { color: colors.muted, fontSize: 10 }, detailValue: { color: colors.ink, fontWeight: '800', fontSize: 12, marginTop: 4 }, description: { fontSize: 12, color: colors.muted, lineHeight: 19 }, inspection: { flexDirection: 'row', gap: 11, padding: 13, borderRadius: 15, backgroundColor: colors.mint, marginTop: 16 }, inspectionTitle: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 4, textTransform: 'capitalize' }, muted: { color: colors.muted, fontSize: 10, marginTop: 4 }, seller: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 15, backgroundColor: colors.paper }, sellerIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, sellerName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, report: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 11, marginTop: 6 }, reportText: { color: colors.muted, fontSize: 10, fontWeight: '700' }, actionBar: { flexDirection: 'row', gap: 7, padding: 10, paddingBottom: 19, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line }, secondaryButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.green, borderRadius: 13 }, secondaryText: { color: colors.greenDark, fontSize: 11, fontWeight: '800' }, whatsApp: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, borderRadius: 13 }, testDrive: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green, borderRadius: 13 }, primaryText: { color: colors.white, fontSize: 11, fontWeight: '800' }, modal: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 20, paddingTop: 16 }, modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, modalEyebrow: { color: colors.greenDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, modalTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 3 }, close: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 }, reason: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9 }, reasonText: { color: colors.ink, fontSize: 12 }, formError: { color: colors.red, fontSize: 12, lineHeight: 17, marginTop: 3 } });

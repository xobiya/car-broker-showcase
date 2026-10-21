import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PageTitle } from '../../src/components/common/PageTitle';
import {
  LoadingState,
  ErrorState,
} from '../../src/components/common/RequestState';
import { VehicleCard } from '../../src/components/vehicles/VehicleCard';
import {
  ActionButton,
  SectionHeading,
} from '../../src/components/common/Controls';
import { useSession } from '../../src/features/auth/SessionContext';
import {
  useLeads,
  useRemoveVehicle,
  useTestDrives,
  useUpdateLeadStatus,
  useUpdateTestDriveStatus,
  useVehicles,
} from '../../src/features/vehicles/vehicle-queries';
import { colors, radius } from '../../src/theme/tokens';
import { formatPrice } from '../../src/utils/currency';
import type { Lead, TestDriveRequest, Vehicle } from '../../src/types/models';

const tabs = ['Listings', 'Inquiries', 'Test drives'] as const;
type Tab = (typeof tabs)[number];
function statusColor(status: string) {
  if (['approved', 'confirmed', 'completed', 'sold'].includes(status))
    return colors.success;
  if (['rejected', 'cancelled'].includes(status)) return colors.red;
  return colors.warning;
}

export default function GarageScreen() {
  const { user } = useSession();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(
    params.tab === 'Inquiries' || params.tab === 'Test drives'
      ? params.tab
      : 'Listings',
  );
  React.useEffect(() => {
    if (
      params.tab === 'Inquiries' ||
      params.tab === 'Test drives' ||
      params.tab === 'Listings'
    )
      setTab(params.tab);
  }, [params.tab]);
  const vehiclesQuery = useVehicles({ limit: 100, sort: 'newest' });
  const leadsQuery = useLeads();
  const canViewDrives =
    user?.role === 'buyer' || user?.role === 'broker' || user?.role === 'admin';
  const drivesQuery = useTestDrives(canViewDrives);
  const deleteVehicle = useRemoveVehicle();
  const updateLead = useUpdateLeadStatus();
  const updateDrive = useUpdateTestDriveStatus();

  const ownedVehicles = useMemo(() => {
    if (!user) return [];
    return (vehiclesQuery.data ?? []).filter(
      (v) =>
        user.role === 'admin' ||
        v.brokerId === user.id ||
        v.sellerEmail?.toLowerCase() === user.email.toLowerCase(),
    );
  }, [vehiclesQuery.data, user]);

  if (!user)
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <PageTitle
            eyebrow="SELL WITH CONFIDENCE"
            title="Your car, your next move"
          />
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="car-sport-outline"
                size={27}
                color={colors.green}
              />
            </View>
            <Text style={styles.heroTitle}>Manage your vehicle journey</Text>
            <Text style={styles.heroCopy}>
              Create a listing, track buyer interest, and manage your cars from
              one place.
            </Text>
            <ActionButton
              label="Sign in or create account"
              onPress={() => router.push('/login')}
            />
          </View>
          <Text style={styles.note}>
            Creating an account lets you submit a vehicle listing for review.
          </Text>
        </ScrollView>
      </View>
    );

  const busy =
    tab === 'Listings'
      ? vehiclesQuery.isLoading
      : tab === 'Inquiries'
        ? leadsQuery.isLoading
        : drivesQuery.isLoading;
  const error =
    tab === 'Listings'
      ? vehiclesQuery.error
      : tab === 'Inquiries'
        ? leadsQuery.error
        : drivesQuery.error;
  const retry = () => {
    if (tab === 'Listings') void vehiclesQuery.refetch();
    else if (tab === 'Inquiries') void leadsQuery.refetch();
    else void drivesQuery.refetch();
  };
  const isOwnerRole =
    user.role === 'seller' || user.role === 'broker' || user.role === 'admin';
  const ownVehicleIds = new Set(ownedVehicles.map((v) => v.id));
  const leadRows = (leadsQuery.data ?? []).filter((l) =>
    user.role === 'buyer'
      ? l.buyerId === user.id
      : ownVehicleIds.has(l.vehicleId),
  );
  const driveRows = (drivesQuery.data ?? []).filter((d) =>
    user.role === 'buyer'
      ? d.userId === user.id
      : ownVehicleIds.has(d.vehicleId),
  );

  const confirmRemove = (vehicle: Vehicle) =>
    Alert.alert(
      'Delete this listing?',
      `${vehicle.year} ${vehicle.brand} ${vehicle.model} will be removed.`,
      [
        { text: 'Keep listing', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteVehicle.mutate(vehicle.id, {
              onError: (e) =>
                Alert.alert('Could not delete listing', e.message),
            }),
        },
      ],
    );

  const cycleLead = (lead: Lead) => {
    const next: Lead['status'] =
      lead.status === 'new'
        ? 'contacted'
        : lead.status === 'contacted'
          ? 'negotiating'
          : 'sold';
    updateLead.mutate(
      { id: lead.id, status: next },
      { onError: (e) => Alert.alert('Could not update inquiry', e.message) },
    );
  };
  const cycleDrive = (drive: TestDriveRequest) => {
    const next: TestDriveRequest['status'] =
      drive.status === 'pending'
        ? 'confirmed'
        : drive.status === 'confirmed'
          ? 'completed'
          : 'cancelled';
    updateDrive.mutate(
      { id: drive.id, status: next },
      { onError: (e) => Alert.alert('Could not update test drive', e.message) },
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle
          eyebrow={
            user.role === 'buyer'
              ? 'YOUR VEHICLES'
              : `${user.role.toUpperCase()} WORKSPACE`
          }
          title="Vehicle listings"
        />
        <View style={styles.summary}>
          <Metric label="My listings" value={ownedVehicles.length} />
          <Metric
            label="Pending review"
            value={ownedVehicles.filter((v) => v.status === 'pending').length}
          />
          <Metric label="Buyer inquiries" value={leadRows.length} />
        </View>
        <ActionButton
          label="Create a vehicle listing"
          icon={<Ionicons name="add" size={19} color={colors.white} />}
          onPress={() => router.push('/listing-form')}
          style={styles.createButton}
        />
        <View style={styles.tabRow}>
          {tabs.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tab, item === tab && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, item === tab && styles.tabTextActive]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        {busy ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error.message} onRetry={retry} />
        ) : tab === 'Listings' ? (
          ownedVehicles.length ? (
            <View style={{ marginTop: 10 }}>
              {ownedVehicles.map((v) => (
                <View key={v.id} style={styles.listingWrap}>
                  <VehicleCard
                    vehicle={v}
                    onPress={() => router.push(`/vehicles/${v.id}`)}
                  />
                  <View style={styles.listingFoot}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: `${statusColor(v.status || 'pending')}18`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: statusColor(v.status || 'pending') },
                        ]}
                      >
                        {(v.status || 'pending')
                          .replace('_', ' ')
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit listing"
                        onPress={() =>
                          router.push({
                            pathname: '/listing-form',
                            params: { id: v.id },
                          })
                        }
                        style={styles.iconAction}
                      >
                        <Ionicons
                          name="create-outline"
                          size={19}
                          color={colors.ink}
                        />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete listing"
                        onPress={() => confirmRemove(v)}
                        style={styles.iconAction}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={19}
                          color={colors.red}
                        />
                      </Pressable>
                    </View>
                  </View>
                  {v.rejectionReason ? (
                    <Text style={styles.rejection}>
                      Review note: {v.rejectionReason}
                    </Text>
                  ) : v.status === 'pending' ? (
                    <Text style={styles.note}>
                      Your listing is waiting for the marketplace review.
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Empty
              title="No listings yet"
              text="Create a listing to introduce your vehicle to buyers."
              action="Create listing"
              onPress={() => router.push('/listing-form')}
            />
          )
        ) : tab === 'Inquiries' ? (
          leadRows.length ? (
            leadRows.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                canUpdate={isOwnerRole && ownVehicleIds.has(lead.vehicleId)}
                busy={updateLead.isPending}
                onUpdate={() => cycleLead(lead)}
              />
            ))
          ) : (
            <Empty
              title="No inquiries yet"
              text="Buyer questions about your vehicles will appear here."
            />
          )
        ) : driveRows.length ? (
          driveRows.map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              canUpdate={
                (user.role === 'broker' || user.role === 'admin') &&
                ownVehicleIds.has(drive.vehicleId)
              }
              busy={updateDrive.isPending}
              onUpdate={() => cycleDrive(drive)}
            />
          ))
        ) : (
          <Empty
            title="No test drives yet"
            text="Requests and appointment updates will show here."
          />
        )}
        {tab === 'Test drives' && user.role === 'seller' ? (
          <Text style={styles.note}>
            Test-drive management is available to buyers and brokers in the
            current backend. Contact support if you need seller access enabled.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
function Empty({
  title,
  text,
  action,
  onPress,
}: {
  title: string;
  text: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name="car-outline" size={30} color={colors.green} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyCopy}>{text}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress} style={styles.linkButton}>
          <Text style={styles.linkText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function LeadCard({
  lead,
  canUpdate,
  busy,
  onUpdate,
}: {
  lead: Lead;
  canUpdate: boolean;
  busy: boolean;
  onUpdate: () => void;
}) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.cardTop}>
        <Text style={styles.activityTitle}>
          {lead.vehicleBrand || 'Vehicle'} {lead.vehicleModel || ''}
        </Text>
        <Status status={lead.status} />
      </View>
      <Text style={styles.activityCopy}>
        {lead.buyerName} · {lead.buyerPhone}
      </Text>
      <Text style={styles.activityCopy}>{lead.buyerEmail}</Text>
      {lead.message ? <Text style={styles.message}>{lead.message}</Text> : null}
      <Text style={styles.date}>
        {lead.inquiryDate
          ? new Date(lead.inquiryDate).toLocaleDateString()
          : 'Date unavailable'}
      </Text>
      {canUpdate ? (
        <ActionButton
          label={`Update status · ${lead.status}`}
          outline
          onPress={onUpdate}
          busy={busy}
          style={styles.smallButton}
        />
      ) : null}
    </View>
  );
}
function DriveCard({
  drive,
  canUpdate,
  busy,
  onUpdate,
}: {
  drive: TestDriveRequest;
  canUpdate: boolean;
  busy: boolean;
  onUpdate: () => void;
}) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.cardTop}>
        <Text style={styles.activityTitle}>
          {drive.vehicleBrand || 'Vehicle'} {drive.vehicleModel || ''}
        </Text>
        <Status status={drive.status} />
      </View>
      <Text style={styles.activityCopy}>
        {drive.name} · {drive.phone}
      </Text>
      <Text style={styles.activityCopy}>
        {drive.preferredDate} at {drive.preferredTime}
      </Text>
      {drive.message ? (
        <Text style={styles.message}>{drive.message}</Text>
      ) : null}
      {canUpdate ? (
        <ActionButton
          label={`Update status · ${drive.status}`}
          outline
          onPress={onUpdate}
          busy={busy}
          style={styles.smallButton}
        />
      ) : null}
    </View>
  );
}
function Status({ status }: { status: string }) {
  return (
    <View
      style={[styles.badge, { backgroundColor: `${statusColor(status)}18` }]}
    >
      <Text style={[styles.badgeText, { color: statusColor(status) }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 36 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 20,
  },
  heroIcon: {
    height: 56,
    width: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mint,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  heroCopy: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 13,
    marginVertical: 9,
  },
  note: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 10 },
  summary: { flexDirection: 'row', gap: 8, marginVertical: 18 },
  metric: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    borderRadius: radius.small,
  },
  metricValue: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },
  createButton: { marginBottom: 20 },
  tabRow: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#ECEEF1',
    borderRadius: 14,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 4,
  },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  tabTextActive: { color: colors.ink },
  listingWrap: {
    backgroundColor: colors.white,
    borderRadius: radius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 13,
    paddingBottom: 11,
  },
  listingFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30 },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  rejection: {
    color: colors.red,
    marginHorizontal: 12,
    marginTop: 9,
    fontSize: 11,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.medium,
    padding: 15,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  activityTitle: {
    flex: 1,
    color: colors.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  activityCopy: { fontSize: 12, color: colors.muted, marginTop: 3 },
  message: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
    backgroundColor: colors.paper,
    padding: 11,
    borderRadius: 12,
    marginTop: 10,
  },
  date: { color: colors.muted, fontSize: 10, marginTop: 9 },
  smallButton: { minHeight: 42, marginTop: 11 },
  empty: {
    backgroundColor: colors.white,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  emptyCopy: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12,
  },
  linkButton: { padding: 8 },
  linkText: { color: colors.green, fontWeight: '800', fontSize: 12 },
});

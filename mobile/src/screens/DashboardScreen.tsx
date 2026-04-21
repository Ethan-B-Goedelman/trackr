import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';
import { Interview, ApplicationRef } from '../types';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Applied':      { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Phone Screen': { bg: '#fef9c3', text: '#a16207', dot: '#fbbf24' },
  'Technical':    { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  'Onsite':       { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  'Offer':        { bg: '#fce7f3', text: '#be185d', dot: '#ec4899' },
  'Accepted':     { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  'Rejected':     { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, contactsRes, appsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/contacts?limit=1'),
        api.get('/applications?limit=5'),
      ]);
      setStats(statsRes.data);
      setContactsTotal(
        contactsRes.data.pagination?.total ??
        contactsRes.data.total ??
        contactsRes.data.contacts?.length ?? 0
      );
      setRecentApps(appsRes.data.applications ?? []);
      setError('');
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const firstName = user?.firstName ?? user?.email?.split('@')[0] ?? 'there';
  const totalApps = stats?.summary?.totalApplications ?? 0;
  const upcomingInterviews = stats?.summary?.upcomingInterviews ?? 0;
  const nextInterview: Interview | null = stats?.nextInterview ?? null;
  // API returns statusBreakdown: [{ status, count }]
  const pipeline: { status: string; count: number }[] = stats?.statusBreakdown ?? [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    );
  }

  const nextAppRef =
    nextInterview?.application && typeof nextInterview.application === 'object'
      ? (nextInterview.application as ApplicationRef)
      : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.yellow}
          />
        }
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={Gradients.cardHeader}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View>
            <Text style={styles.greetingText}>
              {greeting()}, {firstName}! 👋
            </Text>
            <Text style={styles.dateText}>
              {dayjs().format('dddd, MMMM D')}
            </Text>
          </View>
          <View style={styles.logoSmall}>
            <LinearGradient colors={Gradients.logo} style={styles.logoCircle}>
              <Ionicons name="document-text" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </LinearGradient>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="briefcase-outline"
            value={totalApps}
            label="Applications"
            color="#dbeafe"
            iconColor="#1d4ed8"
            onPress={() => navigation.navigate('Applications')}
          />
          <StatCard
            icon="calendar-outline"
            value={upcomingInterviews}
            label="Upcoming"
            color="#d1fae5"
            iconColor="#065f46"
            onPress={() => navigation.navigate('Interviews')}
          />
          <StatCard
            icon="people-outline"
            value={contactsTotal}
            label="Contacts"
            color="#ede9fe"
            iconColor="#6d28d9"
            onPress={() => navigation.navigate('Contacts')}
          />
        </View>

        {/* ── Next Interview ── */}
        {nextInterview ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Interview</Text>
            <TouchableOpacity
              style={styles.nextInterviewCard}
              onPress={() => navigation.navigate('Interviews')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#fffbeb', '#fef3c7']}
                style={styles.nextInterviewGradient}
              >
                <View style={styles.niRow}>
                  <View style={styles.niIconWrap}>
                    <Ionicons name="calendar" size={22} color={Colors.yellowDark} />
                  </View>
                  <View style={styles.niInfo}>
                    <Text style={styles.niCompany} numberOfLines={1}>
                      {nextAppRef ? nextAppRef.company : 'Interview'}
                    </Text>
                    <Text style={styles.niRole} numberOfLines={1}>
                      {nextAppRef ? nextAppRef.role : nextInterview.type}
                    </Text>
                  </View>
                  <View style={styles.niTypeBadge}>
                    <Text style={styles.niTypeBadgeText}>{nextInterview.type}</Text>
                  </View>
                </View>
                <View style={styles.niDateRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.yellowDark} />
                  <Text style={styles.niDate}>
                    {dayjs(nextInterview.scheduledAt).format('MMM D [at] h:mm A')}
                  </Text>
                  <Text style={styles.niRelative}>
                    · {dayjs(nextInterview.scheduledAt).fromNow()}
                  </Text>
                </View>
                {nextInterview.location ? (
                  <View style={styles.niDateRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.niLocation} numberOfLines={1}>
                      {nextInterview.location}
                    </Text>
                  </View>
                ) : null}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Pipeline ── */}
        {pipeline.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pipeline</Text>
            <View style={styles.card}>
              {pipeline.slice(0, 5).map((p) => {
                const s = STATUS_STYLES[p.status] ?? STATUS_STYLES['Applied'];
                const pct = totalApps > 0 ? (p.count / totalApps) * 100 : 0;
                return (
                  <View key={p.status} style={styles.pipelineRow}>
                    <View style={[styles.pipelineDot, { backgroundColor: s.dot }]} />
                    <Text style={styles.pipelineLabel}>{p.status}</Text>
                    <View style={styles.pipelineBarBg}>
                      <View style={[styles.pipelineBar, { width: `${pct}%` as any, backgroundColor: s.dot }]} />
                    </View>
                    <Text style={styles.pipelineCount}>{p.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* ── Recent Applications ── */}
        {recentApps.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Applications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {recentApps.map((app, idx) => {
                const s = STATUS_STYLES[app.status] ?? STATUS_STYLES['Applied'];
                return (
                  <React.Fragment key={app._id}>
                    <TouchableOpacity
                      style={styles.appRow}
                      onPress={() => navigation.navigate('EditApplication', { application: app })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.appAvatar, { backgroundColor: s.bg }]}>
                        <Text style={[styles.appAvatarLetter, { color: s.text }]}>
                          {app.company?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                      <View style={styles.appInfo}>
                        <Text style={styles.appCompany} numberOfLines={1}>{app.company}</Text>
                        <Text style={styles.appRole} numberOfLines={1}>{app.role}</Text>
                      </View>
                      <View style={[styles.appBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.appBadgeText, { color: s.text }]}>{app.status}</Text>
                      </View>
                    </TouchableOpacity>
                    {idx < recentApps.length - 1 && <View style={styles.rowDivider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No applications yet</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddApplication')}
              >
                <Text style={styles.emptyBtnText}>Add your first one</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, color, iconColor, onPress }: any) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgWarm },
  scroll: {},

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingText: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  dateText: { fontSize: 14, color: Colors.textSecondary, marginTop: 3 },
  logoSmall: {},
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: 12,
  },
  errorText: { fontSize: 13, color: Colors.error, flex: 1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    ...Shadows.card,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  // Section
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  seeAll: { fontSize: 13, fontWeight: '600', color: Colors.yellowDark },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadows.card,
  },

  // Next Interview card
  nextInterviewCard: { borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.card },
  nextInterviewGradient: {
    padding: 16,
    gap: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.yellowMid,
  },
  niRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  niIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.yellow + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  niInfo: { flex: 1, minWidth: 0 },
  niCompany: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  niRole: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  niTypeBadge: {
    backgroundColor: Colors.yellow + '33',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  niTypeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.yellowDark },
  niDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  niDate: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  niRelative: { fontSize: 13, color: Colors.textSecondary },
  niLocation: { fontSize: 13, color: Colors.textSecondary, flex: 1 },

  // Pipeline
  pipelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  pipelineDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  pipelineLabel: { fontSize: 13, color: Colors.textSecondary, width: 90 },
  pipelineBarBg: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  pipelineBar: { height: 6, borderRadius: 3 },
  pipelineCount: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, width: 24, textAlign: 'right' },

  // Recent apps
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  appAvatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  appAvatarLetter: { fontSize: 16, fontWeight: '800' },
  appInfo: { flex: 1, minWidth: 0 },
  appCompany: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  appRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  appBadge: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  appBadgeText: { fontSize: 10, fontWeight: '700' },
  rowDivider: { height: 1, backgroundColor: Colors.border },

  // Empty state
  emptyState: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    ...Shadows.card,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
});

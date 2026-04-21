import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import InterviewCard from '../components/InterviewCard';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';
import { Interview } from '../types';

type Tab = 'upcoming' | 'past';

export default function InterviewsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('upcoming');

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await api.get('/interviews?limit=100');
      setInterviews(res.data.interviews ?? []);
      setError('');
    } catch {
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchInterviews(); }, [fetchInterviews])
  );

  const onRefresh = () => { setRefreshing(true); fetchInterviews(); };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setError('Failed to delete interview. Please try again.');
    }
  };

  const now = new Date();
  const filtered = interviews.filter((i) =>
    tab === 'upcoming'
      ? new Date(i.scheduledAt) >= now
      : new Date(i.scheduledAt) < now
  );

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    return tab === 'upcoming' ? diff : -diff;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <InterviewCard
              interview={item}
              onPress={() => navigation.navigate('EditInterview', { interview: item })}
              onDelete={() => handleDelete(item._id)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Page header */}
            <View style={[styles.pageHeader, { paddingTop: insets.top + 14 }]}>
              <View>
                <Text style={styles.pageTitle}>Interviews</Text>
                <Text style={styles.pageSubtitle}>{interviews.length} total</Text>
              </View>
            </View>

            {/* Segmented tab */}
            <View style={styles.segmented}>
              {(['upcoming', 'past'] as Tab[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  activeOpacity={0.7}
                  style={[styles.segTab, tab === t && styles.segTabActive]}
                >
                  <Text style={[styles.segTabText, tab === t && styles.segTabTextActive]}>
                    {t === 'upcoming' ? '🗓 Upcoming' : '📁 Past'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.yellow}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>
              {tab === 'upcoming' ? '🗓' : '📁'}
            </Text>
            <Text style={styles.emptyTitle}>
              {tab === 'upcoming' ? 'No upcoming interviews' : 'No past interviews'}
            </Text>
            <Text style={styles.emptyHint}>
              {tab === 'upcoming' ? 'Tap + to schedule one' : 'Past interviews will appear here'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => navigation.navigate('AddInterview')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={Gradients.primaryBtn} style={styles.fab}>
          <Ionicons name="add" size={28} color={Colors.textPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgWarm },
  list: { paddingBottom: 120 },

  listHeader: {},
  pageHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  segmented: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 4,
    ...Shadows.card,
  },
  segTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segTabActive: { backgroundColor: Colors.yellow },
  segTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segTabTextActive: { color: Colors.textPrimary },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: 12,
  },
  errorText: { flex: 1, color: Colors.error, fontSize: 13 },

  cardWrapper: { paddingHorizontal: 20 },

  emptyWrap: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  fabWrap: { position: 'absolute', bottom: 28, right: 24, borderRadius: Radius.xl, ...Shadows.float },
  fab: { width: 60, height: 60, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' },
});

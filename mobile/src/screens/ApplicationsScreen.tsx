import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

const STATUSES = ['All', 'Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationsScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filter !== 'All') params.set('status', filter);
      const res = await api.get(`/applications?${params}`);
      setApplications(res.data.applications);
      setError('');
    } catch {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchApplications(); }, [filter])
  );

  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch {
      // silently fail — user can refresh
    }
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Applications</Text>
          <Text style={styles.pageSubtitle}>{applications.length} total</Text>
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        data={STATUSES}
        horizontal
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={styles.chipListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            activeOpacity={0.7}
            style={[styles.chip, filter === item && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

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
        data={applications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ApplicationCard
              application={item}
              onPress={() => navigation.navigate('EditApplication', { application: item })}
              onDelete={() => handleDelete(item._id)}
            />
          </View>
        )}
        ListHeaderComponent={<ListHeader />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.yellow}
            colors={[Colors.yellow]}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first one</Text>
          </View>
        }
      />

      {/* FAB — single add button */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => navigation.navigate('AddApplication')}
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
  list: { paddingBottom: 100 },

  listHeader: { paddingTop: 16 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  chipList: { marginBottom: 16 },
  chipListContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.input,
  },
  chipActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textPrimary },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: 12,
  },
  errorText: { color: Colors.error, fontSize: 13 },

  cardWrapper: { paddingHorizontal: 20 },

  emptyWrap: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  fabWrap: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    borderRadius: Radius.xl,
    ...Shadows.float,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

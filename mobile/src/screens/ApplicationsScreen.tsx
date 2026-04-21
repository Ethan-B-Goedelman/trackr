import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

const STATUSES = ['All', 'Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [contactMap, setContactMap] = useState<Record<string, string>>({});
  const [interviewSet, setInterviewSet] = useState<Set<string>>(new Set());
  const searchRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchApplications = useCallback(async (q?: string, f?: string) => {
    try {
      const params = new URLSearchParams({ limit: '100' });
      const activeFilter = f ?? filter;
      const activeQuery = q ?? query;
      if (activeQuery.trim()) {
        params.set('q', activeQuery.trim());
      } else if (activeFilter !== 'All') {
        params.set('status', activeFilter);
      }
      const res = await api.get(`/applications?${params}`);
      setApplications(res.data.applications);
      setError('');
    } catch {
      setError('Failed to load applications. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query]);

  useFocusEffect(
    useCallback(() => { fetchApplications(); }, [filter])
  );

  // Fetch contact + interview data once on mount (supplemental, silent fail)
  useEffect(() => {
    Promise.all([
      api.get('/contacts?limit=200'),
      api.get('/interviews?limit=200'),
    ]).then(([cRes, iRes]) => {
      const cMap: Record<string, string> = {};
      (cRes.data.contacts ?? []).forEach((c: any) => {
        if (c.application) {
          const appId = typeof c.application === 'object' ? c.application._id : c.application;
          if (appId) cMap[appId] = c.name;
        }
      });
      setContactMap(cMap);

      const iSet = new Set<string>();
      (iRes.data.interviews ?? []).forEach((i: any) => {
        if (i.application) {
          const appId = typeof i.application === 'object' ? i.application._id : i.application;
          if (appId) iSet.add(appId);
        }
      });
      setInterviewSet(iSet);
    }).catch(() => {});
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchApplications(); };

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { fetchApplications('', filter); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/applications?q=${encodeURIComponent(text)}&limit=50`);
        setApplications(res.data.applications);
        setError('');
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const openSearch = () => {
    setSearchActive(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchActive(false);
    setQuery('');
    fetchApplications('', filter);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev: any[]) => prev.filter((a) => a._id !== id));
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <View style={[styles.pageHeader, { paddingTop: insets.top + 14 }]}>
        {searchActive ? (
          /* Search mode */
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, styles.searchBarActive]}>
              <Ionicons name="search" size={17} color={Colors.textTertiary} style={styles.searchIcon} />
              <TextInput
                ref={searchRef}
                style={styles.searchInput}
                placeholder="Company, role, location…"
                placeholderTextColor={Colors.textPlaceholder}
                value={query}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchLoading ? (
                <ActivityIndicator size="small" color={Colors.yellow} style={styles.searchAdornment} />
              ) : query.length > 0 ? (
                <TouchableOpacity onPress={() => { setQuery(''); fetchApplications('', filter); }} style={styles.searchAdornment}>
                  <View style={styles.clearIcon}>
                    <Ionicons name="close" size={13} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Normal header */
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.pageTitle}>Applications</Text>
              <Text style={styles.pageSubtitle}>{applications.length} total</Text>
            </View>
            <TouchableOpacity
              style={styles.searchIconBtn}
              onPress={openSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="search" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter chips — hidden during search */}
      {!searchActive && (
        <FlatList
          data={STATUSES}
          horizontal
          keyExtractor={(s) => s}
          showsHorizontalScrollIndicator={false}
          style={styles.chipList}
          contentContainerStyle={styles.chipListContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { setFilter(item); fetchApplications('', item); }}
              activeOpacity={0.7}
              style={[styles.chip, filter === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
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
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View style={styles.cardWrapper}>
            <ApplicationCard
              application={item}
              onPress={() => navigation.navigate('EditApplication', { application: item })}
              onDelete={() => handleDelete(item._id)}
              hasInterview={interviewSet.has(item._id)}
              contactName={contactMap[item._id] ?? null}
            />
          </View>
        )}
        ListHeaderComponent={<ListHeader />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.yellow}
          />
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>{query ? '🔍' : '📋'}</Text>
            <Text style={styles.emptyTitle}>
              {query ? `No results for "${query}"` : 'No applications yet'}
            </Text>
            <Text style={styles.emptyHint}>
              {query ? 'Try a different search' : 'Tap + to add your first one'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
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
  list: { paddingBottom: 120 },

  listHeader: {},
  pageHeader: { paddingHorizontal: 20, paddingBottom: 14 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  searchIconBtn: { padding: 4 },

  // Search mode
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    ...Shadows.card,
  },
  searchBarActive: { borderColor: Colors.yellow },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  searchAdornment: { marginLeft: 6 },
  clearIcon: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { fontSize: 15, color: Colors.yellowDark, fontWeight: '600' },

  chipList: { marginBottom: 14 },
  chipListContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadows.input,
  },
  chipActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textPrimary },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.errorBg, borderRadius: Radius.sm, padding: 12,
  },
  errorText: { flex: 1, color: Colors.error, fontSize: 13 },

  cardWrapper: { paddingHorizontal: 20 },

  emptyWrap: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  fabWrap: { position: 'absolute', bottom: 28, right: 24, borderRadius: Radius.xl, ...Shadows.float },
  fab: { width: 60, height: 60, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' },
});

import React, { useState, useCallback, useRef } from 'react';
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
import ContactCard from '../components/ContactCard';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';
import { Contact } from '../types';

export default function ContactsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContacts = useCallback(async (q?: string) => {
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (q?.trim()) params.set('q', q.trim());
      const res = await api.get(`/contacts?${params}`);
      setContacts(res.data.contacts ?? []);
      setError('');
    } catch {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchContacts(); }, [fetchContacts])
  );

  const onRefresh = () => { setRefreshing(true); fetchContacts(query); };

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchContacts(text), 350);
  };

  const clearSearch = () => {
    setQuery('');
    fetchContacts('');
    searchRef.current?.blur();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError('Failed to delete contact. Please try again.');
    }
  };

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
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ContactCard
              contact={item}
              onPress={() => navigation.navigate('EditContact', { contact: item })}
              onDelete={() => handleDelete(item._id)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Page header */}
            <View style={[styles.pageHeader, { paddingTop: insets.top + 14 }]}>
              <View>
                <Text style={styles.pageTitle}>Contacts</Text>
                <Text style={styles.pageSubtitle}>{contacts.length} total</Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
              <Ionicons name="search" size={17} color={Colors.textTertiary} style={styles.searchIcon} />
              <TextInput
                ref={searchRef}
                style={styles.searchInput}
                placeholder="Search by name, company, role…"
                placeholderTextColor={Colors.textPlaceholder}
                value={query}
                onChangeText={handleSearch}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.length > 0 ? (
                <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                  <View style={styles.clearIcon}>
                    <Ionicons name="close" size={13} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ) : null}
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
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>
              {query ? '🔍' : '👥'}
            </Text>
            <Text style={styles.emptyTitle}>
              {query ? `No contacts matching "${query}"` : 'No contacts yet'}
            </Text>
            <Text style={styles.emptyHint}>
              {query ? 'Try a different search' : 'Tap + to add your first contact'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => navigation.navigate('AddContact')}
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

  listHeader: { paddingBottom: 8 },
  pageHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    ...Shadows.card,
  },
  searchBarFocused: { borderColor: Colors.yellow },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: { padding: 4 },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

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
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  fabWrap: { position: 'absolute', bottom: 28, right: 24, borderRadius: Radius.xl, ...Shadows.float },
  fab: { width: 60, height: 60, borderRadius: Radius.xl, justifyContent: 'center', alignItems: 'center' },
});

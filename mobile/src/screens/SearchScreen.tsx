import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import { Colors, Radius, Shadows } from '../theme/colors';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(timerRef.current);

    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/applications?q=${encodeURIComponent(text)}&limit=30`);
        setResults(res.data.applications);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Company, role, location…"
            placeholderTextColor={Colors.textPlaceholder}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {loading ? (
            <ActivityIndicator size="small" color={Colors.yellow} style={styles.searchAdornment} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={clearSearch} style={styles.searchAdornment}>
              <View style={styles.clearBtn}>
                <Ionicons name="close" size={14} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No results for "{query}"</Text>
              <Text style={styles.emptyHint}>Try a different company or role</Text>
            </View>
          ) : !searched ? (
            <View style={styles.hintWrap}>
              <Text style={styles.hintEmoji}>✨</Text>
              <Text style={styles.hintText}>Search across all your applications</Text>
              <Text style={styles.hintSub}>Company name, role, location, or notes</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },

  // Header
  header: {
    backgroundColor: Colors.bgWarm,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 12 },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    ...Shadows.card,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  searchAdornment: { marginLeft: 8 },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  list: { padding: 20, paddingTop: 8, paddingBottom: 40 },

  // Empty / hint states
  emptyWrap: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  hintWrap: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  hintEmoji: { fontSize: 48, marginBottom: 14 },
  hintText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  hintSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});

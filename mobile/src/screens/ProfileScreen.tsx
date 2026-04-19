import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <LinearGradient colors={Gradients.logo} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        {user?.name ? (
          <Text style={styles.userName}>{user.name}</Text>
        ) : null}
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* Account card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="mail-outline" size={18} color={Colors.yellowDark} />
          </View>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue} numberOfLines={1}>{user?.email ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.yellowDark} />
          </View>
          <Text style={styles.rowLabel}>Verified</Text>
          <Text style={styles.rowValue}>{user?.isVerified ? 'Yes' : 'No'}</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },
  content: { paddingBottom: 48 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.float,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 14, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
  rowValue: { fontSize: 14, color: Colors.textSecondary, maxWidth: 180 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12, marginLeft: 42 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    ...Shadows.card,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.error },
});

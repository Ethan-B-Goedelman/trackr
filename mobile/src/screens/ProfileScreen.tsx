import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon as any} size={18} color={Colors.yellowDark} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 48 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <LinearGradient colors={Gradients.logo} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        {fullName ? <Text style={styles.userName}>{fullName}</Text> : null}
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* Account info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '—'} />
        <View style={styles.divider} />
        <InfoRow
          icon="person-outline"
          label="Name"
          value={fullName || '—'}
        />
      </View>

      {/* App card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://jobtrackrrr.com')}
          activeOpacity={0.7}
        >
          <View style={styles.rowIcon}>
            <Ionicons name="globe-outline" size={18} color={Colors.yellowDark} />
          </View>
          <Text style={styles.rowLabel}>Web App</Text>
          <Text style={styles.rowLink}>jobtrackrrr.com</Text>
          <Ionicons name="open-outline" size={14} color={Colors.textTertiary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('mailto:support@jobtrackrrr.com')}
          activeOpacity={0.7}
        >
          <View style={styles.rowIcon}>
            <Ionicons name="help-circle-outline" size={18} color={Colors.yellowDark} />
          </View>
          <Text style={styles.rowLabel}>Support</Text>
          <Text style={styles.rowLink}>Contact us</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
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

      <Text style={styles.version}>Trackr — Your Job Journey Companion</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },
  content: {},

  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },

  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.float,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
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
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: {
    width: 32, height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
  rowValue: { fontSize: 14, color: Colors.textSecondary, maxWidth: 180 },
  rowLink: { fontSize: 14, color: Colors.yellowDark, fontWeight: '600' },
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

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 24,
    marginBottom: 8,
  },
});

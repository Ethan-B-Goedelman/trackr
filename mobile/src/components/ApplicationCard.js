import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Colors, Radius, Shadows } from '../theme/colors';

dayjs.extend(relativeTime);

const STATUS_STYLES = {
  'Applied':      { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Phone Screen': { bg: '#fef9c3', text: '#a16207', dot: '#fbbf24' },
  'Technical':    { bg: '#ede9fe', text: '#6d28d9', dot: '#8b5cf6' },
  'Onsite':       { bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  'Offer':        { bg: '#fce7f3', text: '#be185d', dot: '#ec4899' },
  'Accepted':     { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  'Rejected':     { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
};

export default function ApplicationCard({ application, onPress }) {
  const { company, role, status, location, salaryMin, salaryMax, dateApplied } = application;
  const s = STATUS_STYLES[status] ?? STATUS_STYLES['Applied'];

  const salary =
    salaryMin || salaryMax
      ? [salaryMin, salaryMax].filter(Boolean).map((v) => `$${(v / 1000).toFixed(0)}k`).join(' – ')
      : null;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        {/* Company initial avatar */}
        <View style={[styles.avatar, { backgroundColor: s.bg }]}>
          <Text style={[styles.avatarLetter, { color: s.text }]}>
            {company ? company[0].toUpperCase() : '?'}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.company} numberOfLines={1}>{company}</Text>
          <Text style={styles.role} numberOfLines={1}>{role}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <View style={[styles.badgeDot, { backgroundColor: s.dot }]} />
          <Text style={[styles.badgeText, { color: s.text }]}>{status}</Text>
        </View>
      </View>

      {/* Meta row */}
      {(location || salary || dateApplied) ? (
        <View style={styles.metaRow}>
          {location ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
            </View>
          ) : null}
          {salary ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>💰</Text>
              <Text style={styles.metaText}>{salary}</Text>
            </View>
          ) : null}
          {dateApplied ? (
            <View style={[styles.metaItem, styles.metaRight]}>
              <Text style={styles.metaDate}>{dayjs(dateApplied).fromNow()}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },

  // Top row
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1, minWidth: 0 },
  company: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  role: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaRight: { marginLeft: 'auto' },
  metaIcon: { fontSize: 11 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  metaDate: { fontSize: 12, color: Colors.textTertiary, fontStyle: 'italic' },
});

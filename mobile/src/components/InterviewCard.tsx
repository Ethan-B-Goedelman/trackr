import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Colors, Radius, Shadows } from '../theme/colors';
import { Interview, ApplicationRef } from '../types';

const TYPE_CONFIG: Record<string, { icon: string; bg: string; text: string }> = {
  Phone:      { icon: 'call-outline',          bg: '#dbeafe', text: '#1d4ed8' },
  Video:      { icon: 'videocam-outline',       bg: '#ede9fe', text: '#6d28d9' },
  Technical:  { icon: 'code-slash-outline',     bg: '#d1fae5', text: '#065f46' },
  Onsite:     { icon: 'business-outline',       bg: '#ffedd5', text: '#c2410c' },
  Behavioral: { icon: 'person-circle-outline',  bg: '#fce7f3', text: '#be185d' },
  Other:      { icon: 'document-text-outline',  bg: '#f3f4f6', text: '#6b7280' },
};

interface Props {
  interview: Interview;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function InterviewCard({ interview, onPress, onDelete }: Props) {
  const { application, scheduledAt, type, interviewerName, location, rating } = interview;
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG['Other'];
  const appRef =
    application && typeof application === 'object' ? (application as ApplicationRef) : null;
  const isPast = new Date(scheduledAt) < new Date();

  const handleDelete = () => {
    Alert.alert('Delete Interview', 'Remove this interview?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.typeIcon, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={22} color={cfg.text} />
        </View>
        <View style={styles.info}>
          <Text style={styles.company} numberOfLines={1}>
            {appRef ? appRef.company : 'Unknown Company'}
          </Text>
          <Text style={styles.role} numberOfLines={1}>
            {appRef ? appRef.role : type + ' Interview'}
          </Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.typeBadgeText, { color: cfg.text }]}>{type}</Text>
        </View>
      </View>

      {/* Date row */}
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-outline"
          size={13}
          color={isPast ? Colors.textTertiary : Colors.yellowDark}
        />
        <Text style={[styles.dateText, isPast && styles.pastText]}>
          {dayjs(scheduledAt).format('MMM D, YYYY [at] h:mm A')}
        </Text>
        {isPast ? (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Past</Text>
          </View>
        ) : (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>Upcoming</Text>
          </View>
        )}
      </View>

      {/* Meta row */}
      {(interviewerName || location || rating != null) ? (
        <View style={styles.metaRow}>
          {interviewerName ? (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.metaText} numberOfLines={1}>{interviewerName}</Text>
            </View>
          ) : null}
          {location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
            </View>
          ) : null}
          {rating != null ? (
            <View style={[styles.metaItem, { marginLeft: 'auto' }]}>
              <Text style={styles.ratingText}>
                {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={15} color={Colors.yellowDark} />
          <Text style={styles.actionEdit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={15} color={Colors.error} />
          <Text style={styles.actionDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  company: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  role: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  typeBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  pastText: { color: Colors.textTertiary },

  pastBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pastBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary },
  upcomingBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  upcomingBadgeText: { fontSize: 11, fontWeight: '600', color: '#065f46' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  ratingText: { fontSize: 13, color: Colors.yellowDark, letterSpacing: 1 },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgWarm,
  },
  actionEdit: { fontSize: 13, fontWeight: '600', color: Colors.yellowDark },
  actionDelete: { fontSize: 13, fontWeight: '600', color: Colors.error },
});

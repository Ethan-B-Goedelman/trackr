import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows } from '../theme/colors';
import { Contact, ApplicationRef } from '../types';

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#fef9c3', text: '#a16207' },
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface Props {
  contact: Contact;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function ContactCard({ contact, onPress, onDelete }: Props) {
  const { name, email, phone, company, role, application } = contact;
  const color = avatarColor(name);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const appRef =
    application && typeof application === 'object' ? (application as ApplicationRef) : null;

  const handleDelete = () => {
    Alert.alert('Delete Contact', `Remove ${name} from your contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: color.bg }]}>
          <Text style={[styles.avatarText, { color: color.text }]}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {(role || company) ? (
            <Text style={styles.roleCompany} numberOfLines={1}>
              {[role, company].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Details */}
      {(email || phone || appRef) ? (
        <View style={styles.detailsRow}>
          {email ? (
            <View style={styles.detailItem}>
              <Ionicons name="mail-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.detailText} numberOfLines={1}>{email}</Text>
            </View>
          ) : null}
          {phone ? (
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.detailText} numberOfLines={1}>{phone}</Text>
            </View>
          ) : null}
          {appRef ? (
            <View style={styles.detailItem}>
              <Ionicons name="briefcase-outline" size={13} color={Colors.yellowDark} />
              <Text style={styles.linkedText} numberOfLines={1}>{appRef.company}</Text>
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
        {email ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`mailto:${email}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={15} color={Colors.success} />
            <Text style={styles.actionMail}>Email</Text>
          </TouchableOpacity>
        ) : null}
        {phone ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${phone}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={15} color={Colors.success} />
            <Text style={styles.actionMail}>Call</Text>
          </TouchableOpacity>
        ) : null}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 17, fontWeight: '800' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  roleCompany: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  detailsRow: {
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  linkedText: { fontSize: 13, color: Colors.yellowDark, fontWeight: '600', flex: 1 },

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  actionMail: { fontSize: 13, fontWeight: '600', color: Colors.success },
  actionDelete: { fontSize: 13, fontWeight: '600', color: Colors.error },
});

import React, { useState } from 'react';
import {
  Modal, View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows } from '../theme/colors';

export interface PickerOption {
  value: string;
  label: string;
  sub?: string;
}

interface Props {
  value: string;
  options: PickerOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  clearable?: boolean;
  error?: boolean;
}

export default function PickerModal({
  value,
  options,
  placeholder = 'Select…',
  onChange,
  clearable = false,
  error = false,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.sub ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setVisible(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError, !!value && styles.triggerFilled]}
        onPress={() => { setSearch(''); setVisible(true); }}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.triggerText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => { setVisible(false); setSearch(''); }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => { setVisible(false); setSearch(''); }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetOuter}
          >
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{placeholder}</Text>
                <TouchableOpacity
                  onPress={() => { setVisible(false); setSearch(''); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              {options.length > 5 && (
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={15} color={Colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search…"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                    returnKeyType="search"
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <Ionicons name="close" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Options list */}
              <FlatList
                data={filtered}
                keyExtractor={(o) => o.value}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  clearable ? (
                    <TouchableOpacity
                      style={[styles.option, !value && styles.optionActive]}
                      onPress={() => handleSelect('')}
                    >
                      <Text style={[styles.optionText, !value && styles.optionTextActive]}>
                        — None —
                      </Text>
                      {!value && (
                        <Ionicons name="checkmark" size={16} color={Colors.yellowDark} />
                      )}
                    </TouchableOpacity>
                  ) : null
                }
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {search ? `No matches for "${search}"` : 'No options available'}
                  </Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.option, item.value === value && styles.optionActive]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[styles.optionText, item.value === value && styles.optionTextActive]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      {item.sub ? (
                        <Text style={styles.optionSub} numberOfLines={1}>{item.sub}</Text>
                      ) : null}
                    </View>
                    {item.value === value && (
                      <Ionicons name="checkmark" size={16} color={Colors.yellowDark} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...Shadows.input,
  },
  triggerFilled: { borderColor: Colors.yellowMid },
  triggerError: { borderColor: Colors.error },
  triggerText: { flex: 1, fontSize: 15, color: Colors.textPrimary, marginRight: 8 },
  placeholder: { color: Colors.textPlaceholder },

  // Sheet
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { flex: 1 },
  sheetOuter: { maxHeight: '78%' },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingTop: 8,
    ...Shadows.float,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: Colors.bgWarm,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  list: { maxHeight: 360 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionActive: { backgroundColor: Colors.bgMuted },
  optionContent: { flex: 1, marginRight: 8 },
  optionText: { fontSize: 15, color: Colors.textPrimary },
  optionTextActive: { fontWeight: '700', color: Colors.yellowDark },
  optionSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  emptyText: { padding: 24, color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});

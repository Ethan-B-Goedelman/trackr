import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

const STATUSES = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

const isValidDate = (val: string) => {
  if (!val) return true; // optional field
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
};

function SectionHeader({ label }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function Field({ label, error, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, error && styles.inputWrapError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textPlaceholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function AddApplicationScreen({ navigation }) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'Applied',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobUrl: '',
    notes: '',
    dateApplied: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  // Warn user if they try to go back with unsaved data
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const hasData = form.company.trim() || form.role.trim() || form.notes.trim();
      if (!hasData || loading) return;
      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Go back and discard them?',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, form, loading]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.role.trim()) e.role = 'Role is required';
    if (form.salaryMin && isNaN(Number(form.salaryMin))) e.salaryMin = 'Must be a number';
    if (form.salaryMax && isNaN(Number(form.salaryMax))) e.salaryMax = 'Must be a number';
    if (
      form.salaryMin && form.salaryMax &&
      !isNaN(Number(form.salaryMin)) && !isNaN(Number(form.salaryMax)) &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      e.salaryMin = 'Min salary cannot exceed max';
    }
    if (form.dateApplied && !isValidDate(form.dateApplied)) {
      e.dateApplied = 'Use format YYYY-MM-DD';
    }
    if (form.notes.length > 5000) e.notes = 'Notes cannot exceed 5000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/applications', {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <SectionHeader label="Basic Info" />
          <View style={styles.card}>
            <Field
              label="Company *"
              placeholder="Acme Corp"
              value={form.company}
              onChangeText={set('company')}
              error={errors.company}
              autoCapitalize="words"
            />
            <Field
              label="Role / Position *"
              placeholder="Software Engineer Intern"
              value={form.role}
              onChangeText={set('role')}
              error={errors.role}
              autoCapitalize="words"
            />
            <Field
              label="Location"
              placeholder="Remote · San Francisco, CA"
              value={form.location}
              onChangeText={set('location')}
            />
          </View>

          {/* Status */}
          <SectionHeader label="Status" />
          <View style={styles.card}>
            <View style={styles.statusGrid}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => set('status')(s)}
                  activeOpacity={0.7}
                  style={[styles.statusChip, form.status === s && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, form.status === s && styles.statusChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Compensation */}
          <SectionHeader label="Compensation" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Field
                  label="Salary Min"
                  placeholder="120000"
                  value={form.salaryMin}
                  onChangeText={set('salaryMin')}
                  keyboardType="numeric"
                  error={errors.salaryMin}
                />
              </View>
              <View style={styles.halfField}>
                <Field
                  label="Salary Max"
                  placeholder="160000"
                  value={form.salaryMax}
                  onChangeText={set('salaryMax')}
                  keyboardType="numeric"
                  error={errors.salaryMax}
                />
              </View>
            </View>
          </View>

          {/* Details */}
          <SectionHeader label="Details" />
          <View style={styles.card}>
            <Field
              label="Application Date"
              placeholder="YYYY-MM-DD"
              value={form.dateApplied}
              onChangeText={set('dateApplied')}
              error={errors.dateApplied}
            />
            <Field
              label="Job URL"
              placeholder="https://…"
              value={form.jobUrl}
              onChangeText={set('jobUrl')}
              keyboardType="url"
              autoCapitalize="none"
            />
            <Field
              label={`Notes ${form.notes.length > 0 ? `(${form.notes.length}/5000)` : ''}`}
              placeholder="Notes about this application…"
              value={form.notes}
              onChangeText={set('notes')}
              multiline
              numberOfLines={4}
              style={styles.textarea}
              error={errors.notes}
              maxLength={5000}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.btnOuter}
          >
            <LinearGradient
              colors={Gradients.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.btn, loading && styles.btnDisabled]}
            >
              {loading
                ? <ActivityIndicator color={Colors.textPrimary} />
                : (
                  <View style={styles.btnInner}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.textPrimary} />
                    <Text style={styles.btnText}>Add Application</Text>
                  </View>
                )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgWarm },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 4,
  },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadows.card,
  },

  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, paddingLeft: 2 },
  inputWrap: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.input,
  },
  inputWrapFocused: { borderColor: Colors.yellow },
  inputWrapError: { borderColor: Colors.error },
  input: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4, paddingLeft: 2 },
  textarea: { height: 88, textAlignVertical: 'top' },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgWarm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  statusChipActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  statusChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  statusChipTextActive: { color: Colors.textPrimary },

  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  btnOuter: { borderRadius: Radius.md, marginTop: 28, ...Shadows.float },
  btn: { borderRadius: Radius.md, paddingVertical: 17, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});

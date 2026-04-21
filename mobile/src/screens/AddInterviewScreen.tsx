import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import api from '../services/api';
import PickerModal from '../components/PickerModal';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

const TYPES = ['Phone', 'Video', 'Technical', 'Onsite', 'Behavioral', 'Other'];
const TYPE_ICONS: Record<string, string> = {
  Phone: '📞', Video: '🎥', Technical: '💻',
  Onsite: '🏢', Behavioral: '🧠', Other: '📋',
};

const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
const isValidTime = (v: string) => /^\d{2}:\d{2}$/.test(v);

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function Field({ label, error = '', required = false, children }: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function InputField({ label, error = '', required = false, ...inputProps }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} error={error} required={required}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, error && styles.inputWrapError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textPlaceholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
      </View>
    </Field>
  );
}

export default function AddInterviewScreen({ navigation }: any) {
  const [applications, setApplications] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    application: '',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '10:00',
    type: 'Video',
    interviewerName: '',
    interviewerRole: '',
    location: '',
    prepNotes: '',
    reflection: '',
    rating: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    api.get('/applications?limit=200').then((res) => {
      setApplications(
        (res.data.applications ?? []).map((a: any) => ({
          value: a._id,
          label: a.company,
          sub: a.role,
        }))
      );
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      const hasData = form.application || form.interviewerName || form.location || form.prepNotes;
      if (!hasData || loading) return;
      e.preventDefault();
      Alert.alert('Discard changes?', 'You have unsaved changes. Discard them?', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsub;
  }, [navigation, form, loading]);

  const set = (key: string) => (val: any) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date || !isValidDate(form.date)) e.date = 'Use format YYYY-MM-DD';
    if (!form.time || !isValidTime(form.time)) e.time = 'Use format HH:MM (24h)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();
      await api.post('/interviews', {
        application: form.application || undefined,
        scheduledAt,
        type: form.type,
        interviewerName: form.interviewerName || undefined,
        interviewerRole: form.interviewerRole || undefined,
        location: form.location || undefined,
        prepNotes: form.prepNotes || undefined,
        reflection: form.reflection || undefined,
        rating: form.rating > 0 ? form.rating : undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Failed to schedule interview. Please try again.');
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
          {serverError ? (
            <View style={styles.serverError}>
              <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Application */}
          <SectionHeader label="Linked Application" />
          <View style={styles.card}>
            <Field label="Application" error={errors.application}>
              <PickerModal
                value={form.application}
                options={applications}
                placeholder={applications.length === 0 ? 'No applications yet…' : 'Select application…'}
                onChange={set('application')}
                clearable
              />
            </Field>
          </View>

          {/* Schedule */}
          <SectionHeader label="Schedule" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  label="Date"
                  required
                  placeholder="YYYY-MM-DD"
                  value={form.date}
                  onChangeText={set('date')}
                  error={errors.date}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={styles.halfField}>
                <InputField
                  label="Time (24h)"
                  required
                  placeholder="HH:MM"
                  value={form.time}
                  onChangeText={set('time')}
                  error={errors.time}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
          </View>

          {/* Type */}
          <SectionHeader label="Interview Type" />
          <View style={styles.card}>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => set('type')(t)}
                  activeOpacity={0.7}
                  style={[styles.typeChip, form.type === t && styles.typeChipActive]}
                >
                  <Text style={styles.typeChipIcon}>{TYPE_ICONS[t]}</Text>
                  <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interviewer */}
          <SectionHeader label="Interviewer" />
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  label="Name"
                  placeholder="Jane Smith"
                  value={form.interviewerName}
                  onChangeText={set('interviewerName')}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfField}>
                <InputField
                  label="Their Role"
                  placeholder="Hiring Manager"
                  value={form.interviewerRole}
                  onChangeText={set('interviewerRole')}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <InputField
              label="Location / Link"
              placeholder="Zoom link or office address"
              value={form.location}
              onChangeText={set('location')}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Prep Notes */}
          <SectionHeader label="Prep Notes" />
          <View style={styles.card}>
            <InputField
              label="Topics to review, questions to ask…"
              placeholder="Prep notes…"
              value={form.prepNotes}
              onChangeText={set('prepNotes')}
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </View>

          {/* Reflection */}
          <SectionHeader label="Post-Interview Reflection" />
          <View style={styles.card}>
            <InputField
              label="How did it go?"
              placeholder="Reflection notes…"
              value={form.reflection}
              onChangeText={set('reflection')}
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </View>

          {/* Rating */}
          <SectionHeader label="Self-Rating" />
          <View style={styles.card}>
            <View style={styles.ratingRow}>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => set('rating')(n)}
                  activeOpacity={0.7}
                  style={[styles.ratingBtn, form.rating === n && styles.ratingBtnActive]}
                >
                  <Text style={[styles.ratingBtnText, form.rating === n && styles.ratingBtnTextActive]}>
                    {n === 0 ? '—' : `${n}★`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              {loading ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <View style={styles.btnInner}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.btnText}>Schedule Interview</Text>
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

  serverError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: 12,
    marginBottom: 16,
  },
  serverErrorText: { flex: 1, fontSize: 13, color: Colors.error, lineHeight: 18 },

  sectionHeader: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 20, marginBottom: 10, paddingLeft: 4,
  },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 16, ...Shadows.card },

  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 7, paddingLeft: 2 },
  required: { color: Colors.error },
  inputWrap: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadows.input,
  },
  inputWrapFocused: { borderColor: Colors.yellow },
  inputWrapError: { borderColor: Colors.error },
  input: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4, paddingLeft: 2 },
  textarea: { height: 88, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.pill, backgroundColor: Colors.bgWarm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  typeChipActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  typeChipIcon: { fontSize: 14 },
  typeChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.textPrimary },

  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: Radius.sm, backgroundColor: Colors.bgWarm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  ratingBtnActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  ratingBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  ratingBtnTextActive: { color: Colors.textPrimary },

  btnOuter: { borderRadius: Radius.md, marginTop: 28, ...Shadows.float },
  btn: { borderRadius: Radius.md, paddingVertical: 17, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});

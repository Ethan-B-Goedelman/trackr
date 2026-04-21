import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import PickerModal from '../components/PickerModal';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

const isValidEmail = (v: string) => !v || /\S+@\S+\.\S+/.test(v);
const isValidLinkedIn = (v: string) =>
  !v || /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/.test(v);

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function InputField({ label, required = false, error = '', ...inputProps }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, !!error && styles.inputWrapError]}>
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

export default function AddContactScreen({ navigation }: any) {
  const [applications, setApplications] = useState<{ value: string; label: string; sub?: string }[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    role: '', linkedIn: '', notes: '', application: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    api.get('/applications?limit=200').then((res) => {
      setApplications(
        (res.data.applications ?? []).map((a: any) => ({
          value: a._id, label: a.company, sub: a.role,
        }))
      );
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      const hasData = form.name.trim() || form.email || form.company;
      if (!hasData || loading) return;
      e.preventDefault();
      Alert.alert('Discard changes?', 'You have unsaved changes. Discard them?', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsub;
  }, [navigation, form, loading]);

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email address';
    if (!isValidLinkedIn(form.linkedIn)) e.linkedIn = 'Enter a valid LinkedIn URL';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await api.post('/contacts', {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        role: form.role || undefined,
        linkedIn: form.linkedIn || undefined,
        notes: form.notes || undefined,
        application: form.application || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Failed to add contact. Please try again.');
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

          {/* Basic Info */}
          <SectionHeader label="Basic Info" />
          <View style={styles.card}>
            <InputField
              label="Full Name"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChangeText={set('name')}
              error={errors.name}
              autoCapitalize="words"
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  label="Company"
                  placeholder="Acme Corp"
                  value={form.company}
                  onChangeText={set('company')}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfField}>
                <InputField
                  label="Role / Title"
                  placeholder="Recruiter"
                  value={form.role}
                  onChangeText={set('role')}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <SectionHeader label="Contact Info" />
          <View style={styles.card}>
            <InputField
              label="Email"
              placeholder="jane@company.com"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <InputField
              label="Phone"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChangeText={set('phone')}
              keyboardType="phone-pad"
            />
            <InputField
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/…"
              value={form.linkedIn}
              onChangeText={set('linkedIn')}
              error={errors.linkedIn}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Linked Application */}
          <SectionHeader label="Linked Application" />
          <View style={styles.card}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Application</Text>
              <PickerModal
                value={form.application}
                options={applications}
                placeholder="Select application… (optional)"
                onChange={set('application')}
                clearable
              />
              <Text style={styles.hint}>Link this contact to a job application, or leave unlinked.</Text>
            </View>
          </View>

          {/* Notes */}
          <SectionHeader label="Notes" />
          <View style={styles.card}>
            <InputField
              label="Notes"
              placeholder="Context, how you met, follow-up reminders…"
              value={form.notes}
              onChangeText={set('notes')}
              multiline
              numberOfLines={4}
              style={styles.textarea}
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
              {loading ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <View style={styles.btnInner}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.btnText}>Add Contact</Text>
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
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.errorBg, borderRadius: Radius.sm,
    padding: 12, marginBottom: 16,
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
  hint: { fontSize: 11, color: Colors.textTertiary, marginTop: 6, paddingLeft: 2 },
  textarea: { height: 88, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  btnOuter: { borderRadius: Radius.md, marginTop: 28, ...Shadows.float },
  btn: { borderRadius: Radius.md, paddingVertical: 17, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});

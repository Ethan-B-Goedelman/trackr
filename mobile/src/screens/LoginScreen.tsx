import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setServerError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={Gradients.bgFull} style={styles.gradient}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient colors={Gradients.logo} style={styles.logoCard}>
              <Ionicons name="document-text" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>Trackr</Text>
            <Text style={styles.tagline}>Track your dream job journey</Text>
          </View>

          {/* Error banner */}
          {!!serverError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={15} color="#dc2626" style={{ marginTop: 1 }} />
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          )}

          {/* Fields */}
          <View style={styles.fields}>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.btnOuter, { marginTop: 8 }]}
            >
              <LinearGradient
                colors={Gradients.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btn, loading && styles.btnDisabled]}
              >
                {loading
                  ? <ActivityIndicator color={Colors.textPrimary} />
                  : <Text style={styles.btnText}>Sign In</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Account */}
            <TouchableOpacity
              onPress={() => Linking.openURL('http://jobtrackerrr.com/register')}
              activeOpacity={0.85}
              style={styles.btnOutlined}
            >
              <Text style={styles.btnOutlinedText}>Create Account</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => Linking.openURL('http://jobtrackerrr.com/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? Register at </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('http://jobtrackerrr.com')}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Text style={styles.footerLink}>jobtrackerrr.com</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.float,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  // ── Error banner ──────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626', lineHeight: 18 },

  // ── Fields ────────────────────────────────────────────────────────────────
  fields: { gap: 0 },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 7,
    paddingLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.input,
  },
  inputWrapFocused: { borderColor: Colors.yellow },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnOuter: { borderRadius: Radius.md, ...Shadows.float },
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  btnOutlined: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  btnOutlinedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // ── Forgot ────────────────────────────────────────────────────────────────
  forgotWrap: { alignItems: 'center', marginTop: 16 },
  forgotText: { fontSize: 13, color: Colors.yellow, fontWeight: '600' },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: { fontSize: 12, color: Colors.textSecondary },
  footerLink: { fontSize: 12, color: Colors.yellow, fontWeight: '700' },
});

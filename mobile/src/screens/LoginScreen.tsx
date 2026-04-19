import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Alert, Linking,
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
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
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
              <Ionicons name="document-text" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>Trackr</Text>
            <Text style={styles.tagline}>Track your dream job journey</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to your account</Text>

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
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => Linking.openURL('http://137.184.237.129/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
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
                  : <Text style={styles.btnText}>Sign In</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text style={styles.footerLink}>Create one at trackr.app</Text>
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

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoCard: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Shadows.float,
  },
  appName: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl,
    padding: 28,
    ...Shadows.card,
  },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  subheading: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },

  // Fields
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputWrap: {
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

  // Forgot
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { fontSize: 13, color: Colors.yellow, fontWeight: '600' },

  // Button
  btnOuter: { borderRadius: Radius.md, ...Shadows.float },
  btn: { borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 13, color: Colors.textSecondary },
  footerLink: { fontSize: 13, color: Colors.yellow, fontWeight: '600' },
});

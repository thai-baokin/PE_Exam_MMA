import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/config/firebase';
import { validateRegisterForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/Colors';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [authError, setAuthError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = validateRegisterForm(email, password, confirmPassword);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setAuthError('');
    setSuccess(false);
    if (!validate()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setSubmitted(false);
    } catch (e: any) {
      setAuthError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'email' | 'password' | 'confirmPassword', val: string) => {
    if (field === 'email') setEmail(val);
    if (field === 'password') setPassword(val);
    if (field === 'confirmPassword') setConfirmPassword(val);

    if (submitted) {
      const updated = {
        email: field === 'email' ? val : email,
        password: field === 'password' ? val : password,
        confirmPassword: field === 'confirmPassword' ? val : confirmPassword,
      };
      const e = validateRegisterForm(updated.email, updated.password, updated.confirmPassword);
      setErrors(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join BookShelf today</Text>
          </View>

          {success && (
            <View testID="form-success" style={styles.successBox}>
              <Text style={styles.successText}>Registration successful</Text>
            </View>
          )}

          {authError ? (
            <View testID="error-auth" style={styles.errorBox}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          <AppInput
            label="Email"
            value={email}
            onChangeText={(v) => handleChange('email', v)}
            error={submitted ? errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            testID="input-email"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={(v) => handleChange('password', v)}
            error={submitted ? errors.password : undefined}
            secureTextEntry
            placeholder="At least 6 characters"
            testID="input-password"
          />
          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(v) => handleChange('confirmPassword', v)}
            error={submitted ? errors.confirmPassword : undefined}
            secureTextEntry
            placeholder="Repeat your password"
            testID="input-confirm-password"
          />

          <AppButton title="Register" onPress={handleSubmit} loading={loading} testID="btn-submit-register" />
          <AppButton
            title="Already have an account? Login"
            onPress={() => router.push('/(public)/login')}
            variant="outline"
            style={{ marginTop: 10 }}
          />
          <AppButton
            title="← Back to Home"
            onPress={() => router.back()}
            variant="secondary"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: Colors.textMuted },
  successBox: { backgroundColor: '#DCFCE7', borderRadius: 8, padding: 12, marginBottom: 16 },
  successText: { color: '#16A34A', fontWeight: '600', textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: Colors.danger, fontWeight: '500' },
});

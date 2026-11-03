import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/config/firebase';
import { validateLoginForm } from '@/utils/validation';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = validateLoginForm(email, password);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setAuthError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(protected)/list');
    } catch (e: any) {
      setAuthError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'email' | 'password', val: string) => {
    if (field === 'email') setEmail(val);
    if (field === 'password') setPassword(val);

    if (submitted) {
      const updated = {
        email: field === 'email' ? val : email,
        password: field === 'password' ? val : password,
      };
      const e = validateLoginForm(updated.email, updated.password);
      setErrors(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your BookShelf</Text>
          </View>

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
            placeholder="Your password"
            testID="input-password"
          />

          <AppButton title="Login" onPress={handleSubmit} loading={loading} testID="btn-submit-login" />
          <AppButton
            title="Don't have an account? Register"
            onPress={() => router.push('/(public)/register')}
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
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: Colors.danger, fontWeight: '500' },
});

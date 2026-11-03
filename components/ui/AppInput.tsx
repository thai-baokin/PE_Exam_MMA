import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  testID?: string;
}

export function AppInput({ label, error, testID, ...rest }: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={Colors.placeholder}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: '#FFFFFF',
    minHeight: 46,
  },
  inputError: { borderColor: Colors.danger, backgroundColor: '#FFF5F5' },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4, fontWeight: '500' },
});

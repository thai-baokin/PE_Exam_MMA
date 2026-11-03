import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function AppButton({
  title, onPress, variant = 'primary', loading, disabled, style, testID
}: AppButtonProps) {
  const bg = variant === 'primary' ? Colors.primary
    : variant === 'danger' ? Colors.danger
    : variant === 'outline' ? 'transparent'
    : Colors.secondary;

  const border = variant === 'outline' ? Colors.primary : 'transparent';
  const textColor = variant === 'outline' ? Colors.primary : '#fff';

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1.5 : 0 },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: { fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});

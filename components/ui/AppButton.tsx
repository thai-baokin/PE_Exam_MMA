import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Shadows3D } from '@/constants/Colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function AppButton({
  title, onPress, variant = 'primary', loading, disabled, style, textStyle, testID
}: AppButtonProps) {
  const bg = variant === 'primary' ? Colors.primary
    : variant === 'danger' ? Colors.danger
    : variant === 'outline' || variant === 'ghost' ? 'transparent'
    : Colors.secondary;

  const border = variant === 'outline' ? Colors.primary : 'transparent';
  const textColor = variant === 'outline' ? Colors.primary
    : variant === 'ghost' ? Colors.secondary
    : '#fff';

  const is3D = variant === 'primary' || variant === 'danger';

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1.5 : 0 },
        is3D && Shadows3D.button,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  text: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});

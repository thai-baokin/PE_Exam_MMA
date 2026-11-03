import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows3D } from '@/constants/Colors';
import { AppButton } from '@/components/ui/AppButton';

const FEATURES = [
  { icon: '🎬', title: 'Track what you watch', desc: 'Keep your own private watchlist with directors, genres, and notes.' },
  { icon: '🍿', title: 'Sort by status', desc: 'Organize films effortlessly into Plan to Watch, Watching, or Watched.' },
  { icon: '⭐', title: 'Rate your favorites', desc: 'Rate your movies from 0–5 and highlight your all-time favorites.' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.appName}>🎬 CineList</Text>
        <View style={styles.headerButtons}>
          <AppButton
            title="Login"
            onPress={() => router.push('/(public)/login')}
            variant="outline"
            style={styles.headerBtn}
            testID="btn-login"
          />
          <AppButton
            title="Register"
            onPress={() => router.push('/(public)/register')}
            style={styles.headerBtn}
            testID="btn-register"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>CINEMA WATCHLIST APP</Text>
        </View>
        <Text testID="home-title" style={styles.heroTitle}>CineList</Text>
        <Text style={styles.heroDesc}>
          Your private, modern movie watchlist. Track films, sort by status, rate cinematic masterpieces, and curate your personal collection.
        </Text>

        <View style={styles.featuresContainer}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureCard, Shadows3D.card]}>
              <View style={styles.iconCircle}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <AppButton
            title="Get Started — Register"
            onPress={() => router.push('/(public)/register')}
            testID="btn-get-started"
          />
          <AppButton
            title="Already have an account? Log in"
            onPress={() => router.push('/(public)/login')}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  headerButtons: { flexDirection: 'row', gap: 10 },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 38, borderRadius: 10 },
  content: { padding: 22, paddingBottom: 48 },
  heroBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroDesc: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  featuresContainer: { gap: 14, marginBottom: 36 },
  featureCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 22 },
  featureTextWrapper: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  ctaContainer: { gap: 8 },
});

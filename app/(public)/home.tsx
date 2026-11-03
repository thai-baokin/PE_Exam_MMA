import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { AppButton } from '@/components/ui/AppButton';

const FEATURES = [
  { icon: '📚', title: 'Track Your Books', desc: 'Keep a personal list of books you own or want to read.' },
  { icon: '🔖', title: 'Sort by Status', desc: 'Organize books into To Read, Reading, or Finished.' },
  { icon: '⭐', title: 'Rate & Favorite', desc: 'Rate books from 0–5 and mark your favorites.' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.appName}>📖 BookShelf</Text>
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
        <Text testID="home-title" style={styles.heroTitle}>BookShelf</Text>
        <Text style={styles.heroDesc}>
          Your personal digital bookshelf — manage, track, and discover your reading journey all in one place.
        </Text>

        <View style={styles.featuresContainer}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
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
            style={{ marginTop: 10 }}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  headerButtons: { flexDirection: 'row', gap: 8 },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  content: { padding: 24, paddingBottom: 40 },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: { gap: 12, marginBottom: 32 },
  featureCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: { fontSize: 32, marginBottom: 8 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  ctaContainer: { marginTop: 8 },
});

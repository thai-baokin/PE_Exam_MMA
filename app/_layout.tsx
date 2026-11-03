import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { MoviesProvider } from '@/context/MoviesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MoviesProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </MoviesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

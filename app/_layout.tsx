import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { BooksProvider } from '@/context/BooksContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BooksProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BooksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider } from '../src/features/auth/SessionContext';
import { colors } from '../src/theme/tokens';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true } } });
export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><SessionProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vehicles/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="listing-form" options={{ presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
    </Stack>
  </SessionProvider></QueryClientProvider>;
}

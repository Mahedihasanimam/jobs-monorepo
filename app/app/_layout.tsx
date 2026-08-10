import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/components/providers/AppProviders';
import { colors } from '@/constants/colors';
import { ONBOARDING_KEY } from '@/hooks/useOnboarding';

function OnboardingGuard() { const router = useRouter(); const pathname = usePathname(); useEffect(() => { let active = true; void AsyncStorage.getItem(ONBOARDING_KEY).then((complete) => { if (!active) return; if (!complete && pathname !== '/onboarding') router.replace('/onboarding' as Href); else if (complete && pathname === '/onboarding') router.replace('/(tabs)'); }); return () => { active = false; }; }, [pathname, router]); return null; }

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <OnboardingGuard />
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="job/[id]" />
            <Stack.Screen name="pdf" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="overview" />
            <Stack.Screen name="exams" />
            <Stack.Screen name="filters" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

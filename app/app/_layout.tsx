import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/components/providers/AppProviders';
import { colors } from '@/constants/colors';
import { GOVT_BD_EMBLEM } from '@/constants/brand';
import { OnboardingProvider, useOnboardingStatus } from '@/hooks/useOnboarding';

function RootNavigator() {
  const { isLoading, isComplete } = useOnboardingStatus();
  if (isLoading) return <View style={styles.loading}><Image source={GOVT_BD_EMBLEM} resizeMode="contain" style={styles.emblem} /></View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
    <Stack.Protected guard={isComplete}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/[id]" />
      <Stack.Screen name="pdf" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="overview" />
      <Stack.Screen name="exams" />
      <Stack.Screen name="filters" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack.Protected>
    <Stack.Protected guard={!isComplete}>
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <AppProviders>
            <StatusBar style="dark" backgroundColor={colors.background} />
            <RootNavigator />
          </AppProviders>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, emblem: { width: 132, height: 132, borderRadius: 66 } });

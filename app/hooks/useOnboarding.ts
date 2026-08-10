import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const ONBOARDING_KEY = 'govt-jobs-bd:onboarding-complete';

export function useOnboarding(totalSlides: number) {
  const router = useRouter(); const [index, setIndex] = useState(0); const [saving, setSaving] = useState(false);
  const complete = useCallback(async () => { if (saving) return; setSaving(true); await AsyncStorage.setItem(ONBOARDING_KEY, '1'); router.replace('/(tabs)'); }, [router, saving]);
  const next = useCallback((scroll: (nextIndex: number) => void) => { if (index >= totalSlides - 1) void complete(); else scroll(index + 1); }, [complete, index, totalSlides]);
  return { index, setIndex, saving, complete, next, isLast: index === totalSlides - 1 };
}

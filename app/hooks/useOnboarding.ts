import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { PROFILE_KEY } from '@/hooks/useJobProfile';
import type { CandidateProfile } from '@/types/profile';

export const ONBOARDING_KEY = 'govt-jobs-bd:onboarding-complete';

type OnboardingContextValue = {
  isLoading: boolean;
  isComplete: boolean;
  markComplete: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function hasRequiredProfile(value: string | null | undefined) {
  if (!value) return false;
  try {
    const profile = JSON.parse(value) as Partial<CandidateProfile>;
    return Boolean(profile.dateOfBirth?.trim() && profile.educationLevel?.trim() && profile.currentDistrict?.trim());
  } catch {
    return false;
  }
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.multiGet([ONBOARDING_KEY, PROFILE_KEY])
      .then((entries) => {
        if (!mounted) return;
        const values = Object.fromEntries(entries);
        setIsComplete(values[ONBOARDING_KEY] === '1' && hasRequiredProfile(values[PROFILE_KEY]));
      })
      .catch(() => { if (mounted) setIsComplete(false); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const markComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    setIsComplete(true);
  }, []);

  const value = useMemo(() => ({ isLoading, isComplete, markComplete }), [isComplete, isLoading, markComplete]);
  return createElement(OnboardingContext.Provider, { value }, children);
}

export function useOnboardingStatus() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('useOnboardingStatus must be used inside OnboardingProvider');
  return value;
}

export function useOnboarding(totalSlides: number) {
  const router = useRouter(); const { markComplete } = useOnboardingStatus(); const [index, setIndex] = useState(0); const [saving, setSaving] = useState(false);
  const complete = useCallback(async () => { if (saving) return; setSaving(true); try { await markComplete(); router.replace('/(tabs)'); } finally { setSaving(false); } }, [markComplete, router, saving]);
  const next = useCallback((scroll: (nextIndex: number) => void) => { if (index >= totalSlides - 1) void complete(); else scroll(index + 1); }, [complete, index, totalSlides]);
  return { index, setIndex, saving, complete, next, isLast: index === totalSlides - 1 };
}

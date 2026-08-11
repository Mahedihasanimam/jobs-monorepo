import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { EMPTY_PROFILE, type CandidateProfile } from '@/types/profile';

export const PROFILE_KEY = 'govt-jobs-bd:candidate-profile:v1';
type ProfileContextValue = { profile: CandidateProfile; isLoading: boolean; saveProfile: (profile: CandidateProfile) => Promise<void> };
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function JobProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { let live = true; AsyncStorage.getItem(PROFILE_KEY).then((value) => { if (live && value) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(value) }); }).catch(() => undefined).finally(() => { if (live) setIsLoading(false); }); return () => { live = false; }; }, []);
  const saveProfile = useCallback(async (next: CandidateProfile) => { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setProfile(next); }, []);
  const value = useMemo(() => ({ profile, isLoading, saveProfile }), [profile, isLoading, saveProfile]);
  return createElement(ProfileContext.Provider, { value }, children);
}

export function useJobProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useJobProfile must be used inside JobProfileProvider');
  return value;
}

import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, type PropsWithChildren } from 'react';
import { queryClient, queryPersister } from '@/lib/queryClient';
import { JobProfileProvider } from '@/hooks/useJobProfile';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => NetInfo.addEventListener((state) => onlineManager.setOnline(Boolean(state.isConnected))), []);
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60 * 1000 }}>
      <JobProfileProvider>{children}</JobProfileProvider>
    </PersistQueryClientProvider>
  );
}

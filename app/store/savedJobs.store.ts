import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerForPushNotificationsAsync, subscribeToJobUpdates, unsubscribeFromJobUpdates } from '@/services/notification.service';

interface SavedJobsState {
  savedJobIds: number[];
  toggleSaved: (id: number) => void;
  isSaved: (id: number) => boolean;
  syncToBackend: () => Promise<void>;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      toggleSaved: (id) => {
        const isCurrentlySaved = get().savedJobIds.includes(id);
        
        set((state) => ({
          savedJobIds: isCurrentlySaved
            ? state.savedJobIds.filter((savedId) => savedId !== id)
            : [id, ...state.savedJobIds],
        }));

        // Fire and forget backend sync
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            if (!isCurrentlySaved) {
              subscribeToJobUpdates(id, token);
            } else {
              unsubscribeFromJobUpdates(id, token);
            }
          }
        }).catch(console.error);
      },
      isSaved: (id) => get().savedJobIds.includes(id),
      syncToBackend: async () => {
        try {
          const token = await registerForPushNotificationsAsync();
          if (!token) return;
          const { savedJobIds } = get();
          await Promise.all(savedJobIds.map(id => subscribeToJobUpdates(id, token)));
        } catch (error) {
          console.error('Failed to sync saved jobs:', error);
        }
      }
    }),
    { name: 'govt-jobs-bd-saved', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

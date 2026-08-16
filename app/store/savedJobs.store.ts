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
        registerForPushNotificationsAsync().then(async (token) => {
          if (token) {
            if (!isCurrentlySaved) {
              console.log(`Subscribing to job ${id}...`);
              const success = await subscribeToJobUpdates(id, token, 'saved');
              console.log(`Subscription for job ${id} ${success ? 'succeeded' : 'failed'}`);
            } else {
              console.log(`Unsubscribing from job ${id}...`);
              const success = await unsubscribeFromJobUpdates(id, token, 'saved');
              console.log(`Unsubscription for job ${id} ${success ? 'succeeded' : 'failed'}`);
            }
          }
        }).catch(err => console.error('Error in toggleSaved backend sync:', err));
      },
      isSaved: (id) => get().savedJobIds.includes(id),
      syncToBackend: async () => {
        try {
          console.log('Syncing saved jobs to backend...');
          const token = await registerForPushNotificationsAsync();
          if (!token) return;
          const { savedJobIds } = get();
          await Promise.all(savedJobIds.map(id => subscribeToJobUpdates(id, token, 'saved')));
          console.log(`Successfully synced ${savedJobIds.length} saved jobs.`);
        } catch (error) {
          console.error('Failed to sync saved jobs:', error);
        }
      }
    }),
    { name: 'govt-jobs-bd-saved', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

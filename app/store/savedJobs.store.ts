import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SavedJobsState {
  savedJobIds: number[];
  toggleSaved: (id: number) => void;
  isSaved: (id: number) => boolean;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      toggleSaved: (id) => set((state) => ({
        savedJobIds: state.savedJobIds.includes(id)
          ? state.savedJobIds.filter((savedId) => savedId !== id)
          : [id, ...state.savedJobIds],
      })),
      isSaved: (id) => get().savedJobIds.includes(id),
    }),
    { name: 'govt-jobs-bd-saved', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

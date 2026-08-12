import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppliedJobsState {
  appliedJobIds: number[];
  markApplied: (id: number) => void;
  isApplied: (id: number) => boolean;
}

export const useAppliedJobsStore = create<AppliedJobsState>()(
  persist(
    (set, get) => ({
      appliedJobIds: [],
      markApplied: (id) => set((state) => ({
        // Only add if it doesn't exist to avoid duplicates
        appliedJobIds: state.appliedJobIds.includes(id)
          ? state.appliedJobIds
          : [id, ...state.appliedJobIds],
      })),
      isApplied: (id) => get().appliedJobIds.includes(id),
    }),
    { name: 'govt-jobs-bd-applied', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

import { create } from 'zustand';
import type { JobFilters } from '@/types/job';

interface JobFiltersState {
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  resetFilters: () => void;
}
export const useJobFiltersStore = create<JobFiltersState>((set) => ({
  filters: { sort: 'latest', deadlineRange: 'all', publishedRange: 'all' },
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: { sort: 'latest', deadlineRange: 'all', publishedRange: 'all' } }),
}));

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getCategoryCounts, getClosingSoonJobs, getHomeStats, getJobFacets, getJobs, getLatestJobs } from '@/services/jobs.service';
import type { JobFilters } from '@/types/job';

export function useJobs(filters: JobFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam }) => getJobs(pageParam, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export const useLatestJobs = () => useQuery({ queryKey: ['jobs', 'latest'], queryFn: () => getLatestJobs() });
export const useClosingSoonJobs = () => useQuery({ queryKey: ['jobs', 'closing-soon'], queryFn: () => getClosingSoonJobs() });
export const useHomeStats = () => useQuery({ queryKey: ['jobs', 'stats'], queryFn: getHomeStats });
export const useCategoryCounts = () => useQuery({ queryKey: ['jobs', 'category-counts'], queryFn: getCategoryCounts, staleTime: 5 * 60 * 1000 });
export const useJobFacets = () => useQuery({ queryKey: ['jobs', 'facets'], queryFn: getJobFacets, staleTime: 30 * 60 * 1000 });
export const useHomeSearch = (search: string) => useQuery({ queryKey: ['jobs', 'home-search', search], queryFn: () => getJobs(0, { search, sort: 'latest' }), enabled: search.trim().length >= 2 });

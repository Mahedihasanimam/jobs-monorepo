import { useQuery } from '@tanstack/react-query';
import { getJob, getJobsByIds } from '@/services/jobs.service';

export const useJob = (id: number) => useQuery({ queryKey: ['job', id], queryFn: () => getJob(id), enabled: Number.isFinite(id) });
export const useSavedJobs = (ids: number[]) => useQuery({ queryKey: ['jobs', 'saved', ids], queryFn: () => getJobsByIds(ids), enabled: ids.length > 0 });

import { useQuery } from '@tanstack/react-query';
import { getExamNotices } from '@/services/examNotices.service';
export const useExamNotices = () => useQuery({ queryKey: ['exam-notices'], queryFn: getExamNotices });

import type { Job } from '@/types/job';
import { formatJobDate } from './date';

export function getJobShareMessage(job: Job) {
  const deadline = formatJobDate(job.deadline);
  const link = job.circular_url || job.apply_url || job.source_url;
  return [
    `${job.organization} — ${job.title}`,
    deadline ? `আবেদনের শেষ তারিখ: ${deadline}` : null,
    '',
    'অফিসিয়াল বিজ্ঞপ্তি:',
    link,
    '',
    'সরকারি চাকরি থেকে শেয়ার করা হয়েছে',
  ].filter((line) => line !== null).join('\n');
}

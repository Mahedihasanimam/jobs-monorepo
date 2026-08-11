import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Job, JobFacets, JobFilters, JobsPage } from '@/types/job';
import { addDaysISO, todayISO } from '@/utils/date';

export const JOBS_PAGE_SIZE = 20;

export const JOB_CATEGORY_ALIASES: Record<string, string[]> = {
  ict: ['কম্পিউটার', 'আইসিটি', 'Computer', 'ICT', 'Data Entry'],
  bank: ['ব্যাংক', 'Bank'],
  railway: ['রেল', 'Railway'],
  defence: ['সেনা', 'নৌবাহিনী', 'বিমানবাহিনী', 'পুলিশ', 'Defence'],
  education: ['শিক্ষা', 'বিদ্যালয়', 'বিশ্ববিদ্যালয়', 'Education'],
  health: ['স্বাস্থ্য', 'মেডিকেল', 'হাসপাতাল', 'Health'],
  administration: ['প্রশাসন', 'Administration'],
  welfare: ['সমাজকল্যাণ', 'Social Welfare'],
  engineering: ['প্রকৌশলী', 'Engineer'],
  office: ['অফিস সহায়ক', 'Office Support'],
};

function categoryExpression(categoryKey: string) {
  return (JOB_CATEGORY_ALIASES[categoryKey] ?? [])
    .flatMap((term) => [`title.ilike.%${term}%`, `organization.ilike.%${term}%`])
    .join(',');
}

function sanitizeSearch(value: string) {
  return value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
}

export async function getJobs(page = 0, filters: JobFilters = {}): Promise<JobsPage> {
  assertSupabaseConfigured();
  const from = page * JOBS_PAGE_SIZE;
  let query = supabase.from('jobs').select('*', { count: 'exact' }).eq('is_active', true);
  const today = todayISO();
  query = query.or(`deadline.is.null,deadline.gte.${today}`);

  const search = filters.search ? sanitizeSearch(filters.search) : '';
  if (search) {
    const terms = search.split(' ').filter((term) => !/^(jobs?|চাকরি|for|in)$/i.test(term)).slice(0, 4);
    for (const term of terms.length ? terms : [search]) {
      query = query.or(`title.ilike.%${term}%,organization.ilike.%${term}%,category.ilike.%${term}%,location.ilike.%${term}%,education.ilike.%${term}%,age_requirement.ilike.%${term}%,experience.ilike.%${term}%,eligible_applicants.ilike.%${term}%,salary.ilike.%${term}%`);
    }
  }
  if (filters.organization) query = query.eq('organization', filters.organization);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.categoryKey) {
    const expression = categoryExpression(filters.categoryKey);
    if (expression) query = query.or(expression);
  }
  if (filters.location) query = query.eq('location', filters.location);
  if (filters.employmentType) query = query.eq('employment_type', filters.employmentType);
  if (filters.qualification === 'diploma') query = query.contains('qualification_tags', ['diploma']);
  if (filters.education) query = query.ilike('education', `%${sanitizeSearch(filters.education)}%`);
  if (filters.subject) {
    const subject = sanitizeSearch(filters.subject);
    query = query.or(`subject.ilike.%${subject}%,education.ilike.%${subject}%`);
  }
  if (filters.age) query = query.ilike('age_requirement', `%${sanitizeSearch(filters.age)}%`);
  if (filters.salary) query = query.ilike('salary', `%${sanitizeSearch(filters.salary)}%`);
  if (filters.experience) query = query.ilike('experience', `%${sanitizeSearch(filters.experience)}%`);
  if (filters.gender) query = query.ilike('gender_requirement', `%${sanitizeSearch(filters.gender)}%`);
  if (filters.womenEligible) query = query.or('gender_requirement.ilike.%নারী%,gender_requirement.ilike.%মহিলা%');
  if (filters.highSalary) query = query.not('salary', 'is', null);
  if (filters.freshersAllowed) query = query.eq('freshers_allowed', true);
  if (filters.minimumVacancies) query = query.gte('vacancies', filters.minimumVacancies);
  if (filters.applicationFee) query = query.ilike('application_fee', `%${sanitizeSearch(filters.applicationFee)}%`);
  if (filters.deadlineRange !== undefined && filters.deadlineRange !== 'all') {
    query = query.not('deadline', 'is', null).gte('deadline', today).lte('deadline', addDaysISO(filters.deadlineRange));
  }
  if (filters.publishedRange !== undefined && filters.publishedRange !== 'all') {
    query = query.gte('published_date', addDaysISO(-filters.publishedRange));
  }

  if (filters.sort === 'deadline') query = query.order('deadline', { ascending: true, nullsFirst: false });
  else if (filters.sort === 'oldest') query = query.order('published_date', { ascending: true, nullsFirst: false });
  else query = query.order('published_date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });

  const { data, error, count } = await query.range(from, from + JOBS_PAGE_SIZE - 1);
  if (error) throw error;
  const jobs = data ?? [];
  return { jobs, count: count ?? jobs.length, nextPage: jobs.length === JOBS_PAGE_SIZE ? page + 1 : null };
}

export async function getLatestJobs(limit = 6) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('jobs').select('*').eq('is_active', true)
    .or(`deadline.is.null,deadline.gte.${todayISO()}`).order('published_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getClosingSoonJobs(limit = 6) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('jobs').select('*').eq('is_active', true).not('deadline', 'is', null)
    .gte('deadline', todayISO()).lte('deadline', addDaysISO(7)).order('deadline', { ascending: true }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getJob(id: number) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getJobsByIds(ids: number[]) {
  if (!ids.length) return [];
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('jobs').select('*').in('id', ids);
  if (error) throw error;
  const order = new Map(ids.map((id, index) => [id, index]));
  return (data ?? []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getJobFacets(): Promise<JobFacets> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('jobs').select('organization,category,location,employment_type').eq('is_active', true).limit(1000);
  if (error) throw error;
  const unique = (key: 'organization' | 'category' | 'location' | 'employment_type') =>
    [...new Set((data ?? []).map((row) => row[key]).filter((value): value is string => Boolean(value?.trim())))].sort((a, b) => a.localeCompare(b));
  return { organizations: unique('organization'), categories: unique('category'), locations: unique('location'), employmentTypes: unique('employment_type') };
}

export async function getHomeStats() {
  assertSupabaseConfigured();
  const today = todayISO();
  const weekAgo = addDaysISO(-7);
  const weekAhead = addDaysISO(7);
  const [active, recent, closing] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).or(`deadline.is.null,deadline.gte.${today}`),
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).gte('published_date', weekAgo),
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true).gte('deadline', today).lte('deadline', weekAhead),
  ]);
  const error = active.error || recent.error || closing.error;
  if (error) throw error;
  return { active: active.count ?? 0, recent: recent.count ?? 0, closing: closing.count ?? 0 };
}

export async function getCategoryCounts() {
  assertSupabaseConfigured();
  const today = todayISO();
  const entries = await Promise.all(Object.keys(JOB_CATEGORY_ALIASES).map(async (categoryKey) => {
    const { count, error } = await supabase.from('jobs').select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .or(`deadline.is.null,deadline.gte.${today}`)
      .or(categoryExpression(categoryKey));
    if (error) throw error;
    return [categoryKey, count ?? 0] as const;
  }));
  return Object.fromEntries(entries) as Record<string, number>;
}

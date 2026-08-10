export interface Job {
  id: number;
  title: string;
  organization: string;
  organization_logo_url: string | null;
  is_government_source: boolean;
  category: string | null;
  published_date: string | null;
  deadline: string | null;
  vacancies: number | null;
  employment_type: string | null;
  education: string | null;
  experience: string | null;
  age_requirement: string | null;
  eligibility_summary: string | null;
  eligible_applicants: string | null;
  qualification_tags: string[];
  location: string | null;
  salary: string | null;
  description: string | null;
  source: string;
  source_url: string;
  apply_url: string | null;
  circular_url: string | null;
  external_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type JobSort = 'latest' | 'deadline' | 'oldest';
export type DeadlineRange = 'all' | 0 | 3 | 7 | 30;
export type PublishedRange = 'all' | 0 | 3 | 7 | 30;

export interface JobFilters {
  search?: string;
  organization?: string;
  category?: string;
  location?: string;
  employmentType?: string;
  qualification?: 'diploma';
  deadlineRange?: DeadlineRange;
  publishedRange?: PublishedRange;
  sort?: JobSort;
}

export interface JobsPage {
  jobs: Job[];
  count: number;
  nextPage: number | null;
}

export interface JobFacets {
  organizations: string[];
  categories: string[];
  locations: string[];
  employmentTypes: string[];
}

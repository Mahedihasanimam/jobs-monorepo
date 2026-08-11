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
  subject?: string | null;
  gender_requirement?: string | null;
  quota_requirement?: string | null;
  application_fee?: string | null;
  freshers_allowed?: boolean | null;
  circular_text?: string | null;
  circular_document_hash?: string | null;
  circular_extraction_method?: 'embedded_text' | 'hybrid' | 'ocr' | null;
  circular_processing_status?: 'processed' | 'failed' | 'not_recruitment' | null;
  requirement_confidence?: Record<string, number>;
  requirement_sources?: Record<string, { page: number; excerpt: string }>;
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
  categoryKey?: string;
  location?: string;
  employmentType?: string;
  qualification?: 'diploma';
  education?: string;
  subject?: string;
  age?: string;
  salary?: string;
  applicationFee?: string;
  experience?: string;
  gender?: string;
  freshersAllowed?: boolean;
  minimumVacancies?: number;
  womenEligible?: boolean;
  highSalary?: boolean;
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

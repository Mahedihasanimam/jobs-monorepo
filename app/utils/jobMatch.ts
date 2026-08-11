import type { Job } from '@/types/job';
import type { CandidateProfile } from '@/types/profile';
import { getDaysRemaining } from '@/utils/date';

export type MatchStatus = 'match' | 'review' | 'mismatch';
export interface JobMatch { percentage: number; label: 'খুব ভালো মিল' | 'ভালো মিল' | 'সম্ভাব্য মিল' | 'শর্ত যাচাই প্রয়োজন'; reasons: string[]; concerns: string[]; education: MatchStatus; experience: MatchStatus; age: MatchStatus; location: MatchStatus; nextStep: string; }
const norm = (value?: string | null) => (value ?? '').toLocaleLowerCase();
const ageFromDob = (dob: string) => { const date = new Date(dob); if (Number.isNaN(date.getTime())) return null; const now = new Date(); let age = now.getFullYear() - date.getFullYear(); if (now < new Date(now.getFullYear(), date.getMonth(), date.getDate())) age--; return age; };
const numbers = (value?: string | null) => (value?.match(/\d+/g) ?? []).map(Number);
const aliases: Record<string, string[]> = {
  'কম্পিউটার ও আইসিটি': ['কম্পিউটার', 'আইসিটি', 'ডাটা এন্ট্রি', 'প্রোগ্রামার', 'সফটওয়্যার', 'computer', 'ict', 'data entry'],
  'ব্যাংক': ['ব্যাংক', 'bank', 'ক্যাশিয়ার', 'cashier'], 'রেলওয়ে': ['রেল', 'railway'], 'প্রতিরক্ষা': ['সেনা', 'নৌ', 'বিমান', 'পুলিশ', 'defence'],
  'শিক্ষা': ['শিক্ষা', 'বিদ্যালয়', 'কলেজ', 'বিশ্ববিদ্যালয়', 'শিক্ষক', 'education'], 'স্বাস্থ্য': ['স্বাস্থ্য', 'মেডিকেল', 'হাসপাতাল', 'নার্স', 'health'],
  'প্রশাসন': ['প্রশাসন', 'অফিস সহকারী', 'office assistant'], 'ডিপ্লোমা': ['ডিপ্লোমা', 'diploma'], 'এসএসসি': ['এসএসসি', 'ssc'], 'এইচএসসি': ['এইচএসসি', 'hsc'],
};
const expanded = (values: string[]) => values.flatMap((value) => [value, ...(aliases[value] ?? [])]).map(norm).filter(Boolean);
const hasAny = (text: string, values: string[]) => values.some((value) => text.includes(value));

export function matchJob(job: Job, profile: CandidateProfile): JobMatch {
  let score = 0; const reasons: string[] = []; const concerns: string[] = [];
  const searchable = norm(`${job.title} ${job.organization} ${job.category} ${job.education} ${job.subject}`);
  const educationTerms = expanded([profile.educationLevel, profile.degree, profile.subject]);
  const interestTerms = expanded(profile.jobCategories);

  let education: MatchStatus = 'review';
  if (job.education || job.qualification_tags?.length) {
    if (hasAny(norm(`${job.education} ${job.subject} ${(job.qualification_tags ?? []).join(' ')}`), educationTerms)) { score += 30; education = 'match'; reasons.push('আপনার শিক্ষা বা বিষয় পদের যোগ্যতার সঙ্গে মিলেছে।'); }
    else { score += 8; concerns.push('ডিগ্রি বা বিষয়ের সঠিক মিল নিশ্চিত নয়।'); }
  } else { score += 14; concerns.push('শিক্ষাগত যোগ্যতার বিস্তারিত এখনও সংগ্রহ করা হয়নি।'); }

  let age: MatchStatus = 'review'; const userAge = ageFromDob(profile.dateOfBirth);
  if (job.age_requirement && userAge !== null) { const limits = numbers(job.age_requirement).filter((n) => n < 100); const min = limits.length > 1 ? Math.min(...limits) : 0; const max = limits.length ? Math.max(...limits) : undefined; if (max !== undefined && userAge >= min && userAge <= max) { score += 20; age = 'match'; reasons.push('আপনার বয়স উল্লেখিত সীমার মধ্যে।'); } else if (max !== undefined) { age = 'mismatch'; concerns.push('আপনার বয়স উল্লেখিত সীমার বাইরে হতে পারে।'); } else score += 8; } else score += 9;

  let experience: MatchStatus = 'review'; const owned = Number(profile.experienceYears);
  if (job.experience) { const required = numbers(job.experience)[0]; if (/fresh|no experience|অভিজ্ঞতা প্রয়োজন নেই|অনভিজ্ঞ/i.test(job.experience) || (Number.isFinite(owned) && required !== undefined && owned >= required)) { score += 15; experience = 'match'; reasons.push('আপনার অভিজ্ঞতা উল্লেখিত শর্ত পূরণ করে।'); } else if (required !== undefined) { experience = 'mismatch'; concerns.push('অভিজ্ঞতার শর্তটি আপনার তথ্যের সঙ্গে নাও মিলতে পারে।'); } else score += 6; } else score += 7;

  let location: MatchStatus = 'review'; const locations = expanded([...profile.preferredLocations, profile.currentDistrict, profile.permanentDistrict]);
  if (job.location && locations.length) { if (hasAny(norm(job.location), locations) || /সারা বাংলাদেশ|যেকোনো স্থান/i.test(job.location)) { score += 10; location = 'match'; reasons.push('কর্মস্থল আপনার পছন্দের এলাকার মধ্যে।'); } else { location = 'mismatch'; concerns.push('কর্মস্থল আপনার পছন্দের এলাকার বাইরে।'); } } else score += 5;

  if (interestTerms.length && hasAny(searchable, interestTerms)) { score += 20; reasons.push('পদটি আপনার পছন্দের চাকরির বিভাগের অন্তর্ভুক্ত।'); }
  else if (educationTerms.length && hasAny(searchable, educationTerms)) { score += 15; reasons.push('পদের কাজ আপনার বিষয় বা দক্ষতার সঙ্গে সম্পর্কিত।'); }
  else { score += 4; concerns.push('পদটি আপনার বাছাই করা চাকরির বিভাগের সঙ্গে সরাসরি মেলেনি।'); }

  score += job.is_government_source ? 5 : 2;
  const gender = profile.gender === 'male' ? ['পুরুষ', 'male'] : profile.gender === 'female' ? ['নারী', 'মহিলা', 'female'] : [];
  if (job.gender_requirement && gender.length && !hasAny(norm(job.gender_requirement), gender) && !/নারী ও পুরুষ|উভয়|সকল|both/i.test(job.gender_requirement)) { score -= 12; concerns.push('লিঙ্গভিত্তিক যোগ্যতার শর্তটি আপনার সঙ্গে নাও মিলতে পারে।'); }
  if (job.quota_requirement && profile.quota && norm(job.quota_requirement).includes(norm(profile.quota))) { score += 4; reasons.push('আপনার কোটার তথ্য এই বিজ্ঞপ্তিতে প্রাসঙ্গিক।'); }

  const percentage = Math.max(0, Math.min(100, Math.round(score)));
  const label = percentage >= 80 ? 'খুব ভালো মিল' : percentage >= 65 ? 'ভালো মিল' : percentage >= 45 ? 'সম্ভাব্য মিল' : 'শর্ত যাচাই প্রয়োজন';
  const days = getDaysRemaining(job.deadline);
  const nextStep = [education, experience, age].includes('mismatch') ? 'আবেদনের আগে অফিসিয়াল বিজ্ঞপ্তির শর্তগুলো মিলিয়ে নিন।' : days !== null && days <= 7 ? `দ্রুত আবেদন করুন—আর ${Math.max(days, 0)} দিন বাকি।` : 'বিজ্ঞপ্তি খুলে প্রয়োজনীয় কাগজপত্র প্রস্তুত করে আবেদন করুন।';
  return { percentage, label, reasons, concerns, education, experience, age, location, nextStep };
}

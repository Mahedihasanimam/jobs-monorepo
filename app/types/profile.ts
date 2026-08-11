export type Gender = 'male' | 'female' | 'other';

export interface CandidateProfile {
  dateOfBirth: string;
  gender: Gender | '';
  educationLevel: string;
  degree: string;
  subject: string;
  graduationYear: string;
  result: string;
  experienceYears: string;
  currentDistrict: string;
  permanentDistrict: string;
  preferredLocations: string[];
  jobCategories: string[];
  governmentPreferences: string[];
  quota: string;
}

export const EMPTY_PROFILE: CandidateProfile = {
  dateOfBirth: '', gender: '', educationLevel: '', degree: '', subject: '', graduationYear: '', result: '',
  experienceYears: '', currentDistrict: '', permanentDistrict: '', preferredLocations: [], jobCategories: [], governmentPreferences: [], quota: '',
};

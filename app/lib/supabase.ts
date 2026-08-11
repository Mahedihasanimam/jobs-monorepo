import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Job } from '@/types/job';
import type { ExamNotice } from '@/types/examNotice';

type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job & Record<string, unknown>;
        Insert: Partial<Job> & Pick<Job, 'title' | 'organization' | 'source' | 'source_url'> & Record<string, unknown>;
        Update: Partial<Job> & Record<string, unknown>;
        Relationships: [];
      };
      exam_notices: { Row: ExamNotice & Record<string, unknown>; Insert: Partial<ExamNotice> & Pick<ExamNotice, 'title' | 'organization' | 'source' | 'source_url' | 'notice_type'> & Record<string, unknown>; Update: Partial<ExamNotice> & Record<string, unknown>; Relationships: []; };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);
const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

// A harmless local URL keeps the bundle bootable so the UI can show a friendly
// configuration state instead of crashing before React mounts.
export const supabase = createClient<Database>(
  url ?? 'http://127.0.0.1:54321',
  anonKey ?? 'missing-anon-key',
  {
    auth: {
      storage: isWebServer ? undefined : AsyncStorage,
      autoRefreshToken: !isWebServer,
      persistSession: !isWebServer,
      detectSessionInUrl: false,
    },
  },
);

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) throw new Error('SUPABASE_NOT_CONFIGURED');
}

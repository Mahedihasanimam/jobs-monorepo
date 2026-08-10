import { bn } from './bn';
import { en } from './en';

export const translations = { bn, en } as const;
export type Locale = keyof typeof translations;
export const t = translations.bn;

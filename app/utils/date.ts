const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => bnDigits[Number(digit)] ?? digit);

function parseDate(value?: string | null) {
  if (!value) return null;
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatJobDate(value?: string | null, locale: 'bn' | 'en' = 'bn') {
  const date = parseDate(value);
  if (!date) return null;
  if (locale === 'en') return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return `${toBanglaDigits(date.getDate())} ${banglaMonths[date.getMonth()]} ${toBanglaDigits(date.getFullYear())}`;
}

export function getDaysRemaining(value?: string | null) {
  const deadline = parseDate(value);
  if (!deadline) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
}

export const isExpired = (deadline?: string | null) => {
  const days = getDaysRemaining(deadline);
  return days !== null && days < 0;
};

export const isClosingSoon = (deadline?: string | null, withinDays = 7) => {
  const days = getDaysRemaining(deadline);
  return days !== null && days >= 0 && days <= withinDays;
};

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

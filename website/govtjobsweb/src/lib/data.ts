import { isSupabaseConfigured, supabase } from "./supabase";
import { todayISO, addDaysISO } from "./utils";
import type {
  Category,
  EducationLevel,
  EmploymentType,
  ExamNotice,
  Job,
} from "./types";

const CATEGORY_META: Record<string, Omit<Category, "slug">> = {
  railway: {
    name: "রেলওয়ে",
    nameEn: "Railway",
    icon: "rail",
    description:
      "বাংলাদেশ রেলওয়ে নিয়মিত বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ করে থাকে — স্টেশন মাস্টার, টিকিট চেকার, গার্ড, কারিগরি ও সহায়ক পদসহ বিভিন্ন ক্যাটাগরিতে।",
  },
  education: {
    name: "শিক্ষা মন্ত্রণালয়",
    nameEn: "Education",
    icon: "book",
    description:
      "শিক্ষা মন্ত্রণালয়ের অধীন বিভিন্ন দপ্তর, স্কুল-কলেজ ও শিক্ষা বোর্ডের নিয়োগ বিজ্ঞপ্তি এখানে প্রকাশ করা হয়।",
  },
  bank: {
    name: "ব্যাংক",
    nameEn: "Bank",
    icon: "bank",
    description:
      "সরকারি ও আধা-সরকারি ব্যাংকের নিয়োগ বিজ্ঞপ্তি — অফিসার, সিনিয়র অফিসার, ক্যাশ অফিসার ও ট্রেইনি পদের বিস্তারিত তথ্য।",
  },
  health: {
    name: "স্বাস্থ্য অধিদপ্তর",
    nameEn: "Health",
    icon: "health",
    description:
      "স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়ের অধীন হাসপাতাল এবং অধিদপ্তরের নিয়োগ বিজ্ঞপ্তি — মেডিকেল অফিসার, নার্স ও সহায়ক পদের সব খবর।",
  },
  defence: {
    name: "প্রতিরক্ষা",
    nameEn: "Defence",
    icon: "shield",
    description:
      "সেনাবাহিনী, নৌবাহিনী, বিমান বাহিনী ও প্রতিরক্ষা মন্ত্রণালয়ের বেসামরিক পদে নিয়োগ বিজ্ঞপ্তি।",
  },
  women: {
    name: "নারী কোটা",
    nameEn: "Women",
    icon: "women",
    description:
      "নারী প্রার্থীদের জন্য সংরক্ষিত কোটা ও বিশেষভাবে নারীদের জন্য উন্মুক্ত পদের নিয়োগ বিজ্ঞপ্তি।",
  },
  freshers: {
    name: "ফ্রেশার্স",
    nameEn: "Freshers",
    icon: "fresh",
    description:
      "অভিজ্ঞতা ছাড়াই আবেদনযোগ্য পদের তালিকা — নতুন গ্র্যাজুয়েট ও প্রথমবার চাকরিপ্রার্থীদের জন্য সুযোগ।",
  },
  diploma: {
    name: "ডিপ্লোমা",
    nameEn: "Diploma",
    icon: "diploma",
    description:
      "ডিপ্লোমা ইঞ্জিনিয়ারিং ও কারিগরি শিক্ষাগত যোগ্যতাভিত্তিক নিয়োগ বিজ্ঞপ্তি।",
  },
  ssc: {
    name: "এসএসসি পাস",
    nameEn: "SSC",
    icon: "cert",
    description: "সর্বনিম্ন যোগ্যতা এসএসসি পাস চাওয়া নিয়োগ বিজ্ঞপ্তিসমূহ।",
  },
  hsc: {
    name: "এইচএসসি পাস",
    nameEn: "HSC",
    icon: "cert",
    description: "সর্বনিম্ন যোগ্যতা এইচএসসি পাস চাওয়া পদের নিয়োগ বিজ্ঞপ্তি।",
  },
  graduate: {
    name: "স্নাতক পাস",
    nameEn: "Graduate",
    icon: "grad",
    description: "স্নাতক ডিগ্রিধারীদের জন্য উপযুক্ত পদের নিয়োগ বিজ্ঞপ্তি।",
  },
  ict: {
    name: "তথ্য প্রযুক্তি",
    nameEn: "ICT",
    icon: "ict",
    description:
      "তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ এবং বিভিন্ন দপ্তরের আইটি সংশ্লিষ্ট পদের নিয়োগ বিজ্ঞপ্তি।",
  },
  general: {
    name: "সাধারণ",
    nameEn: "General",
    icon: "general",
    description: "সাধারণ সরকারি কর্মসংস্থানের সর্বশেষ বিজ্ঞপ্তি এবং তথ্য।",
  },
};

const FALLBACK_CATEGORIES: Category[] = Object.entries(CATEGORY_META).map(
  ([slug, meta]) => ({ slug, ...meta }),
);

const FALLBACK_JOBS: Job[] = [
  {
    slug: "bangladesh-railway-station-master-2026",
    title: "সহকারী স্টেশন মাস্টার",
    titleEn: "Assistant Station Master",
    organization: "বাংলাদেশ রেলওয়ে",
    categorySlug: "railway",
    location: "সারাদেশ",
    educationLevel: "স্নাতক",
    employmentType: "স্থায়ী",
    vacancies: 182,
    circularNo: "রেলওয়ে/নিয়োগ/২০২৬/০৭",
    publishDate: "2026-07-12",
    deadline: "2026-08-25",
    applyMethod: "অনলাইন আবেদন (teletalk.com.bd)",
    sourceUrl: "https://railway.gov.bd",
    sourceName: "railway.gov.bd",
    summary:
      "বাংলাদেশ রেলওয়ে অপারেটিং ক্যাডারের অধীনে সহকারী স্টেশন মাস্টার পদে সারাদেশে শূন্য পদে নিয়োগের লক্ষ্যে বিজ্ঞপ্তি প্রকাশ করেছে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "১১,০০০ - ২৬,৫৯০ টাকা",
    applicationFee: "২২৩ টাকা",
  },
  {
    slug: "bangladesh-bank-officer-cash-2026",
    title: "অফিসার (ক্যাশ)",
    titleEn: "Officer (Cash)",
    organization: "বাংলাদেশ ব্যাংক",
    categorySlug: "bank",
    location: "ঢাকা",
    educationLevel: "স্নাতক",
    employmentType: "স্থায়ী",
    vacancies: 96,
    circularNo: "বিবি/এইচআর/২০২৬/১১৪",
    publishDate: "2026-08-01",
    deadline: "2026-08-20",
    applyMethod: "অনলাইন আবেদন (bb.org.bd)",
    sourceUrl: "https://bb.org.bd",
    sourceName: "bb.org.bd",
    summary:
      "বাংলাদেশ ব্যাংকে অফিসার (ক্যাশ) পদে নিয়োগের জন্য যোগ্য প্রার্থীদের কাছ থেকে অনলাইনে আবেদন আহ্বান করা হয়েছে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "৩৫,৫০০ - ৬৭,০১০ টাকা",
    applicationFee: "২০০ টাকা",
  },
  {
    slug: "primary-education-assistant-teacher-2026",
    title: "সহকারী শিক্ষক",
    titleEn: "Assistant Teacher",
    organization: "প্রাথমিক শিক্ষা অধিদপ্তর",
    categorySlug: "education",
    location: "সারাদেশ",
    educationLevel: "স্নাতক",
    employmentType: "স্থায়ী",
    vacancies: 6000,
    circularNo: "ডিপিই/নিয়োগ/২০২৬/৯",
    publishDate: "2026-07-05",
    deadline: "2026-09-02",
    applyMethod: "অনলাইন আবেদন (dpe.teletalk.com.bd)",
    sourceUrl: "https://dpe.gov.bd",
    sourceName: "dpe.gov.bd",
    summary:
      "সরকারি প্রাথমিক বিদ্যালয়ে সহকারী শিক্ষক পদে দেশব্যাপী নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে প্রাথমিক শিক্ষা অধিদপ্তর।",
    ageLimit: "১৮-৩৫ বছর",
    salaryRange: "১২,৫০০ - ৩০,২৩০ টাকা",
    applicationFee: "১১০ টাকা",
  },
  {
    slug: "directorate-health-nurse-2026",
    title: "সিনিয়র স্টাফ নার্স",
    titleEn: "Senior Staff Nurse",
    organization: "স্বাস্থ্য অধিদপ্তর",
    categorySlug: "health",
    location: "সারাদেশ",
    educationLevel: "ডিপ্লোমা",
    employmentType: "স্থায়ী",
    vacancies: 3040,
    circularNo: "স্বাঃঅধিঃ/নিয়োগ/২০২৬/৫৫",
    publishDate: "2026-06-20",
    deadline: "2026-08-18",
    applyMethod: "অনলাইন আবেদন (dghs.gov.bd)",
    sourceUrl: "https://dghs.gov.bd",
    sourceName: "dghs.gov.bd",
    summary:
      "স্বাস্থ্য অধিদপ্তরের অধীন হাসপাতালে সিনিয়র স্টাফ নার্স পদে বিপুল সংখ্যক নিয়োগের বিজ্ঞপ্তি প্রকাশিত হয়েছে।",
    ageLimit: "১৮-৩২ বছর",
    salaryRange: "১৬,০০০ - ৩৮,৬৪০ টাকা",
    applicationFee: "১১২ টাকা",
  },
  {
    slug: "bangladesh-army-civilian-clerk-2026",
    title: "সিভিল পদে করণিক",
    titleEn: "Civilian Clerk",
    organization: "বাংলাদেশ সেনাবাহিনী",
    categorySlug: "defence",
    location: "ঢাকা সেনানিবাস",
    educationLevel: "এইচএসসি",
    employmentType: "স্থায়ী",
    vacancies: 45,
    circularNo: "সেনা/সিভিল/২০২৬/২২",
    publishDate: "2026-07-28",
    deadline: "2026-08-16",
    applyMethod: "সরাসরি আবেদন (ডাকযোগে)",
    sourceUrl: "https://army.mil.bd",
    sourceName: "army.mil.bd",
    summary:
      "বাংলাদেশ সেনাবাহিনীর অধীন সিভিল পদে করণিক নিয়োগের জন্য বিজ্ঞপ্তি প্রকাশ করা হয়েছে।",
    ageLimit: "১৮-২৮ বছর",
    salaryRange: "৯,৭০০ - ২৩,৪৯০ টাকা",
    applicationFee: "১০০ টাকা",
  },
  {
    slug: "women-affairs-field-officer-2026",
    title: "মহিলা বিষয়ক কর্মকর্তা",
    titleEn: "Women Affairs Officer",
    organization: "মহিলা ও শিশু বিষয়ক মন্ত্রণালয়",
    categorySlug: "women",
    location: "সারাদেশ",
    educationLevel: "স্নাতকোত্তর",
    employmentType: "স্থায়ী",
    vacancies: 64,
    circularNo: "মশিমন/নিয়োগ/২০২৬/১৮",
    publishDate: "2026-07-18",
    deadline: "2026-08-30",
    applyMethod: "অনলাইন আবেদন (mowca.gov.bd)",
    sourceUrl: "https://mowca.gov.bd",
    sourceName: "mowca.gov.bd",
    summary:
      "মহিলা ও শিশু বিষয়ক মন্ত্রণালয়ের অধীন উপজেলা পর্যায়ে মহিলা বিষয়ক কর্মকর্তা পদে নিয়োগ দেওয়া হবে।",
    ageLimit: "২১-৩০ বছর",
    salaryRange: "২২,০০০ - ৫৩,০৬০ টাকা",
    applicationFee: "২০০ টাকা",
  },
  {
    slug: "roads-highways-sub-assistant-engineer-2026",
    title: "উপ-সহকারী প্রকৌশলী (সিভিল)",
    titleEn: "Sub-Assistant Engineer (Civil)",
    organization: "সড়ক ও জনপথ অধিদপ্তর",
    categorySlug: "diploma",
    location: "সারাদেশ",
    educationLevel: "ডিপ্লোমা",
    employmentType: "স্থায়ী",
    vacancies: 210,
    circularNo: "সওজ/নিয়োগ/২০২৬/৩৩",
    publishDate: "2026-07-22",
    deadline: "2026-08-19",
    applyMethod: "অনলাইন আবেদন (rhd.gov.bd)",
    sourceUrl: "https://rhd.gov.bd",
    sourceName: "rhd.gov.bd",
    summary:
      "সড়ক ও জনপথ অধিদপ্তরে উপ-সহকারী প্রকৌশলী (সিভিল) পদে দেশব্যাপী নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "১৬,০০০ - ৩৮,৬৪০ টাকা",
    applicationFee: "১৫০ টাকা",
  },
  {
    slug: "office-assistant-cum-computer-operator-2026",
    title: "অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক",
    titleEn: "Office Assistant cum Computer Operator",
    organization: "স্থানীয় সরকার বিভাগ",
    categorySlug: "hsc",
    location: "সারাদেশ",
    educationLevel: "এইচএসসি",
    employmentType: "স্থায়ী",
    vacancies: 320,
    circularNo: "এলজিডি/নিয়োগ/২০২৬/৪৭",
    publishDate: "2026-08-04",
    deadline: "2026-08-28",
    applyMethod: "অনলাইন আবেদন (lgd.teletalk.com.bd)",
    sourceUrl: "https://lgd.gov.bd",
    sourceName: "lgd.gov.bd",
    summary:
      "স্থানীয় সরকার বিভাগের অধীন বিভিন্ন দপ্তরে অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক পদে নিয়োগ দেওয়া হবে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "১০,২০০ - ২৪,৬৮০ টাকা",
    applicationFee: "১১২ টাকা",
  },
  {
    slug: "ict-division-programmer-2026",
    title: "প্রোগ্রামার",
    titleEn: "Programmer",
    organization: "তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ",
    categorySlug: "ict",
    location: "ঢাকা",
    educationLevel: "স্নাতক",
    employmentType: "স্থায়ী",
    vacancies: 22,
    circularNo: "আইসিটি/নিয়োগ/২০২৬/১২",
    publishDate: "2026-07-30",
    deadline: "2026-08-24",
    applyMethod: "অনলাইন আবেদন (ictd.gov.bd)",
    sourceUrl: "https://ictd.gov.bd",
    sourceName: "ictd.gov.bd",
    summary:
      "তথ্য ও যোগাযোগ প্রযুক্তি বিভাগে প্রোগ্রামার পদে নিয়োগের জন্য কম্পিউটার সায়েন্স বা সংশ্লিষ্ট বিষয়ে স্নাতক ডিগ্রিধারী প্রার্থীদের কাছ থেকে আবেদন আহ্বান করা হয়েছে।",
    ageLimit: "১৮-৩২ বছর",
    salaryRange: "২২,০০০ - ৫৩,০৬০ টাকা",
    applicationFee: "২০০ টাকা",
  },
  {
    slug: "postal-department-mail-guard-2026",
    title: "মেইল গার্ড",
    titleEn: "Mail Guard",
    organization: "বাংলাদেশ ডাক অধিদপ্তর",
    categorySlug: "ssc",
    location: "সারাদেশ",
    educationLevel: "এসএসসি",
    employmentType: "স্থায়ী",
    vacancies: 150,
    circularNo: "ডাক/নিয়োগ/২০২৬/৬",
    publishDate: "2026-06-28",
    deadline: "2026-08-15",
    applyMethod: "অনলাইন আবেদন (bdpost.teletalk.com.bd)",
    sourceUrl: "https://bangladeshpost.gov.bd",
    sourceName: "bangladeshpost.gov.bd",
    summary:
      "বাংলাদেশ ডাক অধিদপ্তরে মেইল গার্ড পদে সারাদেশে শূন্য পদে নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "৯,০০০ - ২১,৮০০ টাকা",
    applicationFee: "১০০ টাকা",
  },
  {
    slug: "food-directorate-store-keeper-2026",
    title: "স্টোর কিপার",
    titleEn: "Store Keeper",
    organization: "খাদ্য অধিদপ্তর",
    categorySlug: "graduate",
    location: "সারাদেশ",
    educationLevel: "স্নাতক",
    employmentType: "স্থায়ী",
    vacancies: 58,
    circularNo: "খাদ্য/নিয়োগ/২০২৬/১৯",
    publishDate: "2026-07-15",
    deadline: "2026-08-22",
    applyMethod: "অনলাইন আবেদন (dgfood.gov.bd)",
    sourceUrl: "https://dgfood.gov.bd",
    sourceName: "dgfood.gov.bd",
    summary:
      "খাদ্য অধিদপ্তরের অধীন বিভিন্ন খাদ্য গুদামে স্টোর কিপার পদে নিয়োগ দেওয়া হবে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "১১,০০০ - ২৬,৫৯০ টাকা",
    applicationFee: "১১২ টাকা",
  },
  {
    slug: "fresher-trainee-assistant-2026",
    title: "ট্রেইনি অ্যাসিস্ট্যান্ট (প্রশিক্ষণার্থী)",
    titleEn: "Trainee Assistant",
    organization: "জনতা ব্যাংক পিএলসি",
    categorySlug: "freshers",
    location: "সারাদেশ",
    educationLevel: "স্নাতক",
    employmentType: "প্রশিক্ষণার্থী",
    vacancies: 400,
    circularNo: "জেবি/নিয়োগ/২০২৬/৭৭",
    publishDate: "2026-08-06",
    deadline: "2026-08-27",
    applyMethod: "অনলাইন আবেদন (জনতা ব্যাংক ওয়েবসাইট)",
    sourceUrl: "https://jb.com.bd",
    sourceName: "jb.com.bd",
    summary:
      "নতুন গ্র্যাজুয়েটদের জন্য জনতা ব্যাংক পিএলসি ট্রেইনি অ্যাসিস্ট্যান্ট পদে বিপুল সংখ্যক নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে।",
    ageLimit: "১৮-৩০ বছর",
    salaryRange: "প্রশিক্ষণকালীন মাসিক ভাতা ২৩,০০০ টাকা",
    applicationFee: "২০০ টাকা",
  },
];

const FALLBACK_EXAM_NOTICES: ExamNotice[] = [
  {
    slug: "railway-assistant-station-master-admit-card-2026",
    title: "সহকারী স্টেশন মাস্টার পদের প্রবেশপত্র প্রকাশ",
    organization: "বাংলাদেশ রেলওয়ে",
    type: "admit-card",
    publishDate: "2026-08-10",
    relatedJobSlug: "bangladesh-railway-station-master-2026",
    summary:
      "সহকারী স্টেশন মাস্টার পদের লিখিত পরীক্ষার প্রবেশপত্র টেলিটকের ওয়েবসাইট থেকে ডাউনলোড করা যাচ্ছে।",
    sourceUrl: "https://railway.teletalk.com.bd",
  },
  {
    slug: "primary-teacher-written-result-2026",
    title: "সহকারী শিক্ষক পদের লিখিত পরীক্ষার ফলাফল প্রকাশ",
    organization: "প্রাথমিক শিক্ষা অধিদপ্তর",
    type: "result",
    publishDate: "2026-08-09",
    relatedJobSlug: "primary-education-assistant-teacher-2026",
    summary: "সহকারী শিক্ষক পদের লিখিত পরীক্ষার ফলাফল প্রকাশ করা হয়েছে।",
    sourceUrl: "https://dpe.teletalk.com.bd",
  },
  {
    slug: "bangladesh-bank-officer-exam-schedule-2026",
    title: "অফিসার (ক্যাশ) পদের লিখিত পরীক্ষার সময়সূচি প্রকাশ",
    organization: "বাংলাদেশ ব্যাংক",
    type: "schedule",
    publishDate: "2026-08-08",
    relatedJobSlug: "bangladesh-bank-officer-cash-2026",
    summary:
      "অফিসার (ক্যাশ) পদের লিখিত পরীক্ষা আগামী সেপ্টেম্বরের প্রথম সপ্তাহে অনুষ্ঠিত হবে।",
    sourceUrl: "https://bb.org.bd",
  },
];

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-+|-+$/g, "") || "job"
  );
}

function normalizeEducation(value: string | null | undefined): EducationLevel {
  const input = (value ?? "").toLowerCase();
  if (input.includes("এসএসসি") || input.includes("ssc")) return "এসএসসি";
  if (input.includes("এইচএসসি") || input.includes("hsc")) return "এইচএসসি";
  if (input.includes("ডিপ্লোমা") || input.includes("diploma"))
    return "ডিপ্লোমা";
  if (
    input.includes("স্নাতকোত্তর") ||
    input.includes("masters") ||
    input.includes("master")
  )
    return "স্নাতকোত্তর";
  return "স্নাতক";
}

function normalizeEmployment(value: string | null | undefined): EmploymentType {
  const input = (value ?? "").toLowerCase();
  if (input.includes("contract") || input.includes("চুক্তি"))
    return "চুক্তিভিত্তিক";
  if (input.includes("temporary") || input.includes("অস্থায়ী"))
    return "অস্থায়ী";
  if (input.includes("trainee") || input.includes("প্রশিক্ষণ"))
    return "প্রশিক্ষণার্থী";
  return "স্থায়ী";
}

function inferCategorySlug(value: string | null | undefined): string {
  const target = (value ?? "").toLowerCase();
  if (/(রেল|rail|railway)/.test(target)) return "railway";
  if (/(ব্যাংক|bank)/.test(target)) return "bank";
  if (/(শিক্ষা|education|school|college|teacher)/.test(target))
    return "education";
  if (/(স্বাস্থ্য|health|hospital|nurse|medical)/.test(target)) return "health";
  if (/(সেনা|defence|defense|army|police|বিমান|নৌ)/.test(target))
    return "defence";
  if (/(নারী|মহিলা|women|women affairs)/.test(target)) return "women";
  if (/(fresh|ফ্রেশ|trainee|graduate)/.test(target)) return "freshers";
  if (/(ডিপ্লোমা|diploma|engineer|engineering)/.test(target)) return "diploma";
  if (/(ইসিটি|ict|it|software|programmer|computer)/.test(target)) return "ict";
  if (/(এসএসসি|ssc)/.test(target)) return "ssc";
  if (/(এইচএসসি|hsc|higher secondary)/.test(target)) return "hsc";
  if (/(স্নাতক|graduate|bachelor)/.test(target)) return "graduate";
  return "general";
}

function toDisplayUrl(value: string | null | undefined): string {
  if (!value) return "https://governmentjobs.gov.bd";
  try {
    return new URL(value).toString();
  } catch {
    return `https://${String(value).replace(/^https?:\/\//, "")}`;
  }
}

function toSourceName(value: string | null | undefined): string {
  const direct = value ?? "governmentjobs.gov.bd";
  try {
    return new URL(direct).hostname.replace(/^www\./, "");
  } catch {
    return direct.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function normalizeNoticeType(
  value: string | null | undefined,
): ExamNotice["type"] {
  const input = (value ?? "").toLowerCase();
  if (
    input.includes("admit") ||
    input.includes("admit_card") ||
    input.includes("প্রবেশপত্র")
  )
    return "admit-card";
  if (input.includes("result") || input.includes("ফলাফল")) return "result";
  return "schedule";
}

function toJobFromRow(row: Record<string, unknown>): Job | null {
  const title = String(row.title ?? "").trim();
  if (!title) return null;

  const categorySlug = inferCategorySlug(
    String(row.category ?? row.organization ?? ""),
  );
  const publishDate = String(
    row.published_date ?? row.created_at ?? new Date().toISOString(),
  ).slice(0, 10);
  const deadlineDate = String(row.deadline ?? publishDate).slice(0, 10);
  const sourceUrl = toDisplayUrl(
    String(
      row.source_url ??
        row.apply_url ??
        row.circular_url ??
        "https://governmentjobs.gov.bd",
    ),
  );

  return {
    slug: slugify(
      `${title}-${String(row.organization ?? "govt")}-${String(row.id ?? "")}`,
    ),
    title,
    titleEn: String(row.title_en ?? title),
    organization: String(row.organization ?? "সরকারি দপ্তর"),
    logoUrl: row.organization_logo_url ? String(row.organization_logo_url) : (row.logo_url ? String(row.logo_url) : undefined),
    categorySlug,
    location: String(row.location ?? "সারাদেশ"),
    educationLevel: normalizeEducation(
      String(row.education ?? row.qualification ?? ""),
    ),
    employmentType: normalizeEmployment(
      String(row.employment_type ?? row.employmentType ?? ""),
    ),
    vacancies: Number(row.vacancies ?? 0),
    circularNo: String(
      row.circular_no ?? row.external_id ?? row.id ?? "নির্ধারিত নয়",
    ),
    publishDate,
    deadline: deadlineDate,
    applyMethod: row.apply_url
      ? `অনলাইন আবেদন (${toSourceName(String(row.apply_url))})`
      : `অনলাইন আবেদন (${toSourceName(String(row.source ?? "govt"))})`,
    sourceUrl,
    sourceName: toSourceName(String(row.source ?? sourceUrl)),
    summary: String(row.description ?? row.summary ?? title),
    ageLimit: String(row.age_requirement ?? "নির্ধারিত"),
    salaryRange: String(row.salary ?? "নির্ধারিত"),
    applicationFee: String(row.application_fee ?? "নির্ধারিত"),
    circularUrl: String(row.circular_url ?? ""),
    applyUrl: String(row.apply_url ?? row.source_url ?? ""),
    educationFull: String(row.education ?? ""),
    experience: String(row.experience ?? ""),
    eligibleApplicants: String(row.eligible_applicants ?? ""),
  };
}

function toNoticeFromRow(row: Record<string, unknown>): ExamNotice | null {
  const title = String(row.title ?? "").trim();
  if (!title) return null;

  const sourceUrl = toDisplayUrl(
    String(
      row.source_url ?? row.circular_url ?? "https://governmentjobs.gov.bd",
    ),
  );
  const publishDate = String(
    row.published_date ?? row.created_at ?? new Date().toISOString(),
  ).slice(0, 10);

  return {
    slug: slugify(
      `${title}-${String(row.organization ?? "govt")}-${String(row.id ?? "")}`,
    ),
    title,
    organization: String(row.organization ?? "সরকারি দপ্তর"),
    type: normalizeNoticeType(String(row.notice_type ?? row.type ?? "")),
    publishDate,
    summary: String(row.description ?? row.summary ?? title),
    sourceUrl,
    circularUrl: row.circular_url ? String(row.circular_url) : undefined,
  };
}

export const JOB_CATEGORY_ALIASES: Record<string, string[]> = {
  ict: ["কম্পিউটার", "আইসিটি", "Computer", "ICT", "Data Entry"],
  bank: ["ব্যাংক", "Bank"],
  railway: ["রেল", "Railway"],
  defence: ["সেনা", "নৌবাহিনী", "বিমানবাহিনী", "পুলিশ", "Defence"],
  education: ["শিক্ষা", "বিদ্যালয়", "বিশ্ববিদ্যালয়", "Education"],
  health: ["স্বাস্থ্য", "মেডিকেল", "হাসপাতাল", "Health"],
  administration: ["প্রশাসন", "Administration"],
  welfare: ["সমাজকল্যাণ", "Social Welfare"],
  engineering: ["প্রকৌশলী", "Engineer"],
  office: ["অফিস সহায়ক", "Office Support"],
};

function categoryExpression(categoryKey: string) {
  return (JOB_CATEGORY_ALIASES[categoryKey] ?? [])
    .flatMap((term) => [`title.ilike.%${term}%`, `organization.ilike.%${term}%`])
    .join(",");
}

export const categories: Category[] = [...FALLBACK_CATEGORIES];

export async function getAllJobSlugs(): Promise<{ slug: string }[]> {
  if (!isSupabaseConfigured) return FALLBACK_JOBS.map((j) => ({ slug: j.slug }));
  const { data } = await supabase.from("jobs").select("title, organization, id").eq("is_active", true);
  return (data || []).map((row) => {
    const job = toJobFromRow(row);
    return job ? { slug: job.slug } : null;
  }).filter((s): s is { slug: string } => Boolean(s));
}

export async function getAllNoticeSlugs(): Promise<{ slug: string }[]> {
  if (!isSupabaseConfigured) return FALLBACK_EXAM_NOTICES.map((n) => ({ slug: n.slug }));
  const { data } = await supabase.from("exam_notices").select("title, organization, id").eq("is_active", true);
  return (data || []).map((row) => {
    const notice = toNoticeFromRow(row);
    return notice ? { slug: notice.slug } : null;
  }).filter((s): s is { slug: string } => Boolean(s));
}

interface JobFilters {
  q?: string;
  category?: string;
  location?: string;
  education?: string;
  type?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getJobsPaginated(filters: JobFilters): Promise<{ jobs: Job[]; total: number }> {
  if (!isSupabaseConfigured) {
    let filtered = [...FALLBACK_JOBS];
    if (filters.q) {
      const needle = filters.q.trim().toLowerCase();
      filtered = filtered.filter((j) => `${j.title} ${j.titleEn} ${j.organization}`.toLowerCase().includes(needle));
    }
    if (filters.category) filtered = filtered.filter((j) => j.categorySlug === filters.category);
    if (filters.location) filtered = filtered.filter((j) => j.location === filters.location);
    if (filters.education) filtered = filtered.filter((j) => j.educationLevel === filters.education);
    if (filters.type) filtered = filtered.filter((j) => j.employmentType === filters.type);
    
    filtered.sort((a, b) =>
      filters.sort === "deadline"
        ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        : new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    const page = filters.page || 1;
    const limit = filters.limit || 9;
    return {
      jobs: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
    };
  }

  let query = supabase.from("jobs").select("*", { count: "exact" }).eq("is_active", true);

  if (filters.q) {
    const needle = filters.q.trim();
    query = query.or(`title.ilike.%${needle}%,title_en.ilike.%${needle}%,organization.ilike.%${needle}%`);
  }
  if (filters.category) {
    query = query.or(categoryExpression(filters.category));
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }
  if (filters.education) {
    // In db, education can be "SSC" or "এইচএসসি".
    query = query.or(`education.ilike.%${filters.education}%,qualification.ilike.%${filters.education}%`);
  }
  if (filters.type) {
    query = query.or(`employment_type.ilike.%${filters.type}%,employmentType.ilike.%${filters.type}%`);
  }

  if (filters.sort === "deadline") {
    query = query.order("deadline", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("published_date", { ascending: false, nullsFirst: false });
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 9);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, count, error } = await query;
  
  if (error || !data) return { jobs: [], total: 0 };

  return {
    jobs: (data as Record<string, unknown>[])
      .map((row) => toJobFromRow(row))
      .filter((job): job is NonNullable<typeof job> => Boolean(job)),
    total: count || 0,
  };
}

export async function getAllJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured) return [...FALLBACK_JOBS];

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .or(`deadline.is.null,deadline.gte.${todayISO()}`)
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [...FALLBACK_JOBS];

  return (data as Record<string, unknown>[])
    .map((row) => toJobFromRow(row))
    .filter((job): job is Job => Boolean(job));
}

export async function getCategories(): Promise<Category[]> {
  return [...FALLBACK_CATEGORIES];
}

export async function getExamNotices(): Promise<ExamNotice[]> {
  if (!isSupabaseConfigured) return [...FALLBACK_EXAM_NOTICES];

  const { data, error } = await supabase
    .from("exam_notices")
    .select("*")
    .eq("is_active", true)
    .order("exam_date", { ascending: true, nullsFirst: false })
    .order("published_date", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error || !data) return [...FALLBACK_EXAM_NOTICES];

  return (data as Record<string, unknown>[])
    .map((row) => toNoticeFromRow(row))
    .filter((notice): notice is ExamNotice => Boolean(notice));
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const idMatch = slug.match(/-(\d+)$/);
  if (idMatch && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", idMatch[1])
      .single();
    if (!error && data) {
      const job = toJobFromRow(data as Record<string, unknown>);
      if (job) return job;
    }
  }
  return (await getAllJobs()).find((job) => job.slug === slug);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const categoriesList = await getCategories();
  return categoriesList.find((category) => category.slug === slug);
}

export async function getJobsByCategory(slug: string): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return (await getAllJobs()).filter((job) => job.categorySlug === slug);
  }

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .or(`deadline.is.null,deadline.gte.${todayISO()}`);

  const expression = categoryExpression(slug);
  if (expression) {
    query = query.or(expression);
  } else {
    query = query.eq("category", slug);
  }

  const { data, error } = await query
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return (await getAllJobs()).filter((job) => job.categorySlug === slug);

  return (data as Record<string, unknown>[])
    .map((row) => toJobFromRow(row))
    .filter((job): job is Job => Boolean(job));
}

export async function getRelatedJobs(job: Job, limit = 4): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return (await getAllJobs())
      .filter((item) => item.slug !== job.slug && item.categorySlug === job.categorySlug)
      .slice(0, limit);
  }

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .or(`deadline.is.null,deadline.gte.${todayISO()}`);

  const expression = categoryExpression(job.categorySlug);
  if (expression) {
    query = query.or(expression);
  } else {
    query = query.eq("category", job.categorySlug);
  }

  const { data, error } = await query
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error || !data) return [];

  return (data as Record<string, unknown>[])
    .map((row) => toJobFromRow(row))
    .filter((j): j is Job => Boolean(j) && j?.slug !== job.slug)
    .slice(0, limit);
}

export async function getLatestJobs(limit?: number): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    const sorted = [...(await getAllJobs())].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    );
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .or(`deadline.is.null,deadline.gte.${todayISO()}`)
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit ?? 20);

  if (error || !data) return [];

  return (data as Record<string, unknown>[])
    .map((row) => toJobFromRow(row))
    .filter((job): job is Job => Boolean(job));
}

export async function getClosingSoonJobs(
  limit?: number,
  withinDays = 15,
): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    const now = Date.now();
    const sorted = (await getAllJobs())
      .filter((job) => {
        const diffDays = (new Date(job.deadline).getTime() - now) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= withinDays;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .not("deadline", "is", null)
    .gte("deadline", todayISO())
    .lte("deadline", addDaysISO(withinDays))
    .order("deadline", { ascending: true })
    .limit(limit ?? 20);

  if (error || !data) return [];

  return (data as Record<string, unknown>[])
    .map((row) => toJobFromRow(row))
    .filter((job): job is Job => Boolean(job));
}

export async function getNoticeBySlug(
  slug: string,
): Promise<ExamNotice | undefined> {
  const idMatch = slug.match(/-(\d+)$/);
  if (idMatch && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("exam_notices")
      .select("*")
      .eq("id", idMatch[1])
      .single();
    if (!error && data) {
      const notice = toNoticeFromRow(data as Record<string, unknown>);
      if (notice) return notice;
    }
  }
  return (await getExamNotices()).find((notice) => notice.slug === slug);
}

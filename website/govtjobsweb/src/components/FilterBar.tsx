import { categories } from "@/lib/data";
import { EducationLevel, EmploymentType } from "@/lib/types";

const LOCATIONS = ["সারাদেশ", "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ"];
const EDUCATION_LEVELS: EducationLevel[] = ["এসএসসি", "এইচএসসি", "ডিপ্লোমা", "স্নাতক", "স্নাতকোত্তর"];
const EMPLOYMENT_TYPES: EmploymentType[] = ["স্থায়ী", "অস্থায়ী", "চুক্তিভিত্তিক", "প্রশিক্ষণার্থী"];

export function FilterBar({
  defaults,
}: {
  defaults: {
    q?: string;
    category?: string;
    location?: string;
    education?: string;
    type?: string;
    sort?: string;
  };
}) {
  return (
    <form
      action="/jobs"
      method="GET"
      className="bg-white border border-hairline rounded-card p-4 space-y-3.5"
      aria-label="চাকরি ফিল্টার করুন"
    >
      <div>
        <label htmlFor="q" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          খুঁজুন
        </label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={defaults.q}
          placeholder="পদের নাম বা প্রতিষ্ঠান"
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          ক্যাটাগরি
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaults.category ?? ""}
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm bg-white"
        >
          <option value="">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          এলাকা
        </label>
        <select
          id="location"
          name="location"
          defaultValue={defaults.location ?? ""}
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm bg-white"
        >
          <option value="">সব এলাকা</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="education" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          শিক্ষাগত যোগ্যতা
        </label>
        <select
          id="education"
          name="education"
          defaultValue={defaults.education ?? ""}
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm bg-white"
        >
          <option value="">সব যোগ্যতা</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          পদের ধরন
        </label>
        <select
          id="type"
          name="type"
          defaultValue={defaults.type ?? ""}
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm bg-white"
        >
          <option value="">সব ধরন</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="block text-xs font-mono uppercase tracking-wide text-ink/55 mb-1.5">
          সাজান
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={defaults.sort ?? "latest"}
          className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm bg-white"
        >
          <option value="latest">নতুন প্রকাশিত</option>
          <option value="deadline">শেষ তারিখ অনুযায়ী</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary-dark text-paper font-semibold rounded-md px-4 py-2.5 text-sm transition-colors"
        >
          ফিল্টার প্রয়োগ করুন
        </button>
        <a
          href="/jobs"
          className="rounded-md border border-hairline px-4 py-2.5 text-sm text-ink/70 hover:bg-subtle text-center"
        >
          মুছুন
        </a>
      </div>
    </form>
  );
}

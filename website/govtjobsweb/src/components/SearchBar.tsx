import { categories } from "@/lib/data";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/jobs"
      method="GET"
      className={`bg-paper rounded-card shadow-cardHover border border-hairline p-3 md:p-4 ${
        compact ? "" : "max-w-2xl"
      }`}
      role="search"
      aria-label="চাকরি খুঁজুন"
    >
      <div className="flex flex-col md:flex-row gap-2.5">
        <label htmlFor="q" className="sr-only">
          পদের নাম, প্রতিষ্ঠান বা এলাকা লিখুন
        </label>
        <input
          id="q"
          name="q"
          type="text"
          placeholder="যেমন: সহকারী শিক্ষক, রেলওয়ে, ঢাকা…"
          className="flex-1 rounded-md border border-hairline px-4 py-3 text-base text-ink placeholder:text-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
        <select
          name="category"
          defaultValue=""
          aria-label="ক্যাটাগরি নির্বাচন করুন"
          className="rounded-md border border-hairline px-3 py-3 text-sm text-ink bg-white md:w-48"
        >
          <option value="">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-paper font-semibold rounded-md px-6 py-3 text-base transition-colors whitespace-nowrap"
        >
          চাকরি খুঁজুন
        </button>
      </div>
    </form>
  );
}

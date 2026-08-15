"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/jobs", label: "সব চাকরি" },
  { href: "/latest-jobs", label: "নতুন সার্কুলার" },
  { href: "/closing-soon", label: "শেষ হচ্ছে শীঘ্রই" },
  { href: "/categories", label: "ক্যাটাগরি" },
  { href: "/exam-notices", label: "পরীক্ষার নোটিশ" },
  { href: "/saved", label: "সংরক্ষিত সার্কুলার" },
  { href: "/faq", label: "সচরাচর প্রশ্ন" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b5d45] text-[#f8f9f5] shadow-[0_8px_24px_rgba(10,39,30,0.12)]">
      <div className="bg-[#0a4b39] text-[10px] font-mono uppercase tracking-[0.22em] text-[#e8f0ea]">
        <div className="container-page flex items-center justify-between py-1.5">
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
          <span className="hidden sm:inline text-[#d8c593]">সরকারি চাকরির তথ্যভাণ্ডার</span>
        </div>
      </div>

      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d9c38d]/35 bg-white/5 ring-1 ring-white/10">
            <Image src="/govt-emblem.png" alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" width={38} height={38} className="h-9 w-9 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#d9c38d]">
              সরকারি চাকরি
            </div>
            <span className="font-display text-lg md:text-xl font-bold tracking-tight">
              বাংলাদেশ সরকারি চাকরি
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="প্রধান মেনু">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#edf5f0] transition-colors hover:text-[#d9c38d]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9c38d]"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="মেনু খুলুন"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="lg:hidden border-t border-white/10 bg-[#0b5d45]" aria-label="মোবাইল মেনু">
          <ul className="container-page py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-2.5 text-sm font-medium text-[#edf5f0] last:border-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-2.5">
        {items.map((item) => (
          <details
            key={item.question}
            className="group bg-white border border-hairline rounded-card p-4 open:shadow-card"
          >
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-display font-semibold text-ink">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-primary text-lg transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink/70 leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

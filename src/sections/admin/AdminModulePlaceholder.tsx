// src/sections/admin/AdminModulePlaceholder.tsx
"use client";

type AdminModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export default function AdminModulePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
}: AdminModulePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-foreground">{title}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h3 className="font-medium text-foreground">What this section should do</h3>
          <ul className="mt-4 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="text-sm leading-6 text-muted-foreground">{bullet}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-dashed border-border bg-muted p-5 sm:p-6">
          <h3 className="font-medium text-foreground">Mobile layout notes</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Cards stack into a single column on small screens for cleaner
              scanning.
            </p>
            <p>
              Actions should stay thumb-friendly with full-width buttons and
              large tap targets.
            </p>
            <p>
              Dense tables should collapse into card rows on mobile instead of
              forcing horizontal scrolling whenever possible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

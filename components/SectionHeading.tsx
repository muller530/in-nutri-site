type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`space-y-4 ${alignment} max-w-3xl`}>
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]">{eyebrow}</p>
      <h2 className="text-3xl font-light text-[var(--color-forest)] sm:text-[40px] sm:leading-snug">{title}</h2>
      <p className="text-base leading-relaxed text-[var(--color-ink)]/70">{description}</p>
    </div>
  );
}


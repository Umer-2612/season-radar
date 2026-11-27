type Props = { code: string; url: string; label?: string; tone?: "light" | "dark" };

export function SourceChip({ code, url, label = "CSO", tone = "light" }: Props) {
  const colors =
    tone === "dark" ? "border-brand-ink/30 text-brand-ink hover:bg-brand-ink/10" : "border-line bg-bg text-muted hover:border-brand hover:text-brand";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold transition-colors duration-150 ${colors}`}
    >
      <span aria-hidden="true">◉</span>
      {label} · {code} <span aria-hidden="true">↗</span>
    </a>
  );
}

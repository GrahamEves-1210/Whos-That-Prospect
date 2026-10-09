/** NFL Draft logo (public/draft-logo.svg, year removed) with the prospect's draft year drawn in. */
export function DraftLogo({ year, className = '' }: { year: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 381.9 365" role="img" aria-label={`${year} NFL Draft`}>
      <image href="/draft-logo.svg" width="381.9" height="365" />
      <text x="190.9" y="288" textAnchor="middle" className="draft-logo__year">
        {year}
      </text>
    </svg>
  );
}

// EKTARA mark: two arcs meeting under a shared roof line, suggesting connection and a home.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="EKTARA logo" fill="none">
      <rect width="48" height="48" rx="14" fill="#245540" />
      <path d="M10 23 24 12l14 11" stroke="#fde8dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 36c0-6 4-9 8-9" stroke="#d3e2d8" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 36c0-6-4-9-8-9" stroke="#f8d2bd" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="font-serif text-xl font-semibold tracking-wide text-forest-900">EKTARA</span>
    </span>
  );
}

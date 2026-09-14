export function ArthurMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="62" r="42" fill="#8B5A2B" />
      <circle cx="26" cy="30" r="13" fill="#8B5A2B" />
      <circle cx="94" cy="30" r="13" fill="#8B5A2B" />
      <circle cx="26" cy="30" r="6" fill="#C88F52" />
      <circle cx="94" cy="30" r="6" fill="#C88F52" />
      <ellipse cx="60" cy="76" rx="21" ry="16" fill="#E8C79B" />
      <circle cx="49" cy="58" r="4.2" fill="#291B0E" />
      <circle cx="71" cy="58" r="4.2" fill="#291B0E" />
      <ellipse cx="60" cy="70" rx="6.5" ry="4.5" fill="#291B0E" />
      <path d="M52 79 q8 6 16 0" stroke="#291B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M20 42 a40 26 0 0 1 80 0 z" fill="#DE9F35" />
      <ellipse cx="60" cy="42" rx="42" ry="7" fill="#B87A1D" />
      <rect x="52" y="30" width="16" height="8" rx="2" fill="#FBEBCC" />
    </svg>
  );
}

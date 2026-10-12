/* The JustSeen mark (same shapes as public/favicon.svg) plus the wordmark.
Drawn in code so the text follows light and dark mode */
export const LogoMark = ({ className = "h-7 w-auto" }) => (
  <svg viewBox="118 70 382 250" className={className} aria-hidden="true">
    <g fill="#4f3fe0">
      <circle cx="187" cy="212" r="64" />
      <path d="M140 175 C 150 125, 190 92, 230 76 L 240 86 C 214 104, 200 126, 198 150 Z" />
    </g>
    <path
      d="M246 120 L 466 103 Q 482 102 482 118 L 482 284 Q 482 300 466 299 L 236 282"
      fill="none"
      stroke="#4f3fe0"
      strokeWidth="30"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const Logo = () => (
  <span className="flex items-center gap-2">
    <LogoMark className="h-6 sm:h-7 w-auto" />
    <span className="hidden min-[380px]:inline font-display text-lg sm:text-xl font-bold tracking-tight text-fg">
      JustSeen
    </span>
  </span>
);

export default Logo;

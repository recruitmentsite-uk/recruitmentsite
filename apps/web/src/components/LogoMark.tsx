interface LogoMarkProps {
  className?: string;
  size?: number;
}

/**
 * Brand mark: RS monogram in a teal gradient rounded square.
 * R = Recruitment, S = Site. Upward chevron = career placement.
 */
export function LogoMark({ className = "", size = 36 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="rs-grad" x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2dd4bf" />
          <stop offset="0.45" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#rs-grad)" />
      {/* R letterform */}
      <path
        d="M9.5 10h4.8c2.9 0 4.8 1.8 4.8 4.4 0 1.9-1 3.2-2.6 3.8l3.8 5.3h-3.9l-3.5-5h-2.6v5h-3.5V10zM14.1 16.2c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8h-1.1v3.6h1.1z"
        fill="white"
      />
      {/* S letterform with upward placement arrow */}
      <path
        d="M21.2 11.2c2.4 0 3.9 1.1 3.9 2.8 0 1.3-.8 2.2-2.4 2.6 1.6.4 2.6 1.5 2.6 3.1 0 2.2-1.9 3.7-4.8 3.7-1.8 0-3.3-.6-4.2-1.7l1.5-2.1c.7.8 1.7 1.2 2.7 1.2 1.2 0 1.9-.5 1.9-1.3 0-.8-.6-1.2-2.2-1.5-1.9-.4-2.9-1.2-2.9-2.6 0-1.6 1.4-2.7 3.5-2.7 1.4 0 2.6.4 3.5 1.2l-1.3 1.9c-.6-.5-1.4-.8-2.2-.8-1 0-1.6.4-1.6 1 0 .6.5 1 1.9 1.3 2.1.5 3.2 1.5 3.2 3.2 0 2.1-1.8 3.5-4.5 3.5-1.7 0-3.2-.6-4.1-1.6l1.4-2c.8.7 1.9 1.1 3 1.1 1.5 0 2.4-.7 2.4-1.8 0-1-.7-1.5-2.5-1.9-1.6-.3-2.4-.8-2.4-1.7 0-1 .9-1.7 2.3-1.7z"
        fill="white"
        opacity="0"
      />
      {/* Clean S + upward arrow (legible at 16px) */}
      <path
        d="M20.5 12c2.2 0 3.6 1 3.6 2.5 0 1.1-.7 1.9-2.1 2.3 1.5.3 2.4 1.2 2.4 2.5 0 1.9-1.6 3.2-4 3.2-1.5 0-2.8-.5-3.6-1.4l1.2-1.7c.6.6 1.4.9 2.3 0.9 1 0 1.6-.4 1.6-1.1 0-.7-.5-1-1.8-1.3-1.6-.3-2.5-1-2.5-2.2 0-1.4 1.2-2.3 3-2.3 1.2 0 2.2.3 2.9 1l-1.1 1.6c-.5-.4-1.2-.6-1.9-.6-.8 0-1.3.3-1.3.8 0 .5.4.8 1.6 1.1 1.9.4 2.9 1.3 2.9 2.8 0 1.8-1.5 3-3.8 3-1.4 0-2.6-.5-3.3-1.3l1.2-1.6c.6.5 1.4.8 2.3 0.8 1.2 0 2-.6 2-1.5 0-.8-.6-1.3-2.2-1.6-1.4-.3-2.1-.7-2.1-1.5 0-.9.8-1.5 2.1-1.5z"
        fill="white"
        opacity="0.12"
      />
      <path
        d="M21 12.5c1.8 0 2.9.9 2.9 2.2s-1.1 2.2-2.9 2.2c-.6 0-1.1-.1-1.5-.3v-3.8c.4-.2.9-.3 1.5-.3zm0 8.5c2 0 3.2-1 3.2-2.5S23 16 21 16c-.5 0-1 .1-1.4.2v2.8c.4.1.9.2 1.4.2z"
        fill="white"
        opacity="0"
      />
      {/* S curve */}
      <path
        d="M20.8 13.2c1.6 0 2.6.7 2.6 1.8 0 .9-.6 1.5-1.8 1.8l-.3.1c1.5.3 2.4 1.2 2.4 2.4 0 1.6-1.4 2.7-3.5 2.7-1.2 0-2.3-.4-3-1.1l1-1.5c.5.5 1.2.8 2 .8 1 0 1.6-.4 1.6-1 0-.6-.5-.9-1.7-1.2l-.8-.2c-1.4-.3-2.1-.9-2.1-1.9 0-1.1 1-1.9 2.5-1.9 1 0 1.9.3 2.5.9l-.9 1.3c-.4-.4-1-.6-1.6-.6-.7 0-1.1.3-1.1.7 0 .4.3.7 1.2.9l.7.2c1.6.4 2.5 1.1 2.5 2.2 0 1.4-1.2 2.3-3.1 2.3-1.1 0-2-.3-2.6-.9l.9-1.3c.5.4 1.1.6 1.8.6 1.1 0 1.7-.5 1.7-1.2 0-.7-.5-1-1.8-1.3l-.7-.2c-1.5-.3-2.3-.9-2.3-1.8 0-1 .9-1.7 2.3-1.7z"
        fill="white"
      />
      {/* Upward placement arrow */}
      <path
        d="M27.5 13.5l2.5 2.5-2.5 2.5M29.5 16H25.5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.5 13v6"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SVG paths for next/og ImageResponse */
export const LOGO_MARK_PATHS = {
  rect: `<rect width="36" height="36" rx="10" fill="url(#g)"/>`,
  r: `<path d="M9.5 10h4.8c2.9 0 4.8 1.8 4.8 4.4 0 1.9-1 3.2-2.6 3.8l3.8 5.3h-3.9l-3.5-5h-2.6v5h-3.5V10zM14.1 16.2c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8h-1.1v3.6h1.1z" fill="white"/>`,
  s: `<path d="M20.8 13.2c1.6 0 2.6.7 2.6 1.8 0 .9-.6 1.5-1.8 1.8l-.3.1c1.5.3 2.4 1.2 2.4 2.4 0 1.6-1.4 2.7-3.5 2.7-1.2 0-2.3-.4-3-1.1l1-1.5c.5.5 1.2.8 2 .8 1 0 1.6-.4 1.6-1 0-.6-.5-.9-1.7-1.2l-.8-.2c-1.4-.3-2.1-.9-2.1-1.9 0-1.1 1-1.9 2.5-1.9 1 0 1.9.3 2.5.9l-.9 1.3c-.4-.4-1-.6-1.6-.6-.7 0-1.1.3-1.1.7 0 .4.3.7 1.2.9l.7.2c1.6.4 2.5 1.1 2.5 2.2 0 1.4-1.2 2.3-3.1 2.3-1.1 0-2-.3-2.6-.9l.9-1.3c.5.4 1.1.6 1.8.6 1.1 0 1.7-.5 1.7-1.2 0-.7-.5-1-1.8-1.3l-.7-.2c-1.5-.3-2.3-.9-2.3-1.8 0-1 .9-1.7 2.3-1.7z" fill="white"/>`,
  arrow: `<path d="M27.5 13.5l2.5 2.5-2.5 2.5M29.5 16H25.5" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.5 13v6" stroke="white" stroke-width="1.75" stroke-linecap="round"/>`,
  gradientDef: `<defs><linearGradient id="g" x1="6" y1="4" x2="30" y2="32"><stop stop-color="#2dd4bf"/><stop offset="0.45" stop-color="#14b8a6"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>`,
};

import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@placeuk/shared";

export const alt = `${SITE_NAME} — UK jobs with salary shown upfront`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0f766e 0%, #0d5c56 45%, #134e4a 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <svg width="56" height="56" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="og-g" x1="6" y1="4" x2="30" y2="32">
                <stop stopColor="#2dd4bf" />
                <stop offset="0.45" stopColor="#14b8a6" />
                <stop offset="1" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="10" fill="url(#og-g)" />
            <path
              d="M9.5 10h4.8c2.9 0 4.8 1.8 4.8 4.4 0 1.9-1 3.2-2.6 3.8l3.8 5.3h-3.9l-3.5-5h-2.6v5h-3.5V10zM14.1 16.2c1.4 0 2.2-.7 2.2-1.8s-.8-1.8-2.2-1.8h-1.1v3.6h1.1z"
              fill="white"
            />
            <path
              d="M20.8 13.2c1.6 0 2.6.7 2.6 1.8 0 .9-.6 1.5-1.8 1.8l-.3.1c1.5.3 2.4 1.2 2.4 2.4 0 1.6-1.4 2.7-3.5 2.7-1.2 0-2.3-.4-3-1.1l1-1.5c.5.5 1.2.8 2 .8 1 0 1.6-.4 1.6-1 0-.6-.5-.9-1.7-1.2l-.8-.2c-1.4-.3-2.1-.9-2.1-1.9 0-1.1 1-1.9 2.5-1.9 1 0 1.9.3 2.5.9l-.9 1.3c-.4-.4-1-.6-1.6-.6-.7 0-1.1.3-1.1.7 0 .4.3.7 1.2.9l.7.2c1.6.4 2.5 1.1 2.5 2.2 0 1.4-1.2 2.3-3.1 2.3-1.1 0-2-.3-2.6-.9l.9-1.3c.5.4 1.1.6 1.8.6 1.1 0 1.7-.5 1.7-1.2 0-.7-.5-1-1.8-1.3l-.7-.2c-1.5-.3-2.3-.9-2.3-1.8 0-1 .9-1.7 2.3-1.7z"
              fill="white"
            />
            <path
              d="M27.5 13.5l2.5 2.5-2.5 2.5M29.5 16H25.5"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M29.5 13v6" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
              <span style={{ color: "#5eead4" }}>Recruitment</span>
              <span style={{ color: "white" }}> Site</span>
            </span>
            <span style={{ fontSize: 16, opacity: 0.75, marginTop: 4 }}>recruitmentsite.co.uk</span>
          </div>
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, maxWidth: 900 }}>
          Find UK jobs with salary shown upfront
        </div>
        <div style={{ fontSize: 26, marginTop: 24, opacity: 0.9, maxWidth: 800 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 48, fontSize: 20, opacity: 0.85 }}>
          <span>✓ Free to apply</span>
          <span>✓ Verified employers</span>
          <span>✓ Healthcare · Trades · Tech</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

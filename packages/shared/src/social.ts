/**
 * Public social profile URLs for Recruitment Site.
 * Fill href after each account is live, then redeploy footer links.
 */
export type SocialPlatform = {
  key: string;
  label: string;
  href: string;
  handle?: string;
};

export const SOCIAL_OWNER_EMAIL = "admin@recruitmentsite.co.uk";
export const SOCIAL_PUBLIC_EMAIL = "hello@recruitmentsite.co.uk";

/** Preferred handles — use nearest available if taken. */
export const SOCIAL_HANDLES = {
  linkedinSlug: "recruitmentsite-uk",
  x: "RecruitSiteUK",
  facebook: "recruitmentsiteuk",
  instagram: "recruitmentsite.uk",
  youtube: "RecruitmentSiteUK",
} as const;

export const PLATFORM_SOCIAL: Record<string, SocialPlatform> = {
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/recruitmentsite-uk/",
    handle: SOCIAL_HANDLES.linkedinSlug,
  },
  x: {
    key: "x",
    label: "X",
    href: "",
    handle: SOCIAL_HANDLES.x,
  },
  facebook: {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61592529213211",
    handle: SOCIAL_HANDLES.facebook,
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/recruitmentsite.uk/",
    handle: SOCIAL_HANDLES.instagram,
  },
  youtube: {
    key: "youtube",
    label: "YouTube",
    href: "",
    handle: SOCIAL_HANDLES.youtube,
  },
};

export function liveSocialLinks(): SocialPlatform[] {
  return Object.values(PLATFORM_SOCIAL).filter((p) => Boolean(p.href));
}

/**
 * Publish to Meta (Facebook / Instagram) and LinkedIn via official APIs.
 * Tokens stay in env — never persisted in the database.
 */

export type SocialPlatformKey = "facebook" | "instagram" | "linkedin" | "x" | "youtube";

export type PublishResult = {
  platform: SocialPlatformKey;
  status: "published" | "failed" | "skipped";
  externalId?: string;
  externalUrl?: string;
  error?: string;
};

function env(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

export function socialConnectionStatus() {
  return {
    facebook: Boolean(env("META_PAGE_ACCESS_TOKEN") && env("META_PAGE_ID")),
    instagram: Boolean(
      env("META_PAGE_ACCESS_TOKEN") && env("META_IG_USER_ID"),
    ),
    linkedin: Boolean(
      env("LINKEDIN_ACCESS_TOKEN") && env("LINKEDIN_ORGANIZATION_ID"),
    ),
    x: Boolean(env("X_API_KEY") && env("X_API_SECRET") && env("X_ACCESS_TOKEN")),
    youtube: false,
  } as Record<SocialPlatformKey, boolean>;
}

function captionFor(
  platform: SocialPlatformKey,
  body: string,
  captions: Record<string, string> | null | undefined,
): string {
  const fromMap = captions?.[platform]?.trim();
  return fromMap || body.trim();
}

async function publishFacebook(opts: {
  message: string;
  linkUrl?: string | null;
}): Promise<PublishResult> {
  const token = env("META_PAGE_ACCESS_TOKEN");
  const pageId = env("META_PAGE_ID");
  if (!token || !pageId) {
    return { platform: "facebook", status: "skipped", error: "META_PAGE_ID / META_PAGE_ACCESS_TOKEN not set" };
  }

  const params = new URLSearchParams({
    message: opts.message,
    access_token: token,
  });
  if (opts.linkUrl) params.set("link", opts.linkUrl);

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: "POST",
    body: params,
  });
  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    return {
      platform: "facebook",
      status: "failed",
      error: data.error?.message || `Facebook API ${res.status}`,
    };
  }
  return {
    platform: "facebook",
    status: "published",
    externalId: data.id,
    externalUrl: `https://www.facebook.com/${data.id}`,
  };
}

async function publishInstagram(opts: {
  message: string;
  imageUrl?: string | null;
}): Promise<PublishResult> {
  const token = env("META_PAGE_ACCESS_TOKEN");
  const igUserId = env("META_IG_USER_ID");
  if (!token || !igUserId) {
    return { platform: "instagram", status: "skipped", error: "META_IG_USER_ID / META_PAGE_ACCESS_TOKEN not set" };
  }
  if (!opts.imageUrl) {
    return { platform: "instagram", status: "failed", error: "Instagram requires image_url" };
  }

  // Public absolute URL required by Meta
  const site = env("NEXT_PUBLIC_SITE_URL") || "https://recruitmentsite.co.uk";
  const imageUrl = opts.imageUrl.startsWith("http")
    ? opts.imageUrl
    : `${site.replace(/\/$/, "")}${opts.imageUrl.startsWith("/") ? "" : "/"}${opts.imageUrl}`;

  const createParams = new URLSearchParams({
    image_url: imageUrl,
    caption: opts.message,
    access_token: token,
  });
  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media`,
    { method: "POST", body: createParams },
  );
  const createData = (await createRes.json()) as {
    id?: string;
    error?: { message?: string };
  };
  if (!createRes.ok || !createData.id) {
    return {
      platform: "instagram",
      status: "failed",
      error: createData.error?.message || `Instagram container ${createRes.status}`,
    };
  }

  const publishParams = new URLSearchParams({
    creation_id: createData.id,
    access_token: token,
  });
  const pubRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
    { method: "POST", body: publishParams },
  );
  const pubData = (await pubRes.json()) as {
    id?: string;
    error?: { message?: string };
  };
  if (!pubRes.ok || !pubData.id) {
    return {
      platform: "instagram",
      status: "failed",
      error: pubData.error?.message || `Instagram publish ${pubRes.status}`,
    };
  }
  return {
    platform: "instagram",
    status: "published",
    externalId: pubData.id,
    externalUrl: `https://www.instagram.com/p/${pubData.id}/`,
  };
}

async function publishLinkedIn(opts: {
  message: string;
  linkUrl?: string | null;
}): Promise<PublishResult> {
  const token = env("LINKEDIN_ACCESS_TOKEN");
  const orgId = env("LINKEDIN_ORGANIZATION_ID");
  if (!token || !orgId) {
    return {
      platform: "linkedin",
      status: "skipped",
      error: "LINKEDIN_ACCESS_TOKEN / LINKEDIN_ORGANIZATION_ID not set",
    };
  }

  const author = orgId.startsWith("urn:")
    ? orgId
    : `urn:li:organization:${orgId}`;

  const commentary = opts.linkUrl
    ? `${opts.message}\n\n${opts.linkUrl}`
    : opts.message;

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202405",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      platform: "linkedin",
      status: "failed",
      error: text.slice(0, 400) || `LinkedIn API ${res.status}`,
    };
  }

  const restliId = res.headers.get("x-restli-id") || undefined;
  return {
    platform: "linkedin",
    status: "published",
    externalId: restliId,
    externalUrl: restliId
      ? `https://www.linkedin.com/feed/update/${restliId}`
      : undefined,
  };
}

export async function publishToPlatforms(opts: {
  platforms: SocialPlatformKey[];
  body: string;
  captions?: Record<string, string> | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
}): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  for (const platform of opts.platforms) {
    const message = captionFor(platform, opts.body, opts.captions);
    try {
      if (platform === "facebook") {
        results.push(
          await publishFacebook({ message, linkUrl: opts.linkUrl }),
        );
      } else if (platform === "instagram") {
        results.push(
          await publishInstagram({ message, imageUrl: opts.imageUrl }),
        );
      } else if (platform === "linkedin") {
        results.push(
          await publishLinkedIn({ message, linkUrl: opts.linkUrl }),
        );
      } else {
        results.push({
          platform,
          status: "skipped",
          error: `${platform} API publish not configured yet`,
        });
      }
    } catch (err) {
      results.push({
        platform,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

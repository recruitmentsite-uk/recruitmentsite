/** Treat masked Vercel pull placeholders and empty strings as unset. */
export function isUsableEnvValue(value: string | undefined | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return false;
  return true;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

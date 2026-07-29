/**
 * Extract plain text from CV uploads (PDF / DOCX / TXT).
 * Caps output so matching prompts stay within token budgets.
 */
const MAX_CHARS = 5000;

export async function extractCvText(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<string> {
  const lower = filename.toLowerCase();
  const type = (mime || "").toLowerCase();

  try {
    if (type === "text/plain" || lower.endsWith(".txt")) {
      return buffer.toString("utf8").slice(0, MAX_CHARS);
    }

    if (
      type.includes("wordprocessingml") ||
      type === "application/msword" ||
      lower.endsWith(".docx") ||
      lower.endsWith(".doc")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return (result.value || "").slice(0, MAX_CHARS);
    }

    if (type === "application/pdf" || lower.endsWith(".pdf")) {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      const joined = Array.isArray(text) ? text.join("\n") : String(text ?? "");
      return joined.slice(0, MAX_CHARS);
    }
  } catch (err) {
    console.error("CV text extraction failed:", err);
  }

  return "";
}

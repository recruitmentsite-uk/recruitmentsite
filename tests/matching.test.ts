import { describe, expect, it } from "vitest";
import { scoreApplication } from "../apps/web/src/lib/matching";
import { extractProfileSignals } from "../apps/web/src/lib/screening-credits";
import { normalizeUkPhone } from "../apps/web/src/lib/sms";

describe("scoreApplication heuristic", () => {
  it("returns a bounded score without OpenAI", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await scoreApplication(
      "Looking for a nurse with NVQ and medication experience in Manchester care home",
      "Experienced nurse NVQ medication dementia care Manchester",
    );
    expect(result.score).toBeGreaterThanOrEqual(35);
    expect(result.score).toBeLessThanOrEqual(95);
    expect(result.summary.length).toBeGreaterThan(10);
  });
});

describe("extractProfileSignals", () => {
  it("extracts skills and years", () => {
    const signals = extractProfileSignals(
      "Senior Care Assistant\n10 years experience in nursing and medication with NVQ",
    );
    expect(signals.skills).toContain("nursing");
    expect(signals.skills).toContain("medication");
    expect(signals.experienceYears).toBe(10);
  });
});

describe("normalizeUkPhone", () => {
  it("normalises UK mobiles to E.164", () => {
    expect(normalizeUkPhone("07523075855")).toBe("+447523075855");
    expect(normalizeUkPhone("+447523075855")).toBe("+447523075855");
    expect(normalizeUkPhone("bad")).toBeNull();
  });
});

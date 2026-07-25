import { describe, expect, it } from "vitest";
import { normalizeReedJob, parseReedDate } from "../scripts/lib/reed-client.mjs";

describe("parseReedDate", () => {
  it("parses UK DD/MM/YYYY into ISO", () => {
    expect(parseReedDate("14/07/2026")).toBe("2026-07-14T12:00:00.000Z");
  });
});

describe("normalizeReedJob", () => {
  it("maps Reed payload into jobs row shape", () => {
    const row = normalizeReedJob(
      {
        jobId: 12345,
        jobTitle: "Staff Nurse",
        jobDescription: "<p>Band 5 nurse role</p>",
        locationName: "Leeds",
        minimumSalary: 30000,
        maximumSalary: 35000,
        contractType: "Permanent",
        jobUrl: "https://www.reed.co.uk/jobs/12345",
        employerName: "NHS Trust",
        date: "14/07/2026",
      },
      "healthcare",
    );

    expect(row.slug).toBe("reed-12345");
    expect(row.external_source).toBe("reed");
    expect(row.external_id).toBe("12345");
    expect(row.vertical).toBe("healthcare");
    expect(row.salary_disclosed).toBe(true);
    expect(row.description).not.toContain("<p>");
    expect(row.compliance.redirect_url).toContain("reed.co.uk");
    expect(row.published_at).toBe("2026-07-14T12:00:00.000Z");
  });
});

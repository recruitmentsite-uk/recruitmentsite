import { describe, expect, it } from "vitest";
import { inferVertical, parseSalarySnippet, stripHtml } from "../scripts/lib/job-normalize.mjs";

describe("inferVertical", () => {
  it("maps common titles", () => {
    expect(inferVertical("Band 5 Staff Nurse")).toBe("healthcare");
    expect(inferVertical("Class 1 HGV Driver")).toBe("logistics");
    expect(inferVertical("Primary Teacher (QTS)")).toBe("education");
    expect(inferVertical("Unknown role", "general")).toBe("general");
  });
});

describe("parseSalarySnippet", () => {
  it("parses GBP ranges", () => {
    expect(parseSalarySnippet("£32,000 - £40,000")).toEqual({ min: 32000, max: 40000 });
  });
});

describe("stripHtml", () => {
  it("removes tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });
});

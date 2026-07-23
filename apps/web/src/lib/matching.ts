export interface MatchResult {
  score: number;
  summary: string;
}

/** Heuristic fallback when OpenAI is unavailable */
function heuristicScore(jobDescription: string, cvText: string): MatchResult {
  const jobWords = new Set(
    jobDescription.toLowerCase().split(/\W+/).filter((w) => w.length > 3),
  );
  const cvWords = cvText.toLowerCase().split(/\W+/);
  let hits = 0;
  for (const w of cvWords) {
    if (jobWords.has(w)) hits++;
  }
  const score = Math.min(95, Math.max(35, 40 + hits * 3));
  return {
    score,
    summary: `Keyword match: ${hits} overlapping terms between CV and job description. Review manually for fit.`,
  };
}

export async function scoreApplication(
  jobDescription: string,
  cvText: string,
): Promise<MatchResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const combined = `${cvText}\n${jobDescription}`.slice(0, 8000);

  if (!apiKey) {
    return heuristicScore(jobDescription, cvText);
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a UK recruitment AI. Score candidate-job fit 0-100. Never consider protected characteristics. Return JSON: { \"score\": number, \"summary\": string }",
          },
          {
            role: "user",
            content: `Job:\n${jobDescription.slice(0, 3000)}\n\nCandidate:\n${combined.slice(0, 4000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return heuristicScore(jobDescription, cvText);

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content) as MatchResult;
    return {
      score: Math.min(100, Math.max(0, parsed.score ?? 50)),
      summary: parsed.summary ?? "AI match summary unavailable.",
    };
  } catch {
    return heuristicScore(jobDescription, cvText);
  }
}

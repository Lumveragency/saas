import type { Forecast } from "./schema";

// Illustrative sample used ONLY on the marketing page's "Example research
// report" section. It is clearly labeled as an example in the UI and is never
// presented as a live forecast. Sources are real, stable reference pages.
export const SAMPLE_FORECAST: Forecast = {
  question: "Will a crewed mission land on the Moon before the end of 2027?",
  yesProbability: 38,
  noProbability: 62,
  confidence: "medium",
  summary:
    "A crewed lunar landing before the end of 2027 is plausible but more likely to slip. The flagship program targeting a crewed landing has publicly announced a schedule in this window, but its own reviews and independent oversight have repeatedly flagged dependencies — a human landing system and spacesuits — that historically drive delays. Absent confirmation that those long-pole items are flight-ready, the base rate for large space-program schedules favors slippage.",
  supportingEvidence: [
    {
      title: "Program schedule targets a landing in the window",
      explanation:
        "The lead agency's publicly stated plan places a crewed landing attempt within this timeframe, and preceding uncrewed and crewed test flights are on the manifest.",
      sourceIndex: 0,
      strength: "moderate",
    },
    {
      title: "Hardware contracts are awarded and in development",
      explanation:
        "Contracts for the crewed landing system and related hardware are active, indicating committed funding and vendor progress rather than a paper plan.",
      sourceIndex: 1,
      strength: "moderate",
    },
  ],
  contraryEvidence: [
    {
      title: "Oversight reports flag schedule risk on critical systems",
      explanation:
        "Independent oversight has assessed that key elements — the landing system and next-generation spacesuits — are unlikely to be ready on the current timeline, a recurring pattern for first-of-a-kind space hardware.",
      sourceIndex: 2,
      strength: "strong",
    },
    {
      title: "Prerequisite test flights not yet complete",
      explanation:
        "A crewed landing depends on earlier test milestones being completed and reviewed successfully; any of these slipping cascades into the landing date.",
      sourceIndex: 0,
      strength: "moderate",
    },
  ],
  keyUncertainty:
    "Whether the human landing system and spacesuits complete integrated testing in time. These are the schedule's long-pole items, and public assessments diverge on their readiness — which is why confidence is medium rather than high.",
  whatCouldChange: [
    {
      title: "Outcome of the preceding crewed test flight",
      detail:
        "A clean, on-schedule test flight would raise the estimate materially; a delay or anomaly would lower it.",
      expected: "next major milestone",
    },
    {
      title: "Landing-system integrated test results",
      detail: "Successful integrated demonstrations would be the strongest positive signal.",
    },
  ],
  sources: [
    {
      title: "NASA — Artemis program overview",
      url: "https://www.nasa.gov/humans-in-space/artemis/",
      publisher: "NASA",
    },
    {
      title: "NASA — Human Landing System",
      url: "https://www.nasa.gov/humans-in-space/human-landing-system/",
      publisher: "NASA",
    },
    {
      title: "U.S. Government Accountability Office — space program assessments",
      url: "https://www.gao.gov/",
      publisher: "GAO",
    },
  ],
  assumptions: [
    "\"Crewed landing\" means humans touching down on the lunar surface, not a lunar flyby or orbit.",
    "The deadline is December 31, 2027.",
  ],
  methodology: {
    interpretation:
      "The question resolves YES only if humans land on the lunar surface (not orbit or flyby) on or before December 31, 2027.",
    researchApproach:
      "Reviewed the lead agency's published program plans and hardware development status, then weighted them against independent oversight assessments of schedule risk.",
    limitations:
      "Large space-program schedules are historically optimistic, and readiness of critical hardware is not publicly confirmed, so the estimate carries meaningful uncertainty.",
  },
};

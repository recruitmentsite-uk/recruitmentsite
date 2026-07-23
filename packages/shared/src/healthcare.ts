/** Healthcare vertical — compliance fields and role templates for UK launch wedge */

export interface HealthcareCompliance {
  nmcRequired?: boolean;
  hcpcRequired?: boolean;
  dbsRequired: boolean;
  dbsLevel?: "basic" | "standard" | "enhanced";
  cqcRegisteredEmployer?: boolean;
  nhsBand?: "band-2" | "band-3" | "band-4" | "band-5" | "band-6" | "band-7" | "band-8";
}

export const HEALTHCARE_ROLE_TEMPLATES = [
  {
    title: "Registered Nurse (Band 5)",
    skills: ["NMC registration", "Patient assessment", "Medication administration"],
    compliance: { nmcRequired: true, dbsRequired: true, dbsLevel: "enhanced" as const, nhsBand: "band-5" as const },
  },
  {
    title: "Care Assistant",
    skills: ["Personal care", "Manual handling", "Dementia care"],
    compliance: { dbsRequired: true, dbsLevel: "enhanced" as const },
  },
  {
    title: "Healthcare Assistant (HCA)",
    skills: ["Vital signs", "Patient hygiene", "Ward support"],
    compliance: { dbsRequired: true, dbsLevel: "enhanced" as const, nhsBand: "band-2" as const },
  },
  {
    title: "Support Worker",
    skills: ["Learning disabilities", "Community care", "Personal care"],
    compliance: { dbsRequired: true, dbsLevel: "enhanced" as const },
  },
  {
    title: "RMN (Mental Health Nurse)",
    skills: ["NMC registration", "Mental health act", "Risk assessment"],
    compliance: { nmcRequired: true, dbsRequired: true, dbsLevel: "enhanced" as const, nhsBand: "band-6" as const },
  },
  {
    title: "Physiotherapist",
    skills: ["HCPC registration", "MSK", "Rehabilitation"],
    compliance: { hcpcRequired: true, dbsRequired: true, dbsLevel: "enhanced" as const, nhsBand: "band-6" as const },
  },
] as const;

export const NHS_BAND_SALARY_2025: Record<string, { min: number; max: number }> = {
  "band-2": { min: 23195, max: 23195 },
  "band-3": { min: 24990, max: 24990 },
  "band-4": { min: 27389, max: 27389 },
  "band-5": { min: 28407, max: 34581 },
  "band-6": { min: 35392, max: 42618 },
  "band-7": { min: 46148, max: 52809 },
  "band-8": { min: 54265, max: 75185 },
};

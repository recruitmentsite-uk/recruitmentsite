export type JobType = "permanent" | "contract" | "temporary" | "part_time";
export type JobStatus = "draft" | "active" | "paused" | "expired" | "filled";
export type Vertical = "healthcare" | "trades" | "tech" | "general";
export type PlanTier = "starter" | "growth" | "scale" | "payg";

export interface SalaryBand {
  min: number;
  max: number;
  currency: "GBP";
  period: "year" | "hour" | "day";
  disclosed: boolean;
}

export interface JobListing {
  id: string;
  slug: string;
  title: string;
  employerId: string;
  employerName: string;
  description: string;
  location: string;
  city: string;
  region: string;
  postcode?: string;
  remote: "onsite" | "hybrid" | "remote";
  jobType: JobType;
  vertical: Vertical;
  salary: SalaryBand;
  skills: string[];
  status: JobStatus;
  featured: boolean;
  applicationCount: number;
  publishedAt: string;
  expiresAt: string;
}

export interface CandidateProfile {
  id: string;
  email: string;
  fullName: string;
  headline?: string;
  skills: string[];
  verticals: Vertical[];
  city?: string;
  rightToWorkUk: boolean;
  cvUrl?: string;
  alertFrequency: "instant" | "daily" | "weekly" | "off";
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  matchScore: number;
  status: "submitted" | "reviewing" | "shortlisted" | "rejected" | "hired";
  coverNote?: string;
  submittedAt: string;
}

export interface EmployerAccount {
  id: string;
  companyName: string;
  slug: string;
  plan: PlanTier;
  vertical: Vertical;
  stripeCustomerId?: string;
  activeJobLimit: number;
  featuredSlotsRemaining: number;
}

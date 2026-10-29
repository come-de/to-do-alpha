export type ParentSource = "alpha" | "aircall" | "visio" | "enrolled" | "brochure";
export type ParentFollowUp = "to-contact" | "do-not-contact" | "review";
export type ParentEvidence = { source: ParentSource; fileName: string; importedAt: string; occurredAt?: string };
export type ParentVisioRegistration = {
  submittedAt: string;
  rawSchool: string;
  childClass: string;
  enrolledAnswer: string;
  contactPreference: string;
  selectedMeeting: string;
  expectations: string;
  knownVia: string;
  fileName: string;
};
export type ParentSchoolIssue = { raw: string; suggestions: string[] };
export type ParentAircallSummary = { registryStatus: string; incomingCalls: number | null; missedCalls: number | null; answeredCalls: number | null; firstIncoming: string; lastIncoming: string; fileName: string };

export type ParentContact = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emails: string[];
  phones: string[];
  schools: string[];
  childClasses: string[];
  brochureRequests: Array<{ submittedAt: string; brochure: string; childClass: string; visioInterested: boolean | null; fileName: string }>;
  visioRegistrations: ParentVisioRegistration[];
  aircallCalls?: ParentAircallSummary[];
  needsSchoolReview: boolean;
  schoolIssues: ParentSchoolIssue[];
  enrolled: boolean | null;
  sources: ParentSource[];
  provenance: ParentEvidence[];
  suppression: boolean;
  needsReview: boolean;
  followUp: ParentFollowUp;
  updatedAt: string;
};

export type ParentImport = { id: string; source: ParentSource; fileName: string; importedAt: string; rows: number; matched: number; review: number; schoolReview?: number };

export type ParentImportRow = {
  source?: ParentSource;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  school?: string;
  enrolled?: boolean | null;
  emails?: string[];
  phones?: string[];
  childClass?: string;
  submittedAt?: string;
  brochure?: string;
  visioInterested?: boolean | null;
  fullName?: string;
  enrolledAnswer?: string;
  contactPreference?: string;
  selectedMeeting?: string;
  expectations?: string;
  knownVia?: string;
  aircallStatus?: string;
  aircallIncomingCalls?: string;
  aircallMissedCalls?: string;
  aircallAnsweredCalls?: string;
  aircallFirstIncoming?: string;
  aircallLastIncoming?: string;
};

export const parentSourceLabels: Record<ParentSource, string> = {
  alpha: "Compte Alpha Éducation",
  aircall: "Aircall",
  visio: "Visioconférences",
  enrolled: "Parents déjà inscrits · exclusion",
  brochure: "Demande de plaquette · formulaire",
};

export function normalizeParentEmail(value: string) {
  return value.trim().toLocaleLowerCase("fr");
}


export { normalizeParentPhone, splitParentPhones } from "./phone-normalization.js";


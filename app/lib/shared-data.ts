import { getStore } from "@netlify/blobs";
import { importedSchools } from "./imported-schools";

export type Status = "todo" | "progress" | "done";
export type Priority = "low" | "medium" | "high";
export type ObjectiveKind = "counter" | "qualitative";
export type ObjectiveStatus = "todo" | "progress" | "done";

export type CompletionNotification = {
  personId: string;
  sentAt: string;
};

export type SocialLike = {
  id: string;
  author: string;
  createdAt: string;
};

export type SocialComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  owner: string;
  assigneeId: string | null;
  startDate: string;
  endDate: string;
  estimatedHours: number | null;
  status: Status;
  priority: Priority;
  verified: boolean;
  verificationOwner: string;
  verificationComment: string;
  comments: {
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }[];
  completionNotifications: CompletionNotification[];
  createdAt: string;
};

export type RecurringTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  assigneeId: string | null;
  estimatedHours: number | null;
  priority: Priority;
  createdAt: string;
};

export type Objective = {
  id: string;
  kind: ObjectiveKind;
  title: string;
  description: string;
  targetLabel: string;
  currentValue: number | null;
  targetValue: number | null;
  startDate: string;
  endDate: string;
  status: ObjectiveStatus;
  progressNote: string;
  personIds: string[];
  createdAt: string;
};

export type SharedLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
};

export type JournalPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  personIds: string[];
  likes: SocialLike[];
  comments: SocialComment[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationAudience = "tuteurs" | "etablissements" | "parents" | "coordinateurs";
export type CommunicationStatus = "draft" | "sent" | "to-follow-up" | "cancelled";

export type MassCommunication = {
  id: string;
  title: string;
  messageSummary: string;
  audiences: CommunicationAudience[];
  channel: string;
  status: CommunicationStatus;
  sentAt: string;
  followUpDate: string;
  author: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type StaffingPersonKey = "pierre" | "julie" | "kelly";

export type StaffingDay = {
  id: string;
  date: string;
  people: Record<StaffingPersonKey, {
    staffedSessions: number;
    unstaffedSessions: number;
  }>;
  totalStaffedSessions: number;
  totalUnstaffedSessions: number;
  createdAt: string;
  updatedAt: string;
};

export type TutorReportEntry = {
  id: string;
  tutorId: string;
  lastName: string;
  firstName: string;
  phone: string;
  school: string;
  studentCount: number;
  missingReportCount: number;
  comment: string;
};

export type TutorReportSnapshot = {
  id: string;
  date: string;
  comment: string;
  entries: TutorReportEntry[];
  createdAt: string;
  updatedAt: string;
};

export type TutorReportComment = {
  tutorKey: string;
  comment: string;
  updatedAt: string;
};

export type TutorTrackingRecord = {
  key: string;
  tutorId: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  school: string;
  wantedCity: string;
};

export type TutorTrackingSnapshot = {
  id: string;
  date: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  records: TutorTrackingRecord[];
  createdAt: string;
  updatedAt: string;
};

export type TutorTrackingComment = {
  tutorKey: string;
  comment: string;
  updatedAt: string;
};

export type TutorTrackingData = {
  snapshots: TutorTrackingSnapshot[];
  comments: TutorTrackingComment[];
};

export type UnstaffedExclusions = {
  sessionIds: string[];
  sourceKeys: string[];
  updatedAt: string;
};

export type AvailabilityRow = {
  tutorId: string;
  lastName: string;
  firstName: string;
  grade: string;
  phone: string;
  date: string;
  school: string;
  className: string;
  timeSlot: string;
  sessionId: string;
  visitCount: string;
  group: string;
  studentCount: string;
  groupScore: string;
};

export type AvailabilityImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  rows: AvailabilityRow[];
  rawCsv: string;
  hasRawCsv: boolean;
  createdAt: string;
};

export type TutorAssignmentRow = {
  tutorId: string;
  firstName: string;
  lastName: string;
  grade: string;
  phone: string;
  school: string;
  category: string;
  date: string;
  timeSlot: string;
  level: string;
  absent: boolean;
};

export type TutorAssignmentImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  rows: TutorAssignmentRow[];
  createdAt: string;
};

export type UpcomingSessionRow = {
  sessionId: string;
  schoolId: string;
  school: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: string;
  group: string;
  studentCount: number;
  classes: string[];
  room: string;
};

export type UpcomingSessionSchool = {
  schoolId: string;
  name: string;
  categories: string[];
};

export type UpcomingSessionSchoolStaffing = {
  schoolId: string;
  name: string;
  date: string;
  staffedSessions: number;
  unstaffedSessions: number;
};

export type UpcomingSessionImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  sourceSessionCount: number;
  schools: UpcomingSessionSchool[];
  schoolStaffing: UpcomingSessionSchoolStaffing[];
  rows: UpcomingSessionRow[];
  createdAt: string;
};

export type ActualSessionRow = {
  sessionId: string;
  date: string;
  school: string;
};

export type ActualSessionImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  dates: string[];
  rows: ActualSessionRow[];
  createdAt: string;
};

export type TutorInterestRow = {
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
  sessionId: string;
  date: string;
  school: string;
  className: string;
  timeSlot: string;
  group: string;
  studentCount: string;
  validated: boolean;
  declaredAt: string;
};

export type TutorInterestImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  rows: TutorInterestRow[];
  createdAt: string;
};

export type TutorCoverageNoteStatus = "to-check" | "unavailable" | "confirmed" | "contacted";

export type TutorCoverageNote = {
  id: string;
  tutorId: string;
  date: string;
  status: TutorCoverageNoteStatus;
  note: string;
  updatedAt: string;
};

export type EnrollmentRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  className: string;
  school: string;
  slots: string;
};

export type EnrollmentImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  rows: EnrollmentRow[];
  createdAt: string;
};

export type SchoolWatchTag = "Nouvel établissement" | "Nouveau besoin" | "Suivi particulier";
export type SchoolWatchStatus = "active" | "resolved";

export type SchoolWatchComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export type SchoolWatchItem = {
  id: string;
  schoolId: string;
  reason: string;
  tags: SchoolWatchTag[];
  status: SchoolWatchStatus;
  comments: SchoolWatchComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
};

export type SchoolEventKind = "event" | "comment" | "action";
export type SchoolType = "alpha" | "mise-a-dispo" | "mixed";
export type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";

export type StaffingAuditClassification = "staffed" | "unstaffed" | "ambiguous";
export type StaffingAuditResolution = "" | "staffed" | "unstaffed";

export type StaffingAuditSession = {
  sessionId: string;
  date: string;
  school: string;
  portfolioOwner: SchoolPortfolioOwner;
  detectedStatus: StaffingAuditClassification;
  resolution: StaffingAuditResolution;
  treated: boolean;
  tutorNames: string[];
};

export type StaffingAuditDay = {
  date: string;
  sourceFileName: string;
  sourceRowCount: number;
  sessions: StaffingAuditSession[];
  createdAt: string;
  updatedAt: string;
};

export type SchoolEvent = {
  id: string;
  kind: SchoolEventKind;
  title: string;
  note: string;
  author: string;
  tags: string[];
  likes: SocialLike[];
  comments: SocialComment[];
  date: string;
  createdAt: string;
};

export type School = {
  id: string;
  externalId: string;
  name: string;
  category: string;
  schoolType: SchoolType;
  portfolioOwner: SchoolPortfolioOwner;
  zone: string;
  coordinator: string;
  registeredCount: number | null;
  city: string;
  address: string;
  department: string;
  upcomingWeek: string;
  pastSessions: string;
  typicalWeek: string;
  contractSigned: string;
  actions: string;
  contact: string;
  nextAction: string;
  notes: string;
  events: SchoolEvent[];
  createdAt: string;
  updatedAt: string;
};

export type StudentHistoryEntry = {
  date: string;
  value: number | null;
};

export type StudentHistoryYear = {
  year: number;
  entries: StudentHistoryEntry[];
  createdAt: string;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export type PublicPerson = Omit<Person, "email"> & {
  hasEmail: boolean;
};

const STORE_NAME = "task-tracker";
export const TASKS_KEY = "tasks.json";
export const PEOPLE_KEY = "people.json";
export const RECURRING_TASKS_KEY = "recurring-tasks.json";
export const OBJECTIVES_KEY = "objectives.json";
export const LINKS_KEY = "links.json";
export const JOURNAL_POSTS_KEY = "journal-posts.json";
export const MASS_COMMUNICATIONS_KEY = "mass-communications.json";
export const STAFFING_SESSIONS_KEY = "staffing-sessions.json";
export const TUTOR_REPORTS_KEY = "tutor-reports.json";
export const TUTOR_REPORT_COMMENTS_KEY = "tutor-report-comments.json";
export const TUTOR_TRACKING_KEY = "tutor-tracking.json";
export const AVAILABILITY_IMPORTS_KEY = "availability-imports.json";
export const TUTOR_ASSIGNMENT_IMPORTS_KEY = "tutor-assignment-imports.json";
export const UPCOMING_SESSION_IMPORTS_KEY = "upcoming-session-imports.json";
export const ACTUAL_SESSION_IMPORTS_KEY = "actual-session-imports.json";
export const STAFFING_AUDITS_KEY = "staffing-audits.json";
export const TUTOR_INTEREST_IMPORTS_KEY = "tutor-interest-imports.json";
export const TUTOR_COVERAGE_NOTES_KEY = "tutor-coverage-notes.json";
export const UNSTAFFED_EXCLUSIONS_KEY = "unstaffed-exclusions.json";
export const ENROLLMENT_IMPORTS_KEY = "enrollment-imports.json";
export const SCHOOL_WATCHLIST_KEY = "school-watchlist.json";
export const SCHOOLS_KEY = "schools.json";
export const STUDENT_HISTORY_KEY = "student-history.json";

const memory = globalThis as typeof globalThis & {
  __petitSuiviTasks?: Task[];
  __petitSuiviPeople?: Person[];
  __petitSuiviRecurringTasks?: RecurringTask[];
  __petitSuiviObjectives?: Objective[];
  __petitSuiviLinks?: SharedLink[];
  __petitSuiviJournalPosts?: JournalPost[];
  __petitSuiviMassCommunications?: MassCommunication[];
  __petitSuiviStaffingSessions?: StaffingDay[];
  __petitSuiviTutorReports?: TutorReportSnapshot[];
  __petitSuiviTutorReportComments?: TutorReportComment[];
  __petitSuiviTutorTracking?: TutorTrackingData;
  __petitSuiviAvailabilityImports?: AvailabilityImport[];
  __petitSuiviTutorAssignmentImports?: TutorAssignmentImport[];
  __petitSuiviUpcomingSessionImports?: UpcomingSessionImport[];
  __petitSuiviActualSessionImports?: ActualSessionImport[];
  __petitSuiviStaffingAudits?: StaffingAuditDay[];
  __petitSuiviTutorInterestImports?: TutorInterestImport[];
  __petitSuiviTutorCoverageNotes?: TutorCoverageNote[];
  __petitSuiviUnstaffedExclusions?: UnstaffedExclusions;
  __petitSuiviEnrollmentImports?: EnrollmentImport[];
  __petitSuiviSchoolWatchlist?: SchoolWatchItem[];
  __petitSuiviSchools?: School[];
  __petitSuiviStudentHistory?: StudentHistoryYear[];
};

const defaultObjectives: Objective[] = [
  {
    id: "objective-september-2600",
    kind: "counter",
    title: "Objectif septembre",
    description: "Mobiliser l'equipe Alpha Education autour de la rentree et garder le cap chaque semaine.",
    targetLabel: "eleves",
    currentValue: 160,
    targetValue: 2600,
    startDate: "",
    endDate: "",
    status: "progress",
    progressNote: "",
    personIds: [],
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "objective-weekly-supervision-1300",
    kind: "counter",
    title: "Seances de surveillance par semaine",
    description: "Transformer l'organisation de l'equipe en volume de seances concret chaque semaine.",
    targetLabel: "seances",
    currentValue: 130,
    targetValue: 1300,
    startDate: "",
    endDate: "",
    status: "progress",
    progressNote: "",
    personIds: [],
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

export function taskStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function canUseMemoryFallback() {
  return process.env.NODE_ENV !== "production" && process.env.NETLIFY !== "true";
}

export function publicPerson(person: Person): PublicPerson {
  const { email: _email, ...rest } = person;
  return { ...rest, hasEmail: Boolean(_email) };
}

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberFromText(value: string) {
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function cleanPositiveNumber(value: unknown, allowZero = false) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value.replace(",", "."))
        : null;
  if (parsed === null || !Number.isFinite(parsed)) return null;
  if (allowZero && parsed === 0) return 0;
  return parsed > 0 ? parsed : null;
}

function dateValueForSort(value: string) {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanYear(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : null;
  if (parsed === null || !Number.isInteger(parsed)) return new Date().getFullYear();
  return parsed >= 2000 && parsed <= 2100 ? parsed : new Date().getFullYear();
}

function campaignDates(year: number) {
  const dates: string[] = [];
  const cursor = new Date(Date.UTC(year, 7, 25));
  const end = new Date(Date.UTC(year, 8, 30));
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function isStatus(value: unknown): value is Status {
  return value === "todo" || value === "progress" || value === "done";
}

export function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

function isObjectiveKind(value: unknown): value is ObjectiveKind {
  return value === "counter" || value === "qualitative";
}

function isObjectiveStatus(value: unknown): value is ObjectiveStatus {
  return value === "todo" || value === "progress" || value === "done";
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function sanitizePerson(raw: Record<string, unknown>, existing?: Person): Person {
  const typedEmail = cleanText(raw.email).toLowerCase();
  return {
    id: cleanText(raw.id) || existing?.id || crypto.randomUUID(),
    name: cleanText(raw.name) || existing?.name || "",
    email: typedEmail ? (isEmail(typedEmail) ? typedEmail : "") : existing?.email || "",
    active: typeof raw.active === "boolean" ? raw.active : existing?.active ?? true,
    createdAt: cleanText(raw.createdAt) || existing?.createdAt || new Date().toISOString(),
  };
}

export function sanitizeTask(raw: Record<string, unknown>): Task {
  const now = new Date().toISOString();
  const rawEstimatedHours =
    typeof raw.estimatedHours === "number"
      ? raw.estimatedHours
      : typeof raw.estimatedHours === "string" && raw.estimatedHours.trim()
        ? Number(raw.estimatedHours)
        : null;
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    title: cleanText(raw.title),
    description: cleanText(raw.description),
    owner: cleanText(raw.owner),
    assigneeId: cleanText(raw.assigneeId) || null,
    startDate: cleanText(raw.startDate) || new Date().toISOString().slice(0, 10),
    endDate: cleanText(raw.endDate),
    estimatedHours:
      typeof rawEstimatedHours === "number" && Number.isFinite(rawEstimatedHours) && rawEstimatedHours > 0
        ? rawEstimatedHours
        : null,
    status: isStatus(raw.status) ? raw.status : "todo",
    priority: isPriority(raw.priority) ? raw.priority : "medium",
    verified: raw.verified === true,
    verificationOwner: cleanText(raw.verificationOwner),
    verificationComment: cleanText(raw.verificationComment),
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
          .map((comment) => ({
            id: cleanText(comment.id) || crypto.randomUUID(),
            text: cleanText(comment.text),
            author: cleanText(comment.author) || "Anonyme",
            createdAt: cleanText(comment.createdAt) || now,
          }))
          .filter((comment) => comment.text)
      : [],
    completionNotifications: Array.isArray(raw.completionNotifications)
      ? raw.completionNotifications
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map((item) => ({
            personId: cleanText(item.personId),
            sentAt: cleanText(item.sentAt) || now,
          }))
          .filter((item) => item.personId)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeRecurringTask(raw: Record<string, unknown>): RecurringTask {
  const rawEstimatedHours =
    typeof raw.estimatedHours === "number"
      ? raw.estimatedHours
      : typeof raw.estimatedHours === "string" && raw.estimatedHours.trim()
        ? Number(raw.estimatedHours)
        : null;
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    title: cleanText(raw.title),
    description: cleanText(raw.description),
    owner: cleanText(raw.owner),
    assigneeId: cleanText(raw.assigneeId) || null,
    estimatedHours:
      typeof rawEstimatedHours === "number" && Number.isFinite(rawEstimatedHours) && rawEstimatedHours > 0
        ? rawEstimatedHours
        : null,
    priority: isPriority(raw.priority) ? raw.priority : "medium",
    createdAt: cleanText(raw.createdAt) || new Date().toISOString(),
  };
}

export function sanitizeObjective(raw: Record<string, unknown>): Objective {
  const legacyTarget = numberFromText(cleanText(raw.targetLabel));
  const targetLabel = cleanText(raw.targetLabel)
    .replace(/\d+/g, "")
    .trim()
    .replace(/^\/+/, "")
    .trim();

  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    kind: isObjectiveKind(raw.kind) ? raw.kind : cleanPositiveNumber(raw.targetValue, false) || legacyTarget ? "counter" : "qualitative",
    title: cleanText(raw.title),
    description: cleanText(raw.description),
    targetLabel: targetLabel || "eleves",
    currentValue: cleanPositiveNumber(raw.currentValue, true),
    targetValue: cleanPositiveNumber(raw.targetValue, false) ?? legacyTarget,
    startDate: cleanText(raw.startDate),
    endDate: cleanText(raw.endDate),
    status: isObjectiveStatus(raw.status) ? raw.status : "progress",
    progressNote: cleanText(raw.progressNote),
    personIds: Array.isArray(raw.personIds) ? raw.personIds.map(cleanText).filter(Boolean) : [],
    createdAt: cleanText(raw.createdAt) || new Date().toISOString(),
  };
}

export function sanitizeSharedLink(raw: Record<string, unknown>): SharedLink {
  const url = cleanText(raw.url);
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    title: cleanText(raw.title),
    description: cleanText(raw.description),
    url: url.startsWith("http://") || url.startsWith("https://") ? url : url ? `https://${url}` : "",
    createdAt: cleanText(raw.createdAt) || new Date().toISOString(),
  };
}

function sanitizeSocialLike(raw: Record<string, unknown>): SocialLike {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    author: cleanText(raw.author) || "Anonyme",
    createdAt: cleanText(raw.createdAt) || now,
  };
}

function sanitizeSocialComment(raw: Record<string, unknown>): SocialComment {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    text: cleanText(raw.text),
    author: cleanText(raw.author) || "Anonyme",
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeJournalPost(raw: Record<string, unknown>): JournalPost {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    title: cleanText(raw.title),
    content: cleanText(raw.content),
    author: cleanText(raw.author) || "Equipe Alpha",
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(cleanText).filter(Boolean)
      : cleanText(raw.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    personIds: Array.isArray(raw.personIds) ? raw.personIds.map(cleanText).filter(Boolean) : [],
    likes: Array.isArray(raw.likes)
      ? raw.likes
          .filter((like): like is Record<string, unknown> => Boolean(like && typeof like === "object"))
          .map(sanitizeSocialLike)
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
          .map(sanitizeSocialComment)
          .filter((comment) => comment.text)
      : [],
    publishedAt: cleanText(raw.publishedAt) || now,
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

function isCommunicationAudience(value: unknown): value is CommunicationAudience {
  return value === "tuteurs" || value === "etablissements" || value === "parents" || value === "coordinateurs";
}

function isCommunicationStatus(value: unknown): value is CommunicationStatus {
  return value === "draft" || value === "sent" || value === "to-follow-up" || value === "cancelled";
}

export function sanitizeMassCommunication(raw: Record<string, unknown>): MassCommunication {
  const now = new Date().toISOString();
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map(cleanText).filter(Boolean)
    : cleanText(raw.tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
  const audiences = Array.isArray(raw.audiences)
    ? raw.audiences.filter(isCommunicationAudience)
    : [];

  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    title: cleanText(raw.title),
    messageSummary: cleanText(raw.messageSummary),
    audiences,
    channel: cleanText(raw.channel) || "Email",
    status: isCommunicationStatus(raw.status) ? raw.status : "sent",
    sentAt: cleanText(raw.sentAt),
    followUpDate: cleanText(raw.followUpDate),
    author: cleanText(raw.author) || "Equipe Alpha",
    notes: cleanText(raw.notes),
    tags: Array.from(new Set(tags)),
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

function cleanSessionCount(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : 0;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function sanitizeStaffingPerson(raw: unknown) {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    staffedSessions: cleanSessionCount(record.staffedSessions),
    unstaffedSessions: cleanSessionCount(record.unstaffedSessions),
  };
}

export function sanitizeStaffingDay(raw: Record<string, unknown>): StaffingDay {
  const now = new Date().toISOString();
  const people = raw.people && typeof raw.people === "object" ? (raw.people as Record<string, unknown>) : {};
  const date = cleanText(raw.date) || now.slice(0, 10);
  const sanitizedPeople = {
    pierre: sanitizeStaffingPerson(people.pierre),
    julie: sanitizeStaffingPerson(people.julie),
    kelly: sanitizeStaffingPerson(people.kelly),
  };
  const peopleTotals = Object.values(sanitizedPeople).reduce(
    (totals, person) => {
      totals.staffed += person.staffedSessions;
      totals.unstaffed += person.unstaffedSessions;
      return totals;
    },
    { staffed: 0, unstaffed: 0 },
  );

  return {
    id: cleanText(raw.id) || `staffing-${date}`,
    date,
    people: sanitizedPeople,
    totalStaffedSessions:
      raw.totalStaffedSessions === undefined || raw.totalStaffedSessions === null
        ? peopleTotals.staffed
        : cleanSessionCount(raw.totalStaffedSessions),
    totalUnstaffedSessions:
      raw.totalUnstaffedSessions === undefined || raw.totalUnstaffedSessions === null
        ? peopleTotals.unstaffed
        : cleanSessionCount(raw.totalUnstaffedSessions),
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

export function sanitizeTutorReportEntry(raw: Record<string, unknown>): TutorReportEntry {
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    tutorId: cleanText(raw.tutorId),
    lastName: cleanText(raw.lastName),
    firstName: cleanText(raw.firstName),
    phone: cleanText(raw.phone),
    school: cleanText(raw.school),
    studentCount: cleanSessionCount(raw.studentCount),
    missingReportCount: cleanSessionCount(raw.missingReportCount),
    comment: cleanText(raw.comment),
  };
}

export function sanitizeTutorReportSnapshot(raw: Record<string, unknown>): TutorReportSnapshot {
  const now = new Date().toISOString();
  const date = cleanText(raw.date) || now.slice(0, 10);
  return {
    id: cleanText(raw.id) || `tutor-reports-${date}`,
    date,
    comment: cleanText(raw.comment),
    entries: Array.isArray(raw.entries)
      ? raw.entries
          .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
          .map(sanitizeTutorReportEntry)
          .filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

export function sanitizeTutorReportComment(raw: Record<string, unknown>): TutorReportComment {
  return {
    tutorKey: cleanText(raw.tutorKey),
    comment: cleanText(raw.comment),
    updatedAt: cleanText(raw.updatedAt) || new Date().toISOString(),
  };
}

export function sanitizeTutorTrackingRecord(raw: Record<string, unknown>): TutorTrackingRecord {
  const tutorId = cleanText(raw.tutorId);
  const lastName = cleanText(raw.lastName);
  const firstName = cleanText(raw.firstName);
  const phone = cleanText(raw.phone);
  const fallbackKey = `${lastName} ${firstName} ${phone}`
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return {
    key: cleanText(raw.key) || (tutorId ? `id:${tutorId.toLocaleLowerCase("fr")}` : `name:${fallbackKey}`),
    tutorId,
    lastName,
    firstName,
    phone,
    email: cleanText(raw.email),
    school: cleanText(raw.school),
    wantedCity: cleanText(raw.wantedCity),
  };
}

export function sanitizeTutorTrackingSnapshot(raw: Record<string, unknown>): TutorTrackingSnapshot {
  const now = new Date().toISOString();
  const date = cleanText(raw.date) || now.slice(0, 10);
  return {
    id: cleanText(raw.id) || `tutor-tracking-${date}`,
    date,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || `Liste tuteurs du ${date}`,
    fileName: cleanText(raw.fileName) || "liste-tuteurs.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || (Array.isArray(raw.records) ? raw.records.length : 0))),
    records: Array.isArray(raw.records)
      ? raw.records
          .filter((record): record is Record<string, unknown> => Boolean(record && typeof record === "object"))
          .map(sanitizeTutorTrackingRecord)
          .filter((record) => record.key && (record.tutorId || record.lastName || record.firstName || record.phone || record.email))
      : [],
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

export function parseTutorTrackingCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { records: [] as TutorTrackingRecord[], sourceRowCount: 0 };
  const firstRow = csvRows[0].map(normalizedHeader);
  const hasHeader = firstRow.some((cell) => [
    "id", "idtuteur", "nom", "nomtuteur", "nomdusage", "prenom", "prenomtuteur",
    "telephone", "numerodetelephone", "email", "villesouhaitee", "villesouhaitees",
  ].includes(cell));
  const headers = hasHeader
    ? firstRow
    : ["id", "nom", "prenom", "telephone", "etablissement", "email", "villesouhaitee"];
  const dataRows = hasHeader ? csvRows.slice(1) : csvRows;
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const idIndex = indexFor(["id", "idtuteur", "tutorid", "identifiant"]);
  const lastNameIndex = indexFor(["nomtuteur", "nomdusage", "nom", "lastname", "name"]);
  const firstNameIndex = indexFor(["prenom", "prenomtuteur", "firstname"]);
  const phoneIndex = indexFor(["telephone", "numerodetelephone", "tel", "phone", "mobile"]);
  const emailIndex = indexFor(["email", "mail", "courriel"]);
  const schoolIndex = indexFor(["etablissement", "etablissements", "school", "ecole"]);
  const wantedCityIndex = indexFor(["villesouhaitees", "villesouhaitee", "villesouhaites", "villesouhaite", "ville"]);
  const byKey = new Map<string, TutorTrackingRecord>();
  dataRows.forEach((row) => {
    const record = sanitizeTutorTrackingRecord({
      tutorId: valueAt(row, idIndex),
      lastName: valueAt(row, lastNameIndex),
      firstName: valueAt(row, firstNameIndex),
      phone: valueAt(row, phoneIndex),
      email: valueAt(row, emailIndex),
      school: valueAt(row, schoolIndex),
      wantedCity: valueAt(row, wantedCityIndex),
    });
    if (record.key && (record.tutorId || record.lastName || record.firstName || record.phone || record.email)) {
      byKey.set(record.key, record);
    }
  });
  return {
    records: Array.from(byKey.values()).sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr")),
    sourceRowCount: dataRows.length,
  };
}

export function sanitizeTutorTrackingComment(raw: Record<string, unknown>): TutorTrackingComment {
  return {
    tutorKey: cleanText(raw.tutorKey),
    comment: cleanText(raw.comment),
    updatedAt: cleanText(raw.updatedAt) || new Date().toISOString(),
  };
}

export function sanitizeTutorTrackingData(raw: Record<string, unknown>): TutorTrackingData {
  return {
    snapshots: Array.isArray(raw.snapshots)
      ? raw.snapshots
          .filter((snapshot): snapshot is Record<string, unknown> => Boolean(snapshot && typeof snapshot === "object"))
          .map(sanitizeTutorTrackingSnapshot)
          .sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
          .map(sanitizeTutorTrackingComment)
          .filter((comment) => comment.tutorKey)
      : [],
  };
}

export function sanitizeUnstaffedExclusions(raw: Record<string, unknown>): UnstaffedExclusions {
  return {
    sessionIds: Array.isArray(raw.sessionIds) ? Array.from(new Set(raw.sessionIds.map(cleanText).filter(Boolean))) : [],
    sourceKeys: Array.isArray(raw.sourceKeys) ? Array.from(new Set(raw.sourceKeys.map(cleanText).filter(Boolean))) : [],
    updatedAt: cleanText(raw.updatedAt) || new Date().toISOString(),
  };
}

export function sanitizeAvailabilityRow(raw: Record<string, unknown>): AvailabilityRow {
  return {
    tutorId: cleanText(raw.tutorId),
    lastName: cleanText(raw.lastName),
    firstName: cleanText(raw.firstName),
    grade: cleanText(raw.grade),
    phone: cleanText(raw.phone),
    date: cleanText(raw.date),
    school: cleanText(raw.school),
    className: cleanText(raw.className),
    timeSlot: cleanText(raw.timeSlot),
    sessionId: cleanText(raw.sessionId),
    visitCount: cleanText(raw.visitCount),
    group: cleanText(raw.group),
    studentCount: cleanText(raw.studentCount),
    groupScore: cleanText(raw.groupScore),
  };
}

function parseCsvLine(line: string, delimiter?: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if ((delimiter ? char === delimiter : char === "," || char === ";" || char === "\t") && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function detectCsvDelimiter(value: string) {
  const firstLine = value.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiters = [";", "\t", ","];
  return delimiters
    .map((delimiter) => ({ delimiter, count: parseCsvLine(firstLine, delimiter).length }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter || ";";
}

function parseCsvRows(value: string) {
  const delimiter = detectCsvDelimiter(value);
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizedHeader(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function parseAvailabilityCsv(value: string): AvailabilityRow[] {
  const rows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!rows.length) return [];
  const firstRow = rows[0].map(normalizedHeader);
  const hasHeader = firstRow.some((cell) => ["id", "nomtuteur", "prenomtuteur", "date", "heureducreneau", "iddelaseance"].includes(cell));
  const headers = hasHeader
    ? firstRow
    : ["id", "nomtuteur", "prenomtuteur", "grade", "telephone", "date", "etablissement", "classe", "heureducreneau", "iddelaseance", "nombredevisites", "groupe", "nbreleves", "scorepourlegroupe"];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const idIndex = indexFor(["id", "idtuteur", "tutorid"]);
  const lastNameIndex = indexFor(["nomtuteur", "nom", "lastname"]);
  const firstNameIndex = indexFor(["prenomtuteur", "prenom", "firstname"]);
  const gradeIndex = indexFor(["grade"]);
  const phoneIndex = indexFor(["telephone", "tel", "phone"]);
  const dateIndex = indexFor(["date"]);
  const schoolIndex = indexFor(["etablissement", "etablissements", "school"]);
  const classIndex = indexFor(["classe", "class"]);
  const timeSlotIndex = indexFor(["heureducreneau", "heurecreneau", "creneau", "horaire"]);
  const sessionIdIndex = indexFor(["iddelaseance", "idseance", "sessionid"]);
  const visitCountIndex = indexFor(["nombredevisites", "visites", "nbvisites"]);
  const groupIndex = indexFor(["groupe", "group"]);
  const studentCountIndex = indexFor(["nbreleves", "nbeleves", "nombreeleves"]);
  const groupScoreIndex = indexFor(["scorepourlegroupe", "scoregroupe"]);
  return dataRows
    .map((row) =>
      sanitizeAvailabilityRow({
        tutorId: valueAt(row, idIndex),
        lastName: valueAt(row, lastNameIndex),
        firstName: valueAt(row, firstNameIndex),
        grade: valueAt(row, gradeIndex),
        phone: valueAt(row, phoneIndex),
        date: valueAt(row, dateIndex),
        school: valueAt(row, schoolIndex),
        className: valueAt(row, classIndex),
        timeSlot: valueAt(row, timeSlotIndex),
        sessionId: valueAt(row, sessionIdIndex),
        visitCount: valueAt(row, visitCountIndex),
        group: valueAt(row, groupIndex),
        studentCount: valueAt(row, studentCountIndex),
        groupScore: valueAt(row, groupScoreIndex),
      }),
    )
    .filter((row) => row.tutorId && row.date);
}

export function sanitizeAvailabilityImport(raw: Record<string, unknown>): AvailabilityImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Import de disponibilités",
    fileName: cleanText(raw.fileName) || "disponibilites.csv",
    rows: Array.isArray(raw.rows)
      ? raw.rows
          .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
          .map(sanitizeAvailabilityRow)
          .filter((row) => row.tutorId && row.date)
      : [],
    rawCsv: typeof raw.rawCsv === "string" ? raw.rawCsv : "",
    hasRawCsv: raw.hasRawCsv === true || (typeof raw.rawCsv === "string" && raw.rawCsv.length > 0),
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeTutorAssignmentRow(raw: Record<string, unknown>): TutorAssignmentRow {
  return {
    tutorId: cleanText(raw.tutorId),
    firstName: cleanText(raw.firstName),
    lastName: cleanText(raw.lastName),
    grade: cleanText(raw.grade),
    phone: cleanText(raw.phone),
    school: cleanText(raw.school),
    category: cleanText(raw.category),
    date: cleanText(raw.date),
    timeSlot: cleanText(raw.timeSlot),
    level: cleanText(raw.level),
    absent: raw.absent === true || ["oui", "yes", "true", "1"].includes(cleanText(raw.absent).toLocaleLowerCase("fr")),
  };
}

export function parseTutorAssignmentCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { rows: [] as TutorAssignmentRow[], sourceRowCount: 0 };
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const tutorIdIndex = indexFor(["iddututeur", "idtuteur", "id"]);
  const lastNameIndex = indexFor(["nomdututeur", "nomtuteur", "nom"]);
  const firstNameIndex = indexFor(["prenomdututeur", "prenomtuteur", "prenom"]);
  const gradeIndex = indexFor(["gradedututeur", "grade"]);
  const phoneIndex = indexFor(["numerodetelephone", "telephone", "telephoneportable"]);
  const schoolIndex = indexFor(["etablissement", "ecole"]);
  const categoryIndex = indexFor(["categorie"]);
  const dateIndex = indexFor(["datedelaprestation", "date"]);
  const timeSlotIndex = indexFor(["horairesducreneau", "heureducreneau", "creneau"]);
  const levelIndex = indexFor(["niveau", "classe"]);
  const absentIndex = indexFor(["absent", "absence"]);
  if (tutorIdIndex < 0 || dateIndex < 0 || timeSlotIndex < 0) {
    throw new Error("Colonnes tuteur, date ou horaires introuvables dans le CSV des séances affectées");
  }
  const dataRows = csvRows.slice(1);
  return {
    sourceRowCount: dataRows.length,
    rows: dataRows
      .map((row) =>
        sanitizeTutorAssignmentRow({
          tutorId: valueAt(row, tutorIdIndex),
          lastName: valueAt(row, lastNameIndex),
          firstName: valueAt(row, firstNameIndex),
          grade: valueAt(row, gradeIndex),
          phone: valueAt(row, phoneIndex),
          school: valueAt(row, schoolIndex),
          category: valueAt(row, categoryIndex),
          date: valueAt(row, dateIndex),
          timeSlot: valueAt(row, timeSlotIndex),
          level: valueAt(row, levelIndex),
          absent: valueAt(row, absentIndex),
        }),
      )
      .filter((row) => row.tutorId && row.date && row.timeSlot),
  };
}

export function sanitizeTutorAssignmentImport(raw: Record<string, unknown>): TutorAssignmentImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Séances affectées",
    fileName: cleanText(raw.fileName) || "seances-affectees.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    rows: Array.isArray(raw.rows)
      ? raw.rows
          .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
          .map(sanitizeTutorAssignmentRow)
          .filter((row) => row.tutorId && row.date && row.timeSlot)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeUpcomingSessionRow(raw: Record<string, unknown>): UpcomingSessionRow {
  return {
    sessionId: cleanText(raw.sessionId),
    schoolId: cleanText(raw.schoolId),
    school: cleanText(raw.school),
    category: cleanText(raw.category),
    date: cleanText(raw.date),
    startTime: cleanText(raw.startTime),
    endTime: cleanText(raw.endTime),
    durationHours: cleanText(raw.durationHours),
    group: cleanText(raw.group),
    studentCount: Math.max(0, Math.round(Number(raw.studentCount) || 0)),
    classes: Array.isArray(raw.classes) ? Array.from(new Set(raw.classes.map(cleanText).filter(Boolean))) : [],
    room: cleanText(raw.room),
  };
}

export function sanitizeUpcomingSessionSchool(raw: Record<string, unknown>): UpcomingSessionSchool {
  return {
    schoolId: cleanText(raw.schoolId),
    name: cleanText(raw.name),
    categories: Array.isArray(raw.categories) ? Array.from(new Set(raw.categories.map(cleanText).filter(Boolean))) : [],
  };
}

export function sanitizeUpcomingSessionSchoolStaffing(raw: Record<string, unknown>): UpcomingSessionSchoolStaffing {
  return {
    schoolId: cleanText(raw.schoolId),
    name: cleanText(raw.name),
    date: cleanText(raw.date),
    staffedSessions: Math.max(0, Math.round(Number(raw.staffedSessions) || 0)),
    unstaffedSessions: Math.max(0, Math.round(Number(raw.unstaffedSessions) || 0)),
  };
}

export function parseUpcomingSessionsCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { rows: [] as UpcomingSessionRow[], schools: [] as UpcomingSessionSchool[], schoolStaffing: [] as UpcomingSessionSchoolStaffing[], sourceRowCount: 0, sourceSessionCount: 0 };
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const schoolIdIndex = indexFor(["idecole", "idetablissement"]);
  const schoolIndex = indexFor(["ecole", "etablissement"]);
  const categoryIndex = indexFor(["categorie", "type"]);
  const dateIndex = indexFor(["date"]);
  const startIndex = indexFor(["heureducreneau", "heuredebut", "debut"]);
  const endIndex = indexFor(["heurefin", "heuredefin", "fin"]);
  const durationIndex = indexFor(["heures", "duree"]);
  const sessionIdIndex = indexFor(["idseance", "iddelaseance"]);
  const groupIndex = indexFor(["groupe"]);
  const declaredStudentCountIndex = indexFor(["nbreleves", "nombreeleves"]);
  const roomIndex = indexFor(["salle"]);
  const tutorIdIndex = indexFor(["idtuteur", "iddututeur"]);
  const studentIdIndex = indexFor(["ideleve", "iddeleve"]);
  const classIndex = indexFor(["classe"]);
  if (sessionIdIndex < 0 || schoolIndex < 0 || dateIndex < 0 || tutorIdIndex < 0) {
    throw new Error("Colonnes ID séance, établissement, date ou ID tuteur introuvables dans le CSV");
  }

  type SessionAccumulator = UpcomingSessionRow & { tutorIds: Set<string>; studentIds: Set<string>; classSet: Set<string>; declaredStudentCount: number };
  type SchoolAccumulator = UpcomingSessionSchool & { categorySet: Set<string> };
  const sessions = new Map<string, SessionAccumulator>();
  const schools = new Map<string, SchoolAccumulator>();
  const dataRows = csvRows.slice(1);
  dataRows.forEach((row) => {
    const schoolId = valueAt(row, schoolIdIndex).trim();
    const schoolName = valueAt(row, schoolIndex).trim();
    const category = valueAt(row, categoryIndex).trim();
    if (schoolName) {
      const schoolKey = schoolId || `missing:${normalizeSchoolName(schoolName)}`;
      const school = schools.get(schoolKey) ?? { schoolId, name: schoolName, categories: [], categorySet: new Set<string>() };
      if (category) school.categorySet.add(category);
      schools.set(schoolKey, school);
    }
    const sessionId = valueAt(row, sessionIdIndex).trim();
    if (!sessionId) return;
    const existing = sessions.get(sessionId) ?? {
      sessionId,
      schoolId,
      school: schoolName,
      category,
      date: valueAt(row, dateIndex),
      startTime: valueAt(row, startIndex),
      endTime: valueAt(row, endIndex),
      durationHours: valueAt(row, durationIndex),
      group: valueAt(row, groupIndex),
      studentCount: 0,
      classes: [],
      room: valueAt(row, roomIndex),
      tutorIds: new Set<string>(),
      studentIds: new Set<string>(),
      classSet: new Set<string>(),
      declaredStudentCount: 0,
    };
    const tutorId = valueAt(row, tutorIdIndex).trim();
    const studentId = valueAt(row, studentIdIndex).trim();
    const className = valueAt(row, classIndex).trim();
    if (tutorId) existing.tutorIds.add(tutorId);
    if (studentId) existing.studentIds.add(studentId);
    if (className) existing.classSet.add(className);
    existing.declaredStudentCount = Math.max(existing.declaredStudentCount, Math.round(Number(valueAt(row, declaredStudentCountIndex).replace(",", ".")) || 0));
    sessions.set(sessionId, existing);
  });

  const rows = Array.from(sessions.values())
    .filter((session) => session.date && session.school && session.tutorIds.size === 0)
    .map((session) => sanitizeUpcomingSessionRow({
      ...session,
      classes: Array.from(session.classSet).sort((a, b) => a.localeCompare(b, "fr")),
      studentCount: session.studentIds.size || session.declaredStudentCount,
    }))
    .sort((a, b) => `${a.date}-${a.startTime}-${a.school}`.localeCompare(`${b.date}-${b.startTime}-${b.school}`, "fr"));
  const schoolCatalog = Array.from(schools.values())
    .map((school) => sanitizeUpcomingSessionSchool({ ...school, categories: Array.from(school.categorySet).sort((a, b) => a.localeCompare(b, "fr")) }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const staffingBySchool = new Map<string, UpcomingSessionSchoolStaffing>();
  sessions.forEach((session) => {
    if (!session.school) return;
    const schoolKey = `${session.schoolId || `missing:${normalizeSchoolName(session.school)}`}:${session.date}`;
    const staffing = staffingBySchool.get(schoolKey) ?? { schoolId: session.schoolId, name: session.school, date: session.date, staffedSessions: 0, unstaffedSessions: 0 };
    if (session.tutorIds.size > 0) staffing.staffedSessions += 1;
    else staffing.unstaffedSessions += 1;
    staffingBySchool.set(schoolKey, staffing);
  });
  const schoolStaffing = Array.from(staffingBySchool.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return { rows, schools: schoolCatalog, schoolStaffing, sourceRowCount: dataRows.length, sourceSessionCount: sessions.size };
}

export function sanitizeUpcomingSessionImport(raw: Record<string, unknown>): UpcomingSessionImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Séances à venir",
    fileName: cleanText(raw.fileName) || "semaines-a-venir.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    sourceSessionCount: Math.max(0, Math.round(Number(raw.sourceSessionCount) || 0)),
    schools: Array.isArray(raw.schools)
      ? raw.schools.filter((school): school is Record<string, unknown> => Boolean(school && typeof school === "object")).map(sanitizeUpcomingSessionSchool).filter((school) => school.name)
      : [],
    schoolStaffing: Array.isArray(raw.schoolStaffing)
      ? raw.schoolStaffing.filter((school): school is Record<string, unknown> => Boolean(school && typeof school === "object")).map(sanitizeUpcomingSessionSchoolStaffing).filter((school) => school.name)
      : [],
    rows: Array.isArray(raw.rows)
      ? raw.rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")).map(sanitizeUpcomingSessionRow).filter((row) => row.sessionId && row.date && row.school)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeActualSessionRow(raw: Record<string, unknown>): ActualSessionRow {
  return {
    sessionId: cleanText(raw.sessionId),
    date: cleanText(raw.date),
    school: cleanText(raw.school),
  };
}

export function parseActualSessionsCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { rows: [] as ActualSessionRow[], sourceRowCount: 0 };
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const dateIndex = indexFor(["date", "datedelaprestation"]);
  const sessionIdIndex = indexFor(["semainereelle", "idseance", "iddelaseance"]);
  const schoolIndex = indexFor(["etablissement", "ecole"]);
  if (dateIndex < 0 || sessionIdIndex < 0 || schoolIndex < 0) {
    throw new Error("Colonnes Date, Semaine réelle ou Établissement introuvables dans le CSV");
  }
  const unique = new Map<string, ActualSessionRow>();
  const dataRows = csvRows.slice(1);
  dataRows.forEach((row) => {
    const parsed = sanitizeActualSessionRow({
      date: row[dateIndex] || "",
      sessionId: row[sessionIdIndex] || "",
      school: row[schoolIndex] || "",
    });
    if (!parsed.date || !parsed.sessionId) return;
    unique.set(`${parsed.date}:${parsed.sessionId}`, parsed);
  });
  return { rows: Array.from(unique.values()).sort((a, b) => `${a.date}-${a.school}-${a.sessionId}`.localeCompare(`${b.date}-${b.school}-${b.sessionId}`, "fr")), sourceRowCount: dataRows.length };
}

export function sanitizeActualSessionImport(raw: Record<string, unknown>): ActualSessionImport {
  const now = new Date().toISOString();
  const rows = Array.isArray(raw.rows)
    ? raw.rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")).map(sanitizeActualSessionRow).filter((row) => row.sessionId && row.date)
    : [];
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Semaine réelle",
    fileName: cleanText(raw.fileName) || "semaine-reelle.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    dates: Array.from(new Set(rows.map((row) => row.date))).sort(),
    rows,
    createdAt: cleanText(raw.createdAt) || now,
  };
}

function isStaffingAuditOwner(value: unknown): value is SchoolPortfolioOwner {
  return value === "" || value === "kelly" || value === "pierre" || value === "julie";
}

function isStaffingAuditClassification(value: unknown): value is StaffingAuditClassification {
  return value === "staffed" || value === "unstaffed" || value === "ambiguous";
}

function isStaffingAuditResolution(value: unknown): value is StaffingAuditResolution {
  return value === "" || value === "staffed" || value === "unstaffed";
}

export function sanitizeStaffingAuditSession(raw: Record<string, unknown>): StaffingAuditSession {
  return {
    sessionId: cleanText(raw.sessionId),
    date: cleanText(raw.date),
    school: cleanText(raw.school),
    portfolioOwner: isStaffingAuditOwner(raw.portfolioOwner) ? raw.portfolioOwner : "",
    detectedStatus: isStaffingAuditClassification(raw.detectedStatus) ? raw.detectedStatus : "ambiguous",
    resolution: isStaffingAuditResolution(raw.resolution) ? raw.resolution : "",
    treated: raw.treated === true,
    tutorNames: Array.isArray(raw.tutorNames) ? Array.from(new Set(raw.tutorNames.map(cleanText).filter(Boolean))) : [],
  };
}

export function sanitizeStaffingAuditDay(raw: Record<string, unknown>): StaffingAuditDay {
  const now = new Date().toISOString();
  return {
    date: cleanText(raw.date),
    sourceFileName: cleanText(raw.sourceFileName) || "rapports.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map(sanitizeStaffingAuditSession).filter((item) => item.sessionId && item.date)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || now,
  };
}

export function parseStaffingAuditCsv(value: string, fileName: string, schools: School[]) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return [] as StaffingAuditDay[];
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const dateIndex = indexFor(["date", "datedelaprestation"]);
  const sessionIdIndex = indexFor(["semainereelle", "idseance", "iddelaseance"]);
  const schoolIndex = indexFor(["etablissement", "ecole"]);
  const tutorFirstNameIndex = indexFor(["prenomtuteur", "prenomdututeur"]);
  const tutorLastNameIndex = indexFor(["nomtuteur", "nomdututeur"]);
  const tutorPhoneIndex = indexFor(["numerotuteur", "numerodututeur", "telephone", "numerodetelephone"]);
  if (dateIndex < 0 || sessionIdIndex < 0 || schoolIndex < 0) throw new Error("Colonnes Date, Semaine réelle ou Établissement introuvables dans le CSV");
  const ownerBySchool = new Map(schools.map((school) => [normalizeSchoolName(school.name), school.portfolioOwner]));
  type Accumulator = { sessionId: string; date: string; school: string; hasTutor: boolean; hasBlankTutor: boolean; tutorNames: Set<string> };
  const sessions = new Map<string, Accumulator>();
  const rows = csvRows.slice(1);
  rows.forEach((row) => {
    const date = cleanText(row[dateIndex]);
    const sessionId = cleanText(row[sessionIdIndex]);
    if (!date || !sessionId) return;
    const key = `${date}:${sessionId}`;
    const school = cleanText(row[schoolIndex]);
    const firstName = tutorFirstNameIndex >= 0 ? cleanText(row[tutorFirstNameIndex]) : "";
    const lastName = tutorLastNameIndex >= 0 ? cleanText(row[tutorLastNameIndex]) : "";
    const phone = tutorPhoneIndex >= 0 ? cleanText(row[tutorPhoneIndex]) : "";
    const hasTutor = Boolean(firstName || lastName || phone);
    const item = sessions.get(key) ?? { sessionId, date, school, hasTutor: false, hasBlankTutor: false, tutorNames: new Set<string>() };
    item.hasTutor ||= hasTutor;
    item.hasBlankTutor ||= !hasTutor;
    const tutorName = `${firstName} ${lastName}`.trim();
    if (tutorName) item.tutorNames.add(tutorName);
    if (!item.school && school) item.school = school;
    sessions.set(key, item);
  });
  const now = new Date().toISOString();
  const byDate = new Map<string, StaffingAuditSession[]>();
  sessions.forEach((item) => {
    const detectedStatus: StaffingAuditClassification = item.hasTutor && item.hasBlankTutor ? "ambiguous" : item.hasTutor ? "staffed" : "unstaffed";
    const session = sanitizeStaffingAuditSession({
      sessionId: item.sessionId,
      date: item.date,
      school: item.school,
      portfolioOwner: ownerBySchool.get(normalizeSchoolName(item.school)) ?? "",
      detectedStatus,
      resolution: "",
      treated: false,
      tutorNames: Array.from(item.tutorNames),
    });
    byDate.set(item.date, [...(byDate.get(item.date) ?? []), session]);
  });
  return Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySessions]) => sanitizeStaffingAuditDay({
    date,
    sourceFileName: fileName,
    sourceRowCount: rows.filter((row) => cleanText(row[dateIndex]) === date).length,
    sessions: daySessions.sort((a, b) => a.school.localeCompare(b.school, "fr") || a.sessionId.localeCompare(b.sessionId)),
    createdAt: now,
    updatedAt: now,
  }));
}

export function sanitizeTutorInterestRow(raw: Record<string, unknown>): TutorInterestRow {
  return {
    personId: cleanText(raw.personId),
    firstName: cleanText(raw.firstName),
    lastName: cleanText(raw.lastName),
    phone: cleanText(raw.phone),
    sessionId: cleanText(raw.sessionId),
    date: cleanText(raw.date),
    school: cleanText(raw.school),
    className: cleanText(raw.className),
    timeSlot: cleanText(raw.timeSlot),
    group: cleanText(raw.group),
    studentCount: cleanText(raw.studentCount),
    validated: raw.validated === true || ["oui", "yes", "true", "1", "valide", "validé"].includes(cleanText(raw.validated).toLocaleLowerCase("fr")),
    declaredAt: cleanText(raw.declaredAt),
  };
}

export function parseTutorInterestsCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { rows: [] as TutorInterestRow[], sourceRowCount: 0 };
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const personIdIndex = indexFor(["idtuteurcandidat", "idcandidat", "idtuteur", "id"]);
  const lastNameIndex = indexFor(["nom", "nomtuteur"]);
  const firstNameIndex = indexFor(["prenom", "prenomtuteur"]);
  const phoneIndex = indexFor(["telephone", "numerodetelephone"]);
  const sessionIdIndex = indexFor(["seanceid", "idseance", "iddelaseance"]);
  const dateIndex = indexFor(["dateseance", "date"]);
  const schoolIndex = indexFor(["etablissement", "ecole"]);
  const classIndex = indexFor(["classe"]);
  const timeSlotIndex = indexFor(["heureducreneau", "horaire", "creneau"]);
  const groupIndex = indexFor(["groupe"]);
  const studentCountIndex = indexFor(["nombreeleves", "nbreleves"]);
  const validatedIndex = indexFor(["valide", "validation"]);
  const createdAtIndex = indexFor(["datedecreation", "creation"]);
  if (personIdIndex < 0 || sessionIdIndex < 0 || dateIndex < 0) {
    throw new Error("Colonnes ID tuteur/candidat, Séance ID ou Date séance introuvables dans le CSV d’intérêts");
  }
  const dataRows = csvRows.slice(1);
  return {
    sourceRowCount: dataRows.length,
    rows: dataRows.map((row) => sanitizeTutorInterestRow({
      personId: valueAt(row, personIdIndex),
      lastName: valueAt(row, lastNameIndex),
      firstName: valueAt(row, firstNameIndex),
      phone: valueAt(row, phoneIndex),
      sessionId: valueAt(row, sessionIdIndex),
      date: valueAt(row, dateIndex),
      school: valueAt(row, schoolIndex),
      className: valueAt(row, classIndex),
      timeSlot: valueAt(row, timeSlotIndex),
      group: valueAt(row, groupIndex),
      studentCount: valueAt(row, studentCountIndex),
      validated: valueAt(row, validatedIndex),
      declaredAt: valueAt(row, createdAtIndex),
    })).filter((row) => row.personId && row.sessionId && row.date),
  };
}

export function sanitizeTutorInterestImport(raw: Record<string, unknown>): TutorInterestImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Intérêts tuteurs et candidats",
    fileName: cleanText(raw.fileName) || "interets-tuteurs-candidats.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    rows: Array.isArray(raw.rows)
      ? raw.rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")).map(sanitizeTutorInterestRow).filter((row) => row.personId && row.sessionId && row.date)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
  };
}

export function sanitizeTutorCoverageNote(raw: Record<string, unknown>): TutorCoverageNote {
  const status = raw.status === "unavailable" || raw.status === "confirmed" || raw.status === "contacted"
    ? raw.status
    : "to-check";
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    tutorId: cleanText(raw.tutorId),
    date: cleanText(raw.date),
    status,
    note: cleanText(raw.note),
    updatedAt: cleanText(raw.updatedAt) || new Date().toISOString(),
  };
}

export function sanitizeEnrollmentRow(raw: Record<string, unknown>): EnrollmentRow {
  return {
    studentId: cleanText(raw.studentId),
    firstName: cleanText(raw.firstName),
    lastName: cleanText(raw.lastName),
    className: cleanText(raw.className),
    school: cleanText(raw.school),
    slots: cleanText(raw.slots),
  };
}

export function parseEnrollmentCsv(value: string) {
  const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!csvRows.length) return { rows: [] as EnrollmentRow[], sourceRowCount: 0 };
  const headers = csvRows[0].map(normalizedHeader);
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const studentIdIndex = indexFor(["iddelenfant", "iddelefant", "idenfant", "studentid"]);
  const firstNameIndex = indexFor(["prenomdelenfant", "prenomenfant", "firstname"]);
  const lastNameIndex = indexFor(["nomdelenfant", "nomenfant", "lastname"]);
  const classIndex = indexFor(["classe", "class"]);
  const schoolIndex = indexFor(["ecole", "etablissement", "school"]);
  const slotsIndex = indexFor(["creneaux", "creneau", "slots"]);
  if (studentIdIndex < 0 || slotsIndex < 0) {
    throw new Error("Colonnes « Id de l’enfant » ou « Creneaux » introuvables");
  }
  const dataRows = csvRows.slice(1);
  const rows = dataRows
    .map((row) =>
      sanitizeEnrollmentRow({
        studentId: valueAt(row, studentIdIndex),
        firstName: valueAt(row, firstNameIndex),
        lastName: valueAt(row, lastNameIndex),
        className: valueAt(row, classIndex),
        school: valueAt(row, schoolIndex),
        slots: valueAt(row, slotsIndex),
      }),
    )
    .filter((row) => row.studentId && row.slots);
  return { rows, sourceRowCount: dataRows.length };
}

export function sanitizeEnrollmentImport(raw: Record<string, unknown>): EnrollmentImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Export inscriptions",
    fileName: cleanText(raw.fileName) || "parents.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
    rows: Array.isArray(raw.rows)
      ? raw.rows
          .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
          .map(sanitizeEnrollmentRow)
          .filter((row) => row.studentId && row.slots)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
  };
}

function isSchoolWatchTag(value: unknown): value is SchoolWatchTag {
  return value === "Nouvel établissement" || value === "Nouveau besoin" || value === "Suivi particulier";
}

function isSchoolWatchStatus(value: unknown): value is SchoolWatchStatus {
  return value === "active" || value === "resolved";
}

export function sanitizeSchoolWatchItem(raw: Record<string, unknown>): SchoolWatchItem {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    schoolId: cleanText(raw.schoolId),
    reason: cleanText(raw.reason),
    tags: Array.isArray(raw.tags) ? Array.from(new Set(raw.tags.filter(isSchoolWatchTag))) : [],
    status: isSchoolWatchStatus(raw.status) ? raw.status : "active",
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
          .map((comment) => ({
            id: cleanText(comment.id) || crypto.randomUUID(),
            text: cleanText(comment.text),
            author: cleanText(comment.author) || "Equipe Alpha",
            createdAt: cleanText(comment.createdAt) || now,
          }))
          .filter((comment) => comment.text)
      : [],
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
    resolvedAt: cleanText(raw.resolvedAt),
  };
}

function isSchoolEventKind(value: unknown): value is SchoolEventKind {
  return value === "event" || value === "comment" || value === "action";
}

function isSchoolType(value: unknown): value is SchoolType {
  return value === "alpha" || value === "mise-a-dispo" || value === "mixed";
}

function normalizeSchoolName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function schoolFromImport(item: (typeof importedSchools)[number]): School {
  const now = "2026-08-31T00:00:00.000Z";
  return {
    id: item.externalId ? `school-${item.externalId}` : crypto.randomUUID(),
    externalId: item.externalId,
    name: item.name,
    category: item.category,
    schoolType: item.schoolType,
    portfolioOwner: "",
    zone: item.zone,
    coordinator: item.coordinator,
    registeredCount: item.registeredCount,
    city: item.city,
    address: item.address,
    department: item.department,
    upcomingWeek: item.upcomingWeek,
    pastSessions: item.pastSessions,
    typicalWeek: item.typicalWeek,
    contractSigned: item.contractSigned,
    actions: item.actions,
    contact: item.coordinator,
    nextAction: item.actions,
    notes: "",
    events: [],
    createdAt: now,
    updatedAt: now,
  };
}

function mergeImportedSchools(schools: School[]) {
  const importedByExternalId = new Map(importedSchools.map((item) => [item.externalId, schoolFromImport(item)]));
  const importedByName = new Map(importedSchools.map((item) => [normalizeSchoolName(item.name), schoolFromImport(item)]));
  const matchedExternalIds = new Set<string>();
  const matchedNames = new Set<string>();

  const enrichedSchools = schools.map((school) => {
    const imported =
      (school.externalId ? importedByExternalId.get(school.externalId) : null) ??
      importedByName.get(normalizeSchoolName(school.name));
    if (!imported) return school;
    if (imported.externalId) matchedExternalIds.add(imported.externalId);
    matchedNames.add(normalizeSchoolName(imported.name));
    return {
      ...imported,
      ...school,
      externalId: school.externalId || imported.externalId,
      category: school.category || imported.category,
      schoolType: !school.category && school.schoolType === "mixed" ? imported.schoolType : school.schoolType,
      portfolioOwner: school.portfolioOwner,
      zone: school.zone || imported.zone,
      coordinator: school.coordinator || imported.coordinator,
      registeredCount: school.registeredCount ?? imported.registeredCount,
      city: school.city || imported.city,
      address: school.address || imported.address,
      department: school.department || imported.department,
      upcomingWeek: school.upcomingWeek || imported.upcomingWeek,
      pastSessions: school.pastSessions || imported.pastSessions,
      typicalWeek: school.typicalWeek || imported.typicalWeek,
      contractSigned: school.contractSigned || imported.contractSigned,
      actions: school.actions || imported.actions,
      contact: school.contact || imported.contact,
      nextAction: school.nextAction || imported.nextAction,
      notes: school.notes,
      events: school.events,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  });

  const knownNames = new Set(enrichedSchools.map((school) => normalizeSchoolName(school.name)).filter(Boolean));
  const missingImportedSchools = importedSchools
    .filter((item) => {
      const externalMatch = item.externalId && matchedExternalIds.has(item.externalId);
      const name = normalizeSchoolName(item.name);
      return !externalMatch && !matchedNames.has(name) && !knownNames.has(name);
    })
    .map(schoolFromImport);
  return [...enrichedSchools, ...missingImportedSchools].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export function sanitizeSchool(raw: Record<string, unknown>): School {
  const now = new Date().toISOString();
  const category = cleanText(raw.category);
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    externalId: cleanText(raw.externalId),
    name: cleanText(raw.name),
    category,
    schoolType: isSchoolType(raw.schoolType)
      ? raw.schoolType
      : category.toLocaleLowerCase("fr").includes("prestation")
        ? "mise-a-dispo"
        : category.toLocaleLowerCase("fr").includes("alpha")
          ? "alpha"
          : "mixed",
    portfolioOwner: raw.portfolioOwner === "kelly" || raw.portfolioOwner === "pierre" || raw.portfolioOwner === "julie" ? raw.portfolioOwner : "",
    zone: cleanText(raw.zone),
    coordinator: cleanText(raw.coordinator),
    registeredCount: cleanPositiveNumber(raw.registeredCount, true),
    city: cleanText(raw.city),
    address: cleanText(raw.address),
    department: cleanText(raw.department),
    upcomingWeek: cleanText(raw.upcomingWeek),
    pastSessions: cleanText(raw.pastSessions),
    typicalWeek: cleanText(raw.typicalWeek),
    contractSigned: cleanText(raw.contractSigned),
    actions: cleanText(raw.actions),
    contact: cleanText(raw.contact),
    nextAction: cleanText(raw.nextAction),
    notes: cleanText(raw.notes),
    events: Array.isArray(raw.events)
      ? raw.events
          .filter((event): event is Record<string, unknown> => Boolean(event && typeof event === "object"))
          .map((event) => ({
            id: cleanText(event.id) || crypto.randomUUID(),
            kind: isSchoolEventKind(event.kind) ? event.kind : "event",
            title: cleanText(event.title),
            note: cleanText(event.note),
            author: cleanText(event.author) || "Equipe Alpha",
            tags: Array.isArray(event.tags)
              ? event.tags.map(cleanText).filter(Boolean)
              : cleanText(event.tags)
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
            likes: Array.isArray(event.likes)
              ? event.likes
                  .filter((like): like is Record<string, unknown> => Boolean(like && typeof like === "object"))
                  .map(sanitizeSocialLike)
              : [],
            comments: Array.isArray(event.comments)
              ? event.comments
                  .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
                  .map(sanitizeSocialComment)
                  .filter((comment) => comment.text)
              : [],
            date: cleanText(event.date) || cleanText(event.createdAt) || now,
            createdAt: cleanText(event.createdAt) || now,
          }))
          .filter((event) => event.title || event.note)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [],
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
  };
}

export function sanitizeStudentHistoryYear(raw: Record<string, unknown>): StudentHistoryYear {
  const year = cleanYear(raw.year);
  const entriesByDate = new Map(
    Array.isArray(raw.entries)
      ? raw.entries
          .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
          .map((entry) => {
            const value = cleanPositiveNumber(entry.value, true);
            return [cleanText(entry.date), value] as const;
          })
          .filter(([date]) => date)
      : [],
  );

  return {
    year,
    entries: campaignDates(year).map((date) => ({
      date,
      value: entriesByDate.get(date) ?? null,
    })),
    createdAt: cleanText(raw.createdAt) || new Date().toISOString(),
  };
}

export async function readTasks() {
  try {
    const store = taskStore();
    const tasks = await store.get(TASKS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(tasks)
      ? tasks
          .filter((task): task is Record<string, unknown> => Boolean(task && typeof task === "object"))
          .map(sanitizeTask)
      : [];
  } catch {
    return memory.__petitSuiviTasks ?? [];
  }
}

export async function writeTasks(tasks: Task[]) {
  try {
    const store = taskStore();
    await store.setJSON(TASKS_KEY, tasks);
  } catch {
    memory.__petitSuiviTasks = tasks;
  }
}

export async function readPeople() {
  try {
    const store = taskStore();
    const people = await store.get(PEOPLE_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(people)
      ? people
          .filter((person): person is Record<string, unknown> => Boolean(person && typeof person === "object"))
          .map((person) => sanitizePerson(person))
          .filter((person) => person.name)
      : [];
  } catch {
    return memory.__petitSuiviPeople ?? [];
  }
}

export async function readRecurringTasks() {
  try {
    const store = taskStore();
    const recurringTasks = await store.get(RECURRING_TASKS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(recurringTasks)
      ? recurringTasks
          .filter((task): task is Record<string, unknown> => Boolean(task && typeof task === "object"))
          .map(sanitizeRecurringTask)
          .filter((task) => task.title && task.owner)
      : [];
  } catch {
    return memory.__petitSuiviRecurringTasks ?? [];
  }
}

export async function writeRecurringTasks(recurringTasks: RecurringTask[]) {
  try {
    const store = taskStore();
    await store.setJSON(RECURRING_TASKS_KEY, recurringTasks);
  } catch {
    memory.__petitSuiviRecurringTasks = recurringTasks;
  }
}

export async function readObjectives() {
  try {
    const store = taskStore();
    const objectives = await store.get(OBJECTIVES_KEY, { type: "json", consistency: "strong" });
    const savedObjectives = Array.isArray(objectives)
      ? objectives
          .filter((objective): objective is Record<string, unknown> => Boolean(objective && typeof objective === "object"))
          .map(sanitizeObjective)
          .filter((objective) => objective.title)
      : defaultObjectives;
    const savedIds = new Set(savedObjectives.map((objective) => objective.id));
    return [
      ...defaultObjectives.filter((objective) => !savedIds.has(objective.id)),
      ...savedObjectives,
    ];
  } catch {
    return memory.__petitSuiviObjectives ?? defaultObjectives;
  }
}

export async function writeObjectives(objectives: Objective[]) {
  try {
    const store = taskStore();
    await store.setJSON(OBJECTIVES_KEY, objectives);
  } catch {
    memory.__petitSuiviObjectives = objectives;
  }
}

export async function readLinks() {
  try {
    const store = taskStore();
    const links = await store.get(LINKS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(links)
      ? links
          .filter((link): link is Record<string, unknown> => Boolean(link && typeof link === "object"))
          .map(sanitizeSharedLink)
          .filter((link) => link.title && link.url)
      : [];
  } catch {
    return memory.__petitSuiviLinks ?? [];
  }
}

export async function writeLinks(links: SharedLink[]) {
  try {
    const store = taskStore();
    await store.setJSON(LINKS_KEY, links);
  } catch {
    memory.__petitSuiviLinks = links;
  }
}

export async function readJournalPosts() {
  try {
    const store = taskStore();
    const posts = await store.get(JOURNAL_POSTS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(posts)
      ? posts
          .filter((post): post is Record<string, unknown> => Boolean(post && typeof post === "object"))
          .map(sanitizeJournalPost)
          .filter((post) => post.title && post.content)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      : [];
  } catch {
    return memory.__petitSuiviJournalPosts ?? [];
  }
}

export async function writeJournalPosts(posts: JournalPost[]) {
  try {
    const store = taskStore();
    await store.setJSON(JOURNAL_POSTS_KEY, posts);
  } catch {
    memory.__petitSuiviJournalPosts = posts;
  }
}

export async function readMassCommunications() {
  try {
    const store = taskStore();
    const communications = await store.get(MASS_COMMUNICATIONS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(communications)
      ? communications
          .filter((communication): communication is Record<string, unknown> => Boolean(communication && typeof communication === "object"))
          .map(sanitizeMassCommunication)
          .filter((communication) => communication.title)
          .sort((a, b) => dateValueForSort(b.sentAt || b.followUpDate || b.createdAt) - dateValueForSort(a.sentAt || a.followUpDate || a.createdAt))
      : [];
  } catch {
    return memory.__petitSuiviMassCommunications ?? [];
  }
}

export async function writeMassCommunications(communications: MassCommunication[]) {
  try {
    const store = taskStore();
    await store.setJSON(MASS_COMMUNICATIONS_KEY, communications);
  } catch {
    memory.__petitSuiviMassCommunications = communications;
  }
}

export async function readStaffingSessions() {
  try {
    const store = taskStore();
    const staffing = await store.get(STAFFING_SESSIONS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(staffing)
      ? staffing
          .filter((day): day is Record<string, unknown> => Boolean(day && typeof day === "object"))
          .map(sanitizeStaffingDay)
          .sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date))
      : [];
  } catch {
    return memory.__petitSuiviStaffingSessions ?? [];
  }
}

export async function writeStaffingSessions(staffing: StaffingDay[]) {
  try {
    const store = taskStore();
    await store.setJSON(STAFFING_SESSIONS_KEY, staffing);
  } catch {
    memory.__petitSuiviStaffingSessions = staffing;
  }
}

export async function readTutorReports() {
  try {
    const store = taskStore();
    const reports = await store.get(TUTOR_REPORTS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(reports)
      ? reports
          .filter((snapshot): snapshot is Record<string, unknown> => Boolean(snapshot && typeof snapshot === "object"))
          .map(sanitizeTutorReportSnapshot)
          .sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date))
      : [];
  } catch {
    return memory.__petitSuiviTutorReports ?? [];
  }
}

export async function writeTutorReports(reports: TutorReportSnapshot[]) {
  try {
    const store = taskStore();
    await store.setJSON(TUTOR_REPORTS_KEY, reports);
  } catch {
    memory.__petitSuiviTutorReports = reports;
  }
}

export async function readTutorReportComments() {
  try {
    const store = taskStore();
    const comments = await store.get(TUTOR_REPORT_COMMENTS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(comments)
      ? comments
          .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
          .map(sanitizeTutorReportComment)
          .filter((comment) => comment.tutorKey)
      : [];
  } catch {
    return memory.__petitSuiviTutorReportComments ?? [];
  }
}

export async function writeTutorReportComments(comments: TutorReportComment[]) {
  try {
    const store = taskStore();
    await store.setJSON(TUTOR_REPORT_COMMENTS_KEY, comments);
  } catch {
    memory.__petitSuiviTutorReportComments = comments;
  }
}

export async function readTutorTracking() {
  try {
    const store = taskStore();
    const tracking = await store.get(TUTOR_TRACKING_KEY, { type: "json", consistency: "strong" });
    return tracking && typeof tracking === "object"
      ? sanitizeTutorTrackingData(tracking as Record<string, unknown>)
      : { snapshots: [], comments: [] };
  } catch {
    return memory.__petitSuiviTutorTracking ?? { snapshots: [], comments: [] };
  }
}

export async function writeTutorTracking(tracking: TutorTrackingData) {
  const sanitizedTracking = sanitizeTutorTrackingData(tracking as unknown as Record<string, unknown>);
  try {
    const store = taskStore();
    await store.setJSON(TUTOR_TRACKING_KEY, sanitizedTracking);
  } catch {
    memory.__petitSuiviTutorTracking = sanitizedTracking;
  }
}

export async function createTutorTrackingSnapshotFromCsv(input: { date: string; fileName: string; rawCsv: string }) {
  const date = cleanText(input.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("La date liée à l’import est invalide");
  const { records, sourceRowCount } = parseTutorTrackingCsv(input.rawCsv);
  if (!records.length) throw new Error("Aucun tuteur valide trouvé dans ce CSV");
  const now = new Date().toISOString();
  const tracking = await readTutorTracking();
  const existing = tracking.snapshots.find((snapshot) => snapshot.date === date);
  const fileName = cleanText(input.fileName) || "liste-tuteurs.csv";
  const snapshot = sanitizeTutorTrackingSnapshot({
    id: existing?.id || `tutor-tracking-${date}`,
    date,
    displayName: existing?.displayName || fileName.replace(/\.[^.]+$/, "") || `Liste tuteurs du ${date}`,
    fileName,
    sourceRowCount,
    records,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  const nextTracking = sanitizeTutorTrackingData({
    ...tracking,
    snapshots: [snapshot, ...tracking.snapshots.filter((item) => item.date !== date)],
  } as unknown as Record<string, unknown>);
  await writeTutorTracking(nextTracking);
  return { snapshot, tracking: nextTracking, replaced: Boolean(existing) };
}

export async function updateTutorTrackingSnapshotName(id: string, displayName: string) {
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  const tracking = await readTutorTracking();
  if (!tracking.snapshots.some((snapshot) => snapshot.id === id)) throw new Error("Import introuvable");
  const nextTracking = sanitizeTutorTrackingData({
    ...tracking,
    snapshots: tracking.snapshots.map((snapshot) => snapshot.id === id ? { ...snapshot, displayName: cleanedName } : snapshot),
  } as unknown as Record<string, unknown>);
  await writeTutorTracking(nextTracking);
  return nextTracking;
}

export async function readUnstaffedExclusions() {
  try {
    const store = taskStore();
    const exclusions = await store.get(UNSTAFFED_EXCLUSIONS_KEY, { type: "json", consistency: "strong" });
    return exclusions && typeof exclusions === "object"
      ? sanitizeUnstaffedExclusions(exclusions as Record<string, unknown>)
      : { sessionIds: [], sourceKeys: [], updatedAt: "" };
  } catch {
    return memory.__petitSuiviUnstaffedExclusions ?? { sessionIds: [], sourceKeys: [], updatedAt: "" };
  }
}

export async function writeUnstaffedExclusions(exclusions: UnstaffedExclusions) {
  const sanitized = sanitizeUnstaffedExclusions(exclusions as unknown as Record<string, unknown>);
  try {
    const store = taskStore();
    await store.setJSON(UNSTAFFED_EXCLUSIONS_KEY, sanitized);
  } catch {
    memory.__petitSuiviUnstaffedExclusions = sanitized;
  }
  return sanitized;
}

export async function readAvailabilityImports() {
  try {
    const store = taskStore();
    const imports = await store.get(AVAILABILITY_IMPORTS_KEY, { type: "json", consistency: "strong" });
    if (!Array.isArray(imports)) return [];
    const sanitizedImports = imports
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map(sanitizeAvailabilityImport);
    const hydratedImports = await Promise.all(
      sanitizedImports.map(async (item) => {
        if (item.rows.length > 0) return { ...item, rawCsv: "", hasRawCsv: item.hasRawCsv || Boolean(item.rawCsv) };
        const rows = await store.get(availabilityRowsKey(item.id), { type: "json", consistency: "strong" });
        return {
          ...item,
          rows: Array.isArray(rows)
            ? rows
                .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
                .map(sanitizeAvailabilityRow)
                .filter((row) => row.tutorId && row.date)
            : [],
          rawCsv: "",
        };
      }),
    );
    return hydratedImports.sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviAvailabilityImports ?? [];
  }
}

export async function writeAvailabilityImports(imports: AvailabilityImport[]) {
  const sanitizedImports = imports.map((item) => sanitizeAvailabilityImport(item as unknown as Record<string, unknown>));
  try {
    const store = taskStore();
    await Promise.all(
      sanitizedImports.map((item) =>
        Promise.all([
          item.rawCsv ? store.set(availabilityRawKey(item.id), item.rawCsv) : Promise.resolve(),
          store.setJSON(availabilityRowsKey(item.id), item.rows),
        ]),
      ),
    );
    await store.setJSON(
      AVAILABILITY_IMPORTS_KEY,
      sanitizedImports.map((item) => ({ ...item, rows: [], rawCsv: "", hasRawCsv: item.hasRawCsv || Boolean(item.rawCsv) })),
    );
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviAvailabilityImports = sanitizedImports;
  }
}

function availabilityRawKey(id: string) {
  return `availability-imports/${id}.csv`;
}

function availabilityRowsKey(id: string) {
  return `availability-imports/${id}.rows.json`;
}

async function readAvailabilityIndex() {
  const store = taskStore();
  const imports = await store.get(AVAILABILITY_IMPORTS_KEY, { type: "json", consistency: "strong" });
  return Array.isArray(imports)
    ? imports
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map(sanitizeAvailabilityImport)
        .sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
    : [];
}

export async function readAvailabilityImportSummaries() {
  return (await readAvailabilityIndex()).map((item) => ({ ...item, rows: [], rawCsv: "" }));
}

export async function createAvailabilityImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const rows = parseAvailabilityCsv(input.rawCsv);
  if (!rows.length) throw new Error("Aucune disponibilité valide dans ce CSV");
  const nextImport = sanitizeAvailabilityImport({
    id: crypto.randomUUID(),
    importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Import de disponibilités",
    fileName: input.fileName || "disponibilites.csv",
    rows,
    rawCsv: input.rawCsv,
    hasRawCsv: true,
    createdAt: now,
  });
  const store = taskStore();
  await store.set(availabilityRawKey(nextImport.id), input.rawCsv);
  await store.setJSON(availabilityRowsKey(nextImport.id), rows);
  const existingImports = await readAvailabilityIndex();
  const nextIndex = [
    { ...nextImport, rows: [], rawCsv: "", hasRawCsv: true },
    ...existingImports.filter((item) => item.id !== nextImport.id).map((item) => ({ ...item, rows: [], rawCsv: "" })),
  ].sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  await store.setJSON(AVAILABILITY_IMPORTS_KEY, nextIndex);
  return { ...nextImport, rawCsv: "" };
}

export async function updateAvailabilityImportName(id: string, displayName: string) {
  const store = taskStore();
  const existingImports = await readAvailabilityIndex();
  const matchingImport = existingImports.find((item) => item.id === id);
  if (!matchingImport) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  const nextImports = existingImports.map((item) =>
    item.id === id ? { ...item, displayName: cleanedName, rows: [], rawCsv: "" } : { ...item, rows: [], rawCsv: "" },
  );
  await store.setJSON(AVAILABILITY_IMPORTS_KEY, nextImports);
  return { ...matchingImport, displayName: cleanedName };
}

export async function deleteAvailabilityImportById(id: string) {
  const store = taskStore();
  const existingImports = await readAvailabilityIndex();
  await store.setJSON(AVAILABILITY_IMPORTS_KEY, existingImports.filter((item) => item.id !== id).map((item) => ({ ...item, rows: [], rawCsv: "" })));
  await Promise.all([store.delete(availabilityRawKey(id)), store.delete(availabilityRowsKey(id))]);
}

export async function readAvailabilityRawCsv(id: string) {
  const store = taskStore();
  const rawCsv = await store.get(availabilityRawKey(id), { type: "text", consistency: "strong" });
  if (rawCsv) return rawCsv;
  const legacyImport = (await readAvailabilityIndex()).find((item) => item.id === id);
  return legacyImport?.rawCsv || "";
}

function tutorAssignmentRowsKey(id: string) {
  return `tutor-assignment-imports/${id}.rows.json`;
}

async function readTutorAssignmentIndex() {
  const store = taskStore();
  const imports = await store.get(TUTOR_ASSIGNMENT_IMPORTS_KEY, { type: "json", consistency: "strong" });
  return Array.isArray(imports)
    ? imports
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map(sanitizeTutorAssignmentImport)
        .sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
    : [];
}

export async function readTutorAssignmentImportSummaries() {
  return (await readTutorAssignmentIndex()).map((item) => ({ ...item, rows: [] }));
}

export async function readTutorAssignmentImports() {
  try {
    const store = taskStore();
    const imports = await readTutorAssignmentIndex();
    const hydrated = await Promise.all(
      imports.map(async (item) => {
        if (item.rows.length) return item;
        const rows = await store.get(tutorAssignmentRowsKey(item.id), { type: "json", consistency: "strong" });
        return {
          ...item,
          rows: Array.isArray(rows)
            ? rows
                .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
                .map(sanitizeTutorAssignmentRow)
                .filter((row) => row.tutorId && row.date && row.timeSlot)
            : [],
        };
      }),
    );
    return hydrated.sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviTutorAssignmentImports ?? [];
  }
}

export async function createTutorAssignmentImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const parsed = parseTutorAssignmentCsv(input.rawCsv);
  if (!parsed.rows.length) throw new Error("Aucune séance affectée valide dans ce CSV");
  const nextImport = sanitizeTutorAssignmentImport({
    id: crypto.randomUUID(),
    importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Séances affectées",
    fileName: input.fileName || "seances-affectees.csv",
    sourceRowCount: parsed.sourceRowCount,
    rows: parsed.rows,
    createdAt: now,
  });
  try {
    const store = taskStore();
    await store.setJSON(tutorAssignmentRowsKey(nextImport.id), nextImport.rows);
    const existing = await readTutorAssignmentIndex();
    await store.setJSON(
      TUTOR_ASSIGNMENT_IMPORTS_KEY,
      [{ ...nextImport, rows: [] }, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({ ...item, rows: [] }))],
    );
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviTutorAssignmentImports = [nextImport, ...(memory.__petitSuiviTutorAssignmentImports ?? [])];
  }
  return nextImport;
}

export async function updateTutorAssignmentImportName(id: string, displayName: string) {
  const store = taskStore();
  const existing = await readTutorAssignmentIndex();
  if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  await store.setJSON(
    TUTOR_ASSIGNMENT_IMPORTS_KEY,
    existing.map((item) => (item.id === id ? { ...item, displayName: cleanedName, rows: [] } : { ...item, rows: [] })),
  );
}

export async function deleteTutorAssignmentImportById(id: string) {
  const store = taskStore();
  const existing = await readTutorAssignmentIndex();
  await store.setJSON(TUTOR_ASSIGNMENT_IMPORTS_KEY, existing.filter((item) => item.id !== id).map((item) => ({ ...item, rows: [] })));
  await store.delete(tutorAssignmentRowsKey(id));
}

function upcomingSessionRowsKey(id: string) {
  return `upcoming-session-imports/${id}.rows.json`;
}

async function readUpcomingSessionIndex() {
  const store = taskStore();
  const imports = await store.get(UPCOMING_SESSION_IMPORTS_KEY, { type: "json", consistency: "strong" });
  return Array.isArray(imports)
    ? imports.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map(sanitizeUpcomingSessionImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
    : [];
}

export async function readUpcomingSessionImportSummaries() {
  try {
    return (await readUpcomingSessionIndex()).map((item) => ({ ...item, rows: [] }));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return (memory.__petitSuiviUpcomingSessionImports ?? []).map((item) => ({ ...item, rows: [] }));
  }
}

export async function readUpcomingSessionImports() {
  try {
    const store = taskStore();
    const imports = await readUpcomingSessionIndex();
    const hydrated = await Promise.all(imports.map(async (item) => {
      if (item.rows.length) return item;
      const rows = await store.get(upcomingSessionRowsKey(item.id), { type: "json", consistency: "strong" });
      return { ...item, rows: Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")).map(sanitizeUpcomingSessionRow).filter((row) => row.sessionId && row.date && row.school) : [] };
    }));
    return hydrated.sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviUpcomingSessionImports ?? [];
  }
}

export async function readLatestUpcomingSessionImport() {
  try {
    const store = taskStore();
    const [latest] = await readUpcomingSessionIndex();
    if (!latest) return null;
    if (latest.rows.length) return latest;
    const rows = await store.get(upcomingSessionRowsKey(latest.id), { type: "json", consistency: "strong" });
    return {
      ...latest,
      rows: Array.isArray(rows)
        ? rows
            .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
            .map(sanitizeUpcomingSessionRow)
            .filter((row) => row.sessionId && row.date && row.school)
        : [],
    };
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return (memory.__petitSuiviUpcomingSessionImports ?? [])[0] ?? null;
  }
}

export async function createUpcomingSessionImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const parsed = parseUpcomingSessionsCsv(input.rawCsv);
  if (!parsed.rows.length && !parsed.schools.length) throw new Error("Aucune séance ni aucun établissement valide trouvé dans ce CSV");
  const nextImport = sanitizeUpcomingSessionImport({
    id: crypto.randomUUID(),
    importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Séances à venir",
    fileName: input.fileName || "semaines-a-venir.csv",
    sourceRowCount: parsed.sourceRowCount,
    sourceSessionCount: parsed.sourceSessionCount,
    schools: parsed.schools,
    schoolStaffing: parsed.schoolStaffing,
    rows: parsed.rows,
    createdAt: now,
  });
  try {
    const store = taskStore();
    await store.setJSON(upcomingSessionRowsKey(nextImport.id), nextImport.rows);
    const existing = await readUpcomingSessionIndex();
    await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, [{ ...nextImport, rows: [] }, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({ ...item, rows: [] }))]);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviUpcomingSessionImports = [nextImport, ...(memory.__petitSuiviUpcomingSessionImports ?? [])];
  }
  return nextImport;
}

export async function updateUpcomingSessionImportName(id: string, displayName: string) {
  const store = taskStore();
  const existing = await readUpcomingSessionIndex();
  if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, existing.map((item) => item.id === id ? { ...item, displayName: cleanedName, rows: [] } : { ...item, rows: [] }));
}

export async function deleteUpcomingSessionImportById(id: string) {
  const store = taskStore();
  const existing = await readUpcomingSessionIndex();
  await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, existing.filter((item) => item.id !== id).map((item) => ({ ...item, rows: [] })));
  await store.delete(upcomingSessionRowsKey(id));
}

export async function readActualSessionImports() {
  try {
    const store = taskStore();
    const imports = await store.get(ACTUAL_SESSION_IMPORTS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(imports)
      ? imports.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map(sanitizeActualSessionImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
      : [];
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviActualSessionImports ?? [];
  }
}

export async function readActualSessionImportSummaries() {
  return (await readActualSessionImports()).map((item) => ({ ...item, rows: [] }));
}

export async function createActualSessionImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const parsed = parseActualSessionsCsv(input.rawCsv);
  if (!parsed.rows.length) throw new Error("Aucun ID valide trouvé dans la colonne Semaine réelle");
  const nextImport = sanitizeActualSessionImport({
    id: crypto.randomUUID(),
    importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Semaine réelle",
    fileName: input.fileName || "semaine-reelle.csv",
    sourceRowCount: parsed.sourceRowCount,
    rows: parsed.rows,
    createdAt: now,
  });
  try {
    const store = taskStore();
    const existing = await readActualSessionImports();
    await store.setJSON(ACTUAL_SESSION_IMPORTS_KEY, [nextImport, ...existing.filter((item) => item.id !== nextImport.id)]);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviActualSessionImports = [nextImport, ...(memory.__petitSuiviActualSessionImports ?? [])];
  }
  return nextImport;
}

export async function updateActualSessionImportName(id: string, displayName: string) {
  const existing = await readActualSessionImports();
  if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  const store = taskStore();
  await store.setJSON(ACTUAL_SESSION_IMPORTS_KEY, existing.map((item) => item.id === id ? { ...item, displayName: cleanedName } : item));
}

export async function deleteActualSessionImportById(id: string) {
  const existing = await readActualSessionImports();
  const store = taskStore();
  await store.setJSON(ACTUAL_SESSION_IMPORTS_KEY, existing.filter((item) => item.id !== id));
}

export async function readStaffingAudits() {
  try {
    const store = taskStore();
    const data = await store.get(STAFFING_AUDITS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(data)
      ? data.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map(sanitizeStaffingAuditDay).filter((item) => item.date).sort((a, b) => b.date.localeCompare(a.date))
      : [];
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviStaffingAudits ?? [];
  }
}

export async function saveStaffingAudit(day: StaffingAuditDay, overwrite: boolean) {
  const prepared = sanitizeStaffingAuditDay(day as unknown as Record<string, unknown>);
  if (!prepared.date || !prepared.sessions.length) throw new Error("Journée de staffing invalide");
  const existing = await readStaffingAudits();
  const previous = existing.find((item) => item.date === prepared.date);
  if (previous && !overwrite) return { conflict: true, days: existing };
  const now = new Date().toISOString();
  const saved = { ...prepared, createdAt: previous?.createdAt || now, updatedAt: now };
  const next = [saved, ...existing.filter((item) => item.date !== saved.date)].sort((a, b) => b.date.localeCompare(a.date));
  try {
    const store = taskStore();
    await store.setJSON(STAFFING_AUDITS_KEY, next);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviStaffingAudits = next;
  }
  return { conflict: false, day: saved, days: next };
}

export async function updateStaffingAuditSession(input: { date: string; sessionId: string; portfolioOwner?: unknown; resolution?: unknown; treated?: unknown }) {
  const existing = await readStaffingAudits();
  const day = existing.find((item) => item.date === input.date);
  if (!day) throw new Error("Bilan introuvable");
  if (!day.sessions.some((item) => item.sessionId === input.sessionId)) throw new Error("Séance introuvable");
  const sessions = day.sessions.map((session) => session.sessionId === input.sessionId ? {
    ...session,
    portfolioOwner: input.portfolioOwner === undefined ? session.portfolioOwner : isStaffingAuditOwner(input.portfolioOwner) ? input.portfolioOwner : session.portfolioOwner,
    resolution: input.resolution === undefined ? session.resolution : isStaffingAuditResolution(input.resolution) ? input.resolution : session.resolution,
    treated: input.treated === undefined ? session.treated : input.treated === true,
  } : session);
  return saveStaffingAudit({ ...day, sessions, updatedAt: new Date().toISOString() }, true);
}

function tutorInterestRowsKey(id: string) {
  return `tutor-interest-imports/${id}.rows.json`;
}

async function readTutorInterestIndex() {
  const store = taskStore();
  const imports = await store.get(TUTOR_INTEREST_IMPORTS_KEY, { type: "json", consistency: "strong" });
  return Array.isArray(imports)
    ? imports.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map(sanitizeTutorInterestImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
    : [];
}

export async function readTutorInterestImportSummaries() {
  try {
    return (await readTutorInterestIndex()).map((item) => ({ ...item, rows: [] }));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return (memory.__petitSuiviTutorInterestImports ?? []).map((item) => ({ ...item, rows: [] }));
  }
}

export async function readTutorInterestImports() {
  try {
    const store = taskStore();
    const imports = await readTutorInterestIndex();
    const hydrated = await Promise.all(imports.map(async (item) => {
      if (item.rows.length) return item;
      const rows = await store.get(tutorInterestRowsKey(item.id), { type: "json", consistency: "strong" });
      return { ...item, rows: Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")).map(sanitizeTutorInterestRow).filter((row) => row.personId && row.sessionId && row.date) : [] };
    }));
    return hydrated.sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviTutorInterestImports ?? [];
  }
}

export async function createTutorInterestImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const parsed = parseTutorInterestsCsv(input.rawCsv);
  if (!parsed.rows.length) throw new Error("Aucune déclaration d’intérêt valide dans ce CSV");
  const nextImport = sanitizeTutorInterestImport({
    id: crypto.randomUUID(), importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Intérêts tuteurs et candidats",
    fileName: input.fileName || "interets-tuteurs-candidats.csv",
    sourceRowCount: parsed.sourceRowCount, rows: parsed.rows, createdAt: now,
  });
  try {
    const store = taskStore();
    await store.setJSON(tutorInterestRowsKey(nextImport.id), nextImport.rows);
    const existing = await readTutorInterestIndex();
    await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, [{ ...nextImport, rows: [] }, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({ ...item, rows: [] }))]);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviTutorInterestImports = [nextImport, ...(memory.__petitSuiviTutorInterestImports ?? [])];
  }
  return nextImport;
}

export async function updateTutorInterestImportName(id: string, displayName: string) {
  const store = taskStore();
  const existing = await readTutorInterestIndex();
  if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, existing.map((item) => item.id === id ? { ...item, displayName: cleanedName, rows: [] } : { ...item, rows: [] }));
}

export async function deleteTutorInterestImportById(id: string) {
  const store = taskStore();
  const existing = await readTutorInterestIndex();
  await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, existing.filter((item) => item.id !== id).map((item) => ({ ...item, rows: [] })));
  await store.delete(tutorInterestRowsKey(id));
}

export async function readTutorCoverageNotes() {
  try {
    const store = taskStore();
    const notes = await store.get(TUTOR_COVERAGE_NOTES_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(notes)
      ? notes
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map(sanitizeTutorCoverageNote)
          .filter((item) => item.tutorId && item.date)
      : [];
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviTutorCoverageNotes ?? [];
  }
}

export async function upsertTutorCoverageNote(input: Record<string, unknown>) {
  const nextNote = sanitizeTutorCoverageNote({ ...input, updatedAt: new Date().toISOString() });
  if (!nextNote.tutorId || !nextNote.date) throw new Error("Tuteur ou date manquant");
  const notes = await readTutorCoverageNotes();
  const nextNotes = [nextNote, ...notes.filter((item) => !(item.tutorId === nextNote.tutorId && item.date === nextNote.date))];
  try {
    const store = taskStore();
    await store.setJSON(TUTOR_COVERAGE_NOTES_KEY, nextNotes);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviTutorCoverageNotes = nextNotes;
  }
  return nextNote;
}

function enrollmentRowsKey(id: string) {
  return `enrollment-imports/${id}.rows.json`;
}

async function readEnrollmentIndex() {
  const store = taskStore();
  const imports = await store.get(ENROLLMENT_IMPORTS_KEY, { type: "json", consistency: "strong" });
  return Array.isArray(imports)
    ? imports
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map(sanitizeEnrollmentImport)
        .sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
    : [];
}

export async function readEnrollmentImportSummaries() {
  return (await readEnrollmentIndex()).map((item) => ({ ...item, rows: [] }));
}

export async function readEnrollmentImports() {
  try {
    const store = taskStore();
    const imports = await readEnrollmentIndex();
    const hydrated = await Promise.all(
      imports.map(async (item) => {
        if (item.rows.length) return item;
        const rows = await store.get(enrollmentRowsKey(item.id), { type: "json", consistency: "strong" });
        return {
          ...item,
          rows: Array.isArray(rows)
            ? rows
                .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
                .map(sanitizeEnrollmentRow)
                .filter((row) => row.studentId && row.slots)
            : [],
        };
      }),
    );
    return hydrated.sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    return memory.__petitSuiviEnrollmentImports ?? [];
  }
}

export async function createEnrollmentImportFromCsv(input: { fileName: string; rawCsv: string }) {
  const now = new Date().toISOString();
  const parsed = parseEnrollmentCsv(input.rawCsv);
  if (!parsed.rows.length) throw new Error("Aucun élève avec des créneaux dans ce CSV");
  const nextImport = sanitizeEnrollmentImport({
    id: crypto.randomUUID(),
    importedAt: now,
    displayName: input.fileName.replace(/\.[^.]+$/, "") || "Export inscriptions",
    fileName: input.fileName || "parents.csv",
    sourceRowCount: parsed.sourceRowCount,
    rows: parsed.rows,
    createdAt: now,
  });
  try {
    const store = taskStore();
    await store.setJSON(enrollmentRowsKey(nextImport.id), nextImport.rows);
    const existing = await readEnrollmentIndex();
    const nextIndex = [
      { ...nextImport, rows: [] },
      ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({ ...item, rows: [] })),
    ].sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
    await store.setJSON(ENROLLMENT_IMPORTS_KEY, nextIndex);
  } catch (error) {
    if (!canUseMemoryFallback()) throw error;
    memory.__petitSuiviEnrollmentImports = [nextImport, ...(memory.__petitSuiviEnrollmentImports ?? [])];
  }
  return nextImport;
}

export async function updateEnrollmentImportName(id: string, displayName: string) {
  const store = taskStore();
  const existing = await readEnrollmentIndex();
  const matching = existing.find((item) => item.id === id);
  if (!matching) throw new Error("Import introuvable");
  const cleanedName = cleanText(displayName);
  if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
  await store.setJSON(
    ENROLLMENT_IMPORTS_KEY,
    existing.map((item) => (item.id === id ? { ...item, displayName: cleanedName, rows: [] } : { ...item, rows: [] })),
  );
}

export async function deleteEnrollmentImportById(id: string) {
  const store = taskStore();
  const existing = await readEnrollmentIndex();
  await store.setJSON(ENROLLMENT_IMPORTS_KEY, existing.filter((item) => item.id !== id).map((item) => ({ ...item, rows: [] })));
  await store.delete(enrollmentRowsKey(id));
}

export async function readSchoolWatchlist() {
  try {
    const store = taskStore();
    const watchlist = await store.get(SCHOOL_WATCHLIST_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(watchlist)
      ? watchlist
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map(sanitizeSchoolWatchItem)
          .filter((item) => item.schoolId && item.reason)
          .sort((a, b) => dateValueForSort(b.updatedAt || b.createdAt) - dateValueForSort(a.updatedAt || a.createdAt))
      : [];
  } catch {
    return memory.__petitSuiviSchoolWatchlist ?? [];
  }
}

export async function writeSchoolWatchlist(watchlist: SchoolWatchItem[]) {
  try {
    const store = taskStore();
    await store.setJSON(SCHOOL_WATCHLIST_KEY, watchlist);
  } catch {
    memory.__petitSuiviSchoolWatchlist = watchlist;
  }
}

export async function readSchools() {
  try {
    const store = taskStore();
    const schools = await store.get(SCHOOLS_KEY, { type: "json", consistency: "strong" });
    const savedSchools = Array.isArray(schools)
      ? schools
          .filter((school): school is Record<string, unknown> => Boolean(school && typeof school === "object"))
          .map(sanitizeSchool)
          .filter((school) => school.name)
          .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      : [];
    return mergeImportedSchools(savedSchools);
  } catch {
    return mergeImportedSchools(memory.__petitSuiviSchools ?? []);
  }
}

export async function writeSchools(schools: School[]) {
  try {
    const store = taskStore();
    await store.setJSON(SCHOOLS_KEY, schools);
  } catch {
    memory.__petitSuiviSchools = schools;
  }
}

export async function readStudentHistory() {
  try {
    const store = taskStore();
    const history = await store.get(STUDENT_HISTORY_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(history)
      ? history
          .filter((year): year is Record<string, unknown> => Boolean(year && typeof year === "object"))
          .map(sanitizeStudentHistoryYear)
          .sort((a, b) => b.year - a.year)
      : [];
  } catch {
    return memory.__petitSuiviStudentHistory ?? [];
  }
}

export async function writeStudentHistory(history: StudentHistoryYear[]) {
  try {
    const store = taskStore();
    await store.setJSON(STUDENT_HISTORY_KEY, history);
  } catch {
    memory.__petitSuiviStudentHistory = history;
  }
}

export async function writePeople(people: Person[]) {
  try {
    const store = taskStore();
    await store.setJSON(PEOPLE_KEY, people);
  } catch {
    memory.__petitSuiviPeople = people;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDuration(hours: number | null) {
  if (!hours) return "non renseignee";
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${wholeHours} h ${minutes} min` : `${wholeHours} h`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ASSIGNMENT_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: "missing-config" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(process.env.ASSIGNMENT_REPLY_TO_EMAIL ? { reply_to: process.env.ASSIGNMENT_REPLY_TO_EMAIL } : {}),
    }),
  });

  return { sent: response.ok, reason: response.ok ? "sent" : "send-failed" };
}

function taskUrl() {
  return process.env.URL || "";
}

export async function notifyAssignment(task: Task, person: Person, openTasks: Task[]) {
  if (!person.email) return { sent: false, reason: "missing-email" };
  const otherTasks = openTasks.filter(
    (item) => item.status !== "done" && item.id !== task.id && item.assigneeId === person.id,
  );
  const reminders = otherTasks.length
    ? `<h3>Vos autres taches non terminees</h3><ul>${otherTasks
        .map((item) => `<li>${escapeHtml(item.title)}</li>`)
        .join("")}</ul>`
    : "";
  const link = taskUrl() ? `<p><a href="${escapeHtml(taskUrl())}">Ouvrir le suivi des taches</a></p>` : "";

  return sendEmail(
    person.email,
    `Nouvelle tache assignee : ${task.title}`,
    `<h2>${escapeHtml(task.title)}</h2>
     <p>${escapeHtml(task.description || "Aucune description.")}</p>
     <p><strong>Responsable :</strong> ${escapeHtml(task.owner)}</p>
     <p><strong>Duree estimee :</strong> ${escapeHtml(formatDuration(task.estimatedHours))}</p>
     <p><strong>Priorite :</strong> ${escapeHtml(task.priority)}</p>
     ${reminders}
     ${link}`,
  );
}

export async function notifyCompletion(task: Task, people: Person[]) {
  const link = taskUrl() ? `<p><a href="${escapeHtml(taskUrl())}">Ouvrir le suivi des taches</a></p>` : "";
  const html = `<h1>La tache est terminee</h1>
    <p>Bonjour,</p>
    <p>La tache suivante vient d'etre marquee comme terminee :</p>
    <h2>${escapeHtml(task.title)}</h2>
    <p>${escapeHtml(task.description || "Aucune description.")}</p>
    <p><strong>Statut :</strong> terminee</p>
    <p><strong>Responsable :</strong> ${escapeHtml(task.owner)}</p>
    <p><strong>Duree estimee :</strong> ${escapeHtml(formatDuration(task.estimatedHours))}</p>
    <p><strong>Periode :</strong> ${escapeHtml(task.endDate || task.startDate)}</p>
    <p><strong>Priorite :</strong> ${escapeHtml(task.priority)}</p>
    ${link}`;

  const results = await Promise.all(
    people.map(async (person) => ({
      personId: person.id,
      ...(await sendEmail(person.email, `La tache est terminee : ${task.title}`, html)),
    })),
  );

  return results;
}

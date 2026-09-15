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
  fileName: string;
  rows: AvailabilityRow[];
  rawCsv: string;
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

export function sanitizeAvailabilityImport(raw: Record<string, unknown>): AvailabilityImport {
  const now = new Date().toISOString();
  return {
    id: cleanText(raw.id) || crypto.randomUUID(),
    importedAt: cleanText(raw.importedAt) || now,
    fileName: cleanText(raw.fileName) || "disponibilites.csv",
    rows: Array.isArray(raw.rows)
      ? raw.rows
          .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
          .map(sanitizeAvailabilityRow)
          .filter((row) => row.tutorId && row.date)
      : [],
    rawCsv: typeof raw.rawCsv === "string" ? raw.rawCsv : "",
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

export async function readAvailabilityImports() {
  try {
    const store = taskStore();
    const imports = await store.get(AVAILABILITY_IMPORTS_KEY, { type: "json", consistency: "strong" });
    return Array.isArray(imports)
      ? imports
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          .map(sanitizeAvailabilityImport)
          .sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt))
      : [];
  } catch {
    return memory.__petitSuiviAvailabilityImports ?? [];
  }
}

export async function writeAvailabilityImports(imports: AvailabilityImport[]) {
  const sanitizedImports = imports.map((item) => sanitizeAvailabilityImport(item as unknown as Record<string, unknown>));
  try {
    const store = taskStore();
    await store.setJSON(AVAILABILITY_IMPORTS_KEY, sanitizedImports);
  } catch (error) {
    if (process.env.NETLIFY === "true") throw error;
    memory.__petitSuiviAvailabilityImports = sanitizedImports;
  }
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

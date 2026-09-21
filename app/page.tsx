"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EnrollmentComparison from "@/app/components/enrollment-comparison";
import FilesHub from "@/app/components/files-hub";
import TutorCoverageComparison from "@/app/components/tutor-coverage-comparison";
import UnstaffedSessions from "@/app/components/unstaffed-sessions";
import TutorAvailabilityFeed from "@/app/components/tutor-availability-feed";
import SchoolAdminLink from "@/app/components/school-admin-link";
import PersonAdminLink from "@/app/components/person-admin-link";
import HomeDashboard, { type HomeDestination } from "@/app/components/home-dashboard";
import StaffingAudit from "@/app/components/staffing-audit";
import StaffingEvolution from "@/app/components/staffing-evolution";
import type { TutorAssignmentImport, TutorAssignmentRow, TutorInterestImport, TutorInterestRow, UnstaffedExclusions } from "@/app/lib/shared-data";

type Status = "todo" | "progress" | "done";
type Priority = "low" | "medium" | "high";
type Density = "compact" | "comfortable";
type AppMode = "dashboard" | "tasks" | "recurring" | "links" | "objectives" | "history" | "journal" | "schools" | "communications" | "staffing" | "staffingAudit" | "staffingEvolution" | "watchlist" | "tutorReports" | "tutors" | "availability" | "availabilityFeed" | "enrollments" | "coverage" | "unstaffed" | "files";
type ViewMode = "list" | "matrix";
type DurationBucket = "short" | "medium" | "long" | "unset";
type ObjectiveKind = "counter" | "qualitative";
type ObjectiveStatus = "todo" | "progress" | "done";
type CommunicationAudience = "tuteurs" | "etablissements" | "parents" | "coordinateurs";
type CommunicationStatus = "draft" | "sent" | "to-follow-up" | "cancelled";
type StaffingPersonKey = "pierre" | "julie" | "kelly";

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

type SocialLike = {
  id: string;
  author: string;
  createdAt: string;
};

type SocialComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

type CompletionNotification = {
  personId: string;
  sentAt: string;
};

type Task = {
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
  comments: Comment[];
  completionNotifications: CompletionNotification[];
  createdAt: string;
};

type RecurringTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  assigneeId: string | null;
  estimatedHours: number | null;
  priority: Priority;
  createdAt: string;
};

type Objective = {
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

type SharedLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
};

type JournalPost = {
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

type MassCommunication = {
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

type StaffingPersonStats = {
  staffedSessions: number;
  unstaffedSessions: number;
};

type StaffingDay = {
  id: string;
  date: string;
  people: Record<StaffingPersonKey, StaffingPersonStats>;
  totalStaffedSessions: number;
  totalUnstaffedSessions: number;
  createdAt: string;
  updatedAt: string;
};

type TutorReportEntry = {
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

type TutorReportSnapshot = {
  id: string;
  date: string;
  comment: string;
  entries: TutorReportEntry[];
  createdAt: string;
  updatedAt: string;
};

type TutorReportComment = {
  tutorKey: string;
  comment: string;
  updatedAt: string;
};

type TutorTrackingRecord = {
  key: string;
  tutorId: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  school: string;
  wantedCity: string;
};

type TutorTrackingSnapshot = {
  id: string;
  date: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  records: TutorTrackingRecord[];
  createdAt: string;
  updatedAt: string;
};

type TutorTrackingComment = {
  tutorKey: string;
  comment: string;
  updatedAt: string;
};

type TutorTrackingData = {
  snapshots: TutorTrackingSnapshot[];
  comments: TutorTrackingComment[];
};

type AvailabilityRow = {
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

type AvailabilityImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  rows: AvailabilityRow[];
  rawCsv: string;
  hasRawCsv: boolean;
  createdAt: string;
};

type AvailabilitySource = "availability" | "interest";
type AvailabilityPersonStatus = "tutor" | "candidate" | "unknown";

type AvailabilityOpportunity = {
  date: string;
  school: string;
  className: string;
  timeSlot: string;
  sessionId: string;
  group: string;
  sources: AvailabilitySource[];
  validatedInterest: boolean;
};

type AvailabilityTutor = {
  tutorId: string;
  lastName: string;
  firstName: string;
  phone: string;
  grade: string;
  rows: AvailabilityOpportunity[];
  status: AvailabilityPersonStatus;
};

type AvailabilityComparisonView = "new" | "lost" | "same";

type TutorTrackingSummary = TutorTrackingRecord & {
  firstSeen: string;
  lastSeen: string;
  seenCount: number;
  isCurrent: boolean;
};

type TutorReportAggregate = {
  key: string;
  tutorId: string;
  lastName: string;
  firstName: string;
  phone: string;
  schools: string[];
  dates: {
    date: string;
    school: string;
    studentCount: number;
    missingReportCount: number;
    comment: string;
  }[];
  dateCount: number;
  totalMissing: number;
  totalStudents: number;
};

type SchoolWatchTag = "Nouvel établissement" | "Nouveau besoin" | "Suivi particulier";
type SchoolWatchStatus = "active" | "resolved";
type WatchlistFilter = "active" | "resolved" | "all" | SchoolWatchTag;

type SchoolWatchComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

type SchoolWatchItem = {
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

type SchoolEventKind = "event" | "comment" | "action";
type SchoolType = "alpha" | "mise-a-dispo" | "mixed";
type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";
type SchoolFilter = "all" | SchoolType | "with-posts" | "without-posts";

type SchoolEvent = {
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

type School = {
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

type StudentHistoryEntry = {
  date: string;
  value: number | null;
};

type StudentHistoryYear = {
  year: number;
  entries: StudentHistoryEntry[];
  createdAt: string;
};

type Person = {
  id: string;
  name: string;
  active: boolean;
  hasEmail: boolean;
  createdAt: string;
};

type PersonDraft = {
  id: string | null;
  name: string;
  email: string;
  active: boolean;
};

type TaskDraft = Omit<Task, "id" | "comments" | "completionNotifications" | "createdAt">;
type RecurringDraft = Omit<RecurringTask, "id" | "createdAt">;
type ObjectiveDraft = Omit<Objective, "id" | "createdAt">;
type LinkDraft = Omit<SharedLink, "id" | "createdAt">;
type JournalDraft = Omit<JournalPost, "id" | "createdAt" | "updatedAt" | "likes" | "comments">;
type CommunicationDraft = Omit<MassCommunication, "id" | "createdAt" | "updatedAt">;
type SchoolWatchDraft = Omit<SchoolWatchItem, "id" | "comments" | "createdAt" | "updatedAt" | "resolvedAt"> & {
  initialComment: string;
  author: string;
};
type SchoolDraft = Omit<School, "id" | "events" | "createdAt" | "updatedAt">;
type SchoolEventDraft = Omit<SchoolEvent, "id" | "createdAt" | "likes" | "comments">;

type CrmFeedItem = {
  school: School;
  event: SchoolEvent;
};

const AUTHOR_KEY = "petit-suivi-auteur-v2";
const DENSITY_KEY = "petit-suivi-densite-v2";

const appModeSlugs: Record<AppMode, string> = {
  dashboard: "accueil",
  tasks: "taches",
  recurring: "recurrences",
  links: "liens",
  objectives: "objectifs",
  history: "historique",
  journal: "journal",
  schools: "etablissements",
  communications: "communications",
  staffing: "staffing",
  staffingAudit: "bilan-staffing",
  staffingEvolution: "evolution-staffing",
  watchlist: "a-suivre",
  tutorReports: "bilans-tuteurs",
  tutors: "tuteurs",
  availability: "comparaison-dispos",
  availabilityFeed: "fil-disponibilites",
  enrollments: "comparaison-inscriptions",
  coverage: "couverture-tuteurs",
  unstaffed: "seances-non-affectees",
  files: "fichiers",
};

const appModeAliases: Record<string, AppMode> = {
  accueil: "dashboard",
  home: "dashboard",
  dashboard: "dashboard",
  taches: "tasks",
  tâches: "tasks",
  tasks: "tasks",
  liens: "links",
  links: "links",
  objectifs: "objectives",
  objectives: "objectives",
  historique: "history",
  history: "history",
  journal: "journal",
  etablissements: "schools",
  établissements: "schools",
  schools: "schools",
  communications: "communications",
  staffing: "staffing",
  "bilan-staffing": "staffingAudit",
  "historique-staffing": "staffingAudit",
  "evolution-staffing": "staffingEvolution",
  "comparaison-staffing": "staffingEvolution",
  "bilans-tuteurs": "tutorReports",
  bilans: "tutorReports",
  tuteurs: "tutors",
  "suivi-tuteurs": "tutors",
  tutors: "tutors",
  disponibilites: "availability",
  disponibilités: "availability",
  "comparaison-dispos": "availability",
  "comparaison-disponibilites": "availability",
  "comparaison-disponibilités": "availability",
  availability: "availability",
  "fil-disponibilites": "availabilityFeed",
  "fil-disponibilités": "availabilityFeed",
  "disponibilites-du-jour": "availabilityFeed",
  inscriptions: "enrollments",
  "comparaison-inscriptions": "enrollments",
  parents: "enrollments",
  couverture: "coverage",
  "couverture-tuteurs": "coverage",
  affectations: "coverage",
  "seances-non-affectees": "unstaffed",
  "séances-non-affectées": "unstaffed",
  "a-staffer": "unstaffed",
  unstaffed: "unstaffed",
  fichiers: "files",
  files: "files",
  tutorreports: "tutorReports",
  tutorReports: "tutorReports",
  "tutor-reports": "tutorReports",
  "a-suivre": "watchlist",
  "à-suivre": "watchlist",
  suivis: "watchlist",
  watchlist: "watchlist",
};

function normalizeUrlToken(value: string | null) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function tutorIdentityKey(entry: Pick<TutorReportEntry, "tutorId" | "lastName" | "firstName" | "phone">) {
  const explicitId = entry.tutorId.trim();
  if (explicitId) return `id:${explicitId.toLocaleLowerCase("fr")}`;
  return `name:${`${entry.lastName} ${entry.firstName} ${entry.phone}`
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function tutorDisplayName(entry: Pick<TutorReportEntry, "firstName" | "lastName" | "tutorId">) {
  return `${entry.firstName} ${entry.lastName}`.trim() || entry.tutorId || "Tuteur sans nom";
}

function tutorTrackingKey(record: Pick<TutorTrackingRecord, "tutorId" | "lastName" | "firstName" | "phone" | "email">) {
  const explicitId = record.tutorId.trim();
  if (explicitId) return `id:${explicitId.toLocaleLowerCase("fr")}`;
  const fallback = `${record.lastName} ${record.firstName} ${record.phone || record.email}`
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `name:${fallback}`;
}

function tutorTrackingDisplayName(record: Pick<TutorTrackingRecord, "firstName" | "lastName" | "tutorId" | "email">) {
  return `${record.firstName} ${record.lastName}`.trim() || record.tutorId || record.email || "Tuteur sans nom";
}

function appModeFromUrl(url: URL) {
  const fromSearch = normalizeUrlToken(url.searchParams.get("onglet") || url.searchParams.get("tab"));
  const fromHash = normalizeUrlToken(url.hash.replace(/^#/, ""));
  return appModeAliases[fromSearch] || appModeAliases[fromHash] || null;
}

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  owner: "",
  assigneeId: null,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  estimatedHours: null,
  status: "todo",
  priority: "medium",
  verified: false,
  verificationOwner: "",
  verificationComment: "",
};

const emptyPersonDraft: PersonDraft = {
  id: null,
  name: "",
  email: "",
  active: true,
};

const emptyRecurringDraft: RecurringDraft = {
  title: "",
  description: "",
  owner: "",
  assigneeId: null,
  estimatedHours: null,
  priority: "medium",
};

const emptyObjectiveDraft: ObjectiveDraft = {
  kind: "counter",
  title: "",
  description: "",
  targetLabel: "élèves",
  currentValue: null,
  targetValue: null,
  startDate: "",
  endDate: "",
  status: "progress",
  progressNote: "",
  personIds: [],
};

const emptyQualitativeObjectiveDraft: ObjectiveDraft = {
  kind: "qualitative",
  title: "",
  description: "",
  targetLabel: "",
  currentValue: null,
  targetValue: null,
  startDate: "",
  endDate: "",
  status: "progress",
  progressNote: "",
  personIds: [],
};

const emptyLinkDraft: LinkDraft = {
  title: "",
  description: "",
  url: "",
};

const emptyJournalDraft: JournalDraft = {
  title: "",
  content: "",
  author: "",
  tags: [],
  personIds: [],
  publishedAt: new Date().toISOString().slice(0, 10),
};

const emptyCommunicationDraft: CommunicationDraft = {
  title: "",
  messageSummary: "",
  audiences: [],
  channel: "Email",
  status: "sent",
  sentAt: new Date().toISOString().slice(0, 10),
  followUpDate: "",
  author: "",
  notes: "",
  tags: [],
};

const emptySchoolWatchDraft: SchoolWatchDraft = {
  schoolId: "",
  reason: "",
  tags: [],
  status: "active",
  initialComment: "",
  author: "",
};

const emptySchoolDraft: SchoolDraft = {
  externalId: "",
  name: "",
  category: "",
  schoolType: "alpha",
  portfolioOwner: "",
  zone: "",
  coordinator: "",
  registeredCount: null,
  city: "",
  address: "",
  department: "",
  upcomingWeek: "",
  pastSessions: "",
  typicalWeek: "",
  contractSigned: "",
  actions: "",
  contact: "",
  nextAction: "",
  notes: "",
};

const emptySchoolEventDraft: SchoolEventDraft = {
  kind: "action",
  title: "",
  note: "",
  author: "",
  tags: [],
  date: new Date().toISOString().slice(0, 10),
};

const schoolEventKindLabels: Record<SchoolEventKind, string> = {
  event: "Événement",
  comment: "Commentaire",
  action: "Action réalisée",
};

const schoolTypeLabels: Record<SchoolType, string> = {
  alpha: "Étude Alpha",
  "mise-a-dispo": "Mise à disposition",
  mixed: "Mixte / autre",
};

const schoolPortfolioOwnerLabels: Record<SchoolPortfolioOwner, string> = {
  "": "Non attribué",
  kelly: "Kelly",
  pierre: "Pierre",
  julie: "Julie",
};
const schoolPortfolioOwnerEmails: Record<SchoolPortfolioOwner, string> = {
  "": "",
  kelly: "kelly@etudealpha.fr",
  pierre: "pierre@etudealpha.fr",
  julie: "julie@etudealpha.fr",
};

const communicationAudienceLabels: Record<CommunicationAudience, string> = {
  tuteurs: "Tuteurs",
  etablissements: "Établissements",
  parents: "Parents",
  coordinateurs: "Coordinateurs",
};

const communicationStatusLabels: Record<CommunicationStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  "to-follow-up": "À relancer",
  cancelled: "Annulé",
};

const communicationAudiences: CommunicationAudience[] = ["tuteurs", "etablissements", "parents", "coordinateurs"];
const communicationStatuses: ("all" | CommunicationStatus)[] = ["all", "sent", "to-follow-up", "draft", "cancelled"];
const communicationChannels = ["Email", "WhatsApp", "Téléphone", "Réunion", "Autre"];
const staffingPeople: { key: StaffingPersonKey; label: string }[] = [
  { key: "pierre", label: "Pierre" },
  { key: "julie", label: "Julie" },
  { key: "kelly", label: "Kelly" },
];
const schoolWatchTags: SchoolWatchTag[] = ["Nouvel établissement", "Nouveau besoin", "Suivi particulier"];
const schoolWatchStatusLabels: Record<SchoolWatchStatus, string> = {
  active: "Actif",
  resolved: "Résolu",
};

const crmTagSuggestions = [
  "Problème à résoudre",
  "Communication envoyée",
  "Mécontentement signalé",
  "Contentement signalé",
  "Relance à faire",
  "Rendez-vous prévu",
  "Décision prise",
  "Information importante",
  "Contrat / administratif",
  "Inscription / élèves",
  "Surveillance / séances",
  "Besoins mis à jour",
];

const statusLabels: Record<Status, string> = {
  todo: "A faire",
  progress: "En cours",
  done: "Terminee",
};

const objectiveStatusLabels: Record<ObjectiveStatus, string> = {
  todo: "A preparer",
  progress: "En cours",
  done: "Atteint",
};

const priorityLabels: Record<Priority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

const priorityRank: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const matrixPriorities: Priority[] = ["high", "medium", "low"];

const durationBuckets: { value: DurationBucket; label: string; hint: string }[] = [
  { value: "short", label: "Courte", hint: "≤ 1 h" },
  { value: "medium", label: "Moyenne", hint: "1 h à 4 h" },
  { value: "long", label: "Longue", hint: "> 4 h" },
  { value: "unset", label: "Sans durée", hint: "à préciser" },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function numberFromText(value: string) {
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizePositiveNumber(value: unknown, allowZero = false) {
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

function formatObjectiveNumber(value: number | null) {
  if (value === null) return "";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);
}

function objectiveProgressPercent(objective: Objective | null) {
  if (!objective?.targetValue || objective.targetValue <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor(((objective.currentValue ?? 0) / objective.targetValue) * 100)));
}

function objectiveNextStep(objective: Objective) {
  const current = objective.currentValue ?? 0;
  const target = objective.targetValue ?? 0;
  if (!target || target <= 0 || current >= target) return { nextPercent: 100, missing: 0 };
  const currentPercent = objectiveProgressPercent(objective);
  const nextPercent = Math.min(100, currentPercent + 1);
  return {
    nextPercent,
    missing: Math.max(0, Math.ceil((target * nextPercent) / 100 - current)),
  };
}

function normalizeUrl(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  return clean.startsWith("http://") || clean.startsWith("https://") ? clean : `https://${clean}`;
}

function normalizeSharedLink(raw: Partial<SharedLink>): SharedLink {
  return {
    id: raw.id || uid("link"),
    title: raw.title || "",
    description: raw.description || "",
    url: normalizeUrl(raw.url || ""),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizeTags(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(
    new Set(
      source
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

function excerpt(value: string, maxLength = 180) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}…`;
}

function formatJournalDate(value: string) {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function normalizeJournalPost(raw: Partial<JournalPost>): JournalPost {
  const now = new Date().toISOString();
  return {
    id: raw.id || uid("journal"),
    title: raw.title || "",
    content: raw.content || "",
    author: raw.author || "Equipe Alpha",
    tags: normalizeTags(raw.tags),
    personIds: Array.isArray(raw.personIds) ? raw.personIds.filter(Boolean) : [],
    likes: Array.isArray(raw.likes)
      ? raw.likes.map((like) => ({
          id: like.id || uid("like"),
          author: like.author || "Anonyme",
          createdAt: like.createdAt || now,
        }))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .map((comment) => ({
            id: comment.id || uid("social-comment"),
            text: comment.text || "",
            author: comment.author || "Anonyme",
            createdAt: comment.createdAt || now,
          }))
          .filter((comment) => comment.text.trim())
      : [],
    publishedAt: raw.publishedAt || now,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizeMassCommunication(raw: Partial<MassCommunication>): MassCommunication {
  const now = new Date().toISOString();
  return {
    id: raw.id || uid("communication"),
    title: raw.title || "",
    messageSummary: raw.messageSummary || "",
    audiences: Array.isArray(raw.audiences)
      ? raw.audiences.filter((audience): audience is CommunicationAudience => communicationAudiences.includes(audience as CommunicationAudience))
      : [],
    channel: raw.channel || "Email",
    status:
      raw.status === "draft" || raw.status === "sent" || raw.status === "to-follow-up" || raw.status === "cancelled"
        ? raw.status
        : "sent",
    sentAt: raw.sentAt || "",
    followUpDate: raw.followUpDate || "",
    author: raw.author || "Equipe Alpha",
    notes: raw.notes || "",
    tags: normalizeTags(raw.tags),
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizeSessionCount(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : 0;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function normalizeStaffingPerson(raw: Partial<StaffingPersonStats> | undefined): StaffingPersonStats {
  return {
    staffedSessions: normalizeSessionCount(raw?.staffedSessions),
    unstaffedSessions: normalizeSessionCount(raw?.unstaffedSessions),
  };
}

function staffingPeopleTotals(people: Record<StaffingPersonKey, StaffingPersonStats>) {
  return staffingPeople.reduce(
    (totals, person) => {
      totals.staffed += people[person.key].staffedSessions;
      totals.unstaffed += people[person.key].unstaffedSessions;
      return totals;
    },
    { staffed: 0, unstaffed: 0 },
  );
}

function staffingDayTotals(day: StaffingDay) {
  return {
    staffed: normalizeSessionCount(day.totalStaffedSessions),
    unstaffed: normalizeSessionCount(day.totalUnstaffedSessions),
  };
}

function staffingUnstaffedPercent(staffed: number, unstaffed: number) {
  const total = staffed + unstaffed;
  if (total <= 0) return 0;
  return Math.round((unstaffed / total) * 100);
}

function normalizeStaffingDay(raw: Partial<StaffingDay>): StaffingDay {
  const now = new Date().toISOString();
  const date = raw.date || now.slice(0, 10);
  const people = {
    pierre: normalizeStaffingPerson(raw.people?.pierre),
    julie: normalizeStaffingPerson(raw.people?.julie),
    kelly: normalizeStaffingPerson(raw.people?.kelly),
  };
  const peopleTotals = staffingPeopleTotals(people);
  return {
    id: raw.id || `staffing-${date}`,
    date,
    people,
    totalStaffedSessions:
      raw.totalStaffedSessions === undefined || raw.totalStaffedSessions === null
        ? peopleTotals.staffed
        : normalizeSessionCount(raw.totalStaffedSessions),
    totalUnstaffedSessions:
      raw.totalUnstaffedSessions === undefined || raw.totalUnstaffedSessions === null
        ? peopleTotals.unstaffed
        : normalizeSessionCount(raw.totalUnstaffedSessions),
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizeTutorReportEntry(
  raw: Partial<Omit<TutorReportEntry, "studentCount" | "missingReportCount">> & {
    studentCount?: unknown;
    missingReportCount?: unknown;
  },
): TutorReportEntry {
  return {
    id: raw.id || uid("tutor-report-entry"),
    tutorId: raw.tutorId || "",
    lastName: raw.lastName || "",
    firstName: raw.firstName || "",
    phone: raw.phone || "",
    school: raw.school || "",
    studentCount: normalizeSessionCount(raw.studentCount),
    missingReportCount: normalizeSessionCount(raw.missingReportCount),
    comment: raw.comment || "",
  };
}

function normalizeTutorReportSnapshot(raw: Partial<TutorReportSnapshot>): TutorReportSnapshot {
  const now = new Date().toISOString();
  const date = raw.date || now.slice(0, 10);
  return {
    id: raw.id || `tutor-reports-${date}`,
    date,
    comment: raw.comment || "",
    entries: Array.isArray(raw.entries)
      ? raw.entries.map(normalizeTutorReportEntry).filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school)
      : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizeTutorReportComment(raw: Partial<TutorReportComment>): TutorReportComment {
  return {
    tutorKey: raw.tutorKey || "",
    comment: raw.comment || "",
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function normalizeTutorTrackingRecord(raw: Partial<TutorTrackingRecord>): TutorTrackingRecord {
  const record = {
    key: raw.key || "",
    tutorId: raw.tutorId || "",
    lastName: raw.lastName || "",
    firstName: raw.firstName || "",
    phone: raw.phone || "",
    email: raw.email || "",
    school: raw.school || "",
    wantedCity: raw.wantedCity || "",
  };
  return {
    ...record,
    key: record.key || tutorTrackingKey(record),
  };
}

function normalizeTutorTrackingSnapshot(raw: Partial<TutorTrackingSnapshot>): TutorTrackingSnapshot {
  const now = new Date().toISOString();
  const date = raw.date || now.slice(0, 10);
  return {
    id: raw.id || `tutor-tracking-${date}`,
    date,
    displayName: raw.displayName || raw.fileName || `Liste tuteurs du ${date}`,
    fileName: raw.fileName || "liste-tuteurs.csv",
    sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || (Array.isArray(raw.records) ? raw.records.length : 0))),
    records: Array.isArray(raw.records)
      ? raw.records
          .map(normalizeTutorTrackingRecord)
          .filter((record) => record.key !== "name:" && (record.tutorId || record.lastName || record.firstName || record.phone || record.email))
      : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizeTutorTrackingComment(raw: Partial<TutorTrackingComment>): TutorTrackingComment {
  return {
    tutorKey: raw.tutorKey || "",
    comment: raw.comment || "",
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function normalizeTutorTrackingData(raw: Partial<TutorTrackingData>): TutorTrackingData {
  return {
    snapshots: Array.isArray(raw.snapshots)
      ? raw.snapshots.map(normalizeTutorTrackingSnapshot).sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date) || sortDateValue(b.createdAt) - sortDateValue(a.createdAt))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments.map(normalizeTutorTrackingComment).filter((comment) => comment.tutorKey)
      : [],
  };
}

function normalizeAvailabilityRow(raw: Partial<AvailabilityRow>): AvailabilityRow {
  return {
    tutorId: raw.tutorId || "",
    lastName: raw.lastName || "",
    firstName: raw.firstName || "",
    grade: raw.grade || "",
    phone: raw.phone || "",
    date: raw.date || "",
    school: raw.school || "",
    className: raw.className || "",
    timeSlot: raw.timeSlot || "",
    sessionId: raw.sessionId || "",
    visitCount: raw.visitCount || "",
    group: raw.group || "",
    studentCount: raw.studentCount || "",
    groupScore: raw.groupScore || "",
  };
}

function normalizeAvailabilityImport(raw: Partial<AvailabilityImport>): AvailabilityImport {
  const now = new Date().toISOString();
  return {
    id: raw.id || uid("availability"),
    importedAt: raw.importedAt || now,
    displayName: raw.displayName || raw.fileName?.replace(/\.[^.]+$/, "") || "Import de disponibilités",
    fileName: raw.fileName || "disponibilites.csv",
    rows: Array.isArray(raw.rows)
      ? raw.rows.map(normalizeAvailabilityRow).filter((row) => row.tutorId && row.date)
      : [],
    rawCsv: raw.rawCsv || "",
    hasRawCsv: raw.hasRawCsv === true || Boolean(raw.rawCsv),
    createdAt: raw.createdAt || now,
  };
}

function availabilityTutorName(tutor: Pick<AvailabilityTutor, "firstName" | "lastName" | "tutorId">) {
  return `${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId || "Tuteur sans nom";
}

function availabilitySourceKey(input: { sessionId: string; personId: string; source: AvailabilitySource; date: string; school: string; timeSlot: string }) {
  if (input.sessionId) return `${input.sessionId}:${input.personId.trim()}:${input.source}`;
  return ["comparison", input.source, input.personId.trim(), input.date, normalizedSchoolLookupName(input.school), input.timeSlot].map((part) => encodeURIComponent(part)).join("|");
}

function groupAvailabilityPeople(input: {
  availabilityRows: AvailabilityRow[];
  interestRows: TutorInterestRow[];
  date: string;
  sources: AvailabilitySource[];
  exclusions: Set<string>;
  tutorIds: Set<string> | null;
}) {
  const byTutor = new Map<string, AvailabilityTutor>();
  const add = (person: { id: string; lastName: string; firstName: string; phone: string; grade: string }, row: Omit<AvailabilityOpportunity, "sources" | "validatedInterest">, source: AvailabilitySource, validatedInterest = false) => {
    const personId = person.id.trim();
    if (!personId || row.date !== input.date || !input.sources.includes(source)) return;
    const exclusionKey = availabilitySourceKey({ sessionId: row.sessionId, personId, source, date: row.date, school: row.school, timeSlot: row.timeSlot });
    if (input.exclusions.has(exclusionKey)) return;
    const existing = byTutor.get(personId) ?? {
      tutorId: personId,
      lastName: person.lastName,
      firstName: person.firstName,
      phone: person.phone,
      grade: person.grade,
      rows: [],
      status: !input.tutorIds ? "unknown" as const : input.tutorIds.has(personId) ? "tutor" as const : "candidate" as const,
    };
    existing.lastName ||= person.lastName;
    existing.firstName ||= person.firstName;
    existing.phone ||= person.phone;
    existing.grade ||= person.grade;
    const rowKey = row.sessionId || `${normalizedSchoolLookupName(row.school)}|${row.timeSlot}`;
    const existingRow = existing.rows.find((item) => (item.sessionId || `${normalizedSchoolLookupName(item.school)}|${item.timeSlot}`) === rowKey);
    if (existingRow) {
      existingRow.sources = Array.from(new Set([...existingRow.sources, source]));
      existingRow.validatedInterest ||= validatedInterest;
    } else {
      existing.rows.push({ ...row, sources: [source], validatedInterest });
    }
    byTutor.set(personId, existing);
  };
  input.availabilityRows.forEach((row) => add(
    { id: row.tutorId, lastName: row.lastName, firstName: row.firstName, phone: row.phone, grade: row.grade },
    { date: row.date, school: row.school, className: row.className, timeSlot: row.timeSlot, sessionId: row.sessionId, group: row.group },
    "availability",
  ));
  input.interestRows.forEach((row) => add(
    { id: row.personId, lastName: row.lastName, firstName: row.firstName, phone: row.phone, grade: "" },
    { date: row.date, school: row.school, className: row.className, timeSlot: row.timeSlot, sessionId: row.sessionId, group: row.group },
    "interest",
    row.validated,
  ));
  byTutor.forEach((person) => person.rows.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot, "fr")));
  return byTutor;
}

function bestAvailabilityDate(rows: Array<{ date: string }>, preferredDate = new Date().toISOString().slice(0, 10)) {
  const counts = rows.reduce((map, row) => {
    if (!row.date) return map;
    map.set(row.date, (map.get(row.date) || 0) + 1);
    return map;
  }, new Map<string, number>());
  if (counts.has(preferredDate)) return preferredDate;
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || sortDateValue(a[0]) - sortDateValue(b[0]))[0]?.[0] || "";
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

function csvCell(value: string | number) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function normalizedHeader(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function parseTutorTrackingCsv(value: string): TutorTrackingRecord[] {
  const rows = parseCsvRows(value).filter((row) => row.some(Boolean));
  if (!rows.length) return [];
  const firstRow = rows[0].map(normalizedHeader);
  const hasHeader = firstRow.some((cell) =>
    [
      "id",
      "nom",
      "nomtuteur",
      "nomdusage",
      "prenom",
      "prenomtuteur",
      "telephone",
      "numerodetelephone",
      "tel",
      "email",
      "etablissement",
      "etablissements",
      "ville",
      "villesouhaitee",
      "villesouhaitees",
    ].includes(cell),
  );
  const headers = hasHeader ? firstRow : ["id", "nom", "prenom", "telephone", "etablissement", "email", "villesouhaitee"];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const indexFor = (aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.findIndex((header) => header === alias);
      if (index >= 0) return index;
    }
    return -1;
  };
  const idIndex = indexFor(["id", "idtuteur", "tutorid", "identifiant"]);
  const lastNameIndex = indexFor(["nomtuteur", "nomdusage", "nom", "lastname", "name"]);
  const firstNameIndex = indexFor(["prenom", "prenomtuteur", "firstname"]);
  const phoneIndex = indexFor(["telephone", "numerodetelephone", "tel", "phone", "mobile"]);
  const emailIndex = indexFor(["email", "mail", "courriel"]);
  const schoolIndex = indexFor(["etablissement", "etablissements", "school", "ecole"]);
  const wantedCityIndex = indexFor(["villesouhaitees", "villesouhaitee", "villesouhaites", "villesouhaite", "ville"]);
  const valueAt = (row: string[], index: number) => (index >= 0 ? row[index] || "" : "");
  const byKey = new Map<string, TutorTrackingRecord>();
  dataRows.forEach((row) => {
    const record = normalizeTutorTrackingRecord({
      tutorId: valueAt(row, idIndex),
      lastName: valueAt(row, lastNameIndex),
      firstName: valueAt(row, firstNameIndex),
      phone: valueAt(row, phoneIndex),
      email: valueAt(row, emailIndex),
      school: valueAt(row, schoolIndex),
      wantedCity: valueAt(row, wantedCityIndex),
    });
    if (record.key !== "name:" && (record.tutorId || record.lastName || record.firstName || record.phone || record.email)) {
      byKey.set(record.key, record);
    }
  });
  return Array.from(byKey.values()).sort((a, b) => tutorTrackingDisplayName(a).localeCompare(tutorTrackingDisplayName(b), "fr"));
}

function parseTutorReportPaste(value: string): TutorReportEntry[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = line.includes("\t")
        ? line.split("\t")
        : line.includes(";")
          ? line.split(";")
          : line.split(",");
      return cells.map((cell) => cell.trim());
    })
    .filter((cells) => {
      const normalized = cells
        .join(" ")
        .toLocaleLowerCase("fr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return !(
        normalized.includes("nom") &&
        normalized.includes("prenom") &&
        (normalized.includes("bilan") || normalized.includes("eleve"))
      );
    })
    .map((cells) =>
      normalizeTutorReportEntry({
        tutorId: cells[0] || "",
        lastName: cells[1] || "",
        firstName: cells[2] || "",
        phone: cells[3] || "",
        school: cells[4] || "",
        studentCount: cells[5] || "",
        missingReportCount: cells[6] || "",
        comment: "",
      }),
    )
    .filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school);
}

function aggregateTutorReports(reports: TutorReportSnapshot[]): TutorReportAggregate[] {
  const byTutor = new Map<string, TutorReportAggregate>();
  reports.forEach((report) => {
    report.entries.forEach((entry) => {
      const key = tutorIdentityKey(entry);
      if (!key || key === "name:") return;
      const existing =
        byTutor.get(key) ??
        {
          key,
          tutorId: entry.tutorId,
          lastName: entry.lastName,
          firstName: entry.firstName,
          phone: entry.phone,
          schools: [],
          dates: [],
          dateCount: 0,
          totalMissing: 0,
          totalStudents: 0,
        };
      if (!existing.tutorId && entry.tutorId) existing.tutorId = entry.tutorId;
      if (!existing.lastName && entry.lastName) existing.lastName = entry.lastName;
      if (!existing.firstName && entry.firstName) existing.firstName = entry.firstName;
      if (!existing.phone && entry.phone) existing.phone = entry.phone;
      if (entry.school && !existing.schools.includes(entry.school)) existing.schools.push(entry.school);
      existing.dates.push({
        date: report.date,
        school: entry.school,
        studentCount: entry.studentCount,
        missingReportCount: entry.missingReportCount,
        comment: entry.comment || report.comment,
      });
      existing.totalMissing += entry.missingReportCount;
      existing.totalStudents += entry.studentCount;
      byTutor.set(key, existing);
    });
  });
  return Array.from(byTutor.values())
    .map((item) => ({
      ...item,
      dateCount: new Set(item.dates.map((dateItem) => dateItem.date)).size,
      dates: item.dates.sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date)),
      schools: item.schools.sort((a, b) => a.localeCompare(b, "fr")),
    }))
    .sort((a, b) => b.totalMissing - a.totalMissing || b.dateCount - a.dateCount);
}

function normalizeSchoolWatchItem(raw: Partial<SchoolWatchItem>): SchoolWatchItem {
  const now = new Date().toISOString();
  return {
    id: raw.id || uid("watch"),
    schoolId: raw.schoolId || "",
    reason: raw.reason || "",
    tags: Array.isArray(raw.tags)
      ? Array.from(new Set(raw.tags.filter((tag): tag is SchoolWatchTag => schoolWatchTags.includes(tag as SchoolWatchTag))))
      : [],
    status: raw.status === "resolved" ? "resolved" : "active",
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .map((comment) => ({
            id: comment.id || uid("watch-comment"),
            text: comment.text || "",
            author: comment.author || "Equipe Alpha",
            createdAt: comment.createdAt || now,
          }))
          .filter((comment) => comment.text)
      : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
    resolvedAt: raw.resolvedAt || "",
  };
}

function createEmptyStaffingDay(date = new Date().toISOString().slice(0, 10)): StaffingDay {
  const now = new Date().toISOString();
  return {
    id: `staffing-${date}`,
    date,
    people: {
      pierre: { staffedSessions: 0, unstaffedSessions: 0 },
      julie: { staffedSessions: 0, unstaffedSessions: 0 },
      kelly: { staffedSessions: 0, unstaffedSessions: 0 },
    },
    totalStaffedSessions: 0,
    totalUnstaffedSessions: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeSchoolEvent(raw: Partial<SchoolEvent>): SchoolEvent {
  const now = new Date().toISOString();
  return {
    id: raw.id || uid("school-event"),
    kind: raw.kind === "event" || raw.kind === "comment" || raw.kind === "action" ? raw.kind : "action",
    title: raw.title || "",
    note: raw.note || "",
    author: raw.author || "Equipe Alpha",
    tags: normalizeTags(raw.tags),
    likes: Array.isArray(raw.likes)
      ? raw.likes.map((like) => ({
          id: like.id || uid("like"),
          author: like.author || "Anonyme",
          createdAt: like.createdAt || now,
        }))
      : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments
          .map((comment) => ({
            id: comment.id || uid("social-comment"),
            text: comment.text || "",
            author: comment.author || "Anonyme",
            createdAt: comment.createdAt || now,
          }))
          .filter((comment) => comment.text.trim())
      : [],
    date: raw.date || raw.createdAt || now,
    createdAt: raw.createdAt || now,
  };
}

function normalizeSchool(raw: Partial<School>): School {
  const now = new Date().toISOString();
  const category = raw.category || "";
  return {
    id: raw.id || uid("school"),
    externalId: raw.externalId || "",
    name: raw.name || "",
    category,
    schoolType:
      raw.schoolType === "alpha" || raw.schoolType === "mise-a-dispo" || raw.schoolType === "mixed"
        ? raw.schoolType
        : category.toLocaleLowerCase("fr").includes("prestation")
          ? "mise-a-dispo"
          : category.toLocaleLowerCase("fr").includes("alpha")
            ? "alpha"
            : "mixed",
    portfolioOwner: raw.portfolioOwner === "kelly" || raw.portfolioOwner === "pierre" || raw.portfolioOwner === "julie" ? raw.portfolioOwner : "",
    zone: raw.zone || "",
    coordinator: raw.coordinator || "",
    registeredCount: normalizePositiveNumber(raw.registeredCount, true),
    city: raw.city || "",
    address: raw.address || "",
    department: raw.department || "",
    upcomingWeek: raw.upcomingWeek || "",
    pastSessions: raw.pastSessions || "",
    typicalWeek: raw.typicalWeek || "",
    contractSigned: raw.contractSigned || "",
    actions: raw.actions || "",
    contact: raw.contact || "",
    nextAction: raw.nextAction || "",
    notes: raw.notes || "",
    events: Array.isArray(raw.events)
      ? raw.events
          .map(normalizeSchoolEvent)
          .filter((event) => event.title || event.note)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [],
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
  };
}

function normalizedSchoolLookupName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

function normalizeStudentHistoryYear(raw: Partial<StudentHistoryYear>): StudentHistoryYear {
  const year =
    typeof raw.year === "number" && Number.isInteger(raw.year) && raw.year >= 2000 && raw.year <= 2100
      ? raw.year
      : new Date().getFullYear();
  const valuesByDate = new Map(
    Array.isArray(raw.entries)
      ? raw.entries.map((entry) => [entry.date, normalizePositiveNumber(entry.value, true)] as const)
      : [],
  );
  return {
    year,
    entries: campaignDates(year).map((date) => ({
      date,
      value: valuesByDate.get(date) ?? null,
    })),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function campaignDayLabel(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function campaignDayKey(date: string) {
  return date.slice(5);
}

function dateValue(date: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  return new Date(`${date}T12:00:00`).getTime();
}

function sortDateValue(date: string) {
  if (!date) return 0;
  const parsed = date.includes("T") ? new Date(date).getTime() : new Date(`${date}T12:00:00`).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayValue() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today.getTime();
}

function daysFromToday(date: string) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((dateValue(date) - todayValue()) / day);
}

function isLate(task: Task) {
  return task.status !== "done" && Boolean(task.endDate) && daysFromToday(task.endDate) < 0;
}

function isCommunicationFollowUpLate(communication: MassCommunication) {
  return communication.status === "to-follow-up" && Boolean(communication.followUpDate) && daysFromToday(communication.followUpDate) < 0;
}

function formatDate(date: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function tutorTrackingImportLabel(snapshot: TutorTrackingSnapshot) {
  const importedAt = new Date(snapshot.createdAt);
  const timeLabel = Number.isNaN(importedAt.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(importedAt);
  return `${snapshot.displayName || snapshot.fileName || "Import tuteurs"} · ${formatFullDate(snapshot.date)}${timeLabel ? ` à ${timeLabel}` : ""}`;
}

function naturalDateLabel(task: Task) {
  const target = task.endDate || task.startDate;
  const delta = daysFromToday(target);
  const date = formatDate(target);

  if (task.status === "done") return task.endDate ? `Terminee le ${date}` : "Terminee";
  if (task.endDate && delta < 0) return `En retard de ${Math.abs(delta)} j`;
  if (delta === 0) return "Aujourd'hui";
  if (delta === 1) return "Demain";
  if (delta <= 7) return `Dans ${delta} jours`;
  return date;
}

function formatDuration(hours: number | null) {
  if (!hours) return "Non renseignee";
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${wholeHours} h ${minutes} min` : `${wholeHours} h`;
}

function durationBucket(hours: number | null): DurationBucket {
  if (!hours) return "unset";
  if (hours <= 1) return "short";
  if (hours <= 4) return "medium";
  return "long";
}

function dateLabel(task: Task) {
  if (!task.endDate || task.endDate === task.startDate) return formatDate(task.startDate);
  return `${formatDate(task.startDate)} -> ${formatDate(task.endDate)}`;
}

function ownerInitials(owner: string) {
  return owner
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeTask(raw: Partial<Task>): Task {
  return {
    id: raw.id || uid("task"),
    title: raw.title || "",
    description: raw.description || "",
    owner: raw.owner || "",
    assigneeId: raw.assigneeId || null,
    startDate: raw.startDate || new Date().toISOString().slice(0, 10),
    endDate: raw.endDate || "",
    estimatedHours:
      typeof raw.estimatedHours === "number" && Number.isFinite(raw.estimatedHours) && raw.estimatedHours > 0
        ? raw.estimatedHours
        : null,
    status: raw.status === "progress" || raw.status === "done" ? raw.status : "todo",
    priority:
      raw.priority === "low" || raw.priority === "high" || raw.priority === "medium"
        ? raw.priority
        : "medium",
    verified: raw.verified === true,
    verificationOwner: raw.verificationOwner || "",
    verificationComment: raw.verificationComment || "",
    comments: Array.isArray(raw.comments)
      ? raw.comments.map((comment) => ({
          id: comment.id || uid("comment"),
          text: comment.text || "",
          author: comment.author || "Anonyme",
          createdAt: comment.createdAt || new Date().toISOString(),
        }))
      : [],
    completionNotifications: Array.isArray(raw.completionNotifications)
      ? raw.completionNotifications.map((item) => ({
          personId: item.personId,
          sentAt: item.sentAt,
        }))
      : [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizeRecurringTask(raw: Partial<RecurringTask>): RecurringTask {
  return {
    id: raw.id || uid("recurring"),
    title: raw.title || "",
    description: raw.description || "",
    owner: raw.owner || "",
    assigneeId: raw.assigneeId || null,
    estimatedHours:
      typeof raw.estimatedHours === "number" && Number.isFinite(raw.estimatedHours) && raw.estimatedHours > 0
        ? raw.estimatedHours
        : null,
    priority:
      raw.priority === "low" || raw.priority === "high" || raw.priority === "medium"
        ? raw.priority
        : "medium",
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizeObjective(raw: Partial<Objective>): Objective {
  const targetLabelText = raw.targetLabel || "";
  const fallbackTarget = numberFromText(targetLabelText);
  const label = targetLabelText.replace(/\d+/g, "").trim().replace(/^\/+/, "").trim();

  return {
    id: raw.id || uid("objective"),
    kind: raw.kind === "counter" || raw.kind === "qualitative" ? raw.kind : raw.targetValue ? "counter" : "qualitative",
    title: raw.title || "",
    description: raw.description || "",
    targetLabel: label || "élèves",
    currentValue: normalizePositiveNumber(raw.currentValue, true),
    targetValue: normalizePositiveNumber(raw.targetValue, false) ?? fallbackTarget,
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    status: raw.status === "todo" || raw.status === "done" ? raw.status : "progress",
    progressNote: raw.progressNote || "",
    personIds: Array.isArray(raw.personIds) ? raw.personIds.filter(Boolean) : [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizePerson(raw: Partial<Person>): Person {
  return {
    id: raw.id || uid("person"),
    name: raw.name || "",
    active: raw.active !== false,
    hasEmail: Boolean(raw.hasEmail),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
  const [communications, setCommunications] = useState<MassCommunication[]>([]);
  const [staffingDays, setStaffingDays] = useState<StaffingDay[]>([]);
  const [tutorReports, setTutorReports] = useState<TutorReportSnapshot[]>([]);
  const [tutorReportComments, setTutorReportComments] = useState<TutorReportComment[]>([]);
  const [tutorTracking, setTutorTracking] = useState<TutorTrackingData>({ snapshots: [], comments: [] });
  const [availabilityImports, setAvailabilityImports] = useState<AvailabilityImport[]>([]);
  const [interestImports, setInterestImports] = useState<TutorInterestImport[]>([]);
  const [availabilityImportData, setAvailabilityImportData] = useState<Record<string, AvailabilityImport>>({});
  const [interestImportData, setInterestImportData] = useState<Record<string, TutorInterestImport>>({});
  const [availabilityExclusions, setAvailabilityExclusions] = useState<UnstaffedExclusions>({ sessionIds: [], sourceKeys: [], updatedAt: "" });
  const [latestAvailabilityStaffingImport, setLatestAvailabilityStaffingImport] = useState<TutorAssignmentImport | null>(null);
  const [schoolWatchlist, setSchoolWatchlist] = useState<SchoolWatchItem[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [studentHistory, setStudentHistory] = useState<StudentHistoryYear[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status | "late">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [appMode, setAppModeState] = useState<AppMode>(() =>
    typeof window === "undefined" ? "dashboard" : appModeFromUrl(new URL(window.location.href)) || "dashboard",
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [density, setDensity] = useState<Density>(() =>
    typeof window === "undefined" || localStorage.getItem(DENSITY_KEY) !== "comfortable"
      ? "compact"
      : "comfortable",
  );
  const [authorName, setAuthorName] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(AUTHOR_KEY) || "",
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [objectiveOpen, setObjectiveOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [schoolWatchOpen, setSchoolWatchOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolEventOpen, setSchoolEventOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null);
  const [editingSchoolWatchId, setEditingSchoolWatchId] = useState<string | null>(null);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [eventSchoolId, setEventSchoolId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [recurringDraft, setRecurringDraft] = useState<RecurringDraft>(emptyRecurringDraft);
  const [objectiveDraft, setObjectiveDraft] = useState<ObjectiveDraft>(emptyObjectiveDraft);
  const [linkDraft, setLinkDraft] = useState<LinkDraft>(emptyLinkDraft);
  const [journalDraft, setJournalDraft] = useState<JournalDraft>(emptyJournalDraft);
  const [communicationDraft, setCommunicationDraft] = useState<CommunicationDraft>(emptyCommunicationDraft);
  const [schoolWatchDraft, setSchoolWatchDraft] = useState<SchoolWatchDraft>(emptySchoolWatchDraft);
  const [schoolDraft, setSchoolDraft] = useState<SchoolDraft>(emptySchoolDraft);
  const [schoolEventDraft, setSchoolEventDraft] = useState<SchoolEventDraft>(emptySchoolEventDraft);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [activeHistoryYear, setActiveHistoryYear] = useState<number>(new Date().getFullYear());
  const [selectedHistoryYears, setSelectedHistoryYears] = useState<number[]>([]);
  const [sendAssignmentEmail, setSendAssignmentEmail] = useState(true);
  const [personDraft, setPersonDraft] = useState<PersonDraft>(emptyPersonDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notifyTaskId, setNotifyTaskId] = useState<string | null>(null);
  const [notifyRecipients, setNotifyRecipients] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");
  const [journalQuery, setJournalQuery] = useState("");
  const [journalTagFilter, setJournalTagFilter] = useState("all");
  const [journalAuthorFilter, setJournalAuthorFilter] = useState("all");
  const [journalPersonFilter, setJournalPersonFilter] = useState("all");
  const [communicationQuery, setCommunicationQuery] = useState("");
  const [communicationAudienceFilter, setCommunicationAudienceFilter] = useState<"all" | CommunicationAudience>("all");
  const [communicationStatusFilter, setCommunicationStatusFilter] = useState<"all" | CommunicationStatus>("all");
  const [schoolWatchQuery, setSchoolWatchQuery] = useState("");
  const [schoolWatchFilter, setSchoolWatchFilter] = useState<WatchlistFilter>("active");
  const [selectedSchoolWatchId, setSelectedSchoolWatchId] = useState<string | null>(null);
  const [schoolWatchComment, setSchoolWatchComment] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<SchoolFilter>("all");
  const [schoolAssignmentFilter, setSchoolAssignmentFilter] = useState<"all" | "unassigned" | Exclude<SchoolPortfolioOwner, "">>("all");
  const [schoolAssignmentPaste, setSchoolAssignmentPaste] = useState("");
  const [schoolAssignmentImportReport, setSchoolAssignmentImportReport] = useState<{ matched: number; changed: number; duplicates: number; invalid: number; unmatched: string[] } | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [tutorReportDate, setTutorReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [tutorReportStartDate, setTutorReportStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [tutorReportEndDate, setTutorReportEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [tutorReportPaste, setTutorReportPaste] = useState("");
  const [tutorReportQuery, setTutorReportQuery] = useState("");
  const [tutorReportGlobalQuery, setTutorReportGlobalQuery] = useState("");
  const [selectedTutorReportKey, setSelectedTutorReportKey] = useState<string | null>(null);
  const [visibleTutorReportCount, setVisibleTutorReportCount] = useState(10);
  const [tutorTrackingDate, setTutorTrackingDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTutorTrackingSnapshotId, setSelectedTutorTrackingSnapshotId] = useState("");
  const [tutorTrackingCompareStartId, setTutorTrackingCompareStartId] = useState("");
  const [tutorTrackingCompareEndId, setTutorTrackingCompareEndId] = useState("");
  const [tutorTrackingCsv, setTutorTrackingCsv] = useState("");
  const [tutorTrackingQuery, setTutorTrackingQuery] = useState("");
  const [tutorTrackingView, setTutorTrackingView] = useState<"new" | "exited" | "current">("new");
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().slice(0, 10));
  const [availabilityReferenceId, setAvailabilityReferenceId] = useState("");
  const [availabilityRecentId, setAvailabilityRecentId] = useState("");
  const [interestReferenceId, setInterestReferenceId] = useState("");
  const [interestRecentId, setInterestRecentId] = useState("");
  const [availabilityView, setAvailabilityView] = useState<AvailabilityComparisonView>("new");
  const [availabilitySchoolOwnerFilter, setAvailabilitySchoolOwnerFilter] = useState<"all" | "unassigned" | Exclude<SchoolPortfolioOwner, "">>("all");
  const [availabilitySources, setAvailabilitySources] = useState<AvailabilitySource[]>(["availability", "interest"]);
  const [availabilityStatuses, setAvailabilityStatuses] = useState<Array<"tutor" | "candidate">>(["tutor", "candidate"]);
  const [showAvailabilityHidden, setShowAvailabilityHidden] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === "unstaffed") {
      const url = new URL(window.location.href);
      url.searchParams.delete("date-seances");
      url.searchParams.delete("responsable");
      url.searchParams.delete("fichier-seances");
      url.searchParams.delete("recherche-seances");
      window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
    }
    setAppModeState(mode);
  }, []);

  const loadTasks = useCallback(async (silent = false) => {
    try {
      if (!silent) setSyncError("");
      const response = await fetch("/api/tasks", { cache: "no-store" });
      if (!response.ok) throw new Error("load-failed");
      const data = (await response.json()) as { tasks?: Partial<Task>[] };
      setTasks(Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : []);
      setLoaded(true);
      setSyncError("");
    } catch {
      setLoaded(true);
      setSyncError("Synchronisation indisponible pour le moment");
    }
  }, []);

  const loadPeople = useCallback(async () => {
    try {
      const response = await fetch("/api/people", { cache: "no-store" });
      if (!response.ok) throw new Error("load-people-failed");
      const data = (await response.json()) as { people?: Partial<Person>[] };
      setPeople(Array.isArray(data.people) ? data.people.map(normalizePerson) : []);
    } catch {
      setToast("Liste des personnes indisponible");
    }
  }, []);

  const loadRecurringTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/recurring-tasks", { cache: "no-store" });
      if (!response.ok) throw new Error("load-recurring-failed");
      const data = (await response.json()) as { recurringTasks?: Partial<RecurringTask>[] };
      setRecurringTasks(
        Array.isArray(data.recurringTasks) ? data.recurringTasks.map(normalizeRecurringTask) : [],
      );
    } catch {
      setToast("Modeles recurrents indisponibles");
    }
  }, []);

  const loadObjectives = useCallback(async () => {
    try {
      const response = await fetch("/api/objectives", { cache: "no-store" });
      if (!response.ok) throw new Error("load-objectives-failed");
      const data = (await response.json()) as { objectives?: Partial<Objective>[] };
      setObjectives(Array.isArray(data.objectives) ? data.objectives.map(normalizeObjective) : []);
    } catch {
      setToast("Objectifs indisponibles");
    }
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      const response = await fetch("/api/links", { cache: "no-store" });
      if (!response.ok) throw new Error("load-links-failed");
      const data = (await response.json()) as { links?: Partial<SharedLink>[] };
      setLinks(Array.isArray(data.links) ? data.links.map(normalizeSharedLink) : []);
    } catch {
      setToast("Liens indisponibles");
    }
  }, []);

  const loadJournalPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/journal-posts", { cache: "no-store" });
      if (!response.ok) throw new Error("load-journal-failed");
      const data = (await response.json()) as { posts?: Partial<JournalPost>[] };
      setJournalPosts(Array.isArray(data.posts) ? data.posts.map(normalizeJournalPost) : []);
    } catch {
      setToast("Journal indisponible");
    }
  }, []);

  const loadCommunications = useCallback(async () => {
    try {
      const response = await fetch("/api/mass-communications", { cache: "no-store" });
      if (!response.ok) throw new Error("load-communications-failed");
      const data = (await response.json()) as { communications?: Partial<MassCommunication>[] };
      setCommunications(
        Array.isArray(data.communications) ? data.communications.map(normalizeMassCommunication) : [],
      );
    } catch {
      setToast("Communications indisponibles");
    }
  }, []);

  const loadStaffingDays = useCallback(async () => {
    try {
      const response = await fetch("/api/staffing-sessions", { cache: "no-store" });
      if (!response.ok) throw new Error("load-staffing-failed");
      const data = (await response.json()) as { staffing?: Partial<StaffingDay>[] };
      const today = new Date().toISOString().slice(0, 10);
      const loadedStaffing = Array.isArray(data.staffing) ? data.staffing.map(normalizeStaffingDay) : [];
      if (loadedStaffing.some((day) => day.date === today)) {
        setStaffingDays(loadedStaffing);
        return;
      }
      const nextStaffing = [createEmptyStaffingDay(today), ...loadedStaffing].sort(
        (a, b) => sortDateValue(b.date) - sortDateValue(a.date),
      );
      setStaffingDays(nextStaffing);
      await fetch("/api/staffing-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffing: nextStaffing }),
      });
    } catch {
      setToast("Staffing indisponible");
    }
  }, []);

  const loadTutorReports = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor-reports", { cache: "no-store" });
      if (!response.ok) throw new Error("load-tutor-reports-failed");
      const data = (await response.json()) as { reports?: Partial<TutorReportSnapshot>[] };
      const reports = Array.isArray(data.reports) ? data.reports.map(normalizeTutorReportSnapshot) : [];
      setTutorReports(reports);
      if (reports.length) {
        setTutorReportDate((current) => (reports.some((report) => report.date === current) ? current : reports[0].date));
      }
    } catch {
      setToast("Bilans tuteurs indisponibles");
    }
  }, []);

  const loadTutorReportComments = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor-report-comments", { cache: "no-store" });
      if (!response.ok) throw new Error("load-tutor-report-comments-failed");
      const data = (await response.json()) as { comments?: Partial<TutorReportComment>[] };
      setTutorReportComments(
        Array.isArray(data.comments)
          ? data.comments.map(normalizeTutorReportComment).filter((comment) => comment.tutorKey)
          : [],
      );
    } catch {
      setToast("Commentaires tuteurs indisponibles");
    }
  }, []);

  const loadTutorTracking = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor-tracking", { cache: "no-store" });
      if (!response.ok) throw new Error("load-tutor-tracking-failed");
      const data = (await response.json()) as { tracking?: Partial<TutorTrackingData> };
      const tracking = normalizeTutorTrackingData(data.tracking || {});
      setTutorTracking(tracking);
      if (tracking.snapshots.length) {
        setSelectedTutorTrackingSnapshotId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[0].id);
        setTutorTrackingCompareEndId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[0].id);
        setTutorTrackingCompareStartId((current) => tracking.snapshots.some((snapshot) => snapshot.id === current) ? current : tracking.snapshots[1]?.id || tracking.snapshots[0].id);
      }
    } catch {
      setToast("Suivi tuteurs indisponible");
    }
  }, []);

  const loadAvailabilityImports = useCallback(async () => {
    try {
      const [availabilityResponse, interestResponse, exclusionsResponse] = await Promise.all([
        fetch("/api/availability-imports?summary=1", { cache: "no-store" }),
        fetch("/api/tutor-interest-imports?summary=1", { cache: "no-store" }),
        fetch("/api/unstaffed-exclusions", { cache: "no-store" }),
      ]);
      const availabilityData = (await availabilityResponse.json()) as { imports?: Partial<AvailabilityImport>[]; error?: string; detail?: string };
      const interestData = (await interestResponse.json()) as { imports?: TutorInterestImport[]; error?: string; detail?: string };
      const exclusionsData = (await exclusionsResponse.json()) as { exclusions?: UnstaffedExclusions; error?: string; detail?: string };
      if (!availabilityResponse.ok) throw new Error(availabilityData.detail || availabilityData.error || "load-availability-imports-failed");
      if (!interestResponse.ok) throw new Error(interestData.detail || interestData.error || "load-interest-imports-failed");
      if (!exclusionsResponse.ok) throw new Error(exclusionsData.detail || exclusionsData.error || "load-exclusions-failed");
      const imports = Array.isArray(availabilityData.imports)
        ? availabilityData.imports
            .map(normalizeAvailabilityImport)
            .sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt))
        : [];
      const interests = Array.isArray(interestData.imports)
        ? interestData.imports.slice().sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt))
        : [];
      setAvailabilityImports(imports);
      setInterestImports(interests);
      setAvailabilityExclusions(exclusionsData.exclusions ?? { sessionIds: [], sourceKeys: [], updatedAt: "" });
      if (imports.length) {
        setAvailabilityRecentId((current) => (imports.some((item) => item.id === current) ? current : imports[0].id));
        setAvailabilityReferenceId((current) =>
          imports.some((item) => item.id === current) ? current : imports[1]?.id || imports[0].id,
        );
      }
      if (interests.length) {
        setInterestRecentId((current) => interests.some((item) => item.id === current) ? current : interests[0].id);
        setInterestReferenceId((current) => interests.some((item) => item.id === current) ? current : interests[1]?.id || interests[0].id);
      }
    } catch (error) {
      setToast(error instanceof Error ? `Fichiers de comparaison indisponibles : ${error.message}` : "Imports indisponibles");
    }
  }, []);

  const loadLatestAvailabilityStaffing = useCallback(async () => {
    try {
      const response = await fetch("/api/tutor-assignment-imports?latest=1", { cache: "no-store" });
      const data = (await response.json()) as { import?: TutorAssignmentImport | null; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "load-latest-staffing-failed");
      setLatestAvailabilityStaffingImport(data.import ?? null);
    } catch {
      setLatestAvailabilityStaffingImport(null);
      setToast("Dernier fichier de staffing indisponible");
    }
  }, []);

  const loadSchoolWatchlist = useCallback(async () => {
    try {
      const response = await fetch("/api/school-watchlist", { cache: "no-store" });
      if (!response.ok) throw new Error("load-school-watchlist-failed");
      const data = (await response.json()) as { watchlist?: Partial<SchoolWatchItem>[] };
      setSchoolWatchlist(Array.isArray(data.watchlist) ? data.watchlist.map(normalizeSchoolWatchItem) : []);
    } catch {
      setToast("Établissements à suivre indisponibles");
    }
  }, []);

  const loadSchools = useCallback(async () => {
    try {
      const response = await fetch("/api/schools", { cache: "no-store" });
      if (!response.ok) throw new Error("load-schools-failed");
      const data = (await response.json()) as { schools?: Partial<School>[] };
      setSchools(Array.isArray(data.schools) ? data.schools.map(normalizeSchool) : []);
    } catch {
      setToast("Établissements indisponibles");
    }
  }, []);

  const loadStudentHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/student-history", { cache: "no-store" });
      if (!response.ok) throw new Error("load-student-history-failed");
      const data = (await response.json()) as { history?: Partial<StudentHistoryYear>[] };
      const history = Array.isArray(data.history) ? data.history.map(normalizeStudentHistoryYear) : [];
      setStudentHistory(history);
      if (history.length) {
        setActiveHistoryYear((current) =>
          history.some((year) => year.year === current) ? current : history[0].year,
        );
        setSelectedHistoryYears((current) => {
          const available = new Set(history.map((year) => year.year));
          const kept = current.filter((year) => available.has(year));
          return kept.length ? kept : [history[0].year];
        });
      }
    } catch {
      setToast("Historique eleves indisponible");
    }
  }, []);

  useEffect(() => {
    const syncModeFromUrl = () => {
      const mode = appModeFromUrl(new URL(window.location.href));
      setAppModeState(mode || "dashboard");
    };
    window.addEventListener("popstate", syncModeFromUrl);
    window.addEventListener("hashchange", syncModeFromUrl);
    return () => {
      window.removeEventListener("popstate", syncModeFromUrl);
      window.removeEventListener("hashchange", syncModeFromUrl);
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const nextSlug = appModeSlugs[appMode];
    if (url.searchParams.get("onglet") === nextSlug) return;
    url.searchParams.set("onglet", nextSlug);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  }, [appMode]);

  useEffect(() => {
    const refreshCurrentPage = () => {
      if (appMode === "dashboard") void loadObjectives();
      else if (appMode === "tasks") { void loadTasks(true); void loadPeople(); }
      else if (appMode === "recurring") { void loadRecurringTasks(); void loadPeople(); }
      else if (appMode === "links") void loadLinks();
      else if (appMode === "journal") { void loadJournalPosts(); void loadPeople(); }
      else if (appMode === "communications") void loadCommunications();
      else if (appMode === "staffing") void loadStaffingDays();
      else if (appMode === "tutorReports") { void loadTutorReports(); void loadTutorReportComments(); }
      else if (appMode === "tutors") void loadTutorTracking();
      else if (appMode === "availability") { void loadAvailabilityImports(); void loadLatestAvailabilityStaffing(); void loadSchools(); void loadTutorTracking(); }
      else if (appMode === "watchlist") { void loadSchoolWatchlist(); void loadSchools(); }
      else if (appMode === "schools") void loadSchools();
      else if (appMode === "objectives") { void loadObjectives(); void loadPeople(); }
      else if (appMode === "history") void loadStudentHistory();
    };
    const initial = window.setTimeout(refreshCurrentPage, 0);
    const refresh = window.setInterval(refreshCurrentPage, 30_000);
    return () => { window.clearTimeout(initial); window.clearInterval(refresh); };
  }, [appMode, loadTasks, loadPeople, loadRecurringTasks, loadObjectives, loadLinks, loadJournalPosts, loadCommunications, loadStaffingDays, loadTutorReports, loadTutorReportComments, loadTutorTracking, loadAvailabilityImports, loadLatestAvailabilityStaffing, loadSchoolWatchlist, loadSchools, loadStudentHistory]);

  useEffect(() => {
    if (appMode !== "availability") return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const availabilityIds = Array.from(new Set([availabilityReferenceId, availabilityRecentId].filter(Boolean)));
      const selectedInterestIds = Array.from(new Set([interestReferenceId, interestRecentId].filter(Boolean)));
      void Promise.all([
        ...availabilityIds.map(async (id) => {
          const response = await fetch(`/api/availability-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
          const data = await response.json() as { import?: Partial<AvailabilityImport>; error?: string; detail?: string };
          if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Disponibilités indisponibles");
          return { kind: "availability" as const, id, import: normalizeAvailabilityImport(data.import) };
        }),
        ...selectedInterestIds.map(async (id) => {
          const response = await fetch(`/api/tutor-interest-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
          const data = await response.json() as { import?: TutorInterestImport; error?: string; detail?: string };
          if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Intérêts indisponibles");
          return { kind: "interest" as const, id, import: data.import };
        }),
      ]).then((loadedImports) => {
        if (cancelled) return;
        const availabilities = loadedImports.filter((item) => item.kind === "availability");
        const interests = loadedImports.filter((item) => item.kind === "interest");
        setAvailabilityImportData((current) => ({ ...current, ...Object.fromEntries(availabilities.map((item) => [item.id, item.import])) }));
        setInterestImportData((current) => ({ ...current, ...Object.fromEntries(interests.map((item) => [item.id, item.import])) }));
      }).catch((error) => {
        if (!cancelled) setToast(error instanceof Error ? error.message : "Chargement des fichiers impossible");
      });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [appMode, availabilityRecentId, availabilityReferenceId, interestRecentId, interestReferenceId]);

  useEffect(() => {
    if (authorName.trim()) localStorage.setItem(AUTHOR_KEY, authorName.trim());
  }, [authorName]);

  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const activePeople = useMemo(() => people.filter((person) => person.active), [people]);

  const owners = useMemo(
    () =>
      Array.from(
        new Set([
          ...tasks.map((task) => task.owner).filter(Boolean),
      ...recurringTasks.map((task) => task.owner).filter(Boolean),
      ...tasks.map((task) => task.verificationOwner).filter(Boolean),
      ...people.map((person) => person.name).filter(Boolean),
        ]),
      ).sort(),
    [tasks, recurringTasks, people],
  );

  const stats = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => task.status !== "done").length,
      todo: tasks.filter((task) => task.status === "todo").length,
      progress: tasks.filter((task) => task.status === "progress").length,
      done: tasks.filter((task) => task.status === "done").length,
      late: tasks.filter(isLate).length,
      high: tasks.filter((task) => task.priority === "high" && task.status !== "done").length,
    }),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return tasks
      .filter((task) => {
        const latestComment = task.comments[0];
        const assignee = task.assigneeId ? peopleById.get(task.assigneeId)?.name || "" : "";
        const matchesText =
          !normalized ||
          `${task.title} ${task.description} ${task.owner} ${assignee} ${latestComment?.text || ""}`
            .toLocaleLowerCase("fr")
            .includes(normalized);
        const matchesStatus =
          statusFilter === "all"
            ? task.status !== "done"
            : statusFilter === "late"
              ? isLate(task)
              : task.status === statusFilter;
        const matchesOwner = ownerFilter === "all" || task.owner === ownerFilter || assignee === ownerFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        return matchesText && matchesStatus && matchesOwner && matchesPriority;
      })
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        if (priorityRank[a.priority] !== priorityRank[b.priority]) {
          return priorityRank[a.priority] - priorityRank[b.priority];
        }
        return dateValue(a.endDate || a.startDate) - dateValue(b.endDate || b.startDate);
      });
  }, [tasks, query, statusFilter, ownerFilter, priorityFilter, peopleById]);

  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const notifyTask = tasks.find((task) => task.id === notifyTaskId) ?? null;
  const defaultStudentObjective = normalizeObjective({
    id: "objective-september-2600",
    kind: "counter",
    title: "Objectif septembre",
    description: "Garder le cap de la rentrée avec une équipe alignée, concentrée et prête à transformer les efforts en inscriptions.",
    targetLabel: "élèves",
    currentValue: 160,
    targetValue: 2600,
  });
  const defaultSessionObjective = normalizeObjective({
    id: "objective-weekly-supervision-1300",
    kind: "counter",
    title: "Séances de surveillance par semaine",
    description: "Garder un rythme hebdomadaire visible pour sécuriser l'accompagnement des élèves.",
    targetLabel: "séances",
    currentValue: 130,
    targetValue: 1300,
  });
  const studentObjective =
    objectives.find((objective) => objective.id === defaultStudentObjective.id) ?? defaultStudentObjective;
  const sessionObjective =
    objectives.find((objective) => objective.id === defaultSessionObjective.id) ?? defaultSessionObjective;
  const qualitativeObjectives = objectives
    .filter((objective) => objective.kind === "qualitative")
    .slice()
    .sort((a, b) => dateValue(a.endDate || a.startDate) - dateValue(b.endDate || b.startDate));
  const journalTags = useMemo(
    () => Array.from(new Set(journalPosts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b, "fr")),
    [journalPosts],
  );
  const journalAuthors = useMemo(
    () => Array.from(new Set(journalPosts.map((post) => post.author).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr")),
    [journalPosts],
  );
  const filteredJournalPosts = useMemo(() => {
    const normalized = journalQuery.trim().toLocaleLowerCase("fr");
    return journalPosts
      .filter((post) => {
        const taggedPeople = post.personIds
          .map((personId) => peopleById.get(personId)?.name || "")
          .join(" ");
        const matchesText =
          !normalized ||
          `${post.title} ${post.content} ${post.author} ${post.tags.join(" ")} ${taggedPeople}`
            .toLocaleLowerCase("fr")
            .includes(normalized);
        const matchesTag = journalTagFilter === "all" || post.tags.includes(journalTagFilter);
        const matchesAuthor = journalAuthorFilter === "all" || post.author === journalAuthorFilter;
        const matchesPerson = journalPersonFilter === "all" || post.personIds.includes(journalPersonFilter);
        return matchesText && matchesTag && matchesAuthor && matchesPerson;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [journalPosts, journalQuery, journalTagFilter, journalAuthorFilter, journalPersonFilter, peopleById]);
  const filteredCommunications = useMemo(() => {
    const normalized = communicationQuery.trim().toLocaleLowerCase("fr");
    return communications
      .filter((communication) => {
        const matchesText =
          !normalized ||
          `${communication.title} ${communication.messageSummary} ${communication.notes} ${communication.author} ${communication.tags.join(" ")} ${communication.audiences.map((audience) => communicationAudienceLabels[audience]).join(" ")} ${communication.channel}`
            .toLocaleLowerCase("fr")
            .includes(normalized);
        const matchesAudience =
          communicationAudienceFilter === "all" || communication.audiences.includes(communicationAudienceFilter);
        const matchesStatus = communicationStatusFilter === "all" || communication.status === communicationStatusFilter;
        return matchesText && matchesAudience && matchesStatus;
      })
      .sort(
        (a, b) =>
          sortDateValue(b.sentAt || b.followUpDate || b.createdAt) -
          sortDateValue(a.sentAt || a.followUpDate || a.createdAt),
      );
  }, [communications, communicationQuery, communicationAudienceFilter, communicationStatusFilter]);
  const staffingSummary = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const sevenDaysAgo = today.getTime() - 6 * 24 * 60 * 60 * 1000;
    return staffingDays.reduce(
      (summary, day) => {
        const dayValue = sortDateValue(day.date);
        const dayTotals = staffingDayTotals(day);
        summary.totalStaffed += dayTotals.staffed;
        summary.totalUnstaffed += dayTotals.unstaffed;
        if (dayValue >= sevenDaysAgo && dayValue <= today.getTime()) {
          summary.weekStaffed += dayTotals.staffed;
          summary.weekUnstaffed += dayTotals.unstaffed;
        }
        return summary;
      },
      { totalStaffed: 0, totalUnstaffed: 0, weekStaffed: 0, weekUnstaffed: 0 },
    );
  }, [staffingDays]);
  const staffingChart = useMemo(() => {
    const points = staffingDays
      .slice()
      .sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date))
      .slice(-14)
      .map((day) => {
        const totals = staffingDayTotals(day);
        return {
          date: day.date,
          total: totals.staffed + totals.unstaffed,
          unstaffed: totals.unstaffed,
        };
      });
    const maxValue = Math.max(1, ...points.flatMap((point) => [point.total, point.unstaffed]));
    const pathFor = (field: "total" | "unstaffed") =>
      points
        .map((point, index) => {
          const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * 100;
          const y = 42 - (point[field] / maxValue) * 36;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    return {
      points,
      totalPath: pathFor("total"),
      unstaffedPath: pathFor("unstaffed"),
      unstaffedPercent: staffingUnstaffedPercent(staffingSummary.totalStaffed, staffingSummary.totalUnstaffed),
    };
  }, [staffingDays, staffingSummary.totalStaffed, staffingSummary.totalUnstaffed]);
  const activeTutorReport = useMemo(
    () => tutorReports.find((report) => report.date === tutorReportDate) ?? null,
    [tutorReports, tutorReportDate],
  );
  const filteredTutorReportsForGlobal = useMemo(
    () =>
      tutorReports.filter((report) => {
        const value = sortDateValue(report.date);
        const start = sortDateValue(tutorReportStartDate);
        const end = sortDateValue(tutorReportEndDate);
        return (!start || value >= start) && (!end || value <= end);
      }),
    [tutorReportEndDate, tutorReportStartDate, tutorReports],
  );
  const tutorReportAggregates = useMemo(
    () => aggregateTutorReports(filteredTutorReportsForGlobal),
    [filteredTutorReportsForGlobal],
  );
  const tutorReportCommentByKey = useMemo(
    () => new Map(tutorReportComments.map((comment) => [comment.tutorKey, comment.comment])),
    [tutorReportComments],
  );
  const filteredTutorReportAggregates = useMemo(() => {
    const query = tutorReportGlobalQuery.trim().toLocaleLowerCase("fr");
    const phoneQuery = digitsOnly(tutorReportGlobalQuery);
    if (!query && !phoneQuery) return tutorReportAggregates;
    return tutorReportAggregates.filter((tutor) => {
      const text = `${tutor.tutorId} ${tutor.lastName} ${tutor.firstName} ${tutor.phone} ${tutor.schools.join(" ")} ${tutorReportCommentByKey.get(tutor.key) || ""}`
        .toLocaleLowerCase("fr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const phone = digitsOnly(tutor.phone);
      return text.includes(
        query
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      ) || Boolean(phoneQuery && phone.includes(phoneQuery));
    });
  }, [tutorReportAggregates, tutorReportCommentByKey, tutorReportGlobalQuery]);
  const visibleTutorReportAggregates = useMemo(
    () => filteredTutorReportAggregates.slice(0, visibleTutorReportCount),
    [filteredTutorReportAggregates, visibleTutorReportCount],
  );
  const selectedTutorReport = useMemo(
    () => tutorReportAggregates.find((item) => item.key === selectedTutorReportKey) ?? null,
    [tutorReportAggregates, selectedTutorReportKey],
  );
  const filteredTutorReportEntries = useMemo(() => {
    const normalized = tutorReportQuery.trim().toLocaleLowerCase("fr");
    const phoneQuery = digitsOnly(tutorReportQuery);
    return (activeTutorReport?.entries ?? [])
      .filter((entry) => {
        if (!normalized) return true;
        const globalComment = tutorReportCommentByKey.get(tutorIdentityKey(entry)) || "";
        const text = `${entry.tutorId} ${entry.lastName} ${entry.firstName} ${entry.phone} ${entry.school} ${entry.comment} ${globalComment}`
          .toLocaleLowerCase("fr")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return text.includes(
          normalized
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        ) || Boolean(phoneQuery && digitsOnly(entry.phone).includes(phoneQuery));
      })
      .sort((a, b) => b.missingReportCount - a.missingReportCount || a.lastName.localeCompare(b.lastName, "fr"));
  }, [activeTutorReport, tutorReportCommentByKey, tutorReportQuery]);
  const latestTutorTrackingSnapshot = tutorTracking.snapshots[0] ?? null;
  const tutorTrackingCommentByKey = useMemo(
    () => new Map(tutorTracking.comments.map((commentItem) => [commentItem.tutorKey, commentItem.comment])),
    [tutorTracking.comments],
  );
  const tutorTrackingSummary = useMemo(() => {
    const byTutor = new Map<string, TutorTrackingSummary>();
    const currentKeys = new Set(latestTutorTrackingSnapshot?.records.map((record) => record.key) ?? []);
    tutorTracking.snapshots
      .slice()
      .sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date) || sortDateValue(a.createdAt) - sortDateValue(b.createdAt))
      .forEach((snapshot) => {
        snapshot.records.forEach((record) => {
          const existing = byTutor.get(record.key);
          if (!existing) {
            byTutor.set(record.key, {
              ...record,
              firstSeen: snapshot.date,
              lastSeen: snapshot.date,
              seenCount: 1,
              isCurrent: currentKeys.has(record.key),
            });
          } else {
            byTutor.set(record.key, {
              ...existing,
              ...record,
              firstSeen: sortDateValue(snapshot.date) < sortDateValue(existing.firstSeen) ? snapshot.date : existing.firstSeen,
              lastSeen: sortDateValue(snapshot.date) > sortDateValue(existing.lastSeen) ? snapshot.date : existing.lastSeen,
              seenCount: existing.seenCount + 1,
              isCurrent: currentKeys.has(record.key),
            });
          }
        });
      });
    return Array.from(byTutor.values()).sort((a, b) => tutorTrackingDisplayName(a).localeCompare(tutorTrackingDisplayName(b), "fr"));
  }, [latestTutorTrackingSnapshot, tutorTracking.snapshots]);
  const tutorTrackingSnapshotById = useMemo(
    () => new Map(tutorTracking.snapshots.map((snapshot) => [snapshot.id, snapshot])),
    [tutorTracking.snapshots],
  );
  const effectiveTutorTrackingCompareEndId = tutorTrackingSnapshotById.has(tutorTrackingCompareEndId)
    ? tutorTrackingCompareEndId
    : tutorTracking.snapshots[0]?.id || "";
  const effectiveTutorTrackingCompareStartId = tutorTrackingSnapshotById.has(tutorTrackingCompareStartId)
    ? tutorTrackingCompareStartId
    : tutorTracking.snapshots[1]?.id || tutorTracking.snapshots[0]?.id || "";
  const tutorTrackingComparison = useMemo(() => {
    const startSnapshot = tutorTrackingSnapshotById.get(effectiveTutorTrackingCompareStartId) ?? null;
    const endSnapshot = tutorTrackingSnapshotById.get(effectiveTutorTrackingCompareEndId) ?? latestTutorTrackingSnapshot ?? null;
    const knownByKey = new Map(tutorTrackingSummary.map((tutor) => [tutor.key, tutor]));
    const startByKey = new Map(startSnapshot?.records.map((record) => [record.key, record]) ?? []);
    const endByKey = new Map(endSnapshot?.records.map((record) => [record.key, record]) ?? []);
    const toSummary = (record: TutorTrackingRecord, isCurrent: boolean): TutorTrackingSummary => {
      const known = knownByKey.get(record.key);
      return {
        ...(known ?? {
          ...record,
          firstSeen: startSnapshot?.date || endSnapshot?.date || "",
          lastSeen: startSnapshot?.date || endSnapshot?.date || "",
          seenCount: 1,
          isCurrent,
        }),
        ...record,
        isCurrent,
      };
    };
    const current = Array.from(endByKey.values()).map((record) => toSummary(record, true));
    const added = Array.from(endByKey.values())
      .filter((record) => !startByKey.has(record.key))
      .map((record) => toSummary(record, true));
    const exited = Array.from(startByKey.values())
      .filter((record) => !endByKey.has(record.key))
      .map((record) => toSummary(record, false));
    return { startSnapshot, endSnapshot, current, added, exited };
  }, [effectiveTutorTrackingCompareEndId, effectiveTutorTrackingCompareStartId, latestTutorTrackingSnapshot, tutorTrackingSnapshotById, tutorTrackingSummary]);
  const comparedCurrentTutors = tutorTrackingComparison.current;
  const comparedAddedTutors = tutorTrackingComparison.added;
  const comparedExitedTutors = tutorTrackingComparison.exited;
  const tutorTrackingCounts = {
    current: comparedCurrentTutors.length,
    newSince: comparedAddedTutors.length,
    exitedSince: comparedExitedTutors.length,
  };
  const filteredTutorTracking = useMemo(() => {
    const normalized = tutorTrackingQuery.trim().toLocaleLowerCase("fr");
    const source =
      tutorTrackingView === "current"
        ? comparedCurrentTutors
        : tutorTrackingView === "new"
          ? comparedAddedTutors
          : comparedExitedTutors;
    return source
      .filter((tutor) => {
        if (!normalized) return true;
        return `${tutor.tutorId} ${tutor.lastName} ${tutor.firstName} ${tutor.phone} ${tutor.email} ${tutor.wantedCity} ${tutorTrackingCommentByKey.get(tutor.key) || ""}`
          .toLocaleLowerCase("fr")
          .includes(normalized);
      })
      .sort((a, b) => {
        const dateA = tutorTrackingView === "exited" ? a.lastSeen : a.firstSeen;
        const dateB = tutorTrackingView === "exited" ? b.lastSeen : b.firstSeen;
        return sortDateValue(dateB) - sortDateValue(dateA);
      });
  }, [comparedAddedTutors, comparedCurrentTutors, comparedExitedTutors, tutorTrackingCommentByKey, tutorTrackingQuery, tutorTrackingView]);
  const selectedAvailabilityReference = useMemo(
    () => availabilityImportData[availabilityReferenceId] ?? null,
    [availabilityImportData, availabilityReferenceId],
  );
  const selectedAvailabilityRecent = useMemo(
    () => availabilityImportData[availabilityRecentId] ?? null,
    [availabilityImportData, availabilityRecentId],
  );
  const selectedInterestReference = interestImportData[interestReferenceId] ?? null;
  const selectedInterestRecent = interestImportData[interestRecentId] ?? null;
  const availabilityDates = useMemo(
    () => Array.from(new Set([
      ...(availabilitySources.includes("availability") ? [...(selectedAvailabilityReference?.rows ?? []), ...(selectedAvailabilityRecent?.rows ?? [])].map((row) => row.date) : []),
      ...(availabilitySources.includes("interest") ? [...(selectedInterestReference?.rows ?? []), ...(selectedInterestRecent?.rows ?? [])].map((row) => row.date) : []),
    ].filter(Boolean))).sort((a, b) => sortDateValue(a) - sortDateValue(b)),
    [availabilitySources, selectedAvailabilityRecent, selectedAvailabilityReference, selectedInterestRecent, selectedInterestReference],
  );
  const effectiveAvailabilityDate = availabilityDates.includes(availabilityDate)
    ? availabilityDate
    : availabilityDates.find((date) => sortDateValue(date) >= sortDateValue(new Date().toISOString().slice(0, 10)))
      ?? availabilityDates[0]
      ?? availabilityDate;
  const availabilityTutorIds = useMemo(() => latestTutorTrackingSnapshot ? new Set(latestTutorTrackingSnapshot.records.map((record) => record.tutorId.trim()).filter(Boolean)) : null, [latestTutorTrackingSnapshot]);
  const availabilityExcludedSourceKeys = useMemo(() => new Set(availabilityExclusions.sourceKeys), [availabilityExclusions.sourceKeys]);
  const availabilitySchoolOwnerByName = useMemo(
    () => new Map(schools.map((school) => [normalizedSchoolLookupName(school.name), school.portfolioOwner || ""])),
    [schools],
  );
  const availabilitySchoolByName = useMemo(
    () => new Map(schools.map((school) => [normalizedSchoolLookupName(school.name), school])),
    [schools],
  );
  const availabilityPeopleForDate = useCallback((side: "reference" | "recent", date: string) => {
    const people = groupAvailabilityPeople({
      availabilityRows: side === "reference" ? selectedAvailabilityReference?.rows ?? [] : selectedAvailabilityRecent?.rows ?? [],
      interestRows: side === "reference" ? selectedInterestReference?.rows ?? [] : selectedInterestRecent?.rows ?? [],
      date,
      sources: availabilitySources,
      exclusions: availabilityExcludedSourceKeys,
      tutorIds: availabilityTutorIds,
    });
    const filtered = new Map<string, AvailabilityTutor>();
    people.forEach((person, personId) => {
      if (person.status !== "unknown" && !availabilityStatuses.includes(person.status)) return;
      const rows = person.rows.filter((row) => {
        const owner = availabilitySchoolOwnerByName.get(normalizedSchoolLookupName(row.school)) || "";
        return availabilitySchoolOwnerFilter === "all" || (availabilitySchoolOwnerFilter === "unassigned" ? !owner : owner === availabilitySchoolOwnerFilter);
      });
      if (rows.length) filtered.set(personId, { ...person, rows });
    });
    return filtered;
  }, [availabilityExcludedSourceKeys, availabilitySchoolOwnerByName, availabilitySchoolOwnerFilter, availabilitySources, availabilityStatuses, availabilityTutorIds, selectedAvailabilityRecent, selectedAvailabilityReference, selectedInterestRecent, selectedInterestReference]);
  const availabilityComparison = useMemo(() => {
    const referenceMap = availabilityPeopleForDate("reference", effectiveAvailabilityDate);
    const recentMap = availabilityPeopleForDate("recent", effectiveAvailabilityDate);
    const newTutors = Array.from(recentMap.values()).filter((tutor) => !referenceMap.has(tutor.tutorId));
    const lostTutors = Array.from(referenceMap.values()).filter((tutor) => !recentMap.has(tutor.tutorId));
    const sameTutors = Array.from(recentMap.values()).filter((tutor) => referenceMap.has(tutor.tutorId));
    const sortTutors = (items: AvailabilityTutor[]) =>
      items.sort((a, b) => availabilityTutorName(a).localeCompare(availabilityTutorName(b), "fr"));
    return {
      referenceCount: referenceMap.size,
      recentCount: recentMap.size,
      referenceRowsCount: Array.from(referenceMap.values()).reduce((sum, person) => sum + person.rows.length, 0),
      recentRowsCount: Array.from(recentMap.values()).reduce((sum, person) => sum + person.rows.length, 0),
      newTutors: sortTutors(newTutors),
      lostTutors: sortTutors(lostTutors),
      sameTutors: sortTutors(sameTutors),
    };
  }, [effectiveAvailabilityDate, availabilityPeopleForDate]);
  const recentAvailabilityDailyCounts = useMemo(() => {
    const dates = new Set<string>();
    if (availabilitySources.includes("availability")) selectedAvailabilityRecent?.rows.forEach((row) => row.date && dates.add(row.date));
    if (availabilitySources.includes("interest")) selectedInterestRecent?.rows.forEach((row) => row.date && dates.add(row.date));
    return Array.from(dates).map((date) => ({ date, count: availabilityPeopleForDate("recent", date).size })).sort((a, b) => sortDateValue(a.date) - sortDateValue(b.date));
  }, [availabilityPeopleForDate, availabilitySources, selectedAvailabilityRecent, selectedInterestRecent]);
  const availabilityStaffingByTutorId = useMemo(() => {
    const byTutor = new Map<string, TutorAssignmentRow[]>();
    const seenByTutor = new Map<string, Set<string>>();
    (latestAvailabilityStaffingImport?.rows ?? [])
      .filter((row) => row.date === effectiveAvailabilityDate && !row.absent && row.tutorId.trim())
      .forEach((row) => {
        const tutorId = row.tutorId.trim();
        const key = `${row.timeSlot}|${normalizedSchoolLookupName(row.school)}`;
        const seen = seenByTutor.get(tutorId) ?? new Set<string>();
        if (seen.has(key)) return;
        seen.add(key);
        seenByTutor.set(tutorId, seen);
        byTutor.set(tutorId, [...(byTutor.get(tutorId) ?? []), row]);
      });
    byTutor.forEach((rows) => rows.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot, "fr")));
    return byTutor;
  }, [effectiveAvailabilityDate, latestAvailabilityStaffingImport]);
  const displayedAvailabilityTutors = useMemo(() => {
    return availabilityView === "new"
      ? availabilityComparison.newTutors
      : availabilityView === "lost"
        ? availabilityComparison.lostTutors
        : availabilityComparison.sameTutors;
  }, [availabilityComparison, availabilityView]);
  const availabilityHiddenItems = useMemo(() => {
    const details = new Map<string, { key: string; source: AvailabilitySource; personId: string; name: string; sessionId: string; school: string; date: string; timeSlot: string }>();
    const add = (source: AvailabilitySource, personId: string, firstName: string, lastName: string, row: { sessionId: string; date: string; school: string; timeSlot: string }) => {
      const key = availabilitySourceKey({ sessionId: row.sessionId, personId, source, date: row.date, school: row.school, timeSlot: row.timeSlot });
      if (!availabilityExcludedSourceKeys.has(key) || details.has(key)) return;
      details.set(key, { key, source, personId, name: `${firstName} ${lastName}`.trim() || `ID ${personId}`, sessionId: row.sessionId, school: row.school, date: row.date, timeSlot: row.timeSlot });
    };
    Object.values(availabilityImportData).forEach((item) => item.rows.forEach((row) => add("availability", row.tutorId, row.firstName, row.lastName, row)));
    Object.values(interestImportData).forEach((item) => item.rows.forEach((row) => add("interest", row.personId, row.firstName, row.lastName, row)));
    return availabilityExclusions.sourceKeys.map((key) => details.get(key) ?? { key, source: key.includes(":interest") || key.includes("interest") ? "interest" as const : "availability" as const, personId: "", name: "Élément d’un ancien import", sessionId: key.split(":")[0] || "", school: "", date: "", timeSlot: "" });
  }, [availabilityExcludedSourceKeys, availabilityExclusions.sourceKeys, availabilityImportData, interestImportData]);
  const filteredSchools = useMemo(() => {
    const normalized = schoolQuery.trim().toLocaleLowerCase("fr");
    return schools
      .filter((school) => {
        const matchesFilter =
          schoolFilter === "all" ||
          (schoolFilter === "with-posts" && school.events.length > 0) ||
          (schoolFilter === "without-posts" && school.events.length === 0) ||
          school.schoolType === schoolFilter;
        if (!matchesFilter) return false;
        if (!normalized) return true;
        const eventsText = school.events.map((event) => `${event.title} ${event.note} ${event.author} ${event.tags.join(" ")}`).join(" ");
        return `${school.name} ${school.city} ${school.contact} ${school.nextAction} ${school.notes} ${school.category} ${schoolTypeLabels[school.schoolType]} ${school.zone} ${school.coordinator} ${school.address} ${school.department} ${school.actions} ${eventsText}`
          .toLocaleLowerCase("fr")
          .includes(normalized);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [schools, schoolQuery, schoolFilter]);
  const assignmentSchools = useMemo(() => {
    const normalized = schoolQuery.trim().toLocaleLowerCase("fr");
    return schools
      .filter((school) => {
        const matchesOwner = schoolAssignmentFilter === "all"
          || (schoolAssignmentFilter === "unassigned" && !school.portfolioOwner)
          || school.portfolioOwner === schoolAssignmentFilter;
        if (!matchesOwner) return false;
        return !normalized || `${school.name} ${school.city} ${school.externalId}`.toLocaleLowerCase("fr").includes(normalized);
      })
      .sort((a, b) => Number(Boolean(a.portfolioOwner)) - Number(Boolean(b.portfolioOwner)) || a.name.localeCompare(b.name, "fr"));
  }, [schoolAssignmentFilter, schoolQuery, schools]);
  const schoolCountsByOwner = useMemo(() => {
    const counts: Record<SchoolPortfolioOwner, number> = { "": 0, kelly: 0, pierre: 0, julie: 0 };
    schools.forEach((school) => { counts[school.portfolioOwner] += 1; });
    return counts;
  }, [schools]);
  const crmFeedItems = useMemo(
    () =>
      filteredSchools
        .flatMap((school) => school.events.map((event): CrmFeedItem => ({ school, event })))
        .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()),
    [filteredSchools],
  );
  const schoolsWithoutEvents = useMemo(
    () => filteredSchools.filter((school) => school.events.length === 0),
    [filteredSchools],
  );
  const selectedSchool = selectedSchoolId
    ? schools.find((school) => school.id === selectedSchoolId) ?? null
    : null;
  const schoolById = useMemo(() => new Map(schools.map((school) => [school.id, school])), [schools]);
  const filteredSchoolWatchlist = useMemo(() => {
    const normalized = schoolWatchQuery.trim().toLocaleLowerCase("fr");
    return schoolWatchlist
      .filter((item) => {
        const school = schoolById.get(item.schoolId);
        const matchesFilter =
          schoolWatchFilter === "all" ||
          item.status === schoolWatchFilter ||
          item.tags.includes(schoolWatchFilter as SchoolWatchTag);
        if (!matchesFilter) return false;
        if (!normalized) return true;
        const commentsText = item.comments.map((comment) => `${comment.text} ${comment.author}`).join(" ");
        return `${school?.name || "Établissement introuvable"} ${school?.city || ""} ${school?.coordinator || ""} ${school?.category || ""} ${school ? schoolTypeLabels[school.schoolType] : ""} ${item.reason} ${item.tags.join(" ")} ${commentsText}`
          .toLocaleLowerCase("fr")
          .includes(normalized);
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "active" ? -1 : 1;
        return sortDateValue(b.updatedAt || b.createdAt) - sortDateValue(a.updatedAt || a.createdAt);
      });
  }, [schoolWatchlist, schoolById, schoolWatchQuery, schoolWatchFilter]);
  const selectedSchoolWatchItem = selectedSchoolWatchId
    ? schoolWatchlist.find((item) => item.id === selectedSchoolWatchId) ?? null
    : null;
  const activeHistory = studentHistory.find((year) => year.year === activeHistoryYear) ?? null;
  const chartYears = studentHistory.filter((year) => selectedHistoryYears.includes(year.year));
  const chartDays = campaignDates(2000).map(campaignDayKey);
  const maxStudentHistoryValue = Math.max(
    1,
    ...chartYears.flatMap((year) => {
      let carried = 0;
      return year.entries.map((entry) => {
        if (entry.value !== null) carried = entry.value;
        return carried;
      });
    }),
  );
  const notifiablePeople = people.filter((person) => person.active);
  const draftAssignee = draft.assigneeId ? peopleById.get(draft.assigneeId) : null;
  const editingTask = editingId ? tasks.find((task) => task.id === editingId) ?? null : null;
  const assignmentChanged = Boolean(draft.assigneeId && draft.assigneeId !== editingTask?.assigneeId);

  async function saveSharedTasks(nextTasks: Task[], message: string, notifyAssignments = true) {
    setSaving(true);
    setSyncError("");
    setTasks(nextTasks);
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: nextTasks, notifyAssignments, sendAssignmentEmail: notifyAssignments }),
      });
      if (!response.ok) throw new Error("save-failed");
      await loadTasks(true);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Sauvegarde impossible");
    } finally {
      setSaving(false);
    }
  }

  async function saveRecurringTasks(nextRecurringTasks: RecurringTask[], message: string) {
    setSaving(true);
    setSyncError("");
    setRecurringTasks(nextRecurringTasks);
    try {
      const response = await fetch("/api/recurring-tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurringTasks: nextRecurringTasks }),
      });
      if (!response.ok) throw new Error("save-recurring-failed");
      const data = (await response.json()) as { recurringTasks?: Partial<RecurringTask>[] };
      setRecurringTasks(
        Array.isArray(data.recurringTasks) ? data.recurringTasks.map(normalizeRecurringTask) : [],
      );
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Modele non sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function saveObjectives(nextObjectives: Objective[], message: string) {
    setSaving(true);
    setSyncError("");
    setObjectives(nextObjectives);
    try {
      const response = await fetch("/api/objectives", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectives: nextObjectives }),
      });
      if (!response.ok) throw new Error("save-objectives-failed");
      const data = (await response.json()) as { objectives?: Partial<Objective>[] };
      setObjectives(Array.isArray(data.objectives) ? data.objectives.map(normalizeObjective) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Objectif non sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function saveLinks(nextLinks: SharedLink[], message: string) {
    setSaving(true);
    setSyncError("");
    setLinks(nextLinks);
    try {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: nextLinks }),
      });
      if (!response.ok) throw new Error("save-links-failed");
      const data = (await response.json()) as { links?: Partial<SharedLink>[] };
      setLinks(Array.isArray(data.links) ? data.links.map(normalizeSharedLink) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Lien non sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function saveJournalPosts(nextPosts: JournalPost[], message: string) {
    setSaving(true);
    setSyncError("");
    const sortedPosts = nextPosts
      .map(normalizeJournalPost)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    setJournalPosts(sortedPosts);
    try {
      const response = await fetch("/api/journal-posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: sortedPosts }),
      });
      if (!response.ok) throw new Error("save-journal-failed");
      const data = (await response.json()) as { posts?: Partial<JournalPost>[] };
      setJournalPosts(Array.isArray(data.posts) ? data.posts.map(normalizeJournalPost) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Post non sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function saveCommunications(nextCommunications: MassCommunication[], message: string) {
    setSaving(true);
    setSyncError("");
    const sortedCommunications = nextCommunications
      .map(normalizeMassCommunication)
      .sort(
        (a, b) =>
          sortDateValue(b.sentAt || b.followUpDate || b.createdAt) -
          sortDateValue(a.sentAt || a.followUpDate || a.createdAt),
      );
    setCommunications(sortedCommunications);
    try {
      const response = await fetch("/api/mass-communications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communications: sortedCommunications }),
      });
      if (!response.ok) throw new Error("save-communications-failed");
      const data = (await response.json()) as { communications?: Partial<MassCommunication>[] };
      setCommunications(
        Array.isArray(data.communications) ? data.communications.map(normalizeMassCommunication) : [],
      );
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Communication non sauvegardée");
    } finally {
      setSaving(false);
    }
  }

  async function saveStaffingDays(nextStaffing: StaffingDay[], message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedStaffing = nextStaffing
      .map(normalizeStaffingDay)
      .sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date));
    setStaffingDays(normalizedStaffing);
    try {
      const response = await fetch("/api/staffing-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffing: normalizedStaffing }),
      });
      if (!response.ok) throw new Error("save-staffing-failed");
      const data = (await response.json()) as { staffing?: Partial<StaffingDay>[] };
      setStaffingDays(Array.isArray(data.staffing) ? data.staffing.map(normalizeStaffingDay) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Staffing non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveTutorReports(nextReports: TutorReportSnapshot[], message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedReports = nextReports
      .map(normalizeTutorReportSnapshot)
      .sort((a, b) => sortDateValue(b.date) - sortDateValue(a.date));
    setTutorReports(normalizedReports);
    try {
      const response = await fetch("/api/tutor-reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports: normalizedReports }),
      });
      if (!response.ok) throw new Error("save-tutor-reports-failed");
      const data = (await response.json()) as { reports?: Partial<TutorReportSnapshot>[] };
      setTutorReports(Array.isArray(data.reports) ? data.reports.map(normalizeTutorReportSnapshot) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Bilans tuteurs non sauvegardés");
    } finally {
      setSaving(false);
    }
  }

  async function saveTutorReportComments(nextComments: TutorReportComment[], message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedComments = nextComments
      .map(normalizeTutorReportComment)
      .filter((comment) => comment.tutorKey);
    setTutorReportComments(normalizedComments);
    try {
      const response = await fetch("/api/tutor-report-comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: normalizedComments }),
      });
      if (!response.ok) throw new Error("save-tutor-report-comments-failed");
      const data = (await response.json()) as { comments?: Partial<TutorReportComment>[] };
      setTutorReportComments(
        Array.isArray(data.comments)
          ? data.comments.map(normalizeTutorReportComment).filter((comment) => comment.tutorKey)
          : [],
      );
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Commentaire tuteur non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveTutorTracking(nextTracking: TutorTrackingData, message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedTracking = normalizeTutorTrackingData(nextTracking);
    setTutorTracking(normalizedTracking);
    try {
      const response = await fetch("/api/tutor-tracking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking: normalizedTracking }),
      });
      if (!response.ok) throw new Error("save-tutor-tracking-failed");
      const data = (await response.json()) as { tracking?: Partial<TutorTrackingData> };
      setTutorTracking(normalizeTutorTrackingData(data.tracking || {}));
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Suivi tuteurs non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveSchoolWatchlist(nextWatchlist: SchoolWatchItem[], message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedWatchlist = nextWatchlist
      .map(normalizeSchoolWatchItem)
      .sort((a, b) => sortDateValue(b.updatedAt || b.createdAt) - sortDateValue(a.updatedAt || a.createdAt));
    setSchoolWatchlist(normalizedWatchlist);
    try {
      const response = await fetch("/api/school-watchlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlist: normalizedWatchlist }),
      });
      if (!response.ok) throw new Error("save-school-watchlist-failed");
      const data = (await response.json()) as { watchlist?: Partial<SchoolWatchItem>[] };
      setSchoolWatchlist(Array.isArray(data.watchlist) ? data.watchlist.map(normalizeSchoolWatchItem) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Suivi non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveSchools(nextSchools: School[], message: string) {
    setSaving(true);
    setSyncError("");
    const sortedSchools = nextSchools
      .map(normalizeSchool)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    setSchools(sortedSchools);
    try {
      const response = await fetch("/api/schools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schools: sortedSchools }),
      });
      if (!response.ok) throw new Error("save-schools-failed");
      const data = (await response.json()) as { schools?: Partial<School>[] };
      setSchools(Array.isArray(data.schools) ? data.schools.map(normalizeSchool) : []);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Établissement non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  function assignSchoolPortfolioOwner(schoolId: string, portfolioOwner: SchoolPortfolioOwner) {
    void saveSchools(
      schools.map((school) => school.id === schoolId ? { ...school, portfolioOwner, updatedAt: new Date().toISOString() } : school),
      portfolioOwner ? `Établissement attribué à ${schoolPortfolioOwnerLabels[portfolioOwner]}` : "Attribution retirée",
    );
  }

  function importSchoolAssignments(text: string) {
    const assignments = new Map<string, { name: string; owner: SchoolPortfolioOwner }>();
    let duplicates = 0;
    let invalid = 0;
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const match = trimmed.match(/^(.*?)\s+((?:pierre|julie|kelly)@etudealpha\.fr|non[- ]attribu[eé])\s*$/i);
      if (!match) {
        invalid += 1;
        return;
      }
      const name = match[1].trim();
      const assignmentValue = match[2].toLocaleLowerCase("fr");
      const owner = assignmentValue.startsWith("non-") || assignmentValue.startsWith("non ")
        ? ""
        : assignmentValue.split("@", 1)[0] as Exclude<SchoolPortfolioOwner, "">;
      const key = normalizedSchoolLookupName(name);
      if (!key) {
        invalid += 1;
        return;
      }
      if (assignments.has(key)) duplicates += 1;
      assignments.set(key, { name, owner });
    });
    if (!assignments.size) {
      setSchoolAssignmentImportReport({ matched: 0, changed: 0, duplicates, invalid, unmatched: [] });
      setToast("Aucune attribution reconnue dans le texte");
      return;
    }
    const knownNames = new Set(schools.map((school) => normalizedSchoolLookupName(school.name)));
    const unmatched = Array.from(assignments.entries()).filter(([key]) => !knownNames.has(key)).map(([, item]) => item.name);
    let matched = 0;
    let changed = 0;
    const now = new Date().toISOString();
    const nextSchools = schools.map((school) => {
      const assignment = assignments.get(normalizedSchoolLookupName(school.name));
      if (!assignment) return school;
      matched += 1;
      if (school.portfolioOwner === assignment.owner) return school;
      changed += 1;
      return { ...school, portfolioOwner: assignment.owner, updatedAt: now };
    });
    setSchoolAssignmentImportReport({ matched, changed, duplicates, invalid, unmatched });
    void saveSchools(nextSchools, `${changed} attribution${changed > 1 ? "s" : ""} préremplie${changed > 1 ? "s" : ""} · ${matched} établissement${matched > 1 ? "s" : ""} reconnu${matched > 1 ? "s" : ""}`);
  }

  async function importSchoolAssignmentsFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setSchoolAssignmentPaste(text);
    importSchoolAssignments(text);
  }

  function exportSchoolAssignments() {
    const header = ["ID établissement", "Établissement", "Ville", "Département", "Type", "Catégorie", "Responsable", "Email responsable", "Statut attribution"];
    const rows = [...schools]
      .sort((a, b) => Number(Boolean(a.portfolioOwner)) - Number(Boolean(b.portfolioOwner)) || a.name.localeCompare(b.name, "fr"))
      .map((school) => [
        school.externalId,
        school.name,
        school.city,
        school.department,
        schoolTypeLabels[school.schoolType],
        school.category,
        schoolPortfolioOwnerLabels[school.portfolioOwner],
        schoolPortfolioOwnerEmails[school.portfolioOwner],
        school.portfolioOwner ? "Attribué" : "Non attribué",
      ]);
    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `repartition-etablissements-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`${schools.length} établissements exportés`);
  }

  async function saveStudentHistory(nextHistory: StudentHistoryYear[], message: string) {
    setSaving(true);
    setSyncError("");
    const normalizedHistory = nextHistory.map(normalizeStudentHistoryYear).sort((a, b) => b.year - a.year);
    setStudentHistory(normalizedHistory);
    try {
      const response = await fetch("/api/student-history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: normalizedHistory }),
      });
      if (!response.ok) throw new Error("save-student-history-failed");
      const data = (await response.json()) as { history?: Partial<StudentHistoryYear>[] };
      const savedHistory = Array.isArray(data.history) ? data.history.map(normalizeStudentHistoryYear) : [];
      setStudentHistory(savedHistory);
      setToast(message);
    } catch {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast("Historique non sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function savePeople(nextPeople: PersonDraft[], message: string) {
    setSaving(true);
    try {
      const response = await fetch("/api/people", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: nextPeople }),
      });
      if (!response.ok) throw new Error("save-people-failed");
      const data = (await response.json()) as { people?: Partial<Person>[] };
      setPeople(Array.isArray(data.people) ? data.people.map(normalizePerson) : []);
      setToast(message);
    } catch {
      setToast("Personnes non sauvegardees");
    } finally {
      setSaving(false);
    }
  }

  function openNewTask() {
    setEditingId(null);
    setDraft({ ...emptyDraft, startDate: new Date().toISOString().slice(0, 10) });
    setSendAssignmentEmail(true);
    setEditorOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      description: task.description,
      owner: task.owner,
      assigneeId: task.assigneeId,
      startDate: task.startDate,
      endDate: task.endDate,
      estimatedHours: task.estimatedHours,
      status: task.status,
      priority: task.priority,
      verified: task.verified,
      verificationOwner: task.verificationOwner,
      verificationComment: task.verificationComment,
    });
    setSendAssignmentEmail(true);
    setEditorOpen(true);
  }

  function selectAssignee(personId: string) {
    const person = peopleById.get(personId);
    setDraft({
      ...draft,
      assigneeId: person?.id || null,
      owner: person?.name || draft.owner,
    });
    setSendAssignmentEmail(Boolean(person?.hasEmail));
  }

  function openNewRecurringTask() {
    setEditingRecurringId(null);
    setRecurringDraft(emptyRecurringDraft);
    setRecurringOpen(true);
  }

  function openEditRecurringTask(task: RecurringTask) {
    setEditingRecurringId(task.id);
    setRecurringDraft({
      title: task.title,
      description: task.description,
      owner: task.owner,
      assigneeId: task.assigneeId,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
    });
    setRecurringOpen(true);
  }

  function selectRecurringAssignee(personId: string) {
    const person = peopleById.get(personId);
    setRecurringDraft({
      ...recurringDraft,
      assigneeId: person?.id || null,
      owner: person?.name || recurringDraft.owner,
    });
  }

  async function saveRecurringTask(event: FormEvent) {
    event.preventDefault();
    if (!recurringDraft.title.trim() || !recurringDraft.owner.trim() || saving) return;
    const cleanDraft = {
      ...recurringDraft,
      title: recurringDraft.title.trim(),
      description: recurringDraft.description.trim(),
      owner: recurringDraft.owner.trim(),
      estimatedHours:
        typeof recurringDraft.estimatedHours === "number" &&
        Number.isFinite(recurringDraft.estimatedHours) &&
        recurringDraft.estimatedHours > 0
          ? recurringDraft.estimatedHours
          : null,
    };
    if (editingRecurringId) {
      await saveRecurringTasks(
        recurringTasks.map((task) => (task.id === editingRecurringId ? { ...task, ...cleanDraft } : task)),
        "Modele recurrent mis a jour",
      );
    } else {
      await saveRecurringTasks(
        [{ ...cleanDraft, id: uid("recurring"), createdAt: new Date().toISOString() }, ...recurringTasks],
        "Modele recurrent ajoute",
      );
    }
    setRecurringOpen(false);
  }

  function createTaskFromRecurring(task: RecurringTask) {
    setEditingId(null);
    setDraft({
      title: task.title,
      description: task.description,
      owner: task.owner,
      assigneeId: task.assigneeId,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      estimatedHours: task.estimatedHours,
      status: "todo",
      priority: task.priority,
      verified: false,
      verificationOwner: "",
      verificationComment: "",
    });
    const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
    setSendAssignmentEmail(Boolean(assignee?.hasEmail));
    setEditorOpen(true);
  }

  async function deleteRecurringTask(taskId: string) {
    if (!window.confirm("Supprimer ce modele recurrent ?")) return;
    await saveRecurringTasks(
      recurringTasks.filter((task) => task.id !== taskId),
      "Modele recurrent supprime",
    );
  }

  function openNewLink() {
    setEditingLinkId(null);
    setLinkDraft(emptyLinkDraft);
    setLinkOpen(true);
  }

  function openEditLink(link: SharedLink) {
    setEditingLinkId(link.id);
    setLinkDraft({
      title: link.title,
      description: link.description,
      url: link.url,
    });
    setLinkOpen(true);
  }

  async function saveLink(event: FormEvent) {
    event.preventDefault();
    const url = normalizeUrl(linkDraft.url);
    if (!linkDraft.title.trim() || !url || saving) return;
    const cleanDraft = {
      ...linkDraft,
      title: linkDraft.title.trim(),
      description: linkDraft.description.trim(),
      url,
    };
    if (editingLinkId) {
      await saveLinks(
        links.map((link) => (link.id === editingLinkId ? { ...link, ...cleanDraft } : link)),
        "Lien mis a jour",
      );
    } else {
      await saveLinks(
        [{ ...cleanDraft, id: uid("link"), createdAt: new Date().toISOString() }, ...links],
        "Lien ajoute",
      );
    }
    setLinkOpen(false);
  }

  async function deleteLink(linkId: string) {
    if (!window.confirm("Supprimer ce lien ?")) return;
    await saveLinks(links.filter((link) => link.id !== linkId), "Lien supprime");
  }

  function openNewJournalPost() {
    setEditingJournalId(null);
    setJournalDraft({
      ...emptyJournalDraft,
      author: authorName.trim() || "",
      publishedAt: new Date().toISOString().slice(0, 10),
    });
    setJournalOpen(true);
  }

  function openEditJournalPost(post: JournalPost) {
    setEditingJournalId(post.id);
    setJournalDraft({
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags,
      personIds: post.personIds,
      publishedAt: post.publishedAt.slice(0, 10),
    });
    setJournalOpen(true);
  }

  function toggleJournalPerson(personId: string, checked: boolean) {
    setJournalDraft((current) => ({
      ...current,
      personIds: checked
        ? [...current.personIds, personId]
        : current.personIds.filter((id) => id !== personId),
    }));
  }

  async function saveJournalPost(event: FormEvent) {
    event.preventDefault();
    if (!journalDraft.title.trim() || !journalDraft.content.trim() || saving) return;
    const now = new Date().toISOString();
    const cleanDraft = {
      ...journalDraft,
      title: journalDraft.title.trim(),
      content: journalDraft.content.trim(),
      author: journalDraft.author.trim() || authorName.trim() || "Equipe Alpha",
      tags: normalizeTags(journalDraft.tags),
      personIds: Array.from(new Set(journalDraft.personIds)),
      publishedAt: journalDraft.publishedAt
        ? new Date(`${journalDraft.publishedAt}T12:00:00`).toISOString()
        : now,
      updatedAt: now,
    };
    if (cleanDraft.author && cleanDraft.author !== "Equipe Alpha") setAuthorName(cleanDraft.author);

    if (editingJournalId) {
      const existingPost = journalPosts.find((post) => post.id === editingJournalId);
      await saveJournalPosts(
        journalPosts.map((post) =>
          post.id === editingJournalId
            ? {
                ...(existingPost ?? post),
                ...cleanDraft,
                id: editingJournalId,
                createdAt: existingPost?.createdAt || post.createdAt,
              }
            : post,
        ),
        "Post mis a jour",
      );
    } else {
      await saveJournalPosts(
        [{ ...cleanDraft, id: uid("journal"), likes: [], comments: [], createdAt: now }, ...journalPosts],
        "Post ajoute au journal",
      );
    }
    setJournalOpen(false);
  }

  async function deleteJournalPost(postId: string) {
    if (!window.confirm("Supprimer ce post du journal ?")) return;
    await saveJournalPosts(journalPosts.filter((post) => post.id !== postId), "Post supprime");
  }

  async function likeJournalPost(postId: string) {
    const now = new Date().toISOString();
    const author = authorName.trim() || "Anonyme";
    await saveJournalPosts(
      journalPosts.map((post) =>
        post.id === postId
          ? { ...post, likes: [...post.likes, { id: uid("like"), author, createdAt: now }], updatedAt: now }
          : post,
      ),
      "Like ajouté",
    );
  }

  async function addJournalComment(postId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const author = String(data.get("author") || "").trim() || authorName.trim() || "Anonyme";
    const text = String(data.get("comment") || "").trim();
    if (!text) return;
    const now = new Date().toISOString();
    if (author !== "Anonyme") setAuthorName(author);
    await saveJournalPosts(
      journalPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { id: uid("social-comment"), author, text, createdAt: now }], updatedAt: now }
          : post,
      ),
      "Commentaire ajouté",
    );
    form.reset();
  }

  function openNewCommunication() {
    setEditingCommunicationId(null);
    setCommunicationDraft({
      ...emptyCommunicationDraft,
      author: authorName.trim() || "",
      sentAt: new Date().toISOString().slice(0, 10),
    });
    setCommunicationOpen(true);
  }

  function openEditCommunication(communication: MassCommunication) {
    setEditingCommunicationId(communication.id);
    setCommunicationDraft({
      title: communication.title,
      messageSummary: communication.messageSummary,
      audiences: communication.audiences,
      channel: communication.channel,
      status: communication.status,
      sentAt: communication.sentAt ? communication.sentAt.slice(0, 10) : "",
      followUpDate: communication.followUpDate ? communication.followUpDate.slice(0, 10) : "",
      author: communication.author,
      notes: communication.notes,
      tags: communication.tags,
    });
    setCommunicationOpen(true);
  }

  function toggleCommunicationAudience(audience: CommunicationAudience, checked: boolean) {
    setCommunicationDraft((current) => ({
      ...current,
      audiences: checked
        ? Array.from(new Set([...current.audiences, audience]))
        : current.audiences.filter((item) => item !== audience),
    }));
  }

  async function saveCommunication(event: FormEvent) {
    event.preventDefault();
    if (!communicationDraft.title.trim() || communicationDraft.audiences.length === 0 || saving) return;
    const now = new Date().toISOString();
    const cleanDraft = {
      ...communicationDraft,
      title: communicationDraft.title.trim(),
      messageSummary: communicationDraft.messageSummary.trim(),
      audiences: Array.from(new Set(communicationDraft.audiences)),
      channel: communicationDraft.channel.trim() || "Email",
      sentAt: communicationDraft.sentAt,
      followUpDate: communicationDraft.followUpDate,
      author: communicationDraft.author.trim() || authorName.trim() || "Equipe Alpha",
      notes: communicationDraft.notes.trim(),
      tags: normalizeTags(communicationDraft.tags),
      updatedAt: now,
    };
    if (cleanDraft.author && cleanDraft.author !== "Equipe Alpha") setAuthorName(cleanDraft.author);

    if (editingCommunicationId) {
      const existingCommunication = communications.find((communication) => communication.id === editingCommunicationId);
      await saveCommunications(
        communications.map((communication) =>
          communication.id === editingCommunicationId
            ? {
                ...(existingCommunication ?? communication),
                ...cleanDraft,
                id: editingCommunicationId,
                createdAt: existingCommunication?.createdAt || communication.createdAt,
              }
            : communication,
        ),
        "Communication mise à jour",
      );
    } else {
      await saveCommunications(
        [{ ...cleanDraft, id: uid("communication"), createdAt: now }, ...communications],
        "Communication ajoutée",
      );
    }
    setCommunicationOpen(false);
  }

  async function deleteCommunication(communicationId: string) {
    if (!window.confirm("Supprimer cette communication ?")) return;
    await saveCommunications(
      communications.filter((communication) => communication.id !== communicationId),
      "Communication supprimée",
    );
  }

  async function updateStaffingValue(
    dayId: string,
    personKey: StaffingPersonKey,
    field: keyof StaffingPersonStats,
    value: string,
  ) {
    const count = normalizeSessionCount(value);
    const now = new Date().toISOString();
    await saveStaffingDays(
      staffingDays.map((day) => {
        if (day.id !== dayId) return day;
        const people = {
          ...day.people,
          [personKey]: {
            ...day.people[personKey],
            [field]: count,
          },
        };
        const peopleTotals = staffingPeopleTotals(people);
        return {
          ...day,
          people,
          totalStaffedSessions: field === "staffedSessions" ? peopleTotals.staffed : day.totalStaffedSessions,
          totalUnstaffedSessions: field === "unstaffedSessions" ? peopleTotals.unstaffed : day.totalUnstaffedSessions,
          updatedAt: now,
        };
      }),
      "Staffing mis à jour",
    );
  }

  async function updateStaffingTotal(
    dayId: string,
    field: "totalStaffedSessions" | "totalUnstaffedSessions",
    value: string,
  ) {
    const count = normalizeSessionCount(value);
    const now = new Date().toISOString();
    await saveStaffingDays(
      staffingDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              [field]: count,
              updatedAt: now,
            }
          : day,
      ),
      "Total staffing mis à jour",
    );
  }

  async function importTutorReportPaste() {
    if (!tutorReportDate || saving) return;
    const entries = parseTutorReportPaste(tutorReportPaste);
    if (!entries.length) {
      setToast("Aucune ligne valide à importer");
      return;
    }
    const now = new Date().toISOString();
    const existing = tutorReports.find((report) => report.date === tutorReportDate);
    const existingComments = new Map(
      (existing?.entries ?? [])
        .filter((entry) => entry.comment.trim())
        .map((entry) => [tutorIdentityKey(entry), entry.comment] as const),
    );
    const nextSnapshot = normalizeTutorReportSnapshot({
      id: existing?.id || `tutor-reports-${tutorReportDate}`,
      date: tutorReportDate,
      entries: entries.map((entry) => ({ ...entry, comment: entry.comment || existingComments.get(tutorIdentityKey(entry)) || "" })),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      comment: existing?.comment || "",
    });
    await saveTutorReports(
      [nextSnapshot, ...tutorReports.filter((report) => report.date !== tutorReportDate)],
      existing ? "Bilans tuteurs remplacés" : "Bilans tuteurs importés",
    );
    setTutorReportPaste("");
  }

  async function importTutorReportFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      setTutorReportPaste(text);
      setToast(`Fichier chargé pour le ${formatFullDate(tutorReportDate)}`);
    } catch {
      setToast("Fichier illisible. Exportez-le en CSV ou TSV puis réessayez.");
    }
  }

  async function deleteTutorReportSnapshot(date: string) {
    if (!window.confirm(`Supprimer les bilans tuteurs du ${formatFullDate(date)} ?`)) return;
    const nextReports = tutorReports.filter((report) => report.date !== date);
    await saveTutorReports(nextReports, "Bilans tuteurs supprimés");
    setTutorReportDate(nextReports[0]?.date || new Date().toISOString().slice(0, 10));
  }

  async function updateTutorReportEntryComment(date: string, entryId: string, commentValue: string) {
    const now = new Date().toISOString();
    await saveTutorReports(
      tutorReports.map((report) =>
        report.date === date
          ? {
              ...report,
              entries: report.entries.map((entry) =>
                entry.id === entryId ? { ...entry, comment: commentValue.trim() } : entry,
              ),
              updatedAt: now,
            }
          : report,
      ),
      "Commentaire tuteur sauvegardé",
    );
  }

  async function updateTutorReportGlobalComment(tutorKey: string, commentValue: string) {
    const now = new Date().toISOString();
    const trimmedComment = commentValue.trim();
    const withoutTutor = tutorReportComments.filter((commentItem) => commentItem.tutorKey !== tutorKey);
    const nextComments = trimmedComment
      ? [...withoutTutor, { tutorKey, comment: trimmedComment, updatedAt: now }]
      : withoutTutor;
    await saveTutorReportComments(nextComments, "Commentaire global sauvegardé");
  }

  async function deleteTutorReportEntry(date: string, entryId: string) {
    const report = tutorReports.find((item) => item.date === date);
    const entry = report?.entries.find((item) => item.id === entryId);
    if (!report || !entry) return;
    if (!window.confirm(`Supprimer la ligne de ${tutorDisplayName(entry)} pour le ${formatFullDate(date)} ?`)) return;
    const now = new Date().toISOString();
    await saveTutorReports(
      tutorReports.map((item) =>
        item.date === date
          ? { ...item, entries: item.entries.filter((line) => line.id !== entryId), updatedAt: now }
          : item,
      ),
      "Ligne tuteur supprimée",
    );
  }

  async function deleteTutorReportAggregate(tutor: TutorReportAggregate) {
    const periodLabel = `${tutorReportStartDate ? formatFullDate(tutorReportStartDate) : "le début"} → ${tutorReportEndDate ? formatFullDate(tutorReportEndDate) : "aujourd’hui"}`;
    if (!window.confirm(`Supprimer ${tutorDisplayName(tutor)} de la vue globale pour la période ${periodLabel} ?\n\nCela supprimera ses lignes dans les imports de cette période.`)) return;
    const now = new Date().toISOString();
    await saveTutorReports(
      tutorReports.map((report) => {
        const inPeriod = filteredTutorReportsForGlobal.some((filteredReport) => filteredReport.date === report.date);
        if (!inPeriod) return report;
        return {
          ...report,
          entries: report.entries.filter((entry) => tutorIdentityKey(entry) !== tutor.key),
          updatedAt: now,
        };
      }),
      "Tuteur supprimé de la vue globale",
    );
  }

  function exportTutorReportAggregatesCsv() {
    const periodLabel = `${tutorReportStartDate || "debut"}-${tutorReportEndDate || "aujourdhui"}`;
    const header = [
      "Rang",
      "ID tuteur",
      "Nom",
      "Prénom",
      "Téléphone",
      "Établissements",
      "Nombre de dates",
      "Bilans non faits",
      "Élèves concernés",
      "Dates concernées",
      "Détail par date",
      "Commentaire général",
    ];
    const rows = tutorReportAggregates.map((tutor, index) => [
      index + 1,
      tutor.tutorId,
      tutor.lastName,
      tutor.firstName,
      tutor.phone,
      tutor.schools.join(" | "),
      tutor.dateCount,
      tutor.totalMissing,
      tutor.totalStudents,
      tutor.dates.map((dateItem) => formatFullDate(dateItem.date)).join(" | "),
      tutor.dates
        .map((dateItem) => `${formatFullDate(dateItem.date)} : ${dateItem.missingReportCount} bilan(s), ${dateItem.studentCount} élève(s), ${dateItem.school || "établissement non renseigné"}`)
        .join(" | "),
      tutorReportCommentByKey.get(tutor.key) || "",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bilans-tuteurs-global-${periodLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Export CSV téléchargé");
  }

  async function importTutorTrackingCsv(csvValue = tutorTrackingCsv, fileName = "liste-tuteurs.csv") {
    if (!tutorTrackingDate || saving) return;
    const records = parseTutorTrackingCsv(csvValue);
    if (!records.length) {
      setToast("Aucun tuteur valide à importer");
      return;
    }
    setSaving(true);
    setSyncError("");
    try {
      const response = await fetch("/api/tutor-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: tutorTrackingDate, fileName, rawCsv: csvValue }),
      });
      const data = (await response.json()) as {
        snapshot?: Partial<TutorTrackingSnapshot>;
        tracking?: Partial<TutorTrackingData>;
        error?: string;
        detail?: string;
      };
      if (!response.ok) throw new Error(data.detail || data.error || "Import tuteurs impossible");
      const nextTracking = normalizeTutorTrackingData(data.tracking || {});
      const importedSnapshot = data.snapshot
        ? normalizeTutorTrackingSnapshot(data.snapshot)
        : nextTracking.snapshots[0];
      setTutorTracking(nextTracking);
      if (importedSnapshot) {
        setSelectedTutorTrackingSnapshotId(importedSnapshot.id);
        setTutorTrackingCompareEndId(importedSnapshot.id);
        const previousSnapshot = nextTracking.snapshots.find((snapshot) => snapshot.id !== importedSnapshot.id);
        setTutorTrackingCompareStartId(previousSnapshot?.id || importedSnapshot.id);
      }
      setTutorTrackingCsv("");
      setToast("Nouvel import tuteurs sauvegardé dans Fichiers");
    } catch (error) {
      setSyncError("L’import des tuteurs n’a pas été sauvegardé");
      setToast(error instanceof Error ? error.message : "Import tuteurs impossible");
    } finally {
      setSaving(false);
    }
  }

  async function importTutorTrackingFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      setTutorTrackingCsv(text);
      await importTutorTrackingCsv(text, file.name);
    } catch {
      setToast("Fichier CSV illisible");
    }
  }

  function exportVisibleTutorTrackingCsv() {
    const header = [
      "Vue",
      "ID",
      "Nom",
      "Prénom",
      "Téléphone",
      "Email",
      "Ville souhaitée",
      "Arrivé le",
      "Dernière présence",
      "Statut comparaison",
      "Commentaire",
    ];
    const rows = filteredTutorTracking.map((tutor) => [
      tutorTrackingView === "new" ? "Nouveau" : tutorTrackingView === "exited" ? "Sorti" : "Actuel",
      tutor.tutorId,
      tutor.lastName,
      tutor.firstName,
      tutor.phone,
      tutor.email,
      tutor.wantedCity,
      tutor.firstSeen,
      tutor.lastSeen,
      tutor.isCurrent ? "Présent à la date finale" : "Absent à la date finale",
      tutorTrackingCommentByKey.get(tutor.key) || "",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tuteurs-affiches-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Export CSV tuteurs téléchargé");
  }

  async function deleteTutorTrackingSnapshot(snapshotId: string) {
    const snapshot = tutorTracking.snapshots.find((item) => item.id === snapshotId);
    if (!snapshot || !window.confirm(`Supprimer « ${tutorTrackingImportLabel(snapshot)} » ?`)) return;
    const nextSnapshots = tutorTracking.snapshots.filter((item) => item.id !== snapshotId);
    await saveTutorTracking({ ...tutorTracking, snapshots: nextSnapshots }, "Import tuteurs supprimé");
    const nextSelectedId = nextSnapshots[0]?.id || "";
    setSelectedTutorTrackingSnapshotId(nextSelectedId);
    if (tutorTrackingCompareStartId === snapshotId) {
      setTutorTrackingCompareStartId(nextSnapshots[1]?.id || nextSelectedId);
    }
    if (tutorTrackingCompareEndId === snapshotId) {
      setTutorTrackingCompareEndId(nextSelectedId);
    }
  }

  async function updateTutorTrackingComment(tutorKey: string, commentValue: string) {
    const now = new Date().toISOString();
    const trimmedComment = commentValue.trim();
    const otherComments = tutorTracking.comments.filter((commentItem) => commentItem.tutorKey !== tutorKey);
    const nextComments = trimmedComment
      ? [...otherComments, { tutorKey, comment: trimmedComment, updatedAt: now }]
      : otherComments;
    await saveTutorTracking({ ...tutorTracking, comments: nextComments }, "Commentaire tuteur sauvegardé");
  }

  async function importAvailabilityFile(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setSyncError("");
    try {
      const text = await file.text();
      const response = await fetch("/api/availability-imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name || "disponibilites.csv", rawCsv: text }),
      });
      const data = (await response.json()) as {
        import?: Partial<AvailabilityImport>;
        imports?: Partial<AvailabilityImport>[];
        error?: string;
        detail?: string;
      };
      if (!response.ok) throw new Error(data.detail || data.error || "import-availability-failed");
      const previousNewestId = availabilityImports[0]?.id || "";
      const importedItem = data.import ? normalizeAvailabilityImport(data.import) : null;
      const imports = Array.isArray(data.imports)
        ? data.imports
            .map(normalizeAvailabilityImport)
            .sort((a, b) => sortDateValue(b.importedAt) - sortDateValue(a.importedAt))
        : importedItem
          ? [importedItem, ...availabilityImports]
          : availabilityImports;
      setAvailabilityImports(imports.map((item) => ({ ...item, rows: [], rawCsv: "" })));
      if (importedItem) {
        setAvailabilityImportData((current) => ({ ...current, [importedItem.id]: importedItem }));
        setAvailabilityRecentId(importedItem.id);
        setAvailabilityReferenceId(previousNewestId || importedItem.id);
        setAvailabilityDate(bestAvailabilityDate(importedItem.rows) || availabilityDate);
      }
      setAvailabilityView("new");
      setToast("Import de disponibilités ajouté · sauvegardé sur Netlify");
    } catch (error) {
      console.error(error);
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Fichier CSV illisible");
    } finally {
      setSaving(false);
    }
  }

  async function importInterestFile(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setSyncError("");
    try {
      const rawCsv = await file.text();
      const response = await fetch(`/api/tutor-interest-imports?fileName=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: { "Content-Type": "text/csv;charset=utf-8" },
        body: rawCsv,
      });
      const data = await response.json() as { import?: TutorInterestImport; error?: string; detail?: string };
      if (!response.ok || !data.import) throw new Error(data.detail || data.error || "import-interest-failed");
      const previousNewestId = interestImports[0]?.id || "";
      setInterestImports((current) => [{ ...data.import!, rows: [] }, ...current.filter((item) => item.id !== data.import!.id)]);
      setInterestImportData((current) => ({ ...current, [data.import!.id]: data.import! }));
      setInterestRecentId(data.import.id);
      setInterestReferenceId(previousNewestId || data.import.id);
      setAvailabilityDate(bestAvailabilityDate(data.import.rows) || availabilityDate);
      setAvailabilityView("new");
      setToast("Import d’intérêts ajouté · sauvegardé sur Netlify");
    } catch (error) {
      setSyncError("Sauvegarde impossible, rechargez la page avant de continuer");
      setToast(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Fichier CSV illisible");
    } finally {
      setSaving(false);
    }
  }

  function toggleAvailabilitySource(source: AvailabilitySource) {
    setAvailabilitySources((current) => current.includes(source)
      ? current.length > 1 ? current.filter((item) => item !== source) : current
      : [...current, source]);
  }

  function toggleAvailabilityStatus(status: "tutor" | "candidate") {
    setAvailabilityStatuses((current) => current.includes(status)
      ? current.length > 1 ? current.filter((item) => item !== status) : current
      : [...current, status]);
  }

  async function saveAvailabilityExclusions(next: UnstaffedExclusions, successMessage: string) {
    const previous = availabilityExclusions;
    const prepared = { ...next, updatedAt: new Date().toISOString() };
    setAvailabilityExclusions(prepared);
    setSaving(true);
    try {
      const response = await fetch("/api/unstaffed-exclusions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exclusions: prepared }),
      });
      const data = await response.json() as { exclusions?: UnstaffedExclusions; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Exclusion non sauvegardée");
      setAvailabilityExclusions(data.exclusions ?? prepared);
      setToast(successMessage);
    } catch (error) {
      setAvailabilityExclusions(previous);
      setToast(error instanceof Error ? error.message : "Exclusion non sauvegardée");
    } finally {
      setSaving(false);
    }
  }

  function hideAvailabilityOpportunitySource(tutorId: string, row: AvailabilityOpportunity, source: AvailabilitySource) {
    const key = availabilitySourceKey({ sessionId: row.sessionId, personId: tutorId, source, date: row.date, school: row.school, timeSlot: row.timeSlot });
    if (availabilityExclusions.sourceKeys.includes(key)) return;
    void saveAvailabilityExclusions(
      { ...availabilityExclusions, sourceKeys: [...availabilityExclusions.sourceKeys, key] },
      `${source === "interest" ? "Intérêt" : "Disponibilité"} masqué${source === "interest" ? "" : "e"} durablement`,
    );
  }

  function restoreAvailabilityOpportunitySource(key: string) {
    void saveAvailabilityExclusions(
      { ...availabilityExclusions, sourceKeys: availabilityExclusions.sourceKeys.filter((item) => item !== key) },
      "Élément réaffiché",
    );
  }

  function exportAvailabilityCategoryCsv() {
    const categoryLabel =
      availabilityView === "new"
        ? "Nouvelle disponibilité"
        : availabilityView === "lost"
          ? "Disponibilité perdue"
          : "Disponibilité inchangée";
    const header = [
      "Catégorie",
      "Date analysée",
      "ID",
      "Nom",
      "Prénom",
      "Téléphone",
      "Statut",
      "Grade",
      "Créneaux",
      "Établissements",
      "Classes",
      "Groupes",
      "IDs séances",
      "Sources",
      "Intérêts validés",
      "Nombre de créneaux",
    ];
    const rows = displayedAvailabilityTutors.map((tutor) => [
      categoryLabel,
      effectiveAvailabilityDate,
      tutor.tutorId,
      tutor.lastName,
      tutor.firstName,
      tutor.phone,
      tutor.status === "tutor" ? "Tuteur" : tutor.status === "candidate" ? "Candidat" : "Statut inconnu",
      tutor.grade,
      tutor.rows.map((row) => row.timeSlot).filter(Boolean).join(" | "),
      tutor.rows.map((row) => row.school).filter(Boolean).join(" | "),
      tutor.rows.map((row) => row.className).filter(Boolean).join(" | "),
      tutor.rows.map((row) => row.group).filter(Boolean).join(" | "),
      tutor.rows.map((row) => row.sessionId).filter(Boolean).join(" | "),
      tutor.rows.map((row) => row.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + ")).join(" | "),
      tutor.rows.filter((row) => row.validatedInterest).map((row) => row.sessionId || `${row.timeSlot} — ${row.school}`).join(" | "),
      tutor.rows.length,
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comparaison-disponibilites-${availabilityView}-${effectiveAvailabilityDate || "date"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Export CSV téléchargé");
  }

  function openNewSchoolWatchItem(schoolId = "") {
    setEditingSchoolWatchId(null);
    setSchoolWatchDraft({
      ...emptySchoolWatchDraft,
      schoolId,
      author: authorName.trim() || "",
    });
    setSchoolWatchOpen(true);
  }

  function openEditSchoolWatchItem(item: SchoolWatchItem) {
    setEditingSchoolWatchId(item.id);
    setSchoolWatchDraft({
      schoolId: item.schoolId,
      reason: item.reason,
      tags: item.tags,
      status: item.status,
      initialComment: "",
      author: authorName.trim() || item.comments[0]?.author || "",
    });
    setSchoolWatchOpen(true);
  }

  function toggleSchoolWatchTag(tag: SchoolWatchTag) {
    setSchoolWatchDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  }

  async function saveSchoolWatchItem(event: FormEvent) {
    event.preventDefault();
    if (!schoolWatchDraft.schoolId || !schoolWatchDraft.reason.trim() || saving) return;
    const now = new Date().toISOString();
    const author = schoolWatchDraft.author.trim() || authorName.trim() || "Equipe Alpha";
    if (author && author !== "Equipe Alpha") setAuthorName(author);

    if (editingSchoolWatchId) {
      const existingItem = schoolWatchlist.find((item) => item.id === editingSchoolWatchId);
      await saveSchoolWatchlist(
        schoolWatchlist.map((item) =>
          item.id === editingSchoolWatchId
            ? {
                ...(existingItem ?? item),
                schoolId: schoolWatchDraft.schoolId,
                reason: schoolWatchDraft.reason.trim(),
                tags: schoolWatchDraft.tags,
                status: schoolWatchDraft.status,
                resolvedAt:
                  schoolWatchDraft.status === "resolved"
                    ? existingItem?.resolvedAt || now
                    : "",
                updatedAt: now,
              }
            : item,
        ),
        "Suivi mis à jour",
      );
    } else {
      const initialComment = schoolWatchDraft.initialComment.trim()
        ? [{ id: uid("watch-comment"), text: schoolWatchDraft.initialComment.trim(), author, createdAt: now }]
        : [];
      const newItem: SchoolWatchItem = {
        id: uid("watch"),
        schoolId: schoolWatchDraft.schoolId,
        reason: schoolWatchDraft.reason.trim(),
        tags: schoolWatchDraft.tags,
        status: "active",
        comments: initialComment,
        createdAt: now,
        updatedAt: now,
        resolvedAt: "",
      };
      await saveSchoolWatchlist([newItem, ...schoolWatchlist], "Établissement ajouté au suivi");
      setSelectedSchoolWatchId(newItem.id);
    }
    setSchoolWatchOpen(false);
  }

  async function addSchoolWatchComment(itemId: string) {
    const text = schoolWatchComment.trim();
    if (!text || saving) return;
    const now = new Date().toISOString();
    const author = authorName.trim() || "Equipe Alpha";
    await saveSchoolWatchlist(
      schoolWatchlist.map((item) =>
        item.id === itemId
          ? {
              ...item,
              comments: [{ id: uid("watch-comment"), text, author, createdAt: now }, ...item.comments],
              updatedAt: now,
            }
          : item,
      ),
      "Commentaire ajouté",
    );
    setSchoolWatchComment("");
  }

  async function toggleSchoolWatchStatus(item: SchoolWatchItem) {
    const now = new Date().toISOString();
    const nextStatus: SchoolWatchStatus = item.status === "active" ? "resolved" : "active";
    await saveSchoolWatchlist(
      schoolWatchlist.map((watchItem) =>
        watchItem.id === item.id
          ? {
              ...watchItem,
              status: nextStatus,
              resolvedAt: nextStatus === "resolved" ? now : "",
              updatedAt: now,
            }
          : watchItem,
      ),
      nextStatus === "resolved" ? "Suivi marqué résolu" : "Suivi réactivé",
    );
  }

  async function deleteSchoolWatchItem(itemId: string) {
    if (!window.confirm("Supprimer ce suivi d'établissement ?")) return;
    await saveSchoolWatchlist(
      schoolWatchlist.filter((item) => item.id !== itemId),
      "Suivi supprimé",
    );
    if (selectedSchoolWatchId === itemId) setSelectedSchoolWatchId(null);
  }

  function openNewSchool() {
    setEditingSchoolId(null);
    setSchoolDraft(emptySchoolDraft);
    setSchoolOpen(true);
  }

  function openEditSchool(school: School) {
    setEditingSchoolId(school.id);
    setSchoolDraft({
      externalId: school.externalId,
      name: school.name,
      category: school.category,
      schoolType: school.schoolType,
      portfolioOwner: school.portfolioOwner,
      zone: school.zone,
      coordinator: school.coordinator,
      registeredCount: school.registeredCount,
      city: school.city,
      address: school.address,
      department: school.department,
      upcomingWeek: school.upcomingWeek,
      pastSessions: school.pastSessions,
      typicalWeek: school.typicalWeek,
      contractSigned: school.contractSigned,
      actions: school.actions,
      contact: school.contact,
      nextAction: school.nextAction,
      notes: school.notes,
    });
    setSchoolOpen(true);
  }

  async function saveSchool(event: FormEvent) {
    event.preventDefault();
    if (!schoolDraft.name.trim() || saving) return;
    const requestedExternalId = schoolDraft.externalId.trim();
    const schoolUsingId = requestedExternalId
      ? schools.find((school) => school.externalId === requestedExternalId && school.id !== editingSchoolId)
      : null;
    if (schoolUsingId) {
      setToast(`L’ID établissement ${requestedExternalId} est déjà utilisé par ${schoolUsingId.name}`);
      return;
    }
    const now = new Date().toISOString();
    const cleanDraft = {
      ...schoolDraft,
      externalId: requestedExternalId,
      name: schoolDraft.name.trim(),
      category: schoolDraft.category.trim(),
      zone: schoolDraft.zone.trim(),
      coordinator: schoolDraft.coordinator.trim(),
      registeredCount: normalizePositiveNumber(schoolDraft.registeredCount, true),
      city: schoolDraft.city.trim(),
      address: schoolDraft.address.trim(),
      department: schoolDraft.department.trim(),
      upcomingWeek: schoolDraft.upcomingWeek.trim(),
      pastSessions: schoolDraft.pastSessions.trim(),
      typicalWeek: schoolDraft.typicalWeek.trim(),
      contractSigned: schoolDraft.contractSigned.trim(),
      actions: schoolDraft.actions.trim(),
      contact: schoolDraft.contact.trim(),
      nextAction: schoolDraft.nextAction.trim(),
      notes: schoolDraft.notes.trim(),
      updatedAt: now,
    };

    if (editingSchoolId) {
      await saveSchools(
        schools.map((school) =>
          school.id === editingSchoolId
            ? { ...school, ...cleanDraft, id: editingSchoolId, createdAt: school.createdAt }
            : school,
        ),
        "Établissement mis à jour",
      );
    } else {
      await saveSchools(
        [{ ...cleanDraft, id: uid("school"), events: [], createdAt: now }, ...schools],
        "Établissement ajouté",
      );
    }
    setSchoolOpen(false);
  }

  async function deleteSchool(schoolId: string) {
    if (!window.confirm("Supprimer cet établissement et tout son historique ?")) return;
    await saveSchools(schools.filter((school) => school.id !== schoolId), "Établissement supprimé");
  }

  function openSchoolEvent(schoolId?: string) {
    setEventSchoolId(schoolId ?? null);
    setSchoolEventDraft({
      ...emptySchoolEventDraft,
      author: authorName.trim() || "",
      date: new Date().toISOString().slice(0, 10),
    });
    setSchoolEventOpen(true);
  }

  function toggleSchoolEventTag(tag: string) {
    setSchoolEventDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  }

  async function saveSchoolEvent(event: FormEvent) {
    event.preventDefault();
    if (!eventSchoolId || (!schoolEventDraft.title.trim() && !schoolEventDraft.note.trim()) || saving) return;
    const now = new Date().toISOString();
    const cleanEvent: SchoolEvent = {
      id: uid("school-event"),
      kind: schoolEventDraft.kind,
      title: schoolEventDraft.title.trim(),
      note: schoolEventDraft.note.trim(),
      author: schoolEventDraft.author.trim() || authorName.trim() || "Equipe Alpha",
      tags: normalizeTags(schoolEventDraft.tags),
      likes: [],
      comments: [],
      date: schoolEventDraft.date ? new Date(`${schoolEventDraft.date}T12:00:00`).toISOString() : now,
      createdAt: now,
    };
    if (cleanEvent.author && cleanEvent.author !== "Equipe Alpha") setAuthorName(cleanEvent.author);
    await saveSchools(
      schools.map((school) =>
        school.id === eventSchoolId
          ? {
              ...school,
              events: [cleanEvent, ...school.events].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              ),
              updatedAt: now,
            }
          : school,
      ),
      "Historique établissement mis à jour",
    );
    setSchoolEventOpen(false);
    setEventSchoolId(null);
  }

  async function likeSchoolEvent(schoolId: string, eventId: string) {
    const now = new Date().toISOString();
    const author = authorName.trim() || "Anonyme";
    await saveSchools(
      schools.map((school) =>
        school.id === schoolId
          ? {
              ...school,
              events: school.events.map((event) =>
                event.id === eventId
                  ? { ...event, likes: [...event.likes, { id: uid("like"), author, createdAt: now }] }
                  : event,
              ),
              updatedAt: now,
            }
          : school,
      ),
      "Like CRM ajouté",
    );
  }

  async function addSchoolEventComment(schoolId: string, eventId: string, formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const data = new FormData(form);
    const author = String(data.get("author") || "").trim() || authorName.trim() || "Anonyme";
    const text = String(data.get("comment") || "").trim();
    if (!text) return;
    const now = new Date().toISOString();
    if (author !== "Anonyme") setAuthorName(author);
    await saveSchools(
      schools.map((school) =>
        school.id === schoolId
          ? {
              ...school,
              events: school.events.map((event) =>
                event.id === eventId
                  ? { ...event, comments: [...event.comments, { id: uid("social-comment"), author, text, createdAt: now }] }
                  : event,
              ),
              updatedAt: now,
            }
          : school,
      ),
      "Commentaire CRM ajouté",
    );
    form.reset();
  }

  function openNewQualitativeObjective() {
    setEditingObjectiveId(null);
    setObjectiveDraft(emptyQualitativeObjectiveDraft);
    setObjectiveOpen(true);
  }

  function openObjective(objective?: Objective) {
    setEditingObjectiveId(objective?.id ?? null);
    setObjectiveDraft(
      objective
        ? {
            kind: objective.kind,
            title: objective.title,
            description: objective.description,
            targetLabel: objective.targetLabel,
            currentValue: objective.currentValue,
            targetValue: objective.targetValue,
            startDate: objective.startDate,
            endDate: objective.endDate,
            status: objective.status,
            progressNote: objective.progressNote,
            personIds: objective.personIds,
          }
        : emptyObjectiveDraft,
    );
    setObjectiveOpen(true);
  }

  function toggleObjectivePerson(personId: string, checked: boolean) {
    setObjectiveDraft((current) => ({
      ...current,
      personIds: checked
        ? [...current.personIds, personId]
        : current.personIds.filter((id) => id !== personId),
    }));
  }

  async function saveObjective(event: FormEvent) {
    event.preventDefault();
    const currentValue = normalizePositiveNumber(objectiveDraft.currentValue, true) ?? 0;
    const targetValue = normalizePositiveNumber(objectiveDraft.targetValue, false);
    if (!objectiveDraft.title.trim() || (objectiveDraft.kind === "counter" && !targetValue) || saving) return;
    const cleanDraft = {
      ...objectiveDraft,
      title: objectiveDraft.title.trim(),
      description: objectiveDraft.description.trim(),
      targetLabel: objectiveDraft.kind === "counter" ? objectiveDraft.targetLabel.trim() || "éléments" : "",
      currentValue: objectiveDraft.kind === "counter" ? currentValue : null,
      targetValue: objectiveDraft.kind === "counter" ? targetValue : null,
      startDate: objectiveDraft.startDate,
      endDate:
        objectiveDraft.endDate && objectiveDraft.startDate && objectiveDraft.endDate < objectiveDraft.startDate
          ? objectiveDraft.startDate
          : objectiveDraft.endDate,
      progressNote: objectiveDraft.progressNote.trim(),
      personIds: Array.from(new Set(objectiveDraft.personIds)),
    };
    if (editingObjectiveId) {
      const existingObjective = objectives.find((objective) => objective.id === editingObjectiveId);
      const updatedObjective = {
        ...(existingObjective ?? { id: editingObjectiveId, createdAt: new Date().toISOString() }),
        ...cleanDraft,
      } as Objective;
      await saveObjectives(
        existingObjective
          ? objectives.map((objective) => (objective.id === editingObjectiveId ? updatedObjective : objective))
          : [updatedObjective, ...objectives],
        "Objectif mis a jour",
      );
    } else {
      await saveObjectives(
        [{ ...cleanDraft, id: uid("objective"), createdAt: new Date().toISOString() }, ...objectives],
        "Objectif ajoute",
      );
    }
    setObjectiveOpen(false);
  }

  async function deleteObjective(objectiveId: string) {
    if (!window.confirm("Supprimer cet objectif ?")) return;
    await saveObjectives(objectives.filter((objective) => objective.id !== objectiveId), "Objectif supprime");
  }

  async function addStudentHistoryYear() {
    const typedYear = window.prompt("Quelle annee ajouter ?", String(new Date().getFullYear()));
    if (!typedYear) return;
    const year = Number(typedYear.trim());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setToast("Annee invalide");
      return;
    }
    if (studentHistory.some((item) => item.year === year)) {
      setActiveHistoryYear(year);
      setSelectedHistoryYears((current) => (current.includes(year) ? current : [...current, year]));
      setToast("Cette annee existe deja");
      return;
    }
    const nextYear = normalizeStudentHistoryYear({
      year,
      entries: campaignDates(year).map((date) => ({ date, value: null })),
      createdAt: new Date().toISOString(),
    });
    setActiveHistoryYear(year);
    setSelectedHistoryYears((current) => [...new Set([...current, year])]);
    await saveStudentHistory([nextYear, ...studentHistory], "Annee ajoutee");
  }

  async function updateStudentHistoryValue(year: number, date: string, typedValue: string) {
    const value = typedValue.trim() === "" ? null : normalizePositiveNumber(typedValue, true);
    if (typedValue.trim() !== "" && value === null) {
      setToast("Nombre d'eleves invalide");
      return;
    }
    const nextHistory = studentHistory.map((historyYear) =>
      historyYear.year === year
        ? {
            ...historyYear,
            entries: historyYear.entries.map((entry) => (entry.date === date ? { ...entry, value } : entry)),
          }
        : historyYear,
    );
    await saveStudentHistory(nextHistory, "Historique mis a jour");
  }

  function toggleHistoryYear(year: number, checked: boolean) {
    setSelectedHistoryYears((current) =>
      checked ? [...new Set([...current, year])] : current.filter((item) => item !== year),
    );
  }

  async function copyCurrentTabLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("onglet", appModeSlugs[appMode]);
    const link = `${url.origin}${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    try {
      await navigator.clipboard.writeText(link);
      setToast("Lien de l'onglet copié");
    } catch {
      window.prompt("Copiez ce lien", link);
    }
  }

  async function saveTask(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.owner.trim() || !draft.startDate || saving) return;

    const cleanDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      owner: draft.owner.trim(),
      verificationOwner: draft.verificationOwner.trim(),
      verificationComment: draft.verificationComment.trim(),
      estimatedHours:
        typeof draft.estimatedHours === "number" && Number.isFinite(draft.estimatedHours) && draft.estimatedHours > 0
          ? draft.estimatedHours
          : null,
      endDate: draft.endDate && draft.endDate < draft.startDate ? draft.startDate : draft.endDate,
    };
    const shouldSendAssignmentEmail = Boolean(sendAssignmentEmail && draftAssignee?.hasEmail && assignmentChanged);

    if (editingId) {
      await saveSharedTasks(
        tasks.map((task) => (task.id === editingId ? { ...task, ...cleanDraft } : task)),
        "Tache mise a jour",
        shouldSendAssignmentEmail,
      );
    } else {
      await saveSharedTasks(
        [
          {
            ...cleanDraft,
            id: uid("task"),
            comments: [],
            completionNotifications: [],
            createdAt: new Date().toISOString(),
          },
          ...tasks,
        ],
        "Tache ajoutee",
        shouldSendAssignmentEmail,
      );
    }
    setEditorOpen(false);
  }

  async function changeStatus(taskId: string, status: Status) {
    await saveSharedTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      `Statut : ${statusLabels[status]}`,
      false,
    );
  }

  async function addComment(event: FormEvent) {
    event.preventDefault();
    const author = authorName.trim();
    if (!selectedId || !comment.trim() || !author || saving) return;
    const newComment: Comment = {
      id: uid("comment"),
      text: comment.trim(),
      author,
      createdAt: new Date().toISOString(),
    };
    await saveSharedTasks(
      tasks.map((task) =>
        task.id === selectedId ? { ...task, comments: [newComment, ...task.comments] } : task,
      ),
      "Commentaire ajoute",
      false,
    );
    setComment("");
  }

  async function deleteTask(taskId: string) {
    if (!window.confirm("Supprimer cette tache ?")) return;
    await saveSharedTasks(tasks.filter((task) => task.id !== taskId), "Tache supprimee", false);
    setSelectedId(null);
  }

  function openPerson(person?: Person) {
    setPersonDraft(
      person
        ? { id: person.id, name: person.name, email: "", active: person.active }
        : emptyPersonDraft,
    );
    setPeopleOpen(true);
  }

  async function savePerson(event: FormEvent) {
    event.preventDefault();
    if (!personDraft.name.trim()) return;
    const nextPerson: PersonDraft = {
      ...personDraft,
      id: personDraft.id || uid("person"),
      name: personDraft.name.trim(),
      email: personDraft.email.trim(),
    };
    const otherPeople = people
      .filter((person) => person.id !== nextPerson.id)
      .map((person) => ({ ...person, email: "" }));
    await savePeople([...otherPeople, nextPerson], "Personne sauvegardee");
    setPersonDraft(emptyPersonDraft);
  }

  function openCompletionNotice(task: Task) {
    setNotifyTaskId(task.id);
    setNotifyRecipients([]);
    setNotifyOpen(true);
  }

  async function sendCompletionNotice(event: FormEvent) {
    event.preventDefault();
    if (!notifyTask || !notifyRecipients.length) return;
    setNotifying(true);
    try {
      const response = await fetch(`/api/tasks/${notifyTask.id}/notify-completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personIds: notifyRecipients }),
      });
      if (!response.ok) throw new Error("notify-failed");
      const data = (await response.json()) as { sent?: number; tasks?: Partial<Task>[] };
      if (Array.isArray(data.tasks)) setTasks(data.tasks.map(normalizeTask));
      setToast(`${data.sent || 0} email(s) envoye(s)`);
      setNotifyOpen(false);
      setNotifyRecipients([]);
    } catch {
      setToast("Notification impossible");
    } finally {
      setNotifying(false);
    }
  }

  function exportTasks() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taches-partagees-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Sauvegarde telechargee");
  }

  async function importTasks(file: File | undefined) {
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error("invalid");
      if (!window.confirm("Remplacer toutes les taches partagees par ce fichier ?")) return;
      await saveSharedTasks(imported.map(normalizeTask), "Taches importees", false);
    } catch {
      setToast("Ce fichier n'est pas valide");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  function studentHistoryPath(historyYear: StudentHistoryYear) {
    let carried = 0;
    const points = chartDays.map((dayKey, index) => {
      const entry = historyYear.entries.find((item) => campaignDayKey(item.date) === dayKey);
      if (entry?.value !== null && entry?.value !== undefined) carried = entry.value;
      const x = chartDays.length <= 1 ? 0 : (index / (chartDays.length - 1)) * 1000;
      const y = 180 - (carried / maxStudentHistoryValue) * 150;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return points.join(" ");
  }

  function miniStudentHistoryPath() {
    const historyYear = activeHistory ?? chartYears[0] ?? studentHistory[0];
    if (!historyYear) return "";
    let carried = 0;
    const maxValue = Math.max(1, ...historyYear.entries.map((entry) => entry.value ?? 0));
    return historyYear.entries
      .map((entry, index) => {
        if (entry.value !== null) carried = entry.value;
        const x = historyYear.entries.length <= 1 ? 0 : (index / (historyYear.entries.length - 1)) * 100;
        const y = 42 - (carried / maxValue) * 34;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  function latestStudentHistoryValue() {
    const historyYear = activeHistory ?? chartYears[0] ?? studentHistory[0];
    if (!historyYear) return null;
    return historyYear.entries.reduce<number | null>((latest, entry) => entry.value ?? latest, null);
  }

  function renderAvailabilityComparisonSection() {
    const importLabel = (item: { displayName: string; importedAt: string }) => `${item.displayName} · ${formatJournalDate(item.importedAt)}`;
    const comparisonReady = (!availabilitySources.includes("availability") || Boolean(selectedAvailabilityReference && selectedAvailabilityRecent))
      && (!availabilitySources.includes("interest") || Boolean(selectedInterestReference && selectedInterestRecent));
    return (
      <section className="task-panel availability-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comparaison des disponibilités et des intérêts</p>
            <h2>Repérer les nouvelles personnes mobilisables</h2>
            <p className="panel-intro">
              Comparez deux versions par personne et pour une date précise, en réunissant les disponibilités et les demandes d’intérêt sélectionnées.
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={() => { void loadAvailabilityImports(); void loadLatestAvailabilityStaffing(); void loadSchools(); void loadTutorTracking(); }}>
            ↻ Actualiser
          </button>
        </div>

        <div className="availability-import-box availability-dual-import">
          <div>
            <strong>Ajouter des données à comparer</strong>
            <span>Les fichiers sont conservés et administrables dans l’onglet Fichiers.</span>
          </div>
          <label className="import-button">
            Importer des disponibilités
            <input
              type="file"
              accept=".csv,text/csv,.txt"
              onChange={(event) => {
                void importAvailabilityFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <label className="import-button interest">
            Importer des intérêts
            <input type="file" accept=".csv,text/csv,.txt" onChange={(event) => { void importInterestFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
          </label>
        </div>

        <div className="availability-compare-grid">
          <label>
            Date à analyser
            {availabilityDates.length ? (
              <select value={effectiveAvailabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)}>
                {availabilityDates.map((date) => (
                  <option key={date} value={date}>
                    {formatFullDate(date)}
                  </option>
                ))}
              </select>
            ) : (
              <input type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} />
            )}
          </label>
          <label className={!availabilitySources.includes("availability") ? "disabled" : ""}>
            Disponibilités · référence
            <select value={availabilityReferenceId} onChange={(event) => setAvailabilityReferenceId(event.target.value)} disabled={!availabilitySources.includes("availability")}>
              <option value="">Sélectionner</option>
              {availabilityImports.map((item) => (
                <option key={item.id} value={item.id}>
                  {importLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className={!availabilitySources.includes("interest") ? "disabled" : ""}>
            Intérêts · référence
            <select value={interestReferenceId} onChange={(event) => setInterestReferenceId(event.target.value)} disabled={!availabilitySources.includes("interest")}>
              <option value="">Sélectionner</option>
              {interestImports.map((item) => <option key={item.id} value={item.id}>{importLabel(item)}</option>)}
            </select>
          </label>
          <label className={!availabilitySources.includes("availability") ? "disabled" : ""}>
            Disponibilités · récent
            <select value={availabilityRecentId} onChange={(event) => setAvailabilityRecentId(event.target.value)} disabled={!availabilitySources.includes("availability")}>
              <option value="">Sélectionner</option>
              {availabilityImports.map((item) => (
                <option key={item.id} value={item.id}>
                  {importLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className={!availabilitySources.includes("interest") ? "disabled" : ""}>
            Intérêts · récent
            <select value={interestRecentId} onChange={(event) => setInterestRecentId(event.target.value)} disabled={!availabilitySources.includes("interest")}>
              <option value="">Sélectionner</option>
              {interestImports.map((item) => <option key={item.id} value={item.id}>{importLabel(item)}</option>)}
            </select>
          </label>
        </div>

        <div className="availability-filter-bar">
          <div><strong>Sources</strong><span><button type="button" className={availabilitySources.includes("availability") ? "active" : ""} onClick={() => toggleAvailabilitySource("availability")}>Disponibilités</button><button type="button" className={availabilitySources.includes("interest") ? "active" : ""} onClick={() => toggleAvailabilitySource("interest")}>Intérêts</button></span></div>
          <div><strong>Personnes</strong><span><button type="button" className={availabilityStatuses.includes("tutor") ? "active" : ""} onClick={() => toggleAvailabilityStatus("tutor")}>Tuteurs</button><button type="button" className={availabilityStatuses.includes("candidate") ? "active" : ""} onClick={() => toggleAvailabilityStatus("candidate")}>Candidats</button></span></div>
          <div className="availability-owner-buttons"><strong>Responsable RH</strong><span>{(["all", "kelly", "pierre", "julie", "unassigned"] as const).map((owner) => <button type="button" className={availabilitySchoolOwnerFilter === owner ? "active" : ""} onClick={() => setAvailabilitySchoolOwnerFilter(owner)} key={owner}>{owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolPortfolioOwnerLabels[owner]}</button>)}</span></div>
          {availabilityExclusions.sourceKeys.length ? <button type="button" className={showAvailabilityHidden ? "active hidden-toggle" : "hidden-toggle"} onClick={() => setShowAvailabilityHidden((current) => !current)}>Éléments masqués ({availabilityExclusions.sourceKeys.length})</button> : null}
        </div>
        {!latestTutorTrackingSnapshot ? <p className="availability-status-warning">Aucune liste de tuteurs disponible : le statut tuteur/candidat ne peut pas être déterminé.</p> : null}

        {showAvailabilityHidden && availabilityHiddenItems.length ? <div className="availability-hidden-list"><div><strong>Disponibilités et intérêts masqués</strong><span>Ces exclusions s’appliquent aussi aux séances non affectées et aux prochains imports.</span></div>{availabilityHiddenItems.map((item) => <article key={item.key}><span><strong>{item.source === "interest" ? "Intérêt" : "Disponibilité"} · {item.name}</strong><small>{item.date ? `${formatFullDate(item.date)} · ` : ""}{item.timeSlot || "Horaire inconnu"}{item.school ? ` · ${item.school}` : ""}{item.sessionId ? ` · séance #${item.sessionId}` : ""}</small></span><button type="button" onClick={() => restoreAvailabilityOpportunitySource(item.key)} disabled={saving}>Réafficher</button></article>)}</div> : null}

        <div className="availability-daily-summary" aria-label="Personnes mobilisables par jour dans les fichiers récents">
          <div className="availability-daily-summary-heading">
            <strong>Personnes mobilisables par jour</strong>
            <span>{[availabilitySources.includes("availability") ? selectedAvailabilityRecent?.displayName : "", availabilitySources.includes("interest") ? selectedInterestRecent?.displayName : ""].filter(Boolean).join(" + ") || "Aucun fichier récent sélectionné"}</span>
          </div>
          <div className="availability-daily-counts">
            {recentAvailabilityDailyCounts.length ? recentAvailabilityDailyCounts.map((item) => (
              <button
                type="button"
                key={item.date}
                className={effectiveAvailabilityDate === item.date ? "active" : ""}
                onClick={() => setAvailabilityDate(item.date)}
                title={`Analyser les personnes mobilisables du ${formatFullDate(item.date)}`}
              >
                <span>{formatDate(item.date)}</span>
                <strong>{item.count}</strong>
                <small>personne{item.count > 1 ? "s" : ""}</small>
              </button>
            )) : (
              <span className="availability-daily-empty">Aucune date disponible dans ce fichier.</span>
            )}
          </div>
        </div>

        <div className="availability-tabs">
          <button type="button" className={availabilityView === "new" ? "active" : ""} onClick={() => setAvailabilityView("new")}>
            ✨ Nouvelles ({availabilityComparison.newTutors.length})
          </button>
          <button type="button" className={availabilityView === "lost" ? "active" : ""} onClick={() => setAvailabilityView("lost")}>
            ↘ Perdues ({availabilityComparison.lostTutors.length})
          </button>
          <button type="button" className={availabilityView === "same" ? "active" : ""} onClick={() => setAvailabilityView("same")}>
            = Inchangées ({availabilityComparison.sameTutors.length})
          </button>
          <button type="button" className="ghost-button" onClick={exportAvailabilityCategoryCsv} disabled={!displayedAvailabilityTutors.length}>
            Export CSV
          </button>
        </div>
        <p className="availability-staffing-source">
          {latestAvailabilityStaffingImport
            ? `Séances déjà prévues vérifiées avec « ${latestAvailabilityStaffingImport.displayName} » (${formatJournalDate(latestAvailabilityStaffingImport.importedAt)}).`
            : "Aucun fichier de staffing disponible pour vérifier les séances déjà prévues."}
        </p>

        <div className={`availability-results ${availabilityView === "new" ? "is-new" : ""}`}>
          {!comparisonReady ? (
            <div className="empty-state compact">Choisissez un fichier de référence et un fichier récent pour chaque source active.</div>
          ) : displayedAvailabilityTutors.length ? (
            displayedAvailabilityTutors.map((tutor) => {
              const assignedSessions = availabilityStaffingByTutorId.get(tutor.tutorId) ?? [];
              return <article key={tutor.tutorId} className="availability-card">
                <div className="availability-card-header">
                  <div>
                    <h3>
                      <PersonAdminLink
                        personId={tutor.tutorId}
                        status={tutor.status}
                      >
                        {availabilityTutorName(tutor)}
                      </PersonAdminLink>
                      <span className={`person-status ${tutor.status}`}>{tutor.status === "tutor" ? "Tuteur" : tutor.status === "candidate" ? "Candidat" : "Statut inconnu"}</span>
                    </h3>
                    <p>ID {tutor.tutorId} · {tutor.phone || "téléphone non renseigné"}{tutor.grade ? ` · ${tutor.grade}` : ""}</p>
                  </div>
                  <span>{tutor.rows.length} créneau{tutor.rows.length > 1 ? "x" : ""}</span>
                </div>
                <div className={`availability-staffing-status ${assignedSessions.length ? "has-assignment" : "is-free"}`}>
                  <strong>{assignedSessions.length ? `${assignedSessions.length} séance${assignedSessions.length > 1 ? "s" : ""} déjà prévue${assignedSessions.length > 1 ? "s" : ""} ce jour` : "Aucune séance prévue ce jour"}</strong>
                  {assignedSessions.map((session, index) => {
                    const staffingSchool = availabilitySchoolByName.get(normalizedSchoolLookupName(session.school));
                    return <span key={`${session.timeSlot}-${session.school}-${index}`}>
                      {session.timeSlot || "Horaire non renseigné"} · <SchoolAdminLink schoolId={staffingSchool?.externalId}>{session.school || "Établissement non renseigné"}</SchoolAdminLink>
                    </span>;
                  })}
                </div>
                <div className="availability-slots">
                  {tutor.rows.map((row, index) => {
                    const availabilitySchool = availabilitySchoolByName.get(normalizedSchoolLookupName(row.school));
                    return <div key={`${row.sessionId || row.timeSlot}-${index}`}>
                      <strong>{row.timeSlot || "Horaire non renseigné"}</strong>
                      <span><SchoolAdminLink schoolId={availabilitySchool?.externalId}>{row.school || "Établissement non renseigné"}</SchoolAdminLink> · {row.className || "classe n/a"} · {row.group || "groupe n/a"}</span>
                      <span className="availability-row-sources">{row.sources.map((source) => <em className={source} key={source}>{source === "availability" ? "Disponibilité" : "Intérêt"}{source === "interest" && row.validatedInterest ? " validé" : ""}<button type="button" onClick={() => hideAvailabilityOpportunitySource(tutor.tutorId, row, source)} disabled={saving} title={`Masquer ${source === "availability" ? "cette disponibilité" : "cet intérêt"}`}>×</button></em>)}{row.sessionId ? <small>Séance {row.sessionId}</small> : null}</span>
                    </div>;
                  })}
                </div>
              </article>;
            })
          ) : (
            <div className="empty-state compact">Aucune personne dans cette catégorie pour la date choisie.</div>
          )}
        </div>
      </section>
    );
  }

  function renderTutorTrackingSection() {
    const latestLabel = latestTutorTrackingSnapshot ? tutorTrackingImportLabel(latestTutorTrackingSnapshot) : "aucun import";
    const activeSnapshot = tutorTrackingSnapshotById.get(selectedTutorTrackingSnapshotId) ?? tutorTracking.snapshots[0] ?? null;
    const comparisonStartLabel = tutorTrackingComparison.startSnapshot ? tutorTrackingImportLabel(tutorTrackingComparison.startSnapshot) : "import de départ manquant";
    const comparisonEndLabel = tutorTrackingComparison.endSnapshot ? tutorTrackingImportLabel(tutorTrackingComparison.endSnapshot) : "import d’arrivée manquant";
    const viewLabel =
      tutorTrackingView === "new"
        ? "Nouveaux tuteurs"
        : tutorTrackingView === "exited"
          ? "Tuteurs sortis"
          : "Tuteurs présents à la date finale";

    return (
      <section className="task-panel tutor-tracking-panel">
        <div className="panel-heading">
          <div>
            <h2>Suivi des tuteurs</h2>
            <p>Importez régulièrement un CSV pour voir les nouveaux tuteurs, les sorties et annoter les suivis.</p>
          </div>
          <div className="filters">
            <button className="button quiet" onClick={() => { void loadTutorTracking(); }} disabled={saving}>↻ Actualiser</button>
          </div>
        </div>

        <div className="tutor-tracking-hero">
          <div>
            <span className="history-badge">Suivi</span>
            <h3>Dernière liste : {latestLabel}</h3>
            <p>{tutorTracking.snapshots.length} import{tutorTracking.snapshots.length > 1 ? "s" : ""} enregistré{tutorTracking.snapshots.length > 1 ? "s" : ""} · comparaison {comparisonStartLabel} → {comparisonEndLabel}</p>
          </div>
          <div className="tutor-tracking-metrics">
            <div><span>À la date finale</span><strong>{tutorTrackingCounts.current}</strong></div>
            <div><span>Nouveaux</span><strong>{tutorTrackingCounts.newSince}</strong></div>
            <div><span>Sortis</span><strong>{tutorTrackingCounts.exitedSince}</strong></div>
          </div>
        </div>

        <div className="tutor-tracking-controls">
          <label>
            <span>Comparer l’import</span>
            <select value={effectiveTutorTrackingCompareStartId} onChange={(event) => setTutorTrackingCompareStartId(event.target.value)} disabled={!tutorTracking.snapshots.length}>
              {!tutorTracking.snapshots.length && <option value="">Aucun import</option>}
              {tutorTracking.snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {tutorTrackingImportLabel(snapshot)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Avec l’import</span>
            <select value={effectiveTutorTrackingCompareEndId} onChange={(event) => setTutorTrackingCompareEndId(event.target.value)} disabled={!tutorTracking.snapshots.length}>
              {!tutorTracking.snapshots.length && <option value="">Aucun import</option>}
              {tutorTracking.snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {tutorTrackingImportLabel(snapshot)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Date liée à l’import</span>
            <input type="date" value={tutorTrackingDate} onChange={(event) => setTutorTrackingDate(event.target.value)} />
          </label>
          {tutorTracking.snapshots.length > 0 && (
            <label>
              <span>Imports enregistrés</span>
              <select value={activeSnapshot?.id || ""} onChange={(event) => setSelectedTutorTrackingSnapshotId(event.target.value)}>
                {tutorTracking.snapshots.map((snapshot) => (
                  <option key={snapshot.id} value={snapshot.id}>{tutorTrackingImportLabel(snapshot)}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="tutor-tracking-import">
          <div>
            <strong>Importer un CSV de tuteurs</strong>
            <span>Choisissez d’abord la date liée à l’import. Le fichier est sauvegardé immédiatement et devient visible dans l’onglet Fichiers.</span>
          </div>
          <div className="tutor-tracking-file-row">
            <input type="file" accept=".csv,text/csv,.txt" onChange={(event) => { void importTutorTrackingFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
            <button className="button primary" onClick={() => { void importTutorTrackingCsv(); }} disabled={saving || !tutorTrackingDate || !tutorTrackingCsv.trim()}>
              Sauvegarder le contenu collé
            </button>
            {activeSnapshot && (
              <button className="button quiet danger-text" onClick={() => { void deleteTutorTrackingSnapshot(activeSnapshot.id); }} disabled={saving}>
                Supprimer cet import
              </button>
            )}
          </div>
          <textarea
            value={tutorTrackingCsv}
            onChange={(event) => setTutorTrackingCsv(event.target.value)}
            placeholder="Ou collez ici le contenu CSV, puis cliquez sur « Sauvegarder le contenu collé »…"
            aria-label="CSV des tuteurs"
          />
        </div>

        <div className="tutor-tracking-tabs" role="group" aria-label="Filtrer le suivi tuteurs">
          <button className={tutorTrackingView === "new" ? "active" : ""} onClick={() => setTutorTrackingView("new")}>Nouveaux <span>{tutorTrackingCounts.newSince}</span></button>
          <button className={tutorTrackingView === "exited" ? "active" : ""} onClick={() => setTutorTrackingView("exited")}>Sortis <span>{tutorTrackingCounts.exitedSince}</span></button>
          <button className={tutorTrackingView === "current" ? "active" : ""} onClick={() => setTutorTrackingView("current")}>Actuels <span>{tutorTrackingCounts.current}</span></button>
        </div>

        <div className="panel-heading tutor-tracking-list-heading">
          <div>
            <h3>{viewLabel}</h3>
            <p>{filteredTutorTracking.length} tuteur{filteredTutorTracking.length > 1 ? "s" : ""} affiché{filteredTutorTracking.length > 1 ? "s" : ""}</p>
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={tutorTrackingQuery} onChange={(event) => setTutorTrackingQuery(event.target.value)} placeholder="Rechercher nom, téléphone, ville..." />
          </label>
          <button className="button quiet" onClick={exportVisibleTutorTrackingCsv} disabled={!filteredTutorTracking.length} type="button">
            Export CSV
          </button>
        </div>

        <div className="tutor-tracking-list">
          {filteredTutorTracking.length ? filteredTutorTracking.map((tutor) => (
            <article className={`tutor-tracking-card ${tutor.isCurrent ? "is-current" : "is-exited"}`} key={tutor.key}>
              <div>
                <strong><PersonAdminLink personId={tutor.tutorId} status="tutor">{tutorTrackingDisplayName(tutor)}</PersonAdminLink></strong>
                <small>{tutor.wantedCity || "Ville souhaitée non renseignée"}</small>
                <div className="tutor-tracking-meta">
                  {tutor.tutorId && <span>ID {tutor.tutorId}</span>}
                  {tutor.phone && <span>{tutor.phone}</span>}
                  {tutor.email && <span>{tutor.email}</span>}
                  <span>Arrivé : {formatDate(tutor.firstSeen)}</span>
                  <span>{tutor.isCurrent ? "Présent à la date finale" : `Absent à la date finale · vu le ${formatDate(tutor.lastSeen)}`}</span>
                </div>
              </div>
              <input
                defaultValue={tutorTrackingCommentByKey.get(tutor.key) || ""}
                placeholder="Commentaire de suivi..."
                onBlur={(event) => {
                  if (event.target.value.trim() !== (tutorTrackingCommentByKey.get(tutor.key) || "")) {
                    void updateTutorTrackingComment(tutor.key, event.target.value);
                  }
                }}
                aria-label={`Commentaire pour ${tutorTrackingDisplayName(tutor)}`}
              />
            </article>
          )) : (
            <div className="empty-state tutor-tracking-empty">
              <span>👨‍🏫</span>
              <h3>{tutorTracking.snapshots.length ? "Aucun tuteur ne correspond" : "Aucun CSV tuteurs importé"}</h3>
              <p>{tutorTracking.snapshots.length ? "Essayez une autre date de comparaison ou une autre recherche." : "Importez un premier CSV pour commencer à suivre les entrées et sorties."}</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderTutorReportsSection() {
    const totalMissing = (activeTutorReport?.entries ?? []).reduce(
      (total, entry) => total + entry.missingReportCount,
      0,
    );
    const totalStudents = (activeTutorReport?.entries ?? []).reduce(
      (total, entry) => total + entry.studentCount,
      0,
    );
    const reportLabel = activeTutorReport
      ? `${activeTutorReport.entries.length} tuteur${activeTutorReport.entries.length > 1 ? "s" : ""} au ${formatFullDate(activeTutorReport.date)}`
      : "Choisissez une date et collez une liste Excel pour commencer.";
    const allTimeMissing = filteredTutorReportAggregates.reduce((total, tutor) => total + tutor.totalMissing, 0);
    const allTimeDates = new Set(filteredTutorReportsForGlobal.map((report) => report.date)).size;
    const allTimeTutorCount = filteredTutorReportAggregates.length;
    const globalPeriodLabel = `${tutorReportStartDate ? formatFullDate(tutorReportStartDate) : "le début"} → ${tutorReportEndDate ? formatFullDate(tutorReportEndDate) : "aujourd’hui"}`;

    return (
      <section className="task-panel tutor-report-panel">
        <div className="panel-heading">
          <div>
            <h2>Bilans tuteurs non faits</h2>
            <p>Historique global en haut, mise à jour par date en bas.</p>
          </div>
          <div className="filters">
            <button className="button quiet" onClick={() => { void loadTutorReports(); }} disabled={saving}>
              ↻ Actualiser
            </button>
          </div>
        </div>

        <div className="tutor-history-hero">
          <div className="tutor-history-title">
            <span className="history-badge">Historique</span>
            <div>
              <h3>Vue depuis le début de l’année</h3>
              <p>Les tuteurs qui reviennent le plus souvent avec des bilans non faits · {globalPeriodLabel}</p>
            </div>
          </div>
          <div className="tutor-history-controls">
            <label>
              <span>Du</span>
              <input type="date" value={tutorReportStartDate} onChange={(event) => setTutorReportStartDate(event.target.value)} />
            </label>
            <label>
              <span>Au</span>
              <input type="date" value={tutorReportEndDate} onChange={(event) => setTutorReportEndDate(event.target.value)} />
            </label>
            <button className="button quiet" onClick={exportTutorReportAggregatesCsv} disabled={!tutorReportAggregates.length} type="button">
              Export CSV
            </button>
          </div>
          <div className="tutor-history-metrics" aria-label="Résumé historique des bilans tuteurs">
            <div>
              <span>Tuteurs concernés</span>
              <strong>{allTimeTutorCount}</strong>
            </div>
            <div>
              <span>Dates importées</span>
              <strong>{allTimeDates}</strong>
            </div>
            <div>
              <span>Bilans non faits</span>
              <strong>{allTimeMissing}</strong>
            </div>
          </div>
        </div>

        <div className="tutor-report-top tutor-report-all-time">
          <div className="tutor-report-top-head">
            <div>
              <strong>Top 10 de la période</strong>
              <span>Nombre total de bilans non faits sur la période choisie.</span>
            </div>
            <label className="tutor-report-global-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={tutorReportGlobalQuery}
                onChange={(event) => {
                  setTutorReportGlobalQuery(event.target.value);
                  setVisibleTutorReportCount(10);
                }}
                placeholder="Rechercher nom, téléphone, ID..."
                aria-label="Rechercher un tuteur dans le suivi global"
              />
            </label>
          </div>
          {visibleTutorReportAggregates.length ? (
            <div className="tutor-top-list">
              {visibleTutorReportAggregates.map((tutor, index) => (
                <article
                  className="tutor-top-card"
                  key={tutor.key}
                >
                  <span className="rank">#{index + 1}</span>
                  <div>
                    <button className="tutor-card-name" onClick={() => setSelectedTutorReportKey(tutor.key)} type="button">
                      {tutorDisplayName(tutor)}
                    </button>
                    <small>
                      {tutor.dateCount} date{tutor.dateCount > 1 ? "s" : ""} · {tutor.schools.slice(0, 2).join(", ") || "Établissement non renseigné"}
                    </small>
                    <input
                      className="tutor-global-comment"
                      defaultValue={tutorReportCommentByKey.get(tutor.key) || ""}
                      placeholder="Commentaire général..."
                      onBlur={(event) => {
                        if (event.target.value.trim() !== (tutorReportCommentByKey.get(tutor.key) || "")) {
                          void updateTutorReportGlobalComment(tutor.key, event.target.value);
                        }
                      }}
                      aria-label={`Commentaire général pour ${tutorDisplayName(tutor)}`}
                    />
                  </div>
                  <div className="tutor-top-actions">
                    <em>{tutor.totalMissing} bilan{tutor.totalMissing > 1 ? "s" : ""}</em>
                    <button className="icon-button danger-icon" onClick={() => { void deleteTutorReportAggregate(tutor); }} aria-label={`Supprimer ${tutorDisplayName(tutor)} de la vue globale`}>
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="compact-empty">Aucun historique global pour le moment.</p>
          )}
          {visibleTutorReportAggregates.length < filteredTutorReportAggregates.length && (
            <button className="button quiet tutor-load-more" onClick={() => setVisibleTutorReportCount((count) => count + 10)} type="button">
              Voir les 10 suivants
            </button>
          )}
        </div>

        <div className="tutor-report-date-workspace">
          <div className="tutor-date-section-heading">
            <div>
              <span className="history-badge muted">Mise à jour</span>
              <h3>Données par date</h3>
              <p>{reportLabel}</p>
            </div>
            <div className="filters">
              <input
                className="date-input"
                type="date"
                value={tutorReportDate}
                onChange={(event) => setTutorReportDate(event.target.value)}
                aria-label="Date du suivi des bilans tuteurs"
              />
              {tutorReports.length > 0 && (
                <select
                  value={tutorReportDate}
                  onChange={(event) => setTutorReportDate(event.target.value)}
                  aria-label="Choisir une date importée"
                >
                  {tutorReports.map((report) => (
                    <option key={report.date} value={report.date}>
                      {formatFullDate(report.date)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

        <div className="tutor-report-summary" aria-label="Résumé des bilans tuteurs">
          <div>
            <span>Tuteurs listés</span>
            <strong>{activeTutorReport?.entries.length ?? 0}</strong>
          </div>
          <div>
            <span>Bilans non faits</span>
            <strong>{totalMissing}</strong>
          </div>
          <div>
            <span>Élèves concernés</span>
            <strong>{totalStudents}</strong>
          </div>
        </div>

        <div className="tutor-report-import">
          <div>
            <strong>Importer une liste pour le {tutorReportDate ? formatFullDate(tutorReportDate) : "jour choisi"}</strong>
            <span>Choisissez d’abord la date au-dessus, même pour une date passée. Formats fichier conseillés : CSV ou TSV. Ordre attendu : ID, Nom, Prénom, Téléphone, Établissement, Nb élèves, Nb bilans non faits.</span>
          </div>
          <label className="tutor-report-file-picker">
            <span>Charger un fichier CSV / TSV</span>
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
              onChange={(event) => {
                void importTutorReportFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <textarea
            value={tutorReportPaste}
            onChange={(event) => setTutorReportPaste(event.target.value)}
            placeholder={`Collez ici les lignes Excel pour le ${tutorReportDate || "jour choisi"}…`}
            aria-label="Liste Excel des tuteurs avec bilans non faits"
          />
          <div className="import-actions">
            <button className="button primary" onClick={() => { void importTutorReportPaste(); }} disabled={saving || !tutorReportDate || !tutorReportPaste.trim()}>
              Importer / remplacer cette date
            </button>
            {activeTutorReport && (
              <button className="button quiet danger-text" onClick={() => { void deleteTutorReportSnapshot(activeTutorReport.date); }} disabled={saving}>
                Supprimer cette date
              </button>
            )}
          </div>
        </div>

        <div className="panel-heading tutor-report-table-heading">
          <div>
            <h3>Détail de la date</h3>
            <p>{filteredTutorReportEntries.length} ligne{filteredTutorReportEntries.length > 1 ? "s" : ""} affichée{filteredTutorReportEntries.length > 1 ? "s" : ""}</p>
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={tutorReportQuery}
              onChange={(event) => setTutorReportQuery(event.target.value)}
              placeholder="Rechercher tuteur, téléphone, établissement..."
              aria-label="Rechercher dans les bilans tuteurs"
            />
          </label>
        </div>

        <div className="tutor-report-table-wrap">
          <div className="tutor-report-table tutor-report-head" aria-hidden="true">
            <span>ID</span>
            <span>Nom</span>
            <span>Prénom</span>
            <span>Téléphone</span>
            <span>Établissement</span>
            <span>Élèves</span>
            <span>Bilans non faits</span>
            <span>Commentaire global</span>
            <span>Commentaire date</span>
            <span>Actions</span>
          </div>
          {filteredTutorReportEntries.length ? (
            filteredTutorReportEntries.map((entry) => {
              const tutorKey = tutorIdentityKey(entry);
              const globalComment = tutorReportCommentByKey.get(tutorKey) || "";
              return (
                <article className="tutor-report-table tutor-report-row" key={entry.id}>
                  <span>{entry.tutorId || "—"}</span>
                  <button className="tutor-name-button" onClick={() => setSelectedTutorReportKey(tutorKey)} type="button">
                    {entry.lastName || "—"}
                  </button>
                  <span>{entry.firstName || "—"}</span>
                  <span>{entry.phone || "—"}</span>
                  <span>{entry.school || "—"}</span>
                  <span>{entry.studentCount}</span>
                  <span className="missing">{entry.missingReportCount}</span>
                  <input
                    className="tutor-row-comment global-comment"
                    defaultValue={globalComment}
                    placeholder="Commentaire global..."
                    onBlur={(event) => {
                      if (event.target.value.trim() !== globalComment) {
                        void updateTutorReportGlobalComment(tutorKey, event.target.value);
                      }
                    }}
                    aria-label={`Commentaire global pour ${tutorDisplayName(entry)}`}
                  />
                  <input
                    className="tutor-row-comment"
                    defaultValue={entry.comment}
                    placeholder="Commentaire date..."
                    onBlur={(event) => {
                      if (event.target.value.trim() !== entry.comment) {
                        void updateTutorReportEntryComment(activeTutorReport?.date || tutorReportDate, entry.id, event.target.value);
                      }
                    }}
                    aria-label={`Commentaire de date pour ${tutorDisplayName(entry)}`}
                  />
                  <button className="icon-button danger-icon inline-delete" onClick={() => { void deleteTutorReportEntry(activeTutorReport?.date || tutorReportDate, entry.id); }} aria-label={`Supprimer ${tutorDisplayName(entry)}`}>
                    ×
                  </button>
                </article>
              );
            })
          ) : (
            <div className="empty-state tutor-report-empty">
              <span>🧾</span>
              <h3>{activeTutorReport ? "Aucune ligne ne correspond à la recherche" : "Aucune liste importée"}</h3>
              <p>{activeTutorReport ? "Essayez une autre recherche." : "Choisissez une date, copiez les lignes depuis Excel, puis importez-les."}</p>
            </div>
          )}
        </div>
        </div>
      </section>
    );
  }

  function renderSocialControls(
    likes: SocialLike[],
    comments: SocialComment[],
    onLike: () => void,
    onComment: (event: FormEvent<HTMLFormElement>) => void,
    label: string,
  ) {
    return (
      <div className="post-social">
        <div className="post-social-bar">
          <button className="button quiet social-like-button" type="button" onClick={onLike} disabled={saving}>
            👍 J’aime <span>{likes.length}</span>
          </button>
          {likes.length > 0 && <small>Aimé par {likes.slice(-3).map((like) => like.author).join(", ")}{likes.length > 3 ? "…" : ""}</small>}
        </div>
        {comments.length > 0 && (
          <div className="post-comments">
            {comments.slice(-3).map((comment) => (
              <article key={comment.id}>
                <strong>{comment.author}</strong>
                <span>{formatJournalDate(comment.createdAt)}</span>
                <p>{comment.text}</p>
              </article>
            ))}
          </div>
        )}
        <form className="post-comment-form" onSubmit={onComment}>
          <input name="author" placeholder={authorName || "Votre nom"} aria-label={`Nom pour commenter ${label}`} />
          <input name="comment" placeholder="Ajouter un commentaire..." aria-label={`Commentaire pour ${label}`} />
          <button className="button quiet" type="submit" disabled={saving}>Commenter</button>
        </form>
      </div>
    );
  }

  function renderStudentHistorySection() {
    let carriedValue: number | null = null;
    let previousKnownValue: number | null = null;
    const chartColors = ["#0EA5E9", "#10B981", "#BE185D", "#075985", "#F59E0B", "#7C3AED"];

    return (
      <section className="student-history-panel" aria-label="Historique du nombre d'eleves">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Historique élèves</p>
            <h2>Trajectoire du 25 août au 30 septembre</h2>
            <p>Total cumulé saisi jour par jour, séparé du compteur principal.</p>
          </div>
          <div className="filters">
            {studentHistory.length > 0 && (
              <select value={activeHistoryYear} onChange={(event) => setActiveHistoryYear(Number(event.target.value))}>
                {studentHistory.map((year) => <option key={year.year} value={year.year}>{year.year}</option>)}
              </select>
            )}
            <button className="button primary" onClick={addStudentHistoryYear} disabled={saving}>＋ Ajouter une année</button>
          </div>
        </div>

        {studentHistory.length ? (
          <>
            <div className="history-compare">
              <div className="history-chart-head">
                <div>
                  <strong>Grand graphique comparatif</strong>
                  <span>{chartYears.length ? `${chartYears.length} annee${chartYears.length > 1 ? "s" : ""} affichee${chartYears.length > 1 ? "s" : ""}` : "Cochez au moins une annee"}</span>
                </div>
                <div className="history-year-toggles">
                  {studentHistory.map((year) => (
                    <label key={year.year}>
                      <input
                        type="checkbox"
                        checked={selectedHistoryYears.includes(year.year)}
                        onChange={(event) => toggleHistoryYear(year.year, event.target.checked)}
                      />
                      {year.year}
                    </label>
                  ))}
                </div>
              </div>
              <div className="student-chart">
                <svg viewBox="0 0 1000 210" role="img" aria-label="Comparaison du nombre d'eleves par annee">
                  <line x1="0" y1="180" x2="1000" y2="180" />
                  <line x1="0" y1="30" x2="1000" y2="30" />
                  <line x1="0" y1="105" x2="1000" y2="105" />
                  {chartYears.map((year, index) => (
                    <polyline
                      key={year.year}
                      points={studentHistoryPath(year)}
                      style={{ stroke: chartColors[index % chartColors.length] }}
                    />
                  ))}
                </svg>
                <div className="chart-axis">
                  <span>25 août</span>
                  <span>15 sept.</span>
                  <span>30 sept.</span>
                </div>
              </div>
              <div className="chart-legend">
                {chartYears.map((year, index) => (
                  <span key={year.year}><i style={{ background: chartColors[index % chartColors.length] }} />{year.year}</span>
                ))}
              </div>
            </div>

            {activeHistory && (
              <div className="history-table-wrap">
                <div className="history-table table-head" aria-hidden="true">
                  <span>Date</span><span>Total saisi</span><span>Total affiche</span><span>Ajout</span>
                </div>
                {activeHistory.entries.map((entry) => {
                  const displayedValue = entry.value ?? carriedValue;
                  const addedValue =
                    entry.value !== null && previousKnownValue !== null ? entry.value - previousKnownValue : null;
                  if (entry.value !== null) {
                    carriedValue = entry.value;
                    previousKnownValue = entry.value;
                  }
                  return (
                    <article className="history-table history-row" key={entry.date}>
                      <strong>{campaignDayLabel(entry.date)}</strong>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={entry.value ?? ""}
                        placeholder="—"
                        onBlur={(event) => updateStudentHistoryValue(activeHistory.year, entry.date, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        aria-label={`Nombre d'eleves au ${campaignDayLabel(entry.date)}`}
                      />
                      <span>{displayedValue === null ? "—" : formatObjectiveNumber(displayedValue)}</span>
                      <span className={addedValue !== null && addedValue < 0 ? "negative" : ""}>
                        {addedValue === null ? "—" : `${addedValue >= 0 ? "+" : ""}${formatObjectiveNumber(addedValue)}`}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state history-empty">
            <span>↗</span>
            <h3>Aucun historique élèves</h3>
            <p>Ajoutez une année pour générer automatiquement toutes les dates du 25 août au 30 septembre.</p>
            <button className="button primary" onClick={addStudentHistoryYear} disabled={saving}>Ajouter une année</button>
          </div>
        )}
      </section>
    );
  }

  function renderCounterObjective(objective: Objective, label: string) {
    const percent = objectiveProgressPercent(objective);
    const nextStep = objectiveNextStep(objective);
    const isStudentObjective = objective.id === "objective-september-2600";
    const miniPath = miniStudentHistoryPath();
    const latestHistoryValue = latestStudentHistoryValue();
    return (
      <div className="objective-card">
        <div>
          <p className="eyebrow">{label}</p>
          <h1>{objective.title}</h1>
          <div className="objective-progress-summary">
            <strong>
              {formatObjectiveNumber(objective.currentValue ?? 0)} / {formatObjectiveNumber(objective.targetValue)} {objective.targetLabel}
            </strong>
            <span>{percent}%</span>
          </div>
          <div className="objective-progress-bar" aria-label={`Progression de l'objectif : ${percent}%`}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="objective-progress-caption">
            {nextStep.missing > 0
              ? `Il manque ${formatObjectiveNumber(nextStep.missing)} ${objective.targetLabel} pour atteindre ${nextStep.nextPercent}%.`
              : "Objectif atteint : cap tenu, on garde l'elan."}
          </p>
          {isStudentObjective && (
            <button className="mini-history-card" onClick={() => setAppMode("history")} type="button">
              <span>
                <strong>Historique élèves</strong>
                <small>{latestHistoryValue === null ? "Ajouter les donnees" : `Dernier total : ${formatObjectiveNumber(latestHistoryValue)}`}</small>
              </span>
              <svg viewBox="0 0 100 50" aria-hidden="true">
                <polyline points={miniPath || "0,42 100,42"} />
              </svg>
            </button>
          )}
        </div>
        <div className="objective-card-footer">
          {objective.personIds.length > 0 && (
            <div className="objective-assignees" aria-label="Personnes rattachees a l'objectif">
            {objective.personIds.length
              ? objective.personIds.map((personId) => {
                  const person = peopleById.get(personId);
                  if (!person) return null;
                  return <span className="objective-person" key={person.id}><span className="avatar">{ownerInitials(person.name)}</span>{person.name}</span>;
                })
              : null}
            </div>
          )}
          <button className="button quiet" onClick={() => openObjective(objective)}>
            Modifier
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`app-shell density-${density}`}>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setAppMode("dashboard")} aria-label="Retourner à l’accueil">
          <div className="brand-mark" aria-hidden="true">α</div>
          <div>
            <span>Alpha Education</span>
            <small>Pilotage des équipes</small>
          </div>
        </button>
        <div className="header-actions">
          <div className={`storage-note ${syncError ? "error" : ""}`}>
            <span aria-hidden="true">●</span>
            {saving ? "Sauvegarde..." : syncError || "Synchronise en ligne"}
          </div>
          <button className="button quiet" onClick={() => openPerson()} disabled={saving}>
            Personnes
          </button>
          <button
            className="button primary"
            onClick={
              appMode === "recurring"
                ? openNewRecurringTask
                : appMode === "links"
                  ? openNewLink
                  : appMode === "journal"
                    ? openNewJournalPost
                  : appMode === "communications"
                      ? openNewCommunication
                    : appMode === "staffing"
                      ? () => { void loadStaffingDays(); }
                    : appMode === "staffingAudit"
                      ? () => setAppMode("staffingAudit")
                    : appMode === "tutors"
                      ? () => { void loadTutorTracking(); }
                    : appMode === "availability"
                      ? () => { void loadAvailabilityImports(); }
                    : appMode === "availabilityFeed"
                      ? () => setAppMode("availabilityFeed")
                    : appMode === "enrollments"
                      ? () => setAppMode("enrollments")
                    : appMode === "coverage"
                      ? () => setAppMode("coverage")
                    : appMode === "unstaffed"
                      ? () => setAppMode("unstaffed")
                    : appMode === "files"
                      ? () => setAppMode("files")
                    : appMode === "tutorReports"
                      ? () => { void loadTutorReports(); }
                    : appMode === "watchlist"
                      ? () => openNewSchoolWatchItem()
                    : appMode === "schools"
                      ? () => openSchoolEvent()
                  : appMode === "objectives"
                    ? openNewQualitativeObjective
                    : appMode === "history"
                      ? addStudentHistoryYear
                      : openNewTask
            }
            disabled={saving}
          >
            <span aria-hidden="true">＋</span>{" "}
            {appMode === "recurring"
              ? "Nouveau modele"
                : appMode === "links"
                  ? "Nouveau lien"
                  : appMode === "journal"
                    ? "Nouveau post"
                  : appMode === "communications"
                      ? "Nouvelle communication"
                    : appMode === "staffing"
                      ? "Ligne du jour"
                    : appMode === "staffingAudit"
                      ? "Voir les bilans"
                    : appMode === "tutors"
                      ? "Actualiser tuteurs"
                    : appMode === "availability"
                      ? "Actualiser dispos"
                    : appMode === "availabilityFeed"
                      ? "Voir le fil"
                    : appMode === "enrollments"
                      ? "Comparer inscriptions"
                    : appMode === "coverage"
                      ? "Voir les tuteurs disponibles"
                    : appMode === "unstaffed"
                      ? "Voir les séances"
                    : appMode === "files"
                      ? "Gérer les fichiers"
                    : appMode === "tutorReports"
                      ? "Actualiser bilans"
                    : appMode === "watchlist"
                      ? "Nouveau suivi"
                    : appMode === "schools"
                      ? "Nouveau post CRM"
                  : appMode === "objectives"
                    ? "Nouvel objectif"
                  : appMode === "history"
                    ? "Ajouter une année"
                    : "Nouvelle tache"}
          </button>
        </div>
      </header>

      <section className="content">
        {appMode === "dashboard" && <section className="home-objectives" aria-label="Objectifs Alpha Education">
          <div className="home-welcome">
            <div className="mission-badge">Alpha Education · rentrée 2026</div>
            <strong>Piloter, organiser, avancer.</strong>
          </div>
          <div className="objective-stack">
            {renderCounterObjective(studentObjective, "Objectif élèves")}
            {renderCounterObjective(sessionObjective, "Objectif hebdo")}
          </div>
        </section>}

        {appMode === "dashboard" && <HomeDashboard onNavigate={(mode: HomeDestination) => setAppMode(mode)} />}

        <div className="tabs-shell">
          <div className="main-tabs" role="group" aria-label="Choisir le type de suivi">
            <button className={appMode === "dashboard" ? "active" : ""} onClick={() => setAppMode("dashboard")}>
              <span className="tab-icon" aria-hidden="true">🏠</span> Accueil
            </button>
            <button className={appMode === "tasks" ? "active" : ""} onClick={() => setAppMode("tasks")}>
              <span className="tab-icon" aria-hidden="true">✅</span> Tâches
            </button>
            <button className={appMode === "links" ? "active" : ""} onClick={() => setAppMode("links")}>
              <span className="tab-icon" aria-hidden="true">🔗</span> Liens
            </button>
            <button className={appMode === "watchlist" ? "active" : ""} onClick={() => setAppMode("watchlist")}>
              <span className="tab-icon" aria-hidden="true">👀</span> À suivre
            </button>
            <button className={appMode === "schools" ? "active" : ""} onClick={() => setAppMode("schools")}>
              <span className="tab-icon" aria-hidden="true">🏫</span> Établissements
            </button>
            <button className={appMode === "communications" ? "active" : ""} onClick={() => setAppMode("communications")}>
              <span className="tab-icon" aria-hidden="true">📣</span> Communications
            </button>
            <button className={appMode === "staffing" ? "active" : ""} onClick={() => setAppMode("staffing")}>
              <span className="tab-icon" aria-hidden="true">👥</span> Staffing
            </button>
            <button className={appMode === "staffingAudit" ? "active" : ""} onClick={() => setAppMode("staffingAudit")}>
              <span className="tab-icon" aria-hidden="true">📊</span> Bilan staffing
            </button>
            <button className={appMode === "staffingEvolution" ? "active" : ""} onClick={() => setAppMode("staffingEvolution")}>
              <span className="tab-icon" aria-hidden="true">🔄</span> Évolution staffing
            </button>
            <button className={appMode === "unstaffed" ? "active" : ""} onClick={() => setAppMode("unstaffed")}>
              <span className="tab-icon" aria-hidden="true">📋</span> Séances non affectées
            </button>
            <button className={appMode === "tutors" ? "active" : ""} onClick={() => setAppMode("tutors")}>
              <span className="tab-icon" aria-hidden="true">👨‍🏫</span> Tuteurs
            </button>
            <button className={appMode === "availability" ? "active" : ""} onClick={() => setAppMode("availability")}>
              <span className="tab-icon" aria-hidden="true">📆</span> Comparaison dispos
            </button>
            <button className={appMode === "availabilityFeed" ? "active" : ""} onClick={() => setAppMode("availabilityFeed")}>
              <span className="tab-icon" aria-hidden="true">🕒</span> Fil des disponibilités
            </button>
            <button className={appMode === "enrollments" ? "active" : ""} onClick={() => setAppMode("enrollments")}>
              <span className="tab-icon" aria-hidden="true">🎒</span> Inscriptions
            </button>
            <button className={appMode === "coverage" ? "active" : ""} onClick={() => setAppMode("coverage")}>
              <span className="tab-icon" aria-hidden="true">🧩</span> Tuteurs dispo sans séance
            </button>
            <button className={appMode === "files" ? "active" : ""} onClick={() => setAppMode("files")}>
              <span className="tab-icon" aria-hidden="true">🗂️</span> Fichiers
            </button>
            <button className={appMode === "tutorReports" ? "active" : ""} onClick={() => setAppMode("tutorReports")}>
              <span className="tab-icon" aria-hidden="true">🧾</span> Bilans tuteurs
            </button>
            <button className={appMode === "objectives" ? "active" : ""} onClick={() => setAppMode("objectives")}>
              <span className="tab-icon" aria-hidden="true">🎯</span> Objectifs
            </button>
            <button className={appMode === "history" ? "active" : ""} onClick={() => setAppMode("history")}>
              <span className="tab-icon" aria-hidden="true">📈</span> Historique
            </button>
            <button className={appMode === "journal" ? "active" : ""} onClick={() => setAppMode("journal")}>
              <span className="tab-icon" aria-hidden="true">✍️</span> Journal
            </button>
          </div>
          <button className="copy-tab-link" onClick={copyCurrentTabLink} type="button">
            Copier le lien
          </button>
        </div>

        {appMode === "tasks" && <div className="stats-grid" aria-label="Resume des taches">
          <button className={`stat-card neutral ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
            <span className="stat-icon">≡</span><span><strong>{stats.active}</strong><small>Actives</small></span>
          </button>
          <button className={`stat-card red ${statusFilter === "late" ? "active" : ""}`} onClick={() => setStatusFilter("late")}>
            <span className="stat-icon">!</span><span><strong>{stats.late}</strong><small>En retard</small></span>
          </button>
          <button className={`stat-card violet ${priorityFilter === "high" ? "active" : ""}`} onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}>
            <span className="stat-icon">↑</span><span><strong>{stats.high}</strong><small>Priorite haute</small></span>
          </button>
          <button className={`stat-card blue ${statusFilter === "progress" ? "active" : ""}`} onClick={() => setStatusFilter("progress")}>
            <span className="stat-icon">◒</span><span><strong>{stats.progress}</strong><small>En cours</small></span>
          </button>
          <button className={`stat-card green ${statusFilter === "done" ? "active" : ""}`} onClick={() => setStatusFilter("done")}>
            <span className="stat-icon">✓</span><span><strong>{stats.done}</strong><small>Terminees</small></span>
          </button>
        </div>}

        {appMode === "dashboard" ? null : appMode === "tasks" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Liste partagee</h2>
              <p>
                {!loaded
                  ? "Chargement..."
                  : `${filteredTasks.length} tache${filteredTasks.length > 1 ? "s" : ""} affichee${filteredTasks.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="filters">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher..." aria-label="Rechercher une tache" />
              </label>
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as "all" | Priority)} aria-label="Filtrer par priorite">
                <option value="all">Toutes priorites</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
              <button className="density-toggle" onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")} title="Changer la densite d'affichage">
                {density === "compact" ? "Compact" : "Confort"}
              </button>
              <button className="mini-action" onClick={() => { void loadTasks(); void loadPeople(); }} disabled={saving}>↻</button>
              <button className="mini-action" onClick={exportTasks} disabled={!tasks.length}>⇩</button>
              <button className="mini-action" onClick={() => importRef.current?.click()} disabled={saving}>⇧</button>
              <input
                ref={importRef}
                className="sr-only"
                type="file"
                accept="application/json"
                onChange={(event) => importTasks(event.target.files?.[0])}
              />
            </div>
          </div>

          <div className="owner-strip" aria-label="Filtrer par responsable">
            <button className={ownerFilter === "all" ? "active" : ""} onClick={() => setOwnerFilter("all")}>
              Tous <span>{tasks.length}</span>
            </button>
            {owners.map((owner) => (
              <button key={owner} className={ownerFilter === owner ? "active" : ""} onClick={() => setOwnerFilter(owner)}>
                <span className="avatar">{ownerInitials(owner)}</span>{owner}
              </button>
            ))}
          </div>

          <div className="status-tabs" role="group" aria-label="Filtrer par statut">
            {([
              ["all", "Actives"],
              ["todo", "A faire"],
              ["progress", "En cours"],
              ["done", "Terminees"],
              ["late", "En retard"],
            ] as const).map(([value, label]) => (
              <button key={value} className={statusFilter === value ? "active" : ""} onClick={() => setStatusFilter(value)}>{label}</button>
            ))}
          </div>

          <div className="view-tabs" role="group" aria-label="Changer de vue">
            <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>Liste</button>
            <button className={viewMode === "matrix" ? "active" : ""} onClick={() => setViewMode("matrix")}>Priorite × duree</button>
          </div>

          {viewMode === "matrix" ? (
            <div className="matrix-view">
              <div className="matrix-head" aria-hidden="true">
                <span></span>
                {durationBuckets.map((bucket) => (
                  <strong key={bucket.value}>{bucket.label}<small>{bucket.hint}</small></strong>
                ))}
              </div>
              {matrixPriorities.map((priority) => (
                <section className={`matrix-row matrix-priority-${priority}`} key={priority}>
                  <div className="matrix-priority-label">
                    <span className={`priority-pill priority-${priority}`}>{priorityLabels[priority]}</span>
                  </div>
                  {durationBuckets.map((bucket) => {
                    const bucketTasks = filteredTasks.filter(
                      (task) => task.priority === priority && durationBucket(task.estimatedHours) === bucket.value,
                    );
                    return (
                      <div className="matrix-cell" key={bucket.value}>
                        <div className="matrix-mobile-label">{bucket.label} · {bucket.hint}</div>
                        {bucketTasks.length ? bucketTasks.map((task) => {
                          const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
                          return (
                            <button className={`matrix-card ${isLate(task) ? "is-late" : ""}`} key={task.id} onClick={() => setSelectedId(task.id)}>
                              <strong>{task.title}</strong>
                              <span>{assignee?.name || task.owner} · {formatDuration(task.estimatedHours)}</span>
                              <small>{naturalDateLabel(task)}</small>
                            </button>
                          );
                        }) : <span className="matrix-empty">—</span>}
                      </div>
                    );
                  })}
                </section>
              ))}
              {loaded && !filteredTasks.length && (
                <div className="empty-state matrix-empty-state">
                  <span>✓</span>
                  <h3>Aucune tache a afficher</h3>
                  <p>Creez une tache ou changez les filtres pour remplir la matrice.</p>
                  <button className="button primary" onClick={openNewTask}>Creer une tache</button>
                </div>
              )}
            </div>
          ) : (
          <div className="table-wrap">
            <div className="task-table table-head" aria-hidden="true">
              <span>Tache</span><span>Responsable</span><span>Echeance</span><span>Duree</span><span>Priorite</span><span>Statut</span><span>Dernier commentaire</span><span></span>
            </div>
            {loaded && filteredTasks.length ? filteredTasks.map((task) => {
              const latestComment = task.comments[0];
              const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
              return (
                <article className={`task-table task-row priority-${task.priority} ${isLate(task) ? "is-late" : ""} ${task.status === "done" ? "is-done" : ""}`} key={task.id}>
                  <button className="task-main" onClick={() => setSelectedId(task.id)} aria-label={`Ouvrir ${task.title}`}>
                    <span className={`completion-box ${task.status === "done" ? "checked" : ""}`} aria-hidden="true">{task.status === "done" ? "✓" : ""}</span>
                    <span><strong>{task.title}</strong><small>{task.description || "Aucune description"}</small></span>
                  </button>
                  <div className="owner"><span className="avatar">{ownerInitials(assignee?.name || task.owner)}</span><span>{assignee?.name || task.owner}</span></div>
                  <div className="date-cell"><strong>{naturalDateLabel(task)}</strong><span>{dateLabel(task)}</span></div>
                  <span className="duration-pill">{formatDuration(task.estimatedHours)}</span>
                  <span className={`priority-pill priority-${task.priority}`}>{priorityLabels[task.priority]}</span>
                  <label className={`status-select status-${task.status}`}>
                    <span className="status-dot" aria-hidden="true"></span>
                    <select value={task.status} onChange={(event) => changeStatus(task.id, event.target.value as Status)} aria-label={`Statut de ${task.title}`} disabled={saving}>
                      <option value="todo">A faire</option><option value="progress">En cours</option><option value="done">Terminee</option>
                    </select>
                  </label>
                  <button className={`note-preview ${latestComment ? "has-note" : ""}`} onClick={() => setSelectedId(task.id)}>
                    <span aria-hidden="true">{latestComment ? "●" : "+"}</span>
                    <span>{latestComment ? `${latestComment.author} : ${latestComment.text}` : "Ajouter une note"}</span>
                  </button>
                  <button className="icon-button" onClick={() => openEditTask(task)} aria-label={`Modifier ${task.title}`}>•••</button>
                </article>
              );
            }) : (
              <div className="empty-state">
                <span>{loaded ? "✓" : "…"}</span>
                <h3>{loaded ? "Aucune tache partagee" : "Chargement des taches"}</h3>
                <p>{loaded ? "Creez la premiere tache pour demarrer le suivi collectif." : "Connexion au tableau partage..."}</p>
                {loaded && <button className="button primary" onClick={openNewTask}>Creer la premiere tache</button>}
              </div>
            )}
          </div>
          )}
        </section>
        : appMode === "recurring" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Modeles recurrents</h2>
              <p>
                {`${recurringTasks.length} modele${recurringTasks.length > 1 ? "s" : ""} disponible${recurringTasks.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="filters">
              <button className="button quiet" onClick={() => { void loadRecurringTasks(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={openNewRecurringTask} disabled={saving}>＋ Nouveau modele</button>
            </div>
          </div>
          <div className="table-wrap">
            <div className="recurring-table table-head" aria-hidden="true">
              <span>Modele</span><span>Responsable</span><span>Duree</span><span>Priorite</span><span>Actions</span>
            </div>
            {recurringTasks.length ? recurringTasks
              .slice()
              .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.title.localeCompare(b.title, "fr"))
              .map((task) => {
                const assignee = task.assigneeId ? peopleById.get(task.assigneeId) : null;
                return (
                  <article className={`recurring-table task-row recurring-row priority-${task.priority}`} key={task.id}>
                    <button className="task-main" onClick={() => openEditRecurringTask(task)} aria-label={`Modifier le modele ${task.title}`}>
                      <span className="recurring-icon" aria-hidden="true">↻</span>
                      <span><strong>{task.title}</strong><small>{task.description || "Aucune description"}</small></span>
                    </button>
                    <div className="owner"><span className="avatar">{ownerInitials(assignee?.name || task.owner)}</span><span>{assignee?.name || task.owner}</span></div>
                    <span className="duration-pill">{formatDuration(task.estimatedHours)}</span>
                    <span className={`priority-pill priority-${task.priority}`}>{priorityLabels[task.priority]}</span>
                    <div className="row-actions">
                      <button className="button primary" onClick={() => createTaskFromRecurring(task)} disabled={saving}>Creer une tache</button>
                      <button className="icon-button" onClick={() => openEditRecurringTask(task)} aria-label={`Modifier ${task.title}`}>•••</button>
                      <button className="icon-button danger-icon" onClick={() => deleteRecurringTask(task.id)} aria-label={`Supprimer ${task.title}`}>×</button>
                    </div>
                  </article>
                );
              }) : (
              <div className="empty-state">
                <span>↻</span>
                <h3>Aucun modele recurrent</h3>
                <p>Creez un modele pour refaire rapidement les taches qui reviennent.</p>
                <button className="button primary" onClick={openNewRecurringTask}>Creer le premier modele</button>
              </div>
            )}
          </div>
        </section>
        : appMode === "links" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Liens utiles</h2>
              <p>{`${links.length} lien${links.length > 1 ? "s" : ""} partage${links.length > 1 ? "s" : ""}`}</p>
            </div>
            <div className="filters">
              <button className="button quiet" onClick={() => { void loadLinks(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={openNewLink} disabled={saving}>＋ Nouveau lien</button>
            </div>
          </div>
          <div className="link-grid">
            {links.length ? links
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title, "fr"))
              .map((link) => (
                <article className="link-card" key={link.id}>
                  <div>
                    <span className="link-icon" aria-hidden="true">↗</span>
                    <div>
                      <h3>{link.title}</h3>
                      <p>{link.description || "Aucune description ajoutee."}</p>
                      <small>{link.url.replace(/^https?:\/\//, "")}</small>
                    </div>
                  </div>
                  <div className="row-actions">
                    <a className="button primary" href={link.url} target="_blank" rel="noreferrer">Ouvrir</a>
                    <button className="icon-button" onClick={() => openEditLink(link)} aria-label={`Modifier ${link.title}`}>•••</button>
                    <button className="icon-button danger-icon" onClick={() => deleteLink(link.id)} aria-label={`Supprimer ${link.title}`}>×</button>
                  </div>
                </article>
              )) : (
              <div className="empty-state">
                <span>↗</span>
                <h3>Aucun lien partage</h3>
                <p>Ajoutez les pages importantes pour que l&apos;equipe retrouve vite les bons outils.</p>
                <button className="button primary" onClick={openNewLink}>Ajouter le premier lien</button>
              </div>
            )}
          </div>
        </section>
        : appMode === "journal" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Journal de l’Étude Alpha</h2>
              <p>{`${filteredJournalPosts.length} post${filteredJournalPosts.length > 1 ? "s" : ""} affiche${filteredJournalPosts.length > 1 ? "s" : ""}`}</p>
            </div>
            <div className="filters">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={journalQuery} onChange={(event) => setJournalQuery(event.target.value)} placeholder="Rechercher dans le journal..." aria-label="Rechercher dans le journal" />
              </label>
              <select value={journalTagFilter} onChange={(event) => setJournalTagFilter(event.target.value)} aria-label="Filtrer par tag">
                <option value="all">Tous les tags</option>
                {journalTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <select value={journalAuthorFilter} onChange={(event) => setJournalAuthorFilter(event.target.value)} aria-label="Filtrer par auteur">
                <option value="all">Tous les auteurs</option>
                {journalAuthors.map((author) => <option key={author} value={author}>{author}</option>)}
              </select>
              <select value={journalPersonFilter} onChange={(event) => setJournalPersonFilter(event.target.value)} aria-label="Filtrer par personne taguee">
                <option value="all">Toutes personnes</option>
                {activePeople.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
              <button className="button quiet" onClick={() => { void loadJournalPosts(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={openNewJournalPost} disabled={saving}>＋ Nouveau post</button>
            </div>
          </div>
          <div className="journal-list">
            {filteredJournalPosts.length ? filteredJournalPosts.map((post) => (
              <article className="journal-card" key={post.id}>
                <div className="journal-card-date">
                  <span>{formatJournalDate(post.publishedAt).split(" ")[0]}</span>
                  <small>{formatJournalDate(post.publishedAt).split(" ").slice(1).join(" ")}</small>
                </div>
                <div className="journal-card-body">
                  <div className="journal-card-head">
                    <div>
                      <p className="eyebrow">Carnet de bord</p>
                      <h3>{post.title}</h3>
                    </div>
                    <small>{post.author}</small>
                  </div>
                  <p>{post.content}</p>
                  <div className="journal-tags">
                    {post.tags.map((tag) => <button key={tag} onClick={() => setJournalTagFilter(tag)}>#{tag}</button>)}
                    {post.personIds.map((personId) => {
                      const person = peopleById.get(personId);
                      if (!person) return null;
                      return <button key={person.id} onClick={() => setJournalPersonFilter(person.id)}><span className="avatar">{ownerInitials(person.name)}</span>{person.name}</button>;
                    })}
                  </div>
                  {renderSocialControls(
                    post.likes,
                    post.comments,
                    () => { void likeJournalPost(post.id); },
                    (event) => { void addJournalComment(post.id, event); },
                    post.title,
                  )}
                </div>
                <div className="row-actions">
                  <button className="button quiet" onClick={() => openEditJournalPost(post)}>Modifier</button>
                  <button className="icon-button danger-icon" onClick={() => deleteJournalPost(post.id)} aria-label={`Supprimer ${post.title}`}>×</button>
                </div>
              </article>
            )) : (
              <div className="empty-state journal-empty">
                <span>✦</span>
                <h3>{journalPosts.length ? "Aucun post ne correspond aux filtres" : "Le journal est prêt"}</h3>
                <p>{journalPosts.length ? "Essayez une autre recherche ou retirez un filtre." : "Écrivez la première trace de l’Étude Alpha : une décision, une victoire, un apprentissage."}</p>
                <button className="button primary" onClick={openNewJournalPost}>Créer un post</button>
              </div>
            )}
          </div>
        </section>
        : appMode === "communications" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Communications de masse</h2>
              <p>{`${filteredCommunications.length} communication${filteredCommunications.length > 1 ? "s" : ""} affichée${filteredCommunications.length > 1 ? "s" : ""}`}</p>
            </div>
            <div className="filters">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={communicationQuery} onChange={(event) => setCommunicationQuery(event.target.value)} placeholder="Rechercher une communication..." aria-label="Rechercher une communication" />
              </label>
              <select value={communicationAudienceFilter} onChange={(event) => setCommunicationAudienceFilter(event.target.value as "all" | CommunicationAudience)} aria-label="Filtrer par public">
                <option value="all">Tous les publics</option>
                {communicationAudiences.map((audience) => <option key={audience} value={audience}>{communicationAudienceLabels[audience]}</option>)}
              </select>
              <select value={communicationStatusFilter} onChange={(event) => setCommunicationStatusFilter(event.target.value as "all" | CommunicationStatus)} aria-label="Filtrer par statut">
                {communicationStatuses.map((status) => (
                  <option key={status} value={status}>{status === "all" ? "Tous les statuts" : communicationStatusLabels[status]}</option>
                ))}
              </select>
              <button className="button quiet" onClick={() => { void loadCommunications(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={openNewCommunication} disabled={saving}>＋ Nouvelle communication</button>
            </div>
          </div>
          <div className="communication-list">
            {filteredCommunications.length ? filteredCommunications.map((communication) => {
              const followUpLate = isCommunicationFollowUpLate(communication);
              return (
                <article className={`communication-card status-${communication.status} ${followUpLate ? "is-late" : ""}`} key={communication.id}>
                  <div className="communication-date">
                    <span>{formatJournalDate(communication.sentAt || communication.createdAt).split(" ")[0]}</span>
                    <small>{formatJournalDate(communication.sentAt || communication.createdAt).split(" ").slice(1).join(" ")}</small>
                  </div>
                  <div className="communication-body">
                    <div className="communication-head">
                      <div>
                        <p className="eyebrow">{communication.channel}</p>
                        <h3>{communication.title}</h3>
                      </div>
                      <span className={`communication-status status-${communication.status}`}>{communicationStatusLabels[communication.status]}</span>
                    </div>
                    {communication.messageSummary && <p>{communication.messageSummary}</p>}
                    <div className="communication-tags">
                      {communication.audiences.map((audience) => <button key={audience} onClick={() => setCommunicationAudienceFilter(audience)}>{communicationAudienceLabels[audience]}</button>)}
                      {communication.tags.map((tag) => <button key={tag} onClick={() => setCommunicationQuery(tag)}>#{tag}</button>)}
                    </div>
                    <div className="communication-meta">
                      <span>{communication.author}</span>
                      {communication.sentAt && <span>Envoyé le {formatDate(communication.sentAt)}</span>}
                      {communication.followUpDate && (
                        <span className={followUpLate ? "late" : ""}>
                          {followUpLate ? "Relance en retard" : "Relance"} · {formatDate(communication.followUpDate)}
                        </span>
                      )}
                    </div>
                    {communication.notes && <small className="communication-note">{communication.notes}</small>}
                  </div>
                  <div className="row-actions">
                    <button className="button quiet" onClick={() => openEditCommunication(communication)}>Modifier</button>
                    <button className="icon-button danger-icon" onClick={() => deleteCommunication(communication.id)} aria-label={`Supprimer ${communication.title}`}>×</button>
                  </div>
                </article>
              );
            }) : (
              <div className="empty-state communication-empty">
                <span>✉</span>
                <h3>{communications.length ? "Aucune communication ne correspond aux filtres" : "Aucune communication enregistrée"}</h3>
                <p>{communications.length ? "Essayez une autre recherche ou retirez un filtre." : "Tracez les messages envoyés aux tuteurs, établissements, parents ou coordinateurs."}</p>
                <button className="button primary" onClick={openNewCommunication}>Créer la première communication</button>
              </div>
            )}
          </div>
        </section>
        : appMode === "staffing" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Staffing séances</h2>
              <p>{`${staffingDays.length} jour${staffingDays.length > 1 ? "s" : ""} suivi${staffingDays.length > 1 ? "s" : ""} · Pierre, Julie, Kelly`}</p>
            </div>
            <div className="filters">
              <button className="button quiet" onClick={() => { void loadStaffingDays(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={() => { void loadStaffingDays(); }} disabled={saving}>＋ Ligne du jour</button>
            </div>
          </div>
          <div className="staffing-mini-chart" aria-label="Évolution globale des séances">
            <div className="staffing-chart-copy">
              <span>Global</span>
              <strong>{staffingSummary.totalStaffed + staffingSummary.totalUnstaffed} séances</strong>
              <small>{staffingChart.unstaffedPercent}% non staffées</small>
            </div>
            <svg viewBox="0 0 100 46" role="img" aria-label="Courbes total séances et séances non staffées">
              <line x1="0" y1="42" x2="100" y2="42" />
              <polyline className="total-line" points={staffingChart.totalPath || "0,42 100,42"} />
              <polyline className="unstaffed-line" points={staffingChart.unstaffedPath || "0,42 100,42"} />
            </svg>
            <div className="staffing-chart-legend">
              <span><i className="total-dot" /> Total</span>
              <span><i className="unstaffed-dot" /> Non staffées</span>
              <small>{staffingChart.points.length ? `${staffingChart.points.length} dernier${staffingChart.points.length > 1 ? "s" : ""} jour${staffingChart.points.length > 1 ? "s" : ""}` : "Aucune donnée"}</small>
            </div>
          </div>
          <div className="staffing-summary" aria-label="Résumé staffing">
            <div><span>7 jours staffées</span><strong>{staffingSummary.weekStaffed}</strong></div>
            <div><span>7 jours non staffées</span><strong>{staffingSummary.weekUnstaffed}</strong></div>
            <div><span>Total staffées</span><strong>{staffingSummary.totalStaffed}</strong></div>
            <div><span>Total non staffées</span><strong>{staffingSummary.totalUnstaffed}</strong></div>
          </div>
          <div className="staffing-table-wrap">
            <div className="staffing-table staffing-head" role="row">
              <span>Date</span>
              {staffingPeople.map((person) => <span key={person.key}>{person.label}</span>)}
              <span>Total staffé</span>
              <span>Total non staffé</span>
            </div>
            {staffingDays.length ? staffingDays.map((day) => {
              const dayTotals = staffingDayTotals(day);
              return (
                <article className="staffing-table staffing-row" key={day.id}>
                  <div className="staffing-date">
                    <strong>{formatDate(day.date)}</strong>
                    <small>{day.date}</small>
                  </div>
                  {staffingPeople.map((person) => (
                    <div className="staffing-person-cell" key={person.key}>
                      <label>
                        <span>Staffées</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={day.people[person.key].staffedSessions}
                          onBlur={(event) => {
                            const count = normalizeSessionCount(event.target.value);
                            event.target.value = String(count);
                            void updateStaffingValue(day.id, person.key, "staffedSessions", event.target.value);
                          }}
                          aria-label={`${person.label} séances staffées ${day.date}`}
                        />
                      </label>
                      <label>
                        <span>Non staffées</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={day.people[person.key].unstaffedSessions}
                          onBlur={(event) => {
                            const count = normalizeSessionCount(event.target.value);
                            event.target.value = String(count);
                            void updateStaffingValue(day.id, person.key, "unstaffedSessions", event.target.value);
                          }}
                          aria-label={`${person.label} séances non staffées ${day.date}`}
                        />
                      </label>
                    </div>
                  ))}
                  <label className="staffing-total-input good">
                    <span>Total staffé</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={dayTotals.staffed}
                      onBlur={(event) => {
                        const count = normalizeSessionCount(event.target.value);
                        event.target.value = String(count);
                        void updateStaffingTotal(day.id, "totalStaffedSessions", event.target.value);
                      }}
                      aria-label={`Total séances staffées ${day.date}`}
                    />
                  </label>
                  <label className={`staffing-total-input ${dayTotals.unstaffed > 0 ? "alert" : ""}`}>
                    <span>Total non staffé</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={dayTotals.unstaffed}
                      onBlur={(event) => {
                        const count = normalizeSessionCount(event.target.value);
                        event.target.value = String(count);
                        void updateStaffingTotal(day.id, "totalUnstaffedSessions", event.target.value);
                      }}
                      aria-label={`Total séances non staffées ${day.date}`}
                    />
                  </label>
                </article>
              );
            }) : (
              <div className="empty-state staffing-empty">
                <span>≡</span>
                <h3>Aucune journée suivie</h3>
                <p>La ligne du jour sera ajoutée automatiquement pour commencer le suivi des séances staffées et non staffées.</p>
                <button className="button primary" onClick={() => { void loadStaffingDays(); }}>Créer la ligne du jour</button>
              </div>
            )}
          </div>
        </section>
        : appMode === "tutors" ? renderTutorTrackingSection()
        : appMode === "availability" ? renderAvailabilityComparisonSection()
        : appMode === "availabilityFeed" ? <TutorAvailabilityFeed />
        : appMode === "enrollments" ? <EnrollmentComparison />
        : appMode === "coverage" ? <TutorCoverageComparison />
        : appMode === "unstaffed" ? <UnstaffedSessions />
        : appMode === "staffingAudit" ? <StaffingAudit />
        : appMode === "staffingEvolution" ? <StaffingEvolution />
        : appMode === "files" ? <FilesHub onOpen={(kind) => setAppMode(kind === "availability" ? "availability" : kind === "assignments" ? "coverage" : kind === "interests" || kind === "upcomingSessions" ? "unstaffed" : kind === "tutors" ? "tutors" : "enrollments")} />
        : appMode === "tutorReports" ? renderTutorReportsSection()
        : appMode === "watchlist" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Établissements à suivre</h2>
              <p>{`${filteredSchoolWatchlist.length} suivi${filteredSchoolWatchlist.length > 1 ? "s" : ""} affiché${filteredSchoolWatchlist.length > 1 ? "s" : ""}`}</p>
            </div>
            <div className="filters">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={schoolWatchQuery} onChange={(event) => setSchoolWatchQuery(event.target.value)} placeholder="Rechercher un suivi..." aria-label="Rechercher un établissement à suivre" />
              </label>
              <button className="button quiet" onClick={() => { void loadSchoolWatchlist(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={() => openNewSchoolWatchItem()} disabled={saving || !schools.length}>＋ Nouveau suivi</button>
            </div>
          </div>
          <div className="school-filter-tabs" role="group" aria-label="Filtrer les suivis">
            {([
              ["active", "Actifs"],
              ["resolved", "Résolus"],
              ["all", "Tous"],
              ...schoolWatchTags.map((tag) => [tag, tag] as const),
            ] as const).map(([value, label]) => (
              <button key={value} className={schoolWatchFilter === value ? "active" : ""} onClick={() => setSchoolWatchFilter(value)}>{label}</button>
            ))}
          </div>
          <div className="watchlist-layout">
            <div className="watchlist-table-wrap">
              <div className="watchlist-table watchlist-head" aria-hidden="true">
                <span>Établissement</span><span>Raison</span><span>Tags</span><span>Dernier commentaire</span><span>Statut</span><span>Actions</span>
              </div>
              {filteredSchoolWatchlist.length ? filteredSchoolWatchlist.map((item) => {
                const school = schoolById.get(item.schoolId);
                const latestComment = item.comments[0];
                return (
                  <article className={`watchlist-table watchlist-row ${item.status === "resolved" ? "is-resolved" : ""} school-type-${school?.schoolType || "mixed"}`} key={item.id}>
                    <button className="watchlist-school" onClick={() => setSelectedSchoolWatchId(item.id)}>
                      <strong>{school?.name || "Établissement introuvable"}</strong>
                      <small>{school ? [schoolTypeLabels[school.schoolType], school.city, school.coordinator].filter(Boolean).join(" · ") : "Le suivi est conservé même si l'établissement n'est plus dans la liste."}</small>
                    </button>
                    <button className="watchlist-reason" onClick={() => setSelectedSchoolWatchId(item.id)}>{item.reason}</button>
                    <div className="watchlist-tags">
                      {item.tags.map((tag) => <button key={tag} onClick={() => setSchoolWatchFilter(tag)}>{tag}</button>)}
                    </div>
                    <button className={`watchlist-comment-preview ${latestComment ? "has-note" : ""}`} onClick={() => setSelectedSchoolWatchId(item.id)}>
                      {latestComment ? `${latestComment.author} : ${latestComment.text}` : "Ajouter un commentaire"}
                    </button>
                    <span className={`watchlist-status ${item.status}`}>{schoolWatchStatusLabels[item.status]}</span>
                    <div className="row-actions">
                      <button className="button quiet" onClick={() => openEditSchoolWatchItem(item)}>Modifier</button>
                      <button className="button quiet" onClick={() => toggleSchoolWatchStatus(item)}>{item.status === "active" ? "Résoudre" : "Réactiver"}</button>
                      <button className="icon-button danger-icon" onClick={() => deleteSchoolWatchItem(item.id)} aria-label={`Supprimer le suivi ${school?.name || item.reason}`}>×</button>
                    </div>
                  </article>
                );
              }) : (
                <div className="empty-state watchlist-empty">
                  <span>⌕</span>
                  <h3>{schoolWatchlist.length ? "Aucun suivi ne correspond aux filtres" : "Aucun établissement à suivre"}</h3>
                  <p>{schoolWatchlist.length ? "Essayez une autre recherche ou un autre filtre." : "Ajoutez les nouveaux établissements, nouveaux besoins ou situations particulières à garder à l’œil."}</p>
                  <button className="button primary" onClick={() => openNewSchoolWatchItem()} disabled={!schools.length}>Créer le premier suivi</button>
                </div>
              )}
            </div>
            {selectedSchoolWatchItem && (
              <aside className={`watchlist-detail school-type-${schoolById.get(selectedSchoolWatchItem.schoolId)?.schoolType || "mixed"}`}>
                <div className="school-detail-head">
                  <div>
                    <p className="eyebrow">Suivi établissement</p>
                    <h3>
                      <SchoolAdminLink schoolId={schoolById.get(selectedSchoolWatchItem.schoolId)?.externalId}>
                        {schoolById.get(selectedSchoolWatchItem.schoolId)?.name || "Établissement introuvable"}
                      </SchoolAdminLink>
                    </h3>
                  </div>
                  <button className="close-button" onClick={() => setSelectedSchoolWatchId(null)} aria-label="Fermer le suivi">×</button>
                </div>
                <div className="school-meta">
                  {schoolById.get(selectedSchoolWatchItem.schoolId) ? (
                    <>
                      <span className={`school-type-pill school-type-${schoolById.get(selectedSchoolWatchItem.schoolId)?.schoolType}`}>{schoolTypeLabels[schoolById.get(selectedSchoolWatchItem.schoolId)!.schoolType]}</span>
                      {schoolById.get(selectedSchoolWatchItem.schoolId)?.city && <span>{schoolById.get(selectedSchoolWatchItem.schoolId)?.city}</span>}
                      {schoolById.get(selectedSchoolWatchItem.schoolId)?.coordinator && <span>{schoolById.get(selectedSchoolWatchItem.schoolId)?.coordinator}</span>}
                    </>
                  ) : <span>Établissement introuvable</span>}
                  <span className={`watchlist-status ${selectedSchoolWatchItem.status}`}>{schoolWatchStatusLabels[selectedSchoolWatchItem.status]}</span>
                </div>
                <div className="watchlist-detail-reason">
                  <small>Raison du suivi</small>
                  <strong>{selectedSchoolWatchItem.reason}</strong>
                </div>
                <div className="watchlist-tags">
                  {selectedSchoolWatchItem.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="school-detail-actions">
                  <button className="button quiet" onClick={() => openEditSchoolWatchItem(selectedSchoolWatchItem)}>Modifier</button>
                  <button className="button primary" onClick={() => toggleSchoolWatchStatus(selectedSchoolWatchItem)}>{selectedSchoolWatchItem.status === "active" ? "Marquer résolu" : "Réactiver"}</button>
                </div>
                <div className="watchlist-comment-box">
                  <textarea rows={3} value={schoolWatchComment} onChange={(event) => setSchoolWatchComment(event.target.value)} placeholder="Ajouter un commentaire au suivi..." />
                  <button className="button primary" onClick={() => addSchoolWatchComment(selectedSchoolWatchItem.id)} disabled={saving || !schoolWatchComment.trim()}>Ajouter le commentaire</button>
                </div>
                <div className="school-detail-posts">
                  <strong>Commentaires</strong>
                  {selectedSchoolWatchItem.comments.length ? selectedSchoolWatchItem.comments.map((comment) => (
                    <div key={comment.id}>
                      <small>{formatJournalDate(comment.createdAt)} · {comment.author}</small>
                      <span>{comment.text}</span>
                    </div>
                  )) : <p>Aucun commentaire pour le moment.</p>}
                </div>
              </aside>
            )}
          </div>
        </section>
        : appMode === "schools" ? <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Journal CRM établissements</h2>
              <p>
                {`${crmFeedItems.length} post${crmFeedItems.length > 1 ? "s" : ""} CRM · ${filteredSchools.length} établissement${filteredSchools.length > 1 ? "s" : ""} concerné${filteredSchools.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="filters">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input value={schoolQuery} onChange={(event) => setSchoolQuery(event.target.value)} placeholder="Rechercher un établissement..." aria-label="Rechercher un etablissement" />
              </label>
              <button className="button primary" onClick={() => openSchoolEvent()} disabled={saving || !schools.length}>＋ Nouveau post CRM</button>
              <button className="button quiet" onClick={openNewSchool} disabled={saving}>＋ Nouvel établissement</button>
              <button className="button quiet" onClick={() => { void loadSchools(); }} disabled={saving}>↻ Actualiser</button>
            </div>
          </div>
          <div className="school-filter-tabs" role="group" aria-label="Filtrer les établissements">
            {([
              ["all", "Tous"],
              ["alpha", "Étude Alpha"],
              ["mise-a-dispo", "Mise à disposition"],
              ["with-posts", "Avec posts"],
              ["without-posts", "Sans posts"],
            ] as const).map(([value, label]) => (
              <button key={value} className={schoolFilter === value ? "active" : ""} onClick={() => setSchoolFilter(value)}>{label}</button>
            ))}
          </div>
          <details className="school-assignment-directory" open>
            <summary>
              <div><strong>Répartition des établissements</strong><span>{schools.filter((school) => !school.portfolioOwner).length} non attribué{schools.filter((school) => !school.portfolioOwner).length > 1 ? "s" : ""} · {schools.length} au total</span></div>
              <small>Attribuer à Kelly, Pierre ou Julie</small>
            </summary>
            <div className="owner-count-strip school-owner-counts">
              <span className="owner-count-title">Établissements par responsable</span>
              {(["kelly", "pierre", "julie", ""] as SchoolPortfolioOwner[]).map((owner) => <div className={!owner ? "unassigned" : ""} key={owner || "unassigned"}><small>{schoolPortfolioOwnerLabels[owner]}</small><strong>{schoolCountsByOwner[owner]}</strong></div>)}
            </div>
            <div className="school-assignment-filters">
              {(["all", "unassigned", "kelly", "pierre", "julie"] as const).map((owner) => <button type="button" className={schoolAssignmentFilter === owner ? "active" : ""} onClick={() => setSchoolAssignmentFilter(owner)} key={owner}>{owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolPortfolioOwnerLabels[owner]}</button>)}
              <button type="button" className="school-assignment-export" onClick={exportSchoolAssignments} disabled={!schools.length}>↓ Exporter la répartition CSV</button>
            </div>
            <details className="school-assignment-importer">
              <summary>Importer ou coller une répartition</summary>
              <div>
                <p>Format attendu : <code>Nom de l’établissement [tabulation] pierre@etudealpha.fr</code>. Les établissements non reconnus ne sont pas modifiés.</p>
                <textarea rows={5} value={schoolAssignmentPaste} onChange={(event) => setSchoolAssignmentPaste(event.target.value)} placeholder={"Lyon - Saint Louis Saint Bruno\tpierre@etudealpha.fr"} />
                <div className="school-assignment-import-actions">
                  <label className="button quiet">Choisir un fichier<input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={(event) => { void importSchoolAssignmentsFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
                  <button type="button" className="button primary" onClick={() => importSchoolAssignments(schoolAssignmentPaste)} disabled={saving || !schoolAssignmentPaste.trim()}>Préremplir les attributions</button>
                </div>
                {schoolAssignmentImportReport ? <div className="school-assignment-import-report">
                  <strong>{schoolAssignmentImportReport.matched} reconnu{schoolAssignmentImportReport.matched > 1 ? "s" : ""} · {schoolAssignmentImportReport.changed} modifié{schoolAssignmentImportReport.changed > 1 ? "s" : ""}</strong>
                  <span>{schoolAssignmentImportReport.duplicates} doublon{schoolAssignmentImportReport.duplicates > 1 ? "s" : ""} ignoré{schoolAssignmentImportReport.duplicates > 1 ? "s" : ""} · {schoolAssignmentImportReport.invalid} ligne{schoolAssignmentImportReport.invalid > 1 ? "s" : ""} invalide{schoolAssignmentImportReport.invalid > 1 ? "s" : ""}</span>
                  {schoolAssignmentImportReport.unmatched.length ? <small>Non retrouvés ({schoolAssignmentImportReport.unmatched.length}) : {schoolAssignmentImportReport.unmatched.slice(0, 8).join(" · ")}{schoolAssignmentImportReport.unmatched.length > 8 ? ` · +${schoolAssignmentImportReport.unmatched.length - 8}` : ""}</small> : null}
                </div> : null}
              </div>
            </details>
            <div className="school-assignment-list">
              {assignmentSchools.map((school) => <div className={!school.portfolioOwner ? "is-unassigned" : ""} key={school.id}>
                <div><SchoolAdminLink schoolId={school.externalId}>{school.name}</SchoolAdminLink><small>{[school.city, school.externalId ? `ID ${school.externalId}` : ""].filter(Boolean).join(" · ") || "Informations non renseignées"}</small></div>
                <div className="school-assignment-row-actions">
                  <select value={school.portfolioOwner} onChange={(event) => assignSchoolPortfolioOwner(school.id, event.target.value as SchoolPortfolioOwner)} disabled={saving} aria-label={`Responsable de ${school.name}`}>
                    <option value="">Non attribué</option><option value="kelly">Kelly</option><option value="pierre">Pierre</option><option value="julie">Julie</option>
                  </select>
                  <button type="button" onClick={() => openEditSchool(school)}>Modifier</button>
                </div>
              </div>)}
              {!assignmentSchools.length ? <p>Aucun établissement ne correspond à ce filtre.</p> : null}
            </div>
          </details>
          <div className="school-crm-layout">
            <div className="school-feed">
              {crmFeedItems.length ? crmFeedItems.map(({ school, event }) => (
                <article className={`crm-post-card school-type-${school.schoolType}`} key={`${school.id}-${event.id}`}>
                  <div className="crm-post-date">
                    <span>{formatJournalDate(event.date).split(" ")[0]}</span>
                    <small>{formatJournalDate(event.date).split(" ").slice(1).join(" ")}</small>
                  </div>
                  <div className="crm-post-body">
                    <div className="crm-post-head">
                      <div className="crm-school-links">
                        <SchoolAdminLink schoolId={school.externalId}>{school.name}</SchoolAdminLink>
                        <button onClick={() => setSelectedSchoolId(school.id)}>Fiche CRM</button>
                      </div>
                      <div>
                        <span className={`school-type-pill school-type-${school.schoolType}`}>{schoolTypeLabels[school.schoolType]}</span>
                        <span>{schoolEventKindLabels[event.kind]}</span>
                      </div>
                    </div>
                    <h3>{event.title || "Trace sans titre"}</h3>
                    {event.note && <p>{event.note}</p>}
                    <div className="school-meta crm-post-meta">
                      {school.city && <span>{school.city}</span>}
                      {(school.coordinator || school.contact) && <span>{school.coordinator || school.contact}</span>}
                      <span>{event.author}</span>
                    </div>
                    {event.tags.length > 0 && (
                      <div className="school-event-tags">
                        {event.tags.map((tag) => <button key={tag} onClick={() => setSchoolQuery(tag)}>#{tag}</button>)}
                      </div>
                    )}
                    {renderSocialControls(
                      event.likes,
                      event.comments,
                      () => { void likeSchoolEvent(school.id, event.id); },
                      (formEvent) => { void addSchoolEventComment(school.id, event.id, formEvent); },
                      event.title || school.name,
                    )}
                  </div>
                </article>
              )) : (
                <div className="empty-state school-empty">
                  <span>⌂</span>
                  <h3>{schools.length ? "Aucun post CRM trouvé" : "Premier établissement à ajouter"}</h3>
                  <p>{schools.length ? "Créez un post CRM ou ajustez les filtres." : "Ajoutez un établissement puis consignez chaque appel, rendez-vous, commentaire ou prochaine action."}</p>
                  <div className="empty-actions">
                    {schools.length > 0 && <button className="button primary" onClick={() => openSchoolEvent()}>Créer un post CRM</button>}
                    <button className="button quiet" onClick={openNewSchool}>Ajouter un établissement</button>
                  </div>
                </div>
              )}
              {schoolsWithoutEvents.length > 0 && (
                <section className="schools-without-posts">
                  <h3>Établissements sans historique</h3>
                  <div>
                    {schoolsWithoutEvents.slice(0, 24).map((school) => (
                      <button key={school.id} onClick={() => setSelectedSchoolId(school.id)}>
                        <span className={`school-type-pill school-type-${school.schoolType}`}>{schoolTypeLabels[school.schoolType]}</span>
                        {school.name}
                      </button>
                    ))}
                  </div>
                  {schoolsWithoutEvents.length > 24 && <p>+ {schoolsWithoutEvents.length - 24} autre(s) établissement(s), utilisez la recherche pour les retrouver.</p>}
                </section>
              )}
            </div>
            {selectedSchool && (
              <aside className={`school-detail-card school-type-${selectedSchool.schoolType}`}>
                <div className="school-detail-head">
                  <div>
                    <p className="eyebrow">Fiche établissement</p>
                    <h3><SchoolAdminLink schoolId={selectedSchool.externalId}>{selectedSchool.name}</SchoolAdminLink></h3>
                  </div>
                  <button className="close-button" onClick={() => setSelectedSchoolId(null)} aria-label="Fermer la fiche établissement">×</button>
                </div>
                <div className="school-meta">
                  <span className={`school-type-pill school-type-${selectedSchool.schoolType}`}>{schoolTypeLabels[selectedSchool.schoolType]}</span>
                  {selectedSchool.externalId && <span>ID {selectedSchool.externalId}</span>}
                  {selectedSchool.category && <span>{selectedSchool.category}</span>}
                  {selectedSchool.city && <span>{selectedSchool.city}</span>}
                  {selectedSchool.registeredCount !== null && <span>{selectedSchool.registeredCount} inscrit{selectedSchool.registeredCount > 1 ? "s" : ""}</span>}
                </div>
                {(selectedSchool.nextAction || selectedSchool.notes) && (
                  <div className="school-summary school-detail-summary">
                    {selectedSchool.nextAction && <div><small>Prochaine action</small><strong>{selectedSchool.nextAction}</strong></div>}
                    {selectedSchool.notes && <div><small>Notes</small><span>{selectedSchool.notes}</span></div>}
                  </div>
                )}
                <div className="school-imported-info">
                  {selectedSchool.coordinator && <span>Coordinateur : {selectedSchool.coordinator}</span>}
                  {selectedSchool.zone && <span>{selectedSchool.zone}</span>}
                  {selectedSchool.address && <span>{selectedSchool.address}</span>}
                  {selectedSchool.department && <span>{selectedSchool.department}</span>}
                </div>
                <div className="school-detail-actions">
                  <button className="button primary" onClick={() => openSchoolEvent(selectedSchool.id)}>Ajouter un post</button>
                  <button className="button quiet" onClick={() => openEditSchool(selectedSchool)}>Modifier</button>
                  <button className="button quiet danger-button" onClick={() => deleteSchool(selectedSchool.id)}>Supprimer</button>
                </div>
                <div className="school-detail-posts">
                  <strong>Derniers posts</strong>
                  {selectedSchool.events.slice(0, 5).map((event) => (
                    <div key={event.id}>
                      <small>{formatJournalDate(event.date)} · {schoolEventKindLabels[event.kind]}</small>
                      <span>{event.title || excerpt(event.note, 80)}</span>
                    </div>
                  ))}
                  {!selectedSchool.events.length && <p>Aucun post CRM pour le moment.</p>}
                </div>
              </aside>
            )}
          </div>
        </section>
        : appMode === "history" ? renderStudentHistorySection()
        : <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Objectifs qualitatifs</h2>
              <p>{`${qualitativeObjectives.length} objectif${qualitativeObjectives.length > 1 ? "s" : ""} d'equipe`}</p>
            </div>
            <div className="filters">
              <button className="button quiet" onClick={() => { void loadObjectives(); }} disabled={saving}>↻ Actualiser</button>
              <button className="button primary" onClick={openNewQualitativeObjective} disabled={saving}>＋ Nouvel objectif</button>
            </div>
          </div>
          <div className="objective-list">
            {qualitativeObjectives.length ? qualitativeObjectives.map((objective) => (
              <article className={`qualitative-objective status-${objective.status}`} key={objective.id}>
                <div>
                  <div className="objective-row-head">
                    <span className={`status-pill status-${objective.status}`}><span className="status-dot"></span>{objectiveStatusLabels[objective.status]}</span>
                    {(objective.startDate || objective.endDate) && (
                      <span className="duration-pill">
                        {objective.startDate ? formatDate(objective.startDate) : "Date libre"}
                        {objective.endDate ? ` → ${formatDate(objective.endDate)}` : ""}
                      </span>
                    )}
                  </div>
                  <h3>{objective.title}</h3>
                  <p>{objective.description || "Aucune description ajoutee."}</p>
                  {objective.progressNote && <small className="objective-note">Avancement : {objective.progressNote}</small>}
                  <div className="objective-tags">
                    {objective.personIds.length ? objective.personIds.map((personId) => {
                      const person = peopleById.get(personId);
                      if (!person) return null;
                      return <span className="objective-person" key={person.id}><span className="avatar">{ownerInitials(person.name)}</span>{person.name}</span>;
                    }) : <small>Aucune personne taguee.</small>}
                  </div>
                </div>
                <div className="row-actions">
                  <button className="button quiet" onClick={() => openObjective(objective)}>Modifier</button>
                  <button className="icon-button danger-icon" onClick={() => deleteObjective(objective.id)} aria-label={`Supprimer ${objective.title}`}>×</button>
                </div>
              </article>
            )) : (
              <div className="empty-state">
                <span>◎</span>
                <h3>Aucun objectif qualitatif</h3>
                <p>Ajoutez un cap pour une personne ou un petit groupe, avec une date cible si besoin.</p>
                <button className="button primary" onClick={openNewQualitativeObjective}>Creer le premier objectif</button>
              </div>
            )}
          </div>
        </section>}
      </section>

      {editorOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditorOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="modal-header">
              <div><p className="eyebrow">{editingId ? "Modification" : "Nouvelle tache"}</p><h2 id="editor-title">{editingId ? "Mettre a jour la tache" : "Que faut-il faire ?"}</h2></div>
              <button className="close-button" onClick={() => setEditorOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveTask} className="task-form">
              <label className="field full"><span>Tache *</span><input autoFocus required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Ex. Preparer la reunion mensuelle" /></label>
              <label className="field full"><span>Description</span><textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Ajoutez les informations utiles..." /></label>
              <label className="field">
                <span>Assigner a une personne</span>
                <select value={draft.assigneeId || ""} onChange={(event) => selectAssignee(event.target.value)}>
                  <option value="">Aucune personne enregistree</option>
                  {activePeople.map((person) => <option key={person.id} value={person.id}>{person.name}{person.hasEmail ? " - email enregistre" : " - sans email"}</option>)}
                </select>
              </label>
              <label className="field"><span>Responsable *</span><input required list="owners" value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value, assigneeId: null })} placeholder="Prenom ou equipe" /><datalist id="owners">{owners.map((owner) => <option key={owner} value={owner} />)}</datalist></label>
              <label className="field"><span>Priorite</span><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}><option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option></select></label>
              <label className="field"><span>Statut</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}><option value="todo">A faire</option><option value="progress">En cours</option><option value="done">Terminee</option></select></label>
              <label className="field"><span>Duree estimee <small>(heures)</small></span><input type="number" min="0" step="0.25" value={draft.estimatedHours ?? ""} onChange={(event) => setDraft({ ...draft, estimatedHours: event.target.value ? Number(event.target.value) : null })} placeholder="Ex. 2.5" /></label>
              <label className="field"><span>Date de debut *</span><input required type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label>
              <label className="field"><span>Date de fin <small>(facultative)</small></span><input type="date" min={draft.startDate} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></label>
              <label className="field checkbox-field verification-toggle-field">
                <input type="checkbox" checked={draft.verified} onChange={(event) => setDraft({ ...draft, verified: event.target.checked })} />
                <span>Tâche vérifiée <small>facultatif</small></span>
              </label>
              <label className="field"><span>Responsable vérification</span><input list="owners" value={draft.verificationOwner} onChange={(event) => setDraft({ ...draft, verificationOwner: event.target.value })} placeholder="Prenom ou equipe" /></label>
              <label className="field full"><span>Commentaire de vérification</span><textarea rows={2} value={draft.verificationComment} onChange={(event) => setDraft({ ...draft, verificationComment: event.target.value })} placeholder="Ce qui a été contrôlé, point d'attention, validation..." /></label>
              {draft.assigneeId && (
                <label className="field checkbox-field assignment-email-field">
                  <input type="checkbox" checked={sendAssignmentEmail} disabled={!draftAssignee?.hasEmail || !assignmentChanged} onChange={(event) => setSendAssignmentEmail(event.target.checked)} />
                  <span>
                    Envoyer un email d&apos;assignation
                    <small>
                      {!draftAssignee?.hasEmail
                        ? "pas d'email enregistre"
                        : assignmentChanged
                          ? "email enregistre"
                          : "assignation inchangee : aucun nouvel email"}
                    </small>
                  </span>
                </label>
              )}
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setEditorOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : editingId ? "Enregistrer" : "Ajouter la tache"}</button></div>
            </form>
          </section>
        </div>
      )}

      {recurringOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setRecurringOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="recurring-title">
            <div className="modal-header">
              <div><p className="eyebrow">{editingRecurringId ? "Modele recurrent" : "Nouveau modele"}</p><h2 id="recurring-title">{editingRecurringId ? "Modifier le modele" : "Creer un modele recurrent"}</h2></div>
              <button className="close-button" onClick={() => setRecurringOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveRecurringTask} className="task-form">
              <label className="field full"><span>Tache type *</span><input autoFocus required value={recurringDraft.title} onChange={(event) => setRecurringDraft({ ...recurringDraft, title: event.target.value })} placeholder="Ex. Envoyer le bilan hebdomadaire" /></label>
              <label className="field full"><span>Description</span><textarea rows={3} value={recurringDraft.description} onChange={(event) => setRecurringDraft({ ...recurringDraft, description: event.target.value })} placeholder="Informations reprises quand on cree une tache..." /></label>
              <label className="field">
                <span>Assigner a une personne</span>
                <select value={recurringDraft.assigneeId || ""} onChange={(event) => selectRecurringAssignee(event.target.value)}>
                  <option value="">Aucune personne enregistree</option>
                  {activePeople.map((person) => <option key={person.id} value={person.id}>{person.name}{person.hasEmail ? " - email enregistre" : " - sans email"}</option>)}
                </select>
              </label>
              <label className="field"><span>Responsable *</span><input required list="recurring-owners" value={recurringDraft.owner} onChange={(event) => setRecurringDraft({ ...recurringDraft, owner: event.target.value, assigneeId: null })} placeholder="Prenom ou equipe" /><datalist id="recurring-owners">{owners.map((owner) => <option key={owner} value={owner} />)}</datalist></label>
              <label className="field"><span>Priorite</span><select value={recurringDraft.priority} onChange={(event) => setRecurringDraft({ ...recurringDraft, priority: event.target.value as Priority })}><option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option></select></label>
              <label className="field"><span>Duree estimee <small>(heures)</small></span><input type="number" min="0" step="0.25" value={recurringDraft.estimatedHours ?? ""} onChange={(event) => setRecurringDraft({ ...recurringDraft, estimatedHours: event.target.value ? Number(event.target.value) : null })} placeholder="Ex. 1.5" /></label>
              <div className="form-note">Les dates ne sont pas stockees dans le modele. Elles seront choisies au moment de creer la vraie tache.</div>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setRecurringOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : editingRecurringId ? "Enregistrer" : "Ajouter le modele"}</button></div>
            </form>
          </section>
        </div>
      )}

      {linkOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setLinkOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="link-title">
            <div className="modal-header">
              <div><p className="eyebrow">Lien partage</p><h2 id="link-title">{editingLinkId ? "Modifier le lien" : "Ajouter un lien"}</h2></div>
              <button className="close-button" onClick={() => setLinkOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveLink} className="task-form">
              <label className="field full"><span>Nom du lien *</span><input autoFocus required value={linkDraft.title} onChange={(event) => setLinkDraft({ ...linkDraft, title: event.target.value })} placeholder="Ex. Tableau des inscriptions" /></label>
              <label className="field full"><span>Description</span><textarea rows={3} value={linkDraft.description} onChange={(event) => setLinkDraft({ ...linkDraft, description: event.target.value })} placeholder="A quoi sert ce lien ?" /></label>
              <label className="field full"><span>Lien *</span><input required value={linkDraft.url} onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value })} placeholder="https://..." /></label>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setLinkOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer"}</button></div>
            </form>
          </section>
        </div>
      )}

      {journalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setJournalOpen(false)}>
          <section className="modal notify-modal" role="dialog" aria-modal="true" aria-labelledby="journal-title">
            <div className="modal-header">
              <div><p className="eyebrow">Journal de l’Étude Alpha</p><h2 id="journal-title">{editingJournalId ? "Modifier le post" : "Nouveau post"}</h2></div>
              <button className="close-button" onClick={() => setJournalOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveJournalPost} className="task-form">
              <label className="field full"><span>Titre *</span><input autoFocus required value={journalDraft.title} onChange={(event) => setJournalDraft({ ...journalDraft, title: event.target.value })} placeholder="Ex. Ce qu'on retient de la journée" /></label>
              <label className="field full"><span>Post *</span><textarea required rows={6} value={journalDraft.content} onChange={(event) => setJournalDraft({ ...journalDraft, content: event.target.value })} placeholder="Décisions, apprentissages, petites victoires, points d'attention..." /></label>
              <label className="field"><span>Auteur</span><input value={journalDraft.author} onChange={(event) => setJournalDraft({ ...journalDraft, author: event.target.value })} placeholder={authorName || "Equipe Alpha"} /></label>
              <label className="field"><span>Date</span><input type="date" value={journalDraft.publishedAt.slice(0, 10)} onChange={(event) => setJournalDraft({ ...journalDraft, publishedAt: event.target.value })} /></label>
              <label className="field full"><span>Tags</span><input value={tagsToText(journalDraft.tags)} onChange={(event) => setJournalDraft({ ...journalDraft, tags: normalizeTags(event.target.value) })} placeholder="rentrée, organisation, victoire" /></label>
              <div className="field full">
                <span>Personnes taguées</span>
                <div className="recipient-list objective-recipient-list">
                  {activePeople.length ? activePeople.map((person) => (
                    <label className="recipient-row" key={person.id}>
                      <input
                        type="checkbox"
                        checked={journalDraft.personIds.includes(person.id)}
                        onChange={(event) => toggleJournalPerson(person.id, event.target.checked)}
                      />
                      <span className="avatar">{ownerInitials(person.name)}</span>
                      <span><strong>{person.name}</strong><small>personne taguée</small></span>
                    </label>
                  )) : <p className="no-comment">Ajoutez d&apos;abord des personnes pour les taguer.</p>}
                </div>
              </div>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setJournalOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer"}</button></div>
            </form>
          </section>
        </div>
      )}

      {communicationOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCommunicationOpen(false)}>
          <section className="modal notify-modal" role="dialog" aria-modal="true" aria-labelledby="communication-title">
            <div className="modal-header">
              <div><p className="eyebrow">Communication de masse</p><h2 id="communication-title">{editingCommunicationId ? "Modifier la communication" : "Nouvelle communication"}</h2></div>
              <button className="close-button" onClick={() => setCommunicationOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveCommunication} className="task-form">
              <label className="field full"><span>Titre *</span><input autoFocus required value={communicationDraft.title} onChange={(event) => setCommunicationDraft({ ...communicationDraft, title: event.target.value })} placeholder="Ex. Relance rentrée aux parents" /></label>
              <div className="field full">
                <span>Publics concernés *</span>
                <div className="recipient-list objective-recipient-list communication-audience-picker">
                  {communicationAudiences.map((audience) => (
                    <label className="recipient-row" key={audience}>
                      <input
                        type="checkbox"
                        checked={communicationDraft.audiences.includes(audience)}
                        onChange={(event) => toggleCommunicationAudience(audience, event.target.checked)}
                      />
                      <span className="avatar">{communicationAudienceLabels[audience].slice(0, 1)}</span>
                      <span><strong>{communicationAudienceLabels[audience]}</strong><small>groupe destinataire</small></span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="field"><span>Canal</span><select value={communicationDraft.channel} onChange={(event) => setCommunicationDraft({ ...communicationDraft, channel: event.target.value })}>{communicationChannels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select></label>
              <label className="field"><span>Statut</span><select value={communicationDraft.status} onChange={(event) => setCommunicationDraft({ ...communicationDraft, status: event.target.value as CommunicationStatus })}><option value="sent">Envoyé</option><option value="to-follow-up">À relancer</option><option value="draft">Brouillon</option><option value="cancelled">Annulé</option></select></label>
              <label className="field"><span>Date d&apos;envoi</span><input type="date" value={communicationDraft.sentAt} onChange={(event) => setCommunicationDraft({ ...communicationDraft, sentAt: event.target.value })} /></label>
              <label className="field"><span>Date de relance</span><input type="date" value={communicationDraft.followUpDate} onChange={(event) => setCommunicationDraft({ ...communicationDraft, followUpDate: event.target.value })} /></label>
              <label className="field full"><span>Résumé du message</span><textarea rows={4} value={communicationDraft.messageSummary} onChange={(event) => setCommunicationDraft({ ...communicationDraft, messageSummary: event.target.value })} placeholder="Sujet du message, information transmise, appel à action..." /></label>
              <label className="field full"><span>Notes internes</span><textarea rows={3} value={communicationDraft.notes} onChange={(event) => setCommunicationDraft({ ...communicationDraft, notes: event.target.value })} placeholder="Retours observés, éléments à surveiller, prochaine étape..." /></label>
              <label className="field full"><span>Tags</span><input value={tagsToText(communicationDraft.tags)} onChange={(event) => setCommunicationDraft({ ...communicationDraft, tags: normalizeTags(event.target.value) })} placeholder="rentrée, relance, inscription" /></label>
              <label className="field full"><span>Auteur</span><input value={communicationDraft.author} onChange={(event) => setCommunicationDraft({ ...communicationDraft, author: event.target.value })} placeholder={authorName || "Equipe Alpha"} /></label>
              <div className="form-actions">
                <button type="button" className="button quiet" onClick={() => setCommunicationOpen(false)}>Annuler</button>
                <button type="submit" className="button primary" disabled={saving || !communicationDraft.title.trim() || communicationDraft.audiences.length === 0}>{saving ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {schoolWatchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSchoolWatchOpen(false)}>
          <section className="modal notify-modal" role="dialog" aria-modal="true" aria-labelledby="watch-title">
            <div className="modal-header">
              <div><p className="eyebrow">Établissement à suivre</p><h2 id="watch-title">{editingSchoolWatchId ? "Modifier le suivi" : "Nouveau suivi"}</h2></div>
              <button className="close-button" onClick={() => setSchoolWatchOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveSchoolWatchItem} className="task-form">
              <label className="field full">
                <span>Établissement *</span>
                <select autoFocus required value={schoolWatchDraft.schoolId} onChange={(event) => setSchoolWatchDraft({ ...schoolWatchDraft, schoolId: event.target.value })}>
                  <option value="">Choisir un établissement</option>
                  {schools
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                    .map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} · {schoolTypeLabels[school.schoolType]}{school.city ? ` · ${school.city}` : ""}
                      </option>
                    ))}
                </select>
              </label>
              <label className="field full"><span>Raison du suivi *</span><textarea required rows={3} value={schoolWatchDraft.reason} onChange={(event) => setSchoolWatchDraft({ ...schoolWatchDraft, reason: event.target.value })} placeholder="Pourquoi cet établissement doit rester visible ?" /></label>
              <div className="field full">
                <span>Tags</span>
                <div className="crm-tag-picker">
                  {schoolWatchTags.map((tag) => (
                    <button type="button" key={tag} className={schoolWatchDraft.tags.includes(tag) ? "active" : ""} onClick={() => toggleSchoolWatchTag(tag)}>{tag}</button>
                  ))}
                </div>
              </div>
              <label className="field"><span>Statut</span><select value={schoolWatchDraft.status} onChange={(event) => setSchoolWatchDraft({ ...schoolWatchDraft, status: event.target.value as SchoolWatchStatus })}><option value="active">Actif</option><option value="resolved">Résolu</option></select></label>
              <label className="field"><span>Auteur</span><input value={schoolWatchDraft.author} onChange={(event) => setSchoolWatchDraft({ ...schoolWatchDraft, author: event.target.value })} placeholder={authorName || "Equipe Alpha"} /></label>
              {!editingSchoolWatchId && <label className="field full"><span>Commentaire initial</span><textarea rows={3} value={schoolWatchDraft.initialComment} onChange={(event) => setSchoolWatchDraft({ ...schoolWatchDraft, initialComment: event.target.value })} placeholder="Premier contexte, détail du besoin ou point d'attention..." /></label>}
              <div className="form-actions">
                <button type="button" className="button quiet" onClick={() => setSchoolWatchOpen(false)}>Annuler</button>
                <button type="submit" className="button primary" disabled={saving || !schoolWatchDraft.schoolId || !schoolWatchDraft.reason.trim()}>{saving ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {schoolOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSchoolOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="school-title">
            <div className="modal-header">
              <div><p className="eyebrow">Mini-CRM établissements</p><h2 id="school-title">{editingSchoolId ? "Modifier l&apos;établissement" : "Nouvel établissement"}</h2></div>
              <button className="close-button" onClick={() => setSchoolOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveSchool} className="task-form">
              <label className="field full"><span>Nom de l&apos;établissement *</span><input autoFocus required value={schoolDraft.name} onChange={(event) => setSchoolDraft({ ...schoolDraft, name: event.target.value })} placeholder="Ex. Collège Saint-Exupéry" /></label>
              <label className="field"><span>ID établissement</span><input value={schoolDraft.externalId} onChange={(event) => setSchoolDraft({ ...schoolDraft, externalId: event.target.value })} placeholder="Ex. 123" /></label>
              <label className="field"><span>Type d&apos;établissement</span><select value={schoolDraft.schoolType} onChange={(event) => setSchoolDraft({ ...schoolDraft, schoolType: event.target.value as SchoolType })}><option value="alpha">Étude Alpha</option><option value="mise-a-dispo">Mise à disposition</option><option value="mixed">Mixte / autre</option></select></label>
              <label className="field"><span>Responsable</span><select value={schoolDraft.portfolioOwner} onChange={(event) => setSchoolDraft({ ...schoolDraft, portfolioOwner: event.target.value as SchoolPortfolioOwner })}><option value="">Non attribué</option><option value="kelly">Kelly</option><option value="pierre">Pierre</option><option value="julie">Julie</option></select></label>
              <label className="field"><span>Catégorie</span><input value={schoolDraft.category} onChange={(event) => setSchoolDraft({ ...schoolDraft, category: event.target.value })} placeholder="Ex. Étude Alpha" /></label>
              <label className="field"><span>Ville</span><input value={schoolDraft.city} onChange={(event) => setSchoolDraft({ ...schoolDraft, city: event.target.value })} placeholder="Ex. Paris" /></label>
              <label className="field"><span>Coordinateur</span><input value={schoolDraft.coordinator} onChange={(event) => setSchoolDraft({ ...schoolDraft, coordinator: event.target.value, contact: event.target.value })} placeholder="Ex. Sophie Martin" /></label>
              <label className="field"><span>Inscrits</span><input type="number" min="0" step="1" value={schoolDraft.registeredCount ?? ""} onChange={(event) => setSchoolDraft({ ...schoolDraft, registeredCount: event.target.value ? Number(event.target.value) : null })} placeholder="0" /></label>
              <label className="field"><span>Zone</span><input value={schoolDraft.zone} onChange={(event) => setSchoolDraft({ ...schoolDraft, zone: event.target.value })} placeholder="Zone A" /></label>
              <label className="field full"><span>Adresse</span><input value={schoolDraft.address} onChange={(event) => setSchoolDraft({ ...schoolDraft, address: event.target.value })} placeholder="Adresse de l'établissement" /></label>
              <label className="field full"><span>Département</span><input value={schoolDraft.department} onChange={(event) => setSchoolDraft({ ...schoolDraft, department: event.target.value })} placeholder="Département / code postal" /></label>
              <label className="field full"><span>Prochaine action à mener</span><input value={schoolDraft.nextAction} onChange={(event) => setSchoolDraft({ ...schoolDraft, nextAction: event.target.value })} placeholder="Ex. Relancer la direction mardi" /></label>
              <label className="field"><span>Semaine à venir</span><input value={schoolDraft.upcomingWeek} onChange={(event) => setSchoolDraft({ ...schoolDraft, upcomingWeek: event.target.value })} /></label>
              <label className="field"><span>Séances passées</span><input value={schoolDraft.pastSessions} onChange={(event) => setSchoolDraft({ ...schoolDraft, pastSessions: event.target.value })} /></label>
              <label className="field"><span>Semaine type</span><input value={schoolDraft.typicalWeek} onChange={(event) => setSchoolDraft({ ...schoolDraft, typicalWeek: event.target.value })} /></label>
              <label className="field"><span>Contrat signé</span><input value={schoolDraft.contractSigned} onChange={(event) => setSchoolDraft({ ...schoolDraft, contractSigned: event.target.value })} /></label>
              <label className="field full"><span>Actions importées</span><input value={schoolDraft.actions} onChange={(event) => setSchoolDraft({ ...schoolDraft, actions: event.target.value })} /></label>
              <label className="field full"><span>Notes générales</span><textarea rows={3} value={schoolDraft.notes} onChange={(event) => setSchoolDraft({ ...schoolDraft, notes: event.target.value })} placeholder="Contexte, relation, préférences, points importants..." /></label>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setSchoolOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer"}</button></div>
            </form>
          </section>
        </div>
      )}

      {schoolEventOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSchoolEventOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="school-event-title">
            <div className="modal-header">
              <div><p className="eyebrow">Historique établissement</p><h2 id="school-event-title">Ajouter une trace</h2></div>
              <button className="close-button" onClick={() => setSchoolEventOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveSchoolEvent} className="task-form">
              <label className="field full">
                <span>Établissement *</span>
                <select
                  autoFocus
                  required
                  value={eventSchoolId || ""}
                  onChange={(event) => setEventSchoolId(event.target.value)}
                >
                  <option value="">Choisir un établissement</option>
                  {schools
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                    .map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} · {schoolTypeLabels[school.schoolType]}{school.city ? ` · ${school.city}` : ""}
                      </option>
                    ))}
                </select>
              </label>
              <label className="field"><span>Type</span><select value={schoolEventDraft.kind} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, kind: event.target.value as SchoolEventKind })}><option value="action">Action réalisée</option><option value="comment">Commentaire</option><option value="event">Événement</option></select></label>
              <label className="field"><span>Date</span><input type="date" value={schoolEventDraft.date.slice(0, 10)} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, date: event.target.value })} /></label>
              <label className="field full"><span>Titre</span><input value={schoolEventDraft.title} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, title: event.target.value })} placeholder="Ex. Appel avec la direction" /></label>
              <label className="field full"><span>Commentaire / détail</span><textarea rows={4} value={schoolEventDraft.note} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, note: event.target.value })} placeholder="Ce qui a été fait, décidé, demandé, ou la prochaine étape..." /></label>
              <div className="field full">
                <span>Tags CRM</span>
                <div className="crm-tag-picker">
                  {crmTagSuggestions.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      className={schoolEventDraft.tags.includes(tag) ? "active" : ""}
                      onClick={() => toggleSchoolEventTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field full"><span>Tags libres</span><input value={tagsToText(schoolEventDraft.tags)} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, tags: normalizeTags(event.target.value) })} placeholder="Autre tag, besoin urgent..." /></label>
              <label className="field full"><span>Auteur</span><input value={schoolEventDraft.author} onChange={(event) => setSchoolEventDraft({ ...schoolEventDraft, author: event.target.value })} placeholder={authorName || "Equipe Alpha"} /></label>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setSchoolEventOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving || (!schoolEventDraft.title.trim() && !schoolEventDraft.note.trim())}>{saving ? "Sauvegarde..." : "Ajouter à l'historique"}</button></div>
            </form>
          </section>
        </div>
      )}

      {objectiveOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setObjectiveOpen(false)}>
          <section className="modal notify-modal" role="dialog" aria-modal="true" aria-labelledby="objective-title">
            <div className="modal-header">
              <div><p className="eyebrow">Objectif equipe</p><h2 id="objective-title">{editingObjectiveId ? "Modifier l'objectif" : "Nouvel objectif"}</h2></div>
              <button className="close-button" onClick={() => setObjectiveOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveObjective} className="task-form">
              <label className="field"><span>Titre *</span><input required value={objectiveDraft.title} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, title: event.target.value })} placeholder="Objectif septembre" /></label>
              {objectiveDraft.kind === "counter" ? (
                <>
                  <label className="field"><span>Déjà atteint</span><input type="number" min="0" step="1" value={objectiveDraft.currentValue ?? ""} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, currentValue: event.target.value ? Number(event.target.value) : null })} placeholder="160" /></label>
                  <label className="field"><span>Objectif total *</span><input required type="number" min="1" step="1" value={objectiveDraft.targetValue ?? ""} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, targetValue: event.target.value ? Number(event.target.value) : null })} placeholder="2600" /></label>
                  <label className="field"><span>Unité</span><input value={objectiveDraft.targetLabel} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, targetLabel: event.target.value })} placeholder="élèves" /></label>
                </>
              ) : (
                <>
                  <label className="field"><span>Statut</span><select value={objectiveDraft.status} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, status: event.target.value as ObjectiveStatus })}><option value="todo">A preparer</option><option value="progress">En cours</option><option value="done">Atteint</option></select></label>
                  <label className="field"><span>Date de debut</span><input type="date" value={objectiveDraft.startDate} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, startDate: event.target.value })} /></label>
                  <label className="field"><span>Date cible</span><input type="date" min={objectiveDraft.startDate || undefined} value={objectiveDraft.endDate} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, endDate: event.target.value })} /></label>
                </>
              )}
              <label className="field full"><span>Description</span><textarea rows={3} value={objectiveDraft.description} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, description: event.target.value })} placeholder="Pourquoi cet objectif compte, ou comment l'equipe doit s'organiser..." /></label>
              {objectiveDraft.kind === "qualitative" && (
                <label className="field full"><span>Commentaire d&apos;avancement</span><textarea rows={2} value={objectiveDraft.progressNote} onChange={(event) => setObjectiveDraft({ ...objectiveDraft, progressNote: event.target.value })} placeholder="Dernier point d'avancement, blocage, prochaine étape..." /></label>
              )}
              <div className="field full">
                <span>Personnes taguees</span>
                <div className="recipient-list objective-recipient-list">
                  {activePeople.length ? activePeople.map((person) => (
                    <label className="recipient-row" key={person.id}>
                      <input
                        type="checkbox"
                        checked={objectiveDraft.personIds.includes(person.id)}
                        onChange={(event) => toggleObjectivePerson(person.id, event.target.checked)}
                      />
                      <span className="avatar">{ownerInitials(person.name)}</span>
                      <span><strong>{person.name}</strong><small>{person.hasEmail ? "email enregistre" : "email manquant"}</small></span>
                    </label>
                  )) : <p className="no-comment">Ajoutez d&apos;abord des personnes pour les taguer.</p>}
                </div>
              </div>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setObjectiveOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer"}</button></div>
            </form>
          </section>
        </div>
      )}

      {peopleOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPeopleOpen(false)}>
          <section className="modal people-modal" role="dialog" aria-modal="true" aria-labelledby="people-title">
            <div className="modal-header">
              <div><p className="eyebrow">Equipe</p><h2 id="people-title">Personnes et notifications</h2></div>
              <button className="close-button" onClick={() => setPeopleOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={savePerson} className="task-form people-form">
              <label className="field"><span>Nom *</span><input required value={personDraft.name} onChange={(event) => setPersonDraft({ ...personDraft, name: event.target.value })} placeholder="Ex. Sophie" /></label>
              <label className="field"><span>Email masque</span><input type="email" value={personDraft.email} onChange={(event) => setPersonDraft({ ...personDraft, email: event.target.value })} placeholder={personDraft.id ? "Laisser vide pour conserver" : "exemple@domaine.fr"} /></label>
              <label className="field checkbox-field"><input type="checkbox" checked={personDraft.active} onChange={(event) => setPersonDraft({ ...personDraft, active: event.target.checked })} /><span>Personne active</span></label>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setPersonDraft(emptyPersonDraft)}>Nouveau</button><button type="submit" className="button primary" disabled={saving}>Sauvegarder</button></div>
            </form>
            <div className="people-list">
              {people.length ? people.map((person) => (
                <button className="person-row" key={person.id} onClick={() => openPerson(person)}>
                  <span className="avatar">{ownerInitials(person.name)}</span>
                  <span><strong>{person.name}</strong><small>{person.active ? "Active" : "Inactive"} · {person.hasEmail ? "email enregistre" : "email manquant"}</small></span>
                </button>
              )) : <p className="no-comment people-empty">Aucune personne enregistree.</p>}
            </div>
          </section>
        </div>
      )}

      {selectedTask && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedId(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="drawer-header">
              <div className="drawer-pills">
                <span className={`status-pill status-${selectedTask.status}`}><span className="status-dot"></span>{statusLabels[selectedTask.status]}</span>
                <span className={`priority-pill priority-${selectedTask.priority}`}>{priorityLabels[selectedTask.priority]}</span>
              </div>
              <button className="close-button" onClick={() => setSelectedId(null)} aria-label="Fermer">×</button>
            </div>
            <h2 id="detail-title">{selectedTask.title}</h2>
            <p className="detail-description">{selectedTask.description || "Aucune description ajoutee."}</p>
            <div className="detail-grid">
              <div><small>Responsable</small><span className="owner"><span className="avatar">{ownerInitials(peopleById.get(selectedTask.assigneeId || "")?.name || selectedTask.owner)}</span>{peopleById.get(selectedTask.assigneeId || "")?.name || selectedTask.owner}</span></div>
              <div><small>{selectedTask.endDate ? "Periode" : "Date"}</small><strong>{formatFullDate(selectedTask.startDate)}{selectedTask.endDate && selectedTask.endDate !== selectedTask.startDate ? ` -> ${formatFullDate(selectedTask.endDate)}` : ""}</strong></div>
              <div><small>Duree estimee</small><strong>{formatDuration(selectedTask.estimatedHours)}</strong></div>
            </div>
            <div className={`verification-panel ${selectedTask.verified ? "is-verified" : ""}`}>
              <div>
                <span className="verification-badge">{selectedTask.verified ? "✓ Vérifiée" : "À vérifier"}</span>
                <strong>{selectedTask.verificationOwner || "Aucun responsable de vérification"}</strong>
              </div>
              <p>{selectedTask.verificationComment || "Aucun commentaire de vérification."}</p>
            </div>
            <div className="quick-status">
              <span>Avancement</span>
              <div>{(["todo", "progress", "done"] as Status[]).map((status) => <button key={status} onClick={() => changeStatus(selectedTask.id, status)} className={selectedTask.status === status ? "active" : ""} disabled={saving}>{statusLabels[status]}</button>)}</div>
            </div>
            {selectedTask.status === "done" && (
              <div className="completion-box-panel">
                <button className="button primary" onClick={() => openCompletionNotice(selectedTask)}>Choisir qui notifier</button>
                <p>
                  {selectedTask.completionNotifications.length
                    ? `${selectedTask.completionNotifications.length} notification(s) deja envoyee(s).`
                    : "Aucune notification de fin envoyee."}
                </p>
              </div>
            )}
            <div className="comments-section">
              <h3>Commentaires <span>{selectedTask.comments.length}</span></h3>
              <form onSubmit={addComment} className="comment-form">
                <label className="author-field"><span>Votre nom</span><input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Ex. Sophie" /></label>
                <textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ou en est cette tache ? Ajoutez une note..." aria-label="Nouveau commentaire" />
                <button className="button primary" disabled={!comment.trim() || !authorName.trim() || saving} type="submit">Ajouter la note</button>
              </form>
              <div className="comment-list">
                {selectedTask.comments.length ? selectedTask.comments.map((item) => <article className="comment" key={item.id}><span className="comment-mark">●</span><div><p>{item.text}</p><small>{item.author} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</small></div></article>) : <p className="no-comment">Aucun commentaire pour le moment.</p>}
              </div>
            </div>
            <div className="drawer-actions"><button className="button quiet" onClick={() => openEditTask(selectedTask)}>Modifier</button><button className="button danger" onClick={() => deleteTask(selectedTask.id)} disabled={saving}>Supprimer</button></div>
          </aside>
        </div>
      )}

      {notifyOpen && notifyTask && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setNotifyOpen(false)}>
          <section className="modal notify-modal" role="dialog" aria-modal="true" aria-labelledby="notify-title">
            <div className="modal-header">
              <div><p className="eyebrow">Tache terminee</p><h2 id="notify-title">Choisir les destinataires</h2></div>
              <button className="close-button" onClick={() => setNotifyOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={sendCompletionNotice} className="notify-form">
              <p className="detail-description">Selectionnez les personnes qui doivent recevoir un email indiquant clairement que la tache “{notifyTask.title}” est terminee.</p>
              <div className="recipient-list">
                {notifiablePeople.length ? notifiablePeople.map((person) => {
                  const alreadyNotified = notifyTask.completionNotifications.some((item) => item.personId === person.id);
                  return (
                    <label className={`recipient-row ${!person.hasEmail ? "disabled" : ""}`} key={person.id}>
                      <input
                        type="checkbox"
                        disabled={!person.hasEmail}
                        checked={notifyRecipients.includes(person.id)}
                        onChange={(event) => {
                          setNotifyRecipients((current) =>
                            event.target.checked
                              ? [...current, person.id]
                              : current.filter((id) => id !== person.id),
                          );
                        }}
                      />
                      <span className="avatar">{ownerInitials(person.name)}</span>
                      <span><strong>{person.name}</strong><small>{person.hasEmail ? "email enregistre" : "email manquant"}{alreadyNotified ? " · deja notifie" : ""}</small></span>
                    </label>
                  );
                }) : <p className="no-comment">Ajoutez d&apos;abord des personnes.</p>}
              </div>
              <div className="form-actions"><button type="button" className="button quiet" onClick={() => setNotifyOpen(false)}>Annuler</button><button type="submit" className="button primary" disabled={!notifyRecipients.length || notifying}>{notifying ? "Envoi..." : "Envoyer"}</button></div>
            </form>
          </section>
        </div>
      )}

      {selectedTutorReport && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedTutorReportKey(null)}>
          <section className="modal notify-modal tutor-detail-modal" role="dialog" aria-modal="true" aria-labelledby="tutor-detail-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Historique bilans tuteur</p>
                <h2 id="tutor-detail-title">{tutorDisplayName(selectedTutorReport)}</h2>
              </div>
              <button className="close-button" onClick={() => setSelectedTutorReportKey(null)} aria-label="Fermer">×</button>
            </div>
            <div className="tutor-detail-body">
              <div className="tutor-detail-metrics">
                <div><span>Bilans non faits</span><strong>{selectedTutorReport.totalMissing}</strong></div>
                <div><span>Dates concernées</span><strong>{selectedTutorReport.dateCount}</strong></div>
                <div><span>Élèves cumulés</span><strong>{selectedTutorReport.totalStudents}</strong></div>
              </div>
              <div className="tutor-detail-info">
                <span>ID : <strong>{selectedTutorReport.tutorId || "—"}</strong></span>
                <span>Téléphone : <strong>{selectedTutorReport.phone || "—"}</strong></span>
                <span>Établissements : <strong>{selectedTutorReport.schools.join(", ") || "—"}</strong></span>
              </div>
              <div className="tutor-detail-global-comment">
                <strong>Commentaire général</strong>
                <p>{tutorReportCommentByKey.get(selectedTutorReport.key) || "Aucun commentaire général pour ce tuteur."}</p>
              </div>
              <div className="tutor-detail-timeline">
                {selectedTutorReport.dates.map((item, index) => (
                  <article key={`${selectedTutorReport.key}-${item.date}-${item.school}-${index}`}>
                    <div>
                      <strong>{formatFullDate(item.date)}</strong>
                      <span>{item.school || "Établissement non renseigné"}</span>
                    </div>
                    <em>{item.missingReportCount} bilan{item.missingReportCount > 1 ? "s" : ""}</em>
                    <small>{item.studentCount} élève{item.studentCount > 1 ? "s" : ""}</small>
                    {item.comment && <p>{item.comment}</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "todo" | "progress" | "done";
type Priority = "low" | "medium" | "high";
type Density = "compact" | "comfortable";
type AppMode = "tasks" | "recurring" | "links" | "objectives" | "history" | "journal" | "schools" | "communications" | "staffing";
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
  createdAt: string;
  updatedAt: string;
};

type SchoolEventKind = "event" | "comment" | "action";
type SchoolType = "alpha" | "mise-a-dispo" | "mixed";
type SchoolFilter = "all" | SchoolType | "with-posts" | "without-posts";

type SchoolEvent = {
  id: string;
  kind: SchoolEventKind;
  title: string;
  note: string;
  author: string;
  tags: string[];
  date: string;
  createdAt: string;
};

type School = {
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
type JournalDraft = Omit<JournalPost, "id" | "createdAt" | "updatedAt">;
type CommunicationDraft = Omit<MassCommunication, "id" | "createdAt" | "updatedAt">;
type SchoolDraft = Omit<School, "id" | "events" | "createdAt" | "updatedAt">;
type SchoolEventDraft = Omit<SchoolEvent, "id" | "createdAt">;

type CrmFeedItem = {
  school: School;
  event: SchoolEvent;
};

const AUTHOR_KEY = "petit-suivi-auteur-v2";
const DENSITY_KEY = "petit-suivi-densite-v2";

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

const emptySchoolDraft: SchoolDraft = {
  externalId: "",
  name: "",
  category: "",
  schoolType: "alpha",
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

function normalizeStaffingDay(raw: Partial<StaffingDay>): StaffingDay {
  const now = new Date().toISOString();
  const date = raw.date || now.slice(0, 10);
  return {
    id: raw.id || `staffing-${date}`,
    date,
    people: {
      pierre: normalizeStaffingPerson(raw.people?.pierre),
      julie: normalizeStaffingPerson(raw.people?.julie),
      kelly: normalizeStaffingPerson(raw.people?.kelly),
    },
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || raw.createdAt || now,
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
  const [appMode, setAppMode] = useState<AppMode>("tasks");
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
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolEventOpen, setSchoolEventOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [eventSchoolId, setEventSchoolId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [recurringDraft, setRecurringDraft] = useState<RecurringDraft>(emptyRecurringDraft);
  const [objectiveDraft, setObjectiveDraft] = useState<ObjectiveDraft>(emptyObjectiveDraft);
  const [linkDraft, setLinkDraft] = useState<LinkDraft>(emptyLinkDraft);
  const [journalDraft, setJournalDraft] = useState<JournalDraft>(emptyJournalDraft);
  const [communicationDraft, setCommunicationDraft] = useState<CommunicationDraft>(emptyCommunicationDraft);
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
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<SchoolFilter>("all");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

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
    const timer = window.setTimeout(() => {
      void loadTasks();
      void loadPeople();
      void loadRecurringTasks();
      void loadObjectives();
      void loadLinks();
      void loadJournalPosts();
      void loadCommunications();
      void loadStaffingDays();
      void loadSchools();
      void loadStudentHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTasks, loadPeople, loadRecurringTasks, loadObjectives, loadLinks, loadJournalPosts, loadCommunications, loadStaffingDays, loadSchools, loadStudentHistory]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadTasks(true);
      void loadPeople();
      void loadRecurringTasks();
      void loadObjectives();
      void loadLinks();
      void loadJournalPosts();
      void loadCommunications();
      void loadStaffingDays();
      void loadSchools();
      void loadStudentHistory();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loadTasks, loadPeople, loadRecurringTasks, loadObjectives, loadLinks, loadJournalPosts, loadCommunications, loadStaffingDays, loadSchools, loadStudentHistory]);

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
  const latestJournalPost = journalPosts[0] ?? null;
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
        const dayTotals = staffingPeople.reduce(
          (totals, person) => {
            totals.staffed += day.people[person.key].staffedSessions;
            totals.unstaffed += day.people[person.key].unstaffedSessions;
            return totals;
          },
          { staffed: 0, unstaffed: 0 },
        );
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
        [{ ...cleanDraft, id: uid("journal"), createdAt: now }, ...journalPosts],
        "Post ajoute au journal",
      );
    }
    setJournalOpen(false);
  }

  async function deleteJournalPost(postId: string) {
    if (!window.confirm("Supprimer ce post du journal ?")) return;
    await saveJournalPosts(journalPosts.filter((post) => post.id !== postId), "Post supprime");
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
      staffingDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              people: {
                ...day.people,
                [personKey]: {
                  ...day.people[personKey],
                  [field]: count,
                },
              },
              updatedAt: now,
            }
          : day,
      ),
      "Staffing mis à jour",
    );
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
    const now = new Date().toISOString();
    const cleanDraft = {
      ...schoolDraft,
      externalId: schoolDraft.externalId.trim(),
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
          <p>{objective.description}</p>
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
        <div className="objective-people">
          <span>Équipe mobilisée</span>
          <div>
            {objective.personIds.length
              ? objective.personIds.map((personId) => {
                  const person = peopleById.get(personId);
                  if (!person) return null;
                  return <span className="objective-person" key={person.id}><span className="avatar">{ownerInitials(person.name)}</span>{person.name}</span>;
                })
              : <small>Tague les personnes responsables pour rendre l&apos;engagement visible.</small>}
          </div>
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
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">α</div>
          <div>
            <span>Alpha Education</span>
            <small>Todo des équipes</small>
          </div>
        </div>
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
        {appMode !== "history" && <section className="alpha-hero" aria-label="Objectif Alpha Education">
          <div className="alpha-quote">
            <div className="mission-badge">Alpha Education · rentrée 2026</div>
            <p className="eyebrow">Todo des équipes</p>
            <blockquote>C&apos;est la rentrée : avec l&apos;Étude Alpha, donnez à votre enfant toutes les chances de bien démarrer l&apos;année.</blockquote>
            <span>Chaque tâche clarifiée, chaque relance faite, chaque priorité assumée rapproche l&apos;équipe des objectifs.</span>
            <div className="hero-rally">
              <span>Cap clair</span>
              <span>Équipe alignée</span>
              <span>Exécution quotidienne</span>
            </div>
          </div>
          <div className="objective-stack">
            {renderCounterObjective(studentObjective, "Objectif élèves")}
            {renderCounterObjective(sessionObjective, "Objectif hebdo")}
          </div>
        </section>}

        {appMode !== "history" && (
          <section className="journal-highlight" aria-label="Journal de l'Etude Alpha">
            <div className="journal-highlight-mark" aria-hidden="true">✦</div>
            <div className="journal-highlight-content">
              <p className="eyebrow">Journal de l’Étude Alpha</p>
              {latestJournalPost ? (
                <>
                  <h2>{latestJournalPost.title}</h2>
                  <p>{excerpt(latestJournalPost.content, 210)}</p>
                  <div className="journal-meta">
                    <span>{latestJournalPost.author}</span>
                    <span>{formatJournalDate(latestJournalPost.publishedAt)}</span>
                    {latestJournalPost.tags.slice(0, 3).map((tag) => <span className="journal-tag" key={tag}>#{tag}</span>)}
                  </div>
                </>
              ) : (
                <>
                  <h2>Écrire la première trace de la rentrée</h2>
                  <p>Gardez les décisions, les apprentissages et les petites victoires de l’équipe au même endroit.</p>
                  <div className="journal-meta">
                    <span>Carnet de bord partagé</span>
                    <span>Lisible plus tard</span>
                  </div>
                </>
              )}
            </div>
            <div className="journal-highlight-actions">
              <button className="button primary" onClick={() => setAppMode("journal")}>
                Lire le journal
              </button>
              {!latestJournalPost && (
                <button className="button quiet" onClick={openNewJournalPost}>
                  Créer le premier post
                </button>
              )}
            </div>
          </section>
        )}

        <div className="main-tabs" role="group" aria-label="Choisir le type de suivi">
          <button className={appMode === "tasks" ? "active" : ""} onClick={() => setAppMode("tasks")}>
            Taches
          </button>
          <button className={appMode === "recurring" ? "active" : ""} onClick={() => setAppMode("recurring")}>
            Recurrences <span>{recurringTasks.length}</span>
          </button>
          <button className={appMode === "links" ? "active" : ""} onClick={() => setAppMode("links")}>
            Liens <span>{links.length}</span>
          </button>
          <button className={appMode === "journal" ? "active" : ""} onClick={() => setAppMode("journal")}>
            Journal <span>{journalPosts.length}</span>
          </button>
          <button className={appMode === "communications" ? "active" : ""} onClick={() => setAppMode("communications")}>
            Communications <span>{communications.length}</span>
          </button>
          <button className={appMode === "staffing" ? "active" : ""} onClick={() => setAppMode("staffing")}>
            Staffing <span>{staffingDays.length}</span>
          </button>
          <button className={appMode === "schools" ? "active" : ""} onClick={() => setAppMode("schools")}>
            Établissements <span>{schools.length}</span>
          </button>
          <button className={appMode === "objectives" ? "active" : ""} onClick={() => setAppMode("objectives")}>
            Objectifs <span>{qualitativeObjectives.length}</span>
          </button>
          <button className={appMode === "history" ? "active" : ""} onClick={() => setAppMode("history")}>
            Historique <span>{studentHistory.length}</span>
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

        {appMode === "tasks" ? <section className="task-panel">
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
              const dayStaffedTotal = staffingPeople.reduce((total, person) => total + day.people[person.key].staffedSessions, 0);
              const dayUnstaffedTotal = staffingPeople.reduce((total, person) => total + day.people[person.key].unstaffedSessions, 0);
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
                  <div className="staffing-total good">{dayStaffedTotal}</div>
                  <div className={`staffing-total ${dayUnstaffedTotal > 0 ? "alert" : ""}`}>{dayUnstaffedTotal}</div>
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
                      <button onClick={() => setSelectedSchoolId(school.id)}>{school.name}</button>
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
                    <h3>{selectedSchool.name}</h3>
                  </div>
                  <button className="close-button" onClick={() => setSelectedSchoolId(null)} aria-label="Fermer la fiche établissement">×</button>
                </div>
                <div className="school-meta">
                  <span className={`school-type-pill school-type-${selectedSchool.schoolType}`}>{schoolTypeLabels[selectedSchool.schoolType]}</span>
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

      {schoolOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSchoolOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="school-title">
            <div className="modal-header">
              <div><p className="eyebrow">Mini-CRM établissements</p><h2 id="school-title">{editingSchoolId ? "Modifier l&apos;établissement" : "Nouvel établissement"}</h2></div>
              <button className="close-button" onClick={() => setSchoolOpen(false)} aria-label="Fermer">×</button>
            </div>
            <form onSubmit={saveSchool} className="task-form">
              <label className="field full"><span>Nom de l&apos;établissement *</span><input autoFocus required value={schoolDraft.name} onChange={(event) => setSchoolDraft({ ...schoolDraft, name: event.target.value })} placeholder="Ex. Collège Saint-Exupéry" /></label>
              <label className="field"><span>Type d&apos;établissement</span><select value={schoolDraft.schoolType} onChange={(event) => setSchoolDraft({ ...schoolDraft, schoolType: event.target.value as SchoolType })}><option value="alpha">Étude Alpha</option><option value="mise-a-dispo">Mise à disposition</option><option value="mixed">Mixte / autre</option></select></label>
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

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

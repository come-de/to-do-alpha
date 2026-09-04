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
  createdAt: string;
  updatedAt: string;
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

  return {
    id: cleanText(raw.id) || `staffing-${date}`,
    date,
    people: {
      pierre: sanitizeStaffingPerson(people.pierre),
      julie: sanitizeStaffingPerson(people.julie),
      kelly: sanitizeStaffingPerson(people.kelly),
    },
    createdAt: cleanText(raw.createdAt) || now,
    updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
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

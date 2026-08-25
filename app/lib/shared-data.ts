import { getStore } from "@netlify/blobs";

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

const memory = globalThis as typeof globalThis & {
  __petitSuiviTasks?: Task[];
  __petitSuiviPeople?: Person[];
  __petitSuiviRecurringTasks?: RecurringTask[];
  __petitSuiviObjectives?: Objective[];
  __petitSuiviLinks?: SharedLink[];
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

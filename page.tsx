"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "todo" | "progress" | "done";
type Priority = "low" | "medium" | "high";
type Density = "compact" | "comfortable";
type AppMode = "tasks" | "recurring" | "links" | "objectives";
type ViewMode = "list" | "matrix";
type DurationBucket = "short" | "medium" | "long" | "unset";
type ObjectiveKind = "counter" | "qualitative";
type ObjectiveStatus = "todo" | "progress" | "done";

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

function dateValue(date: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  return new Date(`${date}T12:00:00`).getTime();
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
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [recurringDraft, setRecurringDraft] = useState<RecurringDraft>(emptyRecurringDraft);
  const [objectiveDraft, setObjectiveDraft] = useState<ObjectiveDraft>(emptyObjectiveDraft);
  const [linkDraft, setLinkDraft] = useState<LinkDraft>(emptyLinkDraft);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [sendAssignmentEmail, setSendAssignmentEmail] = useState(true);
  const [personDraft, setPersonDraft] = useState<PersonDraft>(emptyPersonDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notifyTaskId, setNotifyTaskId] = useState<string | null>(null);
  const [notifyRecipients, setNotifyRecipients] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
      void loadPeople();
      void loadRecurringTasks();
      void loadObjectives();
      void loadLinks();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTasks, loadPeople, loadRecurringTasks, loadObjectives, loadLinks]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadTasks(true);
      void loadPeople();
      void loadRecurringTasks();
      void loadObjectives();
      void loadLinks();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loadTasks, loadPeople, loadRecurringTasks, loadObjectives, loadLinks]);

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

  function renderCounterObjective(objective: Objective, label: string) {
    const percent = objectiveProgressPercent(objective);
    const nextStep = objectiveNextStep(objective);
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
                  : appMode === "objectives"
                    ? openNewQualitativeObjective
                    : openNewTask
            }
            disabled={saving}
          >
            <span aria-hidden="true">＋</span>{" "}
            {appMode === "recurring"
              ? "Nouveau modele"
              : appMode === "links"
                ? "Nouveau lien"
                : appMode === "objectives"
                  ? "Nouvel objectif"
                  : "Nouvelle tache"}
          </button>
        </div>
      </header>

      <section className="content">
        <section className="alpha-hero" aria-label="Objectif Alpha Education">
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
        </section>

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
          <button className={appMode === "objectives" ? "active" : ""} onClick={() => setAppMode("objectives")}>
            Objectifs <span>{qualitativeObjectives.length}</span>
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

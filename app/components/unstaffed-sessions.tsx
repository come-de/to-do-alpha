"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import SchoolAdminLink from "@/app/components/school-admin-link";
import PersonAdminLink from "@/app/components/person-admin-link";

type UpcomingSession = {
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

type SessionImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  sourceSessionCount: number;
  schools?: UpcomingSessionSchool[];
  rows: UpcomingSession[];
};

type UpcomingSessionSchool = {
  schoolId: string;
  name: string;
  categories: string[];
};

type TutorInterest = {
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
  sessionId: string;
  date: string;
  validated: boolean;
};

type Availability = {
  tutorId: string;
  firstName: string;
  lastName: string;
  phone: string;
  sessionId: string;
  date: string;
};

type Assignment = {
  tutorId: string;
  firstName: string;
  lastName: string;
  school: string;
  date: string;
  timeSlot: string;
  absent: boolean;
};

type SourceImport<Row> = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  rows: Row[];
};

type SessionCandidate = {
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
  sources: Array<"interest" | "availability">;
  validatedInterest: boolean;
  assignments: Assignment[];
  hasConflict: boolean;
  personStatus: "tutor" | "candidate" | "unknown";
};

type EnrichedSession = UpcomingSession & { candidates: SessionCandidate[] };
type SessionCategoryKey = "alpha" | "surveillance" | "service";
type UnstaffedExclusions = { sessionIds: string[]; sourceKeys: string[]; updatedAt: string };
type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";
type SchoolAssignment = { externalId: string; name: string; portfolioOwner: SchoolPortfolioOwner };
type SchoolOwnerFilter = "all" | "unassigned" | Exclude<SchoolPortfolioOwner, "">;

const schoolOwnerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };

const categoryLabels: Record<SessionCategoryKey, string> = {
  alpha: "Étude Alpha",
  surveillance: "Surveillance",
  service: "Prestation de service",
};

function sessionCategoryKey(value: string): SessionCategoryKey {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  if (normalized.includes("alpha")) return "alpha";
  if (normalized.includes("surveillance")) return "surveillance";
  return "service";
}

function sourceExclusionKey(sessionId: string, personId: string, source: "interest" | "availability") {
  return `${sessionId}:${personId.trim()}:${source}`;
}

function normalizedSchoolName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

type TutorTrackingSnapshot = {
  id: string;
  date: string;
  records: Array<{ tutorId: string }>;
};

function formatDate(value: string, long = false) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "2-digit", month: "2-digit" }).format(date);
}

function formatImportDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function timeRange(value: string, fallbackEnd = "") {
  const parts = `${value} ${fallbackEnd}`.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g) ?? [];
  const toMinutes = (part: string) => {
    const [hours, minutes] = part.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return parts.length >= 2 ? [toMinutes(parts[0]!), toMinutes(parts[1]!)] as const : null;
}

function rangesOverlap(session: UpcomingSession, assignment: Assignment) {
  const sessionRange = timeRange(session.startTime, session.endTime);
  const assignmentRange = timeRange(assignment.timeSlot);
  return Boolean(sessionRange && assignmentRange && sessionRange[0] < assignmentRange[1] && assignmentRange[0] < sessionRange[1]);
}

export default function UnstaffedSessions() {
  const [imports, setImports] = useState<SessionImport[]>([]);
  const [interestImports, setInterestImports] = useState<Array<SourceImport<TutorInterest>>>([]);
  const [availabilityImports, setAvailabilityImports] = useState<Array<SourceImport<Availability>>>([]);
  const [assignmentImports, setAssignmentImports] = useState<Array<SourceImport<Assignment>>>([]);
  const [latestTutorSnapshot, setLatestTutorSnapshot] = useState<TutorTrackingSnapshot | null>(null);
  const [selectedImportId, setSelectedImportId] = useState("");
  const [interestImportId, setInterestImportId] = useState("");
  const [availabilityImportId, setAvailabilityImportId] = useState("");
  const [assignmentImportId, setAssignmentImportId] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<SessionCategoryKey[]>(["alpha", "surveillance", "service"]);
  const [shownSingleStudentAlphaDates, setShownSingleStudentAlphaDates] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<UnstaffedExclusions>({ sessionIds: [], sourceKeys: [], updatedAt: "" });
  const [schoolAssignments, setSchoolAssignments] = useState<SchoolAssignment[]>([]);
  const [deselectedNewSchoolIds, setDeselectedNewSchoolIds] = useState<string[]>([]);
  const [schoolOwnerFilter, setSchoolOwnerFilter] = useState<SchoolOwnerFilter>("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (silent = false) => {
    try {
      const endpoints = ["/api/upcoming-session-imports", "/api/tutor-interest-imports", "/api/availability-imports", "/api/tutor-assignment-imports", "/api/tutor-tracking", "/api/unstaffed-exclusions", "/api/schools"];
      const responses = await Promise.all(endpoints.map((endpoint) => fetch(endpoint, { cache: "no-store" })));
      const payloads = await Promise.all(responses.map((response) => response.json())) as Array<{ imports?: unknown[]; tracking?: { snapshots?: TutorTrackingSnapshot[] }; exclusions?: UnstaffedExclusions; schools?: SchoolAssignment[]; error?: string; detail?: string }>;
      const failedIndex = responses.findIndex((response) => !response.ok);
      if (failedIndex >= 0) throw new Error(payloads[failedIndex].detail || payloads[failedIndex].error || "Chargement impossible");
      const next = (payloads[0].imports ?? []) as SessionImport[];
      const nextInterests = (payloads[1].imports ?? []) as Array<SourceImport<TutorInterest>>;
      const nextAvailability = (payloads[2].imports ?? []) as Array<SourceImport<Availability>>;
      const nextAssignments = (payloads[3].imports ?? []) as Array<SourceImport<Assignment>>;
      const nextTutorSnapshots = payloads[4].tracking?.snapshots ?? [];
      const nextExclusions = payloads[5].exclusions ?? { sessionIds: [], sourceKeys: [], updatedAt: "" };
      setImports(next);
      setInterestImports(nextInterests);
      setAvailabilityImports(nextAvailability);
      setAssignmentImports(nextAssignments);
      setLatestTutorSnapshot(nextTutorSnapshots[0] ?? null);
      setExclusions(nextExclusions);
      setSchoolAssignments(payloads[6].schools ?? []);
      setSelectedImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
      setInterestImportId((current) => nextInterests.some((item) => item.id === current) ? current : nextInterests[0]?.id || "");
      setAvailabilityImportId((current) => nextAvailability.some((item) => item.id === current) ? current : nextAvailability[0]?.id || "");
      setAssignmentImportId((current) => nextAssignments.some((item) => item.id === current) ? current : nextAssignments[0]?.id || "");
      if (!silent) setMessage("Données actualisées");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(true), 0);
    const refresh = window.setInterval(() => void load(true), 30_000);
    return () => { window.clearTimeout(timer); window.clearInterval(refresh); };
  }, [load]);

  const activeImport = imports.find((item) => item.id === selectedImportId) ?? null;
  const activeInterestImport = interestImports.find((item) => item.id === interestImportId) ?? null;
  const activeAvailabilityImport = availabilityImports.find((item) => item.id === availabilityImportId) ?? null;
  const activeAssignmentImport = assignmentImports.find((item) => item.id === assignmentImportId) ?? null;
  const dates = useMemo(() => Array.from(new Set((activeImport?.rows ?? []).map((row) => row.date))).sort(), [activeImport]);
  const schoolOwnerIndexes = useMemo(() => ({
    byId: new Map(schoolAssignments.filter((school) => school.externalId).map((school) => [school.externalId, school.portfolioOwner])),
    byName: new Map(schoolAssignments.map((school) => [normalizedSchoolName(school.name), school.portfolioOwner])),
  }), [schoolAssignments]);
  const ownerForSession = useCallback((row: UpcomingSession): SchoolPortfolioOwner => schoolOwnerIndexes.byId.get(row.schoolId) ?? schoolOwnerIndexes.byName.get(normalizedSchoolName(row.school)) ?? "", [schoolOwnerIndexes]);
  const newSchoolCandidates = useMemo(() => {
    const existingIds = new Set(schoolAssignments.map((school) => school.externalId).filter(Boolean));
    return (activeImport?.schools ?? []).filter((school) => school.schoolId && !existingIds.has(school.schoolId));
  }, [activeImport, schoolAssignments]);
  const schoolsWithoutId = useMemo(() => (activeImport?.schools ?? []).filter((school) => !school.schoolId), [activeImport]);
  const selectedNewSchoolIds = useMemo(() => newSchoolCandidates.map((school) => school.schoolId).filter((schoolId) => !deselectedNewSchoolIds.includes(schoolId)), [deselectedNewSchoolIds, newSchoolCandidates]);
  const filteredRowsBeforeSingleStudentRule = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return (activeImport?.rows ?? []).filter((row) => {
      if (exclusions.sessionIds.includes(row.sessionId)) return false;
      const owner = ownerForSession(row);
      if (schoolOwnerFilter === "unassigned" ? Boolean(owner) : schoolOwnerFilter !== "all" && owner !== schoolOwnerFilter) return false;
      if (selectedDate !== "all" && row.date !== selectedDate) return false;
      if (!selectedCategories.includes(sessionCategoryKey(row.category))) return false;
      if (!needle) return true;
      return [row.school, row.schoolId, row.category, row.group, row.room, row.sessionId, ...row.classes].join(" ").toLocaleLowerCase("fr").includes(needle);
    });
  }, [activeImport, exclusions.sessionIds, ownerForSession, query, schoolOwnerFilter, selectedCategories, selectedDate]);
  const visibleRows = useMemo(() => filteredRowsBeforeSingleStudentRule.filter((row) => {
    const isSingleStudentAlpha = sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1;
    return !isSingleStudentAlpha || shownSingleStudentAlphaDates.includes(row.date);
  }), [filteredRowsBeforeSingleStudentRule, shownSingleStudentAlphaDates]);
  const sourceIndexes = useMemo(() => {
    const interestsBySession = new Map<string, TutorInterest[]>();
    const availabilityBySession = new Map<string, Availability[]>();
    const assignmentsByTutorDate = new Map<string, Assignment[]>();
    const currentTutorIds = new Set((latestTutorSnapshot?.records ?? []).map((record) => record.tutorId.trim()).filter(Boolean));
    activeInterestImport?.rows.forEach((row) => interestsBySession.set(row.sessionId, [...(interestsBySession.get(row.sessionId) ?? []), row]));
    activeAvailabilityImport?.rows.forEach((row) => row.sessionId && availabilityBySession.set(row.sessionId, [...(availabilityBySession.get(row.sessionId) ?? []), row]));
    activeAssignmentImport?.rows.forEach((row) => {
      if (row.absent) return;
      const key = `${row.tutorId}:${row.date}`;
      const existing = assignmentsByTutorDate.get(key) ?? [];
      if (!existing.some((item) => item.school === row.school && item.timeSlot === row.timeSlot)) assignmentsByTutorDate.set(key, [...existing, row]);
    });
    return { interestsBySession, availabilityBySession, assignmentsByTutorDate, currentTutorIds };
  }, [activeAssignmentImport, activeAvailabilityImport, activeInterestImport, latestTutorSnapshot]);
  const enrichedRows = useMemo(() => visibleRows.map((session): EnrichedSession => {
    const candidates = new Map<string, SessionCandidate>();
    const addCandidate = (personId: string, firstName: string, lastName: string, phone: string, source: "interest" | "availability", validatedInterest = false) => {
      if (exclusions.sourceKeys.includes(sourceExclusionKey(session.sessionId, personId, source))) return;
      const existing = candidates.get(personId);
      const assignments = sourceIndexes.assignmentsByTutorDate.get(`${personId}:${session.date}`) ?? [];
      candidates.set(personId, {
        personId,
        firstName: firstName || existing?.firstName || "",
        lastName: lastName || existing?.lastName || "",
        phone: phone || existing?.phone || "",
        sources: Array.from(new Set([...(existing?.sources ?? []), source])),
        validatedInterest: validatedInterest || existing?.validatedInterest || false,
        assignments,
        hasConflict: assignments.some((assignment) => rangesOverlap(session, assignment)),
        personStatus: !latestTutorSnapshot || !personId.trim() ? "unknown" : sourceIndexes.currentTutorIds.has(personId.trim()) ? "tutor" : "candidate",
      });
    };
    (sourceIndexes.interestsBySession.get(session.sessionId) ?? []).forEach((row) => addCandidate(row.personId, row.firstName, row.lastName, row.phone, "interest", row.validated));
    (sourceIndexes.availabilityBySession.get(session.sessionId) ?? []).forEach((row) => addCandidate(row.tutorId, row.firstName, row.lastName, row.phone, "availability"));
    return { ...session, candidates: Array.from(candidates.values()).sort((a, b) => Number(a.hasConflict) - Number(b.hasConflict) || `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "fr")) };
  }), [exclusions.sourceKeys, latestTutorSnapshot, sourceIndexes, visibleRows]);
  const groupedRows = useMemo(() => {
    const groups = new Map<string, EnrichedSession[]>();
    filteredRowsBeforeSingleStudentRule.forEach((row) => {
      if (!groups.has(row.date)) groups.set(row.date, []);
    });
    enrichedRows.forEach((row) => groups.set(row.date, [...(groups.get(row.date) ?? []), row]));
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [enrichedRows, filteredRowsBeforeSingleStudentRule]);
  const schoolsCount = new Set(visibleRows.map((row) => row.schoolId || row.school)).size;
  const studentsCount = visibleRows.reduce((sum, row) => sum + row.studentCount, 0);
  const sessionsWithCandidates = enrichedRows.filter((row) => row.candidates.length).length;
  const uniqueCandidateCount = new Set(enrichedRows.flatMap((row) => row.candidates.map((candidate) => candidate.personId))).size;

  async function upload(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setMessage("Import et regroupement des séances…");
    try {
      const rawCsv = await file.text();
      const response = await fetch(`/api/upcoming-session-imports?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: rawCsv });
      const data = await response.json() as { import?: SessionImport; schoolDetection?: { newCount: number; existingCount: number; missingIdCount: number }; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      await load(true);
      if (data.import?.id) setSelectedImportId(data.import.id);
      setDeselectedNewSchoolIds([]);
      setSelectedDate("all");
      const detection = data.schoolDetection;
      setMessage(`${data.import?.rows.length ?? 0} séances non affectées sauvegardées${detection ? ` · ${detection.newCount} nouvel${detection.newCount > 1 ? "s" : ""} établissement${detection.newCount > 1 ? "s" : ""} à valider` : ""}. Aucune donnée nominative d’élève n’a été conservée.`);
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function createSelectedSchools() {
    const selected = newSchoolCandidates.filter((school) => selectedNewSchoolIds.includes(school.schoolId));
    if (!selected.length || saving) return;
    setSaving(true);
    setMessage("Création des établissements sélectionnés…");
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schools: selected.map((school) => ({ externalId: school.schoolId, name: school.name, categories: school.categories })) }),
      });
      const data = await response.json() as { schools?: SchoolAssignment[]; created?: SchoolAssignment[]; skippedIds?: string[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Création impossible");
      setSchoolAssignments(data.schools ?? schoolAssignments);
      const createdCount = data.created?.length ?? 0;
      setMessage(`${createdCount} établissement${createdCount > 1 ? "s" : ""} créé${createdCount > 1 ? "s" : ""} dans le CRM, sans attribution${data.skippedIds?.length ? ` · ${data.skippedIds.length} déjà existant${data.skippedIds.length > 1 ? "s" : ""}` : ""}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  async function uploadInterests(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setMessage("Import des intérêts…");
    try {
      const rawCsv = await file.text();
      const response = await fetch(`/api/tutor-interest-imports?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: rawCsv });
      const data = await response.json() as { import?: SourceImport<TutorInterest>; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      await load(true);
      if (data.import?.id) setInterestImportId(data.import.id);
      setMessage(`${data.import?.rows.length ?? 0} déclarations d’intérêt sauvegardées`);
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveExclusions(next: UnstaffedExclusions, successMessage: string) {
    const previous = exclusions;
    const prepared = { ...next, updatedAt: new Date().toISOString() };
    setExclusions(prepared);
    setSaving(true);
    try {
      const response = await fetch("/api/unstaffed-exclusions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exclusions: prepared }),
      });
      const data = await response.json() as { exclusions?: UnstaffedExclusions; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Sauvegarde impossible");
      setExclusions(data.exclusions ?? prepared);
      setMessage(successMessage);
    } catch (error) {
      setExclusions(previous);
      setMessage(error instanceof Error ? error.message : "Exclusion non sauvegardée");
    } finally {
      setSaving(false);
    }
  }

  function hideSession(sessionId: string) {
    if (!sessionId || exclusions.sessionIds.includes(sessionId)) return;
    void saveExclusions({ ...exclusions, sessionIds: [...exclusions.sessionIds, sessionId] }, `Séance #${sessionId} masquée, y compris dans les prochains imports`);
  }

  function hideCandidateSource(sessionId: string, personId: string, source: "interest" | "availability") {
    const key = sourceExclusionKey(sessionId, personId, source);
    if (exclusions.sourceKeys.includes(key)) return;
    void saveExclusions({ ...exclusions, sourceKeys: [...exclusions.sourceKeys, key] }, `${source === "interest" ? "Intérêt" : "Disponibilité"} masqué${source === "interest" ? "" : "e"} durablement`);
  }

  function restoreAllExclusions() {
    if (!window.confirm("Réafficher toutes les séances, disponibilités et tous les intérêts masqués ?")) return;
    void saveExclusions({ sessionIds: [], sourceKeys: [], updatedAt: "" }, "Tous les éléments masqués sont de nouveau visibles");
  }

  function toggleCategory(category: SessionCategoryKey) {
    setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  function toggleSingleStudentAlphaForDate(date: string) {
    setShownSingleStudentAlphaDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date]);
  }

  function visibleCountForDate(date: string) {
    return (activeImport?.rows ?? []).filter((row) => {
      const owner = ownerForSession(row);
      if (row.date !== date || exclusions.sessionIds.includes(row.sessionId) || !selectedCategories.includes(sessionCategoryKey(row.category))) return false;
      if (schoolOwnerFilter === "unassigned" ? Boolean(owner) : schoolOwnerFilter !== "all" && owner !== schoolOwnerFilter) return false;
      const hiddenSingleStudentAlpha = sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1 && !shownSingleStudentAlphaDates.includes(date);
      return !hiddenSingleStudentAlpha;
    }).length;
  }

  function exportCsv() {
    const rows = [["Date", "Début", "Fin", "Établissement", "Catégorie", "Groupe", "Classes", "Nombre d’élèves", "Salle", "ID séance", "Personnes mobilisables", "Statuts", "Référence tuteurs", "Sources", "Autres séances du jour"]];
    enrichedRows.forEach((row) => rows.push([
      row.date, row.startTime, row.endTime, row.school, row.category, row.group, row.classes.join(" | "), String(row.studentCount), row.room, row.sessionId,
      row.candidates.map((candidate) => `${candidate.firstName} ${candidate.lastName}`.trim() || candidate.personId).join(" | "),
      row.candidates.map((candidate) => `${candidate.personId}: ${candidate.personStatus === "tutor" ? "Tuteur" : candidate.personStatus === "candidate" ? "Candidat" : "Statut inconnu"}`).join(" | "),
      latestTutorSnapshot?.date || "Aucune liste de référence",
      row.candidates.map((candidate) => `${candidate.personId}: ${candidate.sources.map((source) => source === "interest" ? "Intérêt" : "Disponibilités").join(" + ")}`).join(" | "),
      row.candidates.flatMap((candidate) => candidate.assignments.map((assignment) => `${candidate.personId}: ${assignment.timeSlot} — ${assignment.school}`)).join(" | "),
    ]));
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seances-non-affectees-${selectedDate === "all" ? "toutes-dates" : selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <section className="task-panel unstaffed-panel">
    <div className="panel-heading">
      <div><p className="eyebrow">Pilotage des deux semaines</p><h2>Séances non affectées</h2><p>Une ligne par séance, sans nom d’élève. Les classes sont regroupées automatiquement.</p></div>
      <div className="filters">
        {exclusions.sessionIds.length + exclusions.sourceKeys.length > 0 ? <button type="button" className="button quiet" onClick={restoreAllExclusions} disabled={saving}>Réafficher les éléments masqués ({exclusions.sessionIds.length + exclusions.sourceKeys.length})</button> : null}
        <button type="button" className="ghost-button" onClick={() => void load()} disabled={saving}>↻ Actualiser</button>
      </div>
    </div>

    <div className="unstaffed-toolbar">
      <label className="import-button">Importer le fichier CSV<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <label><span>Fichier analysé</span><select value={selectedImportId} onChange={(event) => { setSelectedImportId(event.target.value); setSelectedDate("all"); setShownSingleStudentAlphaDates([]); setDeselectedNewSchoolIds([]); }}><option value="">Aucun fichier</option>{imports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <div className="unstaffed-category-filter"><span>Types de séances</span><div>{(Object.keys(categoryLabels) as SessionCategoryKey[]).map((item) => <button type="button" className={selectedCategories.includes(item) ? "active" : ""} onClick={() => toggleCategory(item)} key={item}>{categoryLabels[item]}</button>)}</div></div>
      <div className="unstaffed-owner-filter"><span>Responsable établissement</span><div>{(["unassigned", "kelly", "pierre", "julie", "all"] as const).map((owner) => <button type="button" className={schoolOwnerFilter === owner ? "active" : ""} onClick={() => setSchoolOwnerFilter(owner)} key={owner}>{owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolOwnerLabels[owner]}</button>)}</div></div>
      <label className="unstaffed-search"><span>Recherche</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Établissement, classe, groupe…" /></label>
      <button type="button" className="button quiet" onClick={exportCsv} disabled={!visibleRows.length}>Exporter CSV</button>
    </div>
    {message ? <p className="enrollment-message">{message}</p> : null}

    {activeImport && (newSchoolCandidates.length > 0 || schoolsWithoutId.length > 0) ? <section className="unstaffed-school-review">
      <div className="unstaffed-school-review-head">
        <div><p className="eyebrow">Validation CRM</p><h3>Nouveaux établissements détectés</h3><p>Comparaison uniquement par ID avec le CRM. Rien n’est créé sans votre validation.</p></div>
        {newSchoolCandidates.length ? <div className="unstaffed-school-review-actions">
          <button type="button" className="button quiet" onClick={() => setDeselectedNewSchoolIds([])}>Tout sélectionner</button>
          <button type="button" className="button quiet" onClick={() => setDeselectedNewSchoolIds(newSchoolCandidates.map((school) => school.schoolId))}>Aucun</button>
          <button type="button" className="button primary" disabled={saving || !selectedNewSchoolIds.length} onClick={() => void createSelectedSchools()}>Créer les établissements sélectionnés ({selectedNewSchoolIds.length})</button>
        </div> : null}
      </div>
      {newSchoolCandidates.length ? <div className="unstaffed-school-review-list">{newSchoolCandidates.map((school) => <label key={school.schoolId}>
        <input type="checkbox" checked={selectedNewSchoolIds.includes(school.schoolId)} onChange={(event) => setDeselectedNewSchoolIds((current) => event.target.checked ? current.filter((id) => id !== school.schoolId) : Array.from(new Set([...current, school.schoolId])))} />
        <span><strong>{school.name}</strong><small>ID {school.schoolId} · {school.categories.join(" · ") || "Catégorie non précisée"}</small></span>
      </label>)}</div> : <p className="unstaffed-school-review-empty">Tous les établissements avec un ID sont déjà présents dans le CRM.</p>}
      {schoolsWithoutId.length ? <details className="unstaffed-school-anomalies"><summary>{schoolsWithoutId.length} établissement{schoolsWithoutId.length > 1 ? "s" : ""} sans ID — création impossible</summary><ul>{schoolsWithoutId.map((school, index) => <li key={`${school.name}-${index}`}>{school.name}</li>)}</ul></details> : null}
    </section> : null}

    <div className="candidate-source-bar">
      <div className="candidate-source-title"><strong>Sources des personnes mobilisables</strong><span>L’ID séance relie les intérêts et les disponibilités à chaque séance.</span>{latestTutorSnapshot ? <em>Statuts déterminés avec la liste des tuteurs du {formatDate(latestTutorSnapshot.date)}</em> : <em>Aucune liste de tuteurs : statuts inconnus</em>}</div>
      <label className="import-button">Importer des intérêts<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void uploadInterests(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <label><span>Intérêts</span><select value={interestImportId} onChange={(event) => setInterestImportId(event.target.value)}><option value="">Aucun</option>{interestImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <label><span>Disponibilités</span><select value={availabilityImportId} onChange={(event) => setAvailabilityImportId(event.target.value)}><option value="">Aucun</option>{availabilityImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <label><span>Séances déjà affectées</span><select value={assignmentImportId} onChange={(event) => setAssignmentImportId(event.target.value)}><option value="">Aucun</option>{assignmentImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
    </div>

    {activeImport ? <>
      <div className="unstaffed-summary">
        <div className="highlight"><span>Séances non affectées</span><strong>{visibleRows.length}</strong></div>
        <div><span>Jours concernés</span><strong>{new Set(visibleRows.map((row) => row.date)).size}</strong></div>
        <div><span>Établissements</span><strong>{schoolsCount}</strong></div>
        <div><span>Élèves concernés</span><strong>{studentsCount}</strong></div>
        <div className="candidate-kpi"><span>Avec personne mobilisable</span><strong>{sessionsWithCandidates}</strong></div>
        <div><span>Personnes distinctes</span><strong>{uniqueCandidateCount}</strong></div>
        <small>Source : {activeImport.sourceRowCount} lignes · {activeImport.sourceSessionCount} séances distinctes</small>
      </div>
      <div className="unstaffed-date-tabs" role="group" aria-label="Filtrer par jour">
        <button className={selectedDate === "all" ? "active" : ""} onClick={() => setSelectedDate("all")}>Tous <b>{dates.reduce((sum, date) => sum + visibleCountForDate(date), 0)}</b></button>
        {dates.map((date) => <button key={date} className={selectedDate === date ? "active" : ""} onClick={() => setSelectedDate(date)}>{formatDate(date)} <b>{visibleCountForDate(date)}</b></button>)}
      </div>
      <div className="unstaffed-days">
        {groupedRows.length ? groupedRows.map(([date, rows]) => <article className="unstaffed-day" key={date}>
          <header><div><span>{formatDate(date, true)}</span><small>{new Set(rows.map((row) => row.school)).size} établissements</small></div><div className="unstaffed-day-actions"><strong>{rows.length} séance{rows.length > 1 ? "s" : ""}</strong>{(() => { const hiddenCount = filteredRowsBeforeSingleStudentRule.filter((row) => row.date === date && sessionCategoryKey(row.category) === "alpha" && row.studentCount === 1).length; return hiddenCount ? <button type="button" onClick={() => toggleSingleStudentAlphaForDate(date)}>{shownSingleStudentAlphaDates.includes(date) ? "Masquer" : "Afficher"} {hiddenCount} groupe{hiddenCount > 1 ? "s" : ""} Alpha à 1 élève</button> : null; })()}</div></header>
          <div className="unstaffed-table-wrap"><table><thead><tr><th>Horaire</th><th>Établissement</th><th>Type</th><th>Groupe</th><th>Classes</th><th>Élèves</th><th>Salle</th><th aria-label="Actions"></th></tr></thead><tbody>
            {rows.map((row) => <Fragment key={row.sessionId}>
              <tr className={row.candidates.length ? "has-candidates" : ""}><td><strong>{row.startTime || "—"}–{row.endTime || "—"}</strong><small>#{row.sessionId}</small></td><td><SchoolAdminLink schoolId={row.schoolId}>{row.school}</SchoolAdminLink><small className={`school-owner-label ${ownerForSession(row) ? "assigned" : "unassigned"}`}>{schoolOwnerLabels[ownerForSession(row)]}</small></td><td><span className="session-category">{row.category || "—"}</span></td><td>{row.group || "—"}</td><td><div className="class-tags">{row.classes.length ? row.classes.map((item) => <span key={item}>{item}</span>) : <em>Non précisée</em>}</div></td><td>{row.studentCount || "—"}</td><td>{row.room || "—"}</td><td><button type="button" className="unstaffed-hide-button" onClick={() => hideSession(row.sessionId)} disabled={saving} title="Masquer durablement cette séance" aria-label={`Masquer la séance ${row.sessionId}`}>×</button></td></tr>
              {(() => {
                const candidates = row.candidates.filter((candidate) => candidate.personStatus === "candidate");
                const freeTutors = row.candidates.filter((candidate) => candidate.personStatus === "tutor" && !candidate.hasConflict);
                const busyTutors = row.candidates.filter((candidate) => candidate.personStatus === "tutor" && candidate.hasConflict);
                const unknownPeople = row.candidates.filter((candidate) => candidate.personStatus === "unknown");
                const freeTutorNames = freeTutors.map((candidate) => `${candidate.firstName} ${candidate.lastName}`.trim() || `ID ${candidate.personId}`);
                const visibleFreeTutorNames = freeTutorNames.slice(0, 2).join(", ");
                return <tr className={`session-candidates-row ${row.candidates.length ? "has-results" : ""} ${freeTutors.length ? "has-free-tutor" : ""}`}><td colSpan={8}>
                {row.candidates.length ? <details>
                  <summary>
                    <div className="candidate-summary-content">
                      <span className="session-link-label">↳ Pour la séance #{row.sessionId}</span>
                      {freeTutors.length ? <strong className="free-tutor-callout">✓ {freeTutors.length} tuteur{freeTutors.length > 1 ? "s" : ""} sans chevauchement · {visibleFreeTutorNames}{freeTutorNames.length > 2 ? ` +${freeTutorNames.length - 2}` : ""}</strong> : null}
                      <div className="candidate-counts">
                        {candidates.length ? <span className="candidate-count candidate">{candidates.length} candidat{candidates.length > 1 ? "s" : ""}</span> : null}
                        {freeTutors.length ? <span className="candidate-count free">{freeTutors.length} tuteur{freeTutors.length > 1 ? "s" : ""} libre{freeTutors.length > 1 ? "s" : ""}</span> : null}
                        {busyTutors.length ? <span className="candidate-count conflict">{busyTutors.length} tuteur{busyTutors.length > 1 ? "s" : ""} avec chevauchement</span> : null}
                        {unknownPeople.length ? <span className="candidate-count unknown">{unknownPeople.length} statut{unknownPeople.length > 1 ? "s" : ""} inconnu{unknownPeople.length > 1 ? "s" : ""}</span> : null}
                      </div>
                    </div>
                    <small>Voir les coordonnées, sources et autres séances</small>
                  </summary>
                  <div className="session-candidate-list">{row.candidates.map((candidate) => <article className={candidate.hasConflict ? "has-conflict" : ""} key={candidate.personId}>
                    <div className="candidate-name"><div><strong><PersonAdminLink personId={candidate.personId} status={candidate.personStatus}>{`${candidate.firstName} ${candidate.lastName}`.trim() || `Personne ${candidate.personId}`}</PersonAdminLink></strong><span className={`person-status ${candidate.personStatus}`}>{candidate.personStatus === "tutor" ? "Tuteur" : candidate.personStatus === "candidate" ? "Candidat" : "Statut inconnu"}</span></div><small>ID {candidate.personId}{candidate.phone ? ` · ${candidate.phone}` : ""}</small></div>
                    <div className="candidate-sources">{candidate.sources.map((source) => <span className={source} key={source}>{source === "interest" ? "Intérêt déclaré" : "Disponible"}<button type="button" onClick={() => hideCandidateSource(row.sessionId, candidate.personId, source)} disabled={saving} title={`Masquer ${source === "interest" ? "cet intérêt" : "cette disponibilité"}`}>×</button></span>)}{candidate.validatedInterest ? <span className="validated">Intérêt validé</span> : null}</div>
                    <div className="candidate-assignments">{candidate.assignments.length ? <><strong>{candidate.hasConflict ? "Chevauchement à vérifier" : "Autre séance ce jour"}</strong>{candidate.assignments.map((assignment, index) => <span key={`${assignment.timeSlot}-${assignment.school}-${index}`}>{assignment.timeSlot} · {assignment.school}</span>)}</> : <span className="candidate-free">Aucune autre séance affectée ce jour</span>}</div>
                  </article>)}</div>
                </details> : <span className="no-candidates"><strong>↳ Pour la séance #{row.sessionId}</strong> · aucune personne trouvée dans les sources sélectionnées</span>}
              </td></tr>;
              })()}
            </Fragment>)}
            {!rows.length ? <tr><td colSpan={8} className="single-alpha-hidden-note">Les groupes Étude Alpha à un élève sont masqués pour cette date. Utilisez le bouton ci-dessus pour les afficher.</td></tr> : null}
          </tbody></table></div>
        </article>) : <div className="empty-state"><span>✓</span><h3>Aucune séance à afficher</h3><p>Modifiez les filtres ou choisissez un autre fichier.</p></div>}
      </div>
    </> : <div className="empty-state"><span>📋</span><h3>Importez le fichier des semaines à venir</h3><p>Le site identifiera les séances sans tuteur et supprimera les répétitions dues aux élèves.</p></div>}
  </section>;
}

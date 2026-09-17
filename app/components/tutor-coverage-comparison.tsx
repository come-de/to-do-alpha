"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityImport, AvailabilityRow, TutorAssignmentImport, TutorAssignmentRow, TutorCoverageNote, TutorCoverageNoteStatus } from "@/app/lib/shared-data";

type CoverageView = "unassigned" | "extra";
type ToolView = "coverage" | "staffing-comparison";
type TutorCoverage = {
  tutorId: string;
  firstName: string;
  lastName: string;
  grade: string;
  phone: string;
  availability: AvailabilityRow[];
  assignments: TutorAssignmentRow[];
};
type NoteDraft = { status: TutorCoverageNoteStatus; note: string };
type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";
type SchoolOwnerFilter = "all" | "unassigned" | Exclude<SchoolPortfolioOwner, "">;
type SchoolAssignment = { name: string; portfolioOwner: SchoolPortfolioOwner };
type StaffingSession = {
  key: string;
  school: string;
  timeSlot: string;
  category: string;
  tutors: Map<string, TutorAssignmentRow>;
};

const schoolOwnerLabels: Record<SchoolPortfolioOwner, string> = {
  "": "Non attribué",
  kelly: "Kelly",
  pierre: "Pierre",
  julie: "Julie",
};

function normalizedSchoolName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function timestamp(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function importDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function fullDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function parseInterval(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(?:-|=)+>\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { start: Number(match[1]) * 60 + Number(match[2]), end: Number(match[3]) * 60 + Number(match[4]) };
}

function overlaps(left: ReturnType<typeof parseInterval>, right: ReturnType<typeof parseInterval>) {
  return Boolean(left && right && left.start < right.end && left.end > right.start);
}

function uniqueAvailability(rows: AvailabilityRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.timeSlot.trim().toLocaleLowerCase("fr")}|${row.school.trim().toLocaleLowerCase("fr")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueAssignments(rows: TutorAssignmentRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.timeSlot}|${row.school}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizedAssignmentPart(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function staffingSessionKey(row: TutorAssignmentRow) {
  return [row.date, normalizedAssignmentPart(row.school), normalizedAssignmentPart(row.timeSlot), normalizedAssignmentPart(row.category)].join("|");
}

function staffingSessions(rows: TutorAssignmentRow[], date: string) {
  const sessions = new Map<string, StaffingSession>();
  rows.filter((row) => row.date === date && !row.absent).forEach((row) => {
    const key = staffingSessionKey(row);
    const session = sessions.get(key) ?? { key, school: row.school, timeSlot: row.timeSlot, category: row.category, tutors: new Map<string, TutorAssignmentRow>() };
    if (!session.tutors.has(row.tutorId)) session.tutors.set(row.tutorId, row);
    sessions.set(key, session);
  });
  return sessions;
}

function tutorLabel(row: TutorAssignmentRow | undefined, tutorId: string) {
  if (!row) return `ID ${tutorId}`;
  return `${row.firstName} ${row.lastName}`.trim() || `ID ${tutorId}`;
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function TutorCoverageComparison() {
  const [toolView, setToolView] = useState<ToolView>("coverage");
  const [availabilityImports, setAvailabilityImports] = useState<AvailabilityImport[]>([]);
  const [assignmentImports, setAssignmentImports] = useState<TutorAssignmentImport[]>([]);
  const [availabilityId, setAvailabilityId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [compareReferenceId, setCompareReferenceId] = useState("");
  const [compareRecentId, setCompareRecentId] = useState("");
  const [comparisonDate, setComparisonDate] = useState("");
  const [comparisonOwnerFilter, setComparisonOwnerFilter] = useState<SchoolOwnerFilter>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState<CoverageView>("unassigned");
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("all");
  const [schoolAssignments, setSchoolAssignments] = useState<SchoolAssignment[]>([]);
  const [schoolOwnerFilter, setSchoolOwnerFilter] = useState<SchoolOwnerFilter>("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<TutorCoverageNote[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, NoteDraft>>({});

  const load = useCallback(async (silent = false) => {
    try {
      const [availabilityResponse, assignmentResponse, notesResponse, schoolsResponse] = await Promise.all([
        fetch("/api/availability-imports", { cache: "no-store" }),
        fetch("/api/tutor-assignment-imports", { cache: "no-store" }),
        fetch("/api/tutor-coverage-notes", { cache: "no-store" }),
        fetch("/api/schools", { cache: "no-store" }),
      ]);
      const availabilityData = await availabilityResponse.json() as { imports?: AvailabilityImport[]; error?: string; detail?: string };
      const assignmentData = await assignmentResponse.json() as { imports?: TutorAssignmentImport[]; error?: string; detail?: string };
      const notesData = await notesResponse.json() as { notes?: TutorCoverageNote[]; error?: string; detail?: string };
      const schoolsData = await schoolsResponse.json() as { schools?: SchoolAssignment[]; error?: string; detail?: string };
      if (!availabilityResponse.ok) throw new Error(availabilityData.detail || availabilityData.error || "Disponibilités indisponibles");
      if (!assignmentResponse.ok) throw new Error(assignmentData.detail || assignmentData.error || "Séances affectées indisponibles");
      if (!notesResponse.ok) throw new Error(notesData.detail || notesData.error || "Annotations indisponibles");
      if (!schoolsResponse.ok) throw new Error(schoolsData.detail || schoolsData.error || "Attributions des établissements indisponibles");
      const nextAvailability = (availabilityData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      const nextAssignments = (assignmentData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      setAvailabilityImports(nextAvailability);
      setAssignmentImports(nextAssignments);
      setNotes(notesData.notes ?? []);
      setSchoolAssignments(schoolsData.schools ?? []);
      setNoteDrafts((current) => ({
        ...Object.fromEntries((notesData.notes ?? []).map((item) => [`${item.date}:${item.tutorId}`, { status: item.status, note: item.note }])),
        ...current,
      }));
      setAvailabilityId((current) => nextAvailability.some((item) => item.id === current) ? current : nextAvailability[0]?.id || "");
      setAssignmentId((current) => nextAssignments.some((item) => item.id === current) ? current : nextAssignments[0]?.id || "");
      setCompareRecentId((current) => nextAssignments.some((item) => item.id === current) ? current : nextAssignments[0]?.id || "");
      setCompareReferenceId((current) => nextAssignments.some((item) => item.id === current) ? current : nextAssignments[1]?.id || nextAssignments[0]?.id || "");
      if (!silent) setMessage("Fichiers actualisés");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void load(true), 0);
    const refreshTimer = window.setInterval(() => void load(true), 30000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(refreshTimer); };
  }, [load]);

  const availabilityImport = availabilityImports.find((item) => item.id === availabilityId) ?? null;
  const assignmentImport = assignmentImports.find((item) => item.id === assignmentId) ?? null;
  const compareReferenceImport = assignmentImports.find((item) => item.id === compareReferenceId) ?? null;
  const compareRecentImport = assignmentImports.find((item) => item.id === compareRecentId) ?? null;
  const commonDates = useMemo(() => {
    const availabilityDates = new Set((availabilityImport?.rows ?? []).map((row) => row.date));
    return Array.from(new Set((assignmentImport?.rows ?? []).map((row) => row.date).filter((date) => availabilityDates.has(date)))).sort();
  }, [assignmentImport, availabilityImport]);
  const activeDate = commonDates.includes(selectedDate)
    ? selectedDate
    : commonDates.find((date) => date >= new Date().toISOString().slice(0, 10)) || commonDates.at(-1) || "";

  const comparisonDates = useMemo(() => Array.from(new Set([
    ...(compareReferenceImport?.rows ?? []).map((row) => row.date),
    ...(compareRecentImport?.rows ?? []).map((row) => row.date),
  ])).filter(Boolean).sort(), [compareRecentImport, compareReferenceImport]);
  const activeComparisonDate = comparisonDates.includes(comparisonDate)
    ? comparisonDate
    : comparisonDates.find((date) => date >= new Date().toISOString().slice(0, 10)) || comparisonDates.at(-1) || "";

  const staffingComparison = useMemo(() => {
    const referenceSessions = staffingSessions(compareReferenceImport?.rows ?? [], activeComparisonDate);
    const recentSessions = staffingSessions(compareRecentImport?.rows ?? [], activeComparisonDate);
    const added: Array<{ session: StaffingSession; tutor: TutorAssignmentRow }> = [];
    const removed: Array<{ session: StaffingSession; tutor: TutorAssignmentRow }> = [];
    const changed: Array<{ session: StaffingSession; before: TutorAssignmentRow[]; after: TutorAssignmentRow[] }> = [];
    const allKeys = new Set([...referenceSessions.keys(), ...recentSessions.keys()]);
    allKeys.forEach((key) => {
      const reference = referenceSessions.get(key);
      const recent = recentSessions.get(key);
      const referenceTutors = reference?.tutors ?? new Map<string, TutorAssignmentRow>();
      const recentTutors = recent?.tutors ?? new Map<string, TutorAssignmentRow>();
      const addedIds = Array.from(recentTutors.keys()).filter((id) => !referenceTutors.has(id));
      const removedIds = Array.from(referenceTutors.keys()).filter((id) => !recentTutors.has(id));
      const session = recent ?? reference;
      if (!session) return;
      if (reference && recent && addedIds.length && removedIds.length) {
        changed.push({
          session,
          before: removedIds.map((id) => referenceTutors.get(id)!),
          after: addedIds.map((id) => recentTutors.get(id)!),
        });
      } else {
        addedIds.forEach((id) => added.push({ session, tutor: recentTutors.get(id)! }));
        removedIds.forEach((id) => removed.push({ session, tutor: referenceTutors.get(id)! }));
      }
    });
    const bySession = <T extends { session: StaffingSession }>(left: T, right: T) => `${left.session.timeSlot} ${left.session.school}`.localeCompare(`${right.session.timeSlot} ${right.session.school}`, "fr");
    return {
      referenceSessionCount: referenceSessions.size,
      recentSessionCount: recentSessions.size,
      referenceTutorCount: new Set(Array.from(referenceSessions.values()).flatMap((session) => Array.from(session.tutors.keys()))).size,
      recentTutorCount: new Set(Array.from(recentSessions.values()).flatMap((session) => Array.from(session.tutors.keys()))).size,
      added: added.sort(bySession),
      removed: removed.sort(bySession),
      changed: changed.sort(bySession),
    };
  }, [activeComparisonDate, compareRecentImport, compareReferenceImport]);

  const comparison = useMemo(() => {
    const availabilityByTutor = new Map<string, AvailabilityRow[]>();
    const assignmentsByTutor = new Map<string, TutorAssignmentRow[]>();
    (availabilityImport?.rows ?? []).filter((row) => row.date === activeDate).forEach((row) => {
      availabilityByTutor.set(row.tutorId, [...(availabilityByTutor.get(row.tutorId) ?? []), row]);
    });
    (assignmentImport?.rows ?? []).filter((row) => row.date === activeDate).forEach((row) => {
      assignmentsByTutor.set(row.tutorId, [...(assignmentsByTutor.get(row.tutorId) ?? []), row]);
    });
    const buildTutor = (tutorId: string, availability: AvailabilityRow[], assignments: TutorAssignmentRow[]): TutorCoverage => ({
      tutorId,
      firstName: availability[0]?.firstName || assignments[0]?.firstName || "",
      lastName: availability[0]?.lastName || assignments[0]?.lastName || "",
      grade: availability[0]?.grade || assignments[0]?.grade || "",
      phone: availability[0]?.phone || "",
      availability: uniqueAvailability(availability),
      assignments: uniqueAssignments(assignments),
    });
    const unassigned = Array.from(availabilityByTutor.entries())
      .filter(([tutorId]) => !assignmentsByTutor.has(tutorId))
      .map(([tutorId, availability]) => buildTutor(tutorId, availability, []));
    const extra = Array.from(availabilityByTutor.entries()).flatMap(([tutorId, availability]) => {
      const assignments = assignmentsByTutor.get(tutorId);
      if (!assignments?.length) return [];
      const assignmentIntervals = assignments.map((row) => parseInterval(row.timeSlot));
      const nonOverlapping = availability.filter((row) => {
        const interval = parseInterval(row.timeSlot);
        return interval && !assignmentIntervals.some((assigned) => overlaps(interval, assigned));
      });
      return nonOverlapping.length ? [buildTutor(tutorId, nonOverlapping, assignments)] : [];
    });
    const byName = (a: TutorCoverage, b: TutorCoverage) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "fr");
    return {
      availableTutorCount: availabilityByTutor.size,
      assignedTutorCount: assignmentsByTutor.size,
      assignedSessionCount: Array.from(assignmentsByTutor.values()).reduce((sum, rows) => sum + rows.length, 0),
      unassigned: unassigned.sort(byName),
      extra: extra.sort(byName),
    };
  }, [activeDate, assignmentImport, availabilityImport]);

  const schoolOptions = useMemo(() => {
    const labels = new Set<string>();
    [...comparison.unassigned, ...comparison.extra].forEach((tutor) => tutor.availability.forEach((row) => row.school && labels.add(row.school)));
    return Array.from(labels).sort((a, b) => a.localeCompare(b, "fr"));
  }, [comparison]);

  const ownerBySchoolName = useMemo(
    () => new Map<string, SchoolPortfolioOwner>(schoolAssignments.map((item) => [normalizedSchoolName(item.name), item.portfolioOwner || ""])),
    [schoolAssignments],
  );

  const ownerForSchool = useCallback(
    (schoolName: string): SchoolPortfolioOwner => ownerBySchoolName.get(normalizedSchoolName(schoolName)) || "",
    [ownerBySchoolName],
  );

  const staffingComparisonByOwner = useMemo(() => {
    const owners: SchoolPortfolioOwner[] = ["kelly", "pierre", "julie", ""];
    const matchesFilter = (schoolName: string) => {
      const owner = ownerForSchool(schoolName);
      return comparisonOwnerFilter === "all" || (comparisonOwnerFilter === "unassigned" ? !owner : owner === comparisonOwnerFilter);
    };
    const summary = owners.map((owner) => ({
      owner,
      added: staffingComparison.added.filter((item) => ownerForSchool(item.session.school) === owner).length,
      removed: staffingComparison.removed.filter((item) => ownerForSchool(item.session.school) === owner).length,
      changed: staffingComparison.changed.filter((item) => ownerForSchool(item.session.school) === owner).length,
    }));
    return {
      summary,
      added: staffingComparison.added.filter((item) => matchesFilter(item.session.school)),
      removed: staffingComparison.removed.filter((item) => matchesFilter(item.session.school)),
      changed: staffingComparison.changed.filter((item) => matchesFilter(item.session.school)),
    };
  }, [comparisonOwnerFilter, ownerForSchool, staffingComparison]);

  const displayed = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return (view === "unassigned" ? comparison.unassigned : comparison.extra).flatMap((tutor) => {
      const availability = tutor.availability.filter((row) => {
        const owner = ownerForSchool(row.school);
        return schoolOwnerFilter === "all"
          || (schoolOwnerFilter === "unassigned" && !owner)
          || owner === schoolOwnerFilter;
      });
      if (!availability.length) return [];
      const narrowedTutor = { ...tutor, availability };
      const matchesSchool = school === "all" || availability.some((row) => row.school === school);
      const haystack = [tutor.tutorId, tutor.firstName, tutor.lastName, tutor.grade, ...tutor.availability.flatMap((row) => [row.school, row.timeSlot]), ...tutor.assignments.flatMap((row) => [row.school, row.timeSlot])].join(" ").toLocaleLowerCase("fr");
      return matchesSchool && (!normalizedQuery || haystack.includes(normalizedQuery)) ? [narrowedTutor] : [];
    });
  }, [comparison, ownerForSchool, query, school, schoolOwnerFilter, view]);

  async function upload(file: File | undefined, kind: "availability" | "assignments") {
    if (!file) return;
    setSaving(true);
    setMessage("Import en cours…");
    try {
      const rawCsv = await file.text();
      const endpoint = kind === "availability"
        ? "/api/availability-imports"
        : `/api/tutor-assignment-imports?fileName=${encodeURIComponent(file.name)}`;
      const response = await fetch(endpoint, kind === "availability"
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, rawCsv }) }
        : { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: rawCsv });
      const data = await response.json() as { error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      await load(true);
      setMessage(kind === "availability" ? "Fichier de disponibilités sauvegardé" : "Fichier de séances affectées sauvegardé");
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote(tutorId: string) {
    if (!activeDate) return;
    const key = `${activeDate}:${tutorId}`;
    const draft = noteDrafts[key] ?? { status: "to-check" as const, note: "" };
    setSaving(true);
    try {
      const response = await fetch("/api/tutor-coverage-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, date: activeDate, status: draft.status, note: draft.note }),
      });
      const data = await response.json() as { notes?: TutorCoverageNote[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Sauvegarde impossible");
      setNotes(data.notes ?? []);
      setMessage("Suivi du tuteur sauvegardé");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sauvegarde impossible");
    } finally {
      setSaving(false);
    }
  }

  function exportResults() {
    const rows = [["Catégorie", "Date", "ID tuteur", "Prénom", "Nom", "Téléphone", "Grade", "Disponibilités supplémentaires", "Séances affectées", "Statut de suivi", "Commentaire"]];
    displayed.forEach((tutor) => rows.push([
      view === "unassigned" ? "Disponible sans séance" : "Disponible sur un autre horaire",
      activeDate,
      tutor.tutorId,
      tutor.firstName,
      tutor.lastName,
      tutor.phone,
      tutor.grade,
      tutor.availability.map((row) => `${row.timeSlot} — ${row.school}`).join(" | "),
      tutor.assignments.map((row) => `${row.timeSlot} — ${row.school}`).join(" | "),
      notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate)?.status || "",
      notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate)?.note || "",
    ]));
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `couverture-tuteurs-${activeDate || "date"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="task-panel coverage-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Croisement staffing</p><h2>{toolView === "coverage" ? "Disponibilités et séances affectées" : "Comparer deux staffings"}</h2><p>{toolView === "coverage" ? "Repérez les tuteurs mobilisables sans séance et les horaires encore libres." : "Comparez deux exports Prix des tuteurs pour une date précise."}</p></div>
        <button type="button" className="ghost-button" onClick={() => void load()} disabled={saving}>↻ Actualiser</button>
      </div>

      <div className="coverage-tool-tabs" role="tablist" aria-label="Outils de couverture">
        <button type="button" className={toolView === "coverage" ? "active" : ""} onClick={() => setToolView("coverage")}>Disponibilités ↔ staffing</button>
        <button type="button" className={toolView === "staffing-comparison" ? "active" : ""} onClick={() => setToolView("staffing-comparison")}>Comparer deux staffings</button>
      </div>

      <div className="coverage-upload-grid">
        <div><div><strong>Fichier de disponibilités</strong><span>Réutilise les imports de Comparaison dispos.</span></div><label className="import-button">Importer<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0], "availability"); event.currentTarget.value = ""; }} /></label></div>
        <div><div><strong>Séances affectées</strong><span>Export Prix des tuteurs.</span></div><label className="import-button">Importer<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0], "assignments"); event.currentTarget.value = ""; }} /></label></div>
      </div>
      {message ? <p className="enrollment-message">{message}</p> : null}

      {toolView === "staffing-comparison" ? <>
        <div className="staffing-comparison-controls">
          <label>Fichier 1 · référence<select value={compareReferenceId} onChange={(event) => { setCompareReferenceId(event.target.value); setComparisonDate(""); }}><option value="">Sélectionner</option>{assignmentImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
          <span aria-hidden="true">→</span>
          <label>Fichier 2 · plus récent<select value={compareRecentId} onChange={(event) => { setCompareRecentId(event.target.value); setComparisonDate(""); }}><option value="">Sélectionner</option>{assignmentImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
          <label>Date à comparer<select value={activeComparisonDate} onChange={(event) => setComparisonDate(event.target.value)}><option value="">Aucune date disponible</option>{comparisonDates.map((date) => <option value={date} key={date}>{fullDate(date)}</option>)}</select></label>
          <label>Responsable RH<select value={comparisonOwnerFilter} onChange={(event) => setComparisonOwnerFilter(event.target.value as SchoolOwnerFilter)}><option value="all">Tous</option><option value="kelly">Kelly</option><option value="pierre">Pierre</option><option value="julie">Julie</option><option value="unassigned">Non attribués</option></select></label>
        </div>
        <p className="staffing-comparison-note">Une séance est reconnue par sa date, son établissement, son horaire et sa catégorie. Les doublons de groupes sont regroupés.</p>
        <div className="staffing-comparison-summary">
          <div><span>Séances fichier 1</span><strong>{staffingComparison.referenceSessionCount}</strong></div>
          <div><span>Séances fichier 2</span><strong>{staffingComparison.recentSessionCount}</strong></div>
          <div><span>Tuteurs fichier 1</span><strong>{staffingComparison.referenceTutorCount}</strong></div>
          <div><span>Tuteurs fichier 2</span><strong>{staffingComparison.recentTutorCount}</strong></div>
          <div className="added"><span>Tuteurs en plus</span><strong>+{staffingComparison.added.length}</strong></div>
          <div className="removed"><span>Tuteurs en moins</span><strong>−{staffingComparison.removed.length}</strong></div>
          <div className="changed"><span>Séances modifiées</span><strong>{staffingComparison.changed.length}</strong></div>
        </div>
        <div className="staffing-rh-summary" aria-label={`Évolution du staffing par responsable pour ${activeComparisonDate || "la date sélectionnée"}`}>
          <div className="staffing-rh-summary-title"><strong>Évolution par responsable RH</strong><span>{activeComparisonDate ? fullDate(activeComparisonDate) : "Choisissez une date"}</span></div>
          <div className="staffing-rh-summary-head"><span>Responsable</span><span>En plus</span><span>En moins</span><span>Changements</span></div>
          {staffingComparisonByOwner.summary.map((row) => <button type="button" className={(comparisonOwnerFilter === "unassigned" ? !row.owner : comparisonOwnerFilter === row.owner) ? "active" : ""} onClick={() => setComparisonOwnerFilter(row.owner || "unassigned")} key={row.owner || "unassigned"}><strong>{schoolOwnerLabels[row.owner]}</strong><span className="positive">+{row.added}</span><span className="negative">−{row.removed}</span><span className="changed">{row.changed}</span></button>)}
          {comparisonOwnerFilter !== "all" ? <button type="button" className="staffing-rh-show-all" onClick={() => setComparisonOwnerFilter("all")}>Afficher tous les responsables</button> : null}
        </div>
        {!compareReferenceImport || !compareRecentImport ? <div className="empty-state compact">Choisissez deux exports Prix des tuteurs.</div>
          : !activeComparisonDate ? <div className="empty-state compact">Aucune date n’est disponible dans ces fichiers.</div>
          : <div className="staffing-comparison-results">
            <section><h3>Changements de tuteur <span>{staffingComparisonByOwner.changed.length}</span></h3>{staffingComparisonByOwner.changed.length ? staffingComparisonByOwner.changed.map((item) => <article key={item.session.key}><div className="staffing-session"><strong>{item.session.timeSlot}</strong><span>{item.session.school}</span><small>{item.session.category || "Catégorie non précisée"} · RH : {schoolOwnerLabels[ownerForSchool(item.session.school)]}</small></div><div className="staffing-change before"><em>Avant</em>{item.before.map((tutor) => <span key={tutor.tutorId}>{tutorLabel(tutor, tutor.tutorId)} <small>#{tutor.tutorId}{tutor.phone ? ` · ${tutor.phone}` : ""}</small></span>)}</div><div className="staffing-change after"><em>Après</em>{item.after.map((tutor) => <span key={tutor.tutorId}>{tutorLabel(tutor, tutor.tutorId)} <small>#{tutor.tutorId}{tutor.phone ? ` · ${tutor.phone}` : ""}</small></span>)}</div></article>) : <p>Aucun remplacement détecté pour ce responsable.</p>}</section>
            <section><h3>Tuteurs ajoutés <span>{staffingComparisonByOwner.added.length}</span></h3>{staffingComparisonByOwner.added.length ? staffingComparisonByOwner.added.map((item) => <article key={`${item.session.key}-${item.tutor.tutorId}`}><div className="staffing-session"><strong>{item.session.timeSlot}</strong><span>{item.session.school}</span><small>{item.session.category || "Catégorie non précisée"} · RH : {schoolOwnerLabels[ownerForSchool(item.session.school)]}</small></div><div className="staffing-change after"><span>{tutorLabel(item.tutor, item.tutor.tutorId)} <small>#{item.tutor.tutorId}{item.tutor.phone ? ` · ${item.tutor.phone}` : ""}</small></span></div></article>) : <p>Aucun tuteur ajouté pour ce responsable.</p>}</section>
            <section><h3>Tuteurs retirés <span>{staffingComparisonByOwner.removed.length}</span></h3>{staffingComparisonByOwner.removed.length ? staffingComparisonByOwner.removed.map((item) => <article key={`${item.session.key}-${item.tutor.tutorId}`}><div className="staffing-session"><strong>{item.session.timeSlot}</strong><span>{item.session.school}</span><small>{item.session.category || "Catégorie non précisée"} · RH : {schoolOwnerLabels[ownerForSchool(item.session.school)]}</small></div><div className="staffing-change before"><span>{tutorLabel(item.tutor, item.tutor.tutorId)} <small>#{item.tutor.tutorId}{item.tutor.phone ? ` · ${item.tutor.phone}` : ""}</small></span></div></article>) : <p>Aucun tuteur retiré pour ce responsable.</p>}</section>
          </div>}
      </> : <>

      <div className="coverage-controls">
        <label>Disponibilités<select value={availabilityId} onChange={(event) => { setAvailabilityId(event.target.value); setSelectedDate(""); }}><option value="">Sélectionner</option>{availabilityImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
        <label>Séances affectées<select value={assignmentId} onChange={(event) => { setAssignmentId(event.target.value); setSelectedDate(""); }}><option value="">Sélectionner</option>{assignmentImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
        <label>Date à analyser<select value={activeDate} onChange={(event) => setSelectedDate(event.target.value)}><option value="">Aucune date commune</option>{commonDates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
        <label>Responsable<select value={schoolOwnerFilter} onChange={(event) => setSchoolOwnerFilter(event.target.value as SchoolOwnerFilter)}><option value="unassigned">Non attribués</option><option value="kelly">Kelly</option><option value="pierre">Pierre</option><option value="julie">Julie</option><option value="all">Tous</option></select></label>
        <label>Établissement<select value={school} onChange={(event) => setSchool(event.target.value)}><option value="all">Tous</option>{schoolOptions.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label>Recherche<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tuteur, ID, établissement…" /></label>
      </div>

      <div className="coverage-summary">
        <div><span>Tuteurs disponibles</span><strong>{comparison.availableTutorCount}</strong></div>
        <div><span>Tuteurs affectés</span><strong>{comparison.assignedTutorCount}</strong></div>
        <div><span>Séances affectées</span><strong>{comparison.assignedSessionCount}</strong></div>
        <div className="highlight"><span>Disponibles sans séance</span><strong>{comparison.unassigned.length}</strong></div>
        <div className="secondary"><span>Autres horaires libres</span><strong>{comparison.extra.length}</strong></div>
      </div>

      <div className="availability-tabs">
        <button type="button" className={view === "unassigned" ? "active" : ""} onClick={() => setView("unassigned")}>Sans séance ({comparison.unassigned.length})</button>
        <button type="button" className={view === "extra" ? "active" : ""} onClick={() => setView("extra")}>Autres horaires ({comparison.extra.length})</button>
        <button type="button" className="ghost-button" onClick={exportResults} disabled={!displayed.length}>Export CSV</button>
      </div>

      <div className="coverage-results">
        {!availabilityImport || !assignmentImport ? <div className="empty-state compact">Choisissez un fichier de disponibilités et un fichier de séances affectées.</div>
          : !activeDate ? <div className="empty-state compact">Ces deux fichiers n’ont aucune date commune.</div>
          : displayed.length ? displayed.map((tutor) => {
            const noteKey = `${activeDate}:${tutor.tutorId}`;
            const savedNote = notes.find((item) => item.tutorId === tutor.tutorId && item.date === activeDate);
            const noteDraft = noteDrafts[noteKey] ?? { status: savedNote?.status || "to-check", note: savedNote?.note || "" };
            return <article className={`coverage-card ${view} ${savedNote?.status === "unavailable" ? "is-unavailable" : ""}`} key={tutor.tutorId}>
              <div className="coverage-person"><h3>{`${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId}</h3><p>ID {tutor.tutorId}{tutor.phone ? ` · ${tutor.phone}` : ""}{tutor.grade ? ` · ${tutor.grade}` : ""}</p></div>
              {tutor.assignments.length ? <div className="coverage-slots assigned"><strong>Séance(s) affectée(s)</strong>{tutor.assignments.map((row, index) => <span key={`${row.timeSlot}-${row.school}-${index}`}>{row.timeSlot} · {row.school}{row.absent ? " · absent" : ""}</span>)}</div> : <div className="coverage-slots assigned empty"><strong>Aucune séance affectée</strong></div>}
              <div className="coverage-slots available"><strong>{view === "extra" ? "Disponibilité(s) sans chevauchement" : "Disponibilité(s) déclarée(s)"}</strong>{tutor.availability.slice(0, 8).map((row, index) => <span key={`${row.sessionId}-${index}`}>{row.timeSlot} · {row.school} · {schoolOwnerLabels[ownerForSchool(row.school)]}</span>)}{tutor.availability.length > 8 ? <small>+ {tutor.availability.length - 8} autre(s)</small> : null}</div>
              <div className="coverage-note-editor">
                <select value={noteDraft.status} onChange={(event) => setNoteDrafts((current) => ({ ...current, [noteKey]: { ...noteDraft, status: event.target.value as TutorCoverageNoteStatus } }))} aria-label={`Statut de ${tutor.firstName} ${tutor.lastName}`}>
                  <option value="to-check">À vérifier</option><option value="unavailable">N’est plus disponible</option><option value="confirmed">Disponibilité confirmée</option><option value="contacted">Contacté</option>
                </select>
                <input value={noteDraft.note} onChange={(event) => setNoteDrafts((current) => ({ ...current, [noteKey]: { ...noteDraft, note: event.target.value } }))} placeholder="Commentaire pour ce tuteur et cette date…" />
                <button type="button" className="text-button" onClick={() => void saveNote(tutor.tutorId)} disabled={saving}>Enregistrer</button>
              </div>
            </article>;
          }) : <div className="empty-state compact">Aucun tuteur ne correspond aux critères.</div>}
      </div>
      </>}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityImport, AvailabilityRow, TutorAssignmentImport, TutorAssignmentRow, TutorCoverageNote, TutorCoverageNoteStatus } from "@/app/lib/shared-data";

type CoverageView = "unassigned" | "extra";
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

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function TutorCoverageComparison() {
  const [availabilityImports, setAvailabilityImports] = useState<AvailabilityImport[]>([]);
  const [assignmentImports, setAssignmentImports] = useState<TutorAssignmentImport[]>([]);
  const [availabilityId, setAvailabilityId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState<CoverageView>("unassigned");
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<TutorCoverageNote[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, NoteDraft>>({});

  const load = useCallback(async (silent = false) => {
    try {
      const [availabilityResponse, assignmentResponse, notesResponse] = await Promise.all([
        fetch("/api/availability-imports", { cache: "no-store" }),
        fetch("/api/tutor-assignment-imports", { cache: "no-store" }),
        fetch("/api/tutor-coverage-notes", { cache: "no-store" }),
      ]);
      const availabilityData = await availabilityResponse.json() as { imports?: AvailabilityImport[]; error?: string; detail?: string };
      const assignmentData = await assignmentResponse.json() as { imports?: TutorAssignmentImport[]; error?: string; detail?: string };
      const notesData = await notesResponse.json() as { notes?: TutorCoverageNote[]; error?: string; detail?: string };
      if (!availabilityResponse.ok) throw new Error(availabilityData.detail || availabilityData.error || "Disponibilités indisponibles");
      if (!assignmentResponse.ok) throw new Error(assignmentData.detail || assignmentData.error || "Séances affectées indisponibles");
      if (!notesResponse.ok) throw new Error(notesData.detail || notesData.error || "Annotations indisponibles");
      const nextAvailability = (availabilityData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      const nextAssignments = (assignmentData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      setAvailabilityImports(nextAvailability);
      setAssignmentImports(nextAssignments);
      setNotes(notesData.notes ?? []);
      setNoteDrafts((current) => ({
        ...Object.fromEntries((notesData.notes ?? []).map((item) => [`${item.date}:${item.tutorId}`, { status: item.status, note: item.note }])),
        ...current,
      }));
      setAvailabilityId((current) => nextAvailability.some((item) => item.id === current) ? current : nextAvailability[0]?.id || "");
      setAssignmentId((current) => nextAssignments.some((item) => item.id === current) ? current : nextAssignments[0]?.id || "");
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
  const commonDates = useMemo(() => {
    const availabilityDates = new Set((availabilityImport?.rows ?? []).map((row) => row.date));
    return Array.from(new Set((assignmentImport?.rows ?? []).map((row) => row.date).filter((date) => availabilityDates.has(date)))).sort();
  }, [assignmentImport, availabilityImport]);
  const activeDate = commonDates.includes(selectedDate)
    ? selectedDate
    : commonDates.find((date) => date >= new Date().toISOString().slice(0, 10)) || commonDates.at(-1) || "";

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

  const displayed = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return (view === "unassigned" ? comparison.unassigned : comparison.extra).filter((tutor) => {
      const matchesSchool = school === "all" || tutor.availability.some((row) => row.school === school);
      const haystack = [tutor.tutorId, tutor.firstName, tutor.lastName, tutor.grade, ...tutor.availability.flatMap((row) => [row.school, row.timeSlot]), ...tutor.assignments.flatMap((row) => [row.school, row.timeSlot])].join(" ").toLocaleLowerCase("fr");
      return matchesSchool && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [comparison, query, school, view]);

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
        <div><p className="eyebrow">Croisement staffing</p><h2>Disponibilités et séances affectées</h2><p>Repérez les tuteurs mobilisables sans séance et les horaires encore libres.</p></div>
        <button type="button" className="ghost-button" onClick={() => void load()} disabled={saving}>↻ Actualiser</button>
      </div>

      <div className="coverage-upload-grid">
        <div><div><strong>Fichier de disponibilités</strong><span>Réutilise les imports de Comparaison dispos.</span></div><label className="import-button">Importer<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0], "availability"); event.currentTarget.value = ""; }} /></label></div>
        <div><div><strong>Séances affectées</strong><span>Export Prix des tuteurs.</span></div><label className="import-button">Importer<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0], "assignments"); event.currentTarget.value = ""; }} /></label></div>
      </div>
      {message ? <p className="enrollment-message">{message}</p> : null}

      <div className="coverage-controls">
        <label>Disponibilités<select value={availabilityId} onChange={(event) => { setAvailabilityId(event.target.value); setSelectedDate(""); }}><option value="">Sélectionner</option>{availabilityImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
        <label>Séances affectées<select value={assignmentId} onChange={(event) => { setAssignmentId(event.target.value); setSelectedDate(""); }}><option value="">Sélectionner</option>{assignmentImports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {importDate(item.importedAt)}</option>)}</select></label>
        <label>Date à analyser<select value={activeDate} onChange={(event) => setSelectedDate(event.target.value)}><option value="">Aucune date commune</option>{commonDates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
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
              <div className="coverage-slots available"><strong>{view === "extra" ? "Disponibilité(s) sans chevauchement" : "Disponibilité(s) déclarée(s)"}</strong>{tutor.availability.slice(0, 8).map((row, index) => <span key={`${row.sessionId}-${index}`}>{row.timeSlot} · {row.school}</span>)}{tutor.availability.length > 8 ? <small>+ {tutor.availability.length - 8} autre(s)</small> : null}</div>
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
    </section>
  );
}

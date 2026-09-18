"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchoolPortfolioOwner, StaffingAuditDay, StaffingAuditResolution, StaffingAuditSession } from "@/app/lib/shared-data";

const ownerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };
const owners: SchoolPortfolioOwner[] = ["kelly", "pierre", "julie", ""];

function staffingAuditDate(value: string) {
  const isoMatch = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  const frenchMatch = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/);
  const year = Number(isoMatch?.[1] ?? frenchMatch?.[3]);
  const month = Number(isoMatch?.[2] ?? frenchMatch?.[2]);
  const day = Number(isoMatch?.[3] ?? frenchMatch?.[1]);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function formatDate(value: string) {
  const date = staffingAuditDate(value);
  return date ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date) : value || "Date inconnue";
}

function formatShortDate(value: string) {
  const date = staffingAuditDate(value);
  return date ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date) : value || "Date inconnue";
}

function effectiveStatus(session: StaffingAuditSession) {
  return session.resolution || session.detectedStatus;
}

function daySummary(day: StaffingAuditDay) {
  return owners.map((owner) => {
    const sessions = day.sessions.filter((session) => session.portfolioOwner === owner);
    return {
      owner,
      staffed: sessions.filter((session) => effectiveStatus(session) === "staffed").length,
      unstaffed: sessions.filter((session) => effectiveStatus(session) === "unstaffed" && !session.treated).length,
      ambiguous: sessions.filter((session) => effectiveStatus(session) === "ambiguous").length,
      total: sessions.length,
    };
  });
}

export default function StaffingAudit() {
  const [savedDays, setSavedDays] = useState<StaffingAuditDay[]>([]);
  const [draftDays, setDraftDays] = useState<StaffingAuditDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState<"draft" | "history">("history");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (silent = false) => {
    try {
      const response = await fetch("/api/staffing-audits", { cache: "no-store" });
      const data = await response.json() as { days?: StaffingAuditDay[]; invalidDateRowCount?: number; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Chargement impossible");
      const days = data.days ?? [];
      setSavedDays(days);
      if (!silent && !draftDays.length) {
        setView("history");
        setSelectedDate((current) => days.some((day) => day.date === current) ? current : days[0]?.date || "");
      }
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, [draftDays.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const activeDay = (view === "draft" ? draftDays : savedDays).find((day) => day.date === selectedDate) ?? null;
  const summary = useMemo(() => activeDay ? daySummary(activeDay) : [], [activeDay]);
  const activeSessions = useMemo(() => (activeDay?.sessions ?? []).filter((session) => {
    const status = effectiveStatus(session);
    return !session.treated && (status === "unstaffed" || status === "ambiguous");
  }), [activeDay]);
  const treatedSessions = useMemo(() => (activeDay?.sessions ?? []).filter((session) => session.treated), [activeDay]);

  async function importFile(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setMessage("Analyse du fichier…");
    try {
      const response = await fetch(`/api/staffing-audits?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: await file.text() });
      const data = await response.json() as { days?: StaffingAuditDay[]; invalidDateRowCount?: number; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Analyse impossible");
      const days = data.days ?? [];
      setDraftDays(days);
      setView("draft");
      setSelectedDate(days[0]?.date || "");
      const ignoredDateMessage = data.invalidDateRowCount
        ? ` · ${data.invalidDateRowCount} ligne${data.invalidDateRowCount > 1 ? "s" : ""} ignorée${data.invalidDateRowCount > 1 ? "s" : ""} car la date est illisible`
        : "";
      setMessage(`${days.reduce((sum, day) => sum + day.sessions.length, 0)} séances uniques détectées sur ${days.length} date${days.length > 1 ? "s" : ""}${ignoredDateMessage}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Analyse impossible");
    } finally {
      setSaving(false);
    }
  }

  function updateDraftSession(sessionId: string, changes: Partial<StaffingAuditSession>) {
    setDraftDays((current) => current.map((day) => day.date === selectedDate ? { ...day, sessions: day.sessions.map((session) => session.sessionId === sessionId ? { ...session, ...changes } : session) } : day));
  }

  async function updateSavedSession(session: StaffingAuditSession, changes: { portfolioOwner?: SchoolPortfolioOwner; resolution?: StaffingAuditResolution; treated?: boolean }) {
    setSaving(true);
    try {
      const response = await fetch("/api/staffing-audits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selectedDate, sessionId: session.sessionId, ...changes }) });
      const data = await response.json() as { days?: StaffingAuditDay[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Modification impossible");
      setSavedDays(data.days ?? savedDays);
      setMessage("Bilan mis à jour");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Modification impossible");
    } finally {
      setSaving(false);
    }
  }

  function changeSession(session: StaffingAuditSession, changes: { portfolioOwner?: SchoolPortfolioOwner; resolution?: StaffingAuditResolution; treated?: boolean }) {
    if (view === "draft") updateDraftSession(session.sessionId, changes);
    else void updateSavedSession(session, changes);
  }

  async function saveDay() {
    if (!activeDay || view !== "draft") return;
    const exists = savedDays.some((day) => day.date === activeDay.date);
    if (exists && !window.confirm(`Un bilan existe déjà pour le ${formatDate(activeDay.date)}. Voulez-vous vraiment l’écraser ?`)) return;
    setSaving(true);
    try {
      const response = await fetch("/api/staffing-audits", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day: activeDay, overwrite: exists }) });
      const data = await response.json() as { day?: StaffingAuditDay; days?: StaffingAuditDay[]; conflict?: boolean; error?: string; detail?: string };
      if (response.status === 409 || data.conflict) throw new Error("Ce bilan vient d’être enregistré ailleurs. Actualisez avant de choisir de l’écraser.");
      if (!response.ok) throw new Error(data.detail || data.error || "Enregistrement impossible");
      setSavedDays(data.days ?? savedDays);
      setView("history");
      setMessage(`Bilan du ${formatDate(activeDay.date)} enregistré`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  function sessionRow(session: StaffingAuditSession) {
    const status = effectiveStatus(session);
    const sessionLabel = `#${session.sessionId}`;
    const sourceRowsLabel = session.sourceRowCount === null
      ? "Nombre de lignes non disponible"
      : `${session.sourceRowCount} ligne${session.sourceRowCount > 1 ? "s" : ""} dans le fichier`;
    return <article className={`staffing-audit-session ${status} ${session.treated ? "treated" : ""}`} key={session.sessionId}>
      <div>
        {session.schoolId ? <a className="staffing-audit-session-link" href={`https://www.alphaeducation.fr/administration/schools/${encodeURIComponent(session.schoolId)}/history`} target="_blank" rel="noreferrer" title={`Ouvrir l’historique de l’établissement (ID ${session.schoolId})`}>{sessionLabel}<span aria-hidden="true">↗</span></a> : <strong>{sessionLabel}</strong>}
        <span>{session.school || "Établissement non précisé"}</span>
        <small>{sourceRowsLabel}{session.schoolId ? "" : " · ID établissement introuvable"}</small>
        {session.tutorNames.length ? <small>Tuteur(s) trouvé(s) : {session.tutorNames.join(", ")}</small> : <small>Aucun tuteur renseigné</small>}
      </div>
      <label>Responsable RH<select value={session.portfolioOwner} onChange={(event) => changeSession(session, { portfolioOwner: event.target.value as SchoolPortfolioOwner })} disabled={saving}>{owners.map((owner) => <option value={owner} key={owner || "unassigned"}>{ownerLabels[owner]}</option>)}</select></label>
      {session.detectedStatus === "ambiguous" ? <label>Classement<select value={session.resolution} onChange={(event) => changeSession(session, { resolution: event.target.value as StaffingAuditResolution })} disabled={saving}><option value="">À vérifier</option><option value="staffed">Staffée</option><option value="unstaffed">Non staffée</option></select></label> : <span className={`staffing-audit-status ${status}`}>{status === "staffed" ? "Staffée" : "Non staffée"}</span>}
      {status === "unstaffed" ? <button type="button" className="ghost-button" onClick={() => changeSession(session, { treated: !session.treated })} disabled={saving}>{session.treated ? "Réactiver" : "Marquer comme traitée"}</button> : null}
    </article>;
  }

  return <section className="task-panel staffing-audit-panel">
    <div className="panel-heading"><div><p className="eyebrow">Historique quotidien</p><h2>Bilan staffing</h2><p>Importez un rapport, vérifiez une date puis enregistrez un bilan autonome.</p></div><label className="import-button">Importer un rapport CSV<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div>
    {message ? <p className="enrollment-message">{message}</p> : null}
    <div className="staffing-audit-source-tabs">
      {draftDays.length ? <button type="button" className={view === "draft" ? "active" : ""} onClick={() => { setView("draft"); setSelectedDate(draftDays[0]?.date || ""); }}>Import en cours ({draftDays.length})</button> : null}
      <button type="button" className={view === "history" ? "active" : ""} onClick={() => { setView("history"); setSelectedDate(savedDays[0]?.date || ""); }}>Historique ({savedDays.length})</button>
    </div>
    <div className="staffing-audit-date-tabs">{(view === "draft" ? draftDays : savedDays).map((day) => <button type="button" className={selectedDate === day.date ? "active" : ""} onClick={() => setSelectedDate(day.date)} key={day.date}>{formatShortDate(day.date)}{savedDays.some((saved) => saved.date === day.date) && view === "draft" ? <small>déjà enregistré</small> : null}</button>)}</div>
    {activeDay ? <>
      <div className="staffing-audit-day-heading"><div><strong>{formatDate(activeDay.date)}</strong><span>{activeDay.sessions.length} séances uniques · source : {activeDay.sourceFileName}</span></div>{view === "draft" ? <button type="button" className="button primary" onClick={() => void saveDay()} disabled={saving}>Enregistrer cette journée</button> : <span>Enregistré le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(activeDay.updatedAt))}</span>}</div>
      <div className="staffing-audit-summary"><div className="head"><span>Responsable RH</span><span>Staffées</span><span>Non staffées</span><span>À vérifier</span><span>Total</span></div>{summary.map((row) => <div className="row" key={row.owner || "unassigned"}><strong>{ownerLabels[row.owner]}</strong><span>{row.staffed}</span><span className="danger">{row.unstaffed}</span><span className="warning">{row.ambiguous}</span><span>{row.total}</span></div>)}</div>
      <div className="staffing-audit-list-heading"><div><h3>Séances à traiter</h3><span>{activeSessions.length} séance{activeSessions.length > 1 ? "s" : ""} non staffée{activeSessions.length > 1 ? "s" : ""} ou à vérifier</span></div></div>
      <div className="staffing-audit-list">{activeSessions.length ? activeSessions.map(sessionRow) : <div className="empty-state compact">Aucune séance active à traiter pour cette date.</div>}</div>
      {treatedSessions.length ? <details className="staffing-audit-treated"><summary>Séances traitées ({treatedSessions.length})</summary><div className="staffing-audit-list">{treatedSessions.map(sessionRow)}</div></details> : null}
    </> : <div className="empty-state"><span>📊</span><h3>Aucun bilan sélectionné</h3><p>Importez un fichier de rapports ou ouvrez une journée déjà enregistrée.</p></div>}
  </section>;
}

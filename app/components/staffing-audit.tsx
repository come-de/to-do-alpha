"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchoolPortfolioOwner, StaffingAuditDay, StaffingAuditResolution, StaffingAuditSession, StaffingAuditSessionCategory } from "@/app/lib/shared-data";

const ownerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };
const owners: SchoolPortfolioOwner[] = ["kelly", "pierre", "julie", ""];
const categoryLabels: Record<StaffingAuditSessionCategory, string> = { alpha: "Étude Alpha", surveillance: "Surveillance", service: "Prestation de service" };

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
  const [ownerFilter, setOwnerFilter] = useState<"all" | SchoolPortfolioOwner>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | StaffingAuditSessionCategory>("all");
  const [analysisStartDate, setAnalysisStartDate] = useState("");
  const [analysisEndDate, setAnalysisEndDate] = useState("");
  const [showTreated, setShowTreated] = useState(false);
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
  const totalTreatedSessions = useMemo(() => (activeDay?.sessions ?? []).filter((session) => session.treated), [activeDay]);
  const categorySessions = useMemo(
    () => (activeDay?.sessions ?? []).filter((session) => categoryFilter === "all" || session.category === categoryFilter),
    [activeDay, categoryFilter],
  );
  const summary = useMemo(() => activeDay ? daySummary({ ...activeDay, sessions: categorySessions }) : [], [activeDay, categorySessions]);
  const activeSessions = useMemo(() => categorySessions.filter((session) => {
    const status = effectiveStatus(session);
    return !session.treated && (status === "unstaffed" || status === "ambiguous");
  }), [categorySessions]);
  const treatedSessions = useMemo(() => categorySessions.filter((session) => session.treated), [categorySessions]);
  const filteredActiveSessions = useMemo(
    () => activeSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter),
    [activeSessions, ownerFilter],
  );
  const filteredTreatedSessions = useMemo(
    () => treatedSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter),
    [ownerFilter, treatedSessions],
  );
  const historyDateBounds = useMemo(() => {
    const dates = savedDays.map((day) => day.date).filter(Boolean).sort();
    return { first: dates[0] || "", last: dates.at(-1) || "" };
  }, [savedDays]);
  const effectiveAnalysisStartDate = analysisStartDate || historyDateBounds.first;
  const effectiveAnalysisEndDate = analysisEndDate || historyDateBounds.last;
  const rangeAnalysis = useMemo(() => {
    const start = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisStartDate : effectiveAnalysisEndDate;
    const end = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisEndDate : effectiveAnalysisStartDate;
    const sessions = savedDays
      .filter((day) => (!start || day.date >= start) && (!end || day.date <= end))
      .flatMap((day) => day.sessions)
      .filter((session) => categoryFilter === "all" || session.category === categoryFilter);
    const isUnstaffed = (session: StaffingAuditSession) => effectiveStatus(session) === "unstaffed" && !session.treated;
    const unstaffed = sessions.filter(isUnstaffed);
    const byOwner = (["kelly", "pierre", "julie"] as const).map((owner) => {
      const ownerSessions = sessions.filter((session) => session.portfolioOwner === owner);
      const ownerUnstaffed = ownerSessions.filter(isUnstaffed).length;
      return {
        owner,
        total: ownerSessions.length,
        unstaffed: ownerUnstaffed,
        percentage: ownerSessions.length ? (ownerUnstaffed / ownerSessions.length) * 100 : 0,
      };
    });
    const schools = new Map<string, { name: string; count: number }>();
    unstaffed.forEach((session) => {
      const key = session.school.trim().toLocaleLowerCase("fr") || "établissement non précisé";
      const item = schools.get(key) ?? { name: session.school || "Établissement non précisé", count: 0 };
      item.count += 1;
      schools.set(key, item);
    });
    return {
      total: sessions.length,
      unstaffed: unstaffed.length,
      percentage: sessions.length ? (unstaffed.length / sessions.length) * 100 : 0,
      byOwner,
      topSchools: Array.from(schools.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr")).slice(0, 10),
    };
  }, [categoryFilter, effectiveAnalysisEndDate, effectiveAnalysisStartDate, savedDays]);

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
        <em className={`staffing-audit-category ${session.category}`}>{categoryLabels[session.category]}</em>
        <small>{sourceRowsLabel}{session.schoolId ? "" : " · ID établissement introuvable"}</small>
        {session.tutorNames.length ? <small>Tuteur(s) trouvé(s) : {session.tutorNames.join(", ")}</small> : <small>Aucun tuteur renseigné</small>}
      </div>
      <label>Responsable RH<select value={session.portfolioOwner} onChange={(event) => changeSession(session, { portfolioOwner: event.target.value as SchoolPortfolioOwner })} disabled={saving}>{owners.map((owner) => <option value={owner} key={owner || "unassigned"}>{ownerLabels[owner]}</option>)}</select></label>
      {session.detectedStatus === "ambiguous" ? <label>Classement<select value={session.resolution} onChange={(event) => changeSession(session, { resolution: event.target.value as StaffingAuditResolution })} disabled={saving}><option value="">À vérifier</option><option value="staffed">Staffée</option><option value="unstaffed">Non staffée</option></select></label> : <span className={`staffing-audit-status ${status}`}>{status === "staffed" ? "Staffée" : "Non staffée"}</span>}
      {status === "unstaffed" ? <button type="button" className="ghost-button staffing-audit-ignore" onClick={() => changeSession(session, { treated: !session.treated })} disabled={saving}>{session.treated ? "Reconsidérer comme non staffée" : "Ne pas considérer comme non staffée"}</button> : null}
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
      {totalTreatedSessions.length ? <div className="staffing-audit-removed-summary"><span><strong>{totalTreatedSessions.length}</strong> séance{totalTreatedSessions.length > 1 ? "s" : ""} retirée{totalTreatedSessions.length > 1 ? "s" : ""} du non-staffing pour cette date{categoryFilter !== "all" || ownerFilter !== "all" ? ` · ${filteredTreatedSessions.length} avec les filtres actuels` : ""}</span><button type="button" onClick={() => setShowTreated((current) => !current)}>{showTreated ? "Masquer" : "Voir et réactiver"}</button></div> : null}
      <div className="staffing-audit-category-filter"><strong>Type de séance</strong>{(["all", "alpha", "surveillance", "service"] as const).map((category) => <button type="button" className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)} key={category}>{category === "all" ? "Tous les types" : categoryLabels[category]}</button>)}</div>
      {view === "history" && savedDays.length ? <section className="staffing-range-analysis">
        <div className="staffing-range-heading">
          <div><p className="eyebrow">Analyse de période</p><h3>Évolution du non-staffing</h3><span>{categoryFilter === "all" ? "Tous les types de séances" : categoryLabels[categoryFilter]}</span></div>
          <div className="staffing-range-dates">
            <label>Du<input type="date" min={historyDateBounds.first} max={effectiveAnalysisEndDate || historyDateBounds.last} value={effectiveAnalysisStartDate} onChange={(event) => setAnalysisStartDate(event.target.value)} /></label>
            <label>Au<input type="date" min={effectiveAnalysisStartDate || historyDateBounds.first} max={historyDateBounds.last} value={effectiveAnalysisEndDate} onChange={(event) => setAnalysisEndDate(event.target.value)} /></label>
          </div>
        </div>
        <div className="staffing-range-kpis">
          <div><span>Séances totales</span><strong>{rangeAnalysis.total}</strong></div>
          <div><span>Séances non staffées</span><strong>{rangeAnalysis.unstaffed}</strong></div>
          <div className="highlight"><span>Non-staffing global</span><strong>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(rangeAnalysis.percentage)} %</strong></div>
        </div>
        <div className="staffing-range-layout">
          <div className="staffing-range-rh">
            <h4>Pourcentage non staffé par RH</h4>
            {rangeAnalysis.byOwner.map((row) => <article key={row.owner}>
              <div><strong>{ownerLabels[row.owner]}</strong><span>{row.unstaffed} non staffée{row.unstaffed > 1 ? "s" : ""} / {row.total} séance{row.total > 1 ? "s" : ""}</span></div>
              <div className="staffing-range-rate"><span style={{ width: `${Math.min(100, row.percentage)}%` }} /></div>
              <b>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(row.percentage)} %</b>
            </article>)}
          </div>
          <div className="staffing-range-schools">
            <h4>Établissements les plus concernés</h4>
            {rangeAnalysis.topSchools.length ? rangeAnalysis.topSchools.map((school, index) => <article key={school.name}><span>{index + 1}</span><strong>{school.name}</strong><b>{school.count}</b></article>) : <p>Aucune séance non staffée sur cette période.</p>}
          </div>
        </div>
      </section> : null}
      <div className="staffing-audit-summary"><div className="head"><span>Responsable RH</span><span>Staffées</span><span>Non staffées</span><span>À vérifier</span><span>Total</span></div>{summary.map((row) => <div className="row" key={row.owner || "unassigned"}><strong>{ownerLabels[row.owner]}</strong><span>{row.staffed}</span><span className="danger">{row.unstaffed}</span><span className="warning">{row.ambiguous}</span><span>{row.total}</span></div>)}</div>
      <div className="staffing-audit-owner-filter"><strong>Afficher les séances de</strong>{(["all", "kelly", "pierre", "julie", ""] as const).map((owner) => <button type="button" className={ownerFilter === owner ? "active" : ""} onClick={() => setOwnerFilter(owner)} key={owner || "unassigned"}>{owner === "all" ? "Tous" : ownerLabels[owner]}</button>)}</div>
      <div className="staffing-audit-list-heading"><div><h3>Séances à traiter</h3><span>{filteredActiveSessions.length} affichée{filteredActiveSessions.length > 1 ? "s" : ""}{ownerFilter !== "all" ? ` · ${activeSessions.length} au total` : ""}</span></div></div>
      <div className="staffing-audit-list">{filteredActiveSessions.length ? filteredActiveSessions.map(sessionRow) : <div className="empty-state compact">Aucune séance active à traiter pour ce responsable et cette date.</div>}</div>
      {showTreated && totalTreatedSessions.length ? <section className="staffing-audit-treated"><div className="staffing-audit-treated-heading"><strong>Séances retirées du non-staffing</strong><span>{filteredTreatedSessions.length} affichée{filteredTreatedSessions.length > 1 ? "s" : ""}</span></div><div className="staffing-audit-list">{filteredTreatedSessions.length ? filteredTreatedSessions.map(sessionRow) : <div className="empty-state compact">Aucune séance retirée avec les filtres actuels.</div>}</div></section> : null}
    </> : <div className="empty-state"><span>📊</span><h3>Aucun bilan sélectionné</h3><p>Importez un fichier de rapports ou ouvrez une journée déjà enregistrée.</p></div>}
  </section>;
}

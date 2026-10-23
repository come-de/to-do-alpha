"use client";

import StaffingDailyChart from "./staffing-daily-chart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STAFFING_AUDIT_UNSTAFFED_REASONS, type School, type SchoolPortfolioOwner, type StaffingAuditDay, type StaffingAuditResolution, type StaffingAuditSession, type StaffingAuditSessionCategory, type TutorTrackingSnapshot, type StaffingAuditUnstaffedReason } from "@/app/lib/shared-data";

const ownerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };
const owners: SchoolPortfolioOwner[] = ["kelly", "pierre", "julie", ""];
const categories: StaffingAuditSessionCategory[] = ["alpha", "surveillance", "service"];
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

function formatChartDate(value: string) {
  const date = staffingAuditDate(value);
  return date ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date) : value;
}

function effectiveStatus(session: StaffingAuditSession) {
  return session.resolution || session.detectedStatus;
}

function schoolLookupKey(value: string) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
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
  const [sectionTab, setSectionTab] = useState<"general" | "daily">("general");
  const [savedDays, setSavedDays] = useState<StaffingAuditDay[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [tutorSnapshots, setTutorSnapshots] = useState<TutorTrackingSnapshot[]>([]);
  const [draftDays, setDraftDays] = useState<StaffingAuditDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [view, setView] = useState<"draft" | "history">("history");
  const [ownerFilter, setOwnerFilter] = useState<"all" | SchoolPortfolioOwner>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | StaffingAuditSessionCategory>("all");
  const [analysisStartDate, setAnalysisStartDate] = useState("");
  const [analysisEndDate, setAnalysisEndDate] = useState("");
  const [sessionListMode, setSessionListMode] = useState<"active" | "staffed">("active");
  const [showTreated, setShowTreated] = useState(false);
  const [excludedSchoolKeys, setExcludedSchoolKeys] = useState<string[]>([]);
  const [excludedCityKeys, setExcludedCityKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

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

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/tutor-tracking", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { tracking?: { snapshots?: TutorTrackingSnapshot[] } };
      })
      .then((data) => {
        if (!cancelled) setTutorSnapshots(data?.tracking?.snapshots ?? []);
      })
      .catch(() => {
        if (!cancelled) setTutorSnapshots([]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/schools", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Établissements indisponibles");
        return await response.json() as { schools?: School[] };
      })
      .then((data) => {
        if (!cancelled) setSchools(data.schools ?? []);
      })
      .catch(() => {
        if (!cancelled) setSchools([]);
      });
    return () => { cancelled = true; };
  }, []);

  const tutorTypeSnapshot = useMemo(() => tutorSnapshots.find((snapshot) => snapshot.records.some((record) => record.level.trim())), [tutorSnapshots]);
  const tutorTypeById = useMemo(() => {
    const result = new Map<string, boolean>();
    for (const record of tutorTypeSnapshot?.records ?? []) {
      const tutorId = record.tutorId.trim();
      if (!tutorId || !record.level.trim()) continue;
      result.set(tutorId, record.level.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("fr") === "st");
    }
    return result;
  }, [tutorTypeSnapshot]);

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
  const staffedSessions = useMemo(
    () => categorySessions.filter((session) => effectiveStatus(session) === "staffed"),
    [categorySessions],
  );
  const filteredStaffedSessions = useMemo(
    () => staffedSessions.filter((session) => ownerFilter === "all" || session.portfolioOwner === ownerFilter),
    [ownerFilter, staffedSessions],
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
  const schoolCities = useMemo(() => {
    const byId = new Map<string, string>();
    const byName = new Map<string, string>();
    schools.forEach((school) => {
      const city = school.city.trim();
      if (school.id) byId.set(school.id, city);
      if (school.externalId) byId.set(school.externalId, city);
      const name = schoolLookupKey(school.name);
      if (name) byName.set(name, city);
    });
    return { byId, byName };
  }, [schools]);
  const rangeAnalysis = useMemo(() => {
    const start = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisStartDate : effectiveAnalysisEndDate;
    const end = effectiveAnalysisStartDate <= effectiveAnalysisEndDate ? effectiveAnalysisEndDate : effectiveAnalysisStartDate;
    const filteredDays = savedDays
      .filter((day) => (!start || day.date >= start) && (!end || day.date <= end))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        date: day.date,
        sessions: day.sessions.filter((session) => categoryFilter === "all" || session.category === categoryFilter),
      }));
    const allSessions = filteredDays.flatMap((day) => day.sessions);
    const schoolKey = (session: StaffingAuditSession) => session.school.trim().toLocaleLowerCase("fr") || "établissement non précisé";
    const cityForSession = (session: StaffingAuditSession) => {
      const schoolCity = (session.schoolId ? schoolCities.byId.get(session.schoolId) : undefined) ?? schoolCities.byName.get(schoolLookupKey(session.school));
      return schoolCity?.trim() || "Ville non renseignée";
    };
    const cityKey = (session: StaffingAuditSession) => schoolLookupKey(cityForSession(session)) || "ville non renseignée";
    const isExcluded = (session: StaffingAuditSession) => excludedSchoolKeys.includes(schoolKey(session)) || excludedCityKeys.includes(cityKey(session));
    const sessions = allSessions.filter((session) => !isExcluded(session));
    const isUnstaffed = (session: StaffingAuditSession) => effectiveStatus(session) === "unstaffed" && !session.treated;
    const unstaffed = sessions.filter(isUnstaffed);
    const allUnstaffed = allSessions.filter(isUnstaffed);
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
    const schools = new Map<string, { key: string; name: string; count: number; owners: Set<SchoolPortfolioOwner> }>();
    const cities = new Map<string, { key: string; name: string; count: number; owners: Set<SchoolPortfolioOwner> }>();
    allUnstaffed.forEach((session) => {
      const key = schoolKey(session);
      const item = schools.get(key) ?? { key, name: session.school || "Établissement non précisé", count: 0, owners: new Set<SchoolPortfolioOwner>() };
      item.count += 1;
      item.owners.add(session.portfolioOwner);
      schools.set(key, item);
      const name = cityForSession(session);
      const keyCity = cityKey(session);
      const city = cities.get(keyCity) ?? { key: keyCity, name, count: 0, owners: new Set<SchoolPortfolioOwner>() };
      city.count += 1;
      city.owners.add(session.portfolioOwner);
      cities.set(keyCity, city);
    });
    return {
      total: sessions.length,
      unstaffed: unstaffed.length,
      percentage: sessions.length ? (unstaffed.length / sessions.length) * 100 : 0,
      byOwner,
      daily: filteredDays.map((day) => {
        const daySessions = day.sessions.filter((session) => !isExcluded(session));
        const dailyUnstaffed = daySessions.filter(isUnstaffed).length;
        const distinctTutors = new Set(daySessions.flatMap((session) => session.tutors.map((tutor) => tutor.tutorId.trim())).filter(Boolean));
        const unidentifiedTutors = daySessions.reduce((count, session) => count + session.tutors.filter((tutor) => !tutor.tutorId.trim()).length, 0);
        const tutorClassifiedSessions = daySessions.map((session) => {
          const matchedTypes = session.tutors.map((tutor) => tutor.tutorId ? tutorTypeById.get(tutor.tutorId) : undefined);
          return {
            nonSt: matchedTypes.some((isSt) => isSt === false),
            unknown: !matchedTypes.length || matchedTypes.some((isSt) => isSt === undefined),
          };
        });
        return {
          date: day.date,
          total: daySessions.length,
          unstaffed: dailyUnstaffed,
          tutors: distinctTutors.size,
          unidentifiedTutors,
          nonStSessions: tutorTypeSnapshot ? tutorClassifiedSessions.filter((session) => session.nonSt).length : null,
          unclassifiedTutorSessions: tutorTypeSnapshot ? tutorClassifiedSessions.filter((session) => session.unknown && !session.nonSt).length : null,
          byOwner: owners.map((owner) => {
            const ownerSessions = daySessions.filter((session) => session.portfolioOwner === owner);
            return {
              owner,
              total: ownerSessions.length,
              unstaffed: ownerSessions.filter(isUnstaffed).length,
            };
          }),
          percentage: daySessions.length ? (dailyUnstaffed / daySessions.length) * 100 : 0,
        };
      }),
      topSchools: Array.from(schools.values())
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"))
        .slice(0, 20)
        .map((school) => ({ ...school, owners: owners.filter((owner) => school.owners.has(owner)).map((owner) => ownerLabels[owner]) })),
      topCities: Array.from(cities.values())
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"))
        .slice(0, 20)
        .map((city) => ({ ...city, owners: owners.filter((owner) => city.owners.has(owner)).map((owner) => ownerLabels[owner]) })),
    };
  }, [categoryFilter, effectiveAnalysisEndDate, effectiveAnalysisStartDate, excludedCityKeys, excludedSchoolKeys, savedDays, schoolCities, tutorTypeById, tutorTypeSnapshot]);
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
      setSectionTab("daily");
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

  async function updateSavedSession(session: StaffingAuditSession, changes: { portfolioOwner?: SchoolPortfolioOwner; resolution?: StaffingAuditResolution; treated?: boolean; unstaffedReason?: StaffingAuditUnstaffedReason; comment?: string }) {
    setSaving(true);
    try {
      const response = await fetch("/api/staffing-audits", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selectedDate, sessionId: session.sessionId, ...changes }) });
      const data = await response.json() as { days?: StaffingAuditDay[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Modification impossible");
      setSavedDays(data.days ?? savedDays);
      setMessage("Bilan mis à jour");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Modification impossible");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function changeSession(session: StaffingAuditSession, changes: { portfolioOwner?: SchoolPortfolioOwner; resolution?: StaffingAuditResolution; treated?: boolean; unstaffedReason?: StaffingAuditUnstaffedReason; comment?: string }) {
    if (view === "draft") updateDraftSession(session.sessionId, changes);
    else void updateSavedSession(session, changes);
  }

  async function saveSessionComment(session: StaffingAuditSession, key: string) {
    const comment = commentDrafts[key] ?? session.comment;
    if (view === "draft") {
      updateDraftSession(session.sessionId, { comment });
      return;
    }
    if (await updateSavedSession(session, { comment })) {
      setCommentDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
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
    const commentKey = `${selectedDate}::${session.sessionId}`;
    const commentValue = view === "draft" ? session.comment : commentDrafts[commentKey] ?? session.comment;
    const commentPending = view === "history" && commentDrafts[commentKey] !== undefined && commentDrafts[commentKey] !== session.comment;
    return <article className={`staffing-audit-session ${status} ${status === "unstaffed" ? "has-followup-fields" : ""} ${session.treated ? "treated" : ""}`} key={session.sessionId}>
      <div>
        {session.schoolId ? <a className="staffing-audit-session-link" href={`https://www.alphaeducation.fr/administration/schools/${encodeURIComponent(session.schoolId)}/history`} target="_blank" rel="noreferrer" title={`Ouvrir l’historique de l’établissement (ID ${session.schoolId})`}>{sessionLabel}<span aria-hidden="true">↗</span></a> : <strong>{sessionLabel}</strong>}
        <span>{session.school || "Établissement non précisé"}</span>
        <em className={`staffing-audit-category ${session.category}`}>{categoryLabels[session.category]}</em>
        <small>{sourceRowsLabel}{session.schoolId ? "" : " · ID établissement introuvable"}</small>
        {session.tutors.length ? <small>Tuteur(s) trouvé(s) : {session.tutors.map((tutor) => `${tutor.name || "Tuteur sans nom"}${tutor.tutorId ? ` (ID ${tutor.tutorId})` : " (ID à rapprocher)"}`).join(", ")}</small> : <small>Aucun tuteur renseigné</small>}
      </div>
      <label>Responsable RH<select value={session.portfolioOwner} onChange={(event) => changeSession(session, { portfolioOwner: event.target.value as SchoolPortfolioOwner })} disabled={saving}>{owners.map((owner) => <option value={owner} key={owner || "unassigned"}>{ownerLabels[owner]}</option>)}</select></label>
      {session.detectedStatus === "ambiguous" ? <label>Classement<select value={session.resolution} onChange={(event) => changeSession(session, { resolution: event.target.value as StaffingAuditResolution })} disabled={saving}><option value="">À vérifier</option><option value="staffed">Staffée</option><option value="unstaffed">Non staffée</option></select></label> : <span className={`staffing-audit-status ${status}`}>{status === "staffed" ? "Staffée" : "Non staffée"}</span>}
      {status === "unstaffed" ? <>
        <label>Motif<select value={session.unstaffedReason} onChange={(event) => changeSession(session, { unstaffedReason: event.target.value as StaffingAuditUnstaffedReason })} disabled={saving}>
          <option value="">À préciser</option>
          {STAFFING_AUDIT_UNSTAFFED_REASONS.map((reason) => <option value={reason} key={reason}>{reason}</option>)}
        </select></label>
        <label className="staffing-audit-comment">Commentaire<textarea value={commentValue} maxLength={2000} placeholder="Ajouter un commentaire…" onChange={(event) => {
          const value = event.target.value;
          if (view === "draft") updateDraftSession(session.sessionId, { comment: value });
          else setCommentDrafts((current) => ({ ...current, [commentKey]: value }));
        }} disabled={saving} /></label>
        <div className="staffing-audit-actions">
          {commentPending ? <button type="button" className="button quiet staffing-audit-save-comment" onClick={() => void saveSessionComment(session, commentKey)} disabled={saving}>Enregistrer le commentaire</button> : null}
          <button type="button" className="ghost-button staffing-audit-ignore" onClick={() => changeSession(session, { treated: !session.treated })} disabled={saving}>{session.treated ? "Reconsidérer comme non staffée" : "Ne pas considérer comme non staffée"}</button>
        </div>
      </> : null}
    </article>;
  }

  function groupedSessionRows(sessions: StaffingAuditSession[]) {
    return <div className="staffing-audit-grouped-list">{owners.map((owner) => {
      const ownerSessions = sessions.filter((session) => session.portfolioOwner === owner);
      if (!ownerSessions.length) return null;
      return <section className="staffing-audit-owner-group" key={owner || "unassigned"}>
        <div className="staffing-audit-owner-group-heading"><strong>{ownerLabels[owner]}</strong><span>{ownerSessions.length} séance{ownerSessions.length > 1 ? "s" : ""}</span></div>
        {categories.map((category) => {
          const categoryRows = ownerSessions
            .filter((session) => session.category === category)
            .sort((a, b) => a.school.localeCompare(b.school, "fr") || a.sessionId.localeCompare(b.sessionId, "fr"));
          if (!categoryRows.length) return null;
          return <div className="staffing-audit-category-group" key={category}>
            <div className={`staffing-audit-category-group-heading ${category}`}><strong>{categoryLabels[category]}</strong><span>{categoryRows.length}</span></div>
            <div className="staffing-audit-list">{categoryRows.map(sessionRow)}</div>
          </div>;
        })}
      </section>;
    })}</div>;
  }

  return <section className="task-panel staffing-audit-panel">
    <div className="panel-heading"><div><p className="eyebrow">Pilotage du staffing</p><h2>Bilan staffing</h2><p>{sectionTab === "general" ? "Analysez l’évolution du staffing sur une période." : "Importez un rapport, vérifiez une date puis enregistrez un bilan autonome."}</p></div>{sectionTab === "daily" ? <label className="import-button">Importer un rapport CSV<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label> : null}</div>
    <div className="staffing-audit-main-tabs" role="tablist" aria-label="Choisir la vue du bilan staffing">
      <button type="button" role="tab" aria-selected={sectionTab === "general"} className={sectionTab === "general" ? "active" : ""} onClick={() => { setSectionTab("general"); setView("history"); setSelectedDate((current) => savedDays.some((day) => day.date === current) ? current : savedDays[0]?.date || ""); }}>📈 Bilan général</button>
      <button type="button" role="tab" aria-selected={sectionTab === "daily"} className={sectionTab === "daily" ? "active" : ""} onClick={() => { setSectionTab("daily"); setSelectedDate((current) => (view === "draft" ? draftDays : savedDays).some((day) => day.date === current) ? current : (view === "draft" ? draftDays[0]?.date : savedDays[0]?.date) || ""); }}>📅 Bilans par date et imports</button>
    </div>
    {message ? <p className="enrollment-message">{message}</p> : null}
    {sectionTab === "daily" ? <><div className="staffing-audit-source-tabs">
      {draftDays.length ? <button type="button" className={view === "draft" ? "active" : ""} onClick={() => { setView("draft"); setSelectedDate(draftDays[0]?.date || ""); }}>Import en cours ({draftDays.length})</button> : null}
      <button type="button" className={view === "history" ? "active" : ""} onClick={() => { setView("history"); setSelectedDate(savedDays[0]?.date || ""); }}>Historique ({savedDays.length})</button>
    </div>
    <div className="staffing-audit-date-tabs">{(view === "draft" ? draftDays : savedDays).map((day) => <button type="button" className={selectedDate === day.date ? "active" : ""} onClick={() => setSelectedDate(day.date)} key={day.date}>{formatShortDate(day.date)}{savedDays.some((saved) => saved.date === day.date) && view === "draft" ? <small>déjà enregistré</small> : null}</button>)}</div></> : null}
    {activeDay ? <>
      {sectionTab === "daily" ? <div className="staffing-audit-day-heading"><div><strong>{formatDate(activeDay.date)}</strong><span>{activeDay.sessions.length} séances uniques · source : {activeDay.sourceFileName}</span></div>{view === "draft" ? <button type="button" className="button primary" onClick={() => void saveDay()} disabled={saving}>Enregistrer cette journée</button> : <span>Enregistré le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(activeDay.updatedAt))}</span>}</div> : null}
      {sectionTab === "daily" && totalTreatedSessions.length ? <div className="staffing-audit-removed-summary"><span><strong>{totalTreatedSessions.length}</strong> séance{totalTreatedSessions.length > 1 ? "s" : ""} retirée{totalTreatedSessions.length > 1 ? "s" : ""} du non-staffing pour cette date{categoryFilter !== "all" || ownerFilter !== "all" ? ` · ${filteredTreatedSessions.length} avec les filtres actuels` : ""}</span><button type="button" onClick={() => setShowTreated((current) => !current)}>{showTreated ? "Masquer" : "Voir et réactiver"}</button></div> : null}
      <div className="staffing-audit-category-filter"><strong>Type de séance</strong>{(["all", "alpha", "surveillance", "service"] as const).map((category) => <button type="button" className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)} key={category}>{category === "all" ? "Tous les types" : categoryLabels[category]}</button>)}</div>
      {sectionTab === "general" && savedDays.length ? <section className="staffing-range-analysis">
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
        <StaffingDailyChart days={rangeAnalysis.daily} owners={owners.map((owner) => ({ owner, label: ownerLabels[owner] }))} tutorTypeName={tutorTypeSnapshot?.displayName} formatDate={formatDate} formatChartDate={formatChartDate} />
        <div className="staffing-range-layout">
          <div className="staffing-range-rh">
            <h4>Pourcentage non staffé par RH</h4>
            {rangeAnalysis.byOwner.map((row) => <article key={row.owner}>
              <div><strong>{ownerLabels[row.owner]}</strong><span>{row.unstaffed} non staffée{row.unstaffed > 1 ? "s" : ""} / {row.total} séance{row.total > 1 ? "s" : ""}</span></div>
              <div className="staffing-range-rate"><span style={{ width: `${Math.min(100, row.percentage)}%` }} /></div>
              <b>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(row.percentage)} %</b>
            </article>)}
          </div>
          <div className="staffing-range-ranking staffing-range-schools">
            <div className="staffing-range-ranking-heading"><h4>Établissements les plus concernés</h4><small>Exclusion temporaire pour mesurer l’impact sur le bilan.</small></div>
            <div className="staffing-range-ranking-list">
            {rangeAnalysis.topSchools.length ? rangeAnalysis.topSchools.map((school, index) => {
              const excluded = excludedSchoolKeys.includes(school.key);
              return <article className={excluded ? "excluded" : ""} key={school.key}>
                <span className="staffing-range-rank">{index + 1}</span>
                <div className="staffing-range-ranking-name"><strong title={school.name}>{school.name}</strong><small>RH : {school.owners.join(", ")}</small></div>
                <b className="staffing-range-ranking-count">{school.count}</b>
                <button type="button" aria-pressed={excluded} onClick={() => setExcludedSchoolKeys((current) => excluded ? current.filter((key) => key !== school.key) : [...current, school.key])}>{excluded ? "Réintégrer" : "Exclure"}</button>
              </article>;
            }) : <p>Aucune séance non staffée sur cette période.</p>}
            </div>
            {excludedSchoolKeys.length ? <button type="button" className="staffing-range-reset-exclusions" onClick={() => setExcludedSchoolKeys([])}>Réintégrer tous les établissements ({excludedSchoolKeys.length})</button> : null}
          </div>
          <div className="staffing-range-ranking staffing-range-cities">
            <div className="staffing-range-ranking-heading"><h4>Villes les plus concernées</h4><small>Ville issue de la fiche établissement.</small></div>
            <div className="staffing-range-ranking-list">
            {rangeAnalysis.topCities.length ? rangeAnalysis.topCities.map((city, index) => {
              const excluded = excludedCityKeys.includes(city.key);
              return <article className={excluded ? "excluded" : ""} key={city.key}>
                <span className="staffing-range-rank">{index + 1}</span>
                <div className="staffing-range-ranking-name"><strong title={city.name}>{city.name}</strong><small>RH : {city.owners.join(", ")}</small></div>
                <b className="staffing-range-ranking-count">{city.count}</b>
                <button type="button" aria-pressed={excluded} onClick={() => setExcludedCityKeys((current) => excluded ? current.filter((key) => key !== city.key) : [...current, city.key])}>{excluded ? "Réintégrer" : "Exclure"}</button>
              </article>;
            }) : <p>Aucune ville avec une séance non staffée.</p>}
            </div>
            {excludedCityKeys.length ? <button type="button" className="staffing-range-reset-exclusions" onClick={() => setExcludedCityKeys([])}>Réintégrer toutes les villes ({excludedCityKeys.length})</button> : null}
          </div>
        </div>
      </section> : null}
      {sectionTab === "daily" ? <><div className="staffing-audit-summary"><div className="head"><span>Responsable RH</span><span>Staffées</span><span>Non staffées</span><span>À vérifier</span><span>Total</span></div>{summary.map((row) => <div className="row" key={row.owner || "unassigned"}><strong>{ownerLabels[row.owner]}</strong><span>{row.staffed}</span><span className="danger">{row.unstaffed}</span><span className="warning">{row.ambiguous}</span><span>{row.total}</span></div>)}</div>
      <div className="staffing-audit-owner-filter"><strong>Afficher les séances de</strong>{(["all", "kelly", "pierre", "julie", ""] as const).map((owner) => <button type="button" className={ownerFilter === owner ? "active" : ""} onClick={() => setOwnerFilter(owner)} key={owner || "unassigned"}>{owner === "all" ? "Tous" : ownerLabels[owner]}</button>)}</div>
      <div className="staffing-audit-session-mode" role="tablist" aria-label="Choisir les séances à afficher"><button type="button" role="tab" aria-selected={sessionListMode === "active"} className={sessionListMode === "active" ? "active" : ""} onClick={() => setSessionListMode("active")}>Séances à traiter <span>{activeSessions.length}</span></button><button type="button" role="tab" aria-selected={sessionListMode === "staffed"} className={sessionListMode === "staffed" ? "active" : ""} onClick={() => setSessionListMode("staffed")}>Séances staffées <span>{staffedSessions.length}</span></button></div>
      <div className="staffing-audit-list-heading"><div><h3>{sessionListMode === "active" ? "Séances non staffées et à vérifier" : "Séances staffées"}</h3><span>{sessionListMode === "active" ? filteredActiveSessions.length : filteredStaffedSessions.length} affichée{(sessionListMode === "active" ? filteredActiveSessions.length : filteredStaffedSessions.length) > 1 ? "s" : ""}{ownerFilter !== "all" ? ` · ${sessionListMode === "active" ? activeSessions.length : staffedSessions.length} au total` : ""}</span></div></div>
      {sessionListMode === "active" ? (filteredActiveSessions.length ? groupedSessionRows(filteredActiveSessions) : <div className="staffing-audit-list"><div className="empty-state compact">Aucune séance active à traiter pour ce responsable et cette date.</div></div>) : (filteredStaffedSessions.length ? groupedSessionRows(filteredStaffedSessions) : <div className="staffing-audit-list"><div className="empty-state compact">Aucune séance staffée pour ce responsable et cette date.</div></div>)}
      {showTreated && totalTreatedSessions.length ? <section className="staffing-audit-treated"><div className="staffing-audit-treated-heading"><strong>Séances retirées du non-staffing</strong><span>{filteredTreatedSessions.length} affichée{filteredTreatedSessions.length > 1 ? "s" : ""}</span></div><div className="staffing-audit-list">{filteredTreatedSessions.length ? filteredTreatedSessions.map(sessionRow) : <div className="empty-state compact">Aucune séance retirée avec les filtres actuels.</div>}</div></section> : null}</> : null}
    </> : <div className="empty-state"><span>📊</span><h3>{sectionTab === "general" ? "Aucun bilan enregistré" : "Aucun bilan sélectionné"}</h3><p>{sectionTab === "general" ? "Enregistrez au moins une journée dans l’onglet Bilans par date pour construire l’analyse générale." : "Importez un fichier de rapports ou ouvrez une journée déjà enregistrée."}</p></div>}
  </section>;
}

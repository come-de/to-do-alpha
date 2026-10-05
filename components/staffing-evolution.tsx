"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PersonAdminLink from "@/app/components/person-admin-link";
import SchoolAdminLink from "@/app/components/school-admin-link";
import type { UpcomingSessionImport, UpcomingSessionTutor, UpcomingStaffingSession } from "@/app/lib/shared-data";

type Owner = "" | "kelly" | "pierre" | "julie";
type OwnerFilter = "all" | "unassigned" | Exclude<Owner, "">;
type ChangeKind = "replacements" | "additions" | "removals" | "appeared" | "disappeared";
type SchoolRecord = { externalId: string; name: string; portfolioOwner: Owner };
type SessionChange = { kind: ChangeKind; session: UpcomingStaffingSession; before: UpcomingSessionTutor[]; after: UpcomingSessionTutor[]; beforeSourceRowCount: number; afterSourceRowCount: number };

const ownerLabels: Record<Owner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };
const kindLabels: Record<ChangeKind, string> = {
  replacements: "Tuteur changé",
  additions: "Nouveau tuteur affecté",
  removals: "Tuteur retiré",
  appeared: "Session apparue",
  disappeared: "Session disparue",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function timestamp(value: string) {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function importLabel(item: UpcomingSessionImport) {
  const date = new Date(item.importedAt);
  const importedAt = Number.isNaN(date.getTime()) ? item.importedAt : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
  return `${item.displayName} · ${importedAt}`;
}

function fullDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function tutorName(row: UpcomingSessionTutor) {
  return `${row.firstName} ${row.lastName}`.trim() || `ID ${row.tutorId}`;
}

function timeSlot(session: UpcomingStaffingSession) {
  return [session.startTime, session.endTime].filter(Boolean).join(" → ") || "Horaire non précisé";
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function StaffingEvolution() {
  const [imports, setImports] = useState<UpcomingSessionImport[]>([]);
  const [loadedImports, setLoadedImports] = useState<Record<string, UpcomingSessionImport>>({});
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [referenceId, setReferenceId] = useState("");
  const [recentId, setRecentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [kindFilter, setKindFilter] = useState<"all" | ChangeKind>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const [importsResponse, schoolsResponse] = await Promise.all([
        fetch("/api/upcoming-session-imports?summary=1", { cache: "no-store" }),
        fetch("/api/schools", { cache: "no-store" }),
      ]);
      const importsData = await importsResponse.json() as { imports?: UpcomingSessionImport[]; error?: string; detail?: string };
      const schoolsData = await schoolsResponse.json() as { schools?: SchoolRecord[]; error?: string; detail?: string };
      if (!importsResponse.ok) throw new Error(importsData.detail || importsData.error || "Imports indisponibles");
      if (!schoolsResponse.ok) throw new Error(schoolsData.detail || schoolsData.error || "Établissements indisponibles");
      const nextImports = (importsData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      setImports(nextImports);
      setSchools(schoolsData.schools ?? []);
      setRecentId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[0]?.id || "");
      setReferenceId((current) => nextImports.some((item) => item.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || "");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadSummaries(), 0); return () => window.clearTimeout(timer); }, [loadSummaries]);

  useEffect(() => {
    const ids = Array.from(new Set([referenceId, recentId].filter(Boolean))).filter((id) => !loadedImports[id]);
    if (!ids.length) return;
    let cancelled = false;
    Promise.all(ids.map(async (id) => {
      const response = await fetch(`/api/upcoming-session-imports?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await response.json() as { import?: UpcomingSessionImport; error?: string; detail?: string };
      if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Import indisponible");
      return data.import;
    })).then((items) => {
      if (!cancelled) setLoadedImports((current) => ({ ...current, ...Object.fromEntries(items.map((item) => [item.id, item])) }));
    }).catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Chargement des fichiers impossible"); });
    return () => { cancelled = true; };
  }, [loadedImports, recentId, referenceId]);

  const reference = loadedImports[referenceId] ?? null;
  const recent = loadedImports[recentId] ?? null;
  const dates = useMemo(() => Array.from(new Set([...(reference?.staffingSessions ?? []), ...(recent?.staffingSessions ?? [])].map((row) => row.date).filter(Boolean))).sort(), [recent, reference]);
  const activeStartDate = dates.includes(startDate) ? startDate : dates[0] || "";
  const activeEndDate = dates.includes(endDate) ? endDate : dates.at(-1) || activeStartDate;
  const schoolByName = useMemo(() => new Map(schools.map((school) => [normalize(school.name), school])), [schools]);
  const schoolFor = useCallback((session: UpcomingStaffingSession) => schools.find((school) => session.schoolId && school.externalId === session.schoolId) || schoolByName.get(normalize(session.school)), [schoolByName, schools]);
  const ownerFor = useCallback((session: UpcomingStaffingSession): Owner => schoolFor(session)?.portfolioOwner || "", [schoolFor]);
  const hasComparableSnapshots = Boolean(reference?.staffingSessions.length && recent?.staffingSessions.length);

  const changes = useMemo(() => {
    if (!reference || !recent) return [];
    const inRange = (date: string) => (!activeStartDate || date >= activeStartDate) && (!activeEndDate || date <= activeEndDate);
    const beforeSessions = new Map(reference.staffingSessions.filter((item) => inRange(item.date)).map((item) => [item.sessionId, item]));
    const afterSessions = new Map(recent.staffingSessions.filter((item) => inRange(item.date)).map((item) => [item.sessionId, item]));
    const items: SessionChange[] = [];
    new Set([...beforeSessions.keys(), ...afterSessions.keys()]).forEach((sessionId) => {
      const beforeSession = beforeSessions.get(sessionId);
      const afterSession = afterSessions.get(sessionId);
      if (beforeSession && !afterSession) {
        items.push({ kind: "disappeared", session: beforeSession, before: beforeSession.tutors, after: [], beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: 0 });
        return;
      }
      if (!beforeSession && afterSession) {
        items.push({ kind: "appeared", session: afterSession, before: [], after: afterSession.tutors, beforeSourceRowCount: 0, afterSourceRowCount: afterSession.sourceRowCount });
        return;
      }
      if (!beforeSession || !afterSession) return;
      const beforeIds = new Set(beforeSession.tutors.map((item) => item.tutorId));
      const afterIds = new Set(afterSession.tutors.map((item) => item.tutorId));
      const added = afterSession.tutors.filter((item) => !beforeIds.has(item.tutorId));
      const removed = beforeSession.tutors.filter((item) => !afterIds.has(item.tutorId));
      if (added.length && removed.length) items.push({ kind: "replacements", session: afterSession, before: removed, after: added, beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
      else {
        if (added.length) items.push({ kind: "additions", session: afterSession, before: [], after: added, beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
        if (removed.length) items.push({ kind: "removals", session: beforeSession, before: removed, after: [], beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
      }
    });
    return items.sort((a, b) => `${a.session.date} ${a.session.startTime} ${a.session.school}`.localeCompare(`${b.session.date} ${b.session.startTime} ${b.session.school}`, "fr"));
  }, [activeEndDate, activeStartDate, recent, reference]);

  const searchFilteredChanges = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return changes;
    return changes.filter((item) => normalize(`${item.session.sessionId} ${item.session.school} ${item.session.category} ${timeSlot(item.session)} ${item.before.map(tutorName).join(" ")} ${item.after.map(tutorName).join(" ")}`).includes(normalizedQuery));
  }, [changes, query]);

  const countsByOwner = useMemo(() => (["kelly", "pierre", "julie", ""] as Owner[]).map((owner) => ({
    owner,
    replacements: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "replacements").length,
    additions: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "additions").length,
    removals: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "removals").length,
    appeared: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "appeared").length,
    disappeared: searchFilteredChanges.filter((item) => ownerFor(item.session) === owner && item.kind === "disappeared").length,
  })), [ownerFor, searchFilteredChanges]);

  const filtered = useMemo(() => {
    return searchFilteredChanges.filter((item) => {
      const owner = ownerFor(item.session);
      const ownerMatches = ownerFilter === "all" || (ownerFilter === "unassigned" ? !owner : owner === ownerFilter);
      const kindMatches = kindFilter === "all" || item.kind === kindFilter;
      return ownerMatches && kindMatches;
    });
  }, [kindFilter, ownerFilter, ownerFor, searchFilteredChanges]);

  async function upload(file?: File) {
    if (!file) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/upcoming-session-imports?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: await file.text() });
      const data = await response.json() as { import?: UpcomingSessionImport; error?: string; detail?: string };
      if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Import impossible");
      setLoadedImports((current) => ({ ...current, [data.import!.id]: data.import! }));
      setReferenceId(recentId || data.import.id);
      setRecentId(data.import.id);
      await loadSummaries();
      setMessage("Export Semaines à venir enregistré et prêt à comparer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import impossible");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const rows = [["Évolution", "ID séance", "Date", "Horaire", "Établissement", "ID établissement", "Responsable RH", "Catégorie", "Lignes avant", "Lignes après", "Tuteurs avant", "Tuteurs après"], ...filtered.map((item) => [
      kindLabels[item.kind], item.session.sessionId, item.session.date, timeSlot(item.session), item.session.school, item.session.schoolId, ownerLabels[ownerFor(item.session)], item.session.category,
      item.beforeSourceRowCount, item.afterSourceRowCount, item.before.map((row) => `${tutorName(row)} (#${row.tutorId})`).join(" | "), item.after.map((row) => `${tutorName(row)} (#${row.tutorId})`).join(" | "),
    ])];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `evolution-staffing-${activeStartDate || "debut"}-${activeEndDate || "fin"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalScope = ownerFilter === "all" ? searchFilteredChanges : searchFilteredChanges.filter((item) => ownerFilter === "unassigned" ? !ownerFor(item.session) : ownerFor(item.session) === ownerFilter);
  const totals = (Object.keys(kindLabels) as ChangeKind[]).map((kind) => ({ kind, count: totalScope.filter((item) => item.kind === kind).length }));

  return <section className="task-panel staffing-evolution">
    <div className="panel-heading">
      <div><p className="eyebrow">Comparaison des exports Semaines à venir</p><h2>Évolution staffing</h2><p>Comparez les tuteurs réellement affectés à chaque session entre deux exports successifs.</p></div>
      <div className="filters"><label className="import-button">Importer Semaines à venir<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label><button type="button" className="button quiet" onClick={() => void loadSummaries()} disabled={loading}>↻ Actualiser</button></div>
    </div>
    {message ? <p className="enrollment-message">{message}</p> : null}
    <div className="staffing-evolution-controls">
      <label>Export de référence<select value={referenceId} onChange={(event) => setReferenceId(event.target.value)}>{imports.map((item) => <option value={item.id} key={item.id}>{importLabel(item)}</option>)}</select></label>
      <span aria-hidden="true">→</span>
      <label>Export récent<select value={recentId} onChange={(event) => setRecentId(event.target.value)}>{imports.map((item) => <option value={item.id} key={item.id}>{importLabel(item)}</option>)}</select></label>
      <label>Du<select value={activeStartDate} onChange={(event) => { const next = event.target.value; setStartDate(next); if (activeEndDate && next > activeEndDate) setEndDate(next); }}>{dates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
      <label>Au<select value={activeEndDate} onChange={(event) => { const next = event.target.value; setEndDate(next); if (activeStartDate && next < activeStartDate) setStartDate(next); }}>{dates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
      <label>Recherche<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, établissement ou tuteur…" /></label>
    </div>
    <p className="staffing-comparison-note">Les sessions sont rapprochées prioritairement par leur ID séance. Les groupes et élèves présents sur plusieurs lignes ne créent pas de doublons.</p>
    {reference && recent && !hasComparableSnapshots ? <div className="staffing-evolution-legacy-warning"><strong>Ces anciens imports ne contiennent pas le détail des tuteurs staffés.</strong><span>Réimportez les deux exports « Semaines à venir » dans cet onglet pour obtenir une comparaison complète.</span></div> : null}
    <div className="staffing-evolution-totals">{totals.map((item) => <button type="button" className={`${item.kind} ${kindFilter === item.kind ? "active" : ""}`} onClick={() => setKindFilter((current) => current === item.kind ? "all" : item.kind)} key={item.kind}><span>{kindLabels[item.kind]}</span><strong>{item.count}</strong></button>)}</div>
    <div className="staffing-evolution-owner-table">
      <div className="head"><span>Responsable RH</span><span>Nouveaux tuteurs</span><span>Changements</span><span>Tuteurs retirés</span><span>Sessions apparues</span><span>Sessions disparues</span></div>
      {countsByOwner.map((row) => <button type="button" className={(ownerFilter === "unassigned" ? !row.owner : ownerFilter === row.owner) ? "active" : ""} onClick={() => setOwnerFilter((current) => current === (row.owner || "unassigned") ? "all" : row.owner || "unassigned")} key={row.owner || "unassigned"}><strong>{ownerLabels[row.owner]}</strong><span>{row.additions}</span><span>{row.replacements}</span><span>{row.removals}</span><span>{row.appeared}</span><span>{row.disappeared}</span></button>)}
    </div>
    <div className="staffing-evolution-list-heading"><div><strong>{filtered.length} évolution{filtered.length > 1 ? "s" : ""}</strong><span>{activeStartDate && activeEndDate ? `Du ${fullDate(activeStartDate)} au ${fullDate(activeEndDate)}` : "Toutes les dates des deux exports"}{ownerFilter !== "all" ? ` · ${ownerFilter === "unassigned" ? ownerLabels[""] : ownerLabels[ownerFilter]}` : ""}</span></div><button type="button" className="ghost-button" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button></div>
    {!reference || !recent ? <div className="empty-state compact">{imports.length < 2 ? "Importez au moins deux exports Semaines à venir pour commencer." : "Chargement des deux fichiers…"}</div> : !hasComparableSnapshots ? <div className="empty-state compact"><h3>Réimport nécessaire</h3><p>Les anciens imports restent disponibles pour les séances non affectées, mais ne contiennent pas les noms et ID des tuteurs staffés.</p></div> : filtered.length ? <div className="staffing-evolution-results">{filtered.map((item, index) => {
      const school = schoolFor(item.session);
      const renderTutors = (rows: UpcomingSessionTutor[]) => rows.length ? rows.map((row) => <span key={`${row.tutorId}-${row.phone}`}><PersonAdminLink personId={row.tutorId} status="tutor">{tutorName(row)}</PersonAdminLink><small>#{row.tutorId}{row.phone ? ` · ${row.phone}` : ""}</small></span>) : <em>Aucun tuteur</em>;
      return <article className={`staffing-evolution-card ${item.kind}`} key={`${item.kind}-${item.session.sessionId}-${index}`}>
        <div className="staffing-evolution-session"><span>{fullDate(item.session.date)} · {timeSlot(item.session)} · #{item.session.sessionId}</span><strong><SchoolAdminLink schoolId={item.session.schoolId || school?.externalId}>{item.session.school || "Établissement non précisé"}</SchoolAdminLink></strong><small>{item.session.category || "Catégorie non précisée"} · RH : {ownerLabels[ownerFor(item.session)]}</small><small className="staffing-evolution-row-count">Lignes : avant {item.beforeSourceRowCount || "—"} · après {item.afterSourceRowCount || "—"}</small></div>
        <div className="staffing-evolution-kind"><span>{kindLabels[item.kind]}</span></div>
        <div className="staffing-evolution-before"><b>Avant</b>{renderTutors(item.before)}</div>
        <div className="staffing-evolution-after"><b>Après</b>{renderTutors(item.after)}</div>
      </article>;
    })}</div> : <div className="empty-state compact"><span>✓</span><h3>Aucune évolution détectée</h3><p>Les deux exports sont identiques pour les filtres sélectionnés.</p></div>}
  </section>;
}

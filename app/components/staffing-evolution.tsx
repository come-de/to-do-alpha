"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PersonAdminLink from "@/app/components/person-admin-link";
import SchoolAdminLink from "@/app/components/school-admin-link";
import type { TutorTrackingRecord, UpcomingSessionImport, UpcomingSessionTutor, UpcomingStaffingSession } from "@/app/lib/shared-data";

type Owner = "" | "kelly" | "pierre" | "julie";
type OwnerFilter = "all" | "unassigned" | Exclude<Owner, "">;
type ChangeKind = "replacements" | "additions" | "removals" | "appeared" | "disappeared" | "unstaffed";
type SchoolRecord = { externalId: string; name: string; portfolioOwner: Owner };
type ComparableSession = UpcomingStaffingSession & { portfolioOwner?: Owner; staffingStatus?: string; treated?: boolean };
type SessionChange = { kind: ChangeKind; session: ComparableSession; before: UpcomingSessionTutor[]; after: UpcomingSessionTutor[]; beforeSourceRowCount: number; afterSourceRowCount: number; portfolioOwner?: Owner };
type AuditSession = { sessionId: string; date: string; school: string; schoolId: string; category: string; sourceRowCount: number | null; portfolioOwner: Owner; detectedStatus: string; resolution: string; treated: boolean; tutors: { tutorId: string; name: string; phone: string }[] };
type AuditDay = { date: string; updatedAt: string; sessions: AuditSession[] };

const ownerLabels: Record<Owner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };
const kindLabels: Record<ChangeKind, string> = {
  replacements: "Tuteur changé",
  additions: "Nouveau tuteur affecté",
  removals: "Tuteur retiré",
  appeared: "Session apparue",
  disappeared: "Session disparue",
  unstaffed: "Séance non staffée",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}


function phoneKey(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("33") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

function reportDate(value: string) {
  const cleaned = value.trim();
  const iso = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const french = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  if (french) return `${french[3]}-${french[2].padStart(2, "0")}-${french[1].padStart(2, "0")}`;
  return "";
}

function parseReportCsv(value: string, tutorRecords: TutorTrackingRecord[]) {
  value = value.replace(/^\uFEFF/, "");
  const firstLine = value.split(/\r?\n/, 1)[0] || "";
  const delimiter = [";", ",", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '"') {
      if (quoted && value[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && value[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some((part) => part.trim())) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); if (row.some((part) => part.trim())) rows.push(row); }
  if (rows.length < 2) return { sessions: [] as UpcomingStaffingSession[], rowCount: 0, invalidRows: 0, unmatchedTutorCount: 0 };
  const normalizeHeader = (header: string) => normalize(header).replace(/ /g, "");
  const headers = rows[0].map(normalizeHeader);
  const column = (name: string) => headers.indexOf(normalizeHeader(name));
  const columns = { date: column("Date"), firstName: column("Prénom tuteur"), lastName: column("Nom tuteur"), phone: column("Numéro tuteur"), sessionId: column("Semaine réelle"), school: column("Etablissement") };
  if (Object.values(columns).some((index) => index < 0)) return { sessions: [] as UpcomingStaffingSession[], rowCount: 0, invalidRows: rows.length - 1, unmatchedTutorCount: 0 };
  const tutorCandidatesByPhone = new Map<string, Map<string, TutorTrackingRecord>>();
  tutorRecords.forEach((record) => { const key = phoneKey(record.phone); if (!key || !record.tutorId) return; const candidates = tutorCandidatesByPhone.get(key) ?? new Map<string, TutorTrackingRecord>(); candidates.set(record.tutorId, record); tutorCandidatesByPhone.set(key, candidates); });
  const tutorByPhone = new Map<string, TutorTrackingRecord>();
  tutorCandidatesByPhone.forEach((candidates, key) => { if (candidates.size === 1) tutorByPhone.set(key, candidates.values().next().value as TutorTrackingRecord); });
  const sessions = new Map<string, { sessionId: string; date: string; school: string; sourceRowCount: number; tutors: Map<string, UpcomingSessionTutor> }>();
  let invalidRows = 0;
  let unmatchedTutorCount = 0;
  rows.slice(1).forEach((cells, rowIndex) => {
    const get = (index: number) => (cells[index] ?? "").trim();
    const date = reportDate(get(columns.date));
    const sessionId = get(columns.sessionId);
    if (!date || !sessionId) { invalidRows += 1; return; }
    const key = `${date}::${sessionId}`;
    const item = sessions.get(key) ?? { sessionId, date, school: get(columns.school), sourceRowCount: 0, tutors: new Map<string, UpcomingSessionTutor>() };
    item.sourceRowCount += 1;
    const phone = get(columns.phone);
    const firstName = get(columns.firstName);
    const lastName = get(columns.lastName);
    if (phone || firstName || lastName) {
      const tutor = tutorByPhone.get(phoneKey(phone));
      const unmatchedKey = phoneKey(phone) || normalize(`${firstName} ${lastName}`) || `ligne-${rowIndex}`;
      const tutorId = tutor?.tutorId || `inconnu-${unmatchedKey}`;
      if (!tutor) unmatchedTutorCount += 1;
      item.tutors.set(tutorId, { tutorId, firstName: tutor?.firstName || firstName, lastName: tutor?.lastName || lastName, phone });
    }
    if (!item.school) item.school = get(columns.school);
    sessions.set(key, item);
  });
  return {
    sessions: Array.from(sessions.values()).map((item) => ({ sessionId: item.sessionId, sourceRowCount: item.sourceRowCount, schoolId: "", school: item.school, category: "", date: item.date, startTime: "", endTime: "", group: "", tutors: Array.from(item.tutors.values()) })),
    rowCount: rows.length - 1,
    invalidRows,
    unmatchedTutorCount,
  };
}

function sessionKey(session: ComparableSession) {
  return `${session.date}::${session.sessionId}`;
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
  const [actualReportCsv, setActualReportCsv] = useState("");
  const [actualReportFileName, setActualReportFileName] = useState("");
  const [tutorRecords, setTutorRecords] = useState<TutorTrackingRecord[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [staffingAuditDays, setStaffingAuditDays] = useState<AuditDay[]>([]);
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
      const [importsResponse, schoolsResponse, auditsResponse] = await Promise.all([
        fetch("/api/upcoming-session-imports?summary=1", { cache: "no-store" }),
        fetch("/api/schools", { cache: "no-store" }),
        fetch("/api/staffing-audits", { cache: "no-store" }),
      ]);
      const importsData = await importsResponse.json() as { imports?: UpcomingSessionImport[]; error?: string; detail?: string };
      const schoolsData = await schoolsResponse.json() as { schools?: SchoolRecord[]; error?: string; detail?: string };
      const auditsData = auditsResponse.ok ? await auditsResponse.json() as { days?: AuditDay[] } : { days: [] };
      if (!importsResponse.ok) throw new Error(importsData.detail || importsData.error || "Imports indisponibles");
      if (!schoolsResponse.ok) throw new Error(schoolsData.detail || schoolsData.error || "Établissements indisponibles");
      const nextImports = (importsData.imports ?? []).sort((a, b) => timestamp(b.importedAt) - timestamp(a.importedAt));
      setImports(nextImports);
      setSchools(schoolsData.schools ?? []);
      setStaffingAuditDays(auditsData.days ?? []);
      setRecentId((current) => current === "staffing-audits" && auditsData.days?.length ? current : nextImports.some((item) => item.id === current) ? current : nextImports[0]?.id || (auditsData.days?.length ? "staffing-audits" : ""));
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
    let cancelled = false;
    void fetch("/api/tutor-tracking", { cache: "no-store" }).then(async (response) => response.ok ? await response.json() as { tracking?: { snapshots?: { records?: TutorTrackingRecord[] }[] } } : null).then((data) => {
      if (!cancelled) setTutorRecords(data?.tracking?.snapshots?.flatMap((snapshot) => snapshot.records ?? []) ?? []);
    }).catch(() => { if (!cancelled) setTutorRecords([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ids = Array.from(new Set([referenceId, recentId].filter((id) => Boolean(id) && id !== "staffing-audits"))).filter((id) => !loadedImports[id]);
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

  const reportData = useMemo(() => actualReportCsv ? parseReportCsv(actualReportCsv, tutorRecords) : null, [actualReportCsv, tutorRecords]);
  const reference = loadedImports[referenceId] ?? null;
  const actualReports = useMemo<UpcomingSessionImport | null>(() => {
    if (!reportData) return null;
    const plannedByKey = new Map<string, ComparableSession>();
    (reference?.staffingSessions ?? []).forEach((session) => plannedByKey.set(sessionKey(session), session));
    const staffingSessions = reportData.sessions.map((session) => {
      const planned = plannedByKey.get(sessionKey(session));
      return { ...session, schoolId: planned?.schoolId || "", category: planned?.category || "", startTime: planned?.startTime || "", endTime: planned?.endTime || "", group: planned?.group || "" };
    });
    return { id: "actual-reports", importedAt: new Date().toISOString(), displayName: actualReportFileName || "Rapports réels", fileName: actualReportFileName || "rapports.csv", sourceRowCount: reportData.rowCount, sourceSessionCount: staffingSessions.length, schools: [], schoolStaffing: [], staffingSessions, rows: [], createdAt: new Date().toISOString() };
  }, [actualReportFileName, reference, reportData]);
  const auditSnapshot = useMemo<UpcomingSessionImport | null>(() => {
    const staffingSessions = staffingAuditDays.flatMap((day) => day.sessions.map((session): ComparableSession => ({
      sessionId: session.sessionId, sourceRowCount: session.sourceRowCount ?? 0, schoolId: session.schoolId, school: session.school,
      category: session.category, date: session.date || day.date, startTime: "", endTime: "", group: "",
      portfolioOwner: session.portfolioOwner, staffingStatus: session.resolution || session.detectedStatus, treated: session.treated,
      tutors: session.tutors.map((tutor) => ({ tutorId: tutor.tutorId, firstName: tutor.name, lastName: "", phone: tutor.phone })),
    })));
    if (!staffingSessions.length) return null;
    const lastUpdated = staffingAuditDays.map((day) => day.updatedAt).sort().at(-1) || new Date().toISOString();
    return { id: "staffing-audits", importedAt: lastUpdated, displayName: "Bilans staffing enregistrés", fileName: "bilans-staffing", sourceRowCount: staffingAuditDays.reduce((sum, day) => sum + day.sessions.reduce((daySum, session) => daySum + (session.sourceRowCount ?? 0), 0), 0), sourceSessionCount: staffingSessions.length, schools: [], schoolStaffing: [], staffingSessions, rows: [], createdAt: lastUpdated };
  }, [staffingAuditDays]);
  const auditComparison = recentId === "staffing-audits";
  const recent = auditComparison ? auditSnapshot : actualReports ?? loadedImports[recentId] ?? null;
  const dates = useMemo(() => {
    const referenceDates = reference?.staffingSessions.map((row) => row.date) ?? [];
    const resultDates = recent?.staffingSessions.map((row) => row.date) ?? [];
    const values = actualReports && !auditComparison ? referenceDates.filter((date) => resultDates.includes(date)) : [...referenceDates, ...resultDates];
    return [...new Set(values.filter(Boolean))].sort();
  }, [actualReports, auditComparison, recent, reference]);
  const activeStartDate = dates.includes(startDate) ? startDate : dates[0] || "";
  const activeEndDate = dates.includes(endDate) ? endDate : dates.at(-1) || activeStartDate;
  const schoolByName = useMemo(() => new Map(schools.map((school) => [normalize(school.name), school])), [schools]);
  const schoolFor = useCallback((session: UpcomingStaffingSession) => {
    const byId = schools.find((school) => session.schoolId && school.externalId === session.schoolId);
    if (byId) return byId;
    const names = [session.school, ...session.school.split(" - ")].map(normalize);
    return schools.find((school) => names.includes(normalize(school.name))) || schoolByName.get(normalize(session.school));
  }, [schoolByName, schools]);
  const ownerFor = useCallback((session: ComparableSession): Owner => session.portfolioOwner ?? schoolFor(session)?.portfolioOwner ?? "", [schoolFor]);
  const hasComparableSnapshots = Boolean(reference?.staffingSessions.length && recent?.staffingSessions.length);
  const changeOwnerFor = useCallback((item: SessionChange): Owner => item.portfolioOwner ?? ownerFor(item.session), [ownerFor]);

  const changes = useMemo(() => {
    if (!reference || !recent || (actualReports && !auditComparison && !dates.length)) return [];
    const inRange = (date: string) => (!activeStartDate || date >= activeStartDate) && (!activeEndDate || date <= activeEndDate);
    const beforeSessions = new Map<string, UpcomingStaffingSession>();
    reference.staffingSessions.filter((item) => inRange(item.date)).forEach((item) => beforeSessions.set(sessionKey(item), item));
    const afterSessions = new Map<string, UpcomingStaffingSession>();
    recent.staffingSessions.filter((item) => inRange(item.date)).forEach((item) => afterSessions.set(sessionKey(item), item));
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
      const knownTutor = (item: UpcomingSessionTutor) => item.tutorId && !item.tutorId.startsWith("inconnu-");
      const beforeIds = new Set(beforeSession.tutors.filter(knownTutor).map((item) => item.tutorId));
      const afterIds = new Set(afterSession.tutors.filter(knownTutor).map((item) => item.tutorId));
      const added = afterSession.tutors.filter((item) => knownTutor(item) && !beforeIds.has(item.tutorId));
      const removed = beforeSession.tutors.filter((item) => knownTutor(item) && !afterIds.has(item.tutorId));
      if (added.length && removed.length) items.push({ kind: "replacements", session: afterSession, before: removed, after: added, beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
      else {
        if (added.length) items.push({ kind: "additions", session: afterSession, before: [], after: added, beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
        if (removed.length) items.push({ kind: "removals", session: beforeSession, before: removed, after: [], beforeSourceRowCount: beforeSession.sourceRowCount, afterSourceRowCount: afterSession.sourceRowCount });
      }
    });
    return items.sort((a, b) => `${a.session.date} ${a.session.startTime} ${a.session.school}`.localeCompare(`${b.session.date} ${b.session.startTime} ${b.session.school}`, "fr"));
  }, [activeEndDate, activeStartDate, actualReports, auditComparison, dates, recent, reference]);

  const recentSessionsInRange = useMemo(() => {
    const inRange = (date: string) => (!activeStartDate || date >= activeStartDate) && (!activeEndDate || date <= activeEndDate);
    return (recent?.staffingSessions ?? []).filter((session) => inRange(session.date));
  }, [activeEndDate, activeStartDate, recent]);

  const isUnstaffedSession = useCallback((session: ComparableSession) => session.staffingStatus ? session.staffingStatus === "unstaffed" && !session.treated : session.tutors.length === 0, []);
  const metricSessions = useMemo(() => recentSessionsInRange.map((session) => ({ owner: ownerFor(session), unstaffed: isUnstaffedSession(session) })), [isUnstaffedSession, ownerFor, recentSessionsInRange]);
  const unstaffedChanges = useMemo<SessionChange[]>(() => recentSessionsInRange.filter(isUnstaffedSession).map((session) => ({ kind: "unstaffed" as const, session, before: [], after: [], beforeSourceRowCount: 0, afterSourceRowCount: session.sourceRowCount, portfolioOwner: ownerFor(session) })).sort((a, b) => `${a.session.date} ${a.session.school}`.localeCompare(`${b.session.date} ${b.session.school}`, "fr")), [isUnstaffedSession, ownerFor, recentSessionsInRange]);
  const searchFilteredChanges = useMemo(() => {
    const allChanges = [...changes, ...unstaffedChanges];
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return allChanges;
    return allChanges.filter((item) => normalize(`${kindLabels[item.kind]} ${item.session.sessionId} ${item.session.school} ${item.session.category} ${timeSlot(item.session)} ${item.before.map(tutorName).join(" ")} ${item.after.map(tutorName).join(" ")}`).includes(normalizedQuery));
  }, [changes, query, unstaffedChanges]);

  const countsByOwner = useMemo(() => (["kelly", "pierre", "julie", ""] as Owner[]).map((owner) => {
    const ownerSessions = metricSessions.filter((session) => session.owner === owner);
    return {
      owner,
      replacements: searchFilteredChanges.filter((item) => changeOwnerFor(item) === owner && item.kind === "replacements").length,
      additions: searchFilteredChanges.filter((item) => changeOwnerFor(item) === owner && item.kind === "additions").length,
      removals: searchFilteredChanges.filter((item) => changeOwnerFor(item) === owner && item.kind === "removals").length,
      appeared: searchFilteredChanges.filter((item) => changeOwnerFor(item) === owner && item.kind === "appeared").length,
      disappeared: searchFilteredChanges.filter((item) => changeOwnerFor(item) === owner && item.kind === "disappeared").length,
      totalSessions: ownerSessions.length,
      unstaffedSessions: ownerSessions.filter((session) => session.unstaffed).length,
    };
  }), [changeOwnerFor, metricSessions, searchFilteredChanges]);

  const filtered = useMemo(() => {
    return searchFilteredChanges.filter((item) => {
      const owner = changeOwnerFor(item);
      const ownerMatches = ownerFilter === "all" || (ownerFilter === "unassigned" ? !owner : owner === ownerFilter);
      const kindMatches = kindFilter === "all" || item.kind === kindFilter;
      return ownerMatches && kindMatches;
    });
  }, [changeOwnerFor, kindFilter, ownerFilter, searchFilteredChanges]);

  async function uploadReport(file?: File) {
    if (!file) return;
    setSaving(true);
    try {
      const text = await file.text();
      const parsed = parseReportCsv(text, tutorRecords);
      if (!parsed.sessions.length) throw new Error("Aucune séance reconnue. Vérifiez les colonnes Date, Semaine réelle, Numéro tuteur et Etablissement.");
      setActualReportCsv(text);
      setActualReportFileName(file.name);
      if (recentId) setReferenceId(recentId);
      setMessage(`${parsed.sessions.length} groupes réels sur ${new Set(parsed.sessions.map((session) => session.date)).size} dates chargés${parsed.unmatchedTutorCount ? ` · ${parsed.unmatchedTutorCount} ligne(s) tuteur non rapprochée(s) par téléphone` : ""}${parsed.invalidRows ? ` · ${parsed.invalidRows} ligne(s) ignorée(s)` : ""}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import des rapports impossible");
    } finally {
      setSaving(false);
    }
  }

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
      kindLabels[item.kind], item.session.sessionId, item.session.date, timeSlot(item.session), item.session.school, item.session.schoolId, ownerLabels[changeOwnerFor(item)], item.session.category,
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

  const totalScope = ownerFilter === "all" ? searchFilteredChanges : searchFilteredChanges.filter((item) => ownerFilter === "unassigned" ? !changeOwnerFor(item) : changeOwnerFor(item) === ownerFilter);
  const totals = (Object.keys(kindLabels) as ChangeKind[]).map((kind) => ({ kind, count: totalScope.filter((item) => item.kind === kind).length }));
  const groupedFilteredChanges = (Object.keys(kindLabels) as ChangeKind[]).map((kind) => ({ kind, items: filtered.filter((item) => item.kind === kind) })).filter((group) => group.items.length);

  return <section className="task-panel staffing-evolution">
    <div className="panel-heading">
      <div><p className="eyebrow">Comparaison staffing</p><h2>Évolution staffing</h2><p>Comparez deux semaines à venir enregistrées, ou une semaine avec les rapports déjà sauvegardés dans « Bilans staffing ».</p></div>
      <div className="filters"><label className="import-button">Importer Semaines à venir<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label><label className="import-button">Importer rapports réels<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void uploadReport(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>{actualReports ? <button type="button" className="button quiet" onClick={() => { setActualReportCsv(""); setActualReportFileName(""); setMessage(""); }}>Retirer rapports</button> : null}<button type="button" className="button quiet" onClick={() => void loadSummaries()} disabled={loading}>↻ Actualiser</button></div>
    </div>
    {message ? <p className="enrollment-message">{message}</p> : null}
    <div className="staffing-evolution-controls">
      <div className="staffing-evolution-source-cards">
        <label className="staffing-evolution-source-card reference"><span>1. Point de départ</span><strong>Semaine à venir</strong><select value={referenceId} onChange={(event) => setReferenceId(event.target.value)}>{imports.map((item) => <option value={item.id} key={item.id}>{importLabel(item)}</option>)}</select><small>Prévision à comparer</small></label>
        <span className="staffing-evolution-source-arrow" aria-hidden="true">→</span>
        {actualReports ? <label className="staffing-evolution-source-card report"><span>2. Résultat réel</span><strong>Rapport importé</strong><input value={actualReportFileName} readOnly /><small>Fichier chargé dans cette page</small></label> : <label className={`staffing-evolution-source-card ${auditComparison ? "report selected" : "upcoming"}`}><span>2. Comparer avec</span><strong>{auditComparison ? "Rapport enregistré · Bilans staffing" : "Semaine à venir"}</strong><select value={recentId} onChange={(event) => setRecentId(event.target.value)}><optgroup label="Semaines à venir enregistrées">{imports.map((item) => <option value={item.id} key={item.id}>{importLabel(item)}</option>)}</optgroup><optgroup label="Rapports de staffing déjà enregistrés"><option value="staffing-audits" disabled={!auditSnapshot}>Rapports enregistrés · Bilans staffing ({staffingAuditDays.length} jours)</option></optgroup></select><small>{auditComparison ? `${staffingAuditDays.length} journées de rapports disponibles` : "Deuxième prévision à comparer"}</small></label>}
      </div>
      <div className="staffing-evolution-filter-controls">
        <label>Du<select value={activeStartDate} onChange={(event) => { const next = event.target.value; setStartDate(next); if (activeEndDate && next > activeEndDate) setEndDate(next); }}>{dates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
        <label>Au<select value={activeEndDate} onChange={(event) => { const next = event.target.value; setEndDate(next); if (activeStartDate && next < activeStartDate) setStartDate(next); }}>{dates.map((date) => <option key={date} value={date}>{fullDate(date)}</option>)}</select></label>
        <label>Recherche<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, établissement ou tuteur…" /></label>
      </div>
    </div>
    <p className="staffing-comparison-note">{auditComparison ? "Comparaison avec les bilans déjà enregistrés. Les séances sont rapprochées par ID de séance / Semaine réelle et les tuteurs par leur ID. Les dates des deux sources sont réunies pour montrer les séances présentes dans une seule source." : "Les séances sont rapprochées prioritairement par leur ID séance. Les groupes et élèves présents sur plusieurs lignes ne créent pas de doublons. Choisissez « Rapports enregistrés · Bilans staffing » pour comparer avec les données déjà saisies dans l’autre onglet."}</p>
    {reference && recent && !hasComparableSnapshots ? <div className="staffing-evolution-legacy-warning"><strong>Ces anciens imports ne contiennent pas le détail des tuteurs staffés.</strong><span>Réimportez les deux exports « Semaines à venir » dans cet onglet pour obtenir une comparaison complète.</span></div> : null}
    <div className="staffing-evolution-totals">{totals.map((item) => <button type="button" className={`${item.kind} ${kindFilter === item.kind ? "active" : ""}`} onClick={() => setKindFilter((current) => current === item.kind ? "all" : item.kind)} key={item.kind}><span>{kindLabels[item.kind]}</span><strong>{item.count}</strong></button>)}</div>
    <div className="staffing-evolution-owner-table">
      <div className="head"><span>Responsable RH</span><span>Sessions totales<br />({auditComparison ? "bilan" : "source récente"})</span><span>Non staffées<br />({auditComparison ? "bilan" : "source récente"})</span><span>Nouveaux tuteurs</span><span>Changements</span><span>Tuteurs retirés</span><span>Sessions apparues</span><span>Sessions disparues</span></div>
      {countsByOwner.map((row) => <button type="button" className={(ownerFilter === "unassigned" ? !row.owner : ownerFilter === row.owner) ? "active" : ""} onClick={() => setOwnerFilter((current) => current === (row.owner || "unassigned") ? "all" : row.owner || "unassigned")} key={row.owner || "unassigned"}><strong>{ownerLabels[row.owner]}</strong><span>{row.totalSessions}</span><span>{row.unstaffedSessions}</span><span>{row.additions}</span><span>{row.replacements}</span><span>{row.removals}</span><span>{row.appeared}</span><span>{row.disappeared}</span></button>)}
    </div>
    <div className="staffing-evolution-list-heading"><div><strong>{filtered.length} évolution{filtered.length > 1 ? "s" : ""}</strong><span>{activeStartDate && activeEndDate ? `Du ${fullDate(activeStartDate)} au ${fullDate(activeEndDate)}` : "Toutes les dates des deux exports"}{ownerFilter !== "all" ? ` · ${ownerFilter === "unassigned" ? ownerLabels[""] : ownerLabels[ownerFilter]}` : ""}</span></div><button type="button" className="ghost-button" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button></div>
    {!reference || !recent ? <div className="empty-state compact">{!reference ? "Importez un export Semaines à venir comme référence." : imports.length < 2 && !actualReports ? "Importez un second export ou un fichier de rapports réels pour commencer." : "Chargement des fichiers…"}</div> : !hasComparableSnapshots ? <div className="empty-state compact"><h3>Réimport nécessaire</h3><p>Les anciens imports restent disponibles pour les séances non affectées, mais ne contiennent pas les noms et ID des tuteurs staffés.</p></div> : filtered.length ? <div className="staffing-evolution-results">{groupedFilteredChanges.map(({ kind, items }) => <section className="staffing-evolution-group" key={kind}><h3 className="staffing-evolution-group-heading">{kindLabels[kind]} <span>{items.length}</span></h3><div className="staffing-evolution-kind-items">{items.map((item, index) => {
      const school = schoolFor(item.session);
      const renderTutors = (rows: UpcomingSessionTutor[]) => rows.length ? rows.map((row) => <span key={`${row.tutorId}-${row.phone}`}>{row.tutorId.startsWith("inconnu-") ? tutorName(row) : <PersonAdminLink personId={row.tutorId} status="tutor">{tutorName(row)}</PersonAdminLink>}<small>{row.tutorId.startsWith("inconnu-") ? "ID non rapproché" : `#${row.tutorId}`}{row.phone ? ` · ${row.phone}` : ""}</small></span>) : <em>Aucun tuteur</em>;
      return <article className={`staffing-evolution-card ${item.kind}`} key={`${item.kind}-${item.session.sessionId}-${index}`}>
        <div className="staffing-evolution-session"><span>{fullDate(item.session.date)} · {timeSlot(item.session)} · #{item.session.sessionId}</span><strong><SchoolAdminLink schoolId={item.session.schoolId || school?.externalId}>{item.session.school || "Établissement non précisé"}</SchoolAdminLink></strong><small>{item.session.category || "Catégorie non précisée"} · RH : {ownerLabels[changeOwnerFor(item)]}</small><small className="staffing-evolution-row-count">Lignes : avant {item.beforeSourceRowCount || "—"} · après {item.afterSourceRowCount || "—"}</small></div>
        <div className="staffing-evolution-kind"><span>{kindLabels[item.kind]}</span></div>
        <div className="staffing-evolution-before"><b>Avant</b>{renderTutors(item.before)}</div>
        <div className="staffing-evolution-after"><b>Après</b>{renderTutors(item.after)}</div>
      </article>;
    })}</div></section>)}</div> : <div className="empty-state compact"><span>✓</span><h3>Aucune évolution détectée</h3><p>Les deux exports sont identiques pour les filtres sélectionnés.</p></div>}
  </section>;
}

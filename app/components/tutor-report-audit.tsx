"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { School, TutorReportAuditDay, TutorReportAuditSchoolMapping, TutorReportComment } from "@/app/lib/shared-data";

type Props = { onError?: (message: string) => void };
type Payload = { days?: TutorReportAuditDay[]; schools?: School[]; mappings?: TutorReportAuditSchoolMapping; comments?: TutorReportComment[]; globalExcludedTutorKeys?: string[]; globalExcludedSchoolIds?: string[]; error?: string; detail?: string; importedDates?: string[]; invalidDateRowCount?: number; skippedNonAlphaRows?: number };
const number = new Intl.NumberFormat("fr-FR");
const percent = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const rhLabels: Record<string, string> = { kelly: "Kelly", julie: "Julie", pierre: "Pierre" };
const rhOrder = ["kelly", "julie", "pierre"];

async function readPayload(response: Response, operation: string): Promise<Payload> {
  const body = await response.text();
  try {
    return JSON.parse(body) as Payload;
  } catch {
    const status = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
    const reason = response.status === 413
      ? "Le fichier dépasse la limite acceptée par le serveur."
      : `Le serveur a renvoyé une réponse non JSON (${status}).`;
    throw new Error(`${operation} : ${reason} Réessayez, puis transmettez ce statut si le problème persiste.`);
  }
}

function dayLabel(value: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", options).format(date);
}

function schoolKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function alpha(school: School) {
  const value = `${school.category} ${school.schoolType}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  return value.includes("alpha") || value.includes("etude");
}

export default function TutorReportAudit({ onError }: Props) {
  const [days, setDays] = useState<TutorReportAuditDay[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [mappings, setMappings] = useState<TutorReportAuditSchoolMapping>({});
  const [comments, setComments] = useState<TutorReportComment[]>([]);
  const [globalExcludedTutorKeys, setGlobalExcludedTutorKeys] = useState<string[]>([]);
  const [globalExcludedSchoolIds, setGlobalExcludedSchoolIds] = useState<string[]>([]);
  const [showAllSchools, setShowAllSchools] = useState(false);
  const [allSchoolsQuery, setAllSchoolsQuery] = useState("");
  const [selectedSchoolDetailId, setSelectedSchoolDetailId] = useState("");
  const [showAllTutors, setShowAllTutors] = useState(false);
  const [allTutorsQuery, setAllTutorsQuery] = useState("");
  const [selectedTutorDetailKey, setSelectedTutorDetailKey] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTutorKey, setSelectedTutorKey] = useState("");
  const [selectedRH, setSelectedRH] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/tutor-report-audit", { cache: "no-store" });
    const data = await readPayload(response, "Chargement du suivi impossible");
    if (!response.ok) throw new Error(data.detail || data.error || "Chargement impossible");
    const nextDays = data.days || [];
    setDays(nextDays);
    setSchools(data.schools || []);
    setMappings(data.mappings || {});
    setComments(data.comments || []);
    setGlobalExcludedTutorKeys(data.globalExcludedTutorKeys || []);
    setGlobalExcludedSchoolIds(data.globalExcludedSchoolIds || []);
    setSelectedDate((current) => nextDays.some((day) => day.date === current) ? current : nextDays[0]?.date || "");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load().catch((error: unknown) => onError?.(error instanceof Error ? error.message : "Chargement impossible")); }, 0);
    return () => window.clearTimeout(timer);
  }, [load, onError]);
  useEffect(() => {
    if (!showAllTutors && !showAllSchools) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setShowAllTutors(false); setSelectedTutorDetailKey(""); setShowAllSchools(false); setSelectedSchoolDetailId(""); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showAllTutors, showAllSchools]);
  useEffect(() => {
    const refresh = () => { void load().catch((error: unknown) => onError?.(error instanceof Error ? error.message : "Chargement impossible")); };
    window.addEventListener("tutor-report-audit-refresh", refresh);
    return () => window.removeEventListener("tutor-report-audit-refresh", refresh);
  }, [load, onError]);

  const schoolById = useMemo(() => new Map(schools.flatMap((school) => [[school.id, school], ...(school.externalId ? [[school.externalId, school] as const] : [])])), [schools]);
  const mappingFor = useCallback((sourceName: string) => {
    const key = schoolKey(sourceName);
    const explicit = mappings[key];
    if (explicit === "excluded") return { school: null, excluded: true };
    const school = (explicit && schoolById.get(explicit)) || schools.find((item) => schoolKey(item.name) === key) || null;
    return { school, excluded: false };
  }, [mappings, schoolById, schools]);
  const filteredDays = useMemo(() => days.filter((day) => (!startDate || day.date >= startDate) && (!endDate || day.date <= endDate)).sort((a, b) => a.date.localeCompare(b.date)), [days, endDate, startDate]);
  const visibleSelectedDay = filteredDays.find((day) => day.date === selectedDate) || filteredDays[0] || null;
  const tutorOptions = useMemo(() => {
    const items = new Map<string, string>();
    days.forEach((day) => day.tutors.forEach((tutor) => items.set(tutor.key, tutor.name)));
    return Array.from(items.entries()).sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [days]);
  const viewStats = useMemo(() => {
    const tutors = new Map<string, { key: string; tutorId: string; name: string; expected: number; missing: number; completedReports: number; reportCharacters: number; schoolNames: string[] }>();
    const schoolsTotal = new Map<string, { name: string; expected: number; missing: number }>();
    const allSchoolsTotal = new Map<string, { name: string; expected: number; missing: number }>();
    const rhTotals = new Map<string, { expected: number; missing: number }>();
    const globallyExcludedTutors = new Set(globalExcludedTutorKeys);
    const globallyExcludedSchools = new Set(globalExcludedSchoolIds);
    const daily = filteredDays.map((day) => {
      let expected = 0; let missing = 0;
      for (const tutor of day.tutors) {
        if (selectedTutorKey && tutor.key !== selectedTutorKey) continue;
        const target = tutors.get(tutor.key) || { key: tutor.key, tutorId: tutor.tutorId, name: tutor.name, expected: 0, missing: 0, completedReports: 0, reportCharacters: 0, schoolNames: [] };
        tutors.set(tutor.key, target);
        if (day.excludedTutorKeys.includes(tutor.key)) continue;
        let tutorExpected = 0;
        for (const item of tutor.schools) {
          const result = mappingFor(item.sourceName);
          if (result.excluded || !result.school || !alpha(result.school)) continue;
          if (selectedSchoolId && result.school.id !== selectedSchoolId) continue;
          const owner = result.school.portfolioOwner || "";
          if (!globallyExcludedTutors.has(tutor.key) && !globallyExcludedSchools.has(result.school.id)) {
            const rhTotal = rhTotals.get(owner) || { expected: 0, missing: 0 };
            rhTotal.expected += item.expectedCount; rhTotal.missing += item.missingCount;
            rhTotals.set(owner, rhTotal);
          }
          if (selectedRH && owner !== selectedRH) continue;
          const completed = item.completedReportCount || 0;
          const characters = item.completedReportCharacterCount || 0;
          if (!globallyExcludedTutors.has(tutor.key)) {
            const schoolTotal = allSchoolsTotal.get(result.school.id) || { name: result.school.name, expected: 0, missing: 0 };
            schoolTotal.expected += item.expectedCount; schoolTotal.missing += item.missingCount;
            allSchoolsTotal.set(result.school.id, schoolTotal);
          }
          if (!globallyExcludedSchools.has(result.school.id)) {
            tutorExpected += item.expectedCount;
            target.expected += item.expectedCount; target.missing += item.missingCount;
            target.completedReports += completed; target.reportCharacters += characters;
            if (!target.schoolNames.includes(result.school.name)) target.schoolNames.push(result.school.name);
            if (!globallyExcludedTutors.has(tutor.key)) {
              expected += item.expectedCount; missing += item.missingCount;
              const all = schoolsTotal.get(result.school.id) || { name: result.school.name, expected: 0, missing: 0 };
              all.expected += item.expectedCount; all.missing += item.missingCount;
              schoolsTotal.set(result.school.id, all);
            }
          }
        }
        if (tutorExpected) tutors.set(tutor.key, target);
      }
      return { date: day.date, expected, missing, rate: expected ? (missing / expected) * 100 : 0 };
    });
    const expected = daily.reduce((sum, day) => sum + day.expected, 0);
    const missing = daily.reduce((sum, day) => sum + day.missing, 0);
    const allTutors = Array.from(tutors.values()).sort((a, b) => b.missing - a.missing || b.expected - a.expected || a.name.localeCompare(b.name, "fr"));
    const allSchools = Array.from(allSchoolsTotal.entries()).map(([id, item]) => ({ id, ...item, excluded: globallyExcludedSchools.has(id) })).sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name, "fr"));
    return {
      expected, missing, done: expected - missing, rate: expected ? (expected - missing) / expected * 100 : 0,
      tutors: allTutors.filter((tutor) => tutor.expected > 0),
      allTutors,
      schools: Array.from(schoolsTotal.entries()).map(([id, item]) => ({ id, ...item })).sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name, "fr")),
      allSchools,
      rhTotals: rhOrder.map((key) => ({ key, name: rhLabels[key], ...(rhTotals.get(key) || { expected: 0, missing: 0 }) })),
      worstDays: [...daily].sort((a, b) => b.missing - a.missing || b.rate - a.rate).slice(0, 5),
      daily,
    };
  }, [filteredDays, globalExcludedTutorKeys, globalExcludedSchoolIds, mappingFor, selectedRH, selectedSchoolId, selectedTutorKey]);
  const chartDays = viewStats.daily.filter((day) => day.expected > 0);
  const chartMax = Math.max(5, Math.ceil(Math.max(...chartDays.map((day) => day.rate), 0) / 5) * 5);
  const chartPoints = chartDays.map((day, index) => ({
    ...day,
    x: chartDays.length <= 1 ? 500 : 50 + index * (900 / (chartDays.length - 1)),
    y: 176 - (Math.min(day.rate, chartMax) / chartMax) * 132,
  }));
  const chartLine = chartPoints.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const chartArea = chartPoints.length ? `M ${chartPoints[0].x} 176 ${chartPoints.map((point) => `L ${point.x} ${point.y}`).join(" ")} L ${chartPoints[chartPoints.length - 1].x} 176 Z` : "";
  const chartLabelEvery = Math.max(1, Math.ceil(chartPoints.length / 8));
  const needsReview = useMemo(() => {
    const items = new Map<string, { name: string; expected: number; missing: number }>();
    for (const day of days) for (const tutor of day.tutors) for (const item of tutor.schools) {
      const resolved = mappingFor(item.sourceName);
      if (!resolved.school && !resolved.excluded) {
        const key = schoolKey(item.sourceName);
        const current = items.get(key) || { name: item.sourceName, expected: 0, missing: 0 };
        current.expected += item.expectedCount;
        current.missing += item.missingCount;
        items.set(key, current);
      }
    }
    return Array.from(items.entries()).map(([key, item]) => ({ key, ...item })).sort((a, b) => b.missing - a.missing || b.expected - a.expected);
  }, [days, mappingFor]);
  const sourceSchoolNames = useMemo(() => {
    const items = new Map<string, string>();
    days.forEach((day) => day.tutors.forEach((tutor) => tutor.schools.forEach((item) => items.set(schoolKey(item.sourceName), item.sourceName))));
    return Array.from(items.entries()).filter(([key]) => Boolean(mappings[key])).map(([key, name]) => ({ key, name }));
  }, [days, mappings]);
  const dailyTutorRows = useMemo(() => {
    if (!visibleSelectedDay) return [];
    const normalized = query.trim().toLocaleLowerCase("fr");
    return visibleSelectedDay.tutors.map((tutor) => ({ ...tutor, excluded: visibleSelectedDay.excludedTutorKeys.includes(tutor.key) }))
      .filter((tutor) => !normalized || `${tutor.name} ${tutor.tutorId} ${tutor.schools.map((item) => item.sourceName).join(" ")}`.toLocaleLowerCase("fr").includes(normalized))
      .filter((tutor) => !globalExcludedTutorKeys.includes(tutor.key))
      .filter((tutor) => !selectedTutorKey || tutor.key === selectedTutorKey)
      .filter((tutor) => !selectedRH || tutor.schools.some((item) => { const school = mappingFor(item.sourceName).school; return school?.portfolioOwner === selectedRH && !globalExcludedSchoolIds.includes(school.id); }))
      .filter((tutor) => !selectedSchoolId || tutor.schools.some((item) => mappingFor(item.sourceName).school?.id === selectedSchoolId && !globalExcludedSchoolIds.includes(mappingFor(item.sourceName).school!.id)))
      .sort((a, b) => Number(a.excluded) - Number(b.excluded) || b.missingCount - a.missingCount || a.name.localeCompare(b.name, "fr"));
  }, [globalExcludedTutorKeys, globalExcludedSchoolIds, mappingFor, query, visibleSelectedDay, selectedRH, selectedSchoolId, selectedTutorKey]);

  const selectedTutorDetails = useMemo(() => {
    if (!selectedTutorDetailKey) return [];
    return filteredDays.flatMap((day) => {
      const tutor = day.tutors.find((item) => item.key === selectedTutorDetailKey);
      if (!tutor) return [];
      const schoolsForDay = tutor.schools.map((item) => ({ ...item, match: mappingFor(item.sourceName) }))
        .filter((item) => item.match.school && alpha(item.match.school) && !globalExcludedSchoolIds.includes(item.match.school.id) && (!selectedRH || item.match.school.portfolioOwner === selectedRH) && (!selectedSchoolId || item.match.school.id === selectedSchoolId))
        .map((item) => ({ sourceName: item.sourceName, schoolName: item.match.school!.name, expected: item.expectedCount, missing: item.missingCount }));
      if (!schoolsForDay.length) return [];
      return [{
        date: day.date,
        excluded: day.excludedTutorKeys.includes(tutor.key),
        expected: schoolsForDay.reduce((sum, item) => sum + item.expected, 0),
        missing: schoolsForDay.reduce((sum, item) => sum + item.missing, 0),
        schools: schoolsForDay,
      }];
    });
  }, [filteredDays, mappingFor, selectedRH, selectedSchoolId, selectedTutorDetailKey, globalExcludedSchoolIds]);
  const selectedTutorDetail = viewStats.allTutors.find((tutor) => tutor.key === selectedTutorDetailKey) || null;
  const selectedSchoolDetails = useMemo(() => {
    if (!selectedSchoolDetailId) return [];
    return filteredDays.flatMap((day) => {
      const tutorsForDay = new Map<string, { key: string; name: string; expected: number; missing: number; excludedForDay: boolean; excludedGlobally: boolean }>();
      for (const tutor of day.tutors) for (const item of tutor.schools) {
        const match = mappingFor(item.sourceName);
        if (!match.school || !alpha(match.school) || match.school.id !== selectedSchoolDetailId) continue;
        const current = tutorsForDay.get(tutor.key) || { key: tutor.key, name: tutor.name, expected: 0, missing: 0, excludedForDay: day.excludedTutorKeys.includes(tutor.key), excludedGlobally: globalExcludedTutorKeys.includes(tutor.key) };
        current.expected += item.expectedCount; current.missing += item.missingCount; tutorsForDay.set(tutor.key, current);
      }
      const tutors = Array.from(tutorsForDay.values()).sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name, "fr"));
      return tutors.length ? [{ date: day.date, expected: tutors.reduce((sum, item) => sum + item.expected, 0), missing: tutors.reduce((sum, item) => sum + item.missing, 0), tutors }] : [];
    });
  }, [filteredDays, selectedSchoolDetailId, mappingFor, globalExcludedTutorKeys]);
  const selectedSchoolDetail = viewStats.allSchools.find((school) => school.id === selectedSchoolDetailId) || null;
  const openSchoolDetail = (id: string) => { setSelectedSchoolDetailId(id); setShowAllSchools(true); };
  const openTutorDetail = (key: string) => { setSelectedTutorDetailKey(key); setShowAllTutors(true); };

  async function importFiles(selection: FileList | null) {
    // The input is reset immediately after this call; FileList is live.
    const files = Array.from(selection || []);
    if (!files.length) return;
    setSaving(true); setMessage("");
    try {
      let latest: Payload | null = null;
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(`Analyse de ${index + 1}/${files.length} · ${file.name}`);
        const response = await fetch(`/api/tutor-report-audit?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: await file.text() });
        latest = await readPayload(response, `Import de ${file.name} impossible`);
        if (!response.ok) throw new Error(latest.detail || latest.error || `Import impossible pour ${file.name}`);
      }
      if (latest) {
        setDays(latest.days || []);
        setSchools(latest.schools || []);
        setMappings(latest.mappings || {});
      }
      setMessage(`${files.length} fichier${files.length > 1 ? "s" : ""} importé${files.length > 1 ? "s" : ""} · les dates existantes ont été remplacées et les exclusions conservées.${latest?.invalidDateRowCount ? ` ${latest.invalidDateRowCount} ligne(s) sans date ignorée(s).` : ""}`);
      if (latest?.skippedNonAlphaRows) setMessage((current) => `${current} ${latest?.skippedNonAlphaRows} ligne(s) reconnue(s) comme hors périmètre Alpha ou explicitement écartée(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import impossible");
    } finally { setSaving(false); setProgress(""); }
  }

  async function excludeTutor(key: string, excluded: boolean, date = visibleSelectedDay?.date) {
    if (!date) return;
    setSaving(true);
    try {
      const response = await fetch("/api/tutor-report-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "exclude-tutor", date, tutorKey: key, excluded }) });
      const data = await readPayload(response, "Modification impossible");
      if (!response.ok) throw new Error(data.error || "Modification impossible");
      setDays(data.days || []);
      setMessage(excluded ? "Tuteur retiré du bilan de cette journée." : "Tuteur réintégré au bilan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Modification impossible"); }
    finally { setSaving(false); }
  }

  async function excludeTutorGlobally(key: string, excluded: boolean) {
    setSaving(true);
    try {
      const response = await fetch("/api/tutor-report-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "exclude-tutor-globally", tutorKey: key, excluded }) });
      const data = await readPayload(response, "Modification impossible");
      if (!response.ok) throw new Error(data.error || "Modification impossible");
      setGlobalExcludedTutorKeys(data.globalExcludedTutorKeys || []);
      setMessage(excluded ? "Tuteur exclu de tous les jours et des totaux." : "Tuteur réintégré dans tous les jours.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Modification impossible"); }
    finally { setSaving(false); }
  }

  async function excludeSchoolGlobally(schoolId: string, excluded: boolean) {
    setSaving(true);
    try {
      const response = await fetch("/api/tutor-report-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "exclude-school-globally", schoolId, excluded }) });
      const data = await readPayload(response, "Modification impossible");
      if (!response.ok) throw new Error(data.error || "Modification impossible");
      setGlobalExcludedSchoolIds(data.globalExcludedSchoolIds || []);
      setMessage(excluded ? "Établissement exclu de tous les récapitulatifs." : "Établissement réintégré dans tous les récapitulatifs.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Modification impossible"); }
    finally { setSaving(false); }
  }

  async function mapSchool(sourceName: string, schoolId: string) {
    setSaving(true);
    try {
      const response = await fetch("/api/tutor-report-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "map-school", sourceName, schoolId }) });
      const data = await readPayload(response, "Rapprochement impossible");
      if (!response.ok) throw new Error(data.error || "Rapprochement impossible");
      setMappings(data.mappings || {});
      setMessage(schoolId === "excluded" ? "Établissement écarté des bilans." : schoolId ? "Établissement rapproché ; les totaux sont recalculés." : "Rapprochement retiré ; l’établissement revient en vérification.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Rapprochement impossible"); }
    finally { setSaving(false); }
  }

  async function saveComment(tutorId: string, comment: string) {
    const nextComment = { tutorId, comment, updatedAt: new Date().toISOString() };
    const response = await fetch("/api/tutor-report-comments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment: nextComment }) });
    if (!response.ok) throw new Error("Commentaire non enregistré");
    const data = await response.json() as { comments?: TutorReportComment[] };
    setComments(data.comments || [...comments.filter((item) => item.tutorId !== tutorId), nextComment]);
  }

  const commentByTutor = useMemo(() => new Map(comments.map((item) => [item.tutorId, item.comment])), [comments]);
  const commentFor = (tutorId: string) => commentByTutor.get(tutorId) || "";

  return <section className="task-panel tutor-report-audit">
    <div className="panel-heading"><div><p className="eyebrow">Suivi des rapports</p><h2>Bilans tuteurs</h2><p>Repérez les rapports manquants, jour par jour, et identifiez les établissements Alpha à accompagner.</p></div><label className="import-button">Importer un ou plusieurs CSV<input type="file" accept=".csv,text/csv" multiple disabled={saving} onChange={(event) => { void importFiles(event.target.files); event.currentTarget.value = ""; }} /></label></div>
    {progress ? <p className="enrollment-message">{progress}</p> : null}
    {message ? <p className="enrollment-message">{message}</p> : null}
    {needsReview.length ? <section className="tutor-report-review"><div><h3>Établissements à rapprocher</h3><p>Ils restent hors des totaux Alpha jusqu’à vérification.</p></div>{needsReview.map((item) => <article key={item.key}><strong>{item.name}</strong><span>{number.format(item.missing)} manquant(s) / {number.format(item.expected)} attendu(s)</span><select value="" onChange={(event) => { if (event.target.value) void mapSchool(item.name, event.target.value); }} disabled={saving}><option value="">Associer à une fiche Alpha…</option>{schools.filter(alpha).map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select><button type="button" onClick={() => void mapSchool(item.name, "excluded")} disabled={saving}>Écarter</button></article>)}</section> : null}
    {sourceSchoolNames.length ? <details className="tutor-report-mappings"><summary>Rapprochements effectués ({sourceSchoolNames.length})</summary>{sourceSchoolNames.map((item) => <label key={item.key}><span>{item.name}</span><select value={mappings[item.key]} onChange={(event) => void mapSchool(item.name, event.target.value)} disabled={saving}><option value="">Remettre en vérification</option><option value="excluded">Écarté</option>{schools.filter(alpha).map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>)}</details> : null}
    <div className="tutor-report-audit-controls"><label>Du<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>Au<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label>RH<select value={selectedRH} onChange={(event) => setSelectedRH(event.target.value)}><option value="">Tous les RH</option>{rhOrder.map((key) => <option key={key} value={key}>{rhLabels[key]}</option>)}</select></label><label>Tuteur<select value={selectedTutorKey} onChange={(event) => setSelectedTutorKey(event.target.value)}><option value="">Tous les tuteurs</option>{tutorOptions.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label><label>Établissement<select value={selectedSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)}><option value="">Tous les établissements Alpha</option>{schools.filter(alpha).map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label><label className="tutor-report-search">Rechercher<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tuteur ou établissement…" /></label></div>
    <section className="tutor-report-rh-summary" aria-label="Bilans manquants par responsable RH"><div><span className="tutor-report-chart-kicker">BILANS MANQUANTS PAR RH</span><small>Établissements rattachés · hors exclusions</small></div>{viewStats.rhTotals.map((rh) => <button key={rh.key} type="button" className={selectedRH === rh.key ? "active" : ""} aria-pressed={selectedRH === rh.key} onClick={() => setSelectedRH(selectedRH === rh.key ? "" : rh.key)}><strong>{rh.name}</strong><b>{number.format(rh.missing)} / {number.format(rh.expected)}</b><small>{rh.expected ? percent.format((rh.missing / rh.expected) * 100) + "% non faits" : "Aucun bilan"}</small></button>)}</section>
    <div className="tutor-report-audit-kpis"><article><span>Rapports attendus</span><strong>{number.format(viewStats.expected)}</strong></article><article className="missing"><span>Rapports manquants</span><strong>{number.format(viewStats.missing)}</strong></article><article className="done"><span>Rapports faits</span><strong>{number.format(viewStats.done)}</strong></article><article className="rate"><span>Taux de complétion</span><strong>{percent.format(viewStats.expected ? (viewStats.done / viewStats.expected) * 100 : 0)}%</strong></article></div>
    {days.length ? <><section className="tutor-report-daily-chart" aria-labelledby="tutor-report-daily-chart-title"><div className="tutor-report-chart-heading"><div><span className="tutor-report-chart-kicker">TENDANCE · HORS EXCLUS</span><h3 id="tutor-report-daily-chart-title">Rapports manquants, jour après jour</h3><p>Le taux est affiché à intervalles réguliers, le nombre manquant sous chaque point. Cliquez sur un point pour voir son jour en détail.</p></div><strong>{chartDays.length ? percent.format(viewStats.expected ? (viewStats.missing / viewStats.expected) * 100 : 0) + "% sur la période" : "Aucun jour mesurable"}</strong></div>{chartPoints.length ? <div className="tutor-report-chart-scroll"><svg className="tutor-report-daily-svg" style={{ minWidth: `${Math.max(760, chartPoints.length * 46)}px` }} viewBox="0 0 1000 224" role="img" aria-label="Pourcentage et nombre de rapports manquants par jour, hors exclusions">
      <defs><linearGradient id="report-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#fc4f9b" stopOpacity=".3" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity=".015" /></linearGradient><linearGradient id="report-chart-line" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="55%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
      {[44, 110, 176].map((y, index) => <g key={y}><line x1="50" x2="950" y1={y} y2={y} className="tutor-report-chart-grid" /><text x="40" y={y + 4} textAnchor="end" className="tutor-report-chart-axis">{percent.format(chartMax * (2 - index) / 2)}%</text></g>)}
      <path d={chartArea} fill="url(#report-chart-fill)" /><path d={chartLine} className="tutor-report-chart-line" fill="none" stroke="url(#report-chart-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {chartPoints.map((point, index) => <g key={point.date} role="button" tabIndex={0} aria-label={`${dayLabel(point.date)} : ${percent.format(point.rate)} pour cent non faits, ${number.format(point.missing)} sur ${number.format(point.expected)}`} onClick={() => setSelectedDate(point.date)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedDate(point.date); }} className={visibleSelectedDay?.date === point.date ? "active" : ""}><title>{dayLabel(point.date)} · {number.format(point.missing)} / {number.format(point.expected)} manquants · {percent.format(point.rate)}%</title>{index % chartLabelEvery === 0 || index === chartPoints.length - 1 || visibleSelectedDay?.date === point.date ? <text x={point.x} y={Math.max(30, point.y - 12)} textAnchor="middle" className="tutor-report-chart-percent">{percent.format(point.rate)}%</text> : null}<circle cx={point.x} cy={point.y} r={visibleSelectedDay?.date === point.date ? 7 : 4.5} className="tutor-report-chart-point" /><text x={point.x} y={Math.min(194, point.y + 19)} textAnchor="middle" className="tutor-report-chart-count">{number.format(point.missing)}</text>{index % chartLabelEvery === 0 || index === chartPoints.length - 1 ? <text x={point.x} y="207" textAnchor="middle" className="tutor-report-chart-date">{dayLabel(point.date, { weekday: "short", day: "2-digit", month: "short" })}</text> : null}</g>)}
    </svg></div> : <p className="tutor-report-chart-empty">Tous les rapports de cette période sont exclus du calcul. Réintégrez au moins une journée, un tuteur ou un établissement pour voir les taux.</p>}</section><section className="tutor-report-insights"><article><h3>Jours à regarder</h3>{viewStats.worstDays.map((day) => <button key={day.date} type="button" onClick={() => setSelectedDate(day.date)}><span>{dayLabel(day.date, { weekday: "short", day: "2-digit", month: "short" })}</span><strong>{number.format(day.missing)} manquant(s)</strong><em>{percent.format(day.rate)}%</em></button>)}</article><article className="tutor-report-top-tutors"><div className="tutor-report-insight-heading"><h3>Tuteurs avec le plus de rapports manquants</h3><button type="button" onClick={() => setShowAllTutors(true)}>Voir la liste ({number.format(viewStats.allTutors.length)})</button></div>{viewStats.tutors.slice(0, 5).map((tutor) => <div key={tutor.key}><button type="button" className="tutor-report-name-link" onClick={() => openTutorDetail(tutor.key)}>{tutor.name}</button><strong>{number.format(tutor.missing)} / {number.format(tutor.expected)} · {tutor.completedReports ? number.format(Math.round(tutor.reportCharacters / tutor.completedReports)) + " caractères" : "—"}</strong></div>)}</article><article><div className="tutor-report-insight-heading"><h3>Établissements Alpha concernés</h3><button type="button" onClick={() => setShowAllSchools(true)}>Voir la liste ({number.format(viewStats.allSchools.length)})</button></div>{viewStats.schools.slice(0, 5).map((school) => <div key={school.id}><button type="button" className="tutor-report-name-link" onClick={() => openSchoolDetail(school.id)}>{school.name}</button><strong>{number.format(school.missing)} / {number.format(school.expected)} · {school.expected ? percent.format(school.missing / school.expected * 100) + "% non faits" : "—"}</strong></div>)}</article></section>
    <div className="tutor-report-day-tabs">{viewStats.daily.map((day) => <button type="button" key={day.date} className={visibleSelectedDay?.date === day.date ? "active" : ""} onClick={() => setSelectedDate(day.date)}>{dayLabel(day.date, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}<small>{number.format(day.missing)} manquant(s) · {number.format(day.expected)} attendus</small></button>)}</div>
    {visibleSelectedDay ? <section className="tutor-report-day" aria-live="polite"><header><div><span className="history-badge">Bilan du jour</span><h3>{dayLabel(visibleSelectedDay.date)}</h3><p>{number.format(dailyTutorRows.length)} tuteur(s) affiché(s) · import : {visibleSelectedDay.sourceFileName}</p></div><strong>{number.format(visibleSelectedDay.sourceRowCount)} lignes sources</strong></header><div className="tutor-report-day-table"><div className="tutor-report-day-head"><span>Tuteur</span><span>Établissements</span><span>Attendus</span><span>Manquants</span><span>Caractères / bilan</span><span>Commentaire général</span><span>Action</span></div>{dailyTutorRows.map((tutor) => {
      const alphaSchools = tutor.schools.map((item) => ({ ...item, match: mappingFor(item.sourceName) })).filter((item) => item.match.school && alpha(item.match.school) && !globalExcludedSchoolIds.includes(item.match.school.id) && (!selectedRH || item.match.school.portfolioOwner === selectedRH) && (!selectedSchoolId || item.match.school.id === selectedSchoolId));
      const expected = alphaSchools.reduce((sum, item) => sum + item.expectedCount, 0);
      const missing = alphaSchools.reduce((sum, item) => sum + item.missingCount, 0);
      const completedReportCount = alphaSchools.reduce((sum, item) => sum + item.completedReportCount, 0);
      const completedReportCharacterCount = alphaSchools.reduce((sum, item) => sum + item.completedReportCharacterCount, 0);
      const averageReportCharacters = completedReportCount ? Math.round(completedReportCharacterCount / completedReportCount) : null;
      return <article className={tutor.excluded ? "excluded" : ""} key={tutor.key}><strong>{tutor.name}{tutor.tutorId ? <small>ID {tutor.tutorId}</small> : null}</strong><div className="tutor-report-school-breakdown">{alphaSchools.length ? alphaSchools.map((item) => <span key={item.sourceName}>{item.match.school?.name}<b>{item.missingCount} / {item.expectedCount}</b></span>) : <span>En attente de rapprochement d’établissement</span>}</div><b>{number.format(expected)}</b><b className="missing">{number.format(missing)}</b><b>{averageReportCharacters === null ? "—" : number.format(averageReportCharacters)}</b>{tutor.tutorId ? <label className="tutor-report-general-note"><span>Note générale</span><textarea key={`${tutor.tutorId}:${commentFor(tutor.tutorId)}`} defaultValue={commentFor(tutor.tutorId)} placeholder="Aucune note" onBlur={(event) => { if (event.target.value !== commentFor(tutor.tutorId)) void saveComment(tutor.tutorId, event.target.value).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Commentaire non enregistré")); }} /></label> : <span>—</span>}<button type="button" onClick={() => void excludeTutor(tutor.key, !tutor.excluded)} disabled={saving}>{tutor.excluded ? "Réintégrer" : "Exclure ce jour"}</button></article>;
    })}</div></section> : <div className="empty-state"><h3>Aucun jour dans cette période</h3></div>}</> : <div className="empty-state"><span>🧾</span><h3>Aucun rapport importé</h3><p>Importez les exports CSV pour commencer le suivi jour par jour.</p></div>}
    {showAllTutors ? <div className="tutor-report-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowAllTutors(false); setSelectedTutorDetailKey(""); } }}><section className="tutor-report-tutor-modal" role="dialog" aria-modal="true" aria-labelledby="tutor-report-tutor-modal-title"><header><div>{selectedTutorDetail ? <><p className="eyebrow">Détail tuteur · période sélectionnée</p><h2 id="tutor-report-tutor-modal-title">{selectedTutorDetail.name}</h2><p>{selectedTutorDetail.expected ? number.format(selectedTutorDetail.missing) + " rapports manquants / " + number.format(selectedTutorDetail.expected) + " attendus" : "Aucune donnée dans le périmètre sélectionné"}</p></> : <><p className="eyebrow">Synthèse de la période</p><h2 id="tutor-report-tutor-modal-title">Rapports par tuteur</h2><p>{number.format(viewStats.allTutors.length)} tuteur(s) · moyenne calculée sur les bilans remplis</p></>}</div><div className="tutor-report-modal-header-actions">{selectedTutorDetail ? <button type="button" onClick={() => setSelectedTutorDetailKey("")}>← Liste</button> : null}<button type="button" aria-label="Fermer" onClick={() => { setShowAllTutors(false); setSelectedTutorDetailKey(""); }}>×</button></div></header>{selectedTutorDetail ? <><div className="tutor-report-detail-summary">{globalExcludedTutorKeys.includes(selectedTutorDetail.key) ? <p className="global-exclusion-note">Exclusion générale active : ce tuteur est retiré de toutes les dates et des totaux.</p> : null}<p>Les nombres sont regroupés par établissement. Exclure une journée retire ce tuteur de tous les établissements de cette date.</p></div><div className="tutor-report-tutor-details">{selectedTutorDetails.map((day) => <article className={day.excluded ? "day-excluded" : ""} key={day.date}><header><div><strong>{dayLabel(day.date)}</strong><span>{number.format(day.missing)} manquant(s) / {number.format(day.expected)} attendu(s){day.excluded ? " · exclu des totaux" : ""}</span></div><button type="button" disabled={saving} onClick={() => void excludeTutor(selectedTutorDetail.key, !day.excluded, day.date)}>{day.excluded ? "Réintégrer ce jour" : "Exclure ce jour"}</button></header><div className="tutor-report-detail-schools">{day.schools.map((school) => <div key={school.sourceName}><span>{school.schoolName}</span><div><b>{number.format(school.missing)} manquant(s) / {number.format(school.expected)} attendu(s)</b><em>{school.expected ? percent.format(school.missing / school.expected * 100) + "% non faits" : "—"}</em></div></div>)}</div></article>)}{!selectedTutorDetails.length ? <div className="empty-state"><h3>Aucun établissement rapproché dans le périmètre sélectionné</h3><p>Vérifiez les filtres de dates et d’établissement.</p></div> : null}</div></> : <><label className="tutor-report-modal-search">Rechercher un tuteur<input autoFocus value={allTutorsQuery} onChange={(event) => setAllTutorsQuery(event.target.value)} placeholder="Nom ou identifiant…" /></label><div className="tutor-report-modal-list">{viewStats.allTutors.filter((tutor) => !allTutorsQuery.trim() || (tutor.name + " " + tutor.tutorId + " " + tutor.schoolNames.join(" ")).toLocaleLowerCase("fr").includes(allTutorsQuery.trim().toLocaleLowerCase("fr"))).map((tutor) => { const excluded = globalExcludedTutorKeys.includes(tutor.key); const average = tutor.completedReports ? Math.round(tutor.reportCharacters / tutor.completedReports) : null; return <article className={excluded ? "globally-excluded" : ""} key={tutor.key}><div><button type="button" className="tutor-report-name-link" onClick={() => setSelectedTutorDetailKey(tutor.key)}>{tutor.name}</button>{tutor.tutorId ? <small>ID {tutor.tutorId}</small> : null}</div><span>{number.format(tutor.missing)} manquant(s) / {number.format(tutor.expected)} attendu(s)</span><b>{average === null ? "—" : number.format(average) + " caractères / bilan"}</b><small className="tutor-report-modal-schools" title={tutor.schoolNames.join(" · ")}>{tutor.schoolNames.join(" · ") || "Aucun établissement actif"}</small><button type="button" disabled={saving} onClick={() => void excludeTutorGlobally(tutor.key, !excluded)}>{excluded ? "Réintégrer partout" : "Exclure partout"}</button></article>; })}</div></>}</section></div> : null}
    {showAllSchools ? <div className="tutor-report-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowAllSchools(false); setSelectedSchoolDetailId(""); } }}><section className="tutor-report-tutor-modal" role="dialog" aria-modal="true" aria-labelledby="tutor-report-school-modal-title"><header><div>{selectedSchoolDetail ? <><p className="eyebrow">Détail établissement · période sélectionnée</p><h2 id="tutor-report-school-modal-title">{selectedSchoolDetail.name}</h2><p>{number.format(selectedSchoolDetail.missing)} rapports manquants / {number.format(selectedSchoolDetail.expected)} attendus · {selectedSchoolDetail.expected ? percent.format(selectedSchoolDetail.missing / selectedSchoolDetail.expected * 100) + "% non faits" : "—"}</p></> : <><p className="eyebrow">Synthèse de la période</p><h2 id="tutor-report-school-modal-title">Rapports par établissement</h2><p>{number.format(viewStats.allSchools.length)} établissement(s) · cliquez sur un nom pour le détail par jour et tuteur</p></>}</div><div className="tutor-report-modal-header-actions">{selectedSchoolDetail ? <button type="button" onClick={() => setSelectedSchoolDetailId("")}>← Liste</button> : null}<button type="button" aria-label="Fermer" onClick={() => { setShowAllSchools(false); setSelectedSchoolDetailId(""); }}>×</button></div></header>{selectedSchoolDetail ? <><div className="tutor-report-detail-summary">{selectedSchoolDetail.excluded ? <p className="global-exclusion-note">Exclusion générale active : cet établissement est retiré des totaux.</p> : null}<p>Détail des rapports attendus et manquants, regroupés par jour et tuteur.</p></div><div className="tutor-report-tutor-details">{selectedSchoolDetails.map((day) => <article key={day.date}><header><div><strong>{dayLabel(day.date)}</strong><span>{number.format(day.missing)} manquant(s) / {number.format(day.expected)} attendu(s)</span></div></header><div className="tutor-report-school-tutor-list">{day.tutors.map((tutor) => <div key={tutor.key} className={tutor.excludedGlobally || tutor.excludedForDay ? "day-excluded" : ""}><strong>{tutor.name}</strong><span>{number.format(tutor.missing)} manquant(s) / {number.format(tutor.expected)} attendu(s) · {tutor.expected ? percent.format(tutor.missing / tutor.expected * 100) + "% non faits" : "—"}</span>{tutor.excludedGlobally ? <em>Exclu globalement</em> : tutor.excludedForDay ? <em>Exclu ce jour</em> : null}</div>)}</div></article>)}{!selectedSchoolDetails.length ? <div className="empty-state"><h3>Aucun rapport dans le périmètre sélectionné</h3><p>Vérifiez les filtres de dates et d’établissement.</p></div> : null}</div></> : <><label className="tutor-report-modal-search">Rechercher un établissement<input autoFocus value={allSchoolsQuery} onChange={(event) => setAllSchoolsQuery(event.target.value)} placeholder="Nom d’établissement…" /></label><div className="tutor-report-modal-list tutor-report-school-modal-list">{viewStats.allSchools.filter((school) => !allSchoolsQuery.trim() || school.name.toLocaleLowerCase("fr").includes(allSchoolsQuery.trim().toLocaleLowerCase("fr"))).map((school) => <article className={school.excluded ? "globally-excluded" : ""} key={school.id}><div><button type="button" className="tutor-report-name-link" onClick={() => setSelectedSchoolDetailId(school.id)}>{school.name}</button></div><span>{number.format(school.missing)} manquant(s) / {number.format(school.expected)} attendu(s)</span><b>{school.expected ? percent.format(school.missing / school.expected * 100) + "% non faits" : "—"}</b><button type="button" disabled={saving} onClick={() => void excludeSchoolGlobally(school.id, !school.excluded)}>{school.excluded ? "Réintégrer partout" : "Exclure partout"}</button></article>)}</div></>}</section></div> : null}
  </section>;
}

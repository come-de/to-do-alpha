"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PersonAdminLink from "@/app/components/person-admin-link";
import type { FileKind } from "@/app/components/files-hub";

type AvailabilityRow = {
  tutorId: string;
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  school: string;
  className: string;
  timeSlot: string;
  sessionId: string;
  group: string;
};

type InterestRow = {
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
  sessionId: string;
  date: string;
  school: string;
  className: string;
  timeSlot: string;
  group: string;
  validated: boolean;
};

type AssignmentRow = {
  tutorId: string;
  school: string;
  date: string;
  timeSlot: string;
  absent: boolean;
};

type SourceImport<Row> = {
  id: string;
  importedAt: string;
  displayName: string;
  rows: Row[];
};

type TutorSnapshot = {
  date: string;
  records: Array<{ tutorId: string }>;
};
type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";
type SchoolAssignment = { name: string; portfolioOwner: SchoolPortfolioOwner };
type SchoolOwnerFilter = "all" | "unassigned" | Exclude<SchoolPortfolioOwner, "">;

const schoolOwnerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribué", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };

type FreeSlot = {
  key: string;
  personId: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: "tutor" | "candidate" | "unknown";
  timeSlot: string;
  school: string;
  className: string;
  group: string;
  sources: Array<"availability" | "interest">;
  validatedInterest: boolean;
  otherAssignments: AssignmentRow[];
};

function formatDate(value: string, long = false) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", long ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { day: "2-digit", month: "2-digit" }).format(date);
}

function formatImportDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function timeRange(value: string) {
  const parts = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g) ?? [];
  const toMinutes = (part: string) => {
    const [hours, minutes] = part.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return parts.length >= 2 ? [toMinutes(parts[0]!), toMinutes(parts[1]!)] as const : null;
}

function firstTime(value: string) {
  return timeRange(value)?.[0] ?? Number.MAX_SAFE_INTEGER;
}

function overlaps(first: string, second: string) {
  const firstRange = timeRange(first);
  const secondRange = timeRange(second);
  return Boolean(firstRange && secondRange && firstRange[0] < secondRange[1] && secondRange[0] < firstRange[1]);
}

function tutorName(slot: Pick<FreeSlot, "firstName" | "lastName" | "personId">) {
  return `${slot.firstName} ${slot.lastName}`.trim() || `Personne ${slot.personId}`;
}

function freeSlotKey(timeSlot: string, school: string) {
  const normalize = (value: string) => value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
  return `${normalize(timeSlot)}|${normalize(school)}`;
}

function dedupeAssignments(rows: AssignmentRow[]) {
  return rows.filter((row, index) => rows.findIndex((item) => item.timeSlot === row.timeSlot && item.school === row.school) === index);
}

function normalizedSchoolName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

export default function TutorAvailabilityFeed({ onOpenFiles }: { onOpenFiles: (kind: FileKind) => void }) {
  const [availabilityImports, setAvailabilityImports] = useState<Array<SourceImport<AvailabilityRow>>>([]);
  const [interestImports, setInterestImports] = useState<Array<SourceImport<InterestRow>>>([]);
  const [assignmentImports, setAssignmentImports] = useState<Array<SourceImport<AssignmentRow>>>([]);
  const [availabilityData, setAvailabilityData] = useState<Record<string, SourceImport<AvailabilityRow>>>({});
  const [interestData, setInterestData] = useState<Record<string, SourceImport<InterestRow>>>({});
  const [assignmentData, setAssignmentData] = useState<Record<string, SourceImport<AssignmentRow>>>({});
  const [latestTutorSnapshot, setLatestTutorSnapshot] = useState<TutorSnapshot | null>(null);
  const [schoolAssignments, setSchoolAssignments] = useState<SchoolAssignment[]>([]);
  const [availabilityImportId, setAvailabilityImportId] = useState("");
  const [interestImportId, setInterestImportId] = useState("");
  const [assignmentImportId, setAssignmentImportId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "tutor" | "candidate">("all");
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "free" | "assigned">("all");
  const [schoolOwnerFilter, setSchoolOwnerFilter] = useState<SchoolOwnerFilter>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [detailError, setDetailError] = useState("");
  const [detailRetry, setDetailRetry] = useState(0);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const sources = [
      ["Disponibilités", "/api/availability-imports?summary=1"],
      ["Intérêts", "/api/tutor-interest-imports?summary=1"],
      ["Séances affectées", "/api/tutor-assignment-imports?summary=1"],
      ["Liste des tuteurs", "/api/tutor-tracking?latest=1"],
      ["Établissements", "/api/schools"],
    ] as const;
    const results = await Promise.allSettled(sources.map(async ([label, endpoint]) => {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = await response.json() as { imports?: unknown[]; snapshot?: TutorSnapshot | null; schools?: SchoolAssignment[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(`${label} : ${payload.detail || payload.error || "chargement impossible"}`);
      return payload;
    }));
    const errors = results.flatMap((result) => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "Chargement impossible"] : []);
    if (results[0]?.status === "fulfilled") {
      const availability = (results[0].value.imports ?? []) as Array<SourceImport<AvailabilityRow>>;
      setAvailabilityImports(availability);
      setAvailabilityImportId((current) => availability.some((item) => item.id === current) ? current : availability[0]?.id || "");
    }
    if (results[1]?.status === "fulfilled") {
      const interests = (results[1].value.imports ?? []) as Array<SourceImport<InterestRow>>;
      setInterestImports(interests);
      setInterestImportId((current) => interests.some((item) => item.id === current) ? current : interests[0]?.id || "");
    }
    if (results[2]?.status === "fulfilled") {
      const assignments = (results[2].value.imports ?? []) as Array<SourceImport<AssignmentRow>>;
      setAssignmentImports(assignments);
      setAssignmentImportId((current) => assignments.some((item) => item.id === current) ? current : assignments[0]?.id || "");
    }
    if (results[3]?.status === "fulfilled") setLatestTutorSnapshot(results[3].value.snapshot ?? null);
    if (results[4]?.status === "fulfilled") setSchoolAssignments(results[4].value.schools ?? []);
    setMessage(errors.length ? errors.join(" · ") : silent ? "" : "Fil actualisé");
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(true), 0);
    const refresh = window.setInterval(() => void load(true), 30_000);
    return () => { window.clearTimeout(timer); window.clearInterval(refresh); };
  }, [load]);

  useEffect(() => {
    const requests = [
      availabilityImportId && !availabilityData[availabilityImportId] ? ["availability", availabilityImportId, "/api/availability-imports"] : null,
      interestImportId && !interestData[interestImportId] ? ["interest", interestImportId, "/api/tutor-interest-imports"] : null,
      assignmentImportId && !assignmentData[assignmentImportId] ? ["assignment", assignmentImportId, "/api/tutor-assignment-imports"] : null,
    ].filter(Boolean) as string[][];
    if (!requests.length) return;
    let cancelled = false;
    Promise.all(requests.map(async ([kind, id, endpoint]) => {
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await response.json() as { import?: SourceImport<AvailabilityRow | InterestRow | AssignmentRow>; error?: string; detail?: string };
      if (!response.ok || !data.import) throw new Error(data.detail || data.error || "Fichier sélectionné indisponible");
      return { kind, item: data.import };
    })).then((items) => {
      if (cancelled) return;
      items.forEach(({ kind, item }) => {
        if (kind === "availability") setAvailabilityData((current) => ({ ...current, [item.id]: item as SourceImport<AvailabilityRow> }));
        else if (kind === "interest") setInterestData((current) => ({ ...current, [item.id]: item as SourceImport<InterestRow> }));
        else setAssignmentData((current) => ({ ...current, [item.id]: item as SourceImport<AssignmentRow> }));
      });
      setDetailError("");
      setMessage("");
    }).catch((error) => { if (!cancelled) { const text = error instanceof Error ? error.message : "Chargement impossible"; setDetailError(text); setMessage(text); } });
    return () => { cancelled = true; };
  }, [assignmentData, assignmentImportId, availabilityData, availabilityImportId, detailRetry, interestData, interestImportId]);

  const availabilityImport = availabilityData[availabilityImportId] ?? null;
  const interestImport = interestData[interestImportId] ?? null;
  const assignmentImport = assignmentData[assignmentImportId] ?? null;
  const loadingDetails = !detailError && Boolean(
    (availabilityImportId && !availabilityImport)
    || (interestImportId && !interestImport)
    || (assignmentImportId && !assignmentImport),
  );
  const dates = useMemo(() => Array.from(new Set([...(availabilityImport?.rows ?? []).map((row) => row.date), ...(interestImport?.rows ?? []).map((row) => row.date)].filter(Boolean))).sort(), [availabilityImport, interestImport]);
  const today = new Date().toISOString().slice(0, 10);
  const activeDate = dates.includes(selectedDate) ? selectedDate : dates.includes(today) ? today : dates[0] || "";
  const ownerBySchoolName = useMemo(() => new Map(schoolAssignments.map((school) => [normalizedSchoolName(school.name), school.portfolioOwner])), [schoolAssignments]);
  const ownerForSlot = useCallback((slot: Pick<FreeSlot, "school">): SchoolPortfolioOwner => ownerBySchoolName.get(normalizedSchoolName(slot.school)) ?? "", [ownerBySchoolName]);

  const dayResult = useMemo(() => {
    if (!activeDate) return { slots: [] as FreeSlot[], hiddenOverlapCount: 0 };
    const currentTutorIds = latestTutorSnapshot ? new Set(latestTutorSnapshot.records.map((record) => record.tutorId.trim()).filter(Boolean)) : null;
    const assignmentsByTutor = new Map<string, AssignmentRow[]>();
    (assignmentImport?.rows ?? []).filter((row) => !row.absent && row.date === activeDate && row.tutorId.trim()).forEach((row) => {
      const tutorId = row.tutorId.trim();
      assignmentsByTutor.set(tutorId, dedupeAssignments([...(assignmentsByTutor.get(tutorId) ?? []), row]));
    });
    const slotMap = new Map<string, Omit<FreeSlot, "otherAssignments">>();
    const addSlot = (input: Omit<FreeSlot, "status" | "sources" | "validatedInterest" | "otherAssignments">, source: "availability" | "interest", validatedInterest = false) => {
      const key = `${input.personId}|${input.key}`;
      const existing = slotMap.get(key);
      const status = !currentTutorIds || !input.personId ? "unknown" : currentTutorIds.has(input.personId) ? "tutor" : "candidate";
      slotMap.set(key, existing ? {
        ...existing,
        firstName: existing.firstName || input.firstName,
        lastName: existing.lastName || input.lastName,
        phone: existing.phone || input.phone,
        sources: Array.from(new Set([...existing.sources, source])),
        validatedInterest: existing.validatedInterest || validatedInterest,
      } : { ...input, status, sources: [source], validatedInterest });
    };
    (availabilityImport?.rows ?? []).filter((row) => row.date === activeDate && row.tutorId.trim()).forEach((row) => addSlot({
      key: freeSlotKey(row.timeSlot, row.school),
      personId: row.tutorId.trim(), firstName: row.firstName, lastName: row.lastName, phone: row.phone,
      timeSlot: row.timeSlot, school: row.school, className: row.className, group: row.group,
    }, "availability"));
    (interestImport?.rows ?? []).filter((row) => row.date === activeDate && row.personId.trim()).forEach((row) => addSlot({
      key: freeSlotKey(row.timeSlot, row.school),
      personId: row.personId.trim(), firstName: row.firstName, lastName: row.lastName, phone: row.phone,
      timeSlot: row.timeSlot, school: row.school, className: row.className, group: row.group,
    }, "interest", row.validated));

    let hiddenOverlapCount = 0;
    const slots = Array.from(slotMap.values()).flatMap((slot): FreeSlot[] => {
      const dayAssignments = assignmentsByTutor.get(slot.personId) ?? [];
      if (dayAssignments.some((assignment) => overlaps(slot.timeSlot, assignment.timeSlot))) {
        hiddenOverlapCount += 1;
        return [];
      }
      return [{ ...slot, otherAssignments: dayAssignments.sort((a, b) => firstTime(a.timeSlot) - firstTime(b.timeSlot)) }];
    });
    return { slots, hiddenOverlapCount };
  }, [activeDate, assignmentImport, availabilityImport, interestImport, latestTutorSnapshot]);

  const visibleSlots = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return dayResult.slots.filter((slot) => {
      if (statusFilter !== "all" && slot.status !== statusFilter) return false;
      if (scheduleFilter === "free" && slot.otherAssignments.length) return false;
      if (scheduleFilter === "assigned" && !slot.otherAssignments.length) return false;
      const owner = ownerForSlot(slot);
      if (schoolOwnerFilter === "unassigned" ? Boolean(owner) : schoolOwnerFilter !== "all" && owner !== schoolOwnerFilter) return false;
      if (!needle) return true;
      return [slot.personId, slot.firstName, slot.lastName, slot.phone, slot.school, slot.className, slot.group, slot.timeSlot, ...slot.otherAssignments.flatMap((row) => [row.school, row.timeSlot])].join(" ").toLocaleLowerCase("fr").includes(needle);
    }).sort((a, b) => firstTime(a.timeSlot) - firstTime(b.timeSlot) || tutorName(a).localeCompare(tutorName(b), "fr"));
  }, [dayResult.slots, ownerForSlot, query, scheduleFilter, schoolOwnerFilter, statusFilter]);

  const peopleCount = new Set(visibleSlots.map((slot) => slot.personId)).size;
  const tutorCount = new Set(visibleSlots.filter((slot) => slot.status === "tutor").map((slot) => slot.personId)).size;
  const candidateCount = new Set(visibleSlots.filter((slot) => slot.status === "candidate").map((slot) => slot.personId)).size;
  const availabilityCount = visibleSlots.filter((slot) => slot.sources.includes("availability")).length;
  const interestCount = visibleSlots.filter((slot) => slot.sources.includes("interest")).length;

  return <section className="task-panel tutor-feed-panel">
    <div className="panel-heading"><div><p className="eyebrow">Vue chronologique quotidienne</p><h2>Fil des disponibilités</h2><p>Uniquement les créneaux réellement libres, issus des disponibilités et des intérêts.</p></div><button className="ghost-button" type="button" onClick={() => void load()} disabled={loading}>↻ Actualiser</button></div>
    {message ? <p className="enrollment-message">{message}</p> : null}
    <div className="tutor-feed-sources">
      <label><span>Disponibilités{!availabilityImports.length ? <button type="button" className="source-files-link" onClick={() => onOpenFiles("availability")}>Ouvrir Fichiers</button> : null}</span><select value={availabilityImportId} onChange={(event) => setAvailabilityImportId(event.target.value)}><option value="">Aucun fichier</option>{availabilityImports.map((item) => <option value={item.id} key={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <label><span>Intérêts{!interestImports.length ? <button type="button" className="source-files-link" onClick={() => onOpenFiles("interests")}>Ouvrir Fichiers</button> : null}</span><select value={interestImportId} onChange={(event) => setInterestImportId(event.target.value)}><option value="">Aucun fichier</option>{interestImports.map((item) => <option value={item.id} key={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <label><span>Séances affectées{!assignmentImports.length ? <button type="button" className="source-files-link" onClick={() => onOpenFiles("assignments")}>Ouvrir Fichiers</button> : null}</span><select value={assignmentImportId} onChange={(event) => setAssignmentImportId(event.target.value)}><option value="">Aucun fichier</option>{assignmentImports.map((item) => <option value={item.id} key={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <small>{latestTutorSnapshot ? `Statuts issus de la liste des tuteurs du ${formatDate(latestTutorSnapshot.date)}` : "Aucune liste de tuteurs disponible"}</small>
    </div>
    <div className="tutor-feed-date-tabs">{dates.map((date) => <button className={activeDate === date ? "active" : ""} onClick={() => setSelectedDate(date)} key={date}>{formatDate(date)}</button>)}</div>
    <div className="tutor-feed-owner-tabs"><span>Établissements :</span>{(["unassigned", "kelly", "pierre", "julie", "all"] as const).map((owner) => <button type="button" className={schoolOwnerFilter === owner ? "active" : ""} onClick={() => setSchoolOwnerFilter(owner)} key={owner}>{owner === "all" ? "Tous" : owner === "unassigned" ? "Non attribués" : schoolOwnerLabels[owner]}</button>)}</div>
    <div className="tutor-feed-controls">
      <div><strong>{activeDate ? formatDate(activeDate, true) : "Aucune date"}</strong><span>{dayResult.hiddenOverlapCount} créneau{dayResult.hiddenOverlapCount > 1 ? "x" : ""} occupé{dayResult.hiddenOverlapCount > 1 ? "s" : ""} masqué{dayResult.hiddenOverlapCount > 1 ? "s" : ""}</span></div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un tuteur, un établissement…" aria-label="Rechercher dans le fil" />
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">Tous les statuts</option><option value="tutor">Tuteurs</option><option value="candidate">Candidats</option></select>
      <select value={scheduleFilter} onChange={(event) => setScheduleFilter(event.target.value as typeof scheduleFilter)}><option value="all">Toutes les situations</option><option value="free">Sans autre séance ce jour</option><option value="assigned">Avec une autre séance ce jour</option></select>
    </div>
    <div className="tutor-feed-kpis"><span className="free"><strong>{visibleSlots.length}</strong> créneaux libres</span><span><strong>{peopleCount}</strong> personnes</span><span><strong>{tutorCount}</strong> tuteurs</span><span><strong>{candidateCount}</strong> candidats</span><span><strong>{availabilityCount}</strong> depuis disponibilités</span><span><strong>{interestCount}</strong> depuis intérêts</span></div>
    <div className="tutor-feed-list">
      {detailError ? <div className="empty-state"><span>!</span><h3>Fichier sélectionné indisponible</h3><p>{detailError}</p><button type="button" className="button quiet" onClick={() => { setDetailError(""); setDetailRetry((value) => value + 1); }}>Réessayer</button></div> : loadingDetails ? <div className="empty-state"><span>⏳</span><h3>Chargement des fichiers sélectionnés…</h3></div> : !availabilityImport && !interestImport ? <div className="empty-state"><span>🗂️</span><h3>Aucune source de disponibilités</h3><p>Choisissez un fichier existant ou ouvrez la bibliothèque partagée.</p><button type="button" className="button quiet" onClick={() => onOpenFiles("availability")}>Ouvrir Fichiers</button></div> : visibleSlots.length ? visibleSlots.map((slot) => <article className={`tutor-feed-card slot-card status-${slot.status} ${slot.otherAssignments.length ? "has-other-assignment" : "no-other-assignment"}`} key={`${slot.personId}-${slot.key}`}>
        <div className="tutor-feed-time"><strong>{slot.timeSlot.match(/\b\d{1,2}:\d{2}\b/)?.[0] || "—"}</strong><span>créneau libre</span></div>
        <div className="tutor-feed-person"><div><h3><PersonAdminLink personId={slot.personId} status={slot.status}>{tutorName(slot)}</PersonAdminLink></h3><span className={`person-status ${slot.status}`}>{slot.status === "tutor" ? "Tuteur" : slot.status === "candidate" ? "Candidat" : "Statut inconnu"}</span></div><p>ID {slot.personId}{slot.phone ? ` · ${slot.phone}` : ""}</p></div>
        <div className="tutor-feed-opportunities"><div><strong>{slot.timeSlot || "Horaire non précisé"}</strong><span>{slot.school || "Établissement non précisé"}{slot.className ? ` · ${slot.className}` : ""} · {schoolOwnerLabels[ownerForSlot(slot)]}</span><em>{slot.sources.map((source) => source === "availability" ? "Disponibilité" : "Intérêt").join(" + ")}{slot.validatedInterest ? " · validé" : ""}</em></div></div>
        <div className="tutor-feed-assignments">{slot.otherAssignments.length ? <><strong>Autres séances ce jour</strong>{slot.otherAssignments.map((assignment, index) => <span key={`${assignment.timeSlot}-${assignment.school}-${index}`}>{assignment.timeSlot} · {assignment.school}</span>)}</> : <><strong>Aucune autre séance</strong><span>Disponible sur ce créneau</span></>}</div>
      </article>) : <div className="empty-state"><span>📆</span><h3>Aucun créneau réellement libre</h3><p>Les créneaux qui chevauchent une séance affectée sont automatiquement masqués.</p></div>}
    </div>
  </section>;
}

"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import ParentHistoryDialog from "@/app/components/parent-history-dialog";
import "./customer-call-audit.css";

type Role = "parent" | "tutor-candidate" | "school" | "unknown";
type CallbackState = "not-applicable" | "completed" | "attempted" | "not-called";
type CallRecord = {
  id: string; date: string; timestamp: number; direction: "inbound" | "outbound"; callType: string;
  answered: boolean; missedReason: string; durationSeconds: number; talkSeconds: number; waitingSeconds: number;
  role: Role; branch: string; callerId: string; callerNumberAvailable: boolean; parentId: string; parentName: string; parentPhone: string; parentEnrollment: "inscrit" | "non-inscrit" | "inconnu";
  parentMatchAmbiguous: boolean; tutorName: string; tutorMatchAmbiguous: boolean; requiresCallback: boolean; callbackState: CallbackState; callbackAttemptCount: number; callbackManuallyCompleted?: boolean;
};
type ImportRow = { id: string; fileName: string; importedAt: string; rowCount: number; addedCount: number; duplicateCount: number; skippedCount: number };
type ParentOption = { id: string; name: string; enrolled: boolean | null };
type Payload = { calls?: CallRecord[]; imports?: ImportRow[]; parents?: ParentOption[]; settings?: { shortCallThresholdSeconds: number }; error?: string; detail?: string; import?: ImportRow; updatedCount?: number };
type RoleFilter = Role | "all";
const n = new Intl.NumberFormat("fr-FR");
const roleNames: Record<Role, string> = { parent: "Parents", "tutor-candidate": "Tuteurs / candidats", school: "Établissements", unknown: "À vérifier" };
const callTime = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const importTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

function dateLabel(value: string, weekday = true) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...(weekday ? { weekday: "short" as const } : {}), day: "2-digit", month: "short" }).format(date);
}

function durationLabel(value: number) {
  const seconds = Math.max(0, Math.round(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function displayPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits.match(/.{1,2}/g)?.join(" ") || value;
  return value.startsWith("+") ? value : `+${digits}`;
}

function dialPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("33") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+33${digits.slice(1)}`;
  return `+${digits}`;
}

function calledLabel(call: CallRecord) {
  if (call.parentName) return call.parentName;
  if (call.tutorName) return call.tutorName;
  const kind = call.role === "parent" ? "Parent" : call.role === "tutor-candidate" ? "Tuteur / candidat" : call.role === "school" ? "Établissement" : "Appelant";
  return `${kind} · ${call.callerId.slice(0, 6).toUpperCase()}`;
}

function callOutcome(call: CallRecord, threshold: number) {
  if (call.direction === "outbound") return call.answered ? "Sortant décroché" : "Sortant sans réponse";
  if (call.answered) return (call.talkSeconds || call.durationSeconds) <= threshold ? "Décroché · court" : "Décroché";
  if (call.callType.toLocaleLowerCase("fr").includes("out of business")) return "Hors horaires";
  if (call.callType.toLocaleLowerCase("fr").includes("abandoned")) return "Abandonné";
  return "Manqué";
}

export default function CustomerCallAudit() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [threshold, setThreshold] = useState("60");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCaller, setSelectedCaller] = useState("");
  const [historyParentId, setHistoryParentId] = useState("");
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [recallingCallId, setRecallingCallId] = useState("");
  const [linkingCallId, setLinkingCallId] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [linking, setLinking] = useState(false);

  async function readPayload(response: Response): Promise<Payload> {
    const text = await response.text();
    try { return JSON.parse(text) as Payload; }
    catch { throw new Error(`Réponse serveur invalide (HTTP ${response.status}).`); }
  }

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/customer-call-audit", { cache: "no-store" });
      const body = await readPayload(response);
      if (!response.ok) throw new Error(body.error || "Chargement impossible.");
      setCalls(body.calls || []); setImports(body.imports || []); setParents(body.parents || []);
      setThreshold(String(body.settings?.shortCallThresholdSeconds ?? 60));
      const latest = [...(body.calls || [])].sort((a, b) => b.date.localeCompare(a.date))[0]?.date || "";
      setSelectedDate((current) => (body.calls || []).some((call) => call.date === current) ? current : latest);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    const refresh = () => { void load(); };
    window.addEventListener("customer-call-audit-refresh", refresh);
    return () => window.removeEventListener("customer-call-audit-refresh", refresh);
  }, [load]);

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 15 Mo.");
      const response = await fetch(`/api/customer-call-audit?fileName=${encodeURIComponent(file.name)}`, {
        method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: await file.text(),
      });
      const body = await readPayload(response);
      if (!response.ok) throw new Error(body.error || "Import impossible.");
      const item = body.import;
      setNotice(item ? `${n.format(item.addedCount)} nouvel appel ajouté · ${n.format(item.duplicateCount)} doublon${item.duplicateCount === 1 ? "" : "s"} ignoré${item.duplicateCount === 1 ? "" : "s"}${item.skippedCount ? ` · ${n.format(item.skippedCount)} ligne(s) écartée(s)` : ""}.` : "Import terminé.");
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Import impossible."); }
    finally { setBusy(false); event.target.value = ""; }
  }

  async function saveThreshold() {
    const parsed = Number(threshold);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 600) { setError("Le seuil doit être compris entre 1 et 600 secondes."); return; }
    try {
      const response = await fetch("/api/customer-call-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shortCallThresholdSeconds: parsed }) });
      const body = await readPayload(response);
      if (!response.ok) throw new Error(body.error || "Enregistrement impossible.");
      setThreshold(String(body.settings?.shortCallThresholdSeconds ?? parsed)); setNotice("Seuil des appels courts enregistré.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Enregistrement impossible."); }
  }

  async function markParentRecalled(callId: string) {
    setRecallingCallId(callId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/customer-call-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-parent-recalled", callId }) });
      const body = await readPayload(response);
      if (!response.ok) throw new Error(body.error || "Mise à jour impossible.");
      setNotice("Rappel enregistré. Ce parent a été retiré de la liste des rappels à faire.");
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Mise à jour impossible."); }
    finally { setRecallingCallId(""); }
  }

  async function linkCallToParent(callId: string, parentId: string) {
    setLinking(true); setError("");
    try {
      const response = await fetch("/api/customer-call-audit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "link-parent", callId, parentId }) });
      const body = await readPayload(response);
      if (!response.ok) throw new Error(body.error || "Rapprochement impossible.");
      setNotice("Appelant relié à la fiche parent. Ses appels sont maintenant regroupés dans son historique.");
      setLinkingCallId(""); setParentSearch("");
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Rapprochement impossible."); }
    finally { setLinking(false); }
  }

  const filteredCalls = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return calls.filter((call) => (!startDate || call.date >= startDate) && (!endDate || call.date <= endDate))
      .filter((call) => roleFilter === "all" || call.role === roleFilter)
      .filter((call) => !needle || `${calledLabel(call)} ${call.callType} ${call.missedReason} ${call.branch}`.toLocaleLowerCase("fr").includes(needle));
  }, [calls, endDate, query, roleFilter, startDate]);
  const thresholdNumber = Number(threshold) || 60;
  const stats = useMemo(() => ({
    inbound: filteredCalls.filter((call) => call.direction === "inbound").length,
    missed: filteredCalls.filter((call) => call.direction === "inbound" && !call.answered).length,
    answered: filteredCalls.filter((call) => call.direction === "inbound" && call.answered).length,
    outbound: filteredCalls.filter((call) => call.direction === "outbound").length,
    short: filteredCalls.filter((call) => call.answered && (call.talkSeconds || call.durationSeconds) <= thresholdNumber).length,
  }), [filteredCalls, thresholdNumber]);
  const daily = useMemo(() => {
    const byDate = new Map<string, { date: string; total: number; missed: number; outbound: number }>();
    for (const call of filteredCalls) {
      const item = byDate.get(call.date) || { date: call.date, total: 0, missed: 0, outbound: 0 };
      item.total += 1;
      if (call.direction === "inbound" && !call.answered) item.missed += 1;
      if (call.direction === "outbound") item.outbound += 1;
      byDate.set(call.date, item);
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredCalls]);
  const visibleDate = daily.some((item) => item.date === selectedDate) ? selectedDate : daily.at(-1)?.date || "";
  const selectedDay = daily.find((item) => item.date === visibleDate);
  const dayCalls = filteredCalls.filter((call) => call.date === visibleDate).sort((a, b) => a.timestamp - b.timestamp);
  const queue = useMemo(() => {
    const grouped = new Map<string, { callerId: string; callId: string; parentId: string; name: string; enrollment: string; missed: number; attempts: number; latest: number; state: CallbackState }>();
    for (const call of filteredCalls) {
      if (call.role !== "parent" || !call.requiresCallback || call.callbackState === "completed") continue;
      const current = grouped.get(call.callerId) || { callerId: call.callerId, callId: call.id, parentId: call.parentId, name: call.parentName || calledLabel(call), enrollment: call.parentEnrollment, missed: 0, attempts: 0, latest: 0, state: call.callbackState };
      current.missed += 1; current.attempts += call.callbackAttemptCount;
      if (call.timestamp >= current.latest) { current.latest = call.timestamp; current.callId = call.id; }
      if (call.callbackState === "not-called") current.state = "not-called";
      else if (call.callbackState === "attempted" && current.state !== "not-called") current.state = "attempted";
      grouped.set(call.callerId, current);
    }
    return [...grouped.values()].sort((a, b) => (a.state === b.state ? b.latest - a.latest : a.state === "not-called" ? -1 : 1));
  }, [filteredCalls]);
  const selectedCallerCalls = selectedCaller ? calls.filter((call) => call.callerId === selectedCaller).sort((a, b) => a.timestamp - b.timestamp) : [];
  const parentOptions = parents.filter((parent) => parent.name.toLocaleLowerCase("fr").includes(parentSearch.trim().toLocaleLowerCase("fr"))).slice(0, 100);
  const maxDayCalls = Math.max(1, ...daily.map((item) => item.total));
  const onDateClick = (date: string) => { setSelectedDate(date); setSelectedCaller(""); };
  const openQueueParent = (item: (typeof queue)[number]) => {
    setQueueDialogOpen(false);
    if (item.parentId) { setSelectedCaller(""); setHistoryParentId(item.parentId); }
    else setSelectedCaller(item.callerId);
  };
  const renderQueueItem = (item: (typeof queue)[number], compact = false) => <div className={`customer-calls-queue-item ${compact ? "compact" : ""}`} key={item.callerId}>
    <button type="button" className="customer-calls-queue-open" onClick={() => openQueueParent(item)}><span className="customer-calls-queue-name"><strong>{item.name}</strong><small>{item.enrollment === "inscrit" ? "Déjà inscrit" : item.enrollment === "non-inscrit" ? "Non inscrit" : "Statut inconnu"} · dernier appel {new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" }).format(item.latest)} · {item.parentId ? "ouvrir l’historique complet" : "historique des appels"}</small></span><span className={`customer-calls-state ${item.state}`}>{item.state === "attempted" ? `Tentative · ${item.attempts}` : "À rappeler"}</span><span className="customer-calls-missed-count">{item.missed} manqué{item.missed > 1 ? "s" : ""}</span></button>
    <button type="button" className="customer-calls-mark-recalled" onClick={() => void markParentRecalled(item.callId)} disabled={recallingCallId === item.callId}>{recallingCallId === item.callId ? "Enregistrement…" : compact ? "Rappelé ✓" : "Ce parent a été rappelé ✓"}</button>
  </div>;

  return <main className="customer-calls-page">
    <section className="customer-calls-hero">
      <div><span className="customer-calls-kicker">AIRCall · QUALITÉ DE RÉPONSE</span><h1>Appels service client</h1><p>Repérez les appels manqués, les rappels à faire et les conversations trop courtes.</p></div>
      <label className="customer-calls-upload"><input type="file" accept=".csv,text/csv" onChange={(event) => void importFile(event)} disabled={busy} /><span aria-hidden="true">↥</span>{busy ? "Analyse du fichier…" : "Importer un CSV Aircall"}</label>
    </section>
    {error && <p className="customer-calls-alert error" role="alert">{error}</p>}
    {notice && <p className="customer-calls-alert success" role="status">{notice}</p>}
    <section className="customer-calls-controls task-panel" aria-label="Filtres et réglages">
      <label><span>Du</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label><span>Au</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <label><span>Type d’appelant</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}><option value="all">Tous les types</option>{Object.entries(roleNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="customer-calls-search"><span>Rechercher</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Parent, tuteur, établissement…" /></label>
      <label className="customer-calls-threshold"><span>Appel court si ≤</span><span className="customer-calls-threshold-input"><input type="number" min="1" max="600" value={threshold} onChange={(event) => setThreshold(event.target.value)} onBlur={() => void saveThreshold()} onKeyDown={(event) => { if (event.key === "Enter") { event.currentTarget.blur(); } }} /><b>sec</b></span></label>
    </section>
    <section className="customer-calls-stat-grid" aria-label="Indicateurs de la période">
      {[ ["Appels entrants", stats.inbound, "violet", "↙"], ["Manqués / sans réponse", stats.missed, "pink", "!"], ["Décrochés", stats.answered, "mint", "✓"], ["Appels sortants", stats.outbound, "blue", "↗"], ["Décrochés courts", stats.short, "orange", "◷"] ].map(([label, value, color, icon]) => <article className={`customer-call-stat ${color}`} key={String(label)}><span>{icon}</span><small>{label}</small><strong>{n.format(Number(value))}</strong></article>)}
    </section>
    {loading ? <section className="task-panel customer-calls-empty">Chargement des appels…</section> : !calls.length ? <section className="task-panel customer-calls-empty"><span>☎</span><h2>Importez un export Aircall</h2><p>Les enregistrements, messages vocaux et commentaires ne seront pas conservés.</p></section> : <>
      <section className="customer-calls-main-grid">
        <article className="task-panel customer-calls-chart-panel"><div className="customer-calls-panel-heading"><div><span>VUE JOURNALIÈRE</span><h2>Volume et appels manqués</h2></div><small>{n.format(filteredCalls.length)} appels sur la période</small></div>
          {selectedDay && <div className="customer-calls-chart-summary"><div><small>JOUR SÉLECTIONNÉ</small><strong>{dateLabel(selectedDay.date)}</strong></div><div><strong>{n.format(selectedDay.total)}</strong><small>appels au total</small></div><div className="missed"><strong>{n.format(selectedDay.missed)} <span>({selectedDay.total ? (selectedDay.missed / selectedDay.total * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : "0"} %)</span></strong><small>appels manqués</small></div></div>}
          {daily.length ? <div className="customer-calls-chart" role="group" aria-label="Appels par jour">
            {daily.map((item) => <button key={item.date} type="button" className={`customer-calls-day-bar ${visibleDate === item.date ? "active" : ""}`} onClick={() => onDateClick(item.date)} aria-label={`${dateLabel(item.date)} : ${item.total} appels au total, ${item.missed} manqués${item.total ? `, ${(item.missed / item.total * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} pour cent` : ""}`} title={`${dateLabel(item.date)} · ${item.total} appels · ${item.missed} manqués · ${item.total ? (item.missed / item.total * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : 0} %`}>
              <span className="customer-calls-bar-values"><b>{n.format(item.total)}</b><i>{n.format(item.missed)} manqués</i></span><span className="customer-calls-bar-track"><i style={{ height: `${Math.max(4, item.total / maxDayCalls * 100)}%` }} /><b style={{ height: `${item.total ? Math.max(0, item.missed / item.total * 100) : 0}%` }} /></span><small>{dateLabel(item.date, false)}</small>
            </button>)}
          </div> : <p className="customer-calls-empty-inline">Aucun appel sur cette période.</p>}
          <div className="customer-calls-legend"><span><i /> Volume total</span><span><i /> Manqués · part du volume journalier</span><small>Cliquez sur une colonne pour afficher le détail du jour.</small></div>
        </article>
        <article className="task-panel customer-calls-queue-panel"><div className="customer-calls-panel-heading"><div><span>À RELANCER</span><h2>Parents sans échange établi</h2></div><b>{queue.length}</b></div>
          {queue.length ? <div className="customer-calls-queue-list">{queue.slice(0, 8).map((item) => renderQueueItem(item, true))}</div> : <p className="customer-calls-empty-inline">Aucun parent en attente de rappel dans les filtres choisis.</p>}
          {queue.length > 0 && <button type="button" className="customer-calls-queue-more" onClick={() => setQueueDialogOpen(true)}>Afficher toute la liste · {queue.length} parent{queue.length > 1 ? "s" : ""} ↗</button>}
        </article>
      </section>
      {selectedCaller && <div className="customer-calls-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCaller(""); }}><section className="customer-calls-history-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-calls-history-title"><header><div><span>HISTORIQUE DES APPELS</span><h2 id="customer-calls-history-title">{selectedCallerCalls[0] ? calledLabel(selectedCallerCalls[0]) : "Appelant"}</h2>{selectedCallerCalls[0]?.parentPhone && <a href={`tel:${dialPhone(selectedCallerCalls[0].parentPhone)}`} className="customer-calls-call-phone">{displayPhone(selectedCallerCalls[0].parentPhone)} · Appeler ↗</a>}<p>{selectedCallerCalls.length} appel{selectedCallerCalls.length > 1 ? "s" : ""} retrouvé{selectedCallerCalls.length > 1 ? "s" : ""} pour ce numéro</p></div><button type="button" onClick={() => setSelectedCaller("")} aria-label="Fermer l’historique">×</button></header><div className="customer-calls-history-list">{selectedCallerCalls.map((call) => <div key={call.id}><b>{new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" }).format(call.timestamp)}</b><span>{call.direction === "inbound" ? "Entrant" : "Sortant"} · {callOutcome(call, thresholdNumber)}</span><span>{durationLabel(call.talkSeconds || call.durationSeconds)}</span>{call.direction === "inbound" && call.requiresCallback && <small>{call.callbackState === "completed" ? "Échange établi sous 24 h" : call.callbackState === "attempted" ? "Tentative sans échange établi" : "Aucun rappel établi"}</small>}</div>)}</div></section></div>}
      <section className="task-panel customer-calls-detail-panel"><div className="customer-calls-panel-heading"><div><span>DÉTAIL DU JOUR</span><h2>{visibleDate ? dateLabel(visibleDate) : "Aucune date"}</h2></div><small>{n.format(dayCalls.length)} appel{dayCalls.length > 1 ? "s" : ""}</small></div>
        {daily.length > 0 && <div className="customer-calls-date-strip">{daily.map((item) => <button type="button" key={item.date} className={visibleDate === item.date ? "active" : ""} onClick={() => onDateClick(item.date)}><strong>{dateLabel(item.date)}</strong><small>{n.format(item.missed)} manqué{item.missed === 1 ? "" : "s"} · {n.format(item.total)} appels</small></button>)}</div>}
        <div className="customer-calls-table-wrap"><table className="customer-calls-table"><thead><tr><th>Heure</th><th>Appelant</th><th>Téléphone</th><th>Type</th><th>Sens / résultat</th><th>Durée</th><th>Rappel après appel manqué</th></tr></thead><tbody>{dayCalls.map((call) => <tr key={call.id} className={call.callerNumberAvailable ? "customer-calls-clickable-row" : ""} tabIndex={call.callerNumberAvailable ? 0 : undefined} onClick={() => { if (call.callerNumberAvailable) { setHistoryParentId(""); setSelectedCaller(call.callerId); } }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget && call.callerNumberAvailable) { event.preventDefault(); setHistoryParentId(""); setSelectedCaller(call.callerId); } }} title={call.callerNumberAvailable ? "Cliquer pour afficher tous les appels de ce numéro" : undefined}><td>{callTime.format(call.timestamp)}</td><td>{call.parentId ? <button type="button" className="customer-calls-parent-link" onClick={(event) => { event.stopPropagation(); setHistoryParentId(call.parentId); }}>{calledLabel(call)} ↗</button> : <strong>{calledLabel(call)}</strong>}<small>{call.parentId ? call.parentEnrollment === "inscrit" ? "Parent inscrit · historique complet" : call.parentEnrollment === "non-inscrit" ? "Parent non inscrit · historique complet" : "Parent · statut inconnu" : call.parentMatchAmbiguous || call.tutorMatchAmbiguous ? "Rapprochement ambigu · à vérifier" : call.branch || "Rôle à vérifier"}</small>{!call.parentId && (call.role === "unknown" || call.role === "parent" || call.parentMatchAmbiguous) && <button type="button" className="customer-calls-link-parent" onClick={(event) => { event.stopPropagation(); setParentSearch(""); setLinkingCallId(call.id); }}>Relier à un parent…</button>}</td><td>{call.parentId && call.parentPhone ? <a className="customer-calls-call-phone" href={`tel:${dialPhone(call.parentPhone)}`} onClick={(event) => event.stopPropagation()} aria-label={`Appeler ${calledLabel(call)} au ${displayPhone(call.parentPhone)}`}>{displayPhone(call.parentPhone)}<small>Appeler ↗</small></a> : <span className="customer-calls-dash">—</span>}</td><td><span className={`customer-calls-role ${call.role}`}>{roleNames[call.role]}</span></td><td><span className={`customer-calls-outcome ${call.answered ? "answered" : "missed"}`}>{callOutcome(call, thresholdNumber)}</span>{call.missedReason && <small>{call.missedReason.replaceAll("_", " ")}</small>}</td><td>{durationLabel(call.talkSeconds || call.durationSeconds)}{call.answered && (call.talkSeconds || call.durationSeconds) <= thresholdNumber && <small className="customer-calls-short-label">À vérifier · appel court</small>}</td><td>{call.requiresCallback ? call.callbackState === "completed" ? <span className="customer-calls-state completed">Échange établi</span> : call.callbackState === "attempted" ? <span className="customer-calls-state attempted">Tentative sans échange</span> : <span className="customer-calls-state not-called">Aucun rappel établi</span> : <span className="customer-calls-dash">—</span>}</td></tr>)}</tbody></table>{!dayCalls.length && <p className="customer-calls-empty-inline">Aucun appel dans ce jour avec les filtres choisis.</p>}</div>
      </section>
      <section className="task-panel customer-calls-import-panel"><div className="customer-calls-panel-heading"><div><span>TRAÇABILITÉ</span><h2>Imports récents</h2></div><small>{n.format(calls.length)} appels conservés</small></div>{imports.length ? <div className="customer-calls-import-list">{imports.slice(0, 8).map((item) => <div key={item.id}><strong>{item.fileName}</strong><span>{importTime.format(new Date(item.importedAt))}</span><span>{n.format(item.rowCount)} lignes · {n.format(item.addedCount)} nouveaux · {n.format(item.duplicateCount)} doublons</span></div>)}</div> : <p className="customer-calls-empty-inline">Aucun import enregistré.</p>}<p className="customer-calls-privacy">🔒 Les données sont réservées aux utilisateurs connectés. Les numéros sont rapprochés côté serveur puis masqués dans les réponses; aucun fichier, message vocal ni enregistrement n’est conservé.</p></section>
    </>}
    {queueDialogOpen && <div className="customer-calls-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setQueueDialogOpen(false); }}><section className="customer-calls-queue-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-calls-queue-title"><header><div><span>FILE DE RAPPEL</span><h2 id="customer-calls-queue-title">Parents sans échange établi</h2><p>{queue.length} parent{queue.length > 1 ? "s" : ""} · confirmez le rappel pour les retirer de cette liste</p></div><button type="button" onClick={() => setQueueDialogOpen(false)} aria-label="Fermer la liste">×</button></header><div className="customer-calls-queue-dialog-list">{queue.length ? queue.map((item) => renderQueueItem(item)) : <p className="customer-calls-empty-inline">Tous les parents ont été rappelés.</p>}</div></section></div>}
    {linkingCallId && <div className="customer-calls-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !linking) setLinkingCallId(""); }}><section className="customer-calls-parent-link-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-calls-parent-link-title"><header><div><span>RAPPROCHEMENT MANUEL</span><h2 id="customer-calls-parent-link-title">Relier cet appel à un parent</h2><p>Cette association sera appliquée à tous les appels de ce numéro.</p></div><button type="button" onClick={() => setLinkingCallId("")} aria-label="Fermer" disabled={linking}>×</button></header><label className="customer-calls-parent-search"><span>Rechercher dans les fiches parents</span><input autoFocus value={parentSearch} onChange={(event) => setParentSearch(event.target.value)} placeholder="Nom du parent…" /></label><div className="customer-calls-parent-options">{parentOptions.map((parent) => <button type="button" key={parent.id} onClick={() => void linkCallToParent(linkingCallId, parent.id)} disabled={linking}><strong>{parent.name}</strong><small>{parent.enrolled === true ? "Inscrit" : parent.enrolled === false ? "Non inscrit" : "Statut inconnu"}</small></button>)}{!parentOptions.length && <p>Aucun parent correspondant à cette recherche.</p>}</div></section></div>}
    {historyParentId && <ParentHistoryDialog id={historyParentId} onClose={() => setHistoryParentId("")} />}
  </main>;
}

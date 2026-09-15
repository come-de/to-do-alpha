"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type UpcomingSession = {
  sessionId: string;
  schoolId: string;
  school: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: string;
  group: string;
  studentCount: number;
  classes: string[];
  room: string;
};

type SessionImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount: number;
  sourceSessionCount: number;
  rows: UpcomingSession[];
};

function formatDate(value: string, long = false) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "2-digit", month: "2-digit" }).format(date);
}

function formatImportDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function UnstaffedSessions() {
  const [imports, setImports] = useState<SessionImport[]>([]);
  const [selectedImportId, setSelectedImportId] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (silent = false) => {
    try {
      const response = await fetch("/api/upcoming-session-imports", { cache: "no-store" });
      const data = await response.json() as { imports?: SessionImport[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Chargement impossible");
      const next = data.imports ?? [];
      setImports(next);
      setSelectedImportId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || "");
      if (!silent) setMessage("Données actualisées");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(true), 0);
    const refresh = window.setInterval(() => void load(true), 30_000);
    return () => { window.clearTimeout(timer); window.clearInterval(refresh); };
  }, [load]);

  const activeImport = imports.find((item) => item.id === selectedImportId) ?? null;
  const dates = useMemo(() => Array.from(new Set((activeImport?.rows ?? []).map((row) => row.date))).sort(), [activeImport]);
  const categories = useMemo(() => Array.from(new Set((activeImport?.rows ?? []).map((row) => row.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr")), [activeImport]);
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fr");
    return (activeImport?.rows ?? []).filter((row) => {
      if (selectedDate !== "all" && row.date !== selectedDate) return false;
      if (category !== "all" && row.category !== category) return false;
      if (!needle) return true;
      return [row.school, row.schoolId, row.category, row.group, row.room, row.sessionId, ...row.classes].join(" ").toLocaleLowerCase("fr").includes(needle);
    });
  }, [activeImport, category, query, selectedDate]);
  const groupedRows = useMemo(() => {
    const groups = new Map<string, UpcomingSession[]>();
    visibleRows.forEach((row) => groups.set(row.date, [...(groups.get(row.date) ?? []), row]));
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visibleRows]);
  const schoolsCount = new Set(visibleRows.map((row) => row.schoolId || row.school)).size;
  const studentsCount = visibleRows.reduce((sum, row) => sum + row.studentCount, 0);

  async function upload(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setMessage("Import et regroupement des séances…");
    try {
      const rawCsv = await file.text();
      const response = await fetch(`/api/upcoming-session-imports?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: rawCsv });
      const data = await response.json() as { import?: SessionImport; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      await load(true);
      if (data.import?.id) setSelectedImportId(data.import.id);
      setSelectedDate("all");
      setMessage(`${data.import?.rows.length ?? 0} séances non affectées sauvegardées. Aucune donnée nominative d’élève n’a été conservée.`);
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const rows = [["Date", "Début", "Fin", "Établissement", "Catégorie", "Groupe", "Classes", "Nombre d’élèves", "Salle", "ID séance"]];
    visibleRows.forEach((row) => rows.push([row.date, row.startTime, row.endTime, row.school, row.category, row.group, row.classes.join(" | "), String(row.studentCount), row.room, row.sessionId]));
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seances-non-affectees-${selectedDate === "all" ? "toutes-dates" : selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <section className="task-panel unstaffed-panel">
    <div className="panel-heading">
      <div><p className="eyebrow">Pilotage des deux semaines</p><h2>Séances non affectées</h2><p>Une ligne par séance, sans nom d’élève. Les classes sont regroupées automatiquement.</p></div>
      <button type="button" className="ghost-button" onClick={() => void load()} disabled={saving}>↻ Actualiser</button>
    </div>

    <div className="unstaffed-toolbar">
      <label className="import-button">Importer le fichier CSV<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <label><span>Fichier analysé</span><select value={selectedImportId} onChange={(event) => { setSelectedImportId(event.target.value); setSelectedDate("all"); }}><option value="">Aucun fichier</option>{imports.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {formatImportDate(item.importedAt)}</option>)}</select></label>
      <label><span>Catégorie</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Toutes</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="unstaffed-search"><span>Recherche</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Établissement, classe, groupe…" /></label>
      <button type="button" className="button quiet" onClick={exportCsv} disabled={!visibleRows.length}>Exporter CSV</button>
    </div>
    {message ? <p className="enrollment-message">{message}</p> : null}

    {activeImport ? <>
      <div className="unstaffed-summary">
        <div className="highlight"><span>Séances non affectées</span><strong>{visibleRows.length}</strong></div>
        <div><span>Jours concernés</span><strong>{new Set(visibleRows.map((row) => row.date)).size}</strong></div>
        <div><span>Établissements</span><strong>{schoolsCount}</strong></div>
        <div><span>Élèves concernés</span><strong>{studentsCount}</strong></div>
        <small>Source : {activeImport.sourceRowCount} lignes · {activeImport.sourceSessionCount} séances distinctes</small>
      </div>
      <div className="unstaffed-date-tabs" role="group" aria-label="Filtrer par jour">
        <button className={selectedDate === "all" ? "active" : ""} onClick={() => setSelectedDate("all")}>Tous <b>{activeImport.rows.length}</b></button>
        {dates.map((date) => <button key={date} className={selectedDate === date ? "active" : ""} onClick={() => setSelectedDate(date)}>{formatDate(date)} <b>{activeImport.rows.filter((row) => row.date === date).length}</b></button>)}
      </div>
      <div className="unstaffed-days">
        {groupedRows.length ? groupedRows.map(([date, rows]) => <article className="unstaffed-day" key={date}>
          <header><div><span>{formatDate(date, true)}</span><small>{new Set(rows.map((row) => row.school)).size} établissements</small></div><strong>{rows.length} séance{rows.length > 1 ? "s" : ""}</strong></header>
          <div className="unstaffed-table-wrap"><table><thead><tr><th>Horaire</th><th>Établissement</th><th>Type</th><th>Groupe</th><th>Classes</th><th>Élèves</th><th>Salle</th></tr></thead><tbody>
            {rows.map((row) => <tr key={row.sessionId}><td><strong>{row.startTime || "—"}–{row.endTime || "—"}</strong><small>#{row.sessionId}</small></td><td>{row.school}</td><td><span className="session-category">{row.category || "—"}</span></td><td>{row.group || "—"}</td><td><div className="class-tags">{row.classes.length ? row.classes.map((item) => <span key={item}>{item}</span>) : <em>Non précisée</em>}</div></td><td>{row.studentCount || "—"}</td><td>{row.room || "—"}</td></tr>)}
          </tbody></table></div>
        </article>) : <div className="empty-state"><span>✓</span><h3>Aucune séance à afficher</h3><p>Modifiez les filtres ou choisissez un autre fichier.</p></div>}
      </div>
    </> : <div className="empty-state"><span>📋</span><h3>Importez le fichier des semaines à venir</h3><p>Le site identifiera les séances sans tuteur et supprimera les répétitions dues aux élèves.</p></div>}
  </section>;
}

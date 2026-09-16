"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EnrollmentImport, EnrollmentRow } from "@/app/lib/shared-data";

type ComparisonView = "new" | "lost" | "same";
type SchoolPortfolioOwner = "" | "kelly" | "pierre" | "julie";
type SchoolAssignment = { name: string; portfolioOwner: SchoolPortfolioOwner };

const schoolOwnerLabels: Record<SchoolPortfolioOwner, string> = { "": "Non attribués", kelly: "Kelly", pierre: "Pierre", julie: "Julie" };

function sortTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeImport(raw: Partial<EnrollmentImport>): EnrollmentImport {
  const now = new Date().toISOString();
  return {
    id: raw.id || `enrollment-${crypto.randomUUID()}`,
    importedAt: raw.importedAt || now,
    displayName: raw.displayName || raw.fileName?.replace(/\.[^.]+$/, "") || "Export inscriptions",
    fileName: raw.fileName || "parents.csv",
    sourceRowCount: Math.max(0, Number(raw.sourceRowCount) || 0),
    rows: Array.isArray(raw.rows)
      ? raw.rows.filter((row): row is EnrollmentRow => Boolean(row?.studentId && row?.slots))
      : [],
    createdAt: raw.createdAt || now,
  };
}

function normalizeSchool(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function importDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function studentName(row: EnrollmentRow) {
  return `${row.firstName} ${row.lastName}`.trim() || row.studentId;
}

function studentMap(rows: EnrollmentRow[]) {
  return new Map(rows.filter((row) => row.studentId && row.slots).map((row) => [row.studentId, row]));
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function EnrollmentComparison() {
  const [imports, setImports] = useState<EnrollmentImport[]>([]);
  const [schoolAssignments, setSchoolAssignments] = useState<SchoolAssignment[]>([]);
  const [referenceId, setReferenceId] = useState("");
  const [recentId, setRecentId] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [view, setView] = useState<ComparisonView>("new");
  const [query, setQuery] = useState("");
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadImports = useCallback(async (silent = false) => {
    try {
      const [response, schoolsResponse] = await Promise.all([
        fetch("/api/enrollment-imports", { cache: "no-store" }),
        fetch("/api/schools", { cache: "no-store" }),
      ]);
      const data = (await response.json()) as { imports?: Partial<EnrollmentImport>[]; error?: string; detail?: string };
      const schoolsData = (await schoolsResponse.json()) as { schools?: SchoolAssignment[]; error?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Chargement impossible");
      if (!schoolsResponse.ok) throw new Error(schoolsData.error || "Répartition des établissements indisponible");
      const nextImports = Array.isArray(data.imports)
        ? data.imports.map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt))
        : [];
      setImports(nextImports);
      setSchoolAssignments(schoolsData.schools ?? []);
      setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
      setRecentId((current) => (nextImports.some((item) => item.id === current) ? current : nextImports[0]?.id || ""));
      setReferenceId((current) =>
        nextImports.some((item) => item.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || "",
      );
      if (!silent) setMessage(nextImports.length ? "Historique chargé" : "Aucun export importé");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Historique indisponible");
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadImports(true), 0);
    const refreshTimer = window.setInterval(() => void loadImports(true), 30000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadImports]);

  const referenceImport = imports.find((item) => item.id === referenceId) ?? null;
  const recentImport = imports.find((item) => item.id === recentId) ?? null;

  const schools = useMemo(() => {
    const labels = new Map<string, string>();
    imports.flatMap((item) => item.rows).forEach((row) => {
      const key = normalizeSchool(row.school);
      if (key && !labels.has(key)) labels.set(key, row.school.trim());
    });
    return Array.from(labels.entries()).sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [imports]);

  const comparison = useMemo(() => {
    const filterRows = (rows: EnrollmentRow[]) =>
      schoolFilter === "all" ? rows : rows.filter((row) => normalizeSchool(row.school) === schoolFilter);
    const referenceMap = studentMap(filterRows(referenceImport?.rows ?? []));
    const recentMap = studentMap(filterRows(recentImport?.rows ?? []));
    const newStudents = Array.from(recentMap.values()).filter((student) => !referenceMap.has(student.studentId));
    const lostStudents = Array.from(referenceMap.values()).filter((student) => !recentMap.has(student.studentId));
    const sameStudents = Array.from(recentMap.values()).filter((student) => referenceMap.has(student.studentId));
    const sort = (rows: EnrollmentRow[]) => rows.sort((a, b) => studentName(a).localeCompare(studentName(b), "fr"));
    return {
      referenceCount: referenceMap.size,
      recentCount: recentMap.size,
      newStudents: sort(newStudents),
      lostStudents: sort(lostStudents),
      sameStudents: sort(sameStudents),
    };
  }, [recentImport, referenceImport, schoolFilter]);

  const schoolSummary = useMemo(() => {
    const referenceBySchool = new Map<string, Map<string, EnrollmentRow>>();
    const recentBySchool = new Map<string, Map<string, EnrollmentRow>>();
    const add = (target: Map<string, Map<string, EnrollmentRow>>, row: EnrollmentRow) => {
      const schoolKey = normalizeSchool(row.school);
      if (!schoolKey) return;
      if (!target.has(schoolKey)) target.set(schoolKey, new Map());
      target.get(schoolKey)?.set(row.studentId, row);
    };
    (referenceImport?.rows ?? []).forEach((row) => add(referenceBySchool, row));
    (recentImport?.rows ?? []).forEach((row) => add(recentBySchool, row));
    return schools
      .map(([key, label]) => {
        const before = referenceBySchool.get(key) ?? new Map<string, EnrollmentRow>();
        const after = recentBySchool.get(key) ?? new Map<string, EnrollmentRow>();
        const added = Array.from(after.keys()).filter((id) => !before.has(id)).length;
        const lost = Array.from(before.keys()).filter((id) => !after.has(id)).length;
        return { key, label, before: before.size, after: after.size, added, lost, net: after.size - before.size };
      })
      .filter((item) => item.before || item.after)
      .sort((a, b) => Math.abs(b.added + b.lost) - Math.abs(a.added + a.lost) || a.label.localeCompare(b.label, "fr"));
  }, [recentImport, referenceImport, schools]);

  const studentsByOwner = useMemo(() => {
    const counts: Record<SchoolPortfolioOwner, number> = { "": 0, kelly: 0, pierre: 0, julie: 0 };
    const ownersBySchool = new Map(schoolAssignments.map((school) => [normalizeSchool(school.name), school.portfolioOwner]));
    studentMap(recentImport?.rows ?? []).forEach((student) => {
      counts[ownersBySchool.get(normalizeSchool(student.school)) ?? ""] += 1;
    });
    return counts;
  }, [recentImport, schoolAssignments]);

  const displayedStudents = useMemo(() => {
    const rows = view === "new" ? comparison.newStudents : view === "lost" ? comparison.lostStudents : comparison.sameStudents;
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [row.studentId, row.firstName, row.lastName, row.className, row.school, row.slots]
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalizedQuery),
    );
  }, [comparison, query, view]);

  async function importFile(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setMessage("Import en cours…");
    try {
      const text = await file.text();
      const response = await fetch(`/api/enrollment-imports?fileName=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: { "Content-Type": "text/csv;charset=utf-8" },
        body: text,
      });
      const data = (await response.json()) as {
        import?: Partial<EnrollmentImport>;
        imports?: Partial<EnrollmentImport>[];
        error?: string;
        detail?: string;
      };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
      const created = data.import ? normalizeImport(data.import) : nextImports[0];
      const previousNewestId = imports[0]?.id || "";
      setImports(nextImports);
      setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
      if (created) setRecentId(created.id);
      setReferenceId(previousNewestId || nextImports[1]?.id || created?.id || "");
      setSchoolFilter("all");
      setView("new");
      setMessage(`Import sauvegardé : ${created?.rows.length ?? 0} élève(s) inscrit(s)`);
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function renameImport(id: string) {
    const displayName = (nameDrafts[id] || "").trim();
    if (!displayName) return setMessage("Le nom de l’import est obligatoire");
    setSaving(true);
    try {
      const response = await fetch("/api/enrollment-imports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, displayName }),
      });
      const data = (await response.json()) as { imports?: Partial<EnrollmentImport>[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Renommage impossible");
      const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
      setImports(nextImports);
      setNameDrafts(Object.fromEntries(nextImports.map((item) => [item.id, item.displayName])));
      setMessage("Nom sauvegardé");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Renommage impossible");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImport(item: EnrollmentImport) {
    if (!window.confirm(`Supprimer l’import « ${item.displayName} » ?`)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/enrollment-imports?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const data = (await response.json()) as { imports?: Partial<EnrollmentImport>[]; error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Suppression impossible");
      const nextImports = (data.imports ?? []).map(normalizeImport).sort((a, b) => sortTimestamp(b.importedAt) - sortTimestamp(a.importedAt));
      setImports(nextImports);
      setRecentId((current) => (nextImports.some((entry) => entry.id === current) ? current : nextImports[0]?.id || ""));
      setReferenceId((current) => (nextImports.some((entry) => entry.id === current) ? current : nextImports[1]?.id || nextImports[0]?.id || ""));
      setMessage("Import supprimé");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  }

  function exportCurrentView() {
    const category = view === "new" ? "Nouvelle inscription" : view === "lost" ? "Inscription perdue" : "Inscription stable";
    const rows = [
      ["Catégorie", "ID enfant", "Prénom", "Nom", "Classe", "Établissement", "Créneaux"],
      ...displayedStudents.map((row) => [category, row.studentId, row.firstName, row.lastName, row.className, row.school, row.slots]),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comparaison-inscriptions-${view}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const importLabel = (item: EnrollmentImport) => `${item.displayName} · ${importDate(item.importedAt)}`;

  return (
    <section className="task-panel enrollment-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Suivi des inscriptions</p>
          <h2>Comparer les inscriptions par établissement</h2>
          <p>Un élève est considéré inscrit uniquement lorsqu’il possède au moins un créneau.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => void loadImports()} disabled={saving}>↻ Actualiser</button>
      </div>

      <div className="availability-import-box">
        <div>
          <strong>Importer un export Parents</strong>
          <span>Les données bancaires et les coordonnées des parents ne sont jamais enregistrées.</span>
        </div>
        <label className="import-button">
          {saving ? "Enregistrement…" : "Choisir un fichier CSV"}
          <input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
      </div>
      {message ? <p className="enrollment-message">{message}</p> : null}

      <div className="enrollment-controls">
        <label>Fichier de référence
          <select value={referenceId} onChange={(event) => setReferenceId(event.target.value)}>
            <option value="">Sélectionner</option>
            {imports.map((item) => <option key={item.id} value={item.id}>{importLabel(item)}</option>)}
          </select>
        </label>
        <label>Fichier récent
          <select value={recentId} onChange={(event) => setRecentId(event.target.value)}>
            <option value="">Sélectionner</option>
            {imports.map((item) => <option key={item.id} value={item.id}>{importLabel(item)}</option>)}
          </select>
        </label>
        <label>Établissement
          <select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
            <option value="all">Tous les établissements</option>
            {schools.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label>Rechercher
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Élève, ID, classe…" />
        </label>
      </div>

      <div className="enrollment-summary">
        <div><span>Inscrits référence</span><strong>{comparison.referenceCount}</strong></div>
        <div><span>Inscrits récents</span><strong>{comparison.recentCount}</strong></div>
        <div className="positive"><span>Nouvelles inscriptions</span><strong>+{comparison.newStudents.length}</strong></div>
        <div className="negative"><span>Inscriptions perdues</span><strong>-{comparison.lostStudents.length}</strong></div>
        <div><span>Évolution nette</span><strong>{comparison.recentCount - comparison.referenceCount > 0 ? "+" : ""}{comparison.recentCount - comparison.referenceCount}</strong></div>
      </div>

      <div className="owner-count-strip enrollment-owner-counts">
        <span className="owner-count-title">Élèves inscrits par RH · fichier récent</span>
        {(["kelly", "pierre", "julie", ""] as SchoolPortfolioOwner[]).map((owner) => <div className={!owner ? "unassigned" : ""} key={owner || "unassigned"}><small>{schoolOwnerLabels[owner]}</small><strong>{studentsByOwner[owner]}</strong></div>)}
      </div>

      <div className="enrollment-school-summary">
        <div className="enrollment-section-title">
          <div><h3>Évolution par établissement</h3><p>Cliquez sur une ligne pour voir les élèves concernés.</p></div>
          {schoolFilter !== "all" ? <button type="button" className="text-button" onClick={() => setSchoolFilter("all")}>Voir tous</button> : null}
        </div>
        <div className="enrollment-school-table">
          <div className="enrollment-school-head"><span>Établissement</span><span>Avant</span><span>Après</span><span>Nouvelles</span><span>Perdues</span><span>Net</span></div>
          {schoolSummary.slice(0, 40).map((school) => (
            <button key={school.key} type="button" className={schoolFilter === school.key ? "active" : ""} onClick={() => setSchoolFilter(school.key)}>
              <strong>{school.label}</strong><span>{school.before}</span><span>{school.after}</span><span className="positive">+{school.added}</span><span className="negative">-{school.lost}</span><span>{school.net > 0 ? "+" : ""}{school.net}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="availability-history enrollment-history">
        <div><h3>Fichiers enregistrés</h3><p>{imports.length} export(s) conservé(s)</p></div>
        <div className="availability-history-list">
          {imports.map((item) => (
            <div key={item.id}>
              <label className="availability-import-name"><span>Nom de l’import</span><input value={nameDrafts[item.id] ?? item.displayName} onChange={(event) => setNameDrafts((current) => ({ ...current, [item.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void renameImport(item.id); }} /></label>
              <small>{importDate(item.importedAt)} · {item.fileName} · {item.rows.length} inscrit(s) sur {item.sourceRowCount} ligne(s)</small>
              <div className="availability-history-actions">
                <button type="button" className="text-button" onClick={() => void renameImport(item.id)}>Enregistrer le nom</button>
                <button type="button" className="text-button danger" onClick={() => void deleteImport(item)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="availability-tabs">
        <button type="button" className={view === "new" ? "active" : ""} onClick={() => setView("new")}>✨ Nouvelles ({comparison.newStudents.length})</button>
        <button type="button" className={view === "lost" ? "active" : ""} onClick={() => setView("lost")}>↘ Perdues ({comparison.lostStudents.length})</button>
        <button type="button" className={view === "same" ? "active" : ""} onClick={() => setView("same")}>= Stables ({comparison.sameStudents.length})</button>
        <button type="button" className="ghost-button" onClick={exportCurrentView} disabled={!displayedStudents.length}>Export CSV</button>
      </div>

      <div className={`enrollment-results ${view === "new" ? "is-new" : view === "lost" ? "is-lost" : ""}`}>
        {!referenceImport || !recentImport ? <div className="empty-state compact">Importez au moins deux fichiers, puis choisissez les deux exports à comparer.</div>
          : displayedStudents.length ? displayedStudents.map((student) => (
            <article key={student.studentId} className="enrollment-student-card">
              <div><h3>{studentName(student)}</h3><p>ID {student.studentId}{student.className ? ` · ${student.className}` : ""}</p></div>
              <strong>{student.school || "Établissement non renseigné"}</strong>
              <small>{student.slots.split(/\r?\n/).filter(Boolean).length} créneau(x)</small>
              <details><summary>Voir les créneaux</summary><pre>{student.slots}</pre></details>
            </article>
          )) : <div className="empty-state compact">Aucun élève dans cette catégorie.</div>}
      </div>
    </section>
  );
}

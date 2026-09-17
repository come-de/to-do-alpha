"use client";

import { useCallback, useEffect, useState } from "react";

type FileKind = "availability" | "assignments" | "interests" | "upcomingSessions" | "enrollments" | "tutors";
type StoredImport = {
  id: string;
  importedAt: string;
  displayName: string;
  fileName: string;
  sourceRowCount?: number;
  date?: string;
};

const fileConfig: Record<FileKind, { title: string; description: string; endpoint: string; icon: string; canUpload: boolean }> = {
  availability: { title: "Disponibilités des tuteurs", description: "Utilisées dans Comparaison dispos et Couverture tuteurs.", endpoint: "/api/availability-imports", icon: "📆", canUpload: true },
  assignments: { title: "Séances affectées", description: "Utilisées dans Couverture tuteurs.", endpoint: "/api/tutor-assignment-imports", icon: "🧩", canUpload: true },
  interests: { title: "Intérêts tuteurs et candidats", description: "Croisés avec les séances non affectées.", endpoint: "/api/tutor-interest-imports", icon: "🙋", canUpload: true },
  upcomingSessions: { title: "Séances des semaines à venir", description: "Utilisées pour repérer les séances encore non affectées.", endpoint: "/api/upcoming-session-imports", icon: "📋", canUpload: true },
  enrollments: { title: "Inscriptions parents", description: "Utilisées dans Comparaison inscriptions.", endpoint: "/api/enrollment-imports", icon: "🎒", canUpload: true },
  tutors: { title: "Listes de tuteurs", description: "Imports datés utilisés dans le suivi et les autres analyses.", endpoint: "/api/tutor-tracking", icon: "👨‍🏫", canUpload: true },
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default function FilesHub({ onOpen }: { onOpen: (kind: FileKind) => void }) {
  const [files, setFiles] = useState<Record<FileKind, StoredImport[]>>({ availability: [], assignments: [], interests: [], upcomingSessions: [], enrollments: [], tutors: [] });
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tutorImportDate, setTutorImportDate] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(async (silent = false) => {
    try {
      const kinds = Object.keys(fileConfig) as FileKind[];
      const responses = await Promise.all(kinds.map((kind) => fetch(`${fileConfig[kind].endpoint}?summary=1`, { cache: "no-store" })));
      const payloads = await Promise.all(responses.map((response) => response.json()));
      const next = { availability: [], assignments: [], interests: [], upcomingSessions: [], enrollments: [], tutors: [] } as Record<FileKind, StoredImport[]>;
      responses.forEach((response, index) => {
        if (!response.ok) throw new Error(payloads[index]?.detail || payloads[index]?.error || "Chargement impossible");
        const kind = kinds[index];
        next[kind] = Array.isArray(payloads[index]?.imports) ? payloads[index].imports : [];
      });
      setFiles(next);
      setDraftNames(Object.fromEntries(kinds.flatMap((kind) => next[kind].map((item) => [item.id, item.displayName]))));
      if (!silent) setMessage("Bibliothèque actualisée");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Bibliothèque indisponible");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(true), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function upload(kind: FileKind, file: File | undefined) {
    if (!file) return;
    if (kind === "tutors" && !tutorImportDate) return setMessage("Choisissez la date liée à la liste de tuteurs");
    setSaving(true);
    setMessage("Import en cours…");
    try {
      const rawCsv = await file.text();
      const config = fileConfig[kind];
      const response = kind === "availability"
        ? await fetch(config.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, rawCsv }) })
        : kind === "tutors"
          ? await fetch(config.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: tutorImportDate, fileName: file.name, rawCsv }) })
        : await fetch(`${config.endpoint}?fileName=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": "text/csv;charset=utf-8" }, body: rawCsv });
      const data = await response.json() as { error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Import impossible");
      await load(true);
      setMessage(`${config.title} : fichier sauvegardé`);
    } catch (error) {
      setMessage(error instanceof Error ? `Import non sauvegardé : ${error.message}` : "Import non sauvegardé");
    } finally {
      setSaving(false);
    }
  }

  async function rename(kind: FileKind, item: StoredImport) {
    const displayName = (draftNames[item.id] || "").trim();
    if (!displayName) return setMessage("Le nom du fichier est obligatoire");
    setSaving(true);
    try {
      const response = await fetch(fileConfig[kind].endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, displayName }),
      });
      const data = await response.json() as { error?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail || data.error || "Renommage impossible");
      await load(true);
      setMessage("Nom sauvegardé");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Renommage impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="task-panel files-panel">
      <div className="panel-heading"><div><p className="eyebrow">Bibliothèque partagée</p><h2>Fichiers</h2><p>Un fichier importé ici devient disponible dans tous les onglets qui l’utilisent.</p></div><button type="button" className="ghost-button" onClick={() => void load()} disabled={saving}>↻ Actualiser</button></div>
      {message ? <p className="enrollment-message">{message}</p> : null}
      <div className="files-grid">
        {(Object.keys(fileConfig) as FileKind[]).map((kind) => {
          const config = fileConfig[kind];
          return <article className="files-category" key={kind}>
            <div className="files-category-heading"><span>{config.icon}</span><div><h3>{config.title}</h3><p>{config.description}</p></div></div>
            <div className={`files-category-actions ${kind === "tutors" ? "with-date" : ""}`}>
              {kind === "tutors" ? <label className="files-import-date"><span>Date de la liste</span><input type="date" value={tutorImportDate} onChange={(event) => setTutorImportDate(event.target.value)} disabled={saving} /></label> : null}
              {config.canUpload ? <label className="import-button">Importer un CSV<input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => { void upload(kind, event.target.files?.[0]); event.currentTarget.value = ""; }} /></label> : null}
              <button type="button" className="text-button" onClick={() => onOpen(kind)}>Ouvrir l’analyse</button>
            </div>
            <div className="files-list">
              {files[kind].length ? files[kind].map((item) => <div key={item.id}>
                <input value={draftNames[item.id] ?? item.displayName} onChange={(event) => setDraftNames((current) => ({ ...current, [item.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void rename(kind, item); }} aria-label={`Nom du fichier ${item.fileName}`} />
                <small>{kind === "tutors" && item.date ? `Liste du ${new Intl.DateTimeFormat("fr-FR").format(new Date(`${item.date}T12:00:00`))} · ` : ""}{formatDate(item.importedAt)} · {item.fileName}{item.sourceRowCount ? ` · ${item.sourceRowCount} lignes` : ""}</small>
                <button type="button" className="text-button" onClick={() => void rename(kind, item)}>Enregistrer</button>
              </div>) : <p className="files-empty">Aucun fichier enregistré.</p>}
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}

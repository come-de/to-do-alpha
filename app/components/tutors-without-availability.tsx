"use client";

import { useEffect, useState } from "react";
import PersonAdminLink from "@/app/components/person-admin-link";

type Tutor = { id: string; firstName: string; lastName: string };
type Result = { tutors: Tutor[]; sources: { tutors: string; availability: string; assignments: string | null; upcoming: string | null } };

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function TutorsWithoutAvailability() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("Bonjour {prenom}, peux-tu renseigner tes disponibilités pour la période à venir ?");
  const [result, setResult] = useState<Result | null>(null);
  const [resultPeriod, setResultPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const periodValid = Boolean(startDate && endDate && startDate <= endDate);
  const currentResult = resultPeriod === `${startDate}:${endDate}` ? result : null;

  async function search() {
    if (!periodValid) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`/api/tutors-without-availability?${params}`, { cache: "no-store" });
      const data = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(data.error || "Recherche impossible.");
      setResult(data);
      setResultPeriod(`${startDate}:${endDate}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Recherche impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const refresh = () => { void search(); };
    window.addEventListener("tutors-without-availability-refresh", refresh);
    return () => window.removeEventListener("tutors-without-availability-refresh", refresh);
  });

  function exportCsv() {
    if (!currentResult) return;
    const rows = ["id;type;message", ...currentResult.tutors.map((tutor) => [
      csvCell(tutor.id),
      "tutor",
      csvCell(message.replace(/\{prenom\}/gi, tutor.firstName)),
    ].join(";"))];
    const blob = new Blob([`\uFEFF${rows.join("\r\n")}\r\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tuteurs-sans-disponibilite-${startDate}-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return <section className="task-panel">
    <div className="panel-heading"><div><h2>Tuteurs sans disponibilité</h2><p>Tuteurs sans disponibilité renseignée ni séance prévue sur la période sélectionnée.</p></div></div>
    <div className="tutor-tracking-import">
      <div className="tutors-without-controls">
        <label><strong>Date de début</strong><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label><strong>Date de fin</strong><input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        <button type="button" className="button primary" onClick={() => void search()} disabled={!periodValid || loading}>{loading ? "Recherche…" : "Afficher la liste"}</button>
      </div>
      {startDate && endDate && startDate > endDate && <p className="tutors-without-error">La date de fin doit être après la date de début.</p>}
      <label><strong>Message pour le CSV</strong><span>Insérez <code>{"{prenom}"}</code> pour personnaliser le prénom de chaque tuteur.</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} />
      </label>
      {error && <p className="tutors-without-error" role="alert">{error}</p>}
    </div>
    {currentResult && <>
      <div className="panel-heading tutor-tracking-list-heading"><div><h3>{currentResult.tutors.length} tuteur{currentResult.tutors.length > 1 ? "s" : ""} sans disponibilité ni séance</h3><p>Sources : {currentResult.sources.tutors} · {currentResult.sources.availability}{currentResult.sources.assignments ? ` · ${currentResult.sources.assignments}` : ""}{currentResult.sources.upcoming ? ` · ${currentResult.sources.upcoming}` : ""}</p></div>
        <button type="button" className="button primary" onClick={exportCsv}>Exporter en CSV</button>
      </div>
      {currentResult.tutors.length ? <div className="tutor-tracking-list">{currentResult.tutors.map((tutor) => <article className="tutor-tracking-card tutors-without-card" key={tutor.id}>
        <strong><PersonAdminLink personId={tutor.id} status="tutor">{`${tutor.firstName} ${tutor.lastName}`.trim() || tutor.id}</PersonAdminLink></strong><small>ID : {tutor.id}</small>
      </article>)}</div> : <div className="empty-state"><span>✓</span><h3>Aucun tuteur à afficher</h3><p>Tous les tuteurs de la dernière liste ont au moins une disponibilité ou une séance sur cette période.</p></div>}
    </>}
  </section>;
}

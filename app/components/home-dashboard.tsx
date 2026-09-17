"use client";

import { useCallback, useEffect, useState } from "react";

export type HomeDestination = "tasks" | "links" | "objectives" | "history" | "journal" | "schools" | "communications" | "staffing" | "staffingAudit" | "watchlist" | "tutorReports" | "tutors" | "availability" | "availabilityFeed" | "enrollments" | "coverage" | "unstaffed" | "files";
type Owner = "kelly" | "pierre" | "julie" | "unassigned";
type DashboardPayload = {
  unstaffed?: {
    importName: string;
    dates: Array<{ date: string; counts: Record<Owner, number>; total: number }>;
  };
  counts?: Record<string, number>;
  error?: string;
  detail?: string;
};

const ownerLabels: Record<Owner, string> = { kelly: "Kelly", pierre: "Pierre", julie: "Julie", unassigned: "Non attribués" };

const menuItems: Array<{ mode: HomeDestination; icon: string; title: string; description: string; countKey?: string }> = [
  { mode: "watchlist", icon: "👀", title: "À suivre", description: "Établissements nécessitant une attention particulière.", countKey: "watchlist" },
  { mode: "staffingAudit", icon: "📊", title: "Bilan staffing", description: "Enregistrer et suivre les séances non staffées par journée." },
  { mode: "tutorReports", icon: "🧾", title: "Bilans tuteurs", description: "Suivre les bilans non réalisés et les commentaires." },
  { mode: "communications", icon: "📣", title: "Communications", description: "Journal des communications envoyées aux différents publics.", countKey: "communications" },
  { mode: "availability", icon: "📆", title: "Comparaison dispos", description: "Comparer deux exports de disponibilités tuteurs.", countKey: "availability" },
  { mode: "coverage", icon: "🧩", title: "Couverture tuteurs", description: "Croiser les disponibilités et comparer deux staffings." },
  { mode: "schools", icon: "🏫", title: "Établissements", description: "Consulter le CRM et la répartition des établissements.", countKey: "schools" },
  { mode: "files", icon: "🗂️", title: "Fichiers", description: "Retrouver et gérer les imports partagés." },
  { mode: "availabilityFeed", icon: "🕒", title: "Fil des disponibilités", description: "Voir les créneaux libres dans l’ordre chronologique." },
  { mode: "history", icon: "📈", title: "Historique", description: "Comparer l’évolution du nombre d’élèves.", countKey: "history" },
  { mode: "enrollments", icon: "🎒", title: "Inscriptions", description: "Comparer les inscriptions entre deux exports." },
  { mode: "journal", icon: "✍️", title: "Journal", description: "Relire les nouvelles et décisions de l’Étude Alpha.", countKey: "journal" },
  { mode: "links", icon: "🔗", title: "Liens", description: "Accéder rapidement aux ressources partagées.", countKey: "links" },
  { mode: "objectives", icon: "🎯", title: "Objectifs", description: "Suivre les objectifs collectifs et individuels.", countKey: "objectives" },
  { mode: "unstaffed", icon: "📋", title: "Séances non affectées", description: "Identifier les séances à staffer et les personnes mobilisables.", countKey: "unstaffed" },
  { mode: "staffing", icon: "👥", title: "Staffing", description: "Suivre les volumes staffés et non staffés au quotidien.", countKey: "staffing" },
  { mode: "tasks", icon: "✅", title: "Tâches", description: "Organiser et suivre les actions de l’équipe.", countKey: "tasks" },
  { mode: "tutors", icon: "👨‍🏫", title: "Tuteurs", description: "Suivre les entrées, sorties et commentaires tuteurs." },
];

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function localDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function HomeDashboard({ onNavigate, onOpenUnstaffed }: { onNavigate: (mode: HomeDestination) => void; onOpenUnstaffed: (date: string, owner: Owner | "all") => void }) {
  const [data, setData] = useState<DashboardPayload>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const today = localDateKey();
      const response = await fetch(`/api/dashboard?today=${today}`, { cache: "no-store" });
      const payload = await response.json() as DashboardPayload;
      if (!response.ok) throw new Error(payload.detail || payload.error || "Chargement impossible");
      setData(payload);
      setMessage("");
    } catch (error) {
      if (!silent) setMessage(error instanceof Error ? error.message : "Résumé indisponible");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const refresh = window.setInterval(() => void load(true), 30_000);
    return () => { window.clearTimeout(initial); window.clearInterval(refresh); };
  }, [load]);

  const dates = data.unstaffed?.dates ?? [];
  const owners: Owner[] = ["kelly", "pierre", "julie", "unassigned"];

  return <>
    <section className="home-unstaffed-panel">
      <div className="home-section-heading">
        <div><p className="eyebrow">Trois prochaines dates</p><h2>Séances non staffées par responsable</h2><span>{data.unstaffed?.importName ? `Source : ${data.unstaffed.importName}` : "Dernier import Semaines à venir"}</span></div>
        <button type="button" className="ghost-button" onClick={() => void load()} disabled={loading}>↻ Actualiser</button>
      </div>
      {message ? <p className="enrollment-message">{message}</p> : null}
      {loading && !dates.length ? <div className="home-dashboard-loading">Chargement du résumé…</div> : dates.length ? <div className="home-unstaffed-table">
        <div className="home-unstaffed-row head"><span>Date</span>{owners.map((owner) => <span key={owner}>{ownerLabels[owner]}</span>)}<span>Total</span></div>
        {dates.map((item) => <div className="home-unstaffed-row" key={item.date}>
          <strong>{formatDate(item.date)}</strong>
          {owners.map((owner) => <button type="button" key={owner} onClick={() => onOpenUnstaffed(item.date, owner)}><b>{item.counts[owner]}</b><small>{ownerLabels[owner]}</small></button>)}
          <button type="button" className="total" onClick={() => onOpenUnstaffed(item.date, "all")}><b>{item.total}</b><small>Toutes</small></button>
        </div>)}
      </div> : <div className="empty-state compact"><span>✓</span><h3>Aucune séance à afficher</h3><p>Aucune date future n’est disponible dans le dernier import.</p></div>}
    </section>

    <section className="home-menu-section">
      <div className="home-section-heading"><div><p className="eyebrow">Navigation</p><h2>Tous les outils Alpha</h2><span>Choisissez un espace pour commencer.</span></div></div>
      <div className="home-menu-grid">{menuItems.map((item) => {
        const count = item.countKey ? data.counts?.[item.countKey] : undefined;
        return <button type="button" className="home-menu-card" key={item.mode} onClick={() => onNavigate(item.mode)}>
          <span className="home-menu-icon" aria-hidden="true">{item.icon}</span>
          <span><strong>{item.title}</strong><small>{item.description}</small></span>
          {typeof count === "number" ? <b>{count}</b> : <i aria-hidden="true">→</i>}
        </button>;
      })}</div>
    </section>
  </>;
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type HomeDestination = "tasks" | "links" | "objectives" | "history" | "journal" | "schools" | "communications" | "staffing" | "staffingAudit" | "staffingEvolution" | "watchlist" | "tutorReports" | "tutors" | "availability" | "availabilityFeed" | "enrollments" | "coverage" | "unstaffed" | "files";
type DashboardPayload = {
  counts?: Record<string, number>;
  error?: string;
  detail?: string;
};

const menuItems: Array<{ mode: HomeDestination; icon: string; title: string; description: string; countKey?: string }> = [
  { mode: "watchlist", icon: "👀", title: "À suivre", description: "Établissements nécessitant une attention particulière.", countKey: "watchlist" },
  { mode: "staffingAudit", icon: "📊", title: "Bilan staffing", description: "Enregistrer et suivre les séances non staffées par journée." },
  { mode: "staffingEvolution", icon: "🔄", title: "Évolution staffing", description: "Comparer deux exports Semaines à venir et suivre les changements par RH." },
  { mode: "tutorReports", icon: "🧾", title: "Bilans tuteurs", description: "Suivre les bilans non réalisés et les commentaires." },
  { mode: "communications", icon: "📣", title: "Communications", description: "Journal des communications envoyées aux différents publics.", countKey: "communications" },
  { mode: "availability", icon: "📆", title: "Comparaison dispos", description: "Comparer deux exports de disponibilités tuteurs.", countKey: "availability" },
  { mode: "coverage", icon: "🧩", title: "Tuteurs dispo sans séance", description: "Croiser les disponibilités, les intérêts et les séances à staffer." },
  { mode: "schools", icon: "🏫", title: "Établissements", description: "Consulter le CRM et la répartition des établissements.", countKey: "schools" },
  { mode: "files", icon: "🗂️", title: "Fichiers", description: "Retrouver et gérer les imports partagés." },
  { mode: "availabilityFeed", icon: "🕒", title: "Fil des disponibilités", description: "Voir les créneaux libres dans l’ordre chronologique." },
  { mode: "history", icon: "📈", title: "Historique", description: "Comparer l’évolution du nombre d’élèves.", countKey: "history" },
  { mode: "enrollments", icon: "🎒", title: "Inscriptions", description: "Comparer les inscriptions entre deux exports." },
  { mode: "journal", icon: "✍️", title: "Journal", description: "Relire les nouvelles et décisions de l’Étude Alpha.", countKey: "journal" },
  { mode: "links", icon: "🔗", title: "Liens", description: "Accéder rapidement aux ressources partagées.", countKey: "links" },
  { mode: "objectives", icon: "🎯", title: "Objectifs", description: "Suivre les objectifs collectifs et individuels.", countKey: "objectives" },
  { mode: "unstaffed", icon: "📋", title: "Séances non affectées", description: "Identifier les séances à staffer et les personnes mobilisables." },
  { mode: "staffing", icon: "👥", title: "Staffing", description: "Suivre les volumes staffés et non staffés au quotidien.", countKey: "staffing" },
  { mode: "tasks", icon: "✅", title: "Tâches", description: "Organiser et suivre les actions de l’équipe.", countKey: "tasks" },
  { mode: "tutors", icon: "👨‍🏫", title: "Tuteurs", description: "Suivre les entrées, sorties et commentaires tuteurs." },
];

export default function HomeDashboard({ onNavigate }: { onNavigate: (mode: HomeDestination) => void }) {
  const [data, setData] = useState<DashboardPayload>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
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

  return <>
    <section className="home-menu-section">
      <div className="home-section-heading"><div><p className="eyebrow">Navigation</p><h2>Tous les outils Alpha</h2><span>Choisissez un espace pour commencer.</span></div>{loading ? <span>Actualisation…</span> : message ? <span>{message}</span> : null}</div>
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

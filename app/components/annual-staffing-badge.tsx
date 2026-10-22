"use client";

import { useEffect, useState } from "react";

type AnnualStaffingSummary = {
  staffing?: { year: number; staffedSessions: number };
};

export default function AnnualStaffingBadge() {
  const [summary, setSummary] = useState<AnnualStaffingSummary["staffing"]>();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Résumé indisponible");
        return await response.json() as AnnualStaffingSummary;
      })
      .then((payload) => {
        if (!cancelled) setSummary(payload.staffing);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });
    return () => { cancelled = true; };
  }, []);

  const formattedCount = typeof summary?.staffedSessions === "number"
    ? new Intl.NumberFormat("fr-FR").format(summary.staffedSessions)
    : unavailable ? "—" : "…";

  return <aside className="annual-staffing-badge" aria-label={summary ? `${formattedCount} séances staffées en ${summary.year}` : "Total annuel des séances staffées"}>
    <span className="annual-staffing-spark" aria-hidden="true">✦</span>
    <span className="annual-staffing-copy">
      <small>{summary ? `CAP ${summary.year}` : "CAP ANNUEL"}</small>
      <strong>{formattedCount}</strong>
      <span>séances staffées</span>
    </span>
    <span className="annual-staffing-check" aria-hidden="true">↗</span>
  </aside>;
}

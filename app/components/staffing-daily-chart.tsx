"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type DailyRow = {
  date: string;
  total: number;
  unstaffed: number;
  percentage: number;
  tutors: number;
  unidentifiedTutors: number;
  nonStSessions: number | null;
  unclassifiedTutorSessions: number | null;
  byOwner: { owner: string; total: number; unstaffed: number }[];
};

export default function StaffingDailyChart({ days, owners, tutorTypeName, formatDate, formatChartDate }: {
  days: DailyRow[];
  owners: { owner: string; label: string }[];
  tutorTypeName?: string;
  formatDate: (date: string) => string;
  formatChartDate: (date: string) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const chartId = useId().replace(/:/g, "");
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const dailyChart = useMemo(() => {
    const labelWidth = 150;
    const width = Math.max(400, days.length * 84, availableWidth - labelWidth);
    const plotLeft = 42;
    const plotRight = width - 42;
    const plotTop = 28;
    const plotBottom = 190;
    const highestPercentage = Math.max(0, ...days.map((day) => day.percentage));
    const maximumPercentage = Math.max(10, Math.ceil(highestPercentage / 5) * 5);
    const points = days.map((day, index) => ({
      ...day,
      x: days.length <= 1 ? (plotLeft + plotRight) / 2 : plotLeft + index / (days.length - 1) * (plotRight - plotLeft),
      y: plotBottom - day.percentage / maximumPercentage * (plotBottom - plotTop),
    }));
    return { width, height: 470, labelWidth, plotLeft, plotRight, plotTop, plotBottom, maximumPercentage, points,
      polyline: points.map((point) => `${point.x},${point.y}`).join(" "),
    };
  }, [days, availableWidth]);

  return (<div className="staffing-daily-chart staffing-chart-pop" ref={containerRef}>
          <div className="staffing-daily-chart-heading">
            <div><h4><span aria-hidden="true">↗</span> Le staffing, jour après jour</h4><span>Pourcentage de séances non staffées · une colonne par journée</span></div>
            <strong className="staffing-chart-count">{days.length} journée{days.length > 1 ? "s" : ""}</strong>
          </div>
          <div className="staffing-chart-key"><span><i /> Non-staffing quotidien</span><span>Faites défiler les dates pour explorer la période →</span></div>
          {dailyChart.points.length ? <div className="staffing-daily-chart-table" role="group" aria-label="Évolution quotidienne des séances non staffées, des tuteurs distincts, des séances non-ST et des totaux par responsable RH">
            <svg className="staffing-daily-chart-labels" aria-hidden="true" width={dailyChart.labelWidth} height={dailyChart.height} viewBox={`0 0 ${dailyChart.labelWidth} ${dailyChart.height}`}>
              {[...Array.from({ length: 4 }, (_, index) => ({ y: dailyChart.plotBottom + 28 + index * 21, height: 21, tone: index })), ...owners.map((_, index) => ({ y: dailyChart.plotBottom + 137 + index * 34, height: 34, tone: index + 4 }))].map((band) => <rect key={band.y} className={`staffing-chart-band band-${band.tone}`} x={0} y={band.y} width="100%" height={band.height} />)}
              {Array.from({ length: 5 }, (_, index) => {
                const percentage = (dailyChart.maximumPercentage / 4) * (4 - index);
                const y = dailyChart.plotTop + (index / 4) * (dailyChart.plotBottom - dailyChart.plotTop);
                return <text className="axis-label y" x={dailyChart.labelWidth - 8} y={y + 3} key={index}>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(percentage)} %</text>;
              })}
              <text className="daily-row-label" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 43}>Séances totales</text>
              <text className="daily-row-label unstaffed" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 64}>Non staffées</text>
              <text className="daily-row-label tutors" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 85}>Tuteurs distincts</text>
              <text className="daily-row-label non-st" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 106}>Séances non-ST</text>
              {owners.map(({ owner, label }, index) => <g key={owner || "unassigned"}>
                <text className="daily-row-label owner-total" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 151 + index * 34}>{label} · total</text>
                <text className="daily-row-label owner-unstaffed" x={dailyChart.labelWidth - 8} y={dailyChart.plotBottom + 167 + index * 34}>{label} · non staff.</text>
              </g>)}
            </svg>
            <div className="staffing-daily-chart-scroll" tabIndex={0} role="region" aria-label="Dates et chiffres du graphique, défilement horizontal"><svg role="img" aria-label="Taux quotidien et détail des séances par responsable" width={dailyChart.width} height={dailyChart.height} viewBox={`0 0 ${dailyChart.width} ${dailyChart.height}`} style={{ width: dailyChart.width, height: dailyChart.height }}>
              {[...Array.from({ length: 4 }, (_, index) => ({ y: dailyChart.plotBottom + 28 + index * 21, height: 21, tone: index })), ...owners.map((_, index) => ({ y: dailyChart.plotBottom + 137 + index * 34, height: 34, tone: index + 4 }))].map((band) => <rect key={band.y} className={`staffing-chart-band band-${band.tone}`} x={0} y={band.y} width="100%" height={band.height} />)}
              <defs><linearGradient id={`${chartId}-line`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7038e8" /><stop offset="1" stopColor="#d52f7c" /></linearGradient><linearGradient id={`${chartId}-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f472b6" stopOpacity=".22" /><stop offset="1" stopColor="#f472b6" stopOpacity=".02" /></linearGradient></defs>
              {Array.from({ length: 5 }, (_, index) => {
                const y = dailyChart.plotTop + (index / 4) * (dailyChart.plotBottom - dailyChart.plotTop);
                return <line className="grid-line" x1={dailyChart.plotLeft} x2={dailyChart.plotRight} y1={y} y2={y} key={index} />;
              })}
              {dailyChart.points.length > 1 ? <polygon className="daily-area" style={{ fill: `url(#${chartId}-area)` }} points={`${dailyChart.points[0].x},${dailyChart.plotBottom} ${dailyChart.polyline} ${dailyChart.points[dailyChart.points.length - 1].x},${dailyChart.plotBottom}`} /> : null}
              {dailyChart.points.length > 1 ? <polyline className="daily-line" style={{ stroke: `url(#${chartId}-line)` }} points={dailyChart.polyline} /> : null}
              {dailyChart.points.map((point) => <g className="daily-point" key={point.date}>
                <line className="day-guide" x1={point.x} x2={point.x} y1={dailyChart.plotBottom} y2={dailyChart.height - 12} />
                <circle cx={point.x} cy={point.y} r="5"><title>{`${formatDate(point.date)} : ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(point.percentage)} % · ${point.unstaffed} non staffées sur ${point.total} · ${point.tutors} tuteur${point.tutors > 1 ? "s" : ""} distinct${point.tutors > 1 ? "s" : ""} par ID · ${point.unidentifiedTutors} référence${point.unidentifiedTutors > 1 ? "s" : ""} sans ID${point.nonStSessions === null ? " · classement ST indisponible" : ` · ${point.nonStSessions} séance${point.nonStSessions > 1 ? "s" : ""} avec non-ST identifié · ${point.unclassifiedTutorSessions} sans classement complet`}`}</title></circle>
                <text className="point-value" x={point.x} y={Math.max(dailyChart.plotTop + 9, point.y - 9)}>{new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(point.percentage)} %</text>
                <text className="axis-label date" x={point.x} y={dailyChart.plotBottom + 20}>{formatChartDate(point.date)}</text>
                <text className="daily-total" x={point.x} y={dailyChart.plotBottom + 43}>{point.total}</text>
                <text className="daily-unstaffed" x={point.x} y={dailyChart.plotBottom + 64}>{point.unstaffed}</text>
                <text className="daily-tutors" x={point.x} y={dailyChart.plotBottom + 85}>{point.tutors}</text>
                <text className="daily-non-st" x={point.x} y={dailyChart.plotBottom + 106}>{point.nonStSessions === null ? "—" : point.nonStSessions}</text>
                {point.unclassifiedTutorSessions ? <text className="daily-unclassified" x={point.x} y={dailyChart.plotBottom + 123}>+{point.unclassifiedTutorSessions} ?</text> : null}
                {point.byOwner.map((row, ownerIndex) => <g key={row.owner || "unassigned"}>
                  <text className="daily-owner-total" x={point.x} y={dailyChart.plotBottom + 151 + ownerIndex * 34}>{row.total}</text>
                  <text className="daily-owner-unstaffed" x={point.x} y={dailyChart.plotBottom + 167 + ownerIndex * 34}>{row.unstaffed}</text>
                </g>)}
              </g>)}
            </svg></div>
          </div> : <p className="staffing-daily-chart-empty">Aucune journée enregistrée sur cette période.</p>}
          {tutorTypeName ? <p className="staffing-daily-chart-note">Source des niveaux : {tutorTypeName}. Les « +N ? » sont les séances sans classement complet : aucun tuteur non-ST n’a pu être confirmé par ID et niveau dans l’import.</p> : null}
        </div>);
}

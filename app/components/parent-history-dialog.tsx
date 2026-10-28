"use client";

import { useEffect, useState } from "react";
import type { ParentContact } from "@/app/lib/parents";
import "./parent-history-dialog.css";

type HistoryCall = { id: string; timestamp: number; direction: "inbound" | "outbound"; answered: boolean; callType: string; durationSeconds: number; branch: string; missedReason: string };
type EnrollmentHistory = { importName: string; fileName: string; importedAt: string; studentName: string; school: string; className: string; slots: string };
type Payload = { contact?: ParentContact; calls?: HistoryCall[]; enrollmentHistory?: EnrollmentHistory[]; error?: string };
const frDate = (value: string | number) => {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" }).format(date);
};
const sourceName: Record<string, string> = { alpha: "Compte Alpha Éducation", aircall: "Aircall", visio: "Visioconférence", enrolled: "Inscription", brochure: "Demande de plaquette" };

export default function ParentHistoryDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [payload, setPayload] = useState<Payload>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/parents/history?id=${encodeURIComponent(id)}`, { cache: "no-store" }).then(async (response) => {
      const result = await response.json() as Payload;
      if (!response.ok) throw new Error(result.error || "Historique indisponible.");
      if (!cancelled) setPayload(result);
    }).catch((error: unknown) => { if (!cancelled) setPayload({ error: error instanceof Error ? error.message : "Historique indisponible." }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const contact = payload.contact;
  const calls = [...(payload.calls || [])].sort((a, b) => b.timestamp - a.timestamp);
  const events = contact ? [
    ...(contact.provenance || []).map((event) => ({ date: event.occurredAt || event.importedAt, title: sourceName[event.source] || event.source, detail: `${event.fileName} · importé le ${frDate(event.importedAt)}` })),
    ...(contact.brochureRequests || []).map((item) => ({ date: item.submittedAt, title: "Demande de plaquette", detail: [item.brochure, item.childClass].filter(Boolean).join(" · ") })),
    ...(contact.visioRegistrations || []).map((item) => ({ date: item.submittedAt, title: "Inscription visioconférence", detail: [item.selectedMeeting, item.rawSchool, item.childClass].filter(Boolean).join(" · ") })),
    ...(contact.aircallCalls || []).map((item) => ({ date: item.lastIncoming || item.firstIncoming, title: "Historique Aircall importé", detail: `${item.incomingCalls ?? 0} entrant(s), ${item.missedCalls ?? 0} manqué(s) · ${item.fileName}` })),
    ...(payload.enrollmentHistory || []).map((item) => ({ date: item.importedAt, title: `Inscription · ${item.studentName || "élève"}`, detail: [item.school, item.className, item.slots, `Import : ${item.importName || item.fileName}`].filter(Boolean).join(" · ") })),
    ...calls.map((item) => ({ date: item.timestamp, title: `Appel ${item.direction === "inbound" ? "entrant" : "sortant"} · ${item.answered ? "décroché" : "manqué"}`, detail: [item.branch, item.callType, `${Math.floor(item.durationSeconds / 60)} min ${item.durationSeconds % 60} s`, item.missedReason].filter(Boolean).join(" · ") })),
  ].filter((event) => event.date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return <div className="parent-history-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="parent-history-dialog" role="dialog" aria-modal="true" aria-labelledby="parent-history-title">
      <header><div><span>FICHE PARENT · HISTORIQUE CROISÉ</span><h2 id="parent-history-title">{contact?.fullName || [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") || "Historique du parent"}</h2><p>{[...(contact?.schools || []), ...(contact?.childClasses || [])].join(" · ") || "Établissement à préciser"}</p></div><button type="button" onClick={onClose} aria-label="Fermer la fiche">×</button></header>
      {loading ? <p className="parent-history-state">Chargement de l’historique…</p> : payload.error ? <p className="parent-history-state error">{payload.error}</p> : <>
        <div className="parent-history-contact">{contact?.emails.map((email) => <span key={email}>✉ {email}</span>)}{contact?.phones.map((phone) => <span key={phone}>☎ {phone}</span>)}<b>{contact?.suppression ? "Ne pas recontacter" : contact?.enrolled === true ? "Inscrit" : contact?.enrolled === false ? "Non inscrit" : "Inscription à préciser"}</b></div>
        <div className="parent-history-timeline"><h3>Parcours · {events.length} événements</h3>{events.length ? events.map((event, index) => <article key={`${event.title}-${event.date}-${index}`}><i /><time>{frDate(event.date)}</time><div><strong>{event.title}</strong><small>{event.detail}</small></div></article>) : <p>Aucun historique disponible pour cette fiche.</p>}</div>
      </>}
    </section>
  </div>;
}

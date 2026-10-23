"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { formatParentDate, parentEvents } from "@/app/lib/parent-provenance";
import { parentSourceLabels, type ParentContact, type ParentFollowUp, type ParentImport, type ParentImportRow, type ParentSource } from "@/app/lib/parents";
import "./parents-crm.css";

type CsvState = { headers: string[]; rows: string[][]; fileName: string };
type ImportSource = ParentSource | "combined";
type Field = "source" | "firstName" | "lastName" | "parentName" | "email" | "phone" | "school" | "enrolled" | "childClass" | "submittedAt" | "brochure" | "visioInterested" | "enrolledAnswer" | "contactPreference" | "selectedMeeting" | "expectations" | "knownVia" | "aircallStatus" | "aircallIncomingCalls" | "aircallMissedCalls" | "aircallAnsweredCalls" | "aircallFirstIncoming" | "aircallLastIncoming";
const fields: Array<{ key: Field; label: string; aliases: string[] }> = [
  { key: "source", label: "Source de chaque ligne", aliases: ["source", "source de donnees", "origine de la donnee"] },
  { key: "firstName", label: "Prénom", aliases: ["prenom", "first name", "firstname", "given name"] },
  { key: "lastName", label: "Nom", aliases: ["nom", "nom de famille", "last name", "lastname", "surname"] },
  { key: "parentName", label: "Nom du parent", aliases: ["nom du parent", "parent name"] },
  { key: "email", label: "E-mail", aliases: ["email", "e mail", "mail", "courriel"] },
  { key: "phone", label: "Téléphone", aliases: ["telephone", "phone", "mobile", "numero de telephone"] },
  { key: "school", label: "Établissement", aliases: ["etablissement", "school", "ecole"] },
  { key: "enrolled", label: "Créneaux / statut inscrit", aliases: ["creneaux", "slots", "inscrit", "inscription", "statut"] },
  { key: "submittedAt", label: "Date de la demande", aliases: ["horodateur", "timestamp", "date de reponse", "date de réponse"] },
  { key: "brochure", label: "Plaquette demandée", aliases: ["quelle plaquette", "brochure", "document demande"] },
  { key: "childClass", label: "Classe de l’enfant", aliases: ["classe", "class"] },
  { key: "visioInterested", label: "Intérêt visioconférence", aliases: ["visioconference", "visioconférence", "participer", "presentation", "présentation"] },
  { key: "enrolledAnswer", label: "Inscription déjà connue", aliases: ["deja inscrit", "déjà inscrit", "inscrit a l etude", "été inscrit"] },
  { key: "contactPreference", label: "Préférence de contact", aliases: ["quelle option", "option preferez"] },
  { key: "selectedMeeting", label: "Réunion choisie", aliases: ["quelle reunion", "quelle réunion", "reunion souhaitez"] },
  { key: "expectations", label: "Attentes exprimées", aliases: ["qu attendez vous", "attendez vous"] },
  { key: "knownVia", label: "Origine de la demande", aliases: ["connaissance du lien", "eu connaissance du lien"] },
  { key: "aircallStatus", label: "Statut du registre", aliases: ["statut registre"] },
  { key: "aircallIncomingCalls", label: "Appels entrants", aliases: ["appels entrants"] },
  { key: "aircallMissedCalls", label: "Appels manqués", aliases: ["entrants manques", "entrants manqués"] },
  { key: "aircallAnsweredCalls", label: "Appels décrochés", aliases: ["entrants decroches", "entrants décrochés"] },
  { key: "aircallFirstIncoming", label: "Premier appel entrant", aliases: ["premier appel entrant"] },
  { key: "aircallLastIncoming", label: "Dernier appel entrant", aliases: ["dernier appel entrant"] },
];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
const sourceOptions = [...Object.entries(parentSourceLabels), ["combined", "Base consolidée"]] as Array<[ImportSource, string]>;
const importSourceLabel = (source: ImportSource) => source === "combined" ? "Base consolidée" : parentSourceLabels[source];
const sourceNames: Record<ParentSource, string> = { alpha: "Alpha", aircall: "Aircall", visio: "Visio", enrolled: "Déjà inscrits", brochure: "Plaquette" };
type StatusFilter = "all" | "enrolled" | "not-enrolled" | "unknown" | "eligible" | "review" | "school-review" | "suppressed";
type SourceFilter = ParentSource | "all" | "multiple";
type SortOrder = "newest" | "oldest" | "name" | "sources";

function parseCsv(text: string) {
  const sample = text.slice(0, 4096);
  const delimiter = [";", ",", "\t"].sort((a, b) => sample.split(b).length - sample.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && char === delimiter) { row.push(cell.trim()); cell = ""; }
    else if (!quoted && (char === "\n" || char === "\r")) { if (char === "\r" && text[i + 1] === "\n") i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() ?? []).map((value) => value.replace(/^\uFEFF/, ""));
  return { headers, rows: rows.slice(0, 20000).map((values) => headers.map((_, i) => values[i] ?? "")) };
}

function inferColumns(headers: string[], aliases: string[]) {
  return headers.flatMap((header, index) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(header.trim()) && aliases.some((alias) => normalize(header).includes(normalize(alias))) ? [String(index)] : []);
}

function fieldColumns(headers: string[], field: Field) {
  return headers.flatMap((header, index) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(header.trim()) && fields.find((candidate) => candidate.key === field)?.aliases.some((alias) => normalize(header).includes(normalize(alias))) ? [String(index)] : []);
}

function enrollmentValue(value: string): boolean | null {
  const normalized = normalize(value);
  if (!normalized) return false;
  if (["non", "false", "0", "non inscrit", "aucun", "sans creneau", "no"].includes(normalized)) return false;
  if (["oui", "true", "1", "inscrit", "yes"].includes(normalized)) return true;
  if (/^\d+(?:[,.]\d+)?$/.test(normalized)) return Number(normalized.replace(",", ".")) > 0;
  if (normalized.startsWith("non ") || normalized.includes("sans creneau")) return false;
  if (normalized.includes("inscrit") || normalized.includes("creneau")) return true;
  return Boolean(value.trim());
}

function yesNoValue(value: string): boolean | null {
  const normalized = normalize(value);
  if (/^(oui|yes|true|1|bien sur|volontiers)/.test(normalized)) return true;
  if (/^(non|no|false|0)/.test(normalized)) return false;
  return null;
}

export default function ParentsCRM() {
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [imports, setImports] = useState<ParentImport[]>([]);
  const [canonicalSchools, setCanonicalSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [source, setSource] = useState<ImportSource>("alpha");
  const [csv, setCsv] = useState<CsvState | null>(null);
  const [mapping, setMapping] = useState<Record<Field, string[]>>({ source: [], firstName: [], lastName: [], parentName: [], email: [], phone: [], school: [], enrolled: [], childClass: [], submittedAt: [], brochure: [], visioInterested: [], enrolledAnswer: [], contactPreference: [], selectedMeeting: [], expectations: [], knownVia: [], aircallStatus: [], aircallIncomingCalls: [], aircallMissedCalls: [], aircallAnsweredCalls: [], aircallFirstIncoming: [], aircallLastIncoming: [] });

  async function refresh() {
    setLoading(true); setError("");
    try { const response = await fetch("/api/parents", { cache: "no-store" }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Chargement impossible."); setContacts(body.contacts ?? []); setImports(body.imports ?? []); setCanonicalSchools(body.canonicalSchools ?? []); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(() => { void refresh(); }, 0); return () => window.clearTimeout(timer); }, []);

  const stats = useMemo(() => ({
    all: contacts.length,
    enrolled: contacts.filter((contact) => contact.enrolled === true || contact.suppression).length,
    notEnrolled: contacts.filter((contact) => contact.enrolled === false && !contact.suppression).length,
    unknown: contacts.filter((contact) => contact.enrolled !== true && contact.enrolled !== false && !contact.suppression).length,
    brochure: contacts.filter((contact) => contact.sources.includes("brochure")).length,
    aircall: contacts.filter((contact) => contact.sources.includes("aircall")).length,
    visio: contacts.filter((contact) => contact.sources.includes("visio")).length,
    cross: contacts.filter((contact) => contact.sources.length > 1).length,
    schoolReview: contacts.filter((contact) => contact.schoolIssues?.length).length,
    suppressed: contacts.filter((contact) => contact.suppression).length,
    eligible: contacts.filter((contact) => contact.enrolled === false && !contact.suppression && !contact.needsReview && contact.followUp === "to-contact").length,
  }), [contacts]);
  const filtered = useMemo(() => contacts.map((contact) => ({ contact, events: parentEvents(contact) })).filter(({ contact }) => {
    const haystack = [contact.firstName, contact.lastName, contact.fullName, ...(contact.emails ?? []), ...(contact.phones ?? []), ...(contact.schools ?? []), ...(contact.schoolIssues ?? []).map((issue) => issue.raw), ...(contact.aircallCalls ?? []).map((call) => call.registryStatus)].join(" ").toLocaleLowerCase("fr");
    const matchesQuery = haystack.includes(query.toLocaleLowerCase("fr"));
    const matchesStatus = statusFilter === "all" || (statusFilter === "eligible" ? contact.followUp === "to-contact" && !contact.suppression && !contact.needsReview && contact.enrolled === false : statusFilter === "review" ? contact.needsReview : statusFilter === "school-review" ? Boolean(contact.schoolIssues?.length) : statusFilter === "suppressed" ? contact.suppression : statusFilter === "enrolled" ? contact.enrolled === true || contact.suppression : statusFilter === "not-enrolled" ? contact.enrolled === false && !contact.suppression : contact.enrolled !== true && contact.enrolled !== false && !contact.suppression);
    const matchesSource = sourceFilter === "all" || (sourceFilter === "multiple" ? contact.sources.length > 1 : contact.sources.includes(sourceFilter));
    return matchesQuery && matchesStatus && matchesSource;
  }).sort((left, right) => {
    if (sortOrder === "name") return (left.contact.fullName || `${left.contact.firstName} ${left.contact.lastName}`).localeCompare(right.contact.fullName || `${right.contact.firstName} ${right.contact.lastName}`, "fr");
    if (sortOrder === "sources") return right.contact.sources.length - left.contact.sources.length || (right.events[0]?.timestamp ?? 0) - (left.events[0]?.timestamp ?? 0);
    if (!left.events[0]) return 1;
    if (!right.events[0]) return -1;
    return sortOrder === "oldest" ? left.events[0].timestamp - right.events[0].timestamp : right.events[0].timestamp - left.events[0].timestamp;
  }), [contacts, query, sourceFilter, statusFilter, sortOrder]);

  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setError(""); setNotice("");
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error("Le fichier dépasse la limite de 15 Mo.");
      const parsed = parseCsv(await file.text()); if (!parsed.headers.length || !parsed.rows.length) throw new Error("Ce fichier CSV semble vide ou illisible.");
      setCsv({ ...parsed, fileName: file.name });
      const inferred = Object.fromEntries(fields.map((field) => [field.key, inferColumns(parsed.headers, field.aliases)])) as Record<Field, string[]>;
      setMapping(inferred);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Fichier illisible."); setCsv(null); }
    event.target.value = "";
  }

  async function importCsv() {
    if (!csv) return;
    setBusy(true); setError(""); setNotice("");
    const pickAll = (row: string[], field: Field) => mapping[field].map((column) => row[Number(column)] ?? "").map((value) => value.trim()).filter(Boolean);
    const pick = (row: string[], field: Field) => pickAll(row, field)[0] ?? "";
    const rows: ParentImportRow[] = csv.rows.map((row) => ({
      source: source === "combined" ? pick(row, "source") as ParentSource : undefined,
      firstName: pick(row, "firstName"), lastName: pick(row, "lastName"), fullName: pick(row, "parentName"), emails: pickAll(row, "email").flatMap((email) => email.split(/[;,]/).map((value) => value.trim()).filter(Boolean)), phones: pickAll(row, "phone").flatMap((phone) => phone.split(/[;,]/).map((value) => value.trim()).filter(Boolean)), school: pick(row, "school"),
      enrolled: (source === "alpha" || source === "combined" && pick(row, "source") === "alpha") && mapping.enrolled.length ? enrollmentValue(pick(row, "enrolled")) : null,
      childClass: pick(row, "childClass"), submittedAt: pick(row, "submittedAt"), brochure: pick(row, "brochure"), visioInterested: yesNoValue(pick(row, "visioInterested")),
      enrolledAnswer: pick(row, "enrolledAnswer"), contactPreference: pick(row, "contactPreference"), selectedMeeting: pick(row, "selectedMeeting"), expectations: pick(row, "expectations"), knownVia: pick(row, "knownVia"),
      aircallStatus: pick(row, "aircallStatus"), aircallIncomingCalls: pick(row, "aircallIncomingCalls"), aircallMissedCalls: pick(row, "aircallMissedCalls"), aircallAnsweredCalls: pick(row, "aircallAnsweredCalls"), aircallFirstIncoming: pick(row, "aircallFirstIncoming"), aircallLastIncoming: pick(row, "aircallLastIncoming"),
    })).filter((row) => row.firstName || row.lastName || row.fullName || row.emails?.length || row.phones?.length);
    try {
      if (source === "combined" && rows.some((row) => !row.source || !["alpha", "aircall", "visio", "enrolled", "brochure"].includes(row.source))) throw new Error("La colonne Source doit contenir Alpha, Aircall, Visio, Déjà inscrits ou Plaquette pour chaque ligne.");
      const batchSize = 750;
      const batchCount = Math.ceil(rows.length / batchSize);
      const importId = crypto.randomUUID();
      let imported = 0, matched = 0, review = 0, schoolReview = 0;
      for (let offset = 0; offset < rows.length; offset += batchSize) {
        const batch = rows.slice(offset, offset + batchSize);
        setNotice(`Import sécurisé en cours · lot ${Math.floor(offset / batchSize) + 1}/${batchCount}…`);
        const response = await fetch("/api/parents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, mixedSources: source === "combined", importId, fileName: csv.fileName, rows: batch }) });
        let body: { error?: string; imported?: number; matched?: number; review?: number; schoolReview?: number };
        try { body = await response.json(); }
        catch { throw new Error(`Réponse invalide au lot ${Math.floor(offset / batchSize) + 1}/${batchCount}. ${imported} ligne(s) ont déjà été enregistrées; le fichier peut être réimporté sans créer de doublons.`); }
        if (!response.ok) throw new Error(`${body.error || "Import impossible."} ${imported ? `${imported} ligne(s) déjà enregistrées; réimporte le même fichier si nécessaire.` : ""}`);
        imported += body.imported ?? batch.length; matched += body.matched ?? 0; review += body.review ?? 0; schoolReview += body.schoolReview ?? 0;
      }
      setNotice(`${imported} ligne(s) importée(s), ${matched} rapprochée(s), ${review} identité(s) à vérifier, ${schoolReview} établissement(s) à harmoniser.`); setCsv(null); await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Import impossible."); }
    finally { setBusy(false); }
  }

  async function updateContact(contact: ParentContact, changes: { followUp?: ParentFollowUp; confirmed?: boolean }) {
    try { const response = await fetch("/api/parents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: contact.id, ...changes }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setContacts((current) => current.map((item) => item.id === contact.id ? body.contact : item)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Modification impossible."); }
  }

  async function resolveSchool(contact: ParentContact, rawSchool: string, canonicalSchool: string) {
    try { const response = await fetch("/api/parents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: contact.id, rawSchool, canonicalSchool }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setContacts((current) => current.map((item) => item.id === contact.id ? body.contact : item)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Correction impossible."); }
  }

  async function deleteContact(contact: ParentContact) {
    if (!window.confirm(`Supprimer la fiche de ${[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "ce parent"} ?`)) return;
    const response = await fetch(`/api/parents?id=${encodeURIComponent(contact.id)}`, { method: "DELETE" });
    if (response.ok) setContacts((current) => current.filter((item) => item.id !== contact.id)); else setError("Suppression impossible.");
  }

  function exportEligible() {
    const rows = contacts.filter((contact) => contact.followUp === "to-contact" && !contact.suppression && !contact.needsReview && contact.enrolled === false);
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csvText = ["Nom complet;E-mail;Téléphone;Établissement(s);Sources", ...rows.map((contact) => [contact.fullName || `${contact.firstName} ${contact.lastName}`.trim(), contact.emails.join(", "), contact.phones.join(", "), contact.schools.join(", "), contact.sources.map((item) => parentSourceLabels[item]).join(", ")].map(quote).join(";"))].join("\r\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\uFEFF", csvText], { type: "text/csv;charset=utf-8" })); link.download = "parents-a-relancer.csv"; link.click(); URL.revokeObjectURL(link.href);
  }

  const cards: Array<{ key: string; title: string; value: number; icon: string; color: string }> = [
    { key: "all", title: "Parents centralisés", value: stats.all, icon: "✦", color: "violet" },
    { key: "multiple", title: "Sources croisées", value: stats.cross, icon: "✶", color: "yellow" },
    { key: "enrolled", title: "Déjà inscrits", value: stats.enrolled, icon: "✓", color: "peach" },
    { key: "not-enrolled", title: "Non inscrits", value: stats.notEnrolled, icon: "↗", color: "mint" },
    { key: "aircall", title: "Aircall", value: stats.aircall, icon: "☎", color: "blue" },
    { key: "eligible", title: "À relancer", value: stats.eligible, icon: "✉", color: "pink" },
  ];
  const visibleFields = fields.filter((field) => {
    if (source === "combined") return fieldColumns(csv?.headers ?? [], field.key).length > 0;
    if (source === "brochure") return ["firstName", "lastName", "parentName", "email", "phone", "childClass", "submittedAt", "brochure", "visioInterested"].includes(field.key);
    if (source === "visio") return ["firstName", "lastName", "parentName", "email", "phone", "school", "childClass", "submittedAt", "enrolledAnswer", "contactPreference", "selectedMeeting", "expectations", "knownVia"].includes(field.key);
    if (source === "aircall") return ["phone", "aircallStatus", "aircallIncomingCalls", "aircallMissedCalls", "aircallAnsweredCalls", "aircallFirstIncoming", "aircallLastIncoming"].includes(field.key);
    return ["firstName", "lastName", "parentName", "email", "phone", "school", ...(source === "alpha" ? ["enrolled"] : [])].includes(field.key);
  }).filter((field) => (source === "combined" || !["brochure", "visio", "aircall"].includes(source) || fieldColumns(csv?.headers ?? [], field.key).length > 0)
    && !(source !== "combined" && field.key === "parentName" && mapping.firstName.length > 0 && mapping.lastName.length > 0));
  const hasIdentityMapping = mapping.email.length > 0 || mapping.phone.length > 0 || mapping.firstName.length > 0 || mapping.lastName.length > 0 || mapping.parentName.length > 0;
  const canImport = hasIdentityMapping && (source !== "combined" || mapping.source.length > 0) && (source !== "alpha" || mapping.enrolled.length > 0);

  return <main className="parents-crm">
    <section className="parents-hero">
      <div><span className="parents-eyebrow">LE PARCOURS PARENT, EN UN REGARD</span><h1>Le lien se crée ici. <em>Le bon suivi aussi.</em></h1><p>Repère les comptes sans créneau, rapproche les signaux et protège les familles déjà inscrites.</p></div>
      <div className="parents-hero-orb" aria-hidden="true"><span>👋</span><i>✦</i><b>♥</b></div>
    </section>

    <section className="parents-import-panel">
      <div className="parents-section-heading"><div><span className="parents-eyebrow">01 · CENTRALISER</span><h2>Faire entrer les bonnes données</h2><p>CSV uniquement · colonnes ajustables · le fichier brut n’est jamais conservé.</p></div><span className="parents-import-count">{imports.length} import{imports.length > 1 ? "s" : ""}</span></div>
      <div className="parents-import-grid">
        {sourceOptions.map(([key, label], index) => <button type="button" className={`parents-source-card source-${key}`} key={key} onClick={() => { setSource(key); setCsv(null); setError(""); document.getElementById("parents-csv-input")?.click(); }}>
          <span className="parents-source-number">0{index + 1}</span><span className="parents-source-icon">{["🌱", "☎️", "🎥", "🛡️", "📄", "🧩"][index]}</span><strong>{label}</strong><small>{key === "combined" ? "Plaquettes, visios, inscrits et Aircall dans un seul fichier" : key === "enrolled" ? "Alimente la liste d’exclusion" : key === "alpha" ? "Comptes sans créneau = non inscrits" : key === "aircall" ? "Appelants non inscrits ou inconnus · rapprochement par téléphone" : key === "brochure" ? "Réponses Google Forms, même si les colonnes ont évolué" : "Participants et coordonnées"}</small><b>Importer un CSV <span>↗</span></b>
        </button>)}
      </div>
      <input id="parents-csv-input" className="parents-hidden-input" type="file" accept=".csv,text/csv" onChange={(event) => void pickFile(event)} />
      {csv && <div className="parents-import-preview">
        <div className="parents-preview-title"><div><strong>Préparer l’import · {importSourceLabel(source)}</strong><span>{csv.fileName} · {csv.rows.length.toLocaleString("fr-FR")} lignes détectées</span></div><button type="button" onClick={() => setCsv(null)} aria-label="Fermer">×</button></div>
        <div className="parents-mapping-grid">{visibleFields.map((field) => { const candidates = fieldColumns(csv.headers, field.key); const columns = candidates.length ? candidates : csv.headers.map((_, index) => String(index)); return <fieldset className="parents-mapping-field" key={field.key}><legend>{field.label}</legend>{columns.map((column) => { const index = Number(column); const header = csv.headers[index]; return <label key={`${field.key}-${index}`}><input type="checkbox" checked={mapping[field.key].includes(column)} onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.checked ? [...current[field.key], column] : current[field.key].filter((value) => value !== column) }))} /><span>{header || `Colonne ${index + 1}`}</span></label>; })}</fieldset>; })}</div>
        <div className="parents-preview-footer"><span>{source === "combined" ? "Le fichier contient les quatre sources et une colonne Source par ligne. Les données bancaires ne sont pas nécessaires." : source === "alpha" ? "Pour distinguer les comptes sans créneau, associe obligatoirement la colonne des créneaux/statut." : source === "brochure" ? "Les anciennes et nouvelles colonnes e-mail/téléphone sont regroupées automatiquement. Les doublons déjà inscrits seront exclus par coordonnées." : source === "aircall" ? "« Non inscrit » alimente les non-inscrits ; « inconnu » reste à qualifier. Les numéros partagés sont isolés pour vérification." : "Les lignes sans nom, e-mail ni téléphone seront ignorées."} Toute ambiguïté sera mise en vérification.</span><button className="parents-button parents-button-primary" type="button" disabled={busy || !canImport} onClick={() => void importCsv()}>{busy ? "Import en cours…" : "Valider l’import ✨"}</button></div>
      </div>}
      {imports.length > 0 && <div className="parents-recent-imports"><strong>Derniers imports</strong>{imports.slice(0, 3).map((item) => <span key={item.id}>{parentSourceLabels[item.source]} · {item.fileName} · {new Date(item.importedAt).toLocaleDateString("fr-FR")}</span>)}</div>}
    </section>

    {error && <div className="parents-alert error" role="alert">{error}</div>}{notice && <div className="parents-alert success" role="status">{notice}</div>}

    <section className="parents-insight-strip"><div><span className="parents-eyebrow">02 · REPÉRER LES SIGNAUX</span><h2>Des parcours, pas seulement des listes.</h2></div><p>Les fiches déjà inscrites restent visibles pour l’analyse, mais sont toujours exclues des relances.</p><div className="parents-eligible-count"><span>Relances exploitables</span><strong>{stats.eligible.toLocaleString("fr-FR")}</strong><small>sans exclusion ni doute d’identité</small></div></section>

    <div className="parents-stat-grid">{cards.map((card) => {
      const selected = card.key === "all" ? statusFilter === "all" && sourceFilter === "all" : card.key === "aircall" || card.key === "multiple" ? sourceFilter === card.key && statusFilter === "all" : statusFilter === card.key && sourceFilter === "all";
      return <button key={card.key} type="button" onClick={() => {
        if (card.key === "aircall" || card.key === "multiple") { setSourceFilter(selected ? "all" : card.key as SourceFilter); setStatusFilter("all"); }
        else { setStatusFilter(selected ? "all" : card.key as StatusFilter); setSourceFilter("all"); }
      }} className={`parents-stat-card ${card.color} ${selected ? "selected" : ""}`}><span className="parents-stat-icon">{card.icon}</span><span className="parents-stat-value">{card.value.toLocaleString("fr-FR")}</span><span className="parents-stat-title">{card.title}</span></button>;
    })}</div>

    <section className="parents-list-panel">
      <div className="parents-list-heading"><div><span className="parents-eyebrow">03 · SUIVI COMMERCIAL</span><h2>La base consolidée <span>{filtered.length}</span></h2><p className="parents-list-subtitle">Chaque source garde son fichier et sa date. Les filtres se combinent.</p></div><div className="parents-list-actions"><label className="parents-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, e-mail, téléphone, école…" /></label><label className="parents-sort-label">Trier <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="newest">Date · plus récent</option><option value="oldest">Date · plus ancien</option><option value="sources">Plus de sources</option><option value="name">Nom A–Z</option></select></label><button type="button" className="parents-button parents-button-primary" onClick={exportEligible} disabled={!stats.eligible}>Exporter les relances ↗</button></div></div>
      <div className="parents-filter-stack">
        <div className="parents-filter-row" role="group" aria-label="Filtrer par source"><span className="parents-filter-label">Sources</span>{[["all", "Toutes", stats.all], ...sourceOptions.filter(([key]) => key !== "combined").map(([key]) => [key, sourceNames[key as ParentSource], contacts.filter((contact) => contact.sources.includes(key as ParentSource)).length]), ["multiple", "Plusieurs sources", stats.cross]].map(([key, label, count]) => <button type="button" key={key} className={sourceFilter === key ? "active" : ""} aria-pressed={sourceFilter === key} onClick={() => setSourceFilter(key as SourceFilter)}>{label} <b>{count}</b></button>)}</div>
        <div className="parents-filter-row" role="group" aria-label="Filtrer par inscription et suivi"><span className="parents-filter-label">Situation</span>{[["all", `Tous (${stats.all})`], ["enrolled", `Inscrits (${stats.enrolled})`], ["not-enrolled", `Non inscrits (${stats.notEnrolled})`], ["unknown", `À préciser (${stats.unknown})`], ["eligible", `À relancer (${stats.eligible})`], ["review", "Identité à vérifier"], ["school-review", `Établissement à corriger (${stats.schoolReview})`], ["suppressed", `Exclusion (${stats.suppressed})`]].map(([key, label]) => <button type="button" key={key} className={statusFilter === key ? "active" : ""} aria-pressed={statusFilter === key} onClick={() => setStatusFilter(key as StatusFilter)}>{label}</button>)}</div>
      </div>
      <div className="parents-table-wrap"><table className="parents-table"><thead><tr><th>Parent</th><th>Établissement</th><th>Sources et parcours</th><th>Dernière trace</th><th>Inscription</th><th>Suivi</th><th aria-label="Actions" /></tr></thead><tbody>
        {loading ? <tr><td colSpan={7} className="parents-empty">Chargement des fiches…</td></tr> : filtered.length ? filtered.map(({ contact, events }) => <tr key={contact.id} className={contact.suppression ? "is-suppressed" : contact.needsReview ? "is-review" : ""}>
          <td><strong>{contact.fullName || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Sans nom"}</strong>{contact.emails.length ? <small>{contact.emails.join(" · ")}</small> : null}{contact.phones.length ? <small>{contact.phones.join(" · ")}</small> : null}{!contact.emails.length && !contact.phones.length ? <small>Coordonnée absente</small> : null}</td>
          <td>{[...contact.schools, ...(contact.childClasses ?? [])].map((school) => <span className="parents-school-chip" key={school}>{school}</span>)}{(contact.schoolIssues ?? []).map((issue) => <div className="parents-school-issue" key={issue.raw}><span title={issue.suggestions.join(" · ")}>{issue.raw} · à vérifier</span><select aria-label={`Corriger ${issue.raw}`} value="" onChange={(event) => { if (event.target.value) void resolveSchool(contact, issue.raw, event.target.value); }}><option value="">Associer à…</option>{canonicalSchools.map((school) => <option key={school} value={school}>{school}</option>)}</select></div>)}{!contact.schools.length && !contact.childClasses?.length && !contact.schoolIssues?.length ? <span className="parents-muted">—</span> : null}</td>
          <td className="parents-source-cell"><div className="parents-source-chips">{contact.sources.map((item) => <button type="button" key={item} title={`Afficher les contacts de la source ${parentSourceLabels[item]}`} className={`source-chip ${item}`} onClick={() => setSourceFilter(item)}>{sourceNames[item]}</button>)}{contact.sources.length > 1 ? <span className="parents-multi-badge">{contact.sources.length} sources</span> : null}</div>
            {contact.brochureRequests?.length ? <small className="parents-request-detail">Plaquette : {[...new Set(contact.brochureRequests.map((request) => request.brochure).filter(Boolean))].join(" · ") || "demande reçue"}</small> : null}
            {contact.visioRegistrations?.length ? <small className="parents-request-detail">Visio : {contact.visioRegistrations.at(-1)?.selectedMeeting || "réunion à préciser"}</small> : null}
            {contact.aircallCalls?.length ? <small className="parents-request-detail">Aircall : {contact.aircallCalls.at(-1)?.registryStatus || "statut inconnu"} · {contact.aircallCalls.at(-1)?.incomingCalls ?? "—"} appel(s)</small> : null}
            {events.length ? <details className="parents-provenance"><summary>Voir l’origine · {events.length} trace{events.length > 1 ? "s" : ""}</summary><ol>{events.map((event, index) => <li key={`${event.source}-${event.fileName}-${event.occurredAt}-${index}`}><strong>{sourceNames[event.source]} · {formatParentDate(event.occurredAt)}</strong><span>{event.dateKind === "source" ? "Date du formulaire ou de l’appel" : "Date d’import (source sans date)"}</span><span>Fichier : {event.fileName}</span>{event.dateKind === "source" ? <span>Importé le {formatParentDate(event.importedAt)}</span> : null}</li>)}</ol></details> : null}
          </td>
          <td className="parents-date-cell">{events[0] ? <><strong>{formatParentDate(events[0].occurredAt)}</strong><small>{events[0].dateKind === "source" ? sourceNames[events[0].source] : "Date d’import"}</small></> : <span className="parents-muted">—</span>}</td>
          <td><span className={`parents-status-pill ${contact.enrolled === true || contact.suppression ? "enrolled" : contact.enrolled === false ? "not-enrolled" : "unknown"}`}>{contact.suppression ? "Déjà client" : contact.enrolled === true ? "Inscrit" : contact.enrolled === false ? "Non inscrit" : "À préciser"}</span></td>
          <td>{contact.suppression ? <span className="parents-followup excluded">⊘ Ne pas recontacter</span> : contact.needsReview ? <button className="parents-followup review" onClick={() => void updateContact(contact, { confirmed: true })}>⚑ Confirmer l’identité distincte</button> : <select className={`parents-followup-select ${contact.followUp}`} value={contact.followUp} onChange={(event) => void updateContact(contact, { followUp: event.target.value as ParentFollowUp })}><option value="to-contact">↗ À relancer</option><option value="do-not-contact">⊘ Ne pas relancer</option><option value="review">⚑ À vérifier</option></select>}</td>
          <td><button className="parents-delete" type="button" onClick={() => void deleteContact(contact)} aria-label="Supprimer cette fiche">×</button></td>
        </tr>) : <tr><td colSpan={7} className="parents-empty">{contacts.length ? "Aucun contact pour ces filtres." : "Aucune fiche pour l’instant. Importe un premier CSV pour démarrer."}</td></tr>}
      </tbody></table></div>
      <p className="parents-privacy-note">🔒 Données accessibles après connexion. Les fichiers CSV ne sont pas conservés. Les exclusions et les identités à vérifier ne peuvent pas être exportées pour relance.</p>
    </section>
  </main>;
}

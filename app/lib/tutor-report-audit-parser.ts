import {
  normalizeTutorReportSchoolKey,
  parseCsvRows,
  sanitizeTutorReportAuditDay,
  type School,
  type TutorReportAuditDay,
  type TutorReportAuditSchoolMapping,
} from "@/app/lib/shared-data";

type TutorIdentityRecord = { tutorId: string; phone: string; firstName?: string; lastName?: string };
type ParsedTutorReportAudit = { days: TutorReportAuditDay[]; invalidDateRowCount: number; skippedNonAlphaRows: number };

function normalizedHeader(value: string) {
  return value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}

function normalizeDate(value: string) {
  const raw = value.trim();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  const french = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/);
  const year = Number(iso?.[1] ?? french?.[3]);
  const month = Number(iso?.[2] ?? french?.[2]);
  const day = Number(iso?.[3] ?? french?.[1]);
  if (!year || !month || !day) return "";
  const checked = new Date(Date.UTC(year, month - 1, day));
  return checked.getUTCFullYear() === year && checked.getUTCMonth() === month - 1 && checked.getUTCDate() === day
    ? `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : "";
}

function isAlphaSchool(school: School) {
  const category = `${school.category} ${school.schoolType}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  return category.includes("alpha") || category.includes("etude");
}

function phoneKey(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0033") && digits.length === 13) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("33") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

function nameKey(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function matchSchool(sourceName: string, schools: School[], mappings: TutorReportAuditSchoolMapping) {
  const key = normalizeTutorReportSchoolKey(sourceName);
  const id = mappings[key];
  if (id === "excluded") return { school: null, excluded: true };
  const explicit = id ? schools.find((school) => school.id === id || school.externalId === id) : undefined;
  const exact = explicit || schools.find((school) => normalizeTutorReportSchoolKey(school.name) === key);
  return { school: exact || null, excluded: false };
}

export function parseTutorReportAuditCsv(csv: string, fileName: string, schools: School[], mappings: TutorReportAuditSchoolMapping, tutors: TutorIdentityRecord[]): ParsedTutorReportAudit {
  const rows = parseCsvRows(csv.replace(/^\uFEFF/, "")).filter((row) => row.some(Boolean));
  if (rows.length < 2) throw new Error("Aucune ligne de rapport exploitable");
  const headers = rows[0].map(normalizedHeader);
  const find = (aliases: string[]) => headers.findIndex((header) => aliases.includes(header));
  const dateIndex = find(["date"]);
  const firstIndex = find(["prenomtuteur", "prenomdututeur"]);
  const lastIndex = find(["nomtuteur", "nomdututeur"]);
  const phoneIndex = find(["numerotuteur", "numerodututeur"]);
  const schoolIndex = find(["etablissement", "ecole"]);
  const reportIndex = find(["bilan", "rapport", "compterendu"]);
  if ([dateIndex, firstIndex, lastIndex, schoolIndex, reportIndex].some((index) => index < 0)) {
    throw new Error("Colonnes requises introuvables : Date, Prénom tuteur, Nom tuteur, Établissement et bilan.");
  }
  const rosterIdsByPhone = new Map<string, Set<string>>();
  const rosterIdsByName = new Map<string, Set<string>>();
  tutors.forEach((tutor) => {
    if (!tutor.tutorId) return;
    const phone = phoneKey(tutor.phone);
    const name = nameKey(`${tutor.firstName || ""} ${tutor.lastName || ""}`);
    if (phone) rosterIdsByPhone.set(phone, new Set([...(rosterIdsByPhone.get(phone) || []), tutor.tutorId]));
    if (name) rosterIdsByName.set(name, new Set([...(rosterIdsByName.get(name) || []), tutor.tutorId]));
  });
  const uniqueId = (ids: Set<string> | undefined) => ids?.size === 1 ? Array.from(ids)[0] : "";
  // Resolve phone-backed names across the whole file first, so rows with a
  // blank phone are grouped consistently regardless of CSV row order.
  for (const row of rows.slice(1)) {
    if (!normalizeDate(row[dateIndex] || "")) continue;
    const name = `${(row[firstIndex] || "").trim()} ${(row[lastIndex] || "").trim()}`.trim();
    const normalizedName = nameKey(name);
    const phone = phoneIndex >= 0 ? phoneKey(row[phoneIndex] || "") : "";
    const tutorId = uniqueId(phone ? rosterIdsByPhone.get(phone) : undefined);
    if (tutorId && normalizedName) {
      rosterIdsByName.set(normalizedName, new Set([...(rosterIdsByName.get(normalizedName) || []), tutorId]));
    }
  }
  type TutorCounts = { key: string; tutorId: string; name: string; expectedCount: number; missingCount: number; schools: Map<string, { expectedCount: number; missingCount: number; completedReportCount: number; completedReportCharacterCount: number }> };
  const byDate = new Map<string, Map<string, TutorCounts>>();
  let invalidDateRowCount = 0;
  let skippedNonAlphaRows = 0;
  for (const row of rows.slice(1)) {
    const date = normalizeDate(row[dateIndex] || "");
    if (!date) { invalidDateRowCount += 1; continue; }
    const schoolName = (row[schoolIndex] || "").trim();
    if (!schoolName) { skippedNonAlphaRows += 1; continue; }
    const match = matchSchool(schoolName, schools, mappings);
    // Keep manually excluded school aggregates so the user can restore them
    // later. Their mapping keeps them outside Alpha totals until reclassified.
    if ((match.school && !isAlphaSchool(match.school))) { skippedNonAlphaRows += 1; continue; }
    const first = (row[firstIndex] || "").trim();
    const last = (row[lastIndex] || "").trim();
    const name = `${first} ${last}`.trim() || "Tuteur non identifié";
    const phone = phoneIndex >= 0 ? phoneKey(row[phoneIndex] || "") : "";
    const normalizedTutorName = nameKey(name);
    const tutorId = uniqueId(phone ? rosterIdsByPhone.get(phone) : undefined) || uniqueId(rosterIdsByName.get(normalizedTutorName));
    const normalizedName = nameKey(name).replace(/ /g, "-") || "inconnu";
    const key = tutorId ? `id:${tutorId}` : `name:${normalizedName}`;
    const day = byDate.get(date) || new Map<string, TutorCounts>();
    const tutor = day.get(key) || { key, tutorId, name, expectedCount: 0, missingCount: 0, schools: new Map() };
    const school = tutor.schools.get(schoolName) || { expectedCount: 0, missingCount: 0, completedReportCount: 0, completedReportCharacterCount: 0 };
    const report = (row[reportIndex] || "").trim();
    const missing = !report;
    tutor.expectedCount += 1;
    if (missing) tutor.missingCount += 1;
    school.expectedCount += 1;
    if (missing) school.missingCount += 1;
    else {
      school.completedReportCount += 1;
      school.completedReportCharacterCount += report.length;
    }
    tutor.schools.set(schoolName, school);
    day.set(key, tutor);
    byDate.set(date, day);
  }
  const now = new Date().toISOString();
  const parsedDays = Array.from(byDate.entries()).map(([date, tutorsForDate]) => sanitizeTutorReportAuditDay({
    date, sourceFileName: fileName,
    sourceRowCount: Array.from(tutorsForDate.values()).reduce((sum, tutor) => sum + tutor.expectedCount, 0),
    excludedTutorKeys: [],
    tutors: Array.from(tutorsForDate.values()).map((tutor) => ({
      key: tutor.key, tutorId: tutor.tutorId, name: tutor.name,
      expectedCount: tutor.expectedCount, missingCount: tutor.missingCount,
      schools: Array.from(tutor.schools.entries()).map(([sourceName, counts]) => ({ sourceName, ...counts })),
    })),
    createdAt: now, updatedAt: now,
  }));
  return { days: parsedDays, invalidDateRowCount, skippedNonAlphaRows };
}

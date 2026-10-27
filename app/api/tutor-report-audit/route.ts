import { withIdentity } from "@/app/lib/with-identity";
import { parseTutorReportAuditCsv } from "@/app/lib/tutor-report-audit-parser";
import { NextResponse } from "next/server";
import {
  clearLegacyTutorReports,
  normalizeTutorReportSchoolKey,
  readSchools,
  readTutorReportAuditDays,
  readTutorReportAuditSchoolMappings,
  readTutorReportComments,
  readTutorReports,
  readTutorTracking,
  writeTutorReportAuditDays,
  writeTutorReportAuditSchoolMappings,
  writeTutorReportComments,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function getHandler() {
  try {
    const [days, schools, mappings, comments, legacyReports] = await Promise.all([
      readTutorReportAuditDays(), readSchools(), readTutorReportAuditSchoolMappings(), readTutorReportComments(), readTutorReports(),
    ]);
    // Preserve global tutor comments while clearing the superseded dated manual snapshots.
    await writeTutorReportComments(comments);
    if (legacyReports.length) await clearLegacyTutorReports();
    return json({ days, schools, mappings, comments });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Chargement du suivi impossible" }, 500);
  }
}

async function postHandler(request: Request) {
  const startedAt = Date.now();
  const trace = (stage: string) => console.info("[tutor-report-import]", stage, { elapsedMs: Date.now() - startedAt });
  const measured = async <T,>(stage: string, operation: () => Promise<T>): Promise<T> => {
    trace(`${stage}:start`);
    const result = await operation();
    trace(`${stage}:done`);
    return result;
  };
  trace("handler:start");
  try {
    const url = new URL(request.url);
    const csv = await measured("read-body", () => request.text());
    if (!csv.trim()) return json({ error: "Fichier CSV vide" }, 400);
    const [schools, tracking, savedDays, mappings] = await Promise.all([
      measured("schools", readSchools), measured("tracking", readTutorTracking), measured("saved-days", readTutorReportAuditDays), measured("mappings", readTutorReportAuditSchoolMappings),
    ]);
    trace("parse:start");
    const roster = tracking.snapshots.flatMap((snapshot) => snapshot.records);
    const parsed = parseTutorReportAuditCsv(csv, url.searchParams.get("fileName") || "rapport.csv", schools, mappings, roster);
    trace("parse:done");
    if (!parsed.days.length) {
      return json({ error: "Aucune ligne ne correspond à une date et à un établissement Alpha exploitable", detail: "Vérifiez les dates et les établissements ; les établissements inconnus doivent d’abord être rapprochés." }, 400);
    }
    const previousByDate = new Map(savedDays.map((day) => [day.date, day]));
    const imported = parsed.days.map((day) => {
      const previous = previousByDate.get(day.date);
      const excluded = new Set(previous?.excludedTutorKeys || []);
      const excludedNames = new Set((previous?.tutors || []).filter((tutor) => excluded.has(tutor.key)).map((tutor) => tutor.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")));
      day.tutors.forEach((tutor) => {
        if (excludedNames.has(tutor.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr"))) excluded.add(tutor.key);
      });
      return {
        ...day,
        excludedTutorKeys: Array.from(excluded),
        createdAt: previous?.createdAt || day.createdAt,
        updatedAt: new Date().toISOString(),
      };
    });
    const replaceDates = new Set(imported.map((day) => day.date));
    const next = [...imported, ...savedDays.filter((day) => !replaceDates.has(day.date))];
    await measured("save", () => writeTutorReportAuditDays(next));
    trace("response");
    return json({ days: next, schools, mappings, importedDates: imported.map((day) => day.date), invalidDateRowCount: parsed.invalidDateRowCount, skippedNonAlphaRows: parsed.skippedNonAlphaRows });
  } catch (error) {
    return json({ error: "Import impossible", detail: error instanceof Error ? error.message : "Le fichier n’a pas pu être analysé." }, 400);
  }
}

async function patchHandler(request: Request) {
  try {
    const body = await request.json() as { action?: string; date?: string; tutorKey?: string; excluded?: boolean; sourceName?: string; schoolId?: string };
    if (body.action === "exclude-tutor") {
      if (!body.date || !body.tutorKey || typeof body.excluded !== "boolean") return json({ error: "Exclusion invalide" }, 400);
      const days = await readTutorReportAuditDays();
      const target = days.find((day) => day.date === body.date);
      if (!target) return json({ error: "Date introuvable" }, 404);
      const excluded = new Set(target.excludedTutorKeys);
      if (body.excluded) excluded.add(body.tutorKey); else excluded.delete(body.tutorKey);
      const next = days.map((day) => day.date === body.date ? { ...day, excludedTutorKeys: Array.from(excluded), updatedAt: new Date().toISOString() } : day);
      await writeTutorReportAuditDays(next);
      return json({ days: await readTutorReportAuditDays() });
    }
    if (body.action === "map-school") {
      const key = normalizeTutorReportSchoolKey(body.sourceName || "");
      if (!key || typeof body.schoolId !== "string") return json({ error: "Rapprochement invalide" }, 400);
      const schools = await readSchools();
      if (body.schoolId && body.schoolId !== "excluded" && !schools.some((school) => school.id === body.schoolId)) return json({ error: "Établissement cible introuvable" }, 404);
      const mappings = await readTutorReportAuditSchoolMappings();
      if (body.schoolId) mappings[key] = body.schoolId;
      else delete mappings[key];
      await writeTutorReportAuditSchoolMappings(mappings);
      return json({ mappings });
    }
    return json({ error: "Action inconnue" }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Modification impossible" }, 400);
  }
}

export const GET = withIdentity(getHandler);
export const POST = withIdentity(postHandler);
export const PATCH = withIdentity(patchHandler);

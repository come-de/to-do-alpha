import { NextResponse } from "next/server";
import {
  enrichStaffingAuditDaysWithSchools,
  parseStaffingAuditCsv,
  readSchools,
  readStaffingAudits,
  saveStaffingAudit,
  updateStaffingAuditSession,
  type StaffingAuditDay,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    const [days, schools] = await Promise.all([readStaffingAudits(), readSchools()]);
    return json({ days: enrichStaffingAuditDaysWithSchools(days, schools) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger les bilans staffing";
    return json({ error: "Impossible de charger les bilans staffing", detail }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const rawCsv = await request.text();
    if (!rawCsv.trim()) return json({ error: "Fichier CSV vide" }, 400);
    const parsed = parseStaffingAuditCsv(rawCsv, url.searchParams.get("fileName") || "rapports.csv", await readSchools());
    if (!parsed.days.length) {
      const detail = parsed.invalidDateRowCount
        ? `${parsed.invalidDateRowCount} ligne(s) possèdent une date vide ou illisible. Formats acceptés : JJ/MM/AAAA, JJ-MM-AAAA ou AAAA-MM-JJ.`
        : "Vérifiez que les colonnes Date et Semaine réelle contiennent des valeurs.";
      return json({ error: "Aucune séance exploitable trouvée", detail }, 400);
    }
    return json({ days: parsed.days, invalidDateRowCount: parsed.invalidDateRowCount });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible d’analyser le fichier";
    return json({ error: "Impossible d’analyser le fichier", detail }, 400);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { day?: StaffingAuditDay; overwrite?: boolean };
    if (!body.day || typeof body.day !== "object") return json({ error: "Journée invalide" }, 400);
    const result = await saveStaffingAudit(body.day, body.overwrite === true);
    const schools = await readSchools();
    const days = enrichStaffingAuditDaysWithSchools(result.days, schools);
    if (result.conflict) return json({ error: "Un bilan existe déjà pour cette date", conflict: true, days }, 409);
    return json({ ...result, day: result.day ? enrichStaffingAuditDaysWithSchools([result.day], schools)[0] : undefined, days });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible d’enregistrer le bilan";
    return json({ error: "Impossible d’enregistrer le bilan", detail }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { date?: unknown; sessionId?: unknown; portfolioOwner?: unknown; resolution?: unknown; treated?: unknown };
    if (typeof body.date !== "string" || typeof body.sessionId !== "string") return json({ error: "Séance invalide" }, 400);
    const result = await updateStaffingAuditSession({ date: body.date, sessionId: body.sessionId, portfolioOwner: body.portfolioOwner, resolution: body.resolution, treated: body.treated });
    const schools = await readSchools();
    return json({ ...result, day: result.day ? enrichStaffingAuditDaysWithSchools([result.day], schools)[0] : undefined, days: enrichStaffingAuditDaysWithSchools(result.days, schools) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de modifier la séance";
    return json({ error: "Impossible de modifier la séance", detail }, 500);
  }
}

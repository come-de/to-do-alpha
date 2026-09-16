import { NextResponse } from "next/server";
import {
  createUpcomingSessionImportFromCsv,
  deleteUpcomingSessionImportById,
  readSchools,
  readUpcomingSessionImports,
  readUpcomingSessionImportSummaries,
  updateUpcomingSessionImportName,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const summaryOnly = new URL(request.url).searchParams.get("summary") === "1";
    return json({ imports: summaryOnly ? await readUpcomingSessionImportSummaries() : await readUpcomingSessionImports() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger les séances à venir";
    return json({ error: "Impossible de charger les séances à venir", detail }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const rawCsv = await request.text();
    if (!rawCsv.trim()) return json({ error: "Fichier CSV vide" }, 400);
    const createdImport = await createUpcomingSessionImportFromCsv({
      fileName: url.searchParams.get("fileName") || "semaines-a-venir.csv",
      rawCsv,
    });
    const schools = await readSchools();
    const existingIds = new Set(schools.map((school) => school.externalId).filter(Boolean));
    const schoolDetection = {
      newCount: createdImport.schools.filter((school) => school.schoolId && !existingIds.has(school.schoolId)).length,
      existingCount: createdImport.schools.filter((school) => school.schoolId && existingIds.has(school.schoolId)).length,
      missingIdCount: createdImport.schools.filter((school) => !school.schoolId).length,
    };
    return json({ import: createdImport, schoolDetection }, 201);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible d’importer les séances à venir";
    return json({ error: "Impossible d’importer les séances à venir", detail }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; displayName?: unknown };
    if (typeof body.id !== "string" || typeof body.displayName !== "string") return json({ error: "Nom invalide" }, 400);
    await updateUpcomingSessionImportName(body.id, body.displayName);
    return json({ imports: await readUpcomingSessionImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de renommer l’import";
    return json({ error: "Impossible de renommer l’import", detail }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Identifiant manquant" }, 400);
    await deleteUpcomingSessionImportById(id);
    return json({ imports: await readUpcomingSessionImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de supprimer l’import";
    return json({ error: "Impossible de supprimer l’import", detail }, 500);
  }
}

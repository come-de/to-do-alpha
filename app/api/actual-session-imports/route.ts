import { NextResponse } from "next/server";
import {
  createActualSessionImportFromCsv,
  deleteActualSessionImportById,
  readActualSessionImports,
  readActualSessionImportSummaries,
  updateActualSessionImportName,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const summaryOnly = new URL(request.url).searchParams.get("summary") === "1";
    return json({ imports: summaryOnly ? await readActualSessionImportSummaries() : await readActualSessionImports() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger les semaines réelles";
    return json({ error: "Impossible de charger les semaines réelles", detail }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const rawCsv = await request.text();
    if (!rawCsv.trim()) return json({ error: "Fichier CSV vide" }, 400);
    const createdImport = await createActualSessionImportFromCsv({ fileName: url.searchParams.get("fileName") || "semaine-reelle.csv", rawCsv });
    return json({ import: createdImport }, 201);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible d’importer la semaine réelle";
    return json({ error: "Impossible d’importer la semaine réelle", detail }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; displayName?: unknown };
    if (typeof body.id !== "string" || typeof body.displayName !== "string") return json({ error: "Nom invalide" }, 400);
    await updateActualSessionImportName(body.id, body.displayName);
    return json({ imports: await readActualSessionImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de renommer l’import";
    return json({ error: "Impossible de renommer l’import", detail }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Identifiant manquant" }, 400);
    await deleteActualSessionImportById(id);
    return json({ imports: await readActualSessionImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de supprimer l’import";
    return json({ error: "Impossible de supprimer l’import", detail }, 500);
  }
}

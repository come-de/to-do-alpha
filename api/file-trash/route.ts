import { NextResponse } from "next/server";
import { readFileImportTrash, restoreFileImportFromTrash, type FileImportKind } from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    return json({ imports: await readFileImportTrash() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Corbeille indisponible";
    return json({ error: "Corbeille indisponible", detail }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { kind?: FileImportKind; id?: string };
    if (!body.kind || !body.id) return json({ error: "Fichier à restaurer invalide" }, 400);
    await restoreFileImportFromTrash(body.kind, body.id);
    return json({ imports: await readFileImportTrash() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Restauration impossible";
    return json({ error: "Restauration impossible", detail }, 500);
  }
}

import { NextResponse } from "next/server";
import { readTutorCoverageNotes, upsertTutorCoverageNote } from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    return json({ notes: await readTutorCoverageNotes() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger les annotations";
    return json({ error: "Impossible de charger les annotations", detail }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const note = await upsertTutorCoverageNote(body);
    return json({ note, notes: await readTutorCoverageNotes() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de sauvegarder l’annotation";
    return json({ error: "Impossible de sauvegarder l’annotation", detail }, 500);
  }
}

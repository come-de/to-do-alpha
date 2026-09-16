import { NextResponse } from "next/server";
import {
  createTutorTrackingSnapshotFromCsv,
  readTutorTracking,
  sanitizeTutorTrackingData,
  updateTutorTrackingSnapshotName,
  writeTutorTracking,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const tracking = await readTutorTracking();
  if (new URL(request.url).searchParams.get("summary") === "1") {
    return json({
      imports: tracking.snapshots.map((snapshot) => ({
        id: snapshot.id,
        importedAt: snapshot.updatedAt || snapshot.createdAt || snapshot.date,
        displayName: snapshot.displayName,
        fileName: snapshot.fileName,
        sourceRowCount: snapshot.sourceRowCount || snapshot.records.length,
        date: snapshot.date,
      })),
    });
  }
  return json({ tracking });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { date?: unknown; fileName?: unknown; rawCsv?: unknown };
    if (typeof body.date !== "string" || typeof body.rawCsv !== "string" || !body.rawCsv.trim()) {
      return json({ error: "Date ou fichier CSV invalide" }, 400);
    }
    const result = await createTutorTrackingSnapshotFromCsv({
      date: body.date,
      fileName: typeof body.fileName === "string" ? body.fileName : "liste-tuteurs.csv",
      rawCsv: body.rawCsv,
    });
    return json(result, result.replaced ? 200 : 201);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Import tuteurs impossible";
    return json({ error: "Import tuteurs impossible", detail }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { tracking?: unknown };
    if (!body.tracking || typeof body.tracking !== "object") return json({ error: "Invalid tutor tracking" }, 400);
    const tracking = sanitizeTutorTrackingData(body.tracking as Record<string, unknown>);
    await writeTutorTracking(tracking);
    return json({ tracking });
  } catch {
    return json({ error: "Unable to save tutor tracking" }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; displayName?: unknown };
    if (typeof body.id !== "string" || typeof body.displayName !== "string") {
      return json({ error: "Nom d’import invalide" }, 400);
    }
    return json({ tracking: await updateTutorTrackingSnapshotName(body.id, body.displayName) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Renommage impossible";
    return json({ error: "Renommage impossible", detail }, 500);
  }
}

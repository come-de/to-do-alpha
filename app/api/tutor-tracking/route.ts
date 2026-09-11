import { NextResponse } from "next/server";
import { readTutorTracking, sanitizeTutorTrackingData, writeTutorTracking } from "@/app/lib/shared-data";

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

export async function GET() {
  return json({ tracking: await readTutorTracking() });
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

import { NextResponse } from "next/server";
import { readUnstaffedExclusions, sanitizeUnstaffedExclusions, writeUnstaffedExclusions } from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return json({ exclusions: await readUnstaffedExclusions() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { exclusions?: unknown };
    if (!body.exclusions || typeof body.exclusions !== "object") return json({ error: "Exclusions invalides" }, 400);
    const exclusions = sanitizeUnstaffedExclusions(body.exclusions as Record<string, unknown>);
    return json({ exclusions: await writeUnstaffedExclusions(exclusions) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Sauvegarde impossible";
    return json({ error: "Sauvegarde impossible", detail }, 500);
  }
}

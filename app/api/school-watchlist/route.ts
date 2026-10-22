import { withIdentity } from "@/app/lib/with-identity";
import { NextResponse } from "next/server";
import { readSchoolWatchlist, sanitizeSchoolWatchItem, writeSchoolWatchlist } from "@/app/lib/shared-data";

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

async function getHandler() {
  return json({ watchlist: await readSchoolWatchlist() });
}

async function putHandler(request: Request) {
  try {
    const body = (await request.json()) as { watchlist?: unknown };
    if (!Array.isArray(body.watchlist)) return json({ error: "Invalid school watchlist" }, 400);

    const watchlist = body.watchlist
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map(sanitizeSchoolWatchItem)
      .filter((item) => item.schoolId && item.reason)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    await writeSchoolWatchlist(watchlist);
    return json({ watchlist });
  } catch {
    return json({ error: "Unable to save school watchlist" }, 500);
  }
}

export const GET = withIdentity(getHandler);
export const PUT = withIdentity(putHandler);

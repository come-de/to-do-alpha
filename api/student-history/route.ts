import { NextResponse } from "next/server";
import {
  readStudentHistory,
  sanitizeStudentHistoryYear,
  writeStudentHistory,
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

export async function GET() {
  return json({ history: await readStudentHistory() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { history?: unknown };
    if (!Array.isArray(body.history)) return json({ error: "Invalid student history" }, 400);

    const yearsByValue = new Map<number, ReturnType<typeof sanitizeStudentHistoryYear>>();
    body.history
      .filter((year): year is Record<string, unknown> => Boolean(year && typeof year === "object"))
      .map(sanitizeStudentHistoryYear)
      .forEach((year) => yearsByValue.set(year.year, year));

    const history = Array.from(yearsByValue.values()).sort((a, b) => b.year - a.year);
    await writeStudentHistory(history);
    return json({ history });
  } catch {
    return json({ error: "Unable to save student history" }, 500);
  }
}

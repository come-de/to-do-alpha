import { NextResponse } from "next/server";
import { readStaffingSessions, sanitizeStaffingDay, writeStaffingSessions } from "@/app/lib/shared-data";

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
  return json({ staffing: await readStaffingSessions() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { staffing?: unknown };
    if (!Array.isArray(body.staffing)) return json({ error: "Invalid staffing list" }, 400);

    const daysByDate = new Map<string, ReturnType<typeof sanitizeStaffingDay>>();
    body.staffing
      .filter((day): day is Record<string, unknown> => Boolean(day && typeof day === "object"))
      .map(sanitizeStaffingDay)
      .forEach((day) => {
        daysByDate.set(day.date, day);
      });

    const staffing = Array.from(daysByDate.values()).sort(
      (a, b) => new Date(`${b.date}T12:00:00`).getTime() - new Date(`${a.date}T12:00:00`).getTime(),
    );

    await writeStaffingSessions(staffing);
    return json({ staffing });
  } catch {
    return json({ error: "Unable to save staffing sessions" }, 500);
  }
}

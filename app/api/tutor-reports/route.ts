import { NextResponse } from "next/server";
import { readTutorReports, readTutorTracking, resolveTutorReportTutorIds, sanitizeTutorReportSnapshot, writeTutorReports } from "@/app/lib/shared-data";

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
  const [reports, tracking] = await Promise.all([readTutorReports(), readTutorTracking()]);
  const resolved = resolveTutorReportTutorIds(reports, tracking.snapshots.flatMap((snapshot) => snapshot.records));
  if (resolved.changed) await writeTutorReports(resolved.reports);
  return json({ reports: resolved.reports });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { reports?: unknown };
    if (!Array.isArray(body.reports)) return json({ error: "Invalid tutor report list" }, 400);

    const reportsByDate = new Map<string, ReturnType<typeof sanitizeTutorReportSnapshot>>();
    body.reports
      .filter((report): report is Record<string, unknown> => Boolean(report && typeof report === "object"))
      .map(sanitizeTutorReportSnapshot)
      .forEach((report) => {
        reportsByDate.set(report.date, report);
      });

    const reports = Array.from(reportsByDate.values()).sort(
      (a, b) => new Date(`${b.date}T12:00:00`).getTime() - new Date(`${a.date}T12:00:00`).getTime(),
    );
    const tracking = await readTutorTracking();
    const resolved = resolveTutorReportTutorIds(reports, tracking.snapshots.flatMap((snapshot) => snapshot.records));
    await writeTutorReports(resolved.reports);
    return json({ reports: resolved.reports });
  } catch {
    return json({ error: "Unable to save tutor reports" }, 500);
  }
}

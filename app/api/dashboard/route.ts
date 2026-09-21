import { NextResponse } from "next/server";
import {
  readAvailabilityImportSummaries,
  readJournalPosts,
  readLinks,
  readMassCommunications,
  readObjectives,
  readSchoolWatchlist,
  readSchools,
  readStaffingSessions,
  readStudentHistory,
  readTasks,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      schools,
      tasks,
      links,
      journalPosts,
      communications,
      staffingDays,
      watchlist,
      objectives,
      history,
      availabilityImports,
    ] = await Promise.all([
      readSchools(),
      readTasks(),
      readLinks(),
      readJournalPosts(),
      readMassCommunications(),
      readStaffingSessions(),
      readSchoolWatchlist(),
      readObjectives(),
      readStudentHistory(),
      readAvailabilityImportSummaries(),
    ]);

    const latestStaffingDay = staffingDays.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestUnstaffed = latestStaffingDay
      ? latestStaffingDay.totalUnstaffedSessions ?? Object.values(latestStaffingDay.people).reduce((sum, person) => sum + person.unstaffedSessions, 0)
      : 0;

    return NextResponse.json({
      objectives: objectives.filter((objective) => objective.kind === "counter"),
      counts: {
        tasks: tasks.filter((task) => task.status !== "done").length,
        links: links.length,
        watchlist: watchlist.filter((item) => item.status === "active").length,
        schools: schools.length,
        communications: communications.length,
        staffing: latestUnstaffed,
        availability: availabilityImports.length,
        objectives: objectives.filter((objective) => objective.kind === "qualitative").length,
        history: history.length,
        journal: journalPosts.length,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Dashboard indisponible";
    return NextResponse.json({ error: "Dashboard indisponible", detail }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

import { NextResponse } from "next/server";
import {
  readAvailabilityImportSummaries,
  readJournalPosts,
  readLinks,
  readMassCommunications,
  readObjectives,
  readSchoolWatchlist,
  readSchools,
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
      readSchoolWatchlist(),
      readObjectives(),
      readStudentHistory(),
      readAvailabilityImportSummaries(),
    ]);

    return NextResponse.json({
      objectives: objectives.filter((objective) => objective.kind === "counter"),
      counts: {
        tasks: tasks.filter((task) => task.status !== "done").length,
        links: links.length,
        watchlist: watchlist.filter((item) => item.status === "active").length,
        schools: schools.length,
        communications: communications.length,
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

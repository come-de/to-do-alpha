import { NextResponse } from "next/server";
import {
  readAvailabilityImportSummaries,
  readJournalPosts,
  readLatestUpcomingSessionImport,
  readLinks,
  readMassCommunications,
  readObjectives,
  readSchoolWatchlist,
  readSchools,
  readStaffingSessions,
  readStudentHistory,
  readTasks,
  readUnstaffedExclusions,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Owner = "kelly" | "pierre" | "julie" | "unassigned";

function normalizedSchoolName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function isSingleStudentAlpha(category: string, studentCount: number) {
  const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  return normalized.includes("alpha") && studentCount === 1;
}

export async function GET(request: Request) {
  try {
    const requestedToday = new URL(request.url).searchParams.get("today") || "";
    const today = /^\d{4}-\d{2}-\d{2}$/.test(requestedToday) ? requestedToday : new Date().toISOString().slice(0, 10);
    const [
      latestImport,
      exclusions,
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
      readLatestUpcomingSessionImport(),
      readUnstaffedExclusions(),
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

    const ownerById = new Map(schools.filter((school) => school.externalId).map((school) => [school.externalId, school.portfolioOwner]));
    const ownerByName = new Map(schools.map((school) => [normalizedSchoolName(school.name), school.portfolioOwner]));
    const visibleRows = (latestImport?.rows ?? []).filter((row) =>
      row.date >= today &&
      !exclusions.sessionIds.includes(row.sessionId) &&
      !isSingleStudentAlpha(row.category, row.studentCount),
    );
    const dates = Array.from(new Set(visibleRows.map((row) => row.date))).sort().slice(0, 3);
    const unstaffedDates = dates.map((date) => {
      const counts: Record<Owner, number> = { kelly: 0, pierre: 0, julie: 0, unassigned: 0 };
      visibleRows.filter((row) => row.date === date).forEach((row) => {
        const owner = ownerById.get(row.schoolId) ?? ownerByName.get(normalizedSchoolName(row.school)) ?? "";
        counts[owner || "unassigned"] += 1;
      });
      return { date, counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) };
    });
    const latestStaffingDay = staffingDays.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestUnstaffed = latestStaffingDay
      ? latestStaffingDay.totalUnstaffedSessions ?? Object.values(latestStaffingDay.people).reduce((sum, person) => sum + person.unstaffedSessions, 0)
      : 0;

    return NextResponse.json({
      objectives: objectives.filter((objective) => objective.kind === "counter"),
      unstaffed: {
        importId: latestImport?.id ?? "",
        importName: latestImport?.displayName ?? "",
        dates: unstaffedDates,
      },
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
        unstaffed: unstaffedDates.reduce((sum, item) => sum + item.total, 0),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Dashboard indisponible";
    return NextResponse.json({ error: "Dashboard indisponible", detail }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

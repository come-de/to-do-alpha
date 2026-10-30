import { NextResponse } from "next/server";
import { withIdentity } from "@/app/lib/with-identity";
import { readAvailabilityImports, readLatestTutorAssignmentImport, readLatestUpcomingSessionImport, readTutorTracking } from "@/app/lib/shared-data";
import { normalizedPeriodDate, tutorsWithoutAvailability } from "@/app/lib/tutors-without-availability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getHandler(request: Request) {
  const params = new URL(request.url).searchParams;
  const startDate = params.get("startDate") || "";
  const endDate = params.get("endDate") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || !normalizedPeriodDate(startDate) || !normalizedPeriodDate(endDate) || startDate > endDate) {
    return NextResponse.json({ error: "Choisissez une période valide." }, { status: 400 });
  }
  try {
    const [tracking, availabilityImports, assignments, upcoming] = await Promise.all([
      readTutorTracking(), readAvailabilityImports(), readLatestTutorAssignmentImport(), readLatestUpcomingSessionImport(),
    ]);
    const latestTutors = tracking.snapshots[0];
    const latestAvailability = availabilityImports[0];
    if (!latestTutors || !latestAvailability) {
      return NextResponse.json({ error: "Importez une liste de tuteurs et un fichier de disponibilités avant de lancer la recherche." }, { status: 409 });
    }
    const tutors = tutorsWithoutAvailability(
      latestTutors.records, latestAvailability.rows, assignments?.rows || [], upcoming?.staffingSessions || [], startDate, endDate,
    );
    return NextResponse.json({ tutors, sources: {
      tutors: latestTutors.displayName,
      availability: latestAvailability.displayName,
      assignments: assignments?.displayName || null,
      upcoming: upcoming?.displayName || null,
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recherche impossible." }, { status: 500 });
  }
}

export const GET = withIdentity(getHandler);

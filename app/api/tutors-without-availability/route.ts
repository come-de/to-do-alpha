import { NextResponse } from "next/server";
import { withIdentity } from "@/app/lib/with-identity";
import { readAvailabilityImportById, readAvailabilityImportSummaries, readLatestTutorAssignmentImport, readLatestUpcomingSessionImport, readTutorTracking } from "@/app/lib/shared-data";
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
    const [tracking, availabilitySummaries, assignments, upcoming] = await Promise.all([
      readTutorTracking(), readAvailabilityImportSummaries(), readLatestTutorAssignmentImport(), readLatestUpcomingSessionImport(),
    ]);
    const latestTutors = tracking.snapshots[0];
    const latestAvailabilitySummary = availabilitySummaries[0];
    if (!latestTutors || !latestAvailabilitySummary) {
      return NextResponse.json({ error: "Importez une liste de tuteurs et un fichier de disponibilités avant de lancer la recherche." }, { status: 409 });
    }
    const latestAvailability = await readAvailabilityImportById(latestAvailabilitySummary.id);
    if (!latestAvailability) {
      return NextResponse.json({ error: "Le dernier fichier de disponibilités est introuvable. Réessayez après l’avoir réimporté." }, { status: 503 });
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
    console.error("[tutors-without-availability] search failed", error);
    const detail = error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "Une source de données est indisponible.";
    return NextResponse.json({ error: `Recherche impossible : ${detail}` }, { status: 500 });
  }
}

export const GET = withIdentity(getHandler);

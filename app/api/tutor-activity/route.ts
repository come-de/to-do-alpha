import { NextResponse } from "next/server";
import {
  readAvailabilityImportById,
  readAvailabilityImportSummaries,
  readTutorAssignmentImportById,
  readTutorAssignmentImportSummaries,
  readTutorInterestImportById,
  readTutorInterestImportSummaries,
  readUpcomingSessionImportById,
  readUpcomingSessionImportSummaries,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ActivityItem = {
  key: string;
  date: string;
  timeSlot: string;
  school: string;
  category: string;
  sessionId: string;
  validated?: boolean;
};

type TutorActivity = {
  tutorId: string;
  upcomingSessions: ActivityItem[];
  pastSessions: ActivityItem[];
  availabilities: ActivityItem[];
  interests: ActivityItem[];
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function dateValue(value: string) {
  const parsed = Date.parse(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueSorted(items: ActivityItem[], direction: "asc" | "desc") {
  const unique = new Map<string, ActivityItem>();
  items.forEach((item) => {
    const key = item.sessionId || `${item.date}|${item.timeSlot}|${item.school}`;
    if (!unique.has(key)) unique.set(key, { ...item, key });
  });
  return Array.from(unique.values()).sort((a, b) => {
    const difference = dateValue(a.date) - dateValue(b.date);
    return (direction === "asc" ? difference : -difference) || a.timeSlot.localeCompare(b.timeSlot, "fr") || a.school.localeCompare(b.school, "fr");
  });
}

export async function GET(request: Request) {
  try {
    const requestedIds = (new URL(request.url).searchParams.get("ids") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const tutorIds = Array.from(new Set(requestedIds)).slice(0, 30);
    if (!tutorIds.length) return json({ activities: {} });
    const wantedIds = new Set(tutorIds);
    const today = new Date().toISOString().slice(0, 10);

    const [availabilitySummaries, interestSummaries, upcomingSummaries, assignmentSummaries] = await Promise.all([
      readAvailabilityImportSummaries(),
      readTutorInterestImportSummaries(),
      readUpcomingSessionImportSummaries(),
      readTutorAssignmentImportSummaries(),
    ]);
    const [availabilityImport, interestImport, upcomingImport, ...assignmentImports] = await Promise.all([
      availabilitySummaries[0] ? readAvailabilityImportById(availabilitySummaries[0].id) : Promise.resolve(null),
      interestSummaries[0] ? readTutorInterestImportById(interestSummaries[0].id) : Promise.resolve(null),
      upcomingSummaries[0] ? readUpcomingSessionImportById(upcomingSummaries[0].id) : Promise.resolve(null),
      ...assignmentSummaries.slice(0, 12).map((summary) => readTutorAssignmentImportById(summary.id)),
    ]);

    const activities = Object.fromEntries(tutorIds.map((tutorId) => [tutorId, {
      tutorId,
      upcomingSessions: [],
      pastSessions: [],
      availabilities: [],
      interests: [],
    } satisfies TutorActivity])) as Record<string, TutorActivity>;

    availabilityImport?.rows.forEach((row) => {
      if (!wantedIds.has(row.tutorId) || !activities[row.tutorId]) return;
      activities[row.tutorId].availabilities.push({
        key: row.sessionId || `${row.date}|${row.timeSlot}|${row.school}`,
        date: row.date,
        timeSlot: row.timeSlot,
        school: row.school,
        category: row.group,
        sessionId: row.sessionId,
      });
    });
    interestImport?.rows.forEach((row) => {
      if (!wantedIds.has(row.personId) || !activities[row.personId]) return;
      activities[row.personId].interests.push({
        key: row.sessionId || `${row.date}|${row.timeSlot}|${row.school}`,
        date: row.date,
        timeSlot: row.timeSlot,
        school: row.school,
        category: row.group,
        sessionId: row.sessionId,
        validated: row.validated,
      });
    });
    upcomingImport?.staffingSessions.forEach((session) => {
      session.tutors.forEach((tutor) => {
        if (!wantedIds.has(tutor.tutorId) || !activities[tutor.tutorId]) return;
        activities[tutor.tutorId].upcomingSessions.push({
          key: session.sessionId || `${session.date}|${session.startTime}-${session.endTime}|${session.school}`,
          date: session.date,
          timeSlot: [session.startTime, session.endTime].filter(Boolean).join(" → "),
          school: session.school,
          category: session.category,
          sessionId: session.sessionId,
        });
      });
    });
    assignmentImports.filter(Boolean).forEach((assignmentImport) => {
      assignmentImport?.rows.forEach((row) => {
        if (!wantedIds.has(row.tutorId) || !activities[row.tutorId]) return;
        const item = {
          key: `${row.date}|${row.timeSlot}|${row.school}`,
          date: row.date,
          timeSlot: row.timeSlot,
          school: row.school,
          category: row.category,
          sessionId: "",
        };
        if (row.date >= today) activities[row.tutorId].upcomingSessions.push(item);
        else activities[row.tutorId].pastSessions.push(item);
      });
    });

    Object.values(activities).forEach((activity) => {
      activity.upcomingSessions = uniqueSorted(activity.upcomingSessions, "asc").filter((item) => item.date >= today).slice(0, 20);
      activity.pastSessions = uniqueSorted(activity.pastSessions, "desc").slice(0, 20);
      activity.availabilities = uniqueSorted(activity.availabilities, "asc").slice(0, 30);
      activity.interests = uniqueSorted(activity.interests, "asc").slice(0, 30);
    });

    return json({
      activities,
      sources: {
        availability: availabilityImport?.displayName || "",
        interests: interestImport?.displayName || "",
        upcoming: upcomingImport?.displayName || "",
        assignments: assignmentImports.filter(Boolean).length,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger l’activité des tuteurs";
    return json({ error: "Impossible de charger l’activité des tuteurs", detail }, 500);
  }
}

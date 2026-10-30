import type { AvailabilityRow, TutorAssignmentRow, TutorTrackingRecord, UpcomingStaffingSession } from "./shared-data";

export function normalizedPeriodDate(value: string) {
  const iso = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  const french = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/);
  const year = Number(iso?.[1] || french?.[3]);
  const month = Number(iso?.[2] || french?.[2]);
  const day = Number(iso?.[3] || french?.[1]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!year || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function tutorsWithoutAvailability(
  tutors: TutorTrackingRecord[],
  availability: AvailabilityRow[],
  assignments: TutorAssignmentRow[],
  upcomingSessions: UpcomingStaffingSession[],
  startDate: string,
  endDate: string,
) {
  const inPeriod = (date: string) => {
    const normalized = normalizedPeriodDate(date);
    return normalized >= startDate && normalized <= endDate;
  };
  const occupied = new Set<string>();
  for (const row of availability) if (inPeriod(row.date)) occupied.add(row.tutorId.trim());
  for (const row of assignments) if (inPeriod(row.date)) occupied.add(row.tutorId.trim());
  for (const session of upcomingSessions) {
    if (inPeriod(session.date)) for (const tutor of session.tutors) occupied.add(tutor.tutorId.trim());
  }
  return tutors
    .filter((tutor) => tutor.tutorId.trim() && !occupied.has(tutor.tutorId.trim()))
    .filter((tutor, index, all) => all.findIndex((item) => item.tutorId.trim() === tutor.tutorId.trim()) === index)
    .map(({ tutorId, firstName, lastName }) => ({ id: tutorId.trim(), firstName, lastName }))
    .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr"));
}

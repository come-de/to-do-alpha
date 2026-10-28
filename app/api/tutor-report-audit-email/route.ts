import { withIdentity } from "@/app/lib/with-identity";
import { readTutorReportAuditDays, readTutorReportAuditGlobalExclusions, readTutorReportAuditGlobalExcludedSchools, readTutorReportAuditSchoolMappings, readTutorReportEmailLog, readTutorTracking, readSchools, normalizeTutorReportSchoolKey, writeTutorReportEmailLog, sendTutorReportSummaryEmail, TUTOR_REPORT_EMAIL_BCC, type TutorReportEmailLogEntry } from "@/app/lib/shared-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function normalizedName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}

function isAlpha(school: { category: string; schoolType: string }) {
  const value = `${school.category} ${school.schoolType}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  return value.includes("alpha") || value.includes("etude");
}

async function postHandler(request: Request) {
  try {
    const body = await request.json() as { mode?: unknown; tutorKey?: unknown; startDate?: unknown; endDate?: unknown; portfolioOwner?: unknown; schoolId?: unknown };
    if (body.mode !== undefined && body.mode !== "preview") return json({ error: "Action invalide." }, 400);
    if (typeof body.tutorKey !== "string" || !body.tutorKey || body.tutorKey.length > 180) return json({ error: "Tuteur invalide." }, 400);
    const validDate = (value: unknown) => value === "" || value === undefined || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value));
    if (!validDate(body.startDate) || !validDate(body.endDate)) return json({ error: "Période invalide." }, 400);
    if (body.portfolioOwner !== undefined && body.portfolioOwner !== "" && !["kelly", "julie", "pierre"].includes(String(body.portfolioOwner))) return json({ error: "Filtre RH invalide." }, 400);
    if (body.schoolId !== undefined && typeof body.schoolId !== "string") return json({ error: "Filtre établissement invalide." }, 400);
    const tutorKey = body.tutorKey;
    const startDate = (body.startDate as string) || "";
    const endDate = (body.endDate as string) || "";
    if (startDate && endDate && startDate > endDate) return json({ error: "La période est incohérente." }, 400);
    const selectedRH = (body.portfolioOwner as string) || "";
    const schoolId = (body.schoolId as string) || "";
    const [days, schools, mappings, excludedTutors, excludedSchools, tracking] = await Promise.all([
      readTutorReportAuditDays(), readSchools(), readTutorReportAuditSchoolMappings(), readTutorReportAuditGlobalExclusions(), readTutorReportAuditGlobalExcludedSchools(), readTutorTracking(),
    ]);
    if (excludedTutors.includes(tutorKey)) return json({ error: "Ce tuteur est exclu globalement : aucun récapitulatif ne sera envoyé." }, 409);
    if (schoolId && !schools.some((school) => school.id === schoolId && isAlpha(school))) return json({ error: "Établissement du filtre introuvable." }, 404);

    const selectedDays = days.filter((day) => (!startDate || day.date >= startDate) && (!endDate || day.date <= endDate)).sort((a, b) => a.date.localeCompare(b.date));
    const matchingTutors = selectedDays.flatMap((day) => day.tutors.filter((tutor) => tutor.key === tutorKey).map((tutor) => ({ day, tutor })));
    if (!matchingTutors.length) return json({ error: "Aucun bilan de ce tuteur dans la période sélectionnée." }, 404);
    const tutorName = matchingTutors[0].tutor.name;
    const reportsByDate: Array<{ date: string; expected: number; missing: number }> = [];
    for (const { day, tutor } of matchingTutors) {
      if (day.excludedTutorKeys.includes(tutorKey)) continue;
      let expected = 0;
      let missing = 0;
      for (const item of tutor.schools) {
        const key = normalizeTutorReportSchoolKey(item.sourceName);
        const mappedId = mappings[key];
        if (mappedId === "excluded") continue;
        const school = (mappedId && schools.find((entry) => entry.id === mappedId || entry.externalId === mappedId)) || schools.find((entry) => normalizeTutorReportSchoolKey(entry.name) === key);
        if (!school || !isAlpha(school) || excludedSchools.includes(school.id)) continue;
        if (selectedRH && school.portfolioOwner !== selectedRH) continue;
        if (schoolId && school.id !== schoolId) continue;
        expected += item.expectedCount;
        missing += item.missingCount;
      }
      if (missing > 0) reportsByDate.push({ date: day.date, expected, missing });
    }
    if (!reportsByDate.length) return json({ error: "Ce tuteur n’a aucun rapport manquant dans le périmètre sélectionné." }, 409);

    const roster = tracking.snapshots.flatMap((snapshot) => snapshot.records);
    const emailCandidates = new Set(roster.filter((record) => {
      const keyMatches = tutorKey.startsWith("id:") ? record.tutorId === tutorKey.slice(3) : `name:${normalizedName(`${record.firstName} ${record.lastName}`).replace(/ /g, "-")}` === tutorKey;
      return keyMatches && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email.trim());
    }).map((record) => record.email.trim().toLowerCase()));
    if (!emailCandidates.size) return json({ error: `Aucune adresse e-mail valide n’est renseignée pour ${tutorName} dans le suivi des tuteurs.` }, 409);
    if (emailCandidates.size > 1) return json({ error: `Plusieurs adresses e-mail différentes sont associées à ${tutorName}. Corrigez le suivi des tuteurs avant l’envoi.` }, 409);
    const recipient = Array.from(emailCandidates)[0];
    const missingCount = reportsByDate.reduce((sum, row) => sum + row.missing, 0);
    const periodStart = startDate || reportsByDate[0].date;
    const periodEnd = endDate || reportsByDate.at(-1)!.date;
    const latestFirstReports = [...reportsByDate].sort((a, b) => b.date.localeCompare(a.date));
    const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T12:00:00Z`));
    const ownerSuffix = selectedRH ? ` · RH ${selectedRH[0].toUpperCase()}${selectedRH.slice(1)}` : "";
    const schoolSuffix = schoolId ? ` · ${schools.find((school) => school.id === schoolId)?.name || "établissement sélectionné"}` : "";
    const subject = `Récapitulatif des rapports manquants — ${tutorName}`;
    const rows = latestFirstReports.map((row) => `<tr><td style="padding:9px;border-bottom:1px solid #e9e1ef">${escapeHtml(formatDate(row.date))}</td><td style="padding:9px;border-bottom:1px solid #e9e1ef;text-align:right"><strong>${row.missing}</strong> manquant(s) / ${row.expected} attendu(s)</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif;color:#30243e;line-height:1.5"><h2>Bonjour ${escapeHtml(tutorName)},</h2><p>Voici le récapitulatif de vos rapports manquants pour la période du ${escapeHtml(formatDate(periodStart))} au ${escapeHtml(formatDate(periodEnd))}${escapeHtml(ownerSuffix + schoolSuffix)}.</p><p><strong>${missingCount} rapport(s) manquant(s) sur ${reportsByDate.length} date(s) concernée(s).</strong></p><table style="border-collapse:collapse;width:100%;max-width:640px"><thead><tr><th style="padding:9px;text-align:left;background:#f3edfb">Date</th><th style="padding:9px;text-align:right;background:#f3edfb">Rapports manquants</th></tr></thead><tbody>${rows}</tbody></table><p>Ce récapitulatif est basé sur les bilans importés dans le suivi.</p></div>`;
    const text = `Bonjour ${tutorName},\n\nVoici le récapitulatif de vos rapports manquants pour la période du ${formatDate(periodStart)} au ${formatDate(periodEnd)}${ownerSuffix}${schoolSuffix}.\n\n${missingCount} rapport(s) manquant(s) sur ${reportsByDate.length} date(s) concernée(s).\n\n${latestFirstReports.map((row) => `${formatDate(row.date)} : ${row.missing} manquant(s) / ${row.expected} attendu(s)`).join("\n")}\n\nCe récapitulatif est basé sur les bilans importés dans le suivi.`;
    if (body.mode === "preview") return json({ preview: { recipient, bcc: TUTOR_REPORT_EMAIL_BCC, subject, html, missingCount, dateCount: reportsByDate.length, periodStart, periodEnd } });
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.ASSIGNMENT_FROM_EMAIL;
    if (!apiKey || !from) return json({ error: "L’envoi SendGrid n’est pas configuré sur Netlify (clé API ou expéditeur manquant)." }, 503);
    const attemptedAt = new Date().toISOString();
    const event: TutorReportEmailLogEntry = { id: crypto.randomUUID(), tutorKey, tutorName, status: "pending", attemptedAt, sentAt: "", periodStart, periodEnd, dateCount: reportsByDate.length, missingCount };
    const existingLog = await readTutorReportEmailLog();
    await writeTutorReportEmailLog([...existingLog, event]);
    let result: { sent: boolean; reason: string };
    try {
      result = await sendTutorReportSummaryEmail(recipient, subject, html, text);
    } catch {
      const failed = { ...event, status: "failed" as const };
      await writeTutorReportEmailLog([...existingLog, failed]);
      return json({ error: "Impossible de joindre SendGrid. L’échec a été enregistré et vous pouvez réessayer." }, 502);
    }
    if (!result.sent) {
      const failed = { ...event, status: "failed" as const };
      await writeTutorReportEmailLog([...existingLog, failed]);
      return json({ error: result.reason === "missing-config" ? "L’envoi SendGrid n’est pas configuré." : "SendGrid n’a pas accepté l’envoi. Vérifiez la clé API, les droits Mail Send et l’expéditeur." }, 502);
    }
    const sent: TutorReportEmailLogEntry = { ...event, status: "sent", sentAt: new Date().toISOString() };
    const emailLog = [...existingLog, sent];
    await writeTutorReportEmailLog(emailLog);
    return json({ sent: true, sentTo: recipient, emailLog: [sent] });
  } catch (error) {
    return json({ error: "Impossible d’envoyer le récapitulatif.", detail: error instanceof Error ? error.message : "Erreur inconnue." }, 500);
  }
}

export const POST = withIdentity(postHandler);

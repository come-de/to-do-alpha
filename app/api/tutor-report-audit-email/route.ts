import { withIdentity } from "@/app/lib/with-identity";
import { readTutorReportAuditDays, readTutorReportAuditGlobalExclusions, readTutorReportAuditGlobalExcludedSchools, readTutorReportAuditSchoolMappings, readTutorReportEmailLog, readTutorTracking, readSchools, normalizeTutorReportSchoolKey, writeTutorReportEmailLog, sendTutorReportSummaryEmail, TUTOR_REPORT_EMAIL_BCC, TUTOR_REPORT_EMAIL_FROM, type TutorReportEmailLogEntry } from "@/app/lib/shared-data";
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
    const reportsByDate: Array<{ date: string; schoolName: string; expected: number; completed: number; missing: number }> = [];
    for (const { day, tutor } of matchingTutors) {
      if (day.excludedTutorKeys.includes(tutorKey)) continue;
      const reportsBySchool = new Map<string, { schoolName: string; expected: number; completed: number; missing: number }>();
      for (const item of tutor.schools) {
        const key = normalizeTutorReportSchoolKey(item.sourceName);
        const mappedId = mappings[key];
        if (mappedId === "excluded") continue;
        const school = (mappedId && schools.find((entry) => entry.id === mappedId || entry.externalId === mappedId)) || schools.find((entry) => normalizeTutorReportSchoolKey(entry.name) === key);
        if (!school || !isAlpha(school) || excludedSchools.includes(school.id)) continue;
        if (selectedRH && school.portfolioOwner !== selectedRH) continue;
        if (schoolId && school.id !== schoolId) continue;
        const report = reportsBySchool.get(school.id) || { schoolName: school.name, expected: 0, completed: 0, missing: 0 };
        report.expected += item.expectedCount;
        report.completed += item.completedReportCount;
        report.missing += item.missingCount;
        reportsBySchool.set(school.id, report);
      }
      for (const report of reportsBySchool.values()) {
        if (report.missing > 0) reportsByDate.push({ date: day.date, ...report });
      }
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
    const dateCount = new Set(reportsByDate.map((row) => row.date)).size;
    const reportDates = reportsByDate.map((row) => row.date).sort();
    const periodStart = startDate || reportDates[0];
    const periodEnd = endDate || reportDates.at(-1)!;
    const latestFirstReports = [...reportsByDate].sort((a, b) => b.date.localeCompare(a.date) || a.schoolName.localeCompare(b.schoolName, "fr"));
    const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T12:00:00Z`));
    const ownerSuffix = selectedRH ? ` · RH ${selectedRH[0].toUpperCase()}${selectedRH.slice(1)}` : "";
    const schoolSuffix = schoolId ? ` · ${schools.find((school) => school.id === schoolId)?.name || "établissement sélectionné"}` : "";
    const subject = `Récapitulatif des rapports manquants — ${tutorName}`;
    const rows = latestFirstReports.map((row) => `<tr><td style="padding:9px;border-bottom:1px solid #e9e1ef">${escapeHtml(formatDate(row.date))}</td><td style="padding:9px;border-bottom:1px solid #e9e1ef">${escapeHtml(row.schoolName)}</td><td style="padding:9px;border-bottom:1px solid #e9e1ef;text-align:right">${row.completed} fait(s)</td><td style="padding:9px;border-bottom:1px solid #e9e1ef;text-align:right"><strong>${row.missing} manquant(s)</strong> / ${row.expected} attendu(s)</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif;color:#30243e;line-height:1.6"><h2>Bonjour ${escapeHtml(tutorName)},</h2><p>Merci pour le travail que vous avez accompli auprès des élèves. Les bilans permettent aux parents de suivre les progrès de leur enfant et sont une partie importante de l’accompagnement.</p><p>Après vérification des bilans enregistrés pour la période du ${escapeHtml(formatDate(periodStart))} au ${escapeHtml(formatDate(periodEnd))}${escapeHtml(ownerSuffix + schoolSuffix)}, certains bilans semblent manquer. Voici le détail par date et établissement ; les bilans déjà faits y sont également indiqués :</p><p><strong>${missingCount} rapport(s) manquant(s) sur ${dateCount} date(s) concernée(s).</strong></p><table style="border-collapse:collapse;width:100%;max-width:820px"><thead><tr><th style="padding:9px;text-align:left;background:#f3edfb">Date</th><th style="padding:9px;text-align:left;background:#f3edfb">Établissement</th><th style="padding:9px;text-align:right;background:#f3edfb">Bilans faits</th><th style="padding:9px;text-align:right;background:#f3edfb">Bilans manquants / attendus</th></tr></thead><tbody>${rows}</tbody></table><p>Merci de compléter les bilans manquants dès que possible ou de nous répondre pour nous signaler toute situation particulière ou erreur dans ce récapitulatif.</p><p>La réalisation complète des bilans fait partie des engagements liés à la mission. Si les bilans attendus ne sont pas réalisés et qu’aucun retour ne nous permet de clarifier la situation, cela pourra entraîner une fin de collaboration.</p><p>Merci encore pour votre travail et votre investissement.</p><p style="color:#746982;font-size:13px">Ce récapitulatif est établi à partir des bilans importés dans le suivi.</p></div>`;
    const text = `Bonjour ${tutorName},\n\nMerci pour le travail que vous avez accompli auprès des élèves. Les bilans permettent aux parents de suivre les progrès de leur enfant et sont une partie importante de l’accompagnement.\n\nAprès vérification des bilans enregistrés pour la période du ${formatDate(periodStart)} au ${formatDate(periodEnd)}${ownerSuffix}${schoolSuffix}, certains bilans semblent manquer. Voici le détail par date et établissement ; les bilans déjà faits y sont également indiqués :\n\n${missingCount} rapport(s) manquant(s) sur ${dateCount} date(s) concernée(s).\n\n${latestFirstReports.map((row) => `${formatDate(row.date)} · ${row.schoolName} : ${row.completed} fait(s), ${row.missing} manquant(s) / ${row.expected} attendu(s)`).join("\n")}\n\nMerci de compléter les bilans manquants dès que possible ou de nous répondre pour nous signaler toute situation particulière ou erreur dans ce récapitulatif.\n\nLa réalisation complète des bilans fait partie des engagements liés à la mission. Si les bilans attendus ne sont pas réalisés et qu’aucun retour ne nous permet de clarifier la situation, cela pourra entraîner une fin de collaboration.\n\nMerci encore pour votre travail et votre investissement.\n\nCe récapitulatif est établi à partir des bilans importés dans le suivi.`;
    if (body.mode === "preview") return json({ preview: { from: TUTOR_REPORT_EMAIL_FROM, recipient, bcc: TUTOR_REPORT_EMAIL_BCC, subject, html, missingCount, dateCount, periodStart, periodEnd } });
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) return json({ error: "L’envoi SendGrid n’est pas configuré sur Netlify (clé API manquante)." }, 503);
    const attemptedAt = new Date().toISOString();
    const event: TutorReportEmailLogEntry = { id: crypto.randomUUID(), tutorKey, tutorName, status: "pending", attemptedAt, sentAt: "", periodStart, periodEnd, dateCount, missingCount };
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

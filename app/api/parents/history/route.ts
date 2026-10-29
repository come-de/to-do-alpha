import { withIdentity } from "@/app/lib/with-identity";
import { normalizeParentPhone, splitParentPhones, type ParentContact } from "@/app/lib/parents";
import { readEnrollmentImports, taskStore } from "@/app/lib/shared-data";
import { readCustomerCallData } from "@/app/lib/customer-call-audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getHandler(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id") || "";
    if (!id || id.length > 100) return Response.json({ error: "Identifiant parent invalide." }, { status: 400 });
    const store = taskStore();
    const raw = await store.get("parents-crm/contacts.json", { type: "json", consistency: "strong" });
    const contacts = Array.isArray(raw) ? raw as ParentContact[] : [];
    const contact = contacts.find((item) => item.id === id);
    if (!contact) return Response.json({ error: "Fiche parent introuvable." }, { status: 404 });
    const phoneOwners = new Map<string, number>();
    for (const item of contacts) for (const value of item.phones || []) for (const phone of splitParentPhones(value)) {
      const normalized = normalizeParentPhone(phone);
      if (normalized.length >= 7 && normalized.length <= 15) phoneOwners.set(normalized, (phoneOwners.get(normalized) || 0) + 1);
    }
    const phones = new Set((contact.phones || []).flatMap((value) => splitParentPhones(value).map(normalizeParentPhone)).filter((phone) => phone.length >= 7 && phone.length <= 15 && phoneOwners.get(phone) === 1));
    const data = await readCustomerCallData();
    const calls = data.calls.filter((call) => (call.role === "parent" || call.role === "unknown") && phones.has(normalizeParentPhone(call.customerNumber)))
      .map((call) => ({ id: call.id, timestamp: call.timestamp, direction: call.direction, answered: call.answered, callType: call.callType, durationSeconds: call.talkSeconds || call.durationSeconds, branch: call.branch, missedReason: call.missedReason }));
    const enrollmentHistory = (await readEnrollmentImports()).flatMap((item) => item.rows
      .filter((row) => row.parentContactIds?.includes(contact.id))
      .map((row) => ({ importName: item.displayName, fileName: item.fileName, importedAt: item.importedAt, studentName: `${row.firstName} ${row.lastName}`.trim(), school: row.school, className: row.className, slots: row.slots })));
    return Response.json({ contact, calls, enrollmentHistory }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Impossible de charger l’historique du parent." }, { status: 503 });
  }
}

export const GET = withIdentity(getHandler);

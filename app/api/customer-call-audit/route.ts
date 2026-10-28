import { createHash } from "node:crypto";
import { withIdentity } from "@/app/lib/with-identity";
import { normalizeParentPhone, type ParentContact } from "@/app/lib/parents";
import { readTutorTracking, taskStore } from "@/app/lib/shared-data";
import { readCustomerCallData, writeCustomerCallData } from "@/app/lib/customer-call-audit";
import { evaluateCustomerCallback, mergeCustomerCallRecords, normalizeCustomerPhone, parseCustomerCallCsv, type CustomerCallRole } from "@/app/lib/customer-call-audit-parser";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function identityHash(phone: string, callId: string) {
  return createHash("sha256").update(phone || `unlinked:${callId}`).digest("hex");
}

function callNeedsCallback(call: { direction: string; answered: boolean }) {
  return call.direction === "inbound" && !call.answered;
}

async function getHandler() {
  try {
    const store = taskStore();
    const readParentContacts = async () => {
      const key = "parents-crm/contacts.json";
      if (!await store.getMetadata(key, { consistency: "strong" })) return [] as ParentContact[];
      const value = await store.get(key, { type: "json", consistency: "strong" });
      return Array.isArray(value) ? value as ParentContact[] : [];
    };
    const [data, rawContacts, tracking] = await Promise.all([
      readCustomerCallData(),
      readParentContacts(),
      readTutorTracking(),
    ]);
    const contacts = rawContacts;
    const parentByPhone = new Map<string, ParentContact[]>();
    for (const contact of contacts) for (const phone of contact.phones || []) {
      const normalized = normalizeParentPhone(phone);
      if (normalized) parentByPhone.set(normalized, [...(parentByPhone.get(normalized) || []), contact]);
    }
    const tutorByPhone = new Map<string, string[]>();
    for (const snapshot of tracking.snapshots) for (const tutor of snapshot.records) {
      const normalized = normalizeCustomerPhone(tutor.phone || "");
      if (!normalized) continue;
      const label = `${tutor.firstName} ${tutor.lastName}`.trim() || tutor.tutorId || "Tuteur";
      tutorByPhone.set(normalized, [...new Set([...(tutorByPhone.get(normalized) || []), label])]);
    }
    const calls = data.calls.map((call) => {
      const parentMatches = (call.role === "parent" || call.role === "unknown") ? parentByPhone.get(call.customerNumber) || [] : [];
      const tutorMatches = (call.role === "tutor-candidate" || call.role === "unknown") ? tutorByPhone.get(call.customerNumber) || [] : [];
      const role: CustomerCallRole = call.role === "unknown" && parentMatches.length === 1 && tutorMatches.length === 0 ? "parent" : call.role === "unknown" && tutorMatches.length === 1 && parentMatches.length === 0 ? "tutor-candidate" : call.role;
      const parent = role === "parent" && parentMatches.length === 1 ? parentMatches[0] : undefined;
      const missed = callNeedsCallback(call);
      const callback = evaluateCustomerCallback(call, data.calls);
      return {
        id: call.id,
        date: call.date,
        timestamp: call.timestamp,
        direction: call.direction,
        callType: call.callType,
        answered: call.answered,
        missedReason: call.missedReason,
        durationSeconds: call.durationSeconds,
        talkSeconds: call.talkSeconds,
        waitingSeconds: call.waitingSeconds,
        role,
        branch: call.branch,
        callerId: identityHash(call.customerNumber, call.id),
        parentId: parent?.id || "",
        parentName: parent ? (parent.fullName || `${parent.firstName} ${parent.lastName}`).trim() : "",
        parentEnrollment: parent?.enrolled === true ? "inscrit" : parent?.enrolled === false ? "non-inscrit" : "inconnu",
        parentMatchAmbiguous: parentMatches.length > 1,
        tutorName: tutorMatches.length === 1 ? tutorMatches[0] : "",
        tutorMatchAmbiguous: tutorMatches.length > 1,
        requiresCallback: missed,
        callbackState: callback.state,
        callbackAttemptCount: missed ? callback.attemptCount : 0,
      };
    });
    return json({ calls, imports: data.imports, settings: data.settings });
  } catch {
    return json({ error: "Impossible de charger le suivi des appels." }, 503);
  }
}

async function postHandler(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_UPLOAD_BYTES) return json({ error: "Le fichier dépasse la limite de 15 Mo." }, 413);
    const csv = await request.text();
    if (!csv.trim()) return json({ error: "Le CSV est vide." }, 400);
    if (new TextEncoder().encode(csv).byteLength > MAX_UPLOAD_BYTES) return json({ error: "Le fichier dépasse la limite de 15 Mo." }, 413);
    const url = new URL(request.url);
    const fileName = (url.searchParams.get("fileName") || "export-aircall.csv").replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 180);
    const importedAt = new Date().toISOString();
    const parsed = parseCustomerCallCsv(csv, fileName, importedAt);
    const data = await readCustomerCallData();
    const merged = mergeCustomerCallRecords(data.calls, parsed.events);
    const importEntry = {
      id: crypto.randomUUID(),
      fileName,
      importedAt,
      rowCount: parsed.rowCount,
      addedCount: merged.addedCount,
      duplicateCount: merged.duplicateCount,
      skippedCount: parsed.skippedCount,
    };
    const next = {
      calls: merged.calls,
      imports: [importEntry, ...data.imports].slice(0, 100),
      settings: data.settings,
    };
    await writeCustomerCallData(next);
    // Return only a compact import receipt; the original CSV, recordings, notes,
    // voicemail data, and raw phone numbers never go back to the browser.
    return json({ import: importEntry, storedCallCount: next.calls.length });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Import impossible." }, 400);
  }
}

async function patchHandler(request: Request) {
  try {
    const body = await request.json() as { shortCallThresholdSeconds?: number };
    const threshold = Number(body.shortCallThresholdSeconds);
    if (!Number.isInteger(threshold) || threshold < 1 || threshold > 600) return json({ error: "Le seuil doit être compris entre 1 et 600 secondes." }, 400);
    const data = await readCustomerCallData();
    data.settings.shortCallThresholdSeconds = threshold;
    await writeCustomerCallData(data);
    return json({ settings: data.settings });
  } catch {
    return json({ error: "Impossible d’enregistrer ce réglage." }, 400);
  }
}

export const GET = withIdentity(getHandler);
export const POST = withIdentity(postHandler);
export const PATCH = withIdentity(patchHandler);

import { withIdentity } from "@/app/lib/with-identity";
import { NextResponse } from "next/server";
import { normalizeParentEmail, normalizeParentPhone, type ParentContact } from "@/app/lib/parents";
import { taskStore } from "@/app/lib/shared-data";
import { gunzipSync } from "node:zlib";
import {
  createEnrollmentImportFromCsv,
  deleteEnrollmentImportById,
  readEnrollmentImportById,
  readEnrollmentImports,
  readEnrollmentImportSummaries,
  updateEnrollmentImportName,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function getHandler(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");
    if (id) {
      const selectedImport = await readEnrollmentImportById(id);
      return selectedImport ? json({ import: selectedImport }) : json({ error: "Import introuvable" }, 404);
    }
    if (searchParams.get("summary") === "1") {
      return json({ imports: await readEnrollmentImportSummaries() });
    }
    return json({ imports: await readEnrollmentImports() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de charger les imports";
    return json({ error: "Impossible de charger les imports", detail }, 500);
  }
}

async function postHandler(request: Request) {
  const startedAt = Date.now();
  const trace = (stage: string) => console.info("[enrollment-import]", stage, { elapsedMs: Date.now() - startedAt });
  trace("handler:start");
  try {
    const url = new URL(request.url);
    let rawCsv: string;
    if (request.headers.get("x-alpha-csv-compression") === "gzip") {
      const compressed = Buffer.from(await request.arrayBuffer());
      if (compressed.length > 6 * 1024 * 1024) return json({ error: "Le fichier compressé dépasse la limite de 6 Mo." }, 413);
      try {
        rawCsv = gunzipSync(compressed, { maxOutputLength: 20 * 1024 * 1024 }).toString("utf8");
      } catch {
        return json({ error: "Fichier CSV compressé invalide ou trop volumineux (maximum 20 Mo)." }, 400);
      }
    } else {
      rawCsv = await request.text();
      if (Buffer.byteLength(rawCsv, "utf8") > 20 * 1024 * 1024) return json({ error: "Le fichier CSV dépasse la limite de 20 Mo." }, 413);
    }
    trace("body:read");
    if (!rawCsv.trim()) return json({ error: "Fichier CSV vide" }, 400);
    const storedContacts = await taskStore().get("parents-crm/contacts.json", { type: "json", consistency: "strong" });
    trace("contacts:read");
    const contacts = Array.isArray(storedContacts) ? storedContacts as ParentContact[] : [];
    const identities = new Map<string, Set<string>>();
    for (const contact of contacts) {
      for (const email of contact.emails || []) {
        const key = `email:${normalizeParentEmail(email)}`;
        identities.set(key, new Set([...(identities.get(key) || []), contact.id]));
      }
      for (const phone of contact.phones || []) {
        const key = `phone:${normalizeParentPhone(phone)}`;
        identities.set(key, new Set([...(identities.get(key) || []), contact.id]));
      }
    }
    const resolveParentIds = (row: { parentEmails?: string[]; parentPhones?: string[] }) => {
      const ids = new Set<string>();
      for (const email of row.parentEmails || []) for (const id of identities.get(`email:${normalizeParentEmail(email)}`) || []) ids.add(id);
      for (const phone of row.parentPhones || []) for (const id of identities.get(`phone:${normalizeParentPhone(phone)}`) || []) ids.add(id);
      return ids.size === 1 ? [...ids] : [];
    };
    trace("contacts:indexed");
    const createdImport = await createEnrollmentImportFromCsv({
      fileName: url.searchParams.get("fileName") || "parents.csv",
      rawCsv,
      sourceRowCount: Number(request.headers.get("x-alpha-source-row-count")) || undefined,
      resolveParentIds,
    });
    // Enrollment imports can contain tens of thousands of rows. Returning the
    // full import here duplicates the entire CSV-derived dataset in the
    // response and can exceed Netlify's response/runtime limits. The client
    // loads row details separately through GET ?id=... when needed.
    trace("import:created");
    const summary = { ...createdImport, rows: [] };
    const imports = await readEnrollmentImportSummaries();
    trace("summaries:read");
    return json({ import: summary, imports }, 201);
  } catch (error) {
    trace("error");
    const detail = error instanceof Error ? error.message : "Impossible d’importer le CSV";
    return json({ error: "Impossible d’importer le CSV", detail }, 500);
  }
}

async function patchHandler(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; displayName?: unknown };
    if (typeof body.id !== "string" || typeof body.displayName !== "string") {
      return json({ error: "Nom d’import invalide" }, 400);
    }
    await updateEnrollmentImportName(body.id, body.displayName);
    return json({ imports: await readEnrollmentImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de renommer l’import";
    return json({ error: "Impossible de renommer l’import", detail }, 500);
  }
}

async function deleteHandler(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Identifiant manquant" }, 400);
    await deleteEnrollmentImportById(id);
    return json({ imports: await readEnrollmentImportSummaries() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de supprimer l’import";
    return json({ error: "Impossible de supprimer l’import", detail }, 500);
  }
}

export const GET = withIdentity(getHandler);
export const POST = withIdentity(postHandler);
export const PATCH = withIdentity(patchHandler);
export const DELETE = withIdentity(deleteHandler);

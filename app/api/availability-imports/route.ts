import { NextResponse } from "next/server";
import {
  createAvailabilityImportFromCsv,
  deleteAvailabilityImportById,
  readAvailabilityImports,
  readAvailabilityImportById,
  readAvailabilityImportSummaries,
  readAvailabilityRawCsv,
  sanitizeAvailabilityImport,
  updateAvailabilityImportName,
  writeAvailabilityImports,
} from "@/app/lib/shared-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawImportId = url.searchParams.get("id");
    if (rawImportId && url.searchParams.get("raw") === "1") {
      const rawCsv = await readAvailabilityRawCsv(rawImportId);
      if (!rawCsv) return json({ error: "Raw CSV not found" }, 404);
      return new NextResponse(rawCsv, {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/csv; charset=utf-8",
        },
      });
    }
    if (rawImportId) {
      const selectedImport = await readAvailabilityImportById(rawImportId);
      return selectedImport ? json({ import: selectedImport }) : json({ error: "Import introuvable" }, 404);
    }
    if (url.searchParams.get("summary") === "1") {
      return json({ imports: await readAvailabilityImportSummaries() });
    }
    return json({ imports: await readAvailabilityImports() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load availability imports";
    return json({ error: "Unable to load availability imports", detail: message }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fileName?: unknown; rawCsv?: unknown };
    if (typeof body.rawCsv !== "string" || !body.rawCsv.trim()) return json({ error: "Invalid CSV" }, 400);
    const createdImport = await createAvailabilityImportFromCsv({
      fileName: typeof body.fileName === "string" ? body.fileName : "disponibilites.csv",
      rawCsv: body.rawCsv,
    });
    return json({ import: createdImport, imports: await readAvailabilityImportSummaries() }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import availability CSV";
    return json({ error: "Unable to import availability CSV", detail: message }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { imports?: unknown };
    if (!Array.isArray(body.imports)) return json({ error: "Invalid availability imports" }, 400);
    const imports = body.imports
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map(sanitizeAvailabilityImport)
      .sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime());
    await writeAvailabilityImports(imports);
    const verifiedImports = await readAvailabilityImports();
    return json({ imports: verifiedImports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save availability imports";
    return json({ error: "Unable to save availability imports", detail: message }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: unknown; displayName?: unknown };
    if (typeof body.id !== "string" || typeof body.displayName !== "string") {
      return json({ error: "Invalid import name" }, 400);
    }
    await updateAvailabilityImportName(body.id, body.displayName);
    return json({ imports: await readAvailabilityImports() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to rename availability import";
    return json({ error: "Unable to rename availability import", detail: message }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing import id" }, 400);
    await deleteAvailabilityImportById(id);
    return json({ imports: await readAvailabilityImports() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete availability import";
    return json({ error: "Unable to delete availability import", detail: message }, 500);
  }
}

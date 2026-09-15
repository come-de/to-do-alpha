import { NextResponse } from "next/server";
import { readAvailabilityImports, sanitizeAvailabilityImport, writeAvailabilityImports } from "@/app/lib/shared-data";

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

export async function GET() {
  try {
    return json({ imports: await readAvailabilityImports() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load availability imports";
    return json({ error: "Unable to load availability imports", detail: message }, 500);
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

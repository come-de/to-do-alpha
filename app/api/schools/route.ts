import { NextResponse } from "next/server";
import { readSchools, sanitizeSchool, writeSchools } from "@/app/lib/shared-data";

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
  return json({ schools: await readSchools() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { schools?: unknown };
    if (!Array.isArray(body.schools)) return json({ error: "Invalid school list" }, 400);

    const schools = body.schools
      .filter((school): school is Record<string, unknown> => Boolean(school && typeof school === "object"))
      .map(sanitizeSchool)
      .filter((school) => school.name)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    await writeSchools(schools);
    return json({ schools });
  } catch {
    return json({ error: "Unable to save schools" }, 500);
  }
}

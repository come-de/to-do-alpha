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

function inferredSchoolType(categories: string[]) {
  const normalized = categories.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  const hasAlpha = normalized.includes("alpha") || normalized.includes("etude");
  const hasService = normalized.includes("surveillance") || normalized.includes("prestation") || normalized.includes("service");
  if (hasAlpha && hasService) return "mixed" as const;
  if (hasAlpha) return "alpha" as const;
  if (hasService) return "mise-a-dispo" as const;
  return "mixed" as const;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { schools?: unknown };
    if (!Array.isArray(body.schools)) return json({ error: "Liste d’établissements invalide" }, 400);

    const existing = await readSchools();
    const knownIds = new Set(existing.map((school) => school.externalId).filter(Boolean));
    const requestIds = new Set<string>();
    const skippedIds: string[] = [];
    const now = new Date().toISOString();
    const created = body.schools.flatMap((raw) => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      const externalId = typeof item.externalId === "string" ? item.externalId.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const categories = Array.isArray(item.categories)
        ? Array.from(new Set(item.categories.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)))
        : [];
      if (!externalId || !name) return [];
      if (knownIds.has(externalId) || requestIds.has(externalId)) {
        skippedIds.push(externalId);
        return [];
      }
      requestIds.add(externalId);
      return [sanitizeSchool({
        id: `school-${externalId}`,
        externalId,
        name,
        category: categories.join(" · "),
        schoolType: inferredSchoolType(categories),
        portfolioOwner: "",
        city: name.split(" - ")[0]?.trim() || "",
        zone: "",
        coordinator: "",
        registeredCount: null,
        address: "",
        department: "",
        upcomingWeek: "",
        pastSessions: "",
        typicalWeek: "",
        contractSigned: "",
        actions: "",
        contact: "",
        nextAction: "",
        notes: "",
        events: [],
        createdAt: now,
        updatedAt: now,
      })];
    });

    const schools = [...created, ...existing].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    await writeSchools(schools);
    return json({ schools, created, skippedIds }, 201);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Impossible de créer les établissements";
    return json({ error: "Impossible de créer les établissements", detail }, 500);
  }
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

    const usedIds = new Set<string>();
    const duplicateId = schools.find((school) => {
      if (!school.externalId) return false;
      if (usedIds.has(school.externalId)) return true;
      usedIds.add(school.externalId);
      return false;
    });
    if (duplicateId) return json({ error: `L’ID établissement ${duplicateId.externalId} est déjà utilisé` }, 409);

    await writeSchools(schools);
    return json({ schools });
  } catch {
    return json({ error: "Unable to save schools" }, 500);
  }
}

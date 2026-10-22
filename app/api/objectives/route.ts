import { withIdentity } from "@/app/lib/with-identity";
import { NextResponse } from "next/server";
import { readObjectives, sanitizeObjective, writeObjectives } from "@/app/lib/shared-data";

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

async function getHandler() {
  return json({ objectives: await readObjectives() });
}

async function putHandler(request: Request) {
  try {
    const body = (await request.json()) as { objectives?: unknown };
    if (!Array.isArray(body.objectives)) return json({ error: "Invalid objective list" }, 400);

    const objectives = body.objectives
      .filter((objective): objective is Record<string, unknown> =>
        Boolean(objective && typeof objective === "object"),
      )
      .map(sanitizeObjective)
      .filter((objective) => objective.title);

    await writeObjectives(objectives);
    return json({ objectives });
  } catch {
    return json({ error: "Unable to save objectives" }, 500);
  }
}

export const GET = withIdentity(getHandler);
export const PUT = withIdentity(putHandler);

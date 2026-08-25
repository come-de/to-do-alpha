import { NextResponse } from "next/server";
import { readLinks, sanitizeSharedLink, writeLinks } from "@/app/lib/shared-data";

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
  return json({ links: await readLinks() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { links?: unknown };
    if (!Array.isArray(body.links)) return json({ error: "Invalid link list" }, 400);

    const links = body.links
      .filter((link): link is Record<string, unknown> => Boolean(link && typeof link === "object"))
      .map(sanitizeSharedLink)
      .filter((link) => link.title && link.url);

    await writeLinks(links);
    return json({ links });
  } catch {
    return json({ error: "Unable to save links" }, 500);
  }
}

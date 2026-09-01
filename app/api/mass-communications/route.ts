import { NextResponse } from "next/server";
import { readMassCommunications, sanitizeMassCommunication, writeMassCommunications } from "@/app/lib/shared-data";

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
  return json({ communications: await readMassCommunications() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { communications?: unknown };
    if (!Array.isArray(body.communications)) return json({ error: "Invalid communication list" }, 400);

    const communications = body.communications
      .filter((communication): communication is Record<string, unknown> => Boolean(communication && typeof communication === "object"))
      .map(sanitizeMassCommunication)
      .filter((communication) => communication.title)
      .sort((a, b) => new Date(b.sentAt || b.followUpDate || b.createdAt).getTime() - new Date(a.sentAt || a.followUpDate || a.createdAt).getTime());

    await writeMassCommunications(communications);
    return json({ communications });
  } catch {
    return json({ error: "Unable to save communications" }, 500);
  }
}

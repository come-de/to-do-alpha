import { NextResponse } from "next/server";
import {
  readTutorReportComments,
  sanitizeTutorReportComment,
  writeTutorReportComments,
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

export async function GET() {
  return json({ comments: await readTutorReportComments() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { comments?: unknown };
    if (!Array.isArray(body.comments)) return json({ error: "Invalid tutor report comment list" }, 400);

    const commentsByTutor = new Map<string, ReturnType<typeof sanitizeTutorReportComment>>();
    body.comments
      .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
      .map(sanitizeTutorReportComment)
      .filter((comment) => comment.tutorKey)
      .forEach((comment) => {
        commentsByTutor.set(comment.tutorKey, comment);
      });

    const comments = Array.from(commentsByTutor.values()).sort((a, b) => a.tutorKey.localeCompare(b.tutorKey, "fr"));
    await writeTutorReportComments(comments);
    return json({ comments });
  } catch {
    return json({ error: "Unable to save tutor report comments" }, 500);
  }
}

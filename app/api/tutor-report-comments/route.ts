import { withIdentity } from "@/app/lib/with-identity";
import { NextResponse } from "next/server";
import {
  readTutorReportComments,
  sanitizeTutorReportComment,
  writeTutorReportComment,
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

async function getHandler() {
  return json({ comments: await readTutorReportComments() });
}

async function putHandler(request: Request) {
  try {
    const body = (await request.json()) as { comment?: unknown; comments?: unknown };
    if (body.comment && typeof body.comment === "object" && !Array.isArray(body.comment)) {
      const comment = sanitizeTutorReportComment(body.comment as Record<string, unknown>);
      if (!comment.tutorId) return json({ error: "A tutor ID is required" }, 400);
      await writeTutorReportComment(comment);
      return json({ comments: await readTutorReportComments() });
    }
    if (!Array.isArray(body.comments)) return json({ error: "Invalid tutor report comment list" }, 400);

    const commentsByTutor = new Map<string, ReturnType<typeof sanitizeTutorReportComment>>();
    const existing = await readTutorReportComments();
    existing.forEach((comment) => {
      commentsByTutor.set(comment.tutorId ? `id:${comment.tutorId}` : `legacy:${comment.legacyKey || comment.updatedAt}`, comment);
    });
    body.comments
      .filter((comment): comment is Record<string, unknown> => Boolean(comment && typeof comment === "object"))
      .map(sanitizeTutorReportComment)
      .forEach((comment) => {
        commentsByTutor.set(comment.tutorId ? `id:${comment.tutorId}` : `legacy:${comment.legacyKey || comment.updatedAt}`, comment);
      });

    const comments = Array.from(commentsByTutor.values()).sort((a, b) => a.tutorId.localeCompare(b.tutorId, "fr"));
    await writeTutorReportComments(comments);
    return json({ comments });
  } catch {
    return json({ error: "Unable to save tutor report comments" }, 500);
  }
}

export const GET = withIdentity(getHandler);
export const PUT = withIdentity(putHandler);

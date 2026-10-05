import { NextResponse } from "next/server";
import { readJournalPosts, sanitizeJournalPost, writeJournalPosts } from "@/app/lib/shared-data";

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
  return json({ posts: await readJournalPosts() });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { posts?: unknown };
    if (!Array.isArray(body.posts)) return json({ error: "Invalid journal post list" }, 400);

    const posts = body.posts
      .filter((post): post is Record<string, unknown> => Boolean(post && typeof post === "object"))
      .map(sanitizeJournalPost)
      .filter((post) => post.title && post.content)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    await writeJournalPosts(posts);
    return json({ posts });
  } catch {
    return json({ error: "Unable to save journal posts" }, 500);
  }
}

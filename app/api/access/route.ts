import { NextResponse } from "next/server";

const ACCESS_CODE = "Alpha_The_Best";
const ACCESS_COOKIE = "alpha_access";
const ACCESS_TOKEN = "alpha-unlocked-v1";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (code !== ACCESS_CODE) return json({ ok: false, error: "Code incorrect" }, 401);

    const response = json({ ok: true });
    response.cookies.set({
      name: ACCESS_COOKIE,
      value: ACCESS_TOKEN,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    return response;
  } catch {
    return json({ ok: false, error: "Demande invalide" }, 400);
  }
}

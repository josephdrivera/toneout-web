import { NextResponse } from "next/server";
import {
  EDITOR_COOKIE,
  EDITOR_COOKIE_MAX_AGE_SECONDS,
  makeSessionToken,
  verifyPassword,
} from "../../../../lib/editorSession";

export const dynamic = "force-dynamic";

const rateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  rateMap.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const password =
      isRecord(body) && typeof body.password === "string" ? body.password : "";

    if (!process.env.EDITOR_SECRET) {
      return NextResponse.json(
        { error: "Editor access is not configured." },
        { status: 503 },
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = makeSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "Editor access is not configured." },
        { status: 503 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(EDITOR_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EDITOR_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(EDITOR_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

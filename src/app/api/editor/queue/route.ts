import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { EDITOR_COOKIE, verifySessionCookie } from "../../../../lib/editorSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  if (!verifySessionCookie(cookieStore.get(EDITOR_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.EDITOR_SECRET;
  if (!convexUrl || !secret) {
    return NextResponse.json(
      { error: "Editor backend is not configured." },
      { status: 503 },
    );
  }

  try {
    const convex = new ConvexHttpClient(convexUrl);
    const queue = await convex.query(api.alerts.listReviewQueue, { secret });
    return NextResponse.json(
      { queue },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load the review queue." },
      { status: 500 },
    );
  }
}

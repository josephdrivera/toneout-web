import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  convexClient,
  makeAdminSession,
  serverSecret,
  verifyPassword,
} from "../../../../lib/adminSession";
import { badRequest, createRateLimiter, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

const isRateLimited = createRateLimiter();

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many attempts. Please try again in a minute.", 429);
    }
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Admin is not configured.", 503);

    const body: unknown = await request.json();
    const email = field(body, "email").toLowerCase();
    const password =
      typeof body === "object" && body !== null
        ? String((body as Record<string, unknown>).password ?? "")
        : "";
    if (!email || !password) return badRequest("Enter your email and password.");

    const user = await convex.query(api.admins.getForLogin, { secret, email });
    // Same answer for unknown email, wrong password and disabled account.
    if (!user || user.disabled || !verifyPassword(password, user.passwordHash)) {
      return badRequest("Incorrect email or password.", 401);
    }

    const session = makeAdminSession(user._id);
    if (!session) return badRequest("Admin is not configured.", 503);
    await convex.mutation(api.admins.recordLogin, { secret, id: user._id });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, session, adminCookieOptions());
    return response;
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", adminCookieOptions(0));
  return response;
}

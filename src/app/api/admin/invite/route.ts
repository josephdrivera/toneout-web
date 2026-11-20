import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import {
  ADMIN_COOKIE,
  MIN_PASSWORD_LENGTH,
  adminCookieOptions,
  convexClient,
  hashPassword,
  makeAdminSession,
  serverSecret,
  sha256,
} from "../../../../lib/adminSession";
import { badRequest, createRateLimiter, field } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

const isRateLimited = createRateLimiter();

/** Redeems a one-time invite link: the invited person sets their password. */
export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many attempts. Please try again in a minute.", 429);
    }
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Admin is not configured.", 503);

    const body: unknown = await request.json();
    const token = field(body, "token");
    const password =
      typeof body === "object" && body !== null
        ? String((body as Record<string, unknown>).password ?? "")
        : "";
    if (!token) return badRequest("This invite link is not valid.");
    if (password.length < MIN_PASSWORD_LENGTH) {
      return badRequest(
        `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }

    const id = await convex.mutation(api.admins.acceptInvite, {
      secret,
      inviteTokenHash: sha256(token),
      passwordHash: hashPassword(password),
    });
    if (!id) {
      return badRequest(
        "This invite link has expired or was already used. Ask for a new one.",
        410,
      );
    }

    const session = makeAdminSession(id);
    const response = NextResponse.json({ success: true });
    if (session) response.cookies.set(ADMIN_COOKIE, session, adminCookieOptions());
    return response;
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}

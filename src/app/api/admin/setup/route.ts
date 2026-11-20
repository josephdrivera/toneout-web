import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { api } from "../../../../../convex/_generated/api";
import {
  ADMIN_COOKIE,
  MIN_PASSWORD_LENGTH,
  adminCookieOptions,
  convexClient,
  hashPassword,
  makeAdminSession,
  serverSecret,
} from "../../../../lib/adminSession";
import {
  EMAIL_RE,
  badRequest,
  createRateLimiter,
  field,
} from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

const isRateLimited = createRateLimiter();

/** Whether first-run setup is still open (no admin exists yet). */
export async function GET() {
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);
  const count = await convex.query(api.admins.count, { secret });
  return NextResponse.json(
    { open: count === 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * First run only: creates the owner account. Proof of ownership is the
 * server's editor password (EDITOR_SECRET); refused once any admin exists.
 */
export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many attempts. Please try again in a minute.", 429);
    }
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Admin is not configured.", 503);

    const body: unknown = await request.json();
    const raw = (typeof body === "object" && body !== null ? body : {}) as Record<
      string,
      unknown
    >;
    const setupPassword = String(raw.setupPassword ?? "");
    const password = String(raw.password ?? "");
    const email = field(body, "email").toLowerCase();
    const name = field(body, "name");

    const a = Buffer.from(setupPassword);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return badRequest("Incorrect editor password.", 401);
    }
    if (!name || !EMAIL_RE.test(email)) {
      return badRequest("Enter your name and a valid email.");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return badRequest(
        `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }

    const id = await convex.mutation(api.admins.createOwner, {
      secret,
      email,
      name,
      passwordHash: hashPassword(password),
    });
    if (!id) return badRequest("Setup is already complete. Sign in instead.", 409);

    const session = makeAdminSession(id);
    const response = NextResponse.json({ success: true });
    if (session) response.cookies.set(ADMIN_COOKIE, session, adminCookieOptions());
    return response;
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}

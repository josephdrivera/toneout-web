import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  EMAIL_RE,
  MAX_EMAIL_LENGTH,
  badRequest,
  createRateLimiter,
  field,
  notifyAdmin,
} from "../../../lib/formApi";

export const dynamic = "force-dynamic";

const MAX_SHORT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

const isRateLimited = createRateLimiter();

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return badRequest("Too many requests. Please try again in a minute.", 429);
    }

    const body: unknown = await request.json();
    // Honeypot: real visitors never fill this hidden field.
    if (field(body, "website")) {
      return NextResponse.json({ success: true });
    }

    const hostType = field(body, "hostType") === "home" ? "home" : "firehouse";
    const name = field(body, "name");
    const department = field(body, "department");
    const town = field(body, "town");
    const email = field(body, "email").toLowerCase();
    const phone = field(body, "phone");
    const role = field(body, "role");
    const message = field(body, "message");

    if (!name || !town) {
      return badRequest("Please fill in your name and town.");
    }
    if (hostType === "firehouse" && !department) {
      return badRequest("Please tell us which fire department.");
    }
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
      return badRequest("Please enter a valid email so we can reach you.");
    }
    if (
      [name, department, town, phone, role].some(
        (value) => value.length > MAX_SHORT_LENGTH,
      )
    ) {
      return badRequest("One of those fields is too long. Please shorten it.");
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return badRequest("Please keep the notes under 2000 characters.");
    }

    let saved = false;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      try {
        const convex = new ConvexHttpClient(convexUrl);
        const result = await convex.mutation(api.demoRequests.submit, {
          hostType,
          name,
          ...(department ? { department } : {}),
          town,
          email,
          ...(phone ? { phone } : {}),
          ...(role ? { role } : {}),
          ...(message ? { message } : {}),
        });
        saved = result.success;
      } catch (convexErr) {
        console.error("Demo request archive error:", convexErr);
      }
    }

    const emailed = await notifyAdmin({
      subject:
        hostType === "home"
          ? `Home node request: ${town}`
          : `Firehouse node request: ${department}, ${town}`,
      badge: hostType === "home" ? "Home Node Request" : "Firehouse Node Request",
      rows: [
        { label: "Node location", value: hostType === "home" ? "At a home" : "At a firehouse" },
        { label: "Department", value: department },
        { label: "Town", value: town },
        { label: "Name", value: name },
        { label: "Role", value: role },
        { label: "Email", value: email },
        { label: "Phone", value: phone },
        { label: "Notes", value: message },
      ],
      replyTo: email,
    });

    // Only fail if the request reached neither the database nor the inbox.
    if (!saved && !emailed) {
      return badRequest("We couldn't send that. Please try again.", 500);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Demo request API error:", err);
    return badRequest("Something went wrong. Please try again.", 500);
  }
}

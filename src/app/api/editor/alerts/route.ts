import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  CATEGORIES,
  VERIFICATION_LEVELS,
  type Category,
  type Verification,
} from "../../../../../convex/lib/taxonomy";
import { hasEditorAccess } from "../../../../lib/adminSession";

export const dynamic = "force-dynamic";

const ACTIONS = [
  "approve",
  "reject",
  "updateDetails",
  "setVerification",
  "markDuplicate",
  "clearReviewFlag",
] as const;
type Action = (typeof ACTIONS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 120) : undefined;
}

export async function POST(request: Request) {
  if (!(await hasEditorAccess())) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action as Action;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  if (typeof body.alertId !== "string" || !body.alertId) {
    return NextResponse.json({ error: "alertId is required." }, { status: 400 });
  }
  const alertId = body.alertId as Id<"alerts">;

  const convex = new ConvexHttpClient(convexUrl);

  try {
    switch (action) {
      case "approve":
        await convex.mutation(api.alerts.approve, { secret, alertId });
        break;
      case "reject":
        await convex.mutation(api.alerts.reject, { secret, alertId });
        break;
      case "clearReviewFlag":
        await convex.mutation(api.alerts.clearReviewFlag, { secret, alertId });
        break;
      case "setVerification": {
        const verification = body.verification;
        if (
          typeof verification !== "string" ||
          !VERIFICATION_LEVELS.includes(verification as Verification)
        ) {
          return NextResponse.json(
            { error: "Invalid verification level." },
            { status: 400 },
          );
        }
        await convex.mutation(api.alerts.setVerification, {
          secret,
          alertId,
          verification: verification as Verification,
        });
        break;
      }
      case "markDuplicate": {
        if (typeof body.duplicateOf !== "string" || !body.duplicateOf) {
          return NextResponse.json(
            { error: "duplicateOf is required." },
            { status: 400 },
          );
        }
        await convex.mutation(api.alerts.markDuplicate, {
          secret,
          alertId,
          duplicateOf: body.duplicateOf as Id<"alerts">,
        });
        break;
      }
      case "updateDetails": {
        const category = optionalString(body.category);
        if (category && !CATEGORIES.includes(category as Category)) {
          return NextResponse.json(
            { error: "Invalid category." },
            { status: 400 },
          );
        }
        await convex.mutation(api.alerts.updateDetails, {
          secret,
          alertId,
          town: optionalString(body.town),
          state: optionalString(body.state),
          county: optionalString(body.county),
          department: optionalString(body.department),
          category: category as Category | undefined,
        });
        break;
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("not found")
        ? "Alert not found."
        : "The action failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

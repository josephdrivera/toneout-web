import { api } from "../../../../../../convex/_generated/api";
import {
  convexClient,
  currentAdmin,
  serverSecret,
} from "../../../../../lib/adminSession";
import { badRequest } from "../../../../../lib/formApi";

export const dynamic = "force-dynamic";

/** The whole project log (and links) as one Markdown file. */
export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return badRequest("Unauthorized", 401);
  const secret = serverSecret();
  const convex = convexClient();
  if (!secret || !convex) return badRequest("Admin is not configured.", 503);

  const [entries, links] = await Promise.all([
    convex.query(api.projectLog.listEntries, { secret }),
    convex.query(api.projectLog.listLinks, { secret }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    "# ToneOut project log",
    "",
    `Downloaded ${today}. Newest first. This file holds no passwords or keys.`,
    "",
  ];

  let currentDate = "";
  for (const entry of entries) {
    if (entry.date !== currentDate) {
      currentDate = entry.date;
      lines.push(`## ${entry.date}`, "");
    }
    lines.push(`### ${entry.title} (${entry.area})`, "", entry.body, "");
  }

  if (links.length > 0) {
    lines.push("# Where everything lives", "");
    let currentGroup = "";
    for (const link of links) {
      if (link.group !== currentGroup) {
        currentGroup = link.group;
        lines.push(`## ${link.group}`, "");
      }
      lines.push(
        `- [${link.label}](${link.url})${link.note ? `: ${link.note}` : ""}`,
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="toneout-project-log-${today}.md"`,
      "Cache-Control": "no-store",
    },
  });
}

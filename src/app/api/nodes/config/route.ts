import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { convexClient, serverSecret, sha256 } from "../../../../lib/adminSession";
import { badRequest } from "../../../../lib/formApi";

export const dynamic = "force-dynamic";

/**
 * A node downloads its audio settings, already shaped like the capture.json
 * file it runs from.
 *   Authorization: Bearer <nodeKey>
 *   -> 200 { version, capture: {...} | null }   (null = no audio configured)
 *   -> 401 unknown key, 403 license disabled
 */
export async function GET(request: Request) {
  try {
    const secret = serverSecret();
    const convex = convexClient();
    if (!secret || !convex) return badRequest("Not configured.", 503);

    const auth = request.headers.get("authorization") ?? "";
    const nodeKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!nodeKey) return badRequest("Missing node key.", 401);

    const config = await convex.query(api.nodes.getConfig, {
      secret,
      keyHash: sha256(nodeKey),
    });
    if (!config) return badRequest("Unknown node key.", 401);
    if (config.status === "disabled") {
      return badRequest("This node's license is disabled.", 403);
    }

    const c = config.capture;
    const capture = c
      ? {
          name: c.name,
          mount: c.mount,
          input:
            c.inputType === "alsa"
              ? { type: "alsa", device: c.device ?? "default" }
              : c.inputType === "rtl_fm"
                ? {
                    type: "rtl_fm",
                    frequency_mhz: c.frequencyMhz,
                    ...(c.gain !== undefined ? { gain: c.gain } : {}),
                  }
                : { type: "file", path: c.path },
          ...(c.squelchOpen !== undefined || c.squelchClose !== undefined
            ? {
                squelch: {
                  ...(c.squelchOpen !== undefined ? { open: c.squelchOpen } : {}),
                  ...(c.squelchClose !== undefined
                    ? { close: c.squelchClose }
                    : {}),
                },
              }
            : {}),
          record: { enabled: c.record === true },
          tones: {
            watched: c.tones.map((tone) => ({
              department: tone.department,
              label: tone.label,
              tone_a: tone.toneA,
              tone_b: tone.toneB,
            })),
          },
        }
      : null;

    return NextResponse.json(
      { version: config.version, capture },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return badRequest("Something went wrong.", 500);
  }
}

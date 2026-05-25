import { NextResponse } from "next/server";
import { expectedFeedIds } from "../../../data/feedCatalog";

export const dynamic = "force-dynamic";

const ICECAST_STATUS_URL = "https://feeds.toneout.app/icecast-status.json";
const FETCH_TIMEOUT_MS = 5_000;

type NetworkStatus = "live" | "degraded" | "offline";

type NetworkStatusResponse = {
  status: NetworkStatus;
  feeds_active: number;
  feeds_total: number;
  last_check: string;
};

type IcecastSource = {
  listenurl?: unknown;
  server_name?: unknown;
  stream_start?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Icecast can serialize `source` as a single object when one mount is live
 * and as an array when multiple are. Normalize to an array.
 */
function extractSources(payload: unknown): IcecastSource[] {
  if (!isRecord(payload)) return [];
  const icestats = payload.icestats;
  if (!isRecord(icestats)) return [];
  const source = icestats.source;
  if (Array.isArray(source)) {
    return source.filter(isRecord) as IcecastSource[];
  }
  if (isRecord(source)) {
    return [source as IcecastSource];
  }
  return [];
}

/**
 * Best-effort mount-point ID extraction. Icecast's listenurl looks like
 * `http://host:port/glastonbury-dispatch`, so the last path segment is the
 * mount ID. Fall back to server_name if listenurl is missing.
 */
function mountIdFromSource(source: IcecastSource): string | null {
  const listenurl =
    typeof source.listenurl === "string" ? source.listenurl : null;
  if (listenurl) {
    try {
      const url = new URL(listenurl);
      const last = url.pathname.split("/").filter(Boolean).pop();
      if (last) return last;
    } catch {
      const tail = listenurl.split("/").filter(Boolean).pop();
      if (tail) return tail;
    }
  }
  if (typeof source.server_name === "string" && source.server_name) {
    return source.server_name;
  }
  return null;
}

function offlineResponse(): NextResponse {
  const body: NetworkStatusResponse = {
    status: "offline",
    feeds_active: 0,
    feeds_total: expectedFeedIds.length,
    last_check: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(ICECAST_STATUS_URL, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!upstream.ok) {
      return offlineResponse();
    }

    const payload: unknown = await upstream.json();
    const sources = extractSources(payload);

    if (sources.length === 0) {
      return offlineResponse();
    }

    const presentIds = new Set(
      sources
        .map(mountIdFromSource)
        .filter((id): id is string => typeof id === "string"),
    );

    const activeExpected = expectedFeedIds.filter((id) =>
      presentIds.has(id),
    ).length;

    const total = expectedFeedIds.length;
    let status: NetworkStatus;
    if (activeExpected === total) {
      status = "live";
    } else if (activeExpected > 0) {
      status = "degraded";
    } else {
      status = "offline";
    }

    const body: NetworkStatusResponse = {
      status,
      feeds_active: activeExpected,
      feeds_total: total,
      last_check: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return offlineResponse();
  } finally {
    clearTimeout(timeout);
  }
}

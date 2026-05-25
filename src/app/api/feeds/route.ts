import { NextResponse } from "next/server";
import { feedCatalog } from "../../../data/feedCatalog";

export function GET() {
  return NextResponse.json(feedCatalog, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

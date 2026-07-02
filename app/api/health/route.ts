import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "hackathons-north-america",
    timestamp: new Date().toISOString(),
  });
}

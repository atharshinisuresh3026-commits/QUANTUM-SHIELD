export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

/**
 * Only real, currently-computable numbers. No fabricated metrics —
 * anything this app doesn't actually track (response latency, a "security
 * score") is simply not included here.
 */
export async function GET() {
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  return NextResponse.json({
    registeredUsers: row.count,
  });
}

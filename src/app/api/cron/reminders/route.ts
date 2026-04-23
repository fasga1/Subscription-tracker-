import { NextResponse } from "next/server";
import { sendBillingReminders } from "@/lib/reminders";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET ?? "";
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendBillingReminders();
    return NextResponse.json({
      ok: true,
      ...result,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron reminders failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Reminder job failed",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createNodeClient, waitlist } from "@repo/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/** POST /api/waitlist — collect early-access emails (public) */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const db = getDb();
    await db.insert(waitlist).values({ email });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    // Unique constraint violation = duplicate email
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json({ error: "Already registered" }, { status: 409 });
    }
    console.error("[POST /api/waitlist]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

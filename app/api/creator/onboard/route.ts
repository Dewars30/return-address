import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireAuth(); // must return the DB-backed user with id

  try {
    const body = await req.json();
    const displayName = (body.displayName || "").trim();
    const handle = (body.handle || "").trim().toLowerCase();
    const shortBio = (body.shortBio || "").trim() || null;

    if (!displayName || !handle) {
      return NextResponse.json(
        { error: "Display name and handle are required" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(handle)) {
      return NextResponse.json(
        { error: "Handle must use only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Ensure handle is unique for other users
    const existing = await prisma.user.findFirst({
      where: {
        handle,
        NOT: { id: user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Handle is already taken" },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName,
        handle,
        shortBio,
        isCreator: true,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Creator onboarding failed:", error);
    return NextResponse.json(
      { error: "Failed to complete creator onboarding" },
      { status: 500 }
    );
  }
}


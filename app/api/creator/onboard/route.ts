import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthApi } from "@/lib/auth";

// This route uses requireAuthApi() which uses auth, so it must be dynamic
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Use API-safe version that throws errors instead of redirecting
  let user;
  try {
    user = await requireAuthApi();
  } catch (authError) {
    if (authError instanceof Error) {
      if (authError.message === "UNAUTHORIZED" || authError.message === "AUTH_FAILED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    throw authError;
  }

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


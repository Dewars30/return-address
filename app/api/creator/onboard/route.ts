import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { displayName, handle, shortBio } = body;

    // Validate required fields
    if (!displayName || !handle) {
      return NextResponse.json(
        { error: "Display name and handle are required" },
        { status: 400 }
      );
    }

    // Validate handle format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(handle)) {
      return NextResponse.json(
        { error: "Handle must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check if handle is already taken
    const existingUser = await prisma.user.findUnique({
      where: { handle },
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: "Handle is already taken" },
        { status: 400 }
      );
    }

    // Update user with creator info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName,
        handle,
        shortBio: shortBio || null,
        isCreator: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


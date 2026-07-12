import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Emission factor id is required" },
        { status: 400 }
      );
    }

    await prisma.emissionFactor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete emission factor error:", error);
    return NextResponse.json(
      { error: "Failed to delete emission factor" },
      { status: 500 }
    );
  }
}
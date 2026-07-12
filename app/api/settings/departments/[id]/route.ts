import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: { status: "inactive" },
    });

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error("DELETE department error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate department" },
      { status: 500 }
    );
  }
}
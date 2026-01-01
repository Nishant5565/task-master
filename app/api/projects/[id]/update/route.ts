import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { auth } from "@/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json(); // { fields: [...], name: ... }
    await connectToDatabase();

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, ownerId: session.user.id }, // Security: Only owner can update fields for now
      { $set: body },
      { new: true }
    );

    if (!updatedProject)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating project" },
      { status: 500 }
    );
  }
}

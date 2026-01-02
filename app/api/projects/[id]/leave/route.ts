import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { auth } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (project.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "Owner cannot leave. Delete project instead." },
        { status: 400 }
      );
    }

    // Remove from members
    project.members = project.members.filter(
      (m: any) => m.userId !== session.user.id
    );
    await project.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

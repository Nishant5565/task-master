import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import TaskGroup from "@/models/TaskGroup";
import Task from "@/models/Task";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    // 1. Fetch Project to verify access & get schema
    const project = await Project.findOne({
      _id: id,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    });

    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 2. Fetch Groups (sorted by order)
    const groups = await TaskGroup.find({ projectId: id }).sort({ order: 1 });

    // 3. Fetch Tasks (sorted by order)
    const tasks = await Task.find({ projectId: id }).sort({ order: 1 });

    return NextResponse.json({ project, groups, tasks });
  } catch (error) {
    console.error("Board fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching board data" },
      { status: 500 }
    );
  }
}

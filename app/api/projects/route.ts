import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { auth } from "@/auth";

// GET: List all projects for the user (Owner or Member)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const projects = await Project.find({
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate("ownerId", "name image")
      .populate("members.userId", "name image");

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST: Create a new project
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description } = await request.json();
    await connectToDatabase();

    // Default Fields for every new project
    const defaultFields = [
      {
        key: "title",
        label: "Task Name",
        type: "text",
        required: true,
        width: 300,
      },
      {
        key: "status",
        label: "Status",
        type: "status",
        options: ["Todo", "In Progress", "Done"],
        width: 140,
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: ["Low", "Medium", "High"],
        width: 120,
      },
    ];

    const project = await Project.create({
      name: name || "Untitled Project",
      description,
      ownerId: session.user.id,
      members: [{ userId: session.user.id, role: "owner" }],
      fields: defaultFields,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

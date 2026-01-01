import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TaskGroup from "@/models/TaskGroup";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await params;
    await connectToDatabase();

    const group = await TaskGroup.findById(groupId);
    if (!group)
      return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Verify Access (via Project)
    const project = await Project.findOne({
      _id: group.projectId,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    });

    if (!project)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Fetch tasks for this group
    const tasks = await Task.find({ groupId }).sort({ order: 1 });

    return NextResponse.json({ group, tasks, project });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching group" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await params;
    const body = await request.json(); // { name, fields, ... }

    await connectToDatabase();

    const group = await TaskGroup.findById(groupId);
    if (!group)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify Access (via Project) - Simplified mainly for ownership/membership
    const project = await Project.findOne({
      _id: group.projectId,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    });

    if (!project)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Update fields
    if (body.name) group.name = body.name;
    if (body.fields) group.fields = body.fields;

    await group.save();

    return NextResponse.json(group);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    await connectToDatabase();

    const group = await TaskGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify Access (via Project)
    const project = await Project.findOne({
      _id: group.projectId,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all tasks associated with this group
    await Task.deleteMany({ groupId });

    // Delete the group itself
    await TaskGroup.findByIdAndDelete(groupId);

    return NextResponse.json({
      message: "Group and associated tasks deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}

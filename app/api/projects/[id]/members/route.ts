import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";

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

    const project = await Project.findOne({
      _id: id,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id },
      ],
    });

    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Populate members manually
    const memberIds = project.members
      .map((m: any) => m.userId)
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    const users = await User.find({ _id: { $in: memberIds } }).select(
      "name email _id image"
    );

    const members = project.members.map((m: any) => {
      const user = users.find((u: any) => u._id.toString() === m.userId);
      return {
        userId: m.userId,
        role: m.role,
        name: user?.name,
        email: user?.email,
        image: user?.image,
      };
    });

    // Also include Owner
    const owner = await User.findById(project.ownerId).select(
      "name email _id image"
    );

    // Filter out owner from members list if present to avoid duplication
    const filteredMembers = members.filter(
      (m: any) => m.userId !== project.ownerId
    );

    const fullList = [
      {
        userId: project.ownerId,
        role: "owner",
        name: owner?.name,
        email: owner?.email,
        image: owner?.image,
      },
      ...filteredMembers,
    ];

    return NextResponse.json(fullList);
  } catch (error) {
    console.error("Fetch members error", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { userId } = await request.json(); // Member to remove

    await connectToDatabase();

    const project = await Project.findOne({
      _id: id,
      ownerId: session.user.id,
    }); // Only owner can remove? Or admin?
    // Let's allow owner and admin.
    // Re-fetch project to check requester role if not owner.

    // Simplification: Only Owner can remove members for now.
    if (!project)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    project.members = project.members.filter((m: any) => m.userId !== userId);
    await project.save();

    return NextResponse.json(project.members);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { userId, role } = await request.json();

    await connectToDatabase();

    const project = await Project.findOne({
      _id: id,
      ownerId: session.user.id,
    });
    if (!project)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const memberIndex = project.members.findIndex(
      (m: any) => m.userId === userId
    );
    if (memberIndex > -1) {
      project.members[memberIndex].role = role;
      await project.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

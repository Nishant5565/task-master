import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
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
    const { email } = await request.json();

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectToDatabase();

    // 1. Check if user exists
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return NextResponse.json(
        { error: "User not found. They must register first." },
        { status: 404 }
      );
    }

    // 2. Check Permissions (Only owner can invite for now)
    const project = await Project.findOne({
      _id: id,
      ownerId: session.user.id,
    });
    if (!project)
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );

    // 3. Add Member if not exists
    const isAlreadyMember = project.members.some(
      (m: any) => m.userId === userToInvite._id.toString()
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      );
    }

    project.members.push({
      userId: userToInvite._id.toString(),
      role: "editor",
    });
    await project.save();

    return NextResponse.json({ message: "User invited", member: userToInvite });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}

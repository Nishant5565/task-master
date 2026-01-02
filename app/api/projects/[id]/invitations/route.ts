import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Invitation from "@/models/Invitation";
import { auth } from "@/auth";
import { generateId } from "@/lib/schema"; // Or use crypto

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

    // Check access (owner or admin?)
    const project = await Project.findOne({
      _id: id,
      $or: [
        { ownerId: session.user.id },
        { "members.userId": session.user.id }, // Any member can see invites? Maybe restric to admin/editor?
      ],
    });

    if (!project)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const invitations = await Invitation.find({
      projectId: id,
      status: "pending",
    });
    return NextResponse.json(invitations);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { email, role, groupId } = await request.json();

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectToDatabase();

    // Verify permission (Owner or Admin)
    const project = await Project.findOne({
      _id: id,
      $or: [
        // Verify owner or admin permissions
        { ownerId: session.user.id },
        {
          members: {
            $elemMatch: {
              userId: session.user.id,
              role: { $in: ["admin", "owner"] },
            },
          },
        },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already member
    // Need to fetch user by email first to check ID
    const existingMemberUser = null; // Logic pending: complicated to check member by email without population.
    // But we can check if Invitation exists
    const query: any = { projectId: id, email, status: "pending" };
    if (groupId) query.groupId = groupId;

    const existingInvite = await Invitation.findOne(query);
    if (existingInvite) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    // Create Invitation
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await Invitation.create({
      email,
      projectId: id,
      groupId: groupId || undefined, // Optional
      inviterId: session.user.id,
      role: role || "viewer",
      token,
      status: "pending",
      expiresAt,
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invite failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Revoke invitation
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { invitationId } = await request.json(); // or pass in query

    await connectToDatabase();
    // Check permissions...
    const project = await Project.findOne({
      _id: id,
      ownerId: session.user.id,
    });
    if (!project)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await Invitation.deleteOne({ _id: invitationId });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

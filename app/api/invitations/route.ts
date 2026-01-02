import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Invitation from "@/models/Invitation";
import Project from "@/models/Project";
import TaskGroup from "@/models/TaskGroup";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Find pending invitations for this email
    const invitations = await Invitation.find({
      email: session.user.email,
      status: "pending",
    })
      .populate("projectId", "name") // Get project name
      .populate("inviterId", "name email")
      .sort({ createdAt: -1 });

    // If we want group names, we might need manual population or deeper populate if schema allows
    // Invitation has groupId ref TaskGroup.
    // Let's populate it manually or using populate if ref is correct.
    const invitationsWithGroup = await Invitation.populate(invitations, {
      path: "groupId",
      select: "name",
    });

    return NextResponse.json(invitationsWithGroup);
  } catch (error) {
    console.error("Fetch invitations error", error);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Invitation from "@/models/Invitation";
import Project from "@/models/Project";
import TaskGroup from "@/models/TaskGroup";
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

    const invitation = await Invitation.findById(id);
    if (!invitation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation expired or already processed" },
        { status: 400 }
      );
    }

    // Add to Project or Group
    if (invitation.groupId) {
      // Add to Group
      const group = await TaskGroup.findById(invitation.groupId);
      if (group) {
        // Check if already member
        if (!group.members.some((m: any) => m.userId === session.user.id)) {
          group.members.push({
            userId: session.user.id,
            role: invitation.role,
          });
          await group.save();
        }
      }
      // Important: Also add to Project as a 'viewer' (minimal access) if not already?
      // Actually, if you are in a Group, you need to see the Project to access the dashboard.
      // So we should maybe add to Project with a specific "limited" role?
      // Or rely on the Project-level check `members.userId` matches.
      // Let's ensure the user is in the Project member list too, maybe as 'viewer' or a special 'restricted' role?
      // Existing logic in /api/projects/[id] checks: { "members.userId": session.user.id }
      // So if we only add to TaskGroup, the user CANNOT access the project via `GET /projects/[id]`.
      // We MUST add them to Project.members too.

      const project = await Project.findById(invitation.projectId);
      if (project) {
        // Check if already in project
        const isProjectMember = project.members.some(
          (m: any) => m.userId === session.user.id
        );
        if (!isProjectMember) {
          // Add as viewer to project (so they can load the shell), but granular permissions will handle the rest?
          // Wait, if they are 'editor' in Group, but 'viewer' in Project.
          // We need to support Mixed roles.
          // For now, let's just ADD them to the project as 'viewer' so they can enter.
          project.members.push({ userId: session.user.id, role: "viewer" }); // Base access
          await project.save();
        }
      }
    } else {
      // Add to Project (Global)
      const project = await Project.findById(invitation.projectId);
      if (project) {
        if (!project.members.some((m: any) => m.userId === session.user.id)) {
          project.members.push({
            userId: session.user.id,
            role: invitation.role,
          });
          await project.save();
        }
      }
    }

    invitation.status = "accepted";
    await invitation.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

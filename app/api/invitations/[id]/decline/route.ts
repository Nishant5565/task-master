import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Invitation from "@/models/Invitation";
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

    // Just delete or mark rejected?
    // Deleting is cleaner for now.
    await Invitation.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

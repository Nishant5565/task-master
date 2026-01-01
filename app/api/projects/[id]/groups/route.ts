import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
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
    const { name } = await request.json();

    await connectToDatabase();

    // Find max order
    const lastGroup = await TaskGroup.findOne({ projectId: id }).sort({
      order: -1,
    });
    const order = lastGroup ? lastGroup.order + 1 : 0;

    const newGroup = await TaskGroup.create({
      name,
      projectId: id,
      order,
    });

    return NextResponse.json(newGroup);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

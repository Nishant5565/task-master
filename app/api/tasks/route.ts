import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TaskModel from "@/models/Task";

import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const tasks = await TaskModel.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const newTask = await TaskModel.create({
      ...body,
      userId: session.user.id,
    });
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // This is for bulk updates or requires an ID in the URL.
  // For single item update, we usually use /api/tasks/[id]
  // But for simplicity let's handle "upsert" here if body has _id, or just return 405
  return NextResponse.json(
    { error: "Use /api/tasks/[id] for updates" },
    { status: 405 }
  );
}

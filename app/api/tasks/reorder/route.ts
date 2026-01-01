import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Task from "@/models/Task";
import { auth } from "@/auth";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items } = await request.json(); // Array of { _id, order, groupId }

    await connectToDatabase();

    // Bulk write for performance
    const operations = items.map((item: any) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: item.order, groupId: item.groupId },
      },
    }));

    if (operations.length > 0) {
      await Task.bulkWrite(operations);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder failed", error);
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}

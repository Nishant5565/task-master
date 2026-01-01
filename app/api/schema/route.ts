import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import SchemaModel from "@/models/Schema";

import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch schema for the logged-in user
    let schema = await SchemaModel.findOne({ userId: session.user.id });

    // If somehow no schema exists (shouldn't happen with register flow), return 404
    // or you could auto-seed here if you prefer resilience.
    if (!schema) {
      return NextResponse.json(
        { error: "No schema found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json(schema);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schema" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    // Update the user's schema
    // Ensure we don't accidentally unset the userId
    const updateData = { ...body, userId: session.user.id };

    const updatedSchema = await SchemaModel.findOneAndUpdate(
      { userId: session.user.id },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedSchema);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update schema" },
      { status: 500 }
    );
  }
}

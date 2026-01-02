import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await request.json();

    await connectToDatabase();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    const user = await User.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
    }).select("-password");

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

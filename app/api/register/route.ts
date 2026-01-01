import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import SchemaModel from "@/models/Schema";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || "User",
    });

    // Seed a default schema for this new user
    await SchemaModel.create({
      name: "My Projects",
      userId: newUser._id.toString(),
      fields: [
        {
          key: "title",
          label: "Task Name",
          type: "text",
          required: true,
          width: 300,
        },
        {
          key: "status",
          label: "Status",
          type: "status",
          options: ["Todo", "In Progress", "Done"],
          width: 150,
        },
        {
          key: "priority",
          label: "Priority",
          type: "select",
          options: ["Low", "Medium", "High"],
          width: 120,
        },
        { key: "dueDate", label: "Due Date", type: "date", width: 150 },
        { key: "completed", label: "Done", type: "checkbox", width: 80 },
      ],
    });

    return NextResponse.json({ success: true, userId: newUser._id });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

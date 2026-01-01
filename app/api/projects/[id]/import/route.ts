import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import TaskGroupModel from "@/models/TaskGroup";
import TaskModel from "@/models/Task";
import { auth } from "@/auth";
import { generateId, generateShortId } from "@/lib/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    await connectToDatabase();

    // Support both single object and array of objects
    const groupsToImport = Array.isArray(body) ? body : [body];

    const results = [];
    const errors = [];

    for (const groupData of groupsToImport) {
      try {
        const { group_name, group_fields, group_values } = groupData;

        if (!group_name || !Array.isArray(group_fields)) {
          errors.push({
            group_name: group_name || "Unknown",
            error: "Invalid format: group_name and group_fields are required",
          });
          continue;
        }

        // Transform fields to internal format
        const fields = group_fields.map((gf: any) => {
          const fieldType = gf.field_type || "text";
          let width = 150;

          // Set default widths based on type
          if (fieldType === "id") width = 100;
          else if (fieldType === "description") width = 300;
          else if (fieldType === "url") width = 200;

          const field: any = {
            id: generateId(),
            key: gf.field_name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
            label: gf.field_name,
            type: fieldType,
            width,
          };

          // Use provided options or create defaults
          if (fieldType === "select" || fieldType === "status") {
            field.options = gf.options || [
              {
                id: generateId(),
                label: "Option 1",
                color: "bg-gray-100 text-gray-700",
              },
              {
                id: generateId(),
                label: "Option 2",
                color: "bg-blue-100 text-blue-700",
              },
            ];
          }

          return field;
        });

        // Create the group
        const newGroup = await TaskGroupModel.create({
          name: group_name,
          projectId,
          fields,
          userId: session.user.id,
        });

        // Create tasks if provided
        const createdTasks = [];
        if (Array.isArray(group_values) && group_values.length > 0) {
          console.log(
            `\n========== CREATING TASKS FOR: ${group_name} ==========`
          );
          console.log(`Tasks to create: ${group_values.length}`);
          console.log(
            `Fields:`,
            fields.map((f: any) => `${f.label}(${f.type})`).join(", ")
          );

          for (let i = 0; i < group_values.length; i++) {
            const taskData = group_values[i];
            console.log(`\n--- Task ${i + 1} ---`);
            console.log("Raw data:", taskData);

            const taskDoc: any = {
              projectId,
              groupId: newGroup._id,
              userId: session.user.id,
            };

            // Map field names to keys and add auto-generated IDs
            fields.forEach((field: any) => {
              if (field.type === "id") {
                taskDoc[field.key] = generateShortId();
                console.log(`  [ID] ${field.label}: ${taskDoc[field.key]}`);
              } else {
                // Find matching field name in taskData
                const matchingKey = Object.keys(taskData).find(
                  (k) =>
                    k.toLowerCase().replace(/[^a-z0-9]/g, "_") === field.key
                );

                if (matchingKey) {
                  let value = taskData[matchingKey];
                  console.log(`  [${field.type}] ${field.label}: "${value}"`);

                  // Skip empty strings
                  if (value === "" || value === null || value === undefined) {
                    console.log(`    → Skipped (empty)`);
                    return;
                  }

                  // For select/status fields, convert label to option ID
                  if (
                    (field.type === "select" || field.type === "status") &&
                    field.options
                  ) {
                    const matchingOption = field.options.find(
                      (opt: any) => opt.label === value || opt.id === value
                    );
                    if (matchingOption) {
                      console.log(`    → Mapped to ID: ${matchingOption.id}`);
                      value = matchingOption.id;
                    } else {
                      console.log(`    ⚠️ No option found for "${value}"`);
                    }
                  }

                  taskDoc[field.key] = value;
                }
              }
            });

            console.log("Task doc:", taskDoc);

            try {
              const task = await TaskModel.create(taskDoc);
              createdTasks.push(task);
              console.log(`✅ Created: ${task._id}`);
            } catch (taskErr: any) {
              console.error(`❌ FAILED:`, taskErr.message);
              throw taskErr;
            }
          }
          console.log(
            `\n========== DONE: ${createdTasks.length} tasks created ==========\n`
          );
        }

        results.push({
          group: newGroup,
          tasksCreated: createdTasks.length,
          success: true,
        });
      } catch (err: any) {
        console.error("Group import error:", err);
        errors.push({
          group_name: groupData.group_name || "Unknown",
          error: err.message,
        });
      }
    }

    const response: any = {
      totalGroups: groupsToImport.length,
      successful: results.length,
      failed: errors.length,
      results,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return NextResponse.json(response, {
      status: results.length > 0 ? 201 : 400,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import data" },
      { status: 500 }
    );
  }
}

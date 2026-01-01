import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { TaskItem, FieldDefinition } from "@/lib/schema";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CellRenderer from "./CellRenderer";
import { cn } from "@/lib/utils";

interface TaskGroupSectionProps {
  group: any;
  tasks: TaskItem[];
  fields: FieldDefinition[];
  onAddTask: (groupId: string) => void;
  onUpdateTask: (taskId: string, key: string, value: any) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskGroupSection({
  group,
  tasks,
  fields,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: TaskGroupSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2 group/header">
        <div className="bg-muted/50 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-2">
          <span
            className={cn("inline-block w-2 h-2 rounded-full", "bg-blue-500")}
          ></span>
          {group.name}
          <span className="text-muted-foreground ml-2 text-xs font-normal">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover/header:opacity-100 transition-opacity"
          onClick={() => onAddTask(group._id)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Droppable droppableId={group._id} type="TASK">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "min-h-[50px]",
                snapshot.isDraggingOver && "bg-muted/50"
              )}
            >
              <Table>
                {/* Only show header for the first group? Or maybe simplified header? 
                   Actually, linear style usually hides headers inside groups or repeats them. 
                   Let's stick to standard table row structure without explicit headers per group for cleanliness 
                   IF we align columns globally. But since these are separate tables, we need headers unless we use a CSS Grid.
                   For MVP, let's keep headers but make them small.
               */}
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b-0">
                    {fields.map((field) => (
                      <TableHead
                        key={field.key}
                        style={{ width: field.width || 150 }}
                        className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                      >
                        {field.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id!}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "group h-10 hover:bg-muted/30 transition-colors",
                            snapshot.isDragging &&
                              "bg-background shadow-lg border opacity-80"
                          )}
                          style={provided.draggableProps.style}
                        >
                          {fields.map((field) => (
                            <TableCell
                              key={field.key}
                              className="p-0 border-r last:border-r-0 border-transparent group-hover:border-border/50 relative px-2 py-1 text-sm truncate"
                            >
                              <CellRenderer
                                field={field}
                                value={task[field.key]}
                                onChange={(val) =>
                                  onUpdateTask(task._id!, field.key, val)
                                }
                              />
                            </TableCell>
                          ))}
                          <TableCell className="p-0 text-center">
                            {/* Actions */}
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
              {tasks.length === 0 && (
                <div
                  className="flex justify-center py-2 cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground"
                  onClick={() => onAddTask(group._id)}
                >
                  <Plus className="w-3 h-3 mr-1" /> New Task
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

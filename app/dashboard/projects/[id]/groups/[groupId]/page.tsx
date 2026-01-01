import React from "react";
import GroupTaskTable from "@/components/DynamicTable/GroupTaskTable";

interface PageProps {
  params: Promise<{
    id: string; // Project ID
    groupId: string; // Group ID
  }>;
}

export default function GroupPage({ params }: PageProps) {
  const { id, groupId } = React.use(params);

  return (
    <div className="h-full flex flex-col">
      <GroupTaskTable projectId={id} groupId={groupId} />
    </div>
  );
}

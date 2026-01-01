"use client";

import React, { useState, useEffect } from "react";
import ProjectDashboard from "@/components/DynamicTable/ProjectDashboard";
import GroupTaskTable from "@/components/DynamicTable/GroupTaskTable";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Hash-based routing sync
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      if (hash.startsWith("group/")) {
        const groupId = hash.split("/")[1];
        setActiveGroupId(groupId);
      } else {
        setActiveGroupId(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initialize on mount
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (groupId: string | null) => {
    if (groupId) {
      window.location.hash = `group/${groupId}`;
    } else {
      window.location.hash = "";
    }
  };

  // Show Group view if activeGroupId is set
  if (activeGroupId) {
    return (
      <div className="h-full flex flex-col">
        <GroupTaskTable
          projectId={id}
          groupId={activeGroupId}
          onBack={() => handleNavigate(null)}
        />
      </div>
    );
  }

  // Show Dashboard view by default
  return (
    <div className="h-full flex flex-col">
      <ProjectDashboard
        projectId={id}
        onOpenGroup={(groupId) => handleNavigate(groupId)}
      />
    </div>
  );
}

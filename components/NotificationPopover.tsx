"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import apiClient from "@/lib/axios";

export default function NotificationPopover() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/invitations");
      setInvitations(res.data);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInvitations();

    // Polling every 30s? Or just rely on open
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchInvitations();
  }, [open]);

  const router = useRouter();

  const handleAction = async (invite: any, action: "accept" | "decline") => {
    try {
      await apiClient.post(`/invitations/${invite._id}/${action}`);

      // Optimistic update
      setInvitations((prev) => prev.filter((i) => i._id !== invite._id));

      // Refresh list to be sure
      fetchInvitations();

      if (action === "accept") {
        // Refresh sidebar
        window.dispatchEvent(new Event("project-update"));

        const projectId =
          typeof invite.projectId === "object"
            ? invite.projectId._id
            : invite.projectId;
        const groupId =
          invite.groupId &&
          (typeof invite.groupId === "object"
            ? invite.groupId._id
            : invite.groupId);

        if (groupId) {
          router.push(`/dashboard/projects/${projectId}/groups/${groupId}`);
        } else {
          router.push(`/dashboard/projects/${projectId}`);
        }

        setOpen(false);
      }
    } catch (error) {
      console.error(`Failed to ${action} invitation`, error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {invitations.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading && invitations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Loading...
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No new notifications
            </div>
          ) : (
            invitations.map((invite) => (
              <div
                key={invite._id}
                className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {invite.inviterId?.name ||
                      invite.inviterId?.email ||
                      "Someone"}
                  </span>
                  <span className="text-gray-600"> invited you to </span>
                  <span className="font-medium text-indigo-600">
                    {invite.projectId?.name || "Unknown Project"}
                    {invite.groupId &&
                      ` / ${(invite.groupId as any).name || "Unknown Group"}`}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Role: {invite.role}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleAction(invite, "accept")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs flex-1"
                    onClick={() => handleAction(invite, "decline")}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, X, Check, Copy, UserPlus } from "lucide-react";
import apiClient from "@/lib/axios";

interface InviteMemberDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

type Member = {
  userId: string; // or id for invitation
  name?: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  type: "member" | "invitation";
  id?: string; // for invitation revocation
};

export default function InviteMemberDialog({
  projectId,
  trigger,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("editor");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [scope, setScope] = useState<string>("project"); // "project" or groupId

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, invitesRes, groupsRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}/members`),
        apiClient.get(`/projects/${projectId}/invitations`),
        apiClient.get(`/projects/${projectId}/groups`),
      ]);

      const mappedMembers = membersRes.data.map((m: any) => ({
        ...m,
        type: "member",
      }));
      const mappedInvites = invitesRes.data.map((i: any) => ({
        userId: i._id,
        email: i.email,
        role: i.role,
        type: "invitation",
        id: i._id,
        groupId: i.groupId, // Needed to show scope
      }));

      setMembers([...mappedMembers, ...mappedInvites]);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error("Failed to fetch access data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, projectId]);

  const handleInvite = async () => {
    if (!email) return;
    try {
      setInviteLoading(true);
      await apiClient.post(`/projects/${projectId}/invitations`, {
        email,
        role,
        groupId: scope === "project" ? undefined : scope,
      });
      setEmail("");
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to invite", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (member: Member) => {
    try {
      if (member.type === "invitation") {
        await apiClient.delete(`/projects/${projectId}/invitations`, {
          data: { invitationId: member.id },
        });
      } else {
        await apiClient.delete(`/projects/${projectId}/members`, {
          data: { userId: member.userId },
        });
      }
      fetchData();
    } catch (error) {
      console.error("Failed to remove", error);
    }
  };

  const handleRoleChange = async (member: Member, newRole: string) => {
    if (member.type === "invitation") return; // Can't update invite role yet (simple version)
    try {
      // Optimistic update
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === member.userId ? { ...m, role: newRole as any } : m
        )
      );
      await apiClient.patch(`/projects/${projectId}/members`, {
        userId: member.userId,
        role: newRole,
      });
    } catch (error) {
      console.error("Failed to update role", error);
      fetchData(); // Revert
    }
  };

  // Helper for initials
  const getInitials = (name?: string, email?: string) => {
    const src = name || email || "?";
    return src.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="gap-2 flex rounded-md text-xs px-3 py-1.5 bg-blue-500 text-white">
            <UserPlus className="" size={14} />
            Invite
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Email, comma separated"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />

            {/* Scope Selection */}
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Entire Project</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    Group: {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Can view</SelectItem>
                <SelectItem value="editor">Can edit</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={inviteLoading || !email}>
              {inviteLoading ? "Sending..." : "Invite"}
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">
              People with access
            </h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-gray-400" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-4">
                  No members yet.
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={
                      member.type === "invitation" ? member.id : member.userId
                    }
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-8 w-8">
                        <AvatarImage />
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                          {getInitials(member.name, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium truncate">
                          {member.name || member.email}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {member.email}{" "}
                          {member.type === "invitation" && "(Pending)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {member.role === "owner" ? (
                        <span className="text-xs text-gray-400 px-3">
                          Owner
                        </span>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleRoleChange(member, val)}
                          disabled={member.type === "invitation"} // Disable for invites for now
                        >
                          <SelectTrigger className="h-8 border-none shadow-none text-gray-500 hover:text-gray-900 w-auto gap-1 pr-1 focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="viewer">Can view</SelectItem>
                            <SelectItem value="editor">Can edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <div className="h-px bg-gray-100 my-1" />
                            <SelectItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              value="remove"
                              onPointerUp={() => handleRemove(member)}
                            >
                              Remove
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 px-4 flex items-center justify-between border-t border-gray-100">
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <Copy size={12} />
            Copy link
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

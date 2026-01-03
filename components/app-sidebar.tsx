"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, User2, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { AnimatePresence, motion } from "framer-motion";
import { Architects_Daughter } from "next/font/google";
const architects_daughter = Architects_Daughter({
  subsets: ["latin"],
  weight: ["400"],
});
export function AppSidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<any[]>([]);
  const { data: session } = useSession();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const fetchProjects = () => {
    apiClient
      .get("/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProjects();
    const handleProjectUpdate = () => fetchProjects();
    window.addEventListener("project-update", handleProjectUpdate);
    return () => {
      window.removeEventListener("project-update", handleProjectUpdate);
    };
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-card/50 backdrop-blur-xl"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:!p-0 transition-all duration-300"
            >
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="flex aspect-square size-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 text-white overflow-hidden"
                >
                  <img
                    src="https://cdn.brandure.online/dojoit.webp"
                    alt="dojoit"
                  />
                </motion.div>
                <div className="flex flex-col gap-0.5 leading-none transition-opacity group-data-[collapsible=icon]:opacity-0">
                  <span
                    className={`font-bold text-lg  ${architects_daughter.className}`}
                  >
                    dojoit
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Pro Workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 px-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {[
                {
                  href: "/dashboard",
                  icon: LayoutDashboard,
                  label: "Dashboard",
                },
                {
                  href: "/dashboard/settings",
                  icon: Settings,
                  label: "Settings",
                },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className="relative group overflow-hidden"
                    >
                      <Link
                        href={item.href}
                        className={
                          isActive
                            ? "text-indigo-600 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeSidebarItem"
                            className="absolute inset-0 bg-indigo-50/80 rounded-lg border-l-2 border-indigo-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <item.icon
                          className={`relative z-10 transition-colors ${
                            isActive
                              ? "text-indigo-600"
                              : "group-hover:text-indigo-600"
                          }`}
                        />
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 px-2">
            <span>Projects</span>
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/dashboard" title="New Project">
                <Plus className="w-4 h-4 cursor-pointer hover:text-indigo-600 transition-colors" />
              </Link>
            </motion.div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <SidebarMenu className="space-y-0.5">
                {projects.map((project, i) => {
                  const isActive =
                    pathname === `/dashboard/projects/${project._id}`;
                  return (
                    <motion.div key={project._id} variants={fadeIn}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className="relative group data-[active=true]:bg-transparent"
                        >
                          <Link
                            href={`/dashboard/projects/${project._id}`}
                            className={
                              isActive
                                ? "text-indigo-600 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeSidebarItem"
                                className="absolute inset-0 bg-indigo-50/80 rounded-lg border-l-2 border-indigo-600"
                                initial={false}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                              />
                            )}
                            <span className="relative z-10 truncate pl-1">
                              {project.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="hover:bg-accent/50 transition-colors rounded-lg mb-1"
              >
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3"
                >
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Avatar className="h-9 w-9 rounded-lg ring-2 ring-background shadow-sm">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                        {session?.user?.name?.slice(0, 2).toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-sm">
                      {session?.user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() =>
                  signOut({ callbackUrl: window.location.origin + "/login" })
                }
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50/50 justify-start px-3 h-9 rounded-lg transition-all group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden font-medium text-xs uppercase tracking-wide">
                  Log out
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

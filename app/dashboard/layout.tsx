"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  HeaderControlProvider,
  useHeaderControl,
} from "@/components/context/header-control-context";
import { PanelTopClose, PanelTopOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

import NotificationPopover from "@/components/NotificationPopover";

function HeaderToggle() {
  const { isPageHeaderVisible, togglePageHeader } = useHeaderControl();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={togglePageHeader}
    >
      {isPageHeaderVisible ? (
        <PanelTopClose size={16} />
      ) : (
        <PanelTopOpen size={16} />
      )}
      <span className="sr-only">Toggle Toolbar</span>
    </Button>
  );
}

function HeaderCenter() {
  const { headerCenter } = useHeaderControl();
  return (
    <div className="flex-1 flex justify-center items-center">
      {headerCenter}
    </div>
  );
}

function HeaderRight() {
  const { headerRight } = useHeaderControl();
  return <div className="flex items-center gap-2">{headerRight}</div>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderControlProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-sm">
            <div className="flex items-center gap-2 px-4 w-full relative">
              {/* Left Group */}
              <div className="flex items-center gap-2 z-10 shrink-0">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Center Group - Absolute positioned for true center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <HeaderCenter />
                </div>
              </div>

              {/* Right Group */}
              <div className="ml-auto flex items-center gap-2 z-10 shrink-0">
                <HeaderRight />
                <NotificationPopover />
                <HeaderToggle />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 pt-0 bg-background">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HeaderControlProvider>
  );
}

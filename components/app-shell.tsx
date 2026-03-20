"use client";

import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface AppShellProps {
  children: React.ReactNode;
  userRole: "student" | "host";
}

export function AppShell({ children, userRole }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar userRole={userRole} />
      <div className="pl-64">
        <AppHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

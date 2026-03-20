"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export default function SocietiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/societies/discover", label: "Discover" },
    { href: "/societies/liked", label: "Followed" },
  ];

  return (
    <AppShell userRole="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Societies</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Tab Content */}
        {children}
      </div>
    </AppShell>
  );
}

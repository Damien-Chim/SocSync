"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function AppHeader() {
  const [notifications, setNotifications] = useState<
    { id: string; message: string; read: boolean; created_at: string; society_name?: string }[]
  >([]);
  const [displayName, setDisplayName] = useState("there");
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const supabase = createClient();

    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const nameFromMetadata =
        (user?.user_metadata?.name as string | undefined) ||
        (user?.user_metadata?.full_name as string | undefined);

      const fallbackFromEmail = user?.email?.split("@")[0];
      setDisplayName(nameFromMetadata || fallbackFromEmail || "there");

      if (user) {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, message, read, created_at, societies(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(
            data.map((n: Record<string, unknown>) => ({
              id: n.id as string,
              message: (n.message as string) ?? "",
              read: (n.read as boolean) ?? false,
              created_at: n.created_at as string,
              society_name: (n.societies as Record<string, unknown> | null)?.name as string | undefined,
            }))
          );
        }
      }
    };

    void loadData();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Hi, {displayName} !</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-semibold text-sm">Notifications</p>
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 px-3 py-3 cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">
                      {notification.society_name ?? "Society"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(notification.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4 truncate w-full">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout */}
        <Link href="/login">
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}

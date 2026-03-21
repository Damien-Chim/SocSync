"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Bookmark,
  PlusCircle,
  Pencil,
  Trash2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DbEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  banner_image_url: string | null;
  save_count: number;
}

export default function HostDashboardPage() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [societyName, setSocietyName] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("society_id")
        .eq("id", user.id)
        .single();

      if (!profile?.society_id) { setLoading(false); return; }

      const societyId = profile.society_id;

      const [socResult, eventsResult, followsResult] = await Promise.all([
        supabase
          .from("societies")
          .select("name")
          .eq("id", societyId)
          .single(),
        supabase
          .from("events_with_details")
          .select("id, title, date, time, category, banner_image_url, save_count")
          .eq("society_id", societyId)
          .order("date", { ascending: false }),
        supabase
          .from("society_follows")
          .select("id", { count: "exact", head: true })
          .eq("society_id", societyId),
      ]);

      if (socResult.data) setSocietyName(socResult.data.name);
      if (eventsResult.data) setEvents(eventsResult.data);
      setFollowerCount(followsResult.count ?? 0);
      setLoading(false);
    }

    load();
  }, [supabase]);

  const totalSaves = events.reduce((sum, e) => sum + (e.save_count ?? 0), 0);

  const handleDelete = async (eventId: string) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.error("[HostDashboard] Delete failed:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <AppShell userRole="host">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="host">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {societyName || "Host Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your society&apos;s events
            </p>
          </div>
          <Link href="/host/create-event">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Events"
            value={events.length}
            icon={Calendar}
          />
          <StatCard
            title="Total Saves"
            value={totalSaves}
            icon={Bookmark}
          />
          <StatCard
            title="Followers"
            value={followerCount}
            icon={Users}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No events yet. Create your first one!
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  {event.banner_image_url ? (
                    <Image
                      src={event.banner_image_url}
                      alt={event.title}
                      width={80}
                      height={50}
                      className="rounded-lg object-cover h-[50px] w-[80px]"
                    />
                  ) : (
                    <div className="flex h-[50px] w-[80px] items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {event.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatDate(event.date)} at {event.time?.slice(0, 5)}</span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3.5 w-3.5" />
                        {event.save_count ?? 0} saves
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/host/edit-event/${event.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof Calendar;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {value.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

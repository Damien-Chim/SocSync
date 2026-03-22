"use client";

import { type LucideIcon, useState, useEffect, useMemo } from "react";
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
  const upcomingEvents = events.filter((event) => new Date(`${event.date}T${event.time || "00:00"}`).getTime() >= Date.now());
  const topEvent = [...events].sort((a, b) => (b.save_count ?? 0) - (a.save_count ?? 0))[0];

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
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,255,0.94)_56%,rgba(255,245,235,0.94))] shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="space-y-4">
              <Badge className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                Host dashboard
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  {societyName || "Manage your society"} in one place.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Track your event momentum, see what students are saving, and keep upcoming events moving without jumping between pages.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/host/create-event">
                  <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                </Link>
                <Link href="/host/analytics">
                  <Button variant="outline" className="rounded-full font-semibold">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/60 bg-white/75 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Snapshot
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SnapshotStat label="Published events" value={events.length} />
                <SnapshotStat label="Upcoming now" value={upcomingEvents.length} />
                <SnapshotStat label="Followers" value={followerCount} />
                <SnapshotStat label="Total saves" value={totalSaves} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <StatCard
            title="Upcoming"
            value={upcomingEvents.length}
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
            <CardHeader className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Event board
              </p>
              <CardTitle className="text-2xl tracking-[-0.03em]">
                Your published events.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-border px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No events yet. Create your first one and start building traction.
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-[1.25rem] border border-border/60 p-4 transition-colors hover:border-primary/30"
                  >
                    {event.banner_image_url ? (
                      <Image
                        src={event.banner_image_url}
                        alt={event.title}
                        width={88}
                        height={56}
                        className="h-14 w-[88px] rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-[88px] items-center justify-center rounded-xl bg-muted">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(event.date)} at {event.time?.slice(0, 5)}</span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3.5 w-3.5" />
                          {event.save_count ?? 0} saves
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/host/edit-event/${event.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-destructive hover:text-destructive"
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

          <div className="space-y-6">
            <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
              <CardHeader className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Top performer
                </p>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Most saved event.
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topEvent ? (
                  <div className="rounded-[1.4rem] border border-border/60 bg-muted/30 p-5">
                    <h3 className="text-lg font-semibold text-foreground">{topEvent.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {topEvent.save_count ?? 0} saves so far
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(topEvent.date)} at {topEvent.time?.slice(0, 5)}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Publish some events to see what students are saving most.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
              <CardHeader className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Momentum
                </p>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Quick read.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InsightRow
                  label="Events live now"
                  value={events.length}
                />
                <InsightRow
                  label="Upcoming events"
                  value={upcomingEvents.length}
                />
                <InsightRow
                  label="Average saves per event"
                  value={events.length > 0 ? Math.round(totalSaves / events.length) : 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
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
  icon: LucideIcon;
}) {
  return (
    <Card className="border-border/60 shadow-[0_12px_30px_rgba(24,24,27,0.05)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {value.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.2rem] border border-border/60 bg-background/80 px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-border/60 bg-background/80 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

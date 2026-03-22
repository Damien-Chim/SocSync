"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BarChart3, Bookmark, CalendarRange, Loader2, Ticket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AnalyticsEvent {
  id: string;
  title: string;
  save_count: number;
  registration_count: number;
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
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

      const [eventsResult, followsResult] = await Promise.all([
        supabase
          .from("events_with_details")
          .select("id, title, save_count, registration_count")
          .eq("society_id", profile.society_id)
          .order("date", { ascending: false }),
        supabase
          .from("society_follows")
          .select("id", { count: "exact", head: true })
          .eq("society_id", profile.society_id),
      ]);

      if (eventsResult.data) {
        setEvents(eventsResult.data);
        if (eventsResult.data.length > 0) {
          setSelectedEvent(eventsResult.data[0].id);
        }
      }
      setFollowerCount(followsResult.count ?? 0);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const selectedEventData = events.find((e) => e.id === selectedEvent);
  const totalSaves = events.reduce((sum, e) => sum + (e.save_count ?? 0), 0);
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registration_count ?? 0), 0);
  const averageSaves = events.length > 0 ? Math.round(totalSaves / events.length) : 0;
  const averageRegistrations = events.length > 0 ? Math.round(totalRegistrations / events.length) : 0;
  const topSavedEvent = [...events].sort((a, b) => (b.save_count ?? 0) - (a.save_count ?? 0))[0];
  const rankedEvents = [...events].sort((a, b) => {
    const registrationDiff = (b.registration_count ?? 0) - (a.registration_count ?? 0);
    if (registrationDiff !== 0) return registrationDiff;
    return (b.save_count ?? 0) - (a.save_count ?? 0);
  });

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
                Host analytics
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  See what your events are actually pulling.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Track saves, registrations, followers, and which events are carrying the most momentum for your society.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/60 bg-white/75 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Snapshot
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <SnapshotStat label="Avg saves per event" value={averageSaves} />
                <SnapshotStat label="Avg registrations" value={averageRegistrations} />
                <SnapshotStat label="Total followers" value={followerCount} />
                <SnapshotStat label="Published events" value={events.length} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Events"
            value={events.length}
            icon={<CalendarRange className="h-5 w-5" />}
          />
          <SummaryCard
            label="Total Saves"
            value={totalSaves}
            icon={<Bookmark className="h-5 w-5" />}
          />
          <SummaryCard
            label="Total Registrations"
            value={totalRegistrations}
            icon={<Ticket className="h-5 w-5" />}
          />
          <SummaryCard
            label="Followers"
            value={followerCount}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
            <CardHeader className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Event analytics
              </p>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle className="text-2xl tracking-[-0.03em]">
                    Focus on one event.
                  </CardTitle>
                </div>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full rounded-full lg:w-[280px]">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedEventData ? (
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-5">
                    <p className="text-sm text-muted-foreground">Selected event</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                      {selectedEventData.title}
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <MetricTile
                      label="Saves"
                      value={selectedEventData.save_count ?? 0}
                      tone="primary"
                    />
                    <MetricTile
                      label="Registrations"
                      value={selectedEventData.registration_count ?? 0}
                      tone="success"
                    />
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  {events.length === 0 ? "No events created yet." : "Select an event to view analytics."}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
              <CardHeader className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Standout event
                </p>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Highest save momentum.
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topSavedEvent ? (
                  <div className="rounded-[1.4rem] border border-border/60 bg-muted/30 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {topSavedEvent.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {topSavedEvent.save_count ?? 0} saves and {topSavedEvent.registration_count ?? 0} registrations
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Create your first event to unlock analytics.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-[0_14px_35px_rgba(24,24,27,0.05)]">
              <CardHeader className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Leaderboard
                </p>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Best performing events.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rankedEvents.length > 0 ? (
                  rankedEvents.slice(0, 5).map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-background/80 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.registration_count ?? 0} registrations
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {event.save_count ?? 0} saves
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No event analytics yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-[0_12px_30px_rgba(24,24,27,0.05)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
            {icon}
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

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border p-5",
        tone === "primary"
          ? "border-primary/20 bg-primary/5"
          : "border-emerald-500/20 bg-emerald-500/10"
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-4xl font-semibold tracking-[-0.04em]",
          tone === "primary" ? "text-primary" : "text-emerald-600"
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

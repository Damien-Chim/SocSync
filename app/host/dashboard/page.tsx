"use client";

import { type LucideIcon, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  MapPin,
  UtensilsCrossed,
  Check,
} from "lucide-react";
import { DEFAULT_EVENT_YEAR, normalizeDbTime } from "@/lib/event-datetime";
import { createClient } from "@/lib/supabase/client";

interface ScrapedEvent {
  sourceUrl?: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  location?: string;
  freeEvent?: boolean | null;
  freeFood?: boolean | null;
  registrationLink?: string;
  bannerImage?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  tech: "Tech", finance: "Finance", social: "Social",
  industry: "Networking", networking: "Networking",
  career: "Career", workshop: "Workshop", competition: "Competition",
};

function parseHumanDate(raw: string): string {
  const cleaned = raw
    .replace(/\(.*?\)/g, "")
    .replace(/(st|nd|rd|th)\b/gi, "")
    .replace(
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i,
      ""
    )
    .trim();

  const hasExplicitYear = /\b(19|20)\d{2}\b/.test(cleaned);

  const attempts: string[] = hasExplicitYear
    ? [cleaned]
    : [
        `${cleaned}, ${DEFAULT_EVENT_YEAR}`,
        `${cleaned} ${DEFAULT_EVENT_YEAR}`,
        cleaned,
      ];

  for (const attempt of attempts) {
    const d = new Date(attempt);
    if (!isNaN(d.getTime())) {
      let year = d.getFullYear();
      if (year < 2000) year = DEFAULT_EVENT_YEAR;
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    }
  }

  return `${DEFAULT_EVENT_YEAR}-01-01`;
}

function parseHumanTime(raw: string): string {
  const first = raw.split(/[-–]/).map((s) => s.trim())[0];
  const match = first.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i
  );
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = (match[3] ?? "").toLowerCase();
    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  return normalizeDbTime(first);
}

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

  const [pendingEvent, setPendingEvent] = useState<ScrapedEvent | null>(null);
  const [pendingSocietyId, setPendingSocietyId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [confirmingEvent, setConfirmingEvent] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingScrapedEvents");
      if (raw) {
        sessionStorage.removeItem("pendingScrapedEvents");
        const { events: scrapedEvents, societyId } = JSON.parse(raw) as {
          events: ScrapedEvent[];
          societyId: string;
        };
        if (scrapedEvents.length > 0) {
          setPendingEvent(scrapedEvents[0]);
          setPendingSocietyId(societyId);
          setShowEventModal(true);
        }
      }
    } catch { /* ignore parse errors */ }
  }, []);

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

  const handleConfirmEvent = async () => {
    if (!pendingEvent || !pendingSocietyId) return;
    setConfirmingEvent(true);

    const category = CATEGORY_MAP[(pendingEvent.category ?? "").toLowerCase()] ?? "Social";
    const parsedDate = pendingEvent.date
      ? parseHumanDate(pendingEvent.date)
      : new Date().toISOString().slice(0, 10);

    const { data: inserted, error: insertErr } = await supabase.from("events").insert({
      title: pendingEvent.title,
      description: pendingEvent.description ?? "",
      society_id: pendingSocietyId,
      date: parsedDate,
      time: pendingEvent.time ? parseHumanTime(pendingEvent.time) : "00:00",
      location: pendingEvent.location ?? "TBA",
      price: pendingEvent.freeEvent === false ? 0 : null,
      has_free_food: !!pendingEvent.freeFood,
      registration_link:
        pendingEvent.registrationLink?.trim() ||
        pendingEvent.sourceUrl ||
        null,
      banner_image_url: pendingEvent.bannerImage ?? null,
      category,
      instagram_post_url: pendingEvent.sourceUrl ?? null,
    }).select("id, title, date, time, category, banner_image_url").single();

    if (insertErr) {
      console.error("[Dashboard] Event insert failed:", insertErr.message);
    } else if (inserted) {
      setEvents((prev) => [{ ...inserted, save_count: 0 }, ...prev]);
    }

    setConfirmingEvent(false);
    setShowEventModal(false);
  };

  const handleSkipEvent = () => {
    setShowEventModal(false);
  };

  const totalSaves = events.reduce((sum, e) => sum + (e.save_count ?? 0), 0);
  const avgSavesPerEvent =
    events.length > 0 ? Math.round(totalSaves / events.length) : 0;
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
                <SnapshotStat label="Avg. saves / event" value={avgSavesPerEvent} />
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
            title="Avg. saves / event"
            value={avgSavesPerEvent}
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
                  label="Published events"
                  value={events.length}
                />
                <InsightRow
                  label="Avg. saves per event"
                  value={avgSavesPerEvent}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showEventModal} onOpenChange={(open) => { if (!open) handleSkipEvent(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Event found on Instagram</DialogTitle>
            <DialogDescription>
              We scraped your latest post and found an event. Add it to your dashboard?
            </DialogDescription>
          </DialogHeader>

          {pendingEvent && (
            <div className="space-y-4">
              {pendingEvent.bannerImage && (
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
                  <Image
                    src={pendingEvent.bannerImage}
                    alt={pendingEvent.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{pendingEvent.title}</h3>
                {pendingEvent.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                    {pendingEvent.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {pendingEvent.date && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {pendingEvent.date}
                  </Badge>
                )}
                {pendingEvent.time && (
                  <Badge variant="secondary">{pendingEvent.time}</Badge>
                )}
                {pendingEvent.location && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {pendingEvent.location}
                  </Badge>
                )}
                {pendingEvent.freeFood && (
                  <Badge className="bg-amber-500/10 text-amber-700 gap-1">
                    <UtensilsCrossed className="h-3 w-3" />
                    Free Food
                  </Badge>
                )}
                {pendingEvent.category && (
                  <Badge variant="outline">{pendingEvent.category}</Badge>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleSkipEvent} disabled={confirmingEvent}>
              Skip
            </Button>
            <Button
              onClick={handleConfirmEvent}
              disabled={confirmingEvent}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {confirmingEvent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Add to Dashboard
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

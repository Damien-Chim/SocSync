"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EventCard } from "@/components/event-card";
import { SavedEventsProvider, useSavedEvents } from "@/components/saved-events-context";
import { FilterBar } from "@/components/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Event, EventCategory } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  Bookmark,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <SavedEventsProvider>
      <DashboardContent />
    </SavedEventsProvider>
  );
}

function mapDbEventToEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    society: {
      id: row.society_id as string,
      name: (row.society_name as string) ?? "",
      logo: (row.society_logo as string) ?? "",
      category: (row.society_category as EventCategory) ?? "Tech",
      description: "",
      followerCount: 0,
    },
    date: row.date as string,
    time: (row.time as string)?.slice(0, 5) ?? "",
    location: (row.location as string) ?? "",
    coordinates: {
      lat: (row.latitude as number) ?? 0,
      lng: (row.longitude as number) ?? 0,
    },
    price: row.price == null ? "Free" : Number(row.price),
    hasFreeFood: (row.has_free_food as boolean) ?? false,
    registrationLink: (row.registration_link as string) ?? "",
    bannerImage: (row.banner_image_url as string) ?? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    category: (row.category as EventCategory) ?? "Tech",
    saveCount: (row.save_count as number) ?? 0,
  };
}

function getEventTimestamp(event: Event) {
  const time = event.time || "00:00";
  return new Date(`${event.date}T${time}`).getTime();
}

function getEventDateTimestamp(event: Event) {
  return new Date(`${event.date}T00:00:00`).getTime();
}

function DashboardContent() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [freeFoodOnly, setFreeFoodOnly] = useState(false);
  const [freeEventsOnly, setFreeEventsOnly] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from("events_with_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Dashboard] Failed to load events:", error.message);
      } else if (data) {
        setAllEvents(data.map(mapDbEventToEvent));
      }
      setLoading(false);
    }

    loadEvents();
  }, [supabase]);

  const now = Date.now();

  const futureEvents = useMemo(() => {
    return allEvents.filter((event) => getEventTimestamp(event) >= now);
  }, [allEvents, now]);

  const featuredCandidates = useMemo(() => {
    return [...futureEvents].sort((a, b) => {
      const dateDiff = getEventDateTimestamp(a) - getEventDateTimestamp(b);
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return b.saveCount - a.saveCount;
    });
  }, [futureEvents]);

  const freeEntriesByDate = useMemo(() => {
    return [...futureEvents]
      .filter((event) => event.price === "Free")
      .sort((a, b) => {
        const dateDiff = getEventDateTimestamp(a) - getEventDateTimestamp(b);
        if (dateDiff !== 0) {
          return dateDiff;
        }
        return b.saveCount - a.saveCount;
      });
  }, [futureEvents]);

  const sortedByEventTime = useMemo(() => {
    return [...allEvents].sort((a, b) => {
      return getEventTimestamp(a) - getEventTimestamp(b);
    });
  }, [allEvents]);

  const filteredUpcomingEvents = useMemo(() => {
    return sortedByEventTime.filter((event) => {
      if (getEventTimestamp(event) < now) {
        return false;
      }

      const normalizedQuery = searchQuery.trim().toLowerCase();

      if (
        normalizedQuery &&
        ![
          event.title,
          event.description,
          event.society.name,
          event.location,
          event.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
        return false;
      }
      if (freeFoodOnly && !event.hasFreeFood) {
        return false;
      }
      if (freeEventsOnly && event.price !== "Free") {
        return false;
      }
      return true;
    });
  }, [sortedByEventTime, searchQuery, selectedCategories, freeFoodOnly, freeEventsOnly]);

  const featuredEvent = featuredCandidates[0];
  const freeAndEasyEvents = freeEntriesByDate.slice(0, 3);
  const allUpcomingEvents = filteredUpcomingEvents;

  if (loading) {
    return (
      <AppShell userRole="student">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="student">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,246,255,0.9)_45%,rgba(255,243,228,0.92))] shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
          <div className="px-6 py-7 lg:px-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <Badge className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  Campus event picks
                </Badge>
                <div className="space-y-2">
                  <h1 className="max-w-none text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.4rem]">
                    What&apos;s worth leaving your room for.
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {allEvents.length > 0 && featuredEvent ? (
          <div className="space-y-8">
            <section>
              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <Card className="overflow-hidden border-border/60 bg-card shadow-[0_18px_50px_rgba(24,24,27,0.08)]">
                <div className="px-6">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                      FEATURED EVENT
                    </h3>
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="p-4 pb-0 lg:p-4 lg:pr-0">
                    <div className="relative min-h-[18rem] overflow-hidden rounded-[1.6rem]">
                      <Image
                        src={featuredEvent.bannerImage}
                        alt={featuredEvent.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                      <FeaturedBookmark eventId={featuredEvent.id} />
                      <div className="absolute inset-x-0 bottom-0 space-y-4 p-5 text-white">
                        <div className="space-y-2">
                          <p className="text-sm text-white/80">{featuredEvent.society.name}</p>
                          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.03em]">
                            {featuredEvent.title}
                          </h2>
                          <p className="max-w-lg text-sm leading-6 text-white/80">
                            {featuredEvent.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-5 text-sm text-white/85">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(featuredEvent.date)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {featuredEvent.time}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {featuredEvent.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="flex flex-col justify-between p-6">
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={cn(
                            "rounded-full",
                            featuredEvent.price === "Free"
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                          )}
                        >
                          {featuredEvent.price === "Free" ? "Free entry" : `$${featuredEvent.price}`}
                        </Badge>
                        {featuredEvent.hasFreeFood && (
                          <Badge className="rounded-full bg-orange-500/10 text-orange-700 hover:bg-orange-500/20">
                            Free food
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Saved by students</span>
                          <span className="font-medium text-foreground">{featuredEvent.saveCount}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Best for students who want one obvious pick instead of another endless grid.</p>
                          <p>
                            Strong turnout, easy timing, and enough momentum that you will not be walking into an empty room.
                          </p>
                        </div>
                      </div>
                    </div>

                    {featuredEvent.registrationLink && (
                      <Button asChild className="mt-6 h-11 rounded-full px-5">
                        <a href={featuredEvent.registrationLink} target="_blank" rel="noopener noreferrer">
                          Open event
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </div>
              </Card>

              <Card className="border-border/60 bg-card/70 shadow-[0_18px_45px_rgba(24,24,27,0.06)]">
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                      FREE ENTRIES
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {freeAndEasyEvents.length > 0 ? (
                      freeAndEasyEvents.map((event) => (
                        <CompactEventRow key={event.id} event={event} />
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                        No free or food-friendly events match the current filters.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <div>
                  <h2 className="text-2xl px-4 font-semibold tracking-[-0.03em] text-foreground">
                    ALL UPCOMING
                  </h2>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-border/60 bg-white/70 p-4 backdrop-blur-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-end">
                  <FilterBar
                    selectedCategories={selectedCategories}
                    onCategoryChange={setSelectedCategories}
                    freeFoodOnly={freeFoodOnly}
                    onFreeFoodChange={setFreeFoodOnly}
                    freeEventsOnly={freeEventsOnly}
                    onFreeEventsChange={setFreeEventsOnly}
                  />

                  <div className="lg:col-start-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events"
                        className="h-11 rounded-full border-border/70 bg-background pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {allUpcomingEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {allUpcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                  Only the featured event matches right now. Broaden the filters if you want a wider spread.
                </p>
              )}
            </section>
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-foreground">Nothing matches the current setup.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Clear a few filters or change the search term and the dashboard will repopulate immediately.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CompactEventRow({ event }: { event: Event }) {
  const { isSaved, toggleSave } = useSavedEvents();
  const saved = isSaved(event.id);

  return (
    <div className="rounded-[1.4rem] border border-border/60 bg-background/80 p-3">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
          <Image
            src={event.bannerImage}
            alt={event.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
            <button
              onClick={() => toggleSave(event.id)}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                saved
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{event.society.name}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{formatDate(event.date)}</span>
            <span>{event.time}</span>
            <span>{event.price === "Free" ? "Free entry" : `$${event.price}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedBookmark({ eventId }: { eventId: string }) {
  const { isSaved, toggleSave } = useSavedEvents();
  const saved = isSaved(eventId);

  return (
    <button
      onClick={() => toggleSave(eventId)}
      className={cn(
        "absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
        saved
          ? "bg-primary text-primary-foreground"
          : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
      )}
    >
      <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
    </button>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

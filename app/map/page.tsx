"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EventMap } from "@/components/event-map";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Calendar, MapPin, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Event, EventCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

function mapDbEvent(row: Record<string, unknown>): Event {
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
    bannerImage: (row.banner_image_url as string) ?? "",
    category: (row.category as EventCategory) ?? "Tech",
    saveCount: (row.save_count as number) ?? 0,
  };
}

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const sidebarListRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!focusedEventId) return;
    const el = document.getElementById(`map-event-${focusedEventId}`);
    const list = sidebarListRef.current;
    if (!el || !list) return;

    requestAnimationFrame(() => {
      const gapPx = 12;
      const prev = el.previousElementSibling;
      const oneBubble =
        prev instanceof HTMLElement ? prev.offsetHeight + gapPx : 100;
      const targetTop = Math.max(0, el.offsetTop - oneBubble);
      list.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  }, [focusedEventId]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("events_with_details")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("[Map] Failed to load events:", error.message);
      } else if (data) {
        setEvents(data.map(mapDbEvent));
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <AppShell userRole="student">
      <div className="space-y-6 h-[calc(100vh-8rem)]">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Event Map</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 h-[500px] lg:h-full">
              <EventMap
                events={events}
                focusEventId={focusedEventId}
                onSelectionChange={setFocusedEventId}
              />
            </div>

            <div className="flex min-h-0 flex-col lg:h-full lg:max-h-full lg:min-h-0">
              <h2 className="shrink-0 text-lg font-semibold text-foreground py-2 pb-3">
                Upcoming Events ({events.length})
              </h2>
              <div
                ref={sidebarListRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4 pr-1 pt-4"
              >
              {events.map((event) => (
                <Card
                  key={event.id}
                  id={`map-event-${event.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setFocusedEventId(event.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFocusedEventId(event.id);
                    }
                  }}
                  className={cn(
                    "border border-border hover:border-primary/30 transition-colors cursor-pointer",
                    focusedEventId === event.id &&
                      "ring-2 ring-primary border-primary/50 shadow-md"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-1.5 h-3 w-3 flex-shrink-0 rounded-full",
                          event.hasFreeFood ? "bg-amber-500" : "bg-primary"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.society.name}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location.split(",")[0]}
                          </span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {event.price === "Free" ? "Free" : `$${event.price}`}
                          </Badge>
                          {event.hasFreeFood && (
                            <Badge className="bg-amber-500/10 text-amber-700 text-[10px] px-1.5 py-0 hover:bg-amber-500/20">
                              <UtensilsCrossed className="h-2.5 w-2.5 mr-0.5" />
                              Food
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

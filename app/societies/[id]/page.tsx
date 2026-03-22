import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SavedEventsProvider } from "@/components/saved-events-context";
import { EventCard } from "@/components/event-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeDbDate, normalizeDbTime } from "@/lib/event-datetime";
import { createClient } from "@/lib/supabase/server";
import type { Event, EventCategory, Society } from "@/lib/types";
import { ArrowLeft, Calendar, Users } from "lucide-react";

function mapSociety(row: Record<string, unknown>): Society {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    logo: (row.logo_url as string) ?? "",
    category: (row.category as EventCategory) ?? "Tech",
    description: (row.description as string) ?? "",
    followerCount: (row.follower_count as number) ?? 0,
    createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
  };
}

function mapDbEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    sourceUrl: (row.instagram_post_url as string) ?? "",
    society: {
      id: row.society_id as string,
      name: (row.society_name as string) ?? "",
      logo: (row.society_logo as string) ?? "",
      category: (row.society_category as EventCategory) ?? "Tech",
      description: "",
      followerCount: 0,
    },
    date: normalizeDbDate(row.date),
    time: normalizeDbTime(row.time),
    location: (row.location as string) ?? "",
    coordinates: {
      lat: (row.latitude as number) ?? 0,
      lng: (row.longitude as number) ?? 0,
    },
    price: row.price == null ? "Free" : Number(row.price),
    hasFreeFood: (row.has_free_food as boolean) ?? false,
    registrationLink: (row.registration_link as string) ?? "",
    bannerImage:
      (row.banner_image_url as string) ??
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    category: (row.category as EventCategory) ?? "Tech",
    saveCount: (row.save_count as number) ?? 0,
  };
}

export default async function SocietyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: societyRow, error: societyError }, { data: eventRows, error: eventsError }] =
    await Promise.all([
      supabase.from("societies_with_counts").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("events_with_details")
        .select("*")
        .eq("society_id", id)
        .order("date", { ascending: true })
        .order("time", { ascending: true }),
    ]);

  if (societyError) {
    console.error("[SocietyDetail] Failed to load society:", societyError.message);
  }
  if (eventsError) {
    console.error("[SocietyDetail] Failed to load events:", eventsError.message);
  }

  if (!societyRow) {
    notFound();
  }

  const society = mapSociety(societyRow as Record<string, unknown>);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = (eventRows ?? [])
    .map((row) => mapDbEvent(row as Record<string, unknown>))
    .filter((event) => event.date >= today);

  return (
    <div className="space-y-8">
      <Link
        href="/societies/discover"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to societies
      </Link>

      <Card className="overflow-hidden border-border/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(244,247,255,0.94)_55%,rgba(255,245,235,0.96))] shadow-[0_18px_55px_rgba(24,24,27,0.08)]">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-5">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-sm">
                <Image
                  src={society.logo}
                  alt={society.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                    {society.name}
                  </h1>
                  <Badge variant="secondary" className="rounded-full">
                    {society.category}
                  </Badge>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {society.description || "This society has not added a description yet."}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <Users className="h-4 w-4" />
                    {society.followerCount.toLocaleString()} followers
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                    <Calendar className="h-4 w-4" />
                    {upcomingEvents.length} upcoming events
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Upcoming events
          </h2>
        </div>

        {upcomingEvents.length > 0 ? (
          <SavedEventsProvider>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </SavedEventsProvider>
        ) : (
          <p className="rounded-[1.5rem] border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
            No upcoming events are listed for this society right now.
          </p>
        )}
      </section>
    </div>
  );
}

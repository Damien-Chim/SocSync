import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normalizeDbDate, normalizeDbTime } from "@/lib/event-datetime";
import { createClient } from "@/lib/supabase/server";
import type { Event, EventCategory } from "@/lib/types";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react";

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

function getInstagramUrl(event: Event) {
  if (event.sourceUrl) {
    return event.sourceUrl;
  }

  if (event.registrationLink && event.registrationLink.includes("instagram.com")) {
    return event.registrationLink;
  }

  return "";
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events_with_details")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[EventDetail] Failed to load event:", error.message);
  }

  if (!data) {
    notFound();
  }

  const event = mapDbEvent(data as Record<string, unknown>);
  const instagramUrl = getInstagramUrl(event);
  return (
    <AppShell userRole="student">
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="overflow-hidden border-border/60 bg-card shadow-[0_18px_50px_rgba(24,24,27,0.08)]">
          <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="p-4 pb-0 xl:p-4 xl:pr-0">
              <div className="relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-[1.75rem] bg-muted xl:min-h-[44rem]">
                <Image
                  src={event.bannerImage}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 52vw"
                  className="object-contain p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <Link
                    href={`/society/${encodeURIComponent(event.society.id)}`}
                    className="text-sm text-white/80 hover:text-white"
                  >
                    {event.society.name}
                  </Link>
                  <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-[-0.04em]">
                    {event.title}
                  </h1>
                </div>
              </div>
            </div>

            <CardContent className="space-y-6 p-6 xl:p-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {event.category}
                </Badge>
                <Badge
                  className="rounded-full"
                  variant={event.price === "Free" ? "default" : "secondary"}
                >
                  {event.price === "Free" ? "Free entry" : `$${event.price}`}
                </Badge>
                {event.hasFreeFood && (
                  <Badge className="rounded-full bg-orange-500/10 text-orange-700 hover:bg-orange-500/20">
                    Free food
                  </Badge>
                )}
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{event.time || "Time TBA"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location || "Location TBA"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {event.registrationLink && (
                  <Button asChild className="rounded-full px-5">
                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                      Register Now
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {instagramUrl && (
                  <Button asChild variant="outline" className="rounded-full px-5">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                      View on Instagram
                    </a>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Event details
                </p>
                <div className="rounded-[1.4rem] border border-border/60 bg-muted/30 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
                    {event.description || "More details have not been added for this event yet."}
                  </p>
                </div>
              </div>

            </CardContent>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

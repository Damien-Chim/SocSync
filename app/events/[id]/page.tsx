import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getScrapedEvents } from "@/lib/scraped-events";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getScrapedEvents().find((item) => item.id === id);

  if (!event) {
    notFound();
  }

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
                  <p className="text-sm text-white/80">{event.society.name}</p>
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
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Summary
                </p>
                <p className="text-sm leading-7 text-foreground/80">{event.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Full Instagram caption
                </p>
                <div className="rounded-[1.4rem] border border-border/60 bg-muted/30 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
                    {event.sourceCaption || "No caption available."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {event.registrationLink && (
                  <Button asChild className="rounded-full px-5">
                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                      Open original post
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {event.sourceUrl && event.sourceUrl !== event.registrationLink && (
                  <Button asChild variant="outline" className="rounded-full px-5">
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                      View on Instagram
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

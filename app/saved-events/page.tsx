"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { mockEvents, mockUser } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function SavedEventsPage() {
  const savedEvents = mockEvents.filter((event) => mockUser.savedEvents.includes(event.id));
  const now = new Date();

  const upcomingEvents = savedEvents.filter((event) => new Date(event.date) >= now);
  const pastEvents = savedEvents.filter((event) => new Date(event.date) < now);
  const nextEvent = upcomingEvents[0];

  return (
    <AppShell userRole="student">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(247,244,255,0.94)_52%,rgba(255,246,236,0.94))] shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
          <div className="grid gap-6 px-6 py-7 lg:px-8">
            <div className="space-y-4">
              <Badge className="w-fit rounded-full bg-foreground text-background hover:bg-foreground/90">
                Your shortlist
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  Saved events you might actually show up to.
                </h1>
              </div>
            </div>
          </div>
        </section>

        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <TabsList className="h-auto rounded-full bg-muted/70 p-1">
              <TabsTrigger value="upcoming" className="gap-2 rounded-full px-4 py-2.5">
                Upcoming
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                  {upcomingEvents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2 rounded-full px-4 py-2.5">
                Past
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                  {pastEvents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <SavedEventRow key={event.id} event={event} />
              ))
            ) : (
              <EmptyState
                title="No upcoming saved events"
                description="Once you bookmark a few real options, this turns into your personal running plan."
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <SavedEventRow key={event.id} event={event} isPast />
              ))
            ) : (
              <EmptyState
                title="No archived events yet"
                description="Past events will collect here once your saved list has some history behind it."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-white/70 bg-white/75 shadow-sm backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
          {icon}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">{value}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SavedEventRow({
  event,
  isPast = false,
}: {
  event: (typeof mockEvents)[0];
  isPast?: boolean;
}) {
  const [isSaved, setIsSaved] = useState(true);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/60 bg-card shadow-[0_12px_35px_rgba(24,24,27,0.05)] transition-all duration-200 hover:border-foreground/15",
        isPast && "opacity-75"
      )}
    >
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[8rem_1fr]">
          <div className="flex flex-col justify-center border-b border-border/60 bg-muted/30 px-5 py-4 text-center lg:border-r lg:border-b-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {formatMonth(event.date)}
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-foreground">
              {formatDay(event.date)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{event.time}</p>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={event.society.logo}
                    alt={event.society.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                      {event.title}
                    </h3>
                    <Badge variant="secondary" className="rounded-full">
                      {event.category}
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full",
                        event.price === "Free"
                          ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                      )}
                    >
                      {event.price === "Free" ? "Free entry" : `$${event.price}`}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.society.name}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatFullDate(event.date)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSaved(!isSaved)}
                  className={cn(
                    "rounded-full",
                    isSaved && "text-primary hover:text-primary/80"
                  )}
                >
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                </Button>
                <Button asChild className="rounded-full px-4" variant={isPast ? "outline" : "default"}>
                  <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                    {isPast ? "View event" : "Open event"}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Bookmark className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatMonth(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    month: "short",
  });
}

function formatDay(dateStr: string) {
  return new Date(dateStr).getDate().toString();
}

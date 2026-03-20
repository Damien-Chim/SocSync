"use client";

import { useState } from "react";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { mockEvents, mockUser } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ExternalLink, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavedEventsPage() {
  const savedEvents = mockEvents.filter((event) =>
    mockUser.savedEvents.includes(event.id)
  );

  const now = new Date();

  const upcomingEvents = savedEvents.filter((event) => new Date(event.date) >= now);
  const pastEvents = savedEvents.filter((event) => new Date(event.date) < now);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppShell userRole="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Events</h1>
          <p className="text-muted-foreground mt-1">
            Events you&apos;ve saved or registered for
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {upcomingEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              Past
              {pastEvents.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {pastEvents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventRow key={event.id} event={event} formatDate={formatDate} />
              ))
            ) : (
              <EmptyState
                title="No upcoming events"
                description="Save some events to see them here"
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <EventRow key={event.id} event={event} formatDate={formatDate} isPast />
              ))
            ) : (
              <EmptyState
                title="No past events"
                description="Your attended events will appear here"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function EventRow({
  event,
  formatDate,
  isPast = false,
}: {
  event: (typeof mockEvents)[0];
  formatDate: (date: string) => string;
  isPast?: boolean;
}) {
  const [isSaved, setIsSaved] = useState(true);

  return (
    <Card
      className={cn(
        "border border-border hover:border-primary/30 transition-all duration-200",
        isPast && "opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Society Logo */}
          <Image
            src={event.society.logo}
            alt={event.society.name}
            width={48}
            height={48}
            className="rounded-lg bg-muted flex-shrink-0"
          />

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">
                {event.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {event.society.name}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "transition-colors",
                isSaved && "text-primary hover:text-primary/80"
              )}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </Button>
            <Button asChild size="sm" className={isPast ? "opacity-50" : ""}>
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isPast ? "View" : "Open"}
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bookmark className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

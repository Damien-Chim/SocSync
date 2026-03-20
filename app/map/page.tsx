"use client";

import { AppShell } from "@/components/app-shell";
import { EventMap } from "@/components/event-map";
import { mockEvents } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Calendar, MapPin } from "lucide-react";

export default function MapPage() {
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
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Map</h1>
          <p className="text-muted-foreground mt-1">
            Find events happening near you
          </p>
        </div>

        {/* Map Container */}
        <div className="grid lg:grid-cols-3 gap-6 h-full">
          {/* Map */}
          <div className="lg:col-span-2 h-[500px] lg:h-full">
            <EventMap events={mockEvents} />
          </div>

          {/* Event List Sidebar */}
          <div className="space-y-3 lg:overflow-y-auto lg:max-h-full pb-4">
            <h2 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2">
              Upcoming Events ({mockEvents.length})
            </h2>
            {mockEvents.map((event) => (
              <Card
                key={event.id}
                className="border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: event.hasFreeFood ? "#f59e0b" : "#7c3aed",
                      }}
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
    </AppShell>
  );
}

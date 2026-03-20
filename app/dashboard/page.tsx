"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { mockEvents, mockUser } from "@/lib/mock-data";
import type { EventCategory } from "@/lib/types";

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [freeFoodOnly, setFreeFoodOnly] = useState(false);
  const [freeEventsOnly, setFreeEventsOnly] = useState(false);

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      if (selectedCategory !== "All" && event.category !== selectedCategory) {
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
  }, [selectedCategory, freeFoodOnly, freeEventsOnly]);

  return (
    <AppShell userRole="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discover Events</h1>
          <p className="text-muted-foreground mt-1">
            Find your next campus adventure
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          freeFoodOnly={freeFoodOnly}
          onFreeFoodChange={setFreeFoodOnly}
          freeEventsOnly={freeEventsOnly}
          onFreeEventsChange={setFreeEventsOnly}
        />

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialSaved={mockUser.savedEvents.includes(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">🎪</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No events found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to find more events
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

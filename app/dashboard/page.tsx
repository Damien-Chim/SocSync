"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockEvents, mockUser } from "@/lib/mock-data";
import type { EventCategory } from "@/lib/types";
import { Search } from "lucide-react";

export default function DashboardPage() {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [freeFoodOnly, setFreeFoodOnly] = useState(false);
  const [freeEventsOnly, setFreeEventsOnly] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isSearchOpen]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mockEvents.filter((event) => {
      if (normalizedQuery) {
        const matchesSearch =
          event.title.toLowerCase().includes(normalizedQuery) ||
          event.society.name.toLowerCase().includes(normalizedQuery) ||
          event.location.toLowerCase().includes(normalizedQuery) ||
          event.category.toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) {
          return false;
        }
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
  }, [searchQuery, selectedCategories, freeFoodOnly, freeEventsOnly]);

  return (
    <AppShell userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Discover Events</h1>
          </div>

          <div ref={searchRef} className="flex items-center justify-end gap-3 lg:min-w-[22rem]">
            {isSearchOpen && (
              <div className="w-full max-w-sm">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search"
                  className="h-11 rounded-full bg-card pr-4 pl-4 shadow-lg"
                  autoFocus
                />
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open search"
              className="shrink-0 rounded-full"
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
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

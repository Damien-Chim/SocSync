"use client";

import { SocietiesControls } from "@/components/societies-controls";
import { SocietyCard } from "@/components/society-card";
import { useSocieties } from "@/components/societies-context";
import { Badge } from "@/components/ui/badge";
import type { Society } from "@/lib/types";

export default function DiscoverSocietiesPage() {
  const {
    societies,
    followedIds,
    toggleFollow,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    eventCounts,
  } = useSocieties();

  const filteredSocieties = societies
    .filter((society) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      if (normalizedQuery) {
        const matchesQuery =
          society.name.toLowerCase().includes(normalizedQuery) ||
          society.description.toLowerCase().includes(normalizedQuery) ||
          society.category.toLowerCase().includes(normalizedQuery);

        if (!matchesQuery) {
          return false;
        }
      }

      if (selectedCategory !== "All" && society.category !== selectedCategory) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "a-z") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "category") {
        return a.category.localeCompare(b.category) || b.followerCount - a.followerCount;
      }

      return b.followerCount - a.followerCount;
    });

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <SocietiesControls />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              All societies
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Browse the full directory.
            </h2>
          </div>
        </div>

        {filteredSocieties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSocieties.map((society) => (
              <SocietyCard
                key={society.id}
                society={society}
                isFollowed={followedIds.includes(society.id)}
                onToggleFollow={() => toggleFollow(society.id)}
                eventCount={eventCounts[society.id] ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <h3 className="text-xl font-semibold text-foreground">No societies match this setup.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try broadening the category, changing the sort, or searching with fewer terms.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}


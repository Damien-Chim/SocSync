"use client";

import { SocietiesControls } from "@/components/societies-controls";
import { SocietyCard } from "@/components/society-card";
import { useSocieties } from "@/components/societies-context";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/lib/mock-data";
import type { Society } from "@/lib/types";
import { Heart } from "lucide-react";

export default function LikedSocietiesPage() {
  const {
    societies,
    followedIds,
    toggleFollow,
    searchQuery,
    selectedCategory,
    sortBy,
  } = useSocieties();

  const likedSocieties = societies
    .filter((society) => followedIds.includes(society.id))
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

  return likedSocieties.length > 0 ? (
    <div className="space-y-6">
      <SocietiesControls />

      <section className="rounded-[1.75rem] border border-border/60 bg-card/50 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your list
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Societies you actually want to hear from.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep this list tight so your feed stays useful instead of noisy.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            {likedSocieties.length} followed
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {likedSocieties.map((society) => (
          <SocietyCard
            key={society.id}
            society={society}
            isFollowed
            onToggleFollow={() => toggleFollow(society.id)}
            eventCount={getSocietyEventCount(society)}
          />
        ))}
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <SocietiesControls />

      <div className="rounded-[1.75rem] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-foreground">No followed societies yet.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Follow a few groups from Discover and this page becomes your personal shortlist.
        </p>
      </div>
    </div>
  );
}

function getSocietyEventCount(society: Society) {
  return mockEvents.filter((event) => event.society.id === society.id).length;
}

"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { SocietyCard } from "@/components/society-card";
import { useSocieties } from "@/components/societies-context";
import { Badge } from "@/components/ui/badge";
import { SocietiesProvider } from "@/components/societies-context";
import { mockEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Society } from "@/lib/types";

export default function SocietiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SocietiesProvider>
      <SocietiesLayoutContent>{children}</SocietiesLayoutContent>
    </SocietiesProvider>
  );
}

function SocietiesLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const { societies, followedIds, toggleFollow } = useSocieties();
  const followedSocieties = societies.filter((society) => followedIds.includes(society.id));
  const preferredCategories = new Set(followedSocieties.map((society) => society.category));
  const recommendedSocieties = societies.filter(
    (society) =>
      !followedIds.includes(society.id) &&
      (preferredCategories.size === 0 || preferredCategories.has(society.category))
  );
  const popularSocieties = societies
    .filter((society) => !recommendedSocieties.some((item) => item.id === society.id))
    .sort((a, b) => b.followerCount - a.followerCount);
  const featuredSociety = recommendedSocieties[0] ?? popularSocieties[0];
  const popularThisWeek = popularSocieties
    .filter((society) => society.id !== featuredSociety?.id)
    .slice(0, 3);
  const recommendationReason =
    preferredCategories.size > 0
      ? `Based on the categories you already follow: ${Array.from(preferredCategories).join(", ")}.`
      : "Start following a few societies and recommendations will get more specific.";

  return (
    <AppShell userRole="student">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(140deg,rgba(255,255,255,0.96),rgba(244,248,255,0.94)_52%,rgba(255,245,233,0.94))] shadow-[0_24px_80px_rgba(24,24,27,0.08)]">
          <div className="px-6 py-7 lg:px-8">
            <div className="space-y-4">
              <Badge className="w-fit rounded-full bg-foreground text-background hover:bg-foreground/90">
                Student communities
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                  Find the societies that actually fit your campus life.
                </h1>
              </div>
            </div>
          </div>
        </section>

        {featuredSociety && (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <FeaturedSocietyCard
              society={featuredSociety}
              isFollowed={followedIds.includes(featuredSociety.id)}
              onToggleFollow={() => toggleFollow(featuredSociety.id)}
              reason={recommendationReason}
            />

            <div className="rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Popular this week
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                The societies with the strongest pull right now.
              </h2>
              <div className="mt-4 space-y-3">
                {popularThisWeek.map((society) => (
                  <CompactSocietyRow
                    key={society.id}
                    society={society}
                    isFollowed={followedIds.includes(society.id)}
                    onToggleFollow={() => toggleFollow(society.id)}
                  />
                ))}
                {popularThisWeek.length === 0 && (
                  <p className="rounded-[1.2rem] border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                    No popular societies are available right now.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {children}
      </div>
    </AppShell>
  );
}

function FeaturedSocietyCard({
  society,
  isFollowed,
  onToggleFollow,
  reason,
}: {
  society: Society;
  isFollowed: boolean;
  onToggleFollow: () => void;
  reason: string;
}) {
  return (
    <div className="rounded-[1.9rem] border border-border/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,244,255,0.94))] p-6 shadow-[0_18px_60px_rgba(24,24,27,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recommended for you
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {society.name}
          </h2>
        </div>
        <Badge className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          {society.category}
        </Badge>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        {society.description}
      </p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/80">{reason}</p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>{society.followerCount.toLocaleString()} followers</span>
        <span>{getSocietyEventCount(society)} upcoming events</span>
      </div>

      <div className="mt-6">
        <SocietyCard
          society={society}
          isFollowed={isFollowed}
          onToggleFollow={onToggleFollow}
          eventCount={getSocietyEventCount(society)}
          compact
        />
      </div>
    </div>
  );
}

function CompactSocietyRow({
  society,
  isFollowed,
  onToggleFollow,
}: {
  society: Society;
  isFollowed: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/60 bg-background/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{society.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{society.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{society.category}</span>
            <span>{society.followerCount.toLocaleString()} followers</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFollow}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}

function getSocietyEventCount(society: Society) {
  return mockEvents.filter((event) => event.society.id === society.id).length;
}

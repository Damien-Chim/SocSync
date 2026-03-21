"use client";

import Image from "next/image";
import { type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { useSocieties } from "@/components/societies-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocietiesProvider } from "@/components/societies-context";
import type { Society } from "@/lib/types";
import { Calendar, Sparkles, Users } from "lucide-react";

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
  const { societies, followedIds, toggleFollow, eventCounts, weeklyEventCounts } = useSocieties();
  const followedSocieties = societies.filter((society) => followedIds.includes(society.id));
  const preferredCategories = new Set(followedSocieties.map((society) => society.category));
  const recommendedSocieties = societies.filter(
    (society) =>
      !followedIds.includes(society.id) &&
      (preferredCategories.size === 0 || preferredCategories.has(society.category))
  );
  const popularSocieties = [...societies].sort((a, b) => b.followerCount - a.followerCount);
  const featuredSociety = recommendedSocieties[0] ?? popularSocieties[0];
  const trendingThisWeek = [...societies]
    .filter((society) => society.id !== featuredSociety?.id)
    .sort((a, b) => {
      const eventDiff = (weeklyEventCounts[b.id] ?? 0) - (weeklyEventCounts[a.id] ?? 0);
      if (eventDiff !== 0) return eventDiff;
      return b.followerCount - a.followerCount;
    })
    .slice(0, 3);
  const recommendationReason =
    preferredCategories.size > 0
      ? `Matches the categories you already follow: ${Array.from(preferredCategories).join(", ")}.`
      : "A strong place to start if you want a society with active events and an easy first entry point.";

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
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex h-full flex-col gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl px-4 font-semibold uppercase tracking-[-0.03em] text-foreground">
                  Recommended for you
                </h2>
              </div>

              <FeaturedSocietyCard
                society={featuredSociety}
                isFollowed={followedIds.includes(featuredSociety.id)}
                onToggleFollow={() => toggleFollow(featuredSociety.id)}
                eventCount={eventCounts[featuredSociety.id] ?? 0}
                weeklyEventCount={weeklyEventCounts[featuredSociety.id] ?? 0}
                reason={recommendationReason}
              />
            </div>

            <div className="flex h-full flex-col gap-4">
              <h2 className="text-2xl px-4 font-semibold uppercase tracking-[-0.03em] text-foreground">
                Trending Societies
              </h2>

              <div className="flex-1 rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-sm">
                <div className="space-y-3">
                  {trendingThisWeek.map((society) => (
                    <CompactSocietyRow
                      key={society.id}
                      society={society}
                      isFollowed={followedIds.includes(society.id)}
                      onToggleFollow={() => toggleFollow(society.id)}
                      weeklyEventCount={weeklyEventCounts[society.id] ?? 0}
                    />
                  ))}
                  {trendingThisWeek.length === 0 && (
                    <p className="rounded-[1.2rem] border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                      No societies have events scheduled for this week yet.
                    </p>
                  )}
                </div>
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
  eventCount,
  weeklyEventCount,
  reason,
}: {
  society: Society;
  isFollowed: boolean;
  onToggleFollow: () => void;
  eventCount: number;
  weeklyEventCount: number;
  reason: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(244,247,255,0.94)_55%,rgba(255,245,235,0.96))] shadow-[0_18px_55px_rgba(24,24,27,0.08)]">
      <div className="border-b border-border/60 px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.35rem] border border-white/70 bg-white shadow-sm">
              <Image
                src={society.logo}
                alt={society.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                  {society.name}
                </h2>
                <Badge variant="secondary" className="rounded-full">
                  {society.category}
                </Badge>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                {society.description}
              </p>
            </div>
          </div>

          <Button
            variant={isFollowed ? "outline" : "default"}
            className="w-full rounded-full px-5 sm:w-fit lg:shrink-0"
            onClick={onToggleFollow}
          >
            {isFollowed ? "Following" : "Follow"}
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-4 px-6 py-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.4rem] border border-border/60 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Why this one
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {reason}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-border/60 bg-white/75 p-4">
          <div className="space-y-3">
            <MetricRow
              icon={<Users className="h-4 w-4" />}
              label="Followers"
              value={society.followerCount.toLocaleString()}
            />
            <MetricRow
              icon={<Calendar className="h-4 w-4" />}
              label="Upcoming events"
              value={String(eventCount)}
            />
            <MetricRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Events this week"
              value={String(weeklyEventCount)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-border/60 bg-background/80 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">{icon}</span>
        <span className="break-words">{label}</span>
      </div>
      <p className="shrink-0 text-lg font-semibold tracking-[-0.02em] text-foreground">{value}</p>
    </div>
  );
}

function CompactSocietyRow({
  society,
  isFollowed,
  onToggleFollow,
  weeklyEventCount,
}: {
  society: Society;
  isFollowed: boolean;
  onToggleFollow: () => void;
  weeklyEventCount: number;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/60 bg-background/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[1rem] bg-muted">
            <Image
              src={society.logo}
              alt={society.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{society.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{society.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{weeklyEventCount} events this week</span>
              <span>{society.followerCount.toLocaleString()} followers</span>
            </div>
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

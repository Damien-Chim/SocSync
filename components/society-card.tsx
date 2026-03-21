"use client";

import Image from "next/image";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Society } from "@/lib/types";

interface SocietyCardProps {
  society: Society;
  isFollowed: boolean;
  onToggleFollow: () => void;
  eventCount?: number;
  compact?: boolean;
}

export function SocietyCard({
  society,
  isFollowed,
  onToggleFollow,
  eventCount = 0,
  compact = false,
}: SocietyCardProps) {
  return (
    <Card
      className={cn(
        "group h-full overflow-hidden border border-border/70 bg-card shadow-[0_12px_35px_rgba(24,24,27,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(24,24,27,0.08)]",
        compact && "shadow-none"
      )}
    >
      <CardContent className={cn("h-full p-5", compact && "p-0")}>
        <div className={cn("flex h-full flex-col gap-5", compact && "gap-4")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[1.1rem] bg-muted">
                <Image
                  src={society.logo}
                  alt={society.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-xl font-semibold tracking-[-0.02em] text-foreground">
                    {society.name}
                  </h3>
                  <Badge variant="secondary" className="rounded-full">
                    {society.category}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {society.description}
                </p>
              </div>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <Users className="h-4 w-4" />
              {society.followerCount.toLocaleString()} followers
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <Calendar className="h-4 w-4" />
              {eventCount} upcoming events
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {isFollowed ? "Already in your shortlist." : "Follow to keep this group in your feed."}
            </p>
            <Button
              variant={isFollowed ? "outline" : "default"}
              size="sm"
              className={cn(
                "rounded-full px-4",
                isFollowed && "border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
              onClick={onToggleFollow}
            >
              {isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

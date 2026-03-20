"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Society } from "@/lib/types";

interface SocietyCardProps {
  society: Society;
  initialFollowed?: boolean;
}

export function SocietyCard({ society, initialFollowed = true }: SocietyCardProps) {
  const [isFollowed, setIsFollowed] = useState(initialFollowed);

  return (
    <Card className="group overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Society Logo */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            <Image
              src={society.logo}
              alt={society.name}
              fill
              sizes="(max-width: 640px) 56px, 64px"
              className="rounded-xl bg-muted object-cover"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md">
              <Heart className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* Society Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {society.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {society.category}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {society.description}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{society.followerCount.toLocaleString()} followers</span>
            </div>
          </div>
        </div>

        {/* Unfollow Button */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full mt-4 transition-all duration-200",
            isFollowed
              ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => setIsFollowed(!isFollowed)}
        >
          {isFollowed ? "Unfollow" : "Follow"}
        </Button>
      </CardContent>
    </Card>
  );
}

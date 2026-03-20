"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Clock, MapPin, Bookmark, ExternalLink, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  initialSaved?: boolean;
}

export function EventCard({ event, initialSaved = false }: EventCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="group overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Banner Image */}
      <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden">
        <Image
          src={event.bannerImage}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover w-auto h-auto transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge 
            className={cn(
              "font-semibold",
              event.price === "Free" 
                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {event.price === "Free" ? "Free" : `$${event.price}`}
          </Badge>
          {event.hasFreeFood && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-600 font-semibold">
              <UtensilsCrossed className="h-3 w-3 mr-1" />
              Free Food
            </Badge>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
            isSaved
              ? "bg-primary text-primary-foreground"
              : "bg-white/90 text-muted-foreground hover:bg-white hover:text-primary"
          )}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        </button>

        {/* Society Info */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src={event.society.logo}
              alt={event.society.name}
              fill
              sizes="28px"
              className="rounded-full bg-white object-cover"
            />
          </div>
          <span className="text-sm font-medium text-white drop-shadow-md">
            {event.society.name}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category Tag */}
        <Badge variant="secondary" className="mb-2 text-xs">
          {event.category}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
            <Clock className="h-4 w-4 flex-shrink-0 ml-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Register Button */}
        <Button 
          asChild 
          className="w-full bg-primary hover:bg-primary/90 font-medium"
        >
          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
            Register
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

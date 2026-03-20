"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Ticket } from "lucide-react";
import type { EventCategory } from "@/lib/types";

interface FilterBarProps {
  selectedCategory: EventCategory | "All";
  onCategoryChange: (category: EventCategory | "All") => void;
  freeFoodOnly: boolean;
  onFreeFoodChange: (value: boolean) => void;
  freeEventsOnly: boolean;
  onFreeEventsChange: (value: boolean) => void;
}

const categories: (EventCategory | "All")[] = [
  "All",
  "Tech",
  "Finance",
  "Industry",
  "Social",
  "Networking",
];

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  freeFoodOnly,
  onFreeFoodChange,
  freeEventsOnly,
  onFreeEventsChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-card border border-border">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden lg:block h-8 w-px bg-border" />

      {/* Toggle Filters */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFreeFoodChange(!freeFoodOnly)}
          className={cn(
            "gap-2 transition-all duration-200",
            freeFoodOnly && "bg-amber-500/10 border-amber-500 text-amber-700 hover:bg-amber-500/20"
          )}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Free Food
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFreeEventsChange(!freeEventsOnly)}
          className={cn(
            "gap-2 transition-all duration-200",
            freeEventsOnly && "bg-emerald-500/10 border-emerald-500 text-emerald-700 hover:bg-emerald-500/20"
          )}
        >
          <Ticket className="h-4 w-4" />
          Free Entry
        </Button>
      </div>
    </div>
  );
}

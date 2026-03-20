"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface FilterBarProps {
  selectedCategories: EventCategory[];
  onCategoryChange: (categories: EventCategory[]) => void;
  freeFoodOnly: boolean;
  onFreeFoodChange: (value: boolean) => void;
  freeEventsOnly: boolean;
  onFreeEventsChange: (value: boolean) => void;
}

export function FilterBar({
  selectedCategories,
  onCategoryChange,
  freeFoodOnly,
  onFreeFoodChange,
  freeEventsOnly,
  onFreeEventsChange,
}: FilterBarProps) {
  const categoryLabel =
    selectedCategories.length === 0
      ? "All categories"
      : selectedCategories.length <= 2
        ? selectedCategories.join(", ")
        : `${selectedCategories.length} categories selected`;
  const selectedExtras = [
    freeFoodOnly ? "Free food" : null,
    freeEventsOnly ? "Free entry" : null,
  ].filter(Boolean) as string[];
  const extraLabel =
    selectedExtras.length === 0
      ? "Any extras"
      : selectedExtras.length <= 2
        ? selectedExtras.join(", ")
        : `${selectedExtras.length} extras selected`;

  const toggleCategory = (category: EventCategory, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, category]);
      return;
    }

    onCategoryChange(selectedCategories.filter((item) => item !== category));
  };

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Category
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-full justify-between bg-background px-3 font-normal"
            >
              <span className="truncate">{categoryLabel}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>Choose categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {EVENT_CATEGORIES.map((category) => (
              <DropdownMenuItem
                key={category}
                onSelect={(event) => {
                  event.preventDefault();
                  toggleCategory(category, !selectedCategories.includes(category));
                }}
                className="gap-3"
              >
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  className="pointer-events-none"
                  aria-hidden="true"
                />
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Extra Filter
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-full justify-between bg-background px-3 font-normal"
            >
              <span className="truncate">{extraLabel}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>Choose extras</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onFreeFoodChange(!freeFoodOnly);
              }}
              className="gap-3"
            >
              <Checkbox checked={freeFoodOnly} className="pointer-events-none" aria-hidden="true" />
              Free food
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onFreeEventsChange(!freeEventsOnly);
              }}
              className="gap-3"
            >
              <Checkbox checked={freeEventsOnly} className="pointer-events-none" aria-hidden="true" />
              Free entry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

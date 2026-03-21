"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocieties } from "@/components/societies-context";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";
import { Search } from "lucide-react";

export function SocietiesControls() {
  const pathname = usePathname();
  const {
    societies,
    followedIds,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useSocieties();

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/60 bg-card/40 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <SocietiesTab
            href="/societies/discover"
            label="Discover"
            count={societies.length}
            active={pathname === "/societies/discover"}
          />
          <SocietiesTab
            href="/societies/liked"
            label="Followed"
            count={followedIds.length}
            active={pathname === "/societies/liked"}
          />
        </div>

        <div className="grid gap-3 xl:flex xl:items-center xl:gap-3">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as EventCategory | "All")}
          >
            <SelectTrigger className="h-12 rounded-full bg-background xl:w-[13rem]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "popular" | "a-z" | "category")}>
            <SelectTrigger className="h-12 rounded-full bg-background xl:w-[12rem]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="a-z">A to Z</SelectItem>
              <SelectItem value="category">By category</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full xl:w-[22rem]">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search societies by name, category, or vibe"
              className="h-12 rounded-full bg-background pl-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SocietiesTab({
  href,
  label,
  count,
  active = false,
}: {
  href: string;
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      )}
    >
      <span>{label}</span>
      <Badge
        variant="secondary"
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          active ? "bg-white/15 text-white" : "bg-muted text-foreground"
        )}
      >
        {count}
      </Badge>
    </Link>
  );
}

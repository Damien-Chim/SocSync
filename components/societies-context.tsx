"use client";

import { type ReactNode, createContext, useContext, useMemo, useState } from "react";
import { mockSocieties, mockUser } from "@/lib/mock-data";
import { EVENT_CATEGORIES, type EventCategory, type Society } from "@/lib/types";

type SortOption = "popular" | "a-z" | "category";

interface SocietiesContextValue {
  societies: Society[];
  followedIds: string[];
  toggleFollow: (societyId: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: EventCategory | "All";
  setSelectedCategory: (value: EventCategory | "All") => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  followedCount: number;
  categoryCount: number;
}

const SocietiesContext = createContext<SocietiesContextValue | null>(null);

export function SocietiesProvider({ children }: { children: ReactNode }) {
  const [followedIds, setFollowedIds] = useState<string[]>(mockUser.likedSocieties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const value = useMemo(
    () => ({
      societies: mockSocieties,
      followedIds,
      toggleFollow: (societyId: string) => {
        setFollowedIds((current) =>
          current.includes(societyId)
            ? current.filter((id) => id !== societyId)
            : [...current, societyId]
        );
      },
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      sortBy,
      setSortBy,
      followedCount: followedIds.length,
      categoryCount: EVENT_CATEGORIES.length,
    }),
    [followedIds, searchQuery, selectedCategory, sortBy]
  );

  return <SocietiesContext.Provider value={value}>{children}</SocietiesContext.Provider>;
}

export function useSocieties() {
  const context = useContext(SocietiesContext);

  if (!context) {
    throw new Error("useSocieties must be used within a SocietiesProvider");
  }

  return context;
}

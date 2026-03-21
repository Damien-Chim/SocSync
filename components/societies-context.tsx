"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { mockSocieties } from "@/lib/mock-data";
import { EVENT_CATEGORIES, type EventCategory, type Society } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

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
  loading: boolean;
}

const SocietiesContext = createContext<SocietiesContextValue | null>(null);

export function SocietiesProvider({ children }: { children: ReactNode }) {
  const [societies, setSocieties] = useState<Society[]>(mockSocieties);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadData() {
      // Fetch societies from DB
      const { data: dbSocieties, error: socError } = await supabase
        .from("societies_with_counts")
        .select("*");

      if (socError) {
        console.error("[Societies] Failed to load from DB:", socError.message);
      } else if (dbSocieties && dbSocieties.length > 0) {
        setSocieties(
          dbSocieties.map((s) => ({
            id: s.id,
            name: s.name,
            logo: s.logo_url ?? "",
            category: s.category as EventCategory,
            description: s.description ?? "",
            followerCount: s.follower_count ?? 0,
          }))
        );
      }

      // Fetch follows for logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const { data, error } = await supabase
          .from("society_follows")
          .select("society_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("[Societies] Failed to load follows:", error.message);
        } else {
          setFollowedIds(data.map((row) => row.society_id));
        }
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const toggleFollow = useCallback(
    async (societyId: string) => {
      if (!userId) return;

      const isFollowed = followedIds.includes(societyId);

      setFollowedIds((current) =>
        isFollowed
          ? current.filter((id) => id !== societyId)
          : [...current, societyId]
      );

      // Optimistically update the local follower count
      setSocieties((current) =>
        current.map((s) =>
          s.id === societyId
            ? { ...s, followerCount: s.followerCount + (isFollowed ? -1 : 1) }
            : s
        )
      );

      if (isFollowed) {
        const { error } = await supabase
          .from("society_follows")
          .delete()
          .eq("user_id", userId)
          .eq("society_id", societyId);

        if (error) {
          console.error("[Societies] Unfollow failed:", error.message);
          setFollowedIds((current) => [...current, societyId]);
          setSocieties((current) =>
            current.map((s) =>
              s.id === societyId ? { ...s, followerCount: s.followerCount + 1 } : s
            )
          );
        }
      } else {
        const { error } = await supabase
          .from("society_follows")
          .insert({ user_id: userId, society_id: societyId });

        if (error) {
          console.error("[Societies] Follow failed:", error.message);
          setFollowedIds((current) => current.filter((id) => id !== societyId));
          setSocieties((current) =>
            current.map((s) =>
              s.id === societyId ? { ...s, followerCount: s.followerCount - 1 } : s
            )
          );
        }
      }
    },
    [userId, followedIds, supabase]
  );

  const value = useMemo(
    () => ({
      societies,
      followedIds,
      toggleFollow,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      sortBy,
      setSortBy,
      followedCount: followedIds.length,
      categoryCount: EVENT_CATEGORIES.length,
      loading,
    }),
    [societies, followedIds, toggleFollow, searchQuery, selectedCategory, sortBy, loading]
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

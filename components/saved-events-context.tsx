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
import { createClient } from "@/lib/supabase/client";

interface SavedEventsContextValue {
  savedEventIds: string[];
  isSaved: (eventId: string) => boolean;
  toggleSave: (eventId: string) => void;
  loading: boolean;
}

const SavedEventsContext = createContext<SavedEventsContextValue | null>(null);

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadSavedEvents() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("saved_events")
        .select("event_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("[SavedEvents] Failed to load:", error.message);
      } else {
        setSavedEventIds(data.map((row) => row.event_id));
      }

      setLoading(false);
    }

    loadSavedEvents();
  }, [supabase]);

  const isSaved = useCallback(
    (eventId: string) => savedEventIds.includes(eventId),
    [savedEventIds]
  );

  const toggleSave = useCallback(
    async (eventId: string) => {
      if (!userId) return;

      const currentlySaved = savedEventIds.includes(eventId);

      setSavedEventIds((current) =>
        currentlySaved
          ? current.filter((id) => id !== eventId)
          : [...current, eventId]
      );

      if (currentlySaved) {
        const { error } = await supabase
          .from("saved_events")
          .delete()
          .eq("user_id", userId)
          .eq("event_id", eventId);

        if (error) {
          console.error("[SavedEvents] Unsave failed:", error.message);
          setSavedEventIds((current) => [...current, eventId]);
        }
      } else {
        const { error } = await supabase
          .from("saved_events")
          .insert({ user_id: userId, event_id: eventId });

        if (error) {
          console.error("[SavedEvents] Save failed:", error.message);
          setSavedEventIds((current) => current.filter((id) => id !== eventId));
        }
      }
    },
    [userId, savedEventIds, supabase]
  );

  const value = useMemo(
    () => ({ savedEventIds, isSaved, toggleSave, loading }),
    [savedEventIds, isSaved, toggleSave, loading]
  );

  return (
    <SavedEventsContext.Provider value={value}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  const context = useContext(SavedEventsContext);

  if (!context) {
    throw new Error("useSavedEvents must be used within a SavedEventsProvider");
  }

  return context;
}

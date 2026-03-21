"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AnalyticsEvent {
  id: string;
  title: string;
  save_count: number;
  registration_count: number;
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("society_id")
        .eq("id", user.id)
        .single();

      if (!profile?.society_id) { setLoading(false); return; }

      const [eventsResult, followsResult] = await Promise.all([
        supabase
          .from("events_with_details")
          .select("id, title, save_count, registration_count")
          .eq("society_id", profile.society_id)
          .order("date", { ascending: false }),
        supabase
          .from("society_follows")
          .select("id", { count: "exact", head: true })
          .eq("society_id", profile.society_id),
      ]);

      if (eventsResult.data) {
        setEvents(eventsResult.data);
        if (eventsResult.data.length > 0) {
          setSelectedEvent(eventsResult.data[0].id);
        }
      }
      setFollowerCount(followsResult.count ?? 0);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const selectedEventData = events.find((e) => e.id === selectedEvent);
  const totalSaves = events.reduce((sum, e) => sum + (e.save_count ?? 0), 0);
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registration_count ?? 0), 0);

  if (loading) {
    return (
      <AppShell userRole="host">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="host">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your society&apos;s performance
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Events" value={events.length} />
          <SummaryCard label="Total Saves" value={totalSaves} />
          <SummaryCard label="Total Registrations" value={totalRegistrations} />
          <SummaryCard label="Followers" value={followerCount} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Event Analytics</CardTitle>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {selectedEventData ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Saves</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {selectedEventData.save_count ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Registrations</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    {selectedEventData.registration_count ?? 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {events.length === 0 ? "No events created yet." : "Select an event to view analytics"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

"use client";

import { AppShell } from "@/components/app-shell";
import { mockEvents, mockSocieties } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const followerData = [
  { month: "Jan", followers: 980 },
  { month: "Feb", followers: 1050 },
  { month: "Mar", followers: 1120 },
  { month: "Apr", followers: 1234 },
];

const viewsData = [
  { week: "Week 1", views: 450 },
  { week: "Week 2", views: 680 },
  { week: "Week 3", views: 520 },
  { week: "Week 4", views: 890 },
];

export default function AnalyticsPage() {
  const society = mockSocieties[0];
  const hostEvents = mockEvents.filter((e) => e.society.id === society.id);
  const [selectedEvent, setSelectedEvent] = useState(hostEvents[0]?.id || "");

  const selectedEventData = hostEvents.find((e) => e.id === selectedEvent);

  return (
    <AppShell userRole="host">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your society&apos;s performance
          </p>
        </div>

        {/* Overview Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Followers Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Followers Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="followers"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Views (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="week"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="views"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Event Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Event Analytics</CardTitle>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {hostEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {selectedEventData ? (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Saves</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {selectedEventData.saveCount}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-3xl font-bold text-accent-foreground mt-1">
                    {Math.round(selectedEventData.saveCount * 3.2)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    31.2%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select an event to view analytics
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

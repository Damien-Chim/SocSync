"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { mockEvents, mockSocieties } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Bookmark,
  Eye,
  PlusCircle,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";

export default function HostDashboardPage() {
  const society = mockSocieties[0]; // Tech Society for demo
  const hostEvents = mockEvents.filter((e) => e.society.id === society.id);

  const totalSaves = hostEvents.reduce((sum, e) => sum + e.saveCount, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <AppShell userRole="host">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Host Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your society&apos;s events
            </p>
          </div>
          <Link href="/host/create-event">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            value={hostEvents.length}
            icon={Calendar}
            trend="+2 this month"
          />
          <StatCard
            title="Total Saves"
            value={totalSaves}
            icon={Bookmark}
            trend="+12% vs last month"
          />
          <StatCard
            title="Followers"
            value={society.followerCount}
            icon={Users}
            trend="+45 this week"
          />
          <StatCard
            title="Profile Views"
            value={2847}
            icon={Eye}
            trend="+8% vs last week"
          />
        </div>

        {/* My Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hostEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <Image
                  src={event.bannerImage}
                  alt={event.title}
                  width={80}
                  height={50}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {event.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{formatDate(event.date)} at {event.time}</span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5" />
                      {event.saveCount} saves
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number;
  icon: typeof Calendar;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {value.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

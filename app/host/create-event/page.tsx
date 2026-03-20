"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { EventCategory } from "@/lib/types";

const categories: EventCategory[] = ["Tech", "Finance", "Industry", "Social", "Networking"];

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as EventCategory | "",
    date: "",
    time: "",
    location: "",
    price: "",
    isFree: true,
    hasFreeFood: false,
    registrationLink: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit - redirect to dashboard
    router.push("/host/dashboard");
  };

  return (
    <AppShell userRole="host">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/host/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Fill in the details to create a new event for your society
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Label>Event Banner</Label>
                <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload banner image</span>
                    <span className="text-xs">Recommended: 1200x600px</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., AI Workshop: Build Your First Chatbot"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    placeholder="e.g., Engineering Building, Room 101"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="h-11 pr-10"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Free Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle off to set a ticket price
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                  />
                </div>
                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="h-11"
                    />
                  </div>
                )}
              </div>

              {/* Free Food Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Free Food</Label>
                  <p className="text-sm text-muted-foreground">
                    Will there be free food at this event?
                  </p>
                </div>
                <Switch
                  checked={formData.hasFreeFood}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasFreeFood: checked })}
                />
              </div>

              {/* Registration Link */}
              <div className="space-y-2">
                <Label htmlFor="registrationLink">External Registration Link</Label>
                <Input
                  id="registrationLink"
                  type="url"
                  placeholder="https://eventbrite.com/..."
                  value={formData.registrationLink}
                  onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/host/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  Create Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

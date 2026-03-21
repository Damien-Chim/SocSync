"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
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
import { Upload, MapPin, ArrowLeft, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function CreateEventPage() {
  const router = useRouter();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as EventCategory | "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    price: "",
    isFree: true,
    hasFreeFood: false,
    registrationLink: "",
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setBannerPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const clearBanner = useCallback(() => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("society_id")
      .eq("id", user.id)
      .single();

    if (!profile?.society_id) {
      setError("No society linked to your account.");
      setLoading(false);
      return;
    }

    let bannerUrl: string | null = null;

    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop() ?? "png";
      const filePath = `event-banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("SocSync Pics")
        .upload(filePath, bannerFile, { contentType: bannerFile.type });

      if (uploadError) {
        console.error("[CreateEvent] Banner upload error:", uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("SocSync Pics")
          .getPublicUrl(filePath);
        bannerUrl = urlData.publicUrl;
      }
    }

    const { error: insertError } = await supabase.from("events").insert({
      title: formData.title,
      description: formData.description,
      society_id: profile.society_id,
      date: formData.date,
      time: formData.startTime,
      end_time: formData.endTime || null,
      location: formData.location,
      price: formData.isFree ? null : parseFloat(formData.price) || null,
      has_free_food: formData.hasFreeFood,
      registration_link: formData.registrationLink,
      banner_image_url: bannerUrl,
      category: formData.category as EventCategory,
    });

    if (insertError) {
      console.error("[CreateEvent] Insert error:", insertError.message);
      setError(insertError.message);
      setLoading(false);
      return;
    }

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
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Label>Event Banner</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                {bannerPreview ? (
                  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30">
                    <div className="relative h-40 w-full">
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearBanner}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-muted/30"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">
                        {isDragging ? "Drop image here" : "Click or drag to upload banner image"}
                      </span>
                      <span className="text-xs">Recommended: 1200x600px</span>
                    </div>
                  </div>
                )}
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
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
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

              {/* Time Range */}
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="h-11 flex-1"
                  />
                  <span className="text-sm font-medium text-muted-foreground shrink-0">to</span>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="h-11 flex-1"
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
                  disabled={loading}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

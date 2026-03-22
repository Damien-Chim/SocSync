"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Eye, EyeOff, Upload, User, Building2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type UserRole = "student" | "host";

function extractInstagramUsername(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withoutAt = trimmed.replace(/^@/, "");

  if (!withoutAt.includes("instagram.com")) {
    return withoutAt.split(/[/?#]/)[0] || null;
  }

  try {
    const normalizedUrl = withoutAt.startsWith("http")
      ? withoutAt
      : `https://${withoutAt}`;
    const url = new URL(normalizedUrl);
    const [username] = url.pathname.split("/").filter(Boolean);
    return username || null;
  } catch {
    return null;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    societyName: "",
    instagramLink: "",
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
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

  const clearLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const instagramUsername =
      role === "host" && formData.instagramLink.trim()
        ? extractInstagramUsername(formData.instagramLink)
        : null;

    if (role === "host" && formData.instagramLink.trim() && !instagramUsername) {
      setError("Please enter a valid Instagram username or link.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    console.log("[Signup] Attempting signup for:", formData.email, "role:", role);

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: role,
          society_name: role === "host" ? formData.societyName : undefined,
        },
      },
    });

    if (authError) {
      console.error("[Signup] Auth error:", authError.message, authError);
      setError(authError.message);
      setLoading(false);
      return;
    }

    console.log("[Signup] Success! User:", data.user?.id);

    if (!data.session) {
      setLoading(false);
      alert("Check your email for a confirmation link, then sign in.");
      router.push("/login");
      return;
    }

    if (role === "host") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("society_id")
        .eq("id", data.user!.id)
        .single();

      if (profile?.society_id) {
        const updates: Record<string, string> = {};

        if (logoFile) {
          const ext = logoFile.name.split(".").pop() ?? "png";
          const filePath = `society-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("SocSync Pics")
            .upload(filePath, logoFile, { contentType: logoFile.type });

          if (uploadError) {
            console.error("[Signup] Logo upload error:", uploadError.message);
          } else {
            const { data: urlData } = supabase.storage
              .from("SocSync Pics")
              .getPublicUrl(filePath);
            updates.logo_url = urlData.publicUrl;
          }
        }

        if (formData.instagramLink.trim()) {
          updates.instagram_url = formData.instagramLink.trim();
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("societies")
            .update(updates)
            .eq("id", profile.society_id);
        }
      }

      if (instagramUsername) {
        try {
          const response = await fetch("/api/scrape-instagram", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: instagramUsername }),
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            console.error("[Signup] Scraper trigger failed:", payload?.error ?? response.statusText);
          }
        } catch (scrapeError) {
          console.error("[Signup] Scraper trigger failed:", scrapeError);
        }
      }
    }

    router.push(role === "host" ? "/host/dashboard" : "/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">SocSync</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl shadow-primary/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Join the university events community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  role === "student"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-6 w-6" />
                <span className="font-semibold text-sm">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("host")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  role === "host"
                    ? "border-accent bg-accent/10 text-accent-foreground"
                    : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="h-6 w-6" />
                <span className="font-semibold text-sm">Society Host</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{role === "host" ? "Your Name" : "Full Name"}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {role === "host" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="societyName">Society Name</Label>
                    <Input
                      id="societyName"
                      type="text"
                      placeholder="e.g., Tech Society"
                      value={formData.societyName}
                      onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Society Logo</Label>
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
                    {logoPreview ? (
                      <div className="relative flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {logoFile?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {logoFile && (logoFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearLogo}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
                          "flex items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                          isDragging
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-muted/30"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span className="text-sm">
                            {isDragging ? "Drop image here" : "Click or drag to upload"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramLink">Instagram Link</Label>
                    <Input
                      id="instagramLink"
                      type="url"
                      placeholder="https://instagram.com/yoursociety"
                      value={formData.instagramLink}
                      onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 text-base font-semibold",
                  role === "host"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Upload, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type UserRole = "student" | "host";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    societyName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - redirect based on role
    if (role === "host") {
      router.push("/host/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-foreground">SocSync</span>
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
                    <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Upload className="h-6 w-6" />
                        <span className="text-sm">Upload logo</span>
                      </div>
                    </div>
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
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
                className={cn(
                  "w-full h-11 text-base font-semibold",
                  role === "host" 
                    ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                Create Account
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

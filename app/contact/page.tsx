"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AppShell userRole="student">
        <div className="max-w-xl mx-auto">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Message Sent!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thanks for reaching out. We&apos;ll get back to you within 24-48 hours.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", subject: "", message: "" });
                }}
                variant="outline"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userRole="student">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary mb-2 shadow-lg shadow-primary/30">
            <MessageSquare className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="text-muted-foreground">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Contact Info */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Prefer email? Reach us directly at{" "}
              <a
                href="mailto:hello@socsync.app"
                className="font-medium text-primary hover:underline"
              >
                hello@socsync.app
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

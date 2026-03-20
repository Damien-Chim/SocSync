"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Target, Users, Heart, Sparkles, Globe } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
  {
    name: "Marcus Williams",
    role: "Head of Product",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
  },
  {
    name: "Priya Patel",
    role: "Lead Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
  },
  {
    name: "James O'Connor",
    role: "Community Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
  },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We believe every student deserves easy access to campus life and community.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building connections between societies and students is at our core.",
  },
  {
    icon: Heart,
    title: "Student-Focused",
    description: "Everything we build is designed with students in mind.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "We constantly improve to make discovering events effortless.",
  },
];

export default function AboutPage() {
  return (
    <AppShell userRole="student">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">About SocSync</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Your one-stop hub for all university society events. We connect students 
            with vibrant campus communities and help them discover unforgettable experiences.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-0">
          <CardContent className="p-8 text-center">
            <Globe className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
              To revolutionize how students discover and engage with university societies, 
              making campus life more accessible, connected, and exciting for everyone. 
              We believe that the best university experiences happen when students find 
              their communities.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border border-border hover:border-primary/30 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
              >
                <CardContent className="p-6">
                  <div className="relative mx-auto mb-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto bg-muted"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <p className="text-3xl font-bold text-primary">50+</p>
            <p className="text-sm text-muted-foreground mt-1">Active Societies</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <p className="text-3xl font-bold text-accent-foreground">5,000+</p>
            <p className="text-sm text-muted-foreground mt-1">Students</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <p className="text-3xl font-bold text-primary">200+</p>
            <p className="text-sm text-muted-foreground mt-1">Events Monthly</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

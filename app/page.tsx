import Link from "next/link";
import { Zap, ArrowRight, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SocSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 lg:px-12">
        <div className="mx-auto max-w-5xl pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            Your Campus Event Hub
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            Discover Events.
            <br />
            <span className="text-primary">Connect</span> with{" "}
            <span className="text-accent">Societies.</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            SocSync is your one-stop platform to discover university society events, 
            connect with like-minded students, and never miss out on campus life.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                I&apos;m a Society Host
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto max-w-5xl pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Browse Events</h3>
              <p className="text-sm text-muted-foreground">
                Filter by category, date, free food availability, and more. Find your perfect event in seconds.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-foreground mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Map View</h3>
              <p className="text-sm text-muted-foreground">
                See all events on an interactive campus map. Never get lost finding your next adventure.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Follow Societies</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when your favorite societies post new events. Build your community.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              SocSync - University Society Events
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

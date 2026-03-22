import Link from "next/link";
import type { ReactNode } from "react";
import { Zap, ArrowRight, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.10),transparent_26%),linear-gradient(180deg,#fcfcff_0%,#f8f8fd_48%,#fcfbf8_100%)]">
      <header className="px-6 py-5 lg:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-[-0.03em] text-foreground">SocSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-primary px-6 font-medium hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
        </div>
      </header>

      <main className="px-6 lg:px-12">
        <section className="mx-auto max-w-6xl pt-18 pb-18 lg:pt-24 lg:pb-24">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Your campus event hub
            </p>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-[6.2rem] lg:leading-[0.96]">
              Discover events.
              <br />
              Connect with societies.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-9 text-muted-foreground">
              SocSync helps students find what is actually happening on campus, follow the right societies, and stop missing the events everyone talks about after they are over.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold">
                  Start exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                I&apos;m a society host
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-10 border-t border-border/60 pt-10 md:grid-cols-3">
            <FeatureColumn
              icon={<Calendar className="h-5 w-5" />}
              title="Browse events"
              description="Find the next thing worth leaving your room for, without digging through five group chats and twelve stories."
            />
            <FeatureColumn
              icon={<MapPin className="h-5 w-5" />}
              title="See what is nearby"
              description="Use the map to understand where events are actually happening and whether getting there is realistic."
            />
            <FeatureColumn
              icon={<Users className="h-5 w-5" />}
              title="Keep up with societies"
              description="Follow the groups that match your interests and get a cleaner feed instead of random campus noise."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
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

function FeatureColumn({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm ring-1 ring-border/60">
        {icon}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        <p className="text-base leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Local photography — /public/landing */
const IMG = {
  hero: "/landing/hero.jpg",
  feed: "/landing/feed.jpg",
  societies: "/landing/societies.jpg",
  map: "/landing/map.jpg",
} as const;

function LandingImg({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export default function HomePage() {
  return (
    <div className="landing-page min-h-screen">
      {/* Header — thin rule, wordmark only */}
      <header className="border-b lp-border">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="landing-serif text-[1.35rem] font-medium tracking-[-0.03em] text-[color:var(--lp-ink)] sm:text-2xl"
          >
            SocSync
          </Link>
          <nav className="flex items-center gap-8 sm:gap-10">
            <Link href="/about" className="landing-link-muted text-[0.8125rem] font-medium uppercase tracking-[0.14em]">
              About
            </Link>
            <Link href="/contact" className="landing-link-muted text-[0.8125rem] font-medium uppercase tracking-[0.14em]">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — asymmetric: copy left (wide), image rides up on the right */}
        <section className="border-b lp-border px-5 pb-16 pt-14 sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-12 lg:gap-0 lg:gap-x-10">
            <div className="flex flex-col justify-end lg:col-span-6 lg:row-span-2 lg:pb-4">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] lp-muted">Note</p>
              <h1 className="landing-serif mt-6 max-w-[14ch] text-[2.35rem] font-normal leading-[1.05] tracking-[-0.035em] sm:text-5xl sm:leading-[1.02] lg:max-w-none lg:text-[3.25rem] lg:leading-[1.02] xl:text-[3.75rem]">
                Thursday shouldn&apos;t be a mystery.
              </h1>
              <p className="mt-8 max-w-md text-[1.0625rem] leading-[1.65] lp-muted lg:mt-10 lg:max-w-lg lg:text-lg">
                Society events still live in stories, posters, and group chats. I built SocSync for the week when you
                care about showing up—and for the hosts who are tired of repeating the same details in six places.
              </p>
            </div>

            <div className="relative lg:col-span-6 lg:col-start-7 lg:-mt-6 lg:min-h-[min(70vh,520px)]">
              <div
                className="relative aspect-[4/5] w-full overflow-hidden border lp-border bg-[color:var(--lp-surface)] sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:min-h-[420px] lg:[clip-path:polygon(0_0,100%_0,100%_100%,8%_100%,0_92%)]"
              >
                <LandingImg
                  src={IMG.hero}
                  alt="Students working together at a table"
                  className="object-[center_30%]"
                  priority
                />
              </div>
              <p className="landing-serif mt-4 max-w-[18ch] text-right text-[0.8125rem] italic leading-snug lp-muted lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:max-w-[14ch] lg:text-left">
                Same campus. Clearer picture.
              </p>
            </div>
          </div>
        </section>

        {/* Breathing room — horizontal rule only */}
        <div className="flex justify-center border-b lp-border py-10 lp-paper">
          <div className="h-px w-16 bg-[color:var(--lp-rust)] opacity-60" aria-hidden />
        </div>

        {/* Audience — uneven columns, not 50/50 */}
        <section className="border-b lp-border lp-surface">
          <div className="mx-auto grid max-w-[1600px] md:grid-cols-12">
            <AudienceBlock
              className="border-b lp-border md:col-span-5 md:border-b-0 md:border-r"
              kicker="If you're a student"
              title="One feed. Real filters."
              body="Save what you might attend. Skip what you won’t. The map is there so distance isn’t a guess on the day."
              href="/signup"
              linkText="Create a free account"
            />
            <AudienceBlock
              className="md:col-span-7 md:pl-4 lg:pl-10"
              kicker="If you run a society"
              title="Publish once. Let the room find you."
              body="Put your society and events where students already look—locations included—so you’re not retyping the same poster copy into every chat."
              href="/signup?role=host"
              linkText="Register as a host"
            />
          </div>
        </section>

        {/* Features — editorial rows, not a card grid */}
        <section className="border-b lp-border px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] lp-muted">What you get</p>
              <h2 className="landing-serif mt-5 text-3xl font-normal leading-[1.12] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
                Three things, done properly.
              </h2>
              <p className="mt-6 text-base leading-relaxed lp-muted lg:text-lg">
                No icons in circles. Just the parts we kept because we use them ourselves.
              </p>
            </div>

            <div className="mt-16 space-y-20 lg:mt-24 lg:space-y-28">
              <FeatureRow
                n="01"
                title="A stream that stays current"
                body="Listings from societies you follow—updated when hosts post, not when someone remembers to bump a thread."
                image={IMG.feed}
                imageAlt="People at a lecture or event"
                flip={false}
              />
              <FeatureRow
                n="02"
                title="Follows that stay yours"
                body="Pick the clubs you care about. Their line stays in one place—no algorithm deciding what you see next."
                image={IMG.societies}
                imageAlt="Students on campus"
                flip
              />
              <FeatureRow
                n="03"
                title="A map that respects geography"
                body="Venues where they actually are—so you can line up time, distance, and how you’re getting there."
                image={IMG.map}
                imageAlt="Notebook and map on a desk"
                flip={false}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t lp-border lp-paper">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:px-12">
          <div>
            <p className="landing-serif text-xl font-medium tracking-[-0.02em]">SocSync</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed lp-muted">
              Built for students and society hosts who’d rather show up than chase links.
            </p>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-end sm:gap-16 lg:gap-24">
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] lp-muted">Company</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/about" className="landing-link-muted">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="landing-link-muted">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] lp-muted">Account</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/login" className="landing-link-muted">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t lp-border px-5 py-6 sm:px-8 lg:px-12">
          <p className="mx-auto max-w-[1600px] text-[0.8125rem] lp-muted">
            © {new Date().getFullYear()} SocSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AudienceBlock({
  kicker,
  title,
  body,
  href,
  linkText,
  className,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  linkText: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full flex-col px-6 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20", className)}>
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] lp-muted">{kicker}</p>
      <h2 className="landing-serif mt-5 text-2xl font-normal leading-[1.15] tracking-[-0.02em] sm:text-3xl lg:max-w-md">
        {title}
      </h2>
      <p className="mt-6 flex-1 max-w-md text-[1.0625rem] leading-[1.65] lp-muted">{body}</p>
      <Link href={href} className="landing-link mt-12 inline-block w-fit text-[0.9375rem] font-medium">
        {linkText} →
      </Link>
    </div>
  );
}

function FeatureRow({
  n,
  title,
  body,
  image,
  imageAlt,
  flip,
}: {
  n: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  flip: boolean;
}) {
  const imageEl = (
    <div
      className={cn(
        "relative aspect-[16/11] overflow-hidden border lp-border bg-[color:var(--lp-surface)] lg:col-span-7",
        flip && "lg:col-start-6"
      )}
    >
      <LandingImg src={image} alt={imageAlt} className="absolute inset-0 object-cover" />
    </div>
  );
  const textEl = (
    <div
      className={cn(
        "flex flex-col justify-center border-t pt-10 lp-border lg:col-span-5 lg:pt-0",
        flip ? "lg:border-r lg:border-t-0 lg:pr-10 lg:text-right" : "lg:col-start-8 lg:border-l lg:border-t-0 lg:pl-10"
      )}
    >
      <span className={cn("landing-serif text-5xl font-light leading-none text-[color:var(--lp-line)] lg:text-6xl", flip && "lg:ml-auto")}>
        {n}
      </span>
      <h3 className={cn("landing-serif mt-6 text-2xl font-normal leading-[1.2] tracking-[-0.02em] sm:text-3xl", flip && "lg:ml-auto lg:max-w-md")}>
        {title}
      </h3>
      <p className={cn("mt-5 text-[1.0625rem] leading-[1.65] lp-muted", flip && "lg:ml-auto lg:max-w-md")}>{body}</p>
    </div>
  );
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
      {flip ? (
        <>
          {textEl}
          {imageEl}
        </>
      ) : (
        <>
          {imageEl}
          {textEl}
        </>
      )}
    </div>
  );
}

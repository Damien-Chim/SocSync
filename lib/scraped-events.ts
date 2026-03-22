import scrapedEventsData from "@/scraper/events.json";
import type { Event, EventCategory } from "@/lib/types";

interface ScrapedEventRecord {
  source_url?: string | null;
  source_caption?: string | null;
  source_image?: string | null;
  event?: {
    event_title?: string | null;
    description?: string | null;
    category?: string | null;
    date?: string | null;
    time?: string | null;
    location?: string | null;
    free_event?: boolean | null;
    free_food?: boolean | null;
    external_registration_link?: string | null;
    is_event_like?: boolean;
    poster_image?: string | null;
  } | null;
}

export function getScrapedEvents() {
  return (scrapedEventsData as ScrapedEventRecord[])
    .map(mapScrapedEventToEvent)
    .filter((event): event is Event => event !== null);
}

function mapScrapedEventToEvent(row: ScrapedEventRecord, index: number): Event | null {
  if (!row.event?.is_event_like) {
    return null;
  }

  const normalizedDate = normalizeScrapedDate(row.event.date);
  if (!normalizedDate) {
    return null;
  }

  const societyHandle = extractInstagramHandle(row.source_url);

  return {
    id: buildScrapedEventId(row, index),
    title: row.event.event_title ?? "Untitled event",
    description: row.event.description ?? row.source_caption ?? "",
    sourceCaption: row.source_caption ?? "",
    sourceUrl: row.source_url ?? "",
    society: {
      id: societyHandle,
      name: formatSocietyName(societyHandle),
      logo: "/placeholder-logo.png",
      category: mapScrapedCategory(row.event.category),
      description: "",
      followerCount: 0,
    },
    date: normalizedDate,
    time: normalizeScrapedTime(row.event.time),
    location: row.event.location ?? "TBA",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    price: row.event.free_event ? "Free" : 0,
    hasFreeFood: row.event.free_food ?? false,
    registrationLink: row.event.external_registration_link ?? row.source_url ?? "",
    bannerImage:
      row.event.poster_image ??
      row.source_image ??
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    category: mapScrapedCategory(row.event.category),
    saveCount: 0,
  };
}

function buildScrapedEventId(row: ScrapedEventRecord, index: number) {
  if (!row.source_url) {
    return `scraped-event-${index}`;
  }

  try {
    const url = new URL(row.source_url);
    const slug = url.pathname
      .split("/")
      .filter(Boolean)
      .join("-")
      .replace(/[^A-Za-z0-9._-]/g, "-");

    return slug || `scraped-event-${index}`;
  } catch {
    return `scraped-event-${index}`;
  }
}

function extractInstagramHandle(sourceUrl?: string | null) {
  if (!sourceUrl) {
    return "society";
  }

  try {
    const url = new URL(sourceUrl);
    return url.pathname.split("/").filter(Boolean)[0] || "society";
  } catch {
    return "society";
  }
}

function formatSocietyName(handle: string) {
  return handle
    .replace(/[_\.]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapScrapedCategory(category?: string | null): EventCategory {
  switch ((category ?? "").toLowerCase()) {
    case "tech":
      return "Tech";
    case "finance":
      return "Finance";
    case "social":
      return "Social";
    case "networking":
      return "Networking";
    case "industry":
      return "Career";
    default:
      return "Workshop";
  }
}

function normalizeScrapedDate(rawDate?: string | null) {
  if (!rawDate) {
    return null;
  }

  const cleaned = rawDate
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const currentYear = new Date().getFullYear();
  const withYear = /\b\d{4}\b/.test(cleaned) ? cleaned : `${cleaned} ${currentYear}`;
  const parsed = new Date(withYear);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeScrapedTime(rawTime?: string | null) {
  if (!rawTime) {
    return "";
  }

  return rawTime
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

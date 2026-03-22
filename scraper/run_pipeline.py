"""
run_pipeline.py
---------------
Runs the full Instagram → events pipeline in one go:
  1. scrape_posts        → posts.json
  2. scrape_post_details → post_details.json
  3. extract_events      → events.json
  4. upload_to_supabase  → inserts parsed events into DB (optional)

Usage:
    python run_pipeline.py --account <instagram_handle> --society-id <uuid>
"""

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from dateutil import parser as dateparser
from dotenv import load_dotenv
from openai import OpenAI
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from supabase import create_client as create_supabase_client

load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local", override=True)

# ── Config ────────────────────────────────────────────────────────────────────
AUTH_FILE   = "ig_auth.json"
POSTS_FILE  = "posts.json"
DETAILS_FILE = "post_details.json"
EVENTS_FILE  = "events.json"
MODEL        = "o3-mini"
# ─────────────────────────────────────────────────────────────────────────────


# ==============================================================================
# STAGE 1 — scrape_posts.py
# ==============================================================================

def scrape_profile_posts(username: str) -> list[dict]:
    url = f"https://www.instagram.com/{username}/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(storage_state=AUTH_FILE)
        page = context.new_page()

        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)

        for text in ["Not Now", "Cancel"]:
            try:
                page.get_by_text(text, exact=True).click(timeout=1500)
            except PlaywrightTimeoutError:
                pass

        page.wait_for_timeout(2000)

        post_data = page.locator("a").evaluate_all("""
            links => links
                .map(a => {
                    const href = a.href || "";
                    const img = a.querySelector("img");
                    return {
                        href,
                        image: img ? img.src : null,
                        alt: img ? img.alt : null
                    };
                })
                .filter(item => item.href.includes("/p/") || item.href.includes("/reel/"))
        """)

        seen = set()
        unique_posts = []
        for post in post_data:
            href = post["href"]
            if href not in seen:
                seen.add(href)
                unique_posts.append(post)

        browser.close()
        return unique_posts


# ==============================================================================
# STAGE 2 — scrape_post_details.py
# ==============================================================================

def clean_caption(text: str) -> str:
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    if ": " in text:
        left, right = text.split(": ", 1)
        if "likes" in left or "comments" in left or "on " in left:
            text = right.strip()
    return text


def extract_caption_from_post(page) -> str:
    candidate_selectors = [
        'article h1',
        'h1',
        'article ul li span',
        'main ul li span',
        'main div[role="button"] span',
        'main span'
    ]

    best_text = ""

    for selector in candidate_selectors:
        try:
            texts = page.locator(selector).all_inner_texts()
            cleaned = [t.strip() for t in texts if t and t.strip()]
            for text in cleaned:
                if len(text) > len(best_text):
                    best_text = text
        except Exception:
            pass

    best_text = clean_caption(best_text)

    if len(best_text) >= 20:
        return best_text

    for selector in ['meta[property="og:description"]', 'meta[name="description"]']:
        try:
            content = page.locator(selector).get_attribute("content")
            content = clean_caption(content or "")
            if content:
                return content
        except Exception:
            pass

    try:
        body_text = page.locator("body").inner_text(timeout=3000)
        body_text = clean_caption(body_text)
        if body_text:
            return body_text
    except Exception:
        pass

    return ""


def scrape_post_details(posts: list[dict]) -> list[dict]:
    details = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(storage_state=AUTH_FILE)
        page = context.new_page()

        for post in posts:
            url = post.get("href", "")
            print(f"  Fetching details: {url}")
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)

                for text in ["Not Now", "Cancel"]:
                    try:
                        page.get_by_text(text, exact=True).click(timeout=1500)
                    except PlaywrightTimeoutError:
                        pass
                    except Exception:
                        pass

                caption = extract_caption_from_post(page)
                details.append({
                    "url": url,
                    "caption": caption,
                    "image": post.get("image"),
                    "alt": post.get("alt"),
                })
                print(f"  Caption: {caption[:80] if caption else '[NONE]'}")

            except Exception as e:
                details.append({
                    "url": url,
                    "caption": "",
                    "image": post.get("image"),
                    "alt": post.get("alt"),
                    "error": f"{type(e).__name__}: {e}",
                })
                print(f"  Error: {e}")

        browser.close()

    return details


# ==============================================================================
# STAGE 3 — extract_events.py
# ==============================================================================

EVENT_SCHEMA = {
    "type": "object",
    "properties": {
        "event_title": {
            "type": ["string", "null"],
            "description": "Short event title extracted from the post."
        },
        "description": {
            "type": ["string", "null"],
            "description": "Clean summary of the event or opportunity."
        },
        "category": {
            "type": ["string", "null"],
            "enum": ["tech", "finance", "social", "industry", "networking", None],
            "description": "Best single category match."
        },
        "date": {
            "type": ["string", "null"],
            "description": "Event date in any format."
        },
        "time": {
            "type": ["string", "null"],
            "description": "Event time as a readable string, e.g. 6:00 PM, otherwise null."
        },
        "location": {
            "type": ["string", "null"],
            "description": "Venue or location if mentioned."
        },
        "free_event": {
            "type": ["boolean", "null"],
            "description": "True if explicitly free, false if explicitly paid, null if unknown."
        },
        "free_food": {
            "type": ["boolean", "null"],
            "description": "True if free food is explicitly mentioned, else false/null."
        },
        "external_registration_link": {
            "type": ["string", "null"],
            "description": "External registration link if explicitly present."
        },
        "is_event_like": {
            "type": "boolean",
            "description": "Whether this post is an event/opportunity worth surfacing in the app."
        },
        "confidence": {
            "type": "number",
            "description": "Confidence from 0 to 1."
        }
    },
    "required": [
        "event_title", "description", "category", "date", "time",
        "location", "free_event", "free_food", "external_registration_link",
        "is_event_like", "confidence"
    ],
    "additionalProperties": False
}


def extract_registration_link(text: str, fallback_url: Optional[str] = None) -> Optional[str]:
    for link in re.findall(r"https?://[^\s]+", text or ""):
        if "instagram.com" not in link.lower():
            return link
    return fallback_url.strip() if fallback_url and fallback_url.strip() else None


def build_prompt(post: Dict[str, Any]) -> str:
    caption   = post.get("caption", "") or ""
    post_url  = post.get("url", "")     or ""
    image_alt = post.get("alt", "")     or ""

    return f"""
You are extracting structured campus event data from a society social media post.

Rules:
- Only use information explicitly present in the post text unless it is a very safe inference.
- If a field is not stated, return null.
- Category must be exactly one of: tech, finance, social, industry, networking, or null.
- date can be in any appropriate format, if no data provided, return null.
- time should be a readable string only if explicitly stated.
- free_event should be true only if clearly free, false only if clearly paid/ticketed, otherwise null.
- free_food should be true only if food is explicitly mentioned as free, otherwise false or null.
- external_registration_link should only be a non-Instagram link if present in the text.
- is_event_like should be true for events, recruitment opportunities, workshops, networking nights, panels, internships, application deadlines, or similar student opportunities worth showing in the app.

Post URL:
{post_url}

Image alt text:
{image_alt}

Caption:
{caption}
""".strip()


def call_llm(post: Dict[str, Any], client: OpenAI) -> Dict[str, Any]:
    response = client.responses.create(
        model=MODEL,
        input=[
            {"role": "system", "content": "Extract structured event/opportunity data as valid JSON matching the provided schema."},
            {"role": "user",   "content": build_prompt(post)},
        ],
        text={
            "format": {
                "type":   "json_schema",
                "name":   "event_extraction",
                "schema": EVENT_SCHEMA,
                "strict": True,
            }
        },
    )

    parsed = json.loads(response.output_text)

    if not parsed.get("external_registration_link"):
        parsed["external_registration_link"] = extract_registration_link(
            post.get("caption", ""),
            post.get("url"),
        )

    parsed["poster_image"] = post.get("image")

    return parsed


def extract_events(posts: list[dict]) -> list[dict]:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    results = []

    for i, post in enumerate(posts, start=1):
        print(f"  Extracting {i}/{len(posts)}: {post.get('url', '[no url]')}")
        try:
            extracted = call_llm(post, client)
            results.append({
                "source_url":     post.get("url"),
                "source_caption": post.get("caption"),
                "source_image":   post.get("image"),
                "event":          extracted,
            })
        except Exception as e:
            print(f"  [error] {type(e).__name__}: {e}")
            results.append({
                "source_url":     post.get("url"),
                "source_caption": post.get("caption"),
                "source_image":   post.get("image"),
                "event":          None,
                "error":          f"{type(e).__name__}: {e}",
            })

    return results


# ==============================================================================
# STAGE 4 — filter & upload to Supabase
# ==============================================================================

CATEGORY_MAP: Dict[str, str] = {
    "tech":       "Tech",
    "finance":    "Finance",
    "social":     "Social",
    "industry":   "Networking",
    "networking": "Networking",
    "career":     "Career",
    "workshop":   "Workshop",
    "competition":"Competition",
}


DEFAULT_EVENT_YEAR = 2026


def parse_date(raw: Optional[str]) -> Optional[str]:
    """Try to parse a freeform date string into YYYY-MM-DD."""
    if not raw:
        return None
    cleaned = re.sub(r"\(.*?\)", "", raw).strip()
    has_explicit_year = bool(re.search(r"\b(19\d{2}|20\d{2})\b", cleaned))
    try:
        dt = dateparser.parse(cleaned, dayfirst=True, fuzzy=True)
        if dt is None:
            return None
        if not has_explicit_year:
            dt = dt.replace(year=DEFAULT_EVENT_YEAR)
        elif dt.year < 2000:
            dt = dt.replace(year=DEFAULT_EVENT_YEAR)
        return dt.strftime("%Y-%m-%d")
    except (ValueError, OverflowError):
        return None


def parse_time_range(raw: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Parse a time string like '6-8PM' or '11:00AM-12:00PM' into (HH:MM, HH:MM)."""
    if not raw:
        return None, None

    raw = raw.strip().replace("–", "-").replace("—", "-")

    parts = re.split(r"\s*[-–—]\s*", raw, maxsplit=1)

    def to_hhmm(s: str, fallback_suffix: str = "") -> Optional[str]:
        s = s.strip()
        if not s:
            return None
        if not re.search(r"[AaPp][Mm]", s) and fallback_suffix:
            s = s + fallback_suffix
        try:
            dt = dateparser.parse(s, fuzzy=True)
            return dt.strftime("%H:%M") if dt else None
        except (ValueError, OverflowError):
            return None

    if len(parts) == 2:
        suffix_match = re.search(r"([AaPp][Mm])\s*$", parts[1])
        suffix = suffix_match.group(1) if suffix_match else ""
        start = to_hhmm(parts[0], suffix)
        end = to_hhmm(parts[1])
        return start, end

    start = to_hhmm(parts[0])
    return start, None


def upload_events_to_supabase(
    events: List[Dict[str, Any]],
    society_id: str,
) -> int:
    """Insert parsed events into Supabase. Returns count inserted."""
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        print("  [skip] SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set.")
        return 0

    sb = create_supabase_client(supabase_url, service_key)
    inserted = 0

    for record in events:
        ev = record.get("event")
        if not ev or not ev.get("is_event_like"):
            continue
        if ev.get("confidence", 0) < 0.7:
            continue

        parsed_date = parse_date(ev.get("date"))
        if not parsed_date:
            continue

        title = ev.get("event_title")
        if not title:
            continue

        start_time, end_time = parse_time_range(ev.get("time"))

        raw_cat = (ev.get("category") or "").lower()
        category = CATEGORY_MAP.get(raw_cat, "Social")

        row = {
            "title":              title,
            "description":        ev.get("description") or "",
            "society_id":         society_id,
            "date":               parsed_date,
            "time":               start_time or "00:00",
            "end_time":           end_time,
            "location":           ev.get("location") or "TBA",
            "price":              None if ev.get("free_event") in (True, None) else 0,
            "has_free_food":      bool(ev.get("free_food")),
            "registration_link": (
                ev.get("external_registration_link")
                or record.get("source_url")
            ),
            "banner_image_url":   ev.get("poster_image"),
            "category":           category,
            "instagram_post_url": record.get("source_url"),
        }

        try:
            sb.table("events").upsert(
                row,
                on_conflict="instagram_post_url",
            ).execute()
            inserted += 1
            print(f"  ✓ Inserted: {title} ({parsed_date})")
        except Exception as e:
            print(f"  ✗ Failed to insert '{title}': {e}")

    return inserted


# ==============================================================================
# MAIN PIPELINE
# ==============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(description="Full Instagram → events pipeline.")
    parser.add_argument("--account", required=True, help="Instagram username (no @)")
    parser.add_argument("--society-id", required=False, default=None,
                        help="Supabase society UUID to link events to")
    args = parser.parse_args()

    if not Path(AUTH_FILE).exists():
        raise FileNotFoundError(f"{AUTH_FILE} not found. Run save_auth.py first.")

    # ── Stage 1 ───────────────────────────────────────────────────────────────
    print("\n── Stage 1: Scraping post links ─────────────────────────────────────")
    posts = scrape_profile_posts(args.account)
    with open(POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"✓ {len(posts)} posts saved to {POSTS_FILE}")

    # ── Stage 2 ───────────────────────────────────────────────────────────────
    print("\n── Stage 2: Scraping post details ───────────────────────────────────")
    details = scrape_post_details(posts[:1])
    with open(DETAILS_FILE, "w", encoding="utf-8") as f:
        json.dump(details, f, indent=2, ensure_ascii=False)
    print(f"✓ {len(details)} post details saved to {DETAILS_FILE}")

    # ── Stage 3 ───────────────────────────────────────────────────────────────
    print("\n── Stage 3: Extracting events ───────────────────────────────────────")
    events = extract_events(details)
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)
    print(f"✓ {len(events)} events saved to {EVENTS_FILE}")

    print("\n── Pipeline complete ─────────────────────────────────────────────────")
    print(f"   posts.json        → {len(posts)} posts")
    print(f"   post_details.json → {len(details)} with captions")
    print(f"   events.json       → {len(events)} extracted")


if __name__ == "__main__":
    main()

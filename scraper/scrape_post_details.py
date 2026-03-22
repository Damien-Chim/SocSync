import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

AUTH_FILE = "ig_auth.json"
INPUT_FILE = "posts.json"
OUTPUT_FILE = "post_details.json"


def clean_caption(text: str) -> str:
    if not text:
        return ""

    text = text.strip()

    # Remove giant whitespace
    text = re.sub(r"\s+", " ", text)

    # If meta descriptions look like:
    # "123 likes, 4 comments - syncsusyd on March 20, 2026: actual caption here"
    # try to remove the prefix before the colon
    if ": " in text:
        left, right = text.split(": ", 1)
        if "likes" in left or "comments" in left or "on " in left:
            text = right.strip()

    return text


def extract_caption_from_post(page) -> str:
    # 1. Try visible text first
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

            # Pick the longest reasonable chunk
            for text in cleaned:
                if len(text) > len(best_text):
                    best_text = text
        except Exception:
            pass

    best_text = clean_caption(best_text)

    # If visible text looks decent, use it
    if len(best_text) >= 20:
        return best_text

    # 2. Fallback to meta tags
    meta_selectors = [
        'meta[property="og:description"]',
        'meta[name="description"]'
    ]

    for selector in meta_selectors:
        try:
            content = page.locator(selector).get_attribute("content")
            content = clean_caption(content or "")
            if content:
                return content
        except Exception:
            pass

    # 3. Last fallback: page text search
    try:
        body_text = page.locator("body").inner_text(timeout=3000)
        body_text = clean_caption(body_text)
        if body_text:
            return body_text
    except Exception:
        pass

    return ""


def scrape_post_details(post_urls):
    details = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(storage_state=AUTH_FILE)
        page = context.new_page()

        for url in post_urls:
            print(f"Opening {url}")

            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)

                # Dismiss popups if they appear
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
                    "caption": caption
                })

                print("Caption:", caption if caption else "[NONE]")

            except Exception as e:
                details.append({
                    "url": url,
                    "caption": "",
                    "error": f"{type(e).__name__}: {e}"
                })
                print("Error:", e)

        browser.close()

    return details


if __name__ == "__main__":
    if not Path(INPUT_FILE).exists():
        raise FileNotFoundError(f"{INPUT_FILE} not found. Run your post-link scraper first.")

    if not Path(AUTH_FILE).exists():
        raise FileNotFoundError(f"{AUTH_FILE} not found. Run your login script first.")

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        posts = json.load(f)

    urls = [p["href"] for p in posts]
    details = scrape_post_details(urls[:10])

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(details, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(details)} post details to {OUTPUT_FILE}")
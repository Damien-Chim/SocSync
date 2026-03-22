import json
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

AUTH_FILE = "ig_auth.json"
USERNAME = "syncsusyd"
OUTPUT_FILE = "posts.json"

def scrape_profile_posts(username: str):
    url = f"https://www.instagram.com/{username}/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(storage_state=AUTH_FILE)
        page = context.new_page()

        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)

        # Dismiss simple popups if they appear
        for text in ["Not Now", "Cancel"]:
            try:
                page.get_by_text(text, exact=True).click(timeout=1500)
            except PlaywrightTimeoutError:
                pass

        page.wait_for_timeout(2000)

        # Instagram profile grids usually contain links to posts (/p/) and reels (/reel/)
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

        # Deduplicate by URL
        seen = set()
        unique_posts = []
        for post in post_data:
            href = post["href"]
            if href not in seen:
                seen.add(href)
                unique_posts.append(post)

        browser.close()
        return unique_posts

if __name__ == "__main__":
    if not Path(AUTH_FILE).exists():
        raise FileNotFoundError(
            f"{AUTH_FILE} not found. Run login_once.py first."
        )

    posts = scrape_profile_posts(USERNAME)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(posts)} posts to {OUTPUT_FILE}")
    for post in posts[:10]:
        print(post["href"])
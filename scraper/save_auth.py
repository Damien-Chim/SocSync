from playwright.sync_api import sync_playwright

AUTH_FILE = "ig_auth.json"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    page.goto("https://www.instagram.com/", wait_until="domcontentloaded")
    input("Log into Instagram in the opened browser, then press Enter here...")

    context.storage_state(path=AUTH_FILE)
    print(f"Saved auth state to {AUTH_FILE}")

    browser.close()
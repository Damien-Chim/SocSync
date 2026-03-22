import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { valid: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const cleaned = username.replace(/^@/, "").trim();
    if (!cleaned || !/^[\w][\w.]{0,28}[\w]$|^[\w]$/.test(cleaned)) {
      return NextResponse.json(
        { valid: false, error: "Invalid Instagram username format" },
        { status: 400 }
      );
    }

    const res = await fetch(`https://www.instagram.com/${cleaned}/`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (res.ok) {
      const html = await res.text();
      const isLoginWall =
        !html.includes(`"username":"${cleaned}"`) &&
        !html.includes(`@${cleaned}`) &&
        !html.includes(`/${cleaned}/`);

      if (isLoginWall && res.url.includes("/accounts/login")) {
        return NextResponse.json({ valid: false, error: "Could not verify — Instagram login wall. Please double-check the username." });
      }

      return NextResponse.json({ valid: true });
    }

    if (res.status === 404) {
      return NextResponse.json({
        valid: false,
        error: "Instagram page not found. Please check the username.",
      });
    }

    return NextResponse.json({
      valid: false,
      error: `Instagram returned status ${res.status}. Please try again.`,
    });
  } catch (err) {
    console.error("[verify-instagram] Error:", err);
    return NextResponse.json(
      { valid: false, error: "Failed to verify Instagram page. Please try again." },
      { status: 500 }
    );
  }
}

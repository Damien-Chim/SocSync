import json
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

INPUT_FILE = "post_details.json"
OUTPUT_FILE = "events.json"
MODEL = "o3-mini"

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
        "event_title",
        "description",
        "category",
        "date",
        "time",
        "location",
        "free_event",
        "free_food",
        "external_registration_link",
        "is_event_like",
        "confidence"
    ],
    "additionalProperties": False
}


def extract_registration_link(text: str, fallback_url: Optional[str] = None) -> Optional[str]:
    """
    Very simple URL finder.
    If no external link is in the caption, returns None.
    """
    import re

    url_pattern = r'https?://[^\s]+'
    matches = re.findall(url_pattern, text or "")
    if matches:
        for link in matches:
            if "instagram.com" not in link.lower():
                return link
    return None


def build_prompt(post: Dict[str, Any]) -> str:
    caption = post.get("caption", "") or ""
    post_url = post.get("url", "") or ""
    image_alt = post.get("alt", "") or ""

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


def call_llm(post: Dict[str, Any]) -> Dict[str, Any]:
    prompt = build_prompt(post)

    response = client.responses.create(
        model=MODEL,
        input=[
            {
                "role": "system",
                "content": "Extract structured event/opportunity data as valid JSON matching the provided schema."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "event_extraction",
                "schema": EVENT_SCHEMA,
                "strict": True
            }
        }
    )

    parsed = json.loads(response.output_text)

    # Small fallback: if model didn't find an external link but caption has one, add it
    if not parsed.get("external_registration_link"):
        parsed["external_registration_link"] = extract_registration_link(
            post.get("caption", ""),
            post.get("url")
        )

    return parsed


def main() -> None:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        posts: List[Dict[str, Any]] = json.load(f)

    results: List[Dict[str, Any]] = []

    for i, post in enumerate(posts, start=1):
        print(f"Processing {i}/{len(posts)}: {post.get('url', '[no url]')}")
        try:
            extracted = call_llm(post)

            results.append({
                "source_url": post.get("url"),
                "source_caption": post.get("caption"),
                "event": extracted
            })
        except Exception as e:
            results.append({
                "source_url": post.get("url"),
                "source_caption": post.get("caption"),
                "event": None,
                "error": f"{type(e).__name__}: {e}"
            })

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(results)} records to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
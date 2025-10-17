#!/usr/bin/env python3
"""
TikTok Repurposer CLI
Scrape TikTok videos via Apify → ingest as **raw** content in Senso →
generate a tweet thread, LinkedIn blurb, and email teaser (all saved).

USAGE
  export SENSO_KEY="sk_prod_xxx"
  export APIFY_TOKEN="apify_api_xxx"
  python cli_tiktok_repurpose.py --profile tiktok
"""

import argparse
import json
import os
import sys
import time
from typing import Any, Dict, List

import requests
from rich.console import Console
from rich.table import Table

# --------------------------------------------------------------------------- #
# Config                                                                      #
# --------------------------------------------------------------------------- #
SENSO_API = "https://sdk.senso.ai/api/v1"
APIFY_RUN_SYNC_ITEMS = (
    "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items"
)
POLL_INTERVAL = 3  # seconds

console = Console()

# --------------------------------------------------------------------------- #
# Apify helper                                                                #
# --------------------------------------------------------------------------- #
def run_apify_actor(
    actor_input: Dict[str, Any], token: str, timeout: int = 120
) -> List[Dict[str, Any]]:
    params = {"token": token}
    headers = {"Content-Type": "application/json"}
    resp = requests.post(
        APIFY_RUN_SYNC_ITEMS, params=params, json=actor_input, headers=headers, timeout=timeout
    )
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, dict) and data.get("error"):
        raise RuntimeError(f"Apify error: {data}")
    if not isinstance(data, list):
        raise RuntimeError(f"Unexpected Apify payload: {type(data)}")
    return data


def items_to_markdown(descriptor: str, items: List[Dict[str, Any]]) -> str:
    lines: List[str] = [f"# TikTok dataset for {descriptor}", ""]
    structured: List[Dict[str, Any]] = []

    for idx, item in enumerate(items, start=1):
        author = item.get("authorMeta", {}) or {}
        author_name = author.get("nickName") or author.get("name") or "unknown author"
        handle = author.get("name") or ""
        caption = (item.get("text") or "").strip() or "<no caption>"
        stats = {
            "likes": item.get("diggCount"),
            "comments": item.get("commentCount"),
            "shares": item.get("shareCount"),
            "plays": item.get("playCount"),
        }
        stat_text = ", ".join(f"{name}={value}" for name, value in stats.items() if isinstance(value, int))
        video_url = item.get("webVideoUrl") or author.get("profileUrl") or "n/a"
        video_meta = item.get("videoMeta") or {}
        download_url = video_meta.get("downloadAddr")
        media_urls = item.get("mediaUrls") or []
        published = item.get("createTimeISO") or str(item.get("createTime") or "unknown")

        lines.append(f"## Video {idx} — {item.get('id', 'unknown')}")
        lines.append(f"- Author: {author_name} (@{handle})" if handle else f"- Author: {author_name}")
        lines.append(f"- Published: {published}")
        lines.append(f"- TikTok URL: {video_url}")
        if download_url:
            lines.append(f"- Download URL: {download_url}")
        for media in media_urls:
            if media:
                lines.append(f"- Media URL: {media}")
        if stat_text:
            lines.append(f"- Stats: {stat_text}")
        hashtags = ", ".join(f"#{h.get('name')}" for h in item.get("hashtags", []) if h.get("name"))
        if hashtags:
            lines.append(f"- Hashtags: {hashtags}")
        lines.append("")
        lines.append(caption)
        lines.append("")

        structured.append(
            {
                "videoMeta.coverUrl": video_meta.get("coverUrl"),
                "videoMeta.duration": video_meta.get("duration"),
                "videoMeta.definition": video_meta.get("definition"),
                "videoMeta.format": video_meta.get("format"),
                "videoMeta.height": video_meta.get("height"),
                "videoMeta.width": video_meta.get("width"),
                "videoMeta.downloadAddr": download_url,
                "mediaUrls": media_urls,
                "text": caption,
            }
        )

    if structured:
        lines.append("### Structured Payload")
        lines.append("```json")
        lines.append(json.dumps(structured, indent=2))
        lines.append("```")
        lines.append("")

    return "\n".join(lines).strip()

# --------------------------------------------------------------------------- #
# Senso helpers                                                               #
# --------------------------------------------------------------------------- #
def post_raw(title: str, text: str, senso_key: str) -> str:
    hdr = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    resp = requests.post(
        f"{SENSO_API}/content/raw",
        headers=hdr,
        json={
            "title": title,
            "text": text,
            "summary": f"Blog import from {title}",
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def poll_status(content_id: str, senso_key: str) -> None:
    hdr = {"X-API-Key": senso_key}
    status = ""
    spinner = console.status(f"[cyan]Processing {content_id} …[/cyan]")
    spinner.start()
    while status not in ("completed", "failed"):
        time.sleep(POLL_INTERVAL)
        r = requests.get(f"{SENSO_API}/content/{content_id}", headers=hdr, timeout=30)
        r.raise_for_status()
        status = r.json()["processing_status"]
    spinner.stop()
    if status == "failed":
        console.print(f":x: Ingestion failed for {content_id}")
        sys.exit(1)
    console.print(f":white_check_mark: Indexed (content_id = {content_id})")


def generate(instructions: str, senso_key: str) -> Dict:
    hdr = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    resp = requests.post(
        f"{SENSO_API}/generate",
        headers=hdr,
        json={
            "content_type": "marketing asset",
            "instructions": instructions,
            "save": True,
            "max_results": 5,
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()

# --------------------------------------------------------------------------- #
# Main                                                                        #
# --------------------------------------------------------------------------- #
def main(args: argparse.Namespace) -> None:
    senso_key = os.getenv("SENSO_KEY")
    apify_token = os.getenv("APIFY_TOKEN")
    if not senso_key or not apify_token:
        console.print(":warning:  Set SENSO_KEY and APIFY_TOKEN env vars first.")
        sys.exit(1)

    descriptors = [
        ("Profile", "profiles", args.profile),
        ("Hashtag", "hashtags", args.hashtag),
        ("Search", "searchQueries", args.search_query),
    ]
    provided = [(label, field, value) for label, field, value in descriptors if value]

    if len(provided) != 1:
        console.print(
            "\n[bold]No source selected.[/bold] Choose one of the options below."
        )
        console.print("  [1] TikTok profile")
        console.print("  [2] TikTok hashtag")
        console.print("  [3] TikTok search query")

        choice_map = {
            "1": ("Profile", "profiles"),
            "2": ("Hashtag", "hashtags"),
            "3": ("Search", "searchQueries"),
        }
        selection = ""
        while selection not in choice_map:
            selection = console.input("[bold blue]Select (1/2/3): [/bold blue]").strip()
        label, field = choice_map[selection]
        value = ""
        prompts = {
            "profiles": "Enter TikTok username",
            "hashtags": "Enter TikTok hashtag (no #)",
            "searchQueries": "Enter TikTok search query",
        }
        while not value:
            value = console.input(f"[bold blue]{prompts[field]}: [/bold blue]").strip()
        provided = [(label, field, value)]

    label, field, value = provided[0]
    descriptor = f"{label} {value}"

    actor_input: Dict[str, Any] = {
        field: [value],
        "resultsPerPage": args.results,
        "shouldDownloadVideos": True,
        "shouldDownloadAvatars": False,
        "shouldDownloadCovers": False,
        "shouldDownloadMusicCovers": False,
        "shouldDownloadSlideshowImages": False,
        "shouldDownloadSubtitles": False,
        "scrapeRelatedVideos": False,
        "proxyCountryCode": "US",
    }
    if field == "profiles":
        actor_input.update(
            {
                "excludePinnedPosts": False,
                "profileScrapeSections": ["videos"],
                "profileSorting": "latest",
            }
        )

    console.print(f"[bold]Retrieving TikTok data:[/bold] {descriptor}")
    items = run_apify_actor(actor_input, apify_token)
    if not items:
        console.print(f":warning:  No TikTok records found for {descriptor}")
        sys.exit(1)

    markdown = items_to_markdown(descriptor, items)
    console.print(f"→ harvested {len(items)} videos; {len(markdown):,} chars")

    console.print("Uploading article to Senso …")
    cid = post_raw(descriptor, markdown, senso_key)
    console.print(f"→ content_id = {cid}")

    poll_status(cid, senso_key)

    # Generation templates
    templates = {
        "Tweet thread (10 tweets)": (
            "Write a 10-tweet thread summarising the key ideas in an engaging tone."
        ),
        "LinkedIn post": (
            "Write a LinkedIn post (≤ 2 200 chars) summarising the article for professionals."
        ),
        "Email teaser": (
            "Write a short email teaser (subject + 3-sentence body) that drives readers to the full post."
        ),
    }

    table = Table(title="Generated Assets", header_style="bold magenta")
    table.add_column("Asset")
    table.add_column("Content ID", style="cyan")
    table.add_column("Preview (first 80 chars)", overflow="fold")

    for asset_name, prompt in templates.items():
        console.print(f"\n[bold green]Generating {asset_name} …[/bold green]")
        payload = generate(prompt, senso_key)
        asset_id = payload["content_id"]
        generated = payload["generated_text"].strip()
        preview = generated[:80].replace("\n", " ") + ("…" if len(generated) > 80 else "")
        table.add_row(asset_name, asset_id, preview)
        console.print(f":white_check_mark: Saved as content {asset_id}")

    console.print()
    console.print(table)
    console.print("\nDone! Review or edit the assets in Senso whenever you like.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Repurpose TikTok data into multiple marketing assets."
    )
    parser.add_argument("--profile", help="TikTok username to scrape.")
    parser.add_argument("--hashtag", help="TikTok hashtag to scrape (no #).")
    parser.add_argument("--search-query", help="TikTok search query to scrape.")
    parser.add_argument(
        "--results",
        type=int,
        default=5,
        help="Number of videos to fetch for the selected descriptor.",
    )
    main(parser.parse_args())

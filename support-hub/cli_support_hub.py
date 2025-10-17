#!/usr/bin/env python3
"""
CLI Support Hub
Fetch TikTok data via Apify → ingest it as **raw** content in Senso →
wait until it is searchable → open an interactive Q&A prompt.

USAGE
  export SENSO_KEY="sk_prod_xxx"
  export APIFY_TOKEN="apify_api_xxx"
  python cli_support_hub.py --profiles tiktok --hashtags openai --search-queries "ai trends"
"""

import argparse
import os
import sys
import time
from typing import Any, Dict, Iterable, List

import requests
from rich.console import Console
from rich.table import Table

# --------------------------------------------------------------------------- #
# Config (feel free to tweak)                                                 #
# --------------------------------------------------------------------------- #
SENSO_API = "https://sdk.senso.ai/api/v1"
APIFY_RUN_SYNC_ITEMS = (
    "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items"
)
POLL_INTERVAL = 3  # seconds between status checks

console = Console()

# --------------------------------------------------------------------------- #
# Apify helpers                                                               #
# --------------------------------------------------------------------------- #
def run_apify_actor(
    actor_input: Dict[str, Any], token: str, timeout: int = 120
) -> List[Dict[str, Any]]:
    """
    Execute the Apify TikTok scraper and return dataset items.
    """
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


def items_to_markdown(descriptor: str, items: Iterable[Dict[str, Any]]) -> str:
    """
    Transform TikTok dataset items into markdown suitable for Senso ingestion.
    """
    lines: List[str] = [f"# TikTok dataset for {descriptor}", ""]

    for idx, item in enumerate(items, start=1):
        video_id = item.get("id", "unknown")
        caption = (item.get("text") or "").strip() or "<no caption>"
        author = item.get("authorMeta", {}) or {}
        author_name = author.get("nickName") or author.get("name") or "unknown author"
        author_handle = author.get("name") or ""
        published = item.get("createTimeISO") or str(item.get("createTime") or "unknown")
        stats = {
            "likes": item.get("diggCount"),
            "comments": item.get("commentCount"),
            "shares": item.get("shareCount"),
            "plays": item.get("playCount"),
            "collects": item.get("collectCount"),
        }
        hashtag_list = ", ".join(f"#{h.get('name')}" for h in item.get("hashtags", []) if h.get("name"))
        video_url = item.get("webVideoUrl") or author.get("profileUrl")

        author_line = author_name if not author_handle else f"{author_name} (@{author_handle})"

        lines.append(f"## Video {idx} — {video_id}")
        lines.append(f"- Author: {author_line}")
        lines.append(f"- Published: {published}")
        lines.append(f"- URL: {video_url or 'n/a'}")
        lines.append(f"- Caption: {caption}")
        if hashtag_list:
            lines.append(f"- Hashtags: {hashtag_list}")
        stat_parts = [f"{key}={value}" for key, value in stats.items() if isinstance(value, int)]
        if stat_parts:
            lines.append(f"- Stats: {', '.join(stat_parts)}")
        music = item.get("musicMeta", {})
        if music:
            lines.append(
                f"- Music: {music.get('musicName') or 'n/a'} by {music.get('musicAuthor') or 'unknown'}"
            )
        lines.append("")

    return "\n".join(lines).strip()

# --------------------------------------------------------------------------- #
# Senso helpers                                                               #
# --------------------------------------------------------------------------- #
def create_raw_content(title: str, text: str, senso_key: str) -> str:
    """
    POST /content/raw and return the new content_id.
    """
    hdr = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    resp = requests.post(
        f"{SENSO_API}/content/raw",
        headers=hdr,
        json={"title": title, "text": text, "summary": f"Imported from {title}"}
    )
    resp.raise_for_status()
    return resp.json()["id"]


def wait_until_indexed(content_id: str, senso_key: str) -> None:
    """
    Poll /content/{content_id} until processing_status == completed or failed.
    """
    hdr = {"X-API-Key": senso_key}
    status = ""
    spinner = console.status(f"[cyan]Processing {content_id} …[/cyan]")
    spinner.start()

    while status not in ("completed", "failed"):
        time.sleep(POLL_INTERVAL)
        resp = requests.get(f"{SENSO_API}/content/{content_id}", headers=hdr, timeout=30)
        resp.raise_for_status()
        status = resp.json()["processing_status"]

    spinner.stop()

    if status == "failed":
        console.print(f":x: Processing failed for {content_id}")
        sys.exit(1)
    console.print(f":white_check_mark: Indexed (content_id = {content_id})")

# --------------------------------------------------------------------------- #
# Search helpers                                                              #
# --------------------------------------------------------------------------- #
def ask_question(question: str, senso_key: str) -> dict:
    hdr = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    resp = requests.post(
        f"{SENSO_API}/search",
        headers=hdr,
        json={"query": question, "max_results": 5},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def render_answer(payload: dict) -> None:
    console.rule("[bold green]Answer")
    console.print(payload["answer"], style="yellow")

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Score", style="cyan", justify="right", width=6)
    table.add_column("Title", width=24)
    table.add_column("Excerpt", overflow="fold")

    for res in payload["results"]:
        score = f"{res['score']:.3f}"
        table.add_row(score, res["title"], res["chunk_text"].strip())

    console.print(table)
    console.print()

# --------------------------------------------------------------------------- #
# Main driver                                                                 #
# --------------------------------------------------------------------------- #
def ingest_descriptor(
    descriptor: str,
    actor_input: Dict[str, Any],
    senso_key: str,
    apify_token: str,
) -> str:
    console.print(f"\n[bold]Fetching TikTok data for:[/bold] {descriptor}")
    items = run_apify_actor(actor_input, apify_token)
    if not items:
        console.print(f":warning: No TikTok records returned for {descriptor}")
        return ""

    markdown = items_to_markdown(descriptor, items)
    console.print(f"→ formatted {len(items)} items into {len(markdown):,} characters")

    console.print("Uploading to Senso …")
    cid = create_raw_content(descriptor, markdown, senso_key)
    console.print(f"→ content_id = {cid}")
    wait_until_indexed(cid, senso_key)
    return cid


def main(args: argparse.Namespace) -> None:
    senso_key = os.getenv("SENSO_KEY")
    apify_token = os.getenv("APIFY_TOKEN")
    if not senso_key or not apify_token:
        console.print(":warning:  Set SENSO_KEY and APIFY_TOKEN env vars first.")
        sys.exit(1)

    profiles = list(args.profiles or [])
    hashtags = list(args.hashtags or [])
    search_queries = list(args.search_queries or [])

    if not profiles and not hashtags and not search_queries:
        console.print(
            "\n[bold]No descriptors provided.[/bold] Enter comma-separated values or press Enter to skip."
        )

        def prompt_list(label: str) -> List[str]:
            raw = console.input(f"[bold blue]{label}: [/bold blue]").strip()
            if not raw:
                return []
            return [item.strip() for item in raw.split(",") if item.strip()]

        profiles = prompt_list("TikTok profiles")
        hashtags = prompt_list("TikTok hashtags (no #)")
        search_queries = prompt_list("TikTok search queries")

    descriptors: List[str] = []
    actor_inputs: List[Dict[str, Any]] = []

    def build_actor_input(field: str, value: str) -> Dict[str, Any]:
        base: Dict[str, Any] = {
            field: [value],
            "resultsPerPage": args.results_per,
            "shouldDownloadVideos": True,
            "shouldDownloadAvatars": False,
            "shouldDownloadCovers": False,
            "shouldDownloadMusicCovers": False,
            "shouldDownloadSlideshowImages": False,
            "shouldDownloadSubtitles": False,
            "proxyCountryCode": "US",
        }
        if field == "profiles":
            base.update(
                {
                    "scrapeRelatedVideos": False,
                    "excludePinnedPosts": False,
                    "profileScrapeSections": ["videos"],
                    "profileSorting": "latest",
                }
            )
        return base

    def append_inputs(values: Iterable[str], field: str, label: str) -> None:
        for value in values:
            if not value:
                continue
            descriptors.append(f"{label} {value}")
            actor_inputs.append(build_actor_input(field, value))

    append_inputs(profiles, "profiles", "Profile")
    append_inputs(hashtags, "hashtags", "Hashtag")
    append_inputs(search_queries, "searchQueries", "Search")

    if not descriptors:
        console.print(":warning: Provide at least one profile, hashtag, or search query.")
        sys.exit(1)

    content_ids = []
    for descriptor, actor_input in zip(descriptors, actor_inputs):
        cid = ingest_descriptor(descriptor, actor_input, senso_key, apify_token)
        if cid:
            content_ids.append(cid)

    if not content_ids:
        console.print(":x: No content ingested; exiting.")
        sys.exit(1)

    console.print("\n[bold green]Ready![/bold green] Ask me anything "
                  "(type 'exit' to quit).\n")
    while True:
        try:
            q = console.input("[bold blue]> [/bold blue]").strip()
        except (KeyboardInterrupt, EOFError):
            console.print()
            break
        if not q or q.lower() in ("exit", "quit"):
            break
        payload = ask_question(q, senso_key)
        render_answer(payload)

    console.print("Goodbye 👋")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Ingest TikTok data via Apify into Senso and open a search prompt."
    )
    parser.add_argument("--profiles", nargs="*", default=[], help="TikTok usernames to scrape.")
    parser.add_argument("--hashtags", nargs="*", default=[], help="TikTok hashtags without #.")
    parser.add_argument("--search-queries", nargs="*", default=[], help="Free-text TikTok search queries.")
    parser.add_argument(
        "--results-per",
        type=int,
        default=5,
        help="Number of videos to fetch per descriptor (1-1000000).",
    )
    main(parser.parse_args())

#!/usr/bin/env python3
"""
CLI Content Repurposer
Scrape a single blog article → ingest as **raw** content in Senso →
generate a tweet thread, LinkedIn blurb, and email teaser (all saved).

USAGE
  export SENSO_KEY="sk_prod_xxx"
  export FIRECRAWL_KEY="fc_live_xxx"
  python cli_repurpose.py https://medium.com/data-science/top-10-data-ai-trends-for-2025-4ed785cafe16
"""

import argparse
import os
import sys
import time
from typing import Dict, Tuple

import requests
from rich.console import Console
from rich.table import Table

# --------------------------------------------------------------------------- #
# Config                                                                      #
# --------------------------------------------------------------------------- #
SENSO_API     = "https://sdk.senso.ai/api/v1"
FIRECRAWL_API = "https://api.firecrawl.dev/v1/scrape"
POLL_INTERVAL = 3  # seconds

console = Console()

# --------------------------------------------------------------------------- #
# Firecrawl helper                                                            #
# --------------------------------------------------------------------------- #
def scrape(url: str, fc_key: str) -> Tuple[str, str]:
    payload = {"url": url, "formats": ["markdown"], "onlyMainContent": True}
    headers = {"Authorization": f"Bearer {fc_key}", "Content-Type": "application/json"}

    resp = requests.post(FIRECRAWL_API, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    outer = resp.json()

    if not outer.get("success"):
        raise RuntimeError(f"Firecrawl failed for {url}: {outer}")

    data = outer["data"]
    title = data["metadata"].get("title") or url
    markdown = data["markdown"]
    return title, markdown

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
def main(url: str) -> None:
    senso_key = os.getenv("SENSO_KEY")
    fc_key = os.getenv("FIRECRAWL_KEY")
    if not senso_key or not fc_key:
        console.print(":warning:  Set SENSO_KEY and FIRECRAWL_KEY env vars first.")
        sys.exit(1)

    console.print(f"[bold]Scraping blog:[/bold] {url}")
    title, md = scrape(url, fc_key)
    console.print(f"→ got {len(md):,} chars")

    console.print("Uploading article to Senso …")
    cid = post_raw(title, md, senso_key)
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
        description="Repurpose a blog article into multiple marketing assets."
    )
    parser.add_argument("url", help="URL of the blog post")
    args = parser.parse_args()
    main(args.url)

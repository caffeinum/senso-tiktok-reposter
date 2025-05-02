#!/usr/bin/env python3
"""
CLI Support Hub
Crawl one or more public URLs → ingest them as **raw** content in Senso →
wait until they are searchable → open an interactive Q&A prompt.

USAGE
  export SENSO_KEY="sk_prod_xxx"
  export FIRECRAWL_KEY="fc_live_xxx"
  python cli_support_hub.py https://platform.openai.com/docs/api-reference/introduction https://platform.openai.com/docs/quickstart?api-mode=responses
"""

import argparse
import os
import sys
import time
from typing import List, Tuple

import requests
from rich.console import Console
from rich.table import Table

# --------------------------------------------------------------------------- #
# Config (feel free to tweak)                                                 #
# --------------------------------------------------------------------------- #
SENSO_API     = "https://sdk.senso.ai/api/v1"
FIRECRAWL_API = "https://api.firecrawl.dev/v1/scrape"
POLL_INTERVAL = 3          # seconds between status checks

console = Console()

# --------------------------------------------------------------------------- #
# Firecrawl helpers                                                           #
# --------------------------------------------------------------------------- #
def scrape_url(url: str, fc_key: str) -> Tuple[str, str]:
    """
    Return (title, markdown_text) for the given URL, using Firecrawl.
    """
    payload = {"url": url, "formats": ["markdown"], "onlyMainContent": True}
    headers = {"Authorization": f"Bearer {fc_key}", "Content-Type": "application/json"}

    resp = requests.post(FIRECRAWL_API, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    if not data.get("success"):
        raise RuntimeError(f"Firecrawl failed for {url}: {data}")

    inner = data["data"]
    markdown = inner["markdown"]
    title = inner["metadata"].get("title") or url
    return title, markdown

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
def main(urls: List[str]) -> None:
    senso_key = os.getenv("SENSO_KEY")
    fc_key = os.getenv("FIRECRAWL_KEY")
    if not senso_key or not fc_key:
        console.print(":warning:  Set SENSO_KEY and FIRECRAWL_KEY env vars first.")
        sys.exit(1)

    # 1) Scrape & ingest each URL
    content_ids = []
    for url in urls:
        console.print(f"\n[bold]Scraping:[/bold] {url}")
        title, markdown = scrape_url(url, fc_key)
        console.print(f"→ got {len(markdown):,} characters of markdown")

        console.print("Uploading to Senso …")
        cid = create_raw_content(title, markdown, senso_key)
        console.print(f"→ content_id = {cid}")
        content_ids.append(cid)

    # 2) Wait for indexing
    for cid in content_ids:
        wait_until_indexed(cid, senso_key)

    # 3) Interactive search loop
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
        description="Ingest URLs into Senso and open a search prompt.")
    parser.add_argument("urls", nargs="+", help="One or more http(s) URLs")
    args = parser.parse_args()
    main(args.urls)

#!/usr/bin/env python3
"""
Simple URL ingestion helper.

Usage:
  export SENSO_KEY="sk_prod_xxx"
  python ingest_urls.py https://docs.senso.ai/introduction https://example.com
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from typing import List, Tuple

import requests
from bs4 import BeautifulSoup
from rich.console import Console

SENSO_API = "https://sdk.senso.ai/api/v1"

console = Console()


def fetch_url(url: str, timeout: int = 60) -> Tuple[str, str]:
    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    title = soup.title.string.strip() if soup.title and soup.title.string else url
    body = soup.get_text(separator="\n", strip=True)
    markdown = f"# {title}\n\nSource: {url}\n\n{body}"
    return title, markdown


def create_raw_content(title: str, text: str, senso_key: str) -> str:
    hdr = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    resp = requests.post(
        f"{SENSO_API}/content/raw",
        headers=hdr,
        json={
            "title": title,
            "text": text,
            "summary": f"Ingested from {title}",
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["id"]


def wait_until_indexed(content_id: str, senso_key: str, poll_seconds: int = 3) -> None:
    hdr = {"X-API-Key": senso_key}
    status = ""
    with console.status(f"[cyan]Processing {content_id} …[/cyan]"):
        while status not in ("completed", "failed"):
            resp = requests.get(
                f"{SENSO_API}/content/{content_id}",
                headers=hdr,
                timeout=30,
            )
            resp.raise_for_status()
            status = resp.json()["processing_status"]
            if status not in ("completed", "failed"):
                time.sleep(poll_seconds)
    if status == "failed":
        raise RuntimeError(f"Senso indexing failed for {content_id}")


def ingest_urls(urls: List[str], senso_key: str) -> None:
    for url in urls:
        console.print(f"\n[bold]Fetching:[/bold] {url}")
        title, markdown = fetch_url(url)
        console.print(f"→ got {len(markdown):,} characters")

        console.print("Uploading to Senso …")
        content_id = create_raw_content(title, markdown, senso_key)
        wait_until_indexed(content_id, senso_key)
        console.print(f":white_check_mark: Ingested as content {content_id}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ingest one or more URLs into Senso as raw content."
    )
    parser.add_argument("urls", nargs="+", help="HTTP(S) URLs to fetch and ingest.")
    args = parser.parse_args()

    senso_key = os.getenv("SENSO_KEY")
    if not senso_key:
        console.print(":warning:  Set SENSO_KEY env var first.")
        sys.exit(1)

    ingest_urls(args.urls, senso_key)


if __name__ == "__main__":
    main()

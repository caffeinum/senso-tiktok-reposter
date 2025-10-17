#!/usr/bin/env python3
"""
Quick helper to read content stored in Senso.

Usage examples:
  export SENSO_KEY="sk_prod_xxx"
  python read_senso.py --content-id d4b0471a-03e3-48f4-88f5-cfcbeca48806
  python read_senso.py --search "What is the Senso SDK?"
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Any, Dict, List

import requests

SENSO_API = "https://sdk.senso.ai/api/v1"


def require_api_key() -> str:
    senso_key = os.getenv("SENSO_KEY")
    if not senso_key:
        raise SystemExit("Set SENSO_KEY in your environment first.")
    return senso_key


def fetch_content(content_id: str, senso_key: str) -> Dict[str, Any]:
    headers = {"X-API-Key": senso_key}
    resp = requests.get(f"{SENSO_API}/content/{content_id}", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def search(query: str, senso_key: str, max_results: int = 3) -> Dict[str, Any]:
    headers = {"X-API-Key": senso_key, "Content-Type": "application/json"}
    payload = {"query": query, "max_results": max_results}
    resp = requests.post(f"{SENSO_API}/search", headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def summarize_content(data: Dict[str, Any]) -> str:
    title = data.get("title", "Untitled")
    summary = data.get("summary") or ""
    status = data.get("processing_status", "unknown")
    content_id = data.get("id") or data.get("content_id", "unknown")
    created_at = data.get("created_at", "N/A")
    return (
        f"Content ID : {content_id}\n"
        f"Title      : {title}\n"
        f"Status     : {status}\n"
        f"Created At : {created_at}\n"
        f"Summary    : {summary}\n"
    )


def render_search_results(results: List[Dict[str, Any]]) -> str:
    if not results:
        return "No results."
    lines = []
    for idx, item in enumerate(results, start=1):
        score = item.get("score", 0.0)
        title = item.get("title", "Untitled")
        chunk = (item.get("chunk_text") or "").strip().replace("\n", " ")
        content_id = item.get("content_id", "unknown")
        lines.append(
            f"[{idx}] ({score:.3f}) {title}\n"
            f"    content_id: {content_id}\n"
            f"    excerpt   : {chunk[:200]}{'…' if len(chunk) > 200 else ''}"
        )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Read content from Senso via /content/{id} or /search."
    )
    parser.add_argument("--content-id", help="Fetch a specific content object by ID.")
    parser.add_argument("--search", help="Run a semantic search query.")
    parser.add_argument("--max-results", type=int, default=3, help="Limit search hits.")
    args = parser.parse_args()

    if not args.content_id and not args.search:
        parser.print_help()
        sys.exit(1)

    senso_key = require_api_key()

    if args.content_id:
        data = fetch_content(args.content_id, senso_key)
        print(summarize_content(data))
        text = data.get("text")
        if text:
            print("--- Text (first 800 chars) ---")
            preview = text[:800].rstrip()
            print(preview + ("…" if len(text) > 800 else ""))

    if args.search:
        payload = search(args.search, senso_key, args.max_results)
        print("\n=== Search Answer ===")
        answer = payload.get("answer") or "<no answer>"
        print(answer.strip())
        print("\n=== Top Results ===")
        print(render_search_results(payload.get("results", [])))


if __name__ == "__main__":
    main()

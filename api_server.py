#!/usr/bin/env python3

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI(title="TikTok Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.railway.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SENSO_API = "https://sdk.senso.ai/api/v1"
APIFY_RUN_SYNC_ITEMS = "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items"

class TikTokSearchRequest(BaseModel):
    profiles: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    search_queries: Optional[List[str]] = None
    results_per: int = 5

class TikTokVideo(BaseModel):
    id: str
    url: str
    downloadUrl: Optional[str]
    caption: str
    author: str
    views: Optional[int]
    likes: Optional[int]
    comments: Optional[int]
    thumbnail: Optional[str]

def run_apify_actor(actor_input: dict, token: str, timeout: int = 120) -> List[dict]:
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

@app.post("/api/tiktok/search")
async def search_tiktok(request: TikTokSearchRequest):
    apify_token = os.getenv("APIFY_TOKEN")
    if not apify_token:
        raise HTTPException(status_code=500, detail="APIFY_TOKEN not configured")

    profiles = request.profiles or []
    hashtags = request.hashtags or []
    search_queries = request.search_queries or []

    if not profiles and not hashtags and not search_queries:
        raise HTTPException(status_code=400, detail="Provide at least one profile, hashtag, or search query")

    all_videos = []

    def build_actor_input(field: str, value: str) -> dict:
        base = {
            field: [value],
            "resultsPerPage": request.results_per,
            "shouldDownloadVideos": True,
            "shouldDownloadAvatars": False,
            "shouldDownloadCovers": False,
            "shouldDownloadMusicCovers": False,
            "shouldDownloadSlideshowImages": False,
            "shouldDownloadSubtitles": False,
            "proxyCountryCode": "US",
        }
        if field == "profiles":
            base.update({
                "scrapeRelatedVideos": False,
                "excludePinnedPosts": False,
                "profileScrapeSections": ["videos"],
                "profileSorting": "latest",
            })
        return base

    for profile in profiles:
        actor_input = build_actor_input("profiles", profile)
        items = run_apify_actor(actor_input, apify_token)
        all_videos.extend(items)

    for hashtag in hashtags:
        actor_input = build_actor_input("hashtags", hashtag)
        items = run_apify_actor(actor_input, apify_token)
        all_videos.extend(items)

    for query in search_queries:
        actor_input = build_actor_input("searchQueries", query)
        items = run_apify_actor(actor_input, apify_token)
        all_videos.extend(items)

    formatted_videos = []
    for item in all_videos:
        video_meta = item.get("videoMeta") or {}
        author_meta = item.get("authorMeta") or {}
        
        formatted_videos.append({
            "id": item.get("id", "unknown"),
            "url": item.get("webVideoUrl") or "",
            "downloadUrl": video_meta.get("downloadAddr"),
            "caption": (item.get("text") or "").strip(),
            "author": author_meta.get("nickName") or author_meta.get("name") or "unknown",
            "views": item.get("playCount"),
            "likes": item.get("diggCount"),
            "comments": item.get("commentCount"),
            "thumbnail": video_meta.get("coverUrl")
        })

    return {"videos": formatted_videos}

@app.get("/health")
async def health():
    return {"status": "ok"}

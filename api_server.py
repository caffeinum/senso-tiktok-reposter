#!/usr/bin/env python3

import os
import tempfile
import subprocess
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests

app = FastAPI(title="TikTok Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class GenerateVideoRequest(BaseModel):
    video_url: str
    logo_url: str
    caption: str

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

@app.post("/api/video/generate")
async def generate_branded_video(request: GenerateVideoRequest):
    tmpdir = tempfile.mkdtemp()
    video_path = os.path.join(tmpdir, "input.mp4")
    logo_raw_path = os.path.join(tmpdir, "logo_raw")
    logo_path = os.path.join(tmpdir, "logo.png")
    output_path = os.path.join(tmpdir, "output.mp4")
    
    try:
        video_resp = requests.get(request.video_url, timeout=60)
        video_resp.raise_for_status()
        with open(video_path, "wb") as f:
            f.write(video_resp.content)
        
        logo_resp = requests.get(request.logo_url, timeout=30)
        logo_resp.raise_for_status()
        with open(logo_raw_path, "wb") as f:
            f.write(logo_resp.content)
        
        if request.logo_url.endswith(".svg"):
            convert_result = subprocess.run(
                ["magick", logo_raw_path, "-background", "none", logo_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            if convert_result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Logo conversion failed: {convert_result.stderr}")
        else:
            os.rename(logo_raw_path, logo_path)
        
        caption_escaped = request.caption.replace("'", "'\\''").replace(":", "\\:")
        
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-i", video_path, "-i", logo_path,
            "-filter_complex",
            (
                f"[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p[vid];"
                f"[vid]drawbox=y=ih-300:color=black@0.6:width=iw:height=300:t=fill[vid_grad];"
                f"[vid_grad]drawtext=text='{caption_escaped}':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-250:borderw=2:bordercolor=black[vid_text];"
                f"[1:v]scale=200:-1[logo];"
                f"[vid_text][logo]overlay=x=(W-w)/2:y=H-150[final]"
            ),
            "-map", "[final]",
            "-map", "0:a?",
            "-c:v", "libx264",
            "-preset", "fast",
            "-c:a", "copy",
            "-t", "30",
            output_path
        ]
        
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"FFmpeg failed: {result.stderr}")
        
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Output file not created")
        
        return FileResponse(
            output_path,
            media_type="video/mp4",
            filename="branded_video.mp4",
            background=None
        )
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Video processing timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

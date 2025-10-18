# Senso SDK • Example CLIs + API 🚀

scripts and fastapi wrapper showing what you can build with the Senso API.

| Demo | What it does | Key Senso endpoints |
|------|--------------|---------------------|
| **`api_server.py`** | FastAPI wrapper for TikTok search with CORS support for frontend integration. | `/api/tiktok/search` |
| **`tiktok-search/cli_tiktok_search.py`** | Pull TikTok data through Apify, ingest it as **raw** content, then open an interactive terminal search. | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/search` |
| **`tiktok-repurpose/cli_tiktok_repurpose.py`** | Fetch TikTok clips, ingest them, then autogenerate a tweet-thread, LinkedIn post, and email teaser (all saved). | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/generate` |
| **`ingest_urls.py`** | Fetch arbitrary web pages, convert to markdown, and ingest them as **raw** content. | `/content/raw` &nbsp; `/content/{id}` |

Apify handles the TikTok scraping (downloading videos and metadata); Senso handles indexing, search, and generation.

---

## quick start

### fastapi server

```bash
# copy env and add your keys
cp .env.example .env

# start api server (uses uv)
./start_api.sh

# api available at http://localhost:8000
# docs at http://localhost:8000/docs
```

### deploy to railway

see [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for full deployment guide

```bash
railway init
railway variables set APIFY_TOKEN=xxx
railway variables set SENSO_KEY=xxx
railway up
```

### cli scripts

```bash
# API keys
export SENSO_KEY="sk_prod_xxx"
export APIFY_TOKEN="apify_api_xxx"

# deps
pip install -r requirements.txt

# 1) TikTok search (profiles, hashtags, search queries)
python tiktok-search/cli_tiktok_search.py --profiles tiktok

# 2) TikTok repurposer (TikTok -> marketing assets)
python tiktok-repurpose/cli_tiktok_repurpose.py --profile tiktok

# 3) URL ingestion (raw web pages -> Senso)
uv run --with requests --with beautifulsoup4 --env-file .env python ingest_urls.py https://docs.senso.ai/introduction

# 4) Inspect stored content as JSON
uv run --with requests --env-file .env python read_senso.py --content-id <id> --json
```

each script streams progress, polls until Senso has indexed the content, and prints prettified results in your terminal.

meow ✨

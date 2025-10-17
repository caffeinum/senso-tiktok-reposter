# Senso SDK • Example CLIs 🚀

Two tiny scripts that show what you can build with the Senso API in under 200 LOC.

| Demo | What it does | Key Senso endpoints |
|------|--------------|---------------------|
| **`tiktok-search/cli_tiktok_search.py`** | Pull TikTok data through Apify, ingest it as **raw** content, then open an interactive terminal search. | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/search` |
| **`tiktok-repurpose/cli_tiktok_repurpose.py`** | Fetch TikTok clips, ingest them, then autogenerate a tweet-thread, LinkedIn post, and email teaser (all saved). | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/generate` |
| **`ingest_urls.py`** | Fetch arbitrary web pages, convert to markdown, and ingest them as **raw** content. | `/content/raw` &nbsp; `/content/{id}` |

Apify handles the TikTok scraping (downloading videos and metadata); Senso handles indexing, search, and generation.

---

## Quick start

```bash
git clone https://github.com/senso-ai/examples.git
cd examples

# API keys
export SENSO_KEY="sk_prod_xxx"
export APIFY_TOKEN="apify_api_xxx"

# deps
pip install -r requirements.txt        # requests, rich, beautifulsoup4

# 1) TikTok search (profiles, hashtags, search queries)
#    omit the flags to enter values interactively
python tiktok-search/cli_tiktok_search.py --profiles tiktok

# 2) TikTok repurposer (TikTok -> marketing assets)
#    omit the flags to choose a source interactively
python tiktok-repurpose/cli_tiktok_repurpose.py --profile tiktok

# 3) URL ingestion (raw web pages -> Senso)
uv run --with requests --with beautifulsoup4 --env-file .env python ingest_urls.py https://docs.senso.ai/introduction

# 4) Inspect stored content as JSON
uv run --with requests --env-file .env python read_senso.py --content-id <id> --json
```

Each script streams progress, polls until Senso has indexed the content, and prints prettified results in your terminal.

Happy hacking! ✨

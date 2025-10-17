# TikTok Repurposer CLI

Transform scraped TikTok clips into downstream marketing assets. The script pulls one profile/hashtag/query via Apify, stores the raw payload in Senso, then prompts `/generate` to create a tweet thread, LinkedIn post, and email teaser that stay attached to the same workspace.

```
Apify TikTok Scraper → Senso /content/raw → Senso /generate (tweet • LinkedIn • email)
```

## Run It

```bash
export SENSO_KEY="sk_prod_xxx"
export APIFY_TOKEN="apify_api_xxx"
pip install requests rich

python cli_tiktok_repurpose.py --profile tiktok --results 3
```

Choose exactly one of `--profile`, `--hashtag`, or `--search-query`. Omit the flags to pick interactively.

## What You Get

1. **Ingestion summary** with `videoMeta.downloadAddr` and `mediaUrls` for every clip.
2. **Three saved assets** (tweet thread, LinkedIn, email) returned by `/generate` with their own `content_id`s.
3. **Previews** in the console so you can sanity-check before sharing.

## Senso Endpoints

| Purpose           | Endpoint                 |
|-------------------|--------------------------|
| store raw payload | `POST /content/raw`      |
| poll ingestion    | `GET /content/{content_id}` |
| generate assets   | `POST /generate`         |

## Extend It

- Swap prompts or add more generations (e.g., Instagram captions, TikTok scripts).
- Post-process the JSON payload to drive video download, transcription, or scheduling.
- Pair with `read_senso.py --json` to inspect outputs directly from Senso.

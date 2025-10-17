# TikTok Search CLI

Ingest TikTok profiles, hashtags, or search results into Senso with a single command, then interrogate the content through an interactive terminal prompt. Apify handles scraping (including optional video downloads) while Senso indexes, searches, and streams the answers.

```
Apify TikTok Scraper → Senso /content/raw → Senso /search
```

## Workflow

1. **Collect data** with the [Apify TikTok Scraper](https://apify.com/clockworks/tiktok-scraper), requesting downloadable video links and metadata.
2. **Persist** the payload to `POST /content/raw`; each record includes the raw JSON plus a concise preview.
3. **Poll** `GET /content/{id}` until indexing completes.
4. **Chat** via `POST /search` from an interactive REPL with scored citations.

## Run It

```bash
export SENSO_KEY="sk_prod_xxx"
export APIFY_TOKEN="apify_api_xxx"
pip install requests rich

python cli_tiktok_search.py --profiles tiktok --results-per 5
```

Skip the flags to enter profiles, hashtags, or search queries interactively. Each ingested record stores Apify's `videoMeta.downloadAddr` and `mediaUrls` so you can retrieve the MP4s later.

## Use Cases

- Build an internal search demo over trending TikTok clips.
- Rapidly prototype retrieval-augmented TikTok assistants.
- Inspect ingestion latency and preview the stored JSON payloads.

## Endpoints Touched

| Purpose       | Endpoint                  |
|---------------|---------------------------|
| create content | `POST /content/raw`       |
| poll status    | `GET /content/{content_id}` |
| semantic Q&A   | `POST /search`            |

## Next Steps

- Combine with `read_senso.py --json` to inspect the stored documents.
- Pipe specific `videoMeta.downloadAddr` links into a downloader or summariser.

# Support Hub Loader & Instant Search

Turn any collection of public help pages into a single semantic search bar—right from your terminal.

```
SOURCE (website) → SENSO (ingest, index) → DESTINATION (terminal answers)
```

## What this does

1. **Scrape URLs** with the [Firecrawl API](https://docs.firecrawl.dev/api-reference/introduction).  
2. **Upload** each page’s markdown as **raw** content: `POST /content/raw`.  
3. **Poll** `GET /content/{id}` every 3s until `processing_status == completed`.  
4. Open an **interactive prompt** that sends your questions to `POST /search` and prints the AI answer plus cited chunks.

## Why you might run it

* Consolidate scattered FAQ / docs into one searchable workspace.  
* Observe every ingestion step, not just the end result.  
* Fork a minimal, dependency-light demo and extend it in minutes.

## Endpoints used

| Purpose | Endpoint |
|---------|----------|
| create content | `POST /content/raw` |
| poll status   | `GET  /content/{content_id}` |
| semantic Q&A  | `POST /search` |

## Prerequisites

```bash
export SENSO_KEY="sk_prod_xxx"      # from your “Senso Platform Access” email
export FIRECRAWL_KEY="fc_live_xxx"  # create at firecrawl.dev
pip install requests rich
```

## Running

```bash
python cli_support_hub.py https://platform.openai.com/docs/api-reference/introduction https://platform.openai.com/docs/quickstart?api-mode=responses
```

When you see `✓ Indexed`, start asking questions (type `exit` to quit).

## What you’ll learn

* Full life-cycle of a **raw** content object.  
* Real-world timings for chunking & vectorisation.  
* How `/search` cites specific content IDs for traceability.
* A reusable pattern: **post → poll → act**.

## Source code

The script lives in this repo:  
🔗 https://github.com/senso-ai/examples/blob/main/cli_support_hub.py
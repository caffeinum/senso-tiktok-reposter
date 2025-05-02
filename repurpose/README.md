# Automated Content Repurposer

Feed a single blog-post URL in and get a tweet thread, LinkedIn post, and email teaser out—each auto-saved in Senso for later approval.

```
SOURCE (blog) → SENSO (ingest, generate, store) → DESTINATION (marketer)
```

## What this does

1. **Scrape** the article with Firecrawl.  
2. **Ingest** it as **raw** content: `POST /content/raw`; poll until ready.  
3. Call **`POST /generate`** three times (tweet thread, LinkedIn blurb, email teaser) with `"save": true`.  
4. Print the generated copy and the new `content_id`s so you can edit or publish later.

## Why you might run it

* You publish long-form articles but need bite-sized derivatives for social.  
* You want to see how `/generate` can create **and** persist new content.  
* You’re curious how Senso traces every generated sentence back to sources.

## Endpoints used

| Purpose          | Endpoint |
|------------------|----------|
| create content   | `POST /content/raw` |
| poll status      | `GET  /content/{content_id}` |
| generate assets  | `POST /generate` |
| (optional) fetch | `GET  /content/{generated_id}` |

## Prerequisites

```bash
export SENSO_KEY="sk_prod_xxx"
export FIRECRAWL_KEY="fc_live_xxx"
pip install requests rich
```

## Running

```bash
python cli_repurpose.py https://medium.com/data-science/top-10-data-ai-trends-for-2025-4ed785cafe16
```

Typical output:

```
✓ Blog indexed (content_id = 4f1b…)
✓ Generated tweet thread  (saved as content 58a2…)
✓ Generated LinkedIn post (saved as content 5b77…)
✓ Generated email teaser  (saved as content 5c42…)
```

## What you’ll learn

* Polling the ingestion pipeline instead of arbitrary sleeps.  
* Crafting prompt instructions for different asset types.  
* The distinction between transient vs. persisted generation.  
* End-to-end traceability from source article to generated copy.

## Source code

See the script here:  
🔗 https://github.com/senso-ai/examples/blob/main/cli_repurpose.py
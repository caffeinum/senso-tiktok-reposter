# Senso SDK • Example CLIs 🚀

Two tiny scripts that show what you can build with the Senso API in under 200 LOC.

| Demo | What it does | Key Senso endpoints |
|------|--------------|---------------------|
| **`cli_support_hub.py`** | Crawl public help pages, ingest them as **raw** content, then open an interactive terminal search. | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/search` |
| **`cli_repurpose.py`** | Scrape one blog post, ingest it, then autogenerate a tweet-thread, LinkedIn post, and email teaser (all saved). | `/content/raw` &nbsp; `/content/{id}` &nbsp; `/generate` |

Firecrawl is used for page scraping; Senso handles indexing, search, and generation.

---

## Quick start

```bash
git clone https://github.com/senso-ai/examples.git
cd examples

# API keys
export SENSO_KEY="sk_prod_xxx"
export FIRECRAWL_KEY="fc_live_xxx"

# deps
pip install -r requirements.txt        # requests, rich

# 1) Support hub search
python cli_support_hub.py https://docs.acme.com/faq

# 2) Content repurposer
python cli_repurpose.py https://blog.acme.com/ai-trends-2025
```

Each script streams progress, polls until Senso has indexed the content, and prints prettified results in your terminal.

Happy hacking! ✨
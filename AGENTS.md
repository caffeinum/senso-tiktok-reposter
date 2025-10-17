# Repository Guidelines

## Project Structure & Module Organization
- `repurpose/`: houses `cli_repurpose.py` and its README; focuses on ingesting TikTok datasets and generating follow-on assets.
- `support-hub/`: contains `cli_support_hub.py` and documentation for the interactive search workflow backed by TikTok data.
- Root files: `read_senso.py`, `README.md`, and `LICENSE`. Keep helpers near their scripts; extract to `common/` when they exceed 50 lines.

## Setup, Build & Run
- `python -m venv .venv && source .venv/bin/activate`: recommended isolated environment.
- `pip install requests rich`: installs current runtime dependencies; pin versions when adding new libs.
- `python support-hub/cli_support_hub.py --profiles tiktok --results-per 3`: fetch TikTok clips through Apify (forces video downloads), ingest, and open the search loop. Run without flags to be prompted for profiles/hashtags/queries.
- `python repurpose/cli_repurpose.py --profile tiktok --results 3`: run the repurposing pipeline and persist generated assets. Run without flags to pick the source interactively.
- `uv run --with requests --with rich --env-file .env python read_senso.py --content-id <id>`: one-shot execution with ephemeral deps and environment loading.

## Coding Style & Naming Conventions
- Python 3.10+, 4-space indentation, type hints on new functions that touch API boundaries.
- Follow PEP 8 naming (`snake_case` for functions/vars, `PascalCase` for classes). Keep script entrypoints lean and move logic into well-named helpers.
- Run `python -m compileall` on touched modules before opening a PR if you added new files; lint with `ruff check .` when available.

## Testing Guidelines
- Favor focused integration scripts under `tests/` (create if absent) that hit the live Senso endpoints with mockable keys.
- Mirror CLI scenarios in tests by parametrizing representative URLs. Name files `test_<module>.py`.
- Before merging, manually run both CLIs against a staging endpoint and capture console output for reviewers.

## Commit & Pull Request Guidelines
- Follow the existing history: short, imperative subject lines with optional leading emoji (e.g., `:sparkles: add support hub filters`).
- Squash work-in-progress commits locally. Reference GitHub issues or task IDs in the body.
- PRs should include: 1) motivation & summary, 2) setup or env changes, 3) screenshots or terminal snippets from the CLI runs, 4) checklist confirming tests and linting.
- Request review from a second agent when touching shared utilities or auth handling; highlight any new environment variables and secrets handling.

## Security & Configuration Tips
- Never commit `SENSO_KEY`, `APIFY_TOKEN`, or other secrets; load them via environment variables or `.env`.
- `.env` should track Senso keys, `APIFY_TOKEN`, and optional `SENSO_ORG_ID`; confirm `.gitignore` still excludes it.
- Monitor Apify quotas (video downloads consume extra credits) and respect TikTok terms when tweaking scraper inputs.

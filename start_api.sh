#!/bin/bash
uv run --with fastapi --with uvicorn[standard] --with requests --with pydantic --env-file .env uvicorn api_server:app --reload --port 8000

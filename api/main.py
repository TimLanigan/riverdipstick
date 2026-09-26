import json
import re
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Riverdipstick", version="2.0.0")

STARS_PATH = Path("/data/stars.json")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DEFAULT = ["great-musgrave", "low-moor"]
lock = Lock()


class StarUpdate(BaseModel):
    starred: bool


def read_stars() -> list[str]:
    if not STARS_PATH.exists():
        write_stars(DEFAULT)
        return list(DEFAULT)
    data = json.loads(STARS_PATH.read_text())
    slugs = data.get("slugs", [])
    return [slug for slug in slugs if isinstance(slug, str) and SLUG.match(slug)]


def write_stars(slugs: list[str]) -> None:
    STARS_PATH.parent.mkdir(parents=True, exist_ok=True)
    STARS_PATH.write_text(json.dumps({"slugs": slugs}, indent=2) + "\n")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "riverdipstick", "version": "2.0.0"}


@app.get("/api/stars")
def get_stars() -> dict:
    with lock:
        return {"slugs": read_stars()}


@app.put("/api/stars/{slug}")
def put_star(slug: str, body: StarUpdate) -> dict:
    if not SLUG.match(slug):
        raise HTTPException(status_code=400, detail="bad slug")
    with lock:
        slugs = read_stars()
        if body.starred and slug not in slugs:
            slugs.append(slug)
        if not body.starred and slug in slugs:
            slugs.remove(slug)
        write_stars(slugs)
        return {"slugs": slugs}

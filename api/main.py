import json
import re
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Riverdipstick", version="2.0.0")

STARS_PATH = Path("/data/stars.json")
LEVELS_PATH = Path("/data/levels.json")
SERIES_PATH = Path("/data/series.json")
_series_cache = {"mtime": None, "payload": {"days": 7, "stations": {}}}
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


@app.get("/api/levels")
def get_levels() -> dict:
    if not LEVELS_PATH.exists():
        return {"stations": {}}
    try:
        data = json.loads(LEVELS_PATH.read_text())
    except json.JSONDecodeError:
        return {"stations": {}}
    stations = data.get("stations", {})
    if not isinstance(stations, dict):
        return {"stations": {}}
    clean = {}
    for station_id, row in stations.items():
        if not isinstance(station_id, str) or not isinstance(row, dict):
            continue
        level = row.get("level")
        at = row.get("at")
        if not isinstance(level, (int, float)) or not isinstance(at, str):
            continue
        clean[station_id] = {"level": level, "at": at}
    return {"fetched_at": data.get("fetched_at"), "stations": clean}


@app.get("/api/series")
def get_series() -> dict:
    if not SERIES_PATH.exists():
        return {"days": 7, "stations": {}}
    mtime = SERIES_PATH.stat().st_mtime
    if _series_cache["mtime"] != mtime:
        try:
            data = json.loads(SERIES_PATH.read_text())
        except json.JSONDecodeError:
            return {"days": 7, "stations": {}}
        days = data.get("days")
        stations = data.get("stations")
        if not isinstance(days, int) or not isinstance(stations, dict):
            return {"days": 7, "stations": {}}
        _series_cache["mtime"] = mtime
        _series_cache["payload"] = {
            "fetched_at": data.get("fetched_at"),
            "days": days,
            "stations": stations,
        }
    return _series_cache["payload"]


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

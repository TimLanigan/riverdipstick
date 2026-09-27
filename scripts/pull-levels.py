#!/usr/bin/env python3
"""Read levels from the live 1.0 database into JSON files the API can serve.

Read-only. The API container never gets an SSH key. A user timer runs this
every few minutes. Does not write to wintermute-db.

DAYS is how many 24-hour stretches the card chart shows, ending at the latest reading.
HISTORY_DAYS is what a station page can scroll back through. It is not sent with the homepage.
"""

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
LEVELS_OUT = DATA / "levels.json"
SERIES_OUT = DATA / "series.json"
HISTORY_OUT = DATA / "history.json"

# Card chart window. Exactly this many 24-hour stretches, ending at the
# latest reading. Not a control on the card.
DAYS = 5
# Loaded when a station page opens, so dragging back does not wait on the database.
HISTORY_DAYS = 14

LATEST_SQL = """
SELECT DISTINCT ON (station_id)
  station_id,
  level,
  to_char(timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
FROM readings
WHERE timestamp >= NOW() - INTERVAL '2 days'
  AND level IS NOT NULL
ORDER BY station_id, timestamp DESC
"""

HISTORY_SQL = f"""
SELECT station_id,
       floor(extract(epoch from timestamp))::bigint,
       level
FROM readings
WHERE timestamp >= NOW() - INTERVAL '{HISTORY_DAYS} days'
  AND level IS NOT NULL
ORDER BY station_id, timestamp
"""


def query(sql: str) -> str:
    # One remote string. Stdin is the query, so the shell never sees the SQL.
    remote = (
        "docker exec -i wintermute-db psql -U river_user -d river_levels_db "
        "-v ON_ERROR_STOP=1 -At -F $'\\t'"
    )
    result = subprocess.run(
        ["ssh", "-o", "ConnectTimeout=8", "edge", remote],
        input=sql,
        check=True,
        capture_output=True,
        text=True,
        timeout=60,
    )
    return result.stdout


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(payload, separators=(",", ":")) + "\n")
    tmp.replace(path)


def latest_levels(text: str) -> dict:
    stations = {}
    for line in text.splitlines():
        if not line.strip():
            continue
        station_id, level, at = line.split("\t")
        stations[station_id] = {"level": float(level), "at": at}
    return stations


def series(text: str) -> dict:
    stations = {}
    for line in text.splitlines():
        if not line.strip():
            continue
        station_id, epoch, level = line.split("\t")
        point = [int(epoch), float(level)]
        rows = stations.setdefault(station_id, [])
        if rows and rows[-1][0] == point[0]:
            rows[-1] = point
        else:
            rows.append(point)
    return stations


def recent(stations: dict, days: int) -> dict:
    cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
    return {
        station_id: [point for point in rows if point[0] >= cutoff]
        for station_id, rows in stations.items()
    }


def main() -> None:
    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    write_json(
        LEVELS_OUT,
        {"fetched_at": fetched_at, "stations": latest_levels(query(LATEST_SQL))},
    )
    history = series(query(HISTORY_SQL))
    write_json(
        HISTORY_OUT,
        {"fetched_at": fetched_at, "days": HISTORY_DAYS, "stations": history},
    )
    write_json(
        SERIES_OUT,
        {"fetched_at": fetched_at, "days": DAYS, "stations": recent(history, DAYS)},
    )


if __name__ == "__main__":
    main()

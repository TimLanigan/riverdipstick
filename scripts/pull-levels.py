#!/usr/bin/env python3
"""Read levels from the live 1.0 database into JSON files the API can serve.

Read-only. The API container never gets an SSH key. A user timer runs this
every few minutes. Does not write to wintermute-db.

DAYS is the card chart window. The series starts at UK midnight that many days ago.
"""

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
LEVELS_OUT = DATA / "levels.json"
SERIES_OUT = DATA / "series.json"

# Card chart window, in whole UK days. The line starts at midnight this
# many days ago, not at whatever clock time it is now. Not a control on the card.
DAYS = 3

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

SERIES_SQL = f"""
SELECT station_id,
       floor(extract(epoch from timestamp))::bigint,
       level
FROM readings
WHERE timestamp >= (
  date_trunc('day', NOW() AT TIME ZONE 'Europe/London')
  - INTERVAL '{DAYS} days'
) AT TIME ZONE 'Europe/London'
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


def main() -> None:
    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    write_json(
        LEVELS_OUT,
        {"fetched_at": fetched_at, "stations": latest_levels(query(LATEST_SQL))},
    )
    write_json(
        SERIES_OUT,
        {"fetched_at": fetched_at, "days": DAYS, "stations": series(query(SERIES_SQL))},
    )


if __name__ == "__main__":
    main()

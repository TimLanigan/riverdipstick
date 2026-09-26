#!/usr/bin/env python3
"""Read latest levels from the live 1.0 database and write data/levels.json.

Read-only. The API container never gets an SSH key; it only reads this file.
A user timer runs this every few minutes. Does not write to wintermute-db.
"""

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "levels.json"

SQL = """
SELECT DISTINCT ON (station_id)
  station_id,
  level,
  to_char(timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
FROM readings
WHERE timestamp >= NOW() - INTERVAL '2 days'
ORDER BY station_id, timestamp DESC
"""


def main() -> None:
    # One remote string. Stdin is the query, so the shell never sees the SQL.
    remote = (
        "docker exec -i wintermute-db psql -U river_user -d river_levels_db "
        "-v ON_ERROR_STOP=1 -At -F $'\\t'"
    )
    result = subprocess.run(
        ["ssh", "-o", "ConnectTimeout=8", "edge", remote],
        input=SQL,
        check=True,
        capture_output=True,
        text=True,
        timeout=40,
    )
    stations = {}
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        station_id, level, at = line.split("\t")
        stations[station_id] = {"level": float(level), "at": at}
    payload = {
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "stations": stations,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(payload, indent=2) + "\n")
    tmp.replace(OUT)


if __name__ == "__main__":
    main()

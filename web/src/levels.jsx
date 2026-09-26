import { createContext, useContext, useEffect, useState } from "react";

const LevelsContext = createContext({});

export function LevelsProvider({ children }) {
  const [levels, setLevels] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/levels")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setLevels(data.stations || {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return <LevelsContext.Provider value={levels}>{children}</LevelsContext.Provider>;
}

function formatWhen(iso) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(at);
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date());
  const day = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(at);
  return day === today ? time : `${day} ${time}`;
}

export function useLevelLine(stationId) {
  const levels = useContext(LevelsContext);
  const row = levels[stationId];
  if (!row) return "No level in the last 2 days";
  const metres = `${Number(row.level).toFixed(2)}m`;
  const when = formatWhen(row.at);
  return when ? `${metres} · ${when}` : metres;
}

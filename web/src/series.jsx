import { createContext, useContext, useEffect, useState } from "react";

const SeriesContext = createContext({ ready: false, days: 7, stations: {} });

export function SeriesProvider({ children }) {
  const [state, setState] = useState({ ready: false, days: 7, stations: {} });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/series")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setState({
          ready: true,
          days: data.days || 7,
          stations: data.stations || {},
        });
      })
      .catch(() => {
        if (!cancelled) setState((current) => ({ ...current, ready: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SeriesContext.Provider value={state}>{children}</SeriesContext.Provider>;
}

export function useSeries(stationId) {
  const { ready, days, stations } = useContext(SeriesContext);
  return { ready, days, points: stations[stationId] || [] };
}

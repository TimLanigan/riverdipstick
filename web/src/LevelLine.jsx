import { useEffect, useRef } from "react";
import { AreaSeries, ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { useSeries } from "./series.jsx";

// Filled blue, like a cross-section of the river. Raw readings, no spline.
// TradingView Lightweight Charts. The logo is off; the station page links to them.
// Times are shifted so the chart's UTC axis matches UK civil time. Otherwise the
// same day is labelled twice (midnight UTC and midnight in London).
const LINE = "#3d8bfd";

function londonAsUtc(unix) {
  const date = new Date(unix * 1000);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const pick = (type) => Number(parts.find((part) => part.type === type).value);
  return Math.floor(Date.UTC(pick("year"), pick("month") - 1, pick("day"), pick("hour"), pick("minute"), pick("second")) / 1000);
}

function toPoints(raw) {
  const points = [];
  for (const [time, value] of raw) {
    const shifted = londonAsUtc(time);
    if (points.length && points[points.length - 1].time === shifted) {
      points[points.length - 1].value = value;
    } else {
      points.push({ time: shifted, value });
    }
  }
  return points;
}

function dayMarks(points) {
  if (points.length === 0) return [];
  const start = points[0].time;
  const span = Math.max(points[points.length - 1].time - start, 1);
  const marks = [];
  let lastKey = "";
  for (const point of points) {
    const date = new Date(point.time * 1000);
    const key = date.toISOString().slice(0, 10);
    if (key === lastKey) continue;
    lastKey = key;
    const at = (point.time - start) / span;
    const day = date.getUTCDate();
    marks.push({
      key,
      at,
      align: at < 0.04 ? "start" : at > 0.92 ? "end" : "mid",
      label:
        day === 1
          ? new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }).format(date)
          : String(day),
    });
  }
  return marks;
}

export function LevelLine({ stationId, height = 168, interactive = false }) {
  const { ready, days, points } = useSeries(stationId);
  const ref = useRef(null);
  const marks = dayMarks(toPoints(points));

  useEffect(() => {
    if (!ready || points.length === 0 || !ref.current) return undefined;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8ea0bd",
        fontSize: 11,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: interactive, color: "rgba(255,255,255,0.06)" },
      },
      // Cards are the shape only. The metres live on the station page.
      leftPriceScale: { visible: false },
      rightPriceScale: {
        visible: interactive,
        borderVisible: false,
        alignLabels: false,
        entireTextOnly: true,
        scaleMargins: { top: 0.08, bottom: 0.04 },
      },
      timeScale: {
        visible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      localization: {
        locale: "en-GB",
        priceFormatter: (price) => Number(price).toFixed(2),
        timeFormatter: (time) =>
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "UTC",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(time * 1000)),
      },
      crosshair: interactive
        ? { mode: CrosshairMode.Magnet }
        : {
            mode: CrosshairMode.Hidden,
            vertLine: { visible: false, labelVisible: false },
            horzLine: { visible: false, labelVisible: false },
          },
      handleScroll: false,
      handleScale: false,
      kineticScroll: { touch: false, mouse: false },
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: LINE,
      topColor: "rgba(61, 139, 253, 0.38)",
      bottomColor: "rgba(61, 139, 253, 0.02)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: interactive,
    });
    series.setData(toPoints(points));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [ready, points, interactive]);

  if (!ready) return <div className="chart waiting" style={{ height }} />;
  if (points.length === 0) {
    return <p className="meta">No readings in the last {days} days.</p>;
  }
  return (
    <div className={interactive ? "chart live" : "chart"}>
      <div style={{ height }} ref={ref} />
      <div className="days">
        {marks.map((mark) => (
          <span key={mark.key} className={mark.align} style={{ left: `${mark.at * 100}%` }}>
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}

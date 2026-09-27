import { useEffect, useRef, useState } from "react";
import { AreaSeries, ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { useSeries } from "./series.jsx";
import { smoothPoints } from "./smooth.js";

// Filled blue, like a cross-section of the river. Raw readings, no spline.
// TradingView Lightweight Charts. The logo is off. Put their link back on the site later.
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

const DAY = 86400;

function hoverTime(time) {
  const date = new Date(time * 1000);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(date);
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${day}, ${clock}`;
}

function monthDay(unix) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(unix * 1000));
}

// Exactly `days` × 24 hours, ending at the latest reading.
// A tick is midnight. The date is midday. They are separate marks.
function axisMarks(start, end) {
  const span = Math.max(end - start, 1);
  const ticks = [];
  const labels = [];
  const first = new Date(start * 1000);
  let year = first.getUTCFullYear();
  let month = first.getUTCMonth();
  let date = first.getUTCDate();
  for (let i = 0; i < 14; i += 1) {
    const midnight = Date.UTC(year, month, date) / 1000;
    const noon = midnight + DAY / 2;
    if (midnight > end && noon > end) break;
    if (midnight > start && midnight < end) {
      const at = (midnight - start) / span;
      if (at > 0.015 && at < 0.985) ticks.push({ key: midnight, at });
    }
    if (noon > start && noon < end) {
      const at = (noon - start) / span;
      if (at > 0.04 && at < 0.96) labels.push({ key: noon, at, label: monthDay(noon) });
    }
    const next = new Date(Date.UTC(year, month, date + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth();
    date = next.getUTCDate();
  }
  return { ticks, labels };
}

export function LevelLine({ stationId, height = 168, interactive = false, smooth = 1 }) {
  const { ready, days, points } = useSeries(stationId);
  const ref = useRef(null);
  const [plotWidth, setPlotWidth] = useState(0);
  const [hover, setHover] = useState(null);
  const plotted = toPoints(points);
  const end = plotted.length ? plotted[plotted.length - 1].time : 0;
  const start = end - days * DAY;
  const { ticks, labels } = axisMarks(start, end);

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
        fixLeftEdge: false,
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
    const plotted = smoothPoints(toPoints(points), smooth);
    series.setData(plotted);
    const end = plotted[plotted.length - 1].time;
    chart.timeScale().setVisibleRange({
      from: end - days * DAY,
      to: end,
    });
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      let right = 0;
      const scale = chart.priceScale("right");
      if (scale.options().visible) right = scale.width();
      setPlotWidth(Math.max(el.clientWidth - right, 0));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);
    chart.timeScale().subscribeSizeChange(measure);
    const onMove = (param) => {
      if (!interactive || param.time == null) {
        setHover(null);
        return;
      }
      const x = chart.timeScale().timeToCoordinate(param.time);
      if (x == null) {
        setHover(null);
        return;
      }
      setHover({ x, text: hoverTime(param.time) });
    };
    if (interactive) chart.subscribeCrosshairMove(onMove);
    return () => {
      observer.disconnect();
      chart.timeScale().unsubscribeSizeChange(measure);
      if (interactive) chart.unsubscribeCrosshairMove(onMove);
      chart.remove();
    };
  }, [ready, points, days, interactive, smooth]);

  if (!ready) return <div className="chart waiting" style={{ height }} />;
  if (points.length === 0) {
    return <p className="meta">No readings in the last {days} days.</p>;
  }
  return (
    <div className={interactive ? "chart live" : "chart"}>
      <div style={{ height }} ref={ref} />
      <div className="axis">
        {ticks.map((tick) => (
          <i
            key={tick.key}
            className="tick"
            style={{ left: plotWidth ? tick.at * plotWidth : `${tick.at * 100}%` }}
          />
        ))}
        {labels.map((label) => (
          <span
            key={label.key}
            className="day"
            style={{ left: plotWidth ? label.at * plotWidth : `${label.at * 100}%` }}
          >
            {label.label}
          </span>
        ))}
        {hover ? (
          <span className="when" style={{ left: hover.x }}>
            {hover.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}

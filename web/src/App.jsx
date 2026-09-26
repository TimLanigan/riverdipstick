import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { findRiver, findStation, rivers, stations, stationsOn } from "./stations.js";
import { LevelLine } from "./LevelLine.jsx";
import { useLevelLine } from "./levels.jsx";
import { useSeries } from "./series.jsx";
import { StarButton, useStars } from "./stars.jsx";

function StationCard({ station }) {
  const reading = useLevelLine(station.id);
  const to = `/stations/${station.slug}`;
  return (
    <div className="card station-card">
      <Link className="card-title" to={to}>
        <span className="river">{station.river}</span>
        <span className="sep">/</span>
        <strong>{station.name}</strong>
      </Link>
      <StarButton slug={station.slug} />
      {reading ? (
        <Link className="level" to={to}>
          {reading.metres}
          {reading.when ? <span className="when"> · {reading.when}</span> : null}
        </Link>
      ) : (
        <span className="level" />
      )}
      {station.note ? <span className="meta note">{station.note}</span> : null}
      <Link className="card-chart" to={to}>
        <LevelLine stationId={station.id} />
      </Link>
    </div>
  );
}

function Shell({ children }) {
  return (
    <>
      <header className="bar">
        <Link className="brand" to="/">
          Riverdipstick
        </Link>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/rivers">Rivers</NavLink>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}

function Home() {
  const { starred, ready } = useStars();
  const picked = stations.filter((station) => starred.has(station.slug));
  return (
    <Shell>
      <h1>Home</h1>
      <p className="lede">
        Starred stations only. Open a river and tap a star to add one.
      </p>
      {!ready ? <p className="lede">Loading…</p> : null}
      {ready && picked.length === 0 ? (
        <p className="lede">Nothing starred yet.</p>
      ) : null}
      <ul className="cards">
        {picked.map((station) => (
          <li key={station.slug}>
            <StationCard station={station} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function RiverList() {
  return (
    <Shell>
      <h1>Rivers</h1>
      <p className="lede">Pick a river, then a station.</p>
      <ul className="cards">
        {rivers.map((river) => (
          <li key={river.slug}>
            <Link className="card" to={`/rivers/${river.slug}`}>
              <span className="river">{river.stations.length} stations</span>
              <strong>{river.name}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function RiverPage() {
  const { riverSlug } = useParams();
  const river = findRiver(riverSlug);
  if (!river) {
    return (
      <Shell>
        <h1>No such river</h1>
        <p>
          <Link to="/rivers">Back to rivers</Link>
        </p>
      </Shell>
    );
  }
  const list = stationsOn(river.slug);
  return (
    <Shell>
      <p className="crumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/rivers">Rivers</Link>
        <span> / {river.name}</span>
      </p>
      <h1>{river.name}</h1>
      <ul className="cards">
        {list.map((station) => (
          <li key={station.slug}>
            <StationCard station={station} />
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function Window() {
  const { days } = useSeries("");
  return (
    <p className="meta">
      Last {days} days.{" "}
      <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">
        Charts by TradingView
      </a>
    </p>
  );
}

function StationPage() {
  const { slug } = useParams();
  const station = findStation(slug);
  if (!station) {
    return (
      <Shell>
        <h1>No such station</h1>
        <p>
          <Link to="/rivers">Back to rivers</Link>
        </p>
      </Shell>
    );
  }
  return (
    <Shell>
      <p className="crumb">
        <Link to="/rivers">Rivers</Link>
        <span> / </span>
        <Link to={`/rivers/${station.riverSlug}`}>{station.river}</Link>
        <span> / {station.name}</span>
      </p>
      <h1 className="title">
        {station.name}
        <StarButton slug={station.slug} />
      </h1>
      <p className="lede">
        {station.river} · {station.id}
        {station.note ? `. ${station.note}` : ""}
      </p>
      <div className="grid">
        <section className="block">
          <h2>Level line</h2>
          <Window />
          <LevelLine stationId={station.id} height={420} interactive />
        </section>
        {["Pressure", "Forecast", "Map"].map((title) => (
          <section className="block" key={title}>
            <h2>{title}</h2>
            <p>Empty card.</p>
          </section>
        ))}
      </div>
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rivers" element={<RiverList />} />
      <Route path="/rivers/:riverSlug" element={<RiverPage />} />
      <Route path="/stations/:slug" element={<StationPage />} />
    </Routes>
  );
}

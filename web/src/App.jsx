import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import logo from "./rd-logo.png";
import { findRiver, findStation, rivers, stations, stationsOn } from "./stations.js";
import { cardSmooth } from "./cardSmoothing.js";
import { shownStations } from "./hiddenStations.js";
import { LevelLine } from "./LevelLine.jsx";
import { useLevelLine } from "./levels.jsx";
import { StarButton, useStars } from "./stars.jsx";

function StationCard({ station }) {
  const reading = useLevelLine(station.id);
  const to = `/stations/${station.slug}`;
  return (
    <div className="card station-card">
      <div className="card-head">
        <div className="card-title">
          <Link className="river" to={`/rivers/${station.riverSlug}`}>
            {station.river}
          </Link>
          <span className="sep">/</span>
          <Link className="station-name" to={to}>
            <strong>{station.name}</strong>
          </Link>
        </div>
        <StarButton slug={station.slug} />
        {reading ? (
          <Link className="level" to={to}>
            {reading.metres}
            {reading.when ? <span className="when"> · {reading.when}</span> : null}
          </Link>
        ) : null}
      </div>
      {station.note ? <span className="meta note">{station.note}</span> : null}
      <Link className="card-chart" to={to}>
        <LevelLine stationId={station.id} smooth={cardSmooth(station.slug)} />
      </Link>
    </div>
  );
}

function Shell({ children }) {
  return (
    <>
      <header className="bar">
        <Link className="brand" to="/">
          <img src={logo} alt="Riverdipstick" />
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
  const picked = shownStations(stations).filter((station) => starred.has(station.slug));
  return (
    <Shell>
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

function RiverCount({ river }) {
  const count = shownStations(stationsOn(river.slug)).length;
  return (
    <span className="river">
      {count} {count === 1 ? "station" : "stations"}
    </span>
  );
}

function RiverList() {
  return (
    <Shell>
      <p className="lede">Pick a river, then a station.</p>
      <ul className="cards">
        {rivers.map((river) => (
          <li key={river.slug}>
            <Link className="card" to={`/rivers/${river.slug}`}>
              <RiverCount river={river} />
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
  const list = shownStations(stationsOn(river.slug));
  return (
    <Shell>
      <p className="crumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/rivers">Rivers</Link>
        <span> / {river.name}</span>
      </p>
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
          <LevelLine stationId={station.id} height={252} smooth={1} interactive />
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

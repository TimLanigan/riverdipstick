import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { findRiver, findStation, rivers, stations, stationsOn } from "./stations.js";

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
  const starred = stations.filter((station) => station.starred);
  return (
    <Shell>
      <h1>Home</h1>
      <p className="lede">
        Starred stations only. Open a river when you want the full list.
      </p>
      <ul className="cards">
        {starred.map((station) => (
          <li key={station.slug}>
            <Link className="card" to={`/stations/${station.slug}`}>
              <span className="river">{station.river}</span>
              <strong>{station.name}</strong>
              <span className="meta">Latest level — not wired yet</span>
            </Link>
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
      <ul className="list">
        {list.map((station) => (
          <li key={station.slug}>
            <Link to={`/stations/${station.slug}`}>{station.name}</Link>
            <span>{station.starred ? "starred" : ""}</span>
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
      <h1>{station.name}</h1>
      <p className="lede">
        {station.river} · {station.id}
        {station.note ? `. ${station.note}` : ""}
      </p>
      <div className="grid">
        {["Level line", "Pressure", "Forecast", "Map"].map((title) => (
          <section className="block" key={title}>
            <h2>{title}</h2>
            <p>Empty card. Charts come after this navigation holds.</p>
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

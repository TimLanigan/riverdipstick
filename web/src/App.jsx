import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { findStation, stations } from "./stations.js";

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
          <NavLink to="/stations">Stations</NavLink>
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
        Starred stations only. A card is a glance. The station page is where you look properly.
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

function StationList() {
  return (
    <Shell>
      <h1>Stations</h1>
      <p className="lede">Every gauge has a page. A star only decides if it sits on the home page.</p>
      <ul className="list">
        {stations.map((station) => (
          <li key={station.slug}>
            <Link to={`/stations/${station.slug}`}>{station.name}</Link>
            <span>
              {station.river}
              {station.starred ? " · starred" : " · not starred"}
            </span>
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
          <Link to="/stations">Back to stations</Link>
        </p>
      </Shell>
    );
  }
  return (
    <Shell>
      <p className="crumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/stations">Stations</Link>
        <span> / {station.name}</span>
      </p>
      <h1>{station.name}</h1>
      <p className="lede">
        {station.river} · {station.id}. {station.note}
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
      <Route path="/stations" element={<StationList />} />
      <Route path="/stations/:slug" element={<StationPage />} />
    </Routes>
  );
}

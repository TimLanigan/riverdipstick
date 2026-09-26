// First pass from the live readings table, 26 Sep 2026.
// Order follows the 1.0 station list (source to sea). One row per gauge.
// Lancaster Quay kept the current label only. Langholm is in the database
// but silent since May 2026.

export const rivers = [
  {
    slug: "eden",
    name: "Eden",
    stations: [
      ["760101", "Kirkby Stephen", "kirkby-stephen"],
      ["760112", "Great Musgrave Bridge", "great-musgrave", true, "Go-to station."],
      ["760115", "Appleby", "appleby"],
      ["760502", "Temple Sowerby", "temple-sowerby"],
      ["762505", "Great Corby", "great-corby"],
      ["765512", "Sheepmount", "sheepmount"],
      ["762540", "Linstock", "linstock"],
    ],
  },
  {
    slug: "ribble",
    name: "Ribble",
    stations: [
      ["710151", "Locks Weir", "locks-weir"],
      ["710102", "Penny Bridge", "penny-bridge"],
      ["710301", "Low Moor", "low-moor", true, "Go-to station."],
      ["710305", "Henthorn", "henthorn"],
      ["713056", "New Jumbles Rock", "new-jumbles-rock"],
      ["713040", "Ribchester School", "ribchester", false, "Collecting. Not starred until the club comes through."],
    ],
  },
  {
    slug: "hodder",
    name: "Hodder",
    stations: [["711610", "Hodder Place", "hodder-place"]],
  },
  {
    slug: "lune",
    name: "Lune",
    stations: [
      ["722242", "Lunes Bridge", "lunes-bridge"],
      ["722421", "Killington", "killington"],
      ["724629", "Caton", "caton"],
      ["724647", "Skerton Weir", "skerton-weir"],
      ["724735", "Lancaster Quay (Tidal)", "lancaster-quay"],
    ],
  },
  {
    slug: "esk",
    name: "Esk",
    stations: [["133148", "Canonbie", "canonbie"]],
  },
  {
    slug: "liddel",
    name: "Liddel",
    stations: [
      ["133170", "Newcastleton", "newcastleton"],
      ["133176", "Rowanburnfoot", "rowanburnfoot"],
    ],
  },
  {
    slug: "border-esk",
    name: "Border Esk",
    stations: [
      ["506155", "Langholm Bridge", "langholm", false, "In the database. Silent since May 2026."],
    ],
  },
];

function expand(river) {
  return river.stations.map(([id, name, slug, starred = false, note = ""]) => ({
    id,
    name,
    slug,
    starred,
    note,
    river: river.name,
    riverSlug: river.slug,
  }));
}

export const stations = rivers.flatMap(expand);

export function findRiver(slug) {
  return rivers.find((river) => river.slug === slug);
}

export function stationsOn(riverSlug) {
  return stations.filter((station) => station.riverSlug === riverSlug);
}

export function findStation(slug) {
  return stations.find((station) => station.slug === slug);
}

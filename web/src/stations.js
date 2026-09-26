export const stations = [
  {
    slug: "great-musgrave",
    name: "Great Musgrave Bridge",
    river: "Eden",
    id: "760112",
    starred: true,
    note: "Go-to station.",
  },
  {
    slug: "low-moor",
    name: "Low Moor",
    river: "Ribble",
    id: "710301",
    starred: true,
    note: "Go-to station.",
  },
  {
    slug: "ribchester",
    name: "Ribchester School",
    river: "Ribble",
    id: "713040",
    starred: false,
    note: "Collecting. Not starred until the club comes through.",
  },
];

export function findStation(slug) {
  return stations.find((station) => station.slug === slug);
}

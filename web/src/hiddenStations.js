// Stations left out of the lists. The gauge is still in the catalogue.
// An admin page can replace this set with a toggle later.
// Opening the station address directly still works.

const HIDDEN = new Set(["appleby", "langholm"]);

export function isHidden(slug) {
  return HIDDEN.has(slug);
}

export function shownStations(list) {
  return list.filter((station) => !isHidden(station.slug));
}

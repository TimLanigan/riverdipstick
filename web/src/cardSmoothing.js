// How many readings to average on a station card.
// 1 is the raw gauge. Readings are about 15 minutes apart, so 13 is about 3 hours.
// The station page does not read this. An admin page can replace this list later.
//
// First pass, same test as Great Musgrave: short wiggle compared with the
// real rise and fall. A tide or an already smooth fall stays at 1.

const CARD_SMOOTH = {
  "kirkby-stephen": 1,
  "great-musgrave": 13,
  "appleby": 1,
  "temple-sowerby": 1,
  "great-corby": 5,
  "sheepmount": 1,
  "linstock": 1,

  "locks-weir": 1,
  "penny-bridge": 1,
  "low-moor": 1,
  "henthorn": 1,
  "new-jumbles-rock": 1,
  "ribchester": 5,

  "hodder-place": 1,

  "lunes-bridge": 5,
  "killington": 1,
  "caton": 1,
  "skerton-weir": 5,
  "lancaster-quay": 1,

  "newcastleton": 9,
  "rowanburnfoot": 13,

  "langholm": 1,
  "canonbie": 13,
};

export function cardSmooth(slug) {
  return CARD_SMOOTH[slug] ?? 1;
}

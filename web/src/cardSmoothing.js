// How many readings to average on a station card.
// 1 is the raw gauge. Readings are about 15 minutes apart, so 13 is about 3 hours.
// The station page does not read this. An admin page can replace this list later.

const CARD_SMOOTH = {
  "great-musgrave": 13,
};

export function cardSmooth(slug) {
  return CARD_SMOOTH[slug] ?? 1;
}

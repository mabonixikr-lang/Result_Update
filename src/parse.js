import MASTER from "./masterItems.json";

// Keys look like "1000 NangiarKoothu HSS" -> code 1000, title "NangiarKoothu", category "HSS"
const CATEGORIES = ["LP", "UP", "HS", "HSS"];

function parseKey(key) {
  const m = key.match(/^(\d+)\s+(.*)$/);
  const code = m ? m[1] : "";
  let rest = m ? m[2].trim() : key;
  let category = "";
  const last = rest.split(/\s+/).pop();
  if (CATEGORIES.includes(last)) {
    category = last;
    rest = rest.slice(0, rest.length - last.length).trim();
  }
  return { code, title: rest.replace(/\s+/g, " "), category };
}

const codeOf = (key) => (key.match(/^(\d+)/) || [])[1] || key;

/**
 * The full list of items (351) comes from the bundled master list, so totals always match
 * the database export. Live results from Firebase are merged in by item code.
 */
export function parseItems(raw) {
  const live = new Map();
  Object.entries(raw || {}).forEach(([key, val]) => {
    if (key === "Overall" || !val || typeof val !== "object") return;
    live.set(codeOf(key), { key, val });
  });

  const keys = [...MASTER];
  const known = new Set(MASTER.map(codeOf));
  // items present in the live node but missing from the master list
  live.forEach(({ key }, code) => {
    if (!known.has(code)) keys.push(key);
  });

  return keys
    .map((masterKey) => {
      const entry = live.get(codeOf(masterKey));
      const val = entry ? entry.val : {};
      const first = String(val["1"] ?? "").trim();
      const second = String(val["2"] ?? "").trim();
      const third = String(val["3"] ?? "").trim();
      return {
        key: masterKey,
        ...parseKey(masterKey),
        first,
        second,
        third,
        label: String(val.Name ?? "").trim(),
        published: Boolean(first || second || third),
      };
    })
    .sort((a, b) => Number(a.code) - Number(b.code));
}

export { CATEGORIES };

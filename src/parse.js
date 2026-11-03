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

function toTime(v) {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) return n;
  const t = Date.parse(String(v));
  return Number.isFinite(t) ? t : 0;
}

/**
 * Winner text looks like:
 *   "16182 ARSHARAJ P 10 13070 - St.Thomas High School Manikkadave(134-Irikur) A"
 *   chest no, name, class, school code - school (sub-district) grade
 * Anything that does not match is shown as plain text.
 */
function parseWinner(raw) {
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (!text) return { raw: "", chest: "", name: "", cls: "", school: "", sub: "", grade: "" };
  const m = text.match(/^(\d+)\s+(.+?)\s+(\d{1,2})\s+(\d{4,6})\s*-\s*(.+?)\s*\(([^)]*)\)\s*([A-Za-z+]*)$/);
  if (!m) return { raw: text, chest: "", name: text, cls: "", school: "", sub: "", grade: "" };
  return { raw: text, chest: m[1], name: m[2], cls: m[3], school: m[5], sub: m[6], grade: m[7] };
}

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
        // "Name" holds a link (e.g. Google Drive) to the item's media/result file
        link: /^https?:\/\//i.test(String(val.Name ?? "").trim()) ? String(val.Name).trim() : "",
        winners: [first, second, third].map(parseWinner),
        // optional publish time (ms since epoch, or ISO date) written by the data-entry app
        publishedAt: toTime(val.publishedAt ?? val.timestamp),
        published: Boolean(first || second || third),
      };
    })
    .sort((a, b) => Number(a.code) - Number(b.code));
}

export { CATEGORIES };

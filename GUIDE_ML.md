# കലോത്സവം റിസൾട്ട് വെബ് ആപ്പ് – പൂർണ്ണ കോഡ് ഗൈഡ്

React + Vite + Firebase Realtime Database ഉപയോഗിച്ചുള്ള തത്സമയ (live) റിസൾട്ട് പ്രസിദ്ധീകരണ വെബ്‌സൈറ്റ്.
VS Code-ൽ തുറന്ന് റൺ ചെയ്യാനുള്ള എല്ലാ ഘട്ടങ്ങളും, എല്ലാ ഫയലുകളുടെ കോഡും, ഓരോന്നിന്റെയും വിശദീകരണവും ഇതിലുണ്ട്.

> VS Code-ൽ ഈ ഫയൽ വായിക്കാൻ: `Ctrl + Shift + V` (Markdown Preview)

---

## 1. സ്ക്രീൻഷോട്ടിലെ എറർ – എന്താണ്, എങ്ങനെ പരിഹരിക്കാം

നിങ്ങളുടെ DevTools Console-ൽ കാണുന്ന ഈ വരികൾ **ആപ്പിന്റെ എററല്ല**:

- `chext_loader.js`, `chext_driver.js` → ഇത് ബ്രൗസറിൽ ഇൻസ്റ്റാൾ ചെയ്ത ഒരു **Chrome Extension** ആണ് (Elements-ൽ `chrome-extension://...` സ്ക്രിപ്റ്റുകൾ കാണാം).
- `Permissions policy violation: unload is not allowed in this document` → ആ എക്സ്റ്റൻഷൻ സ്വയം ഉണ്ടാക്കുന്ന മുന്നറിയിപ്പാണ്.

**പരിഹാരം / പരിശോധന**
1. **Incognito window** (`Ctrl + Shift + N`) തുറന്ന് http://localhost:5173 കാണുക. എക്സ്റ്റൻഷനുകൾ ഓഫ് ആയതിനാൽ ഈ എററുകൾ വരില്ല.
2. അല്ലെങ്കിൽ `chrome://extensions` ൽ പോയി സംശയമുള്ള എക്സ്റ്റൻഷൻ ഓഫ് ചെയ്യുക.
3. ഏറ്റവും മുകളിൽ കാണുന്ന `status of 404` സാധാരണ `favicon.ico` കിട്ടാത്തതിനാൽ വരുന്നതാണ്. ഈ പതിപ്പിൽ `index.html` ൽ favicon ചേർത്തിട്ടുണ്ട്, അതിനാൽ ഇനി വരില്ല.
4. Console-ൽ **ചുവന്ന എററിൽ ക്ലിക്ക് ചെയ്താൽ** ഫയലിന്റെ പേര് കാണാം. `src/...` എന്ന് തുടങ്ങിയാൽ മാത്രമേ അത് ആപ്പിന്റെ എററാകൂ. അങ്ങനെയെങ്കിൽ ആ വരി എനിക്ക് അയച്ചുതരിക.

> സൈറ്റിൽ "Could not read database" എന്ന് കണ്ടാൽ അത് Firebase Rules പ്രശ്നമാണ് (ഭാഗം 7 കാണുക).

---

## 2. ആവശ്യമായവ

- **Node.js (LTS)** – https://nodejs.org
- **VS Code**
- ടെർമിനലിൽ പരിശോധിക്കാൻ: `node -v`

## 3. ഫോൾഡർ ഘടന

```
kalolsavam-results/
├─ index.html            ← പേജിന്റെ അടിസ്ഥാന HTML
├─ package.json          ← ആവശ്യമായ ലൈബ്രറികളും കമാൻഡുകളും
├─ vite.config.js        ← Vite സെറ്റിംഗ്സ്
├─ .env                  ← Firebase URL, നോഡ് പേര് (ഇത് നിങ്ങൾ ഉണ്ടാക്കണം)
├─ .env.example          ← .env ന്റെ മാതൃക
├─ .gitignore
├─ .github/workflows/deploy.yml   ← GitHub Pages സ്വയം പ്രസിദ്ധീകരണം
└─ src/
   ├─ main.jsx           ← ആപ്പ് തുടങ്ങുന്ന ഫയൽ
   ├─ App.jsx            ← മുഴുവൻ സ്ക്രീനും ആനിമേഷനും
   ├─ firebase.js        ← Firebase കണക്ഷൻ
   ├─ parse.js           ← ഇനത്തിന്റെ പേര് വേർതിരിക്കലും 351 ഇനങ്ങളുടെ ലയനവും
   ├─ masterItems.json   ← 351 ഇനങ്ങളുടെ മുഴുവൻ പട്ടിക
   └─ styles.css         ← നിറവും ഡിസൈനും
```

## 4. സെറ്റപ്പ് ചെയ്ത് റൺ ചെയ്യാൻ

```bash
npm install
copy .env.example .env      # Mac/Linux: cp .env.example .env
npm run dev
```

ബ്രൗസറിൽ **http://localhost:5173** തുറക്കുക. `.env` മാറ്റിയാൽ `Ctrl + C` അമർത്തി `npm run dev` വീണ്ടും റൺ ചെയ്യണം.

---

## 5. ഓരോ ഫയലും – കോഡും വിശദീകരണവും

### 5.1 `package.json`

പ്രോജക്റ്റിന് വേണ്ട ലൈബ്രറികൾ: **react** (സ്ക്രീൻ), **firebase** (ഡാറ്റാബേസ്), **framer-motion** (ആനിമേഷൻ), **vite** (ഡെവലപ്മെന്റ് സെർവർ). `npm run dev` റൺ ചെയ്യാനും `npm run build` പ്രസിദ്ധീകരണത്തിനുള്ള ഫയൽ ഉണ്ടാക്കാനും ഉപയോഗിക്കുന്നു.

```json
{
  "name": "kalolsavam-results",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^11.0.0",
    "framer-motion": "^11.11.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.10"
  }
}
```

### 5.2 `vite.config.js`

React പ്ലഗിൻ ഓൺ ചെയ്യുന്നു. GitHub Pages-ൽ ഇടുകയാണെങ്കിൽ `base: "/റെപ്പോ-പേര്/"` എന്ന് മാറ്റണം.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base to "/<repo-name>/" if deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "./",
});
```

### 5.3 `index.html`

പേജിന്റെ ചട്ടക്കൂട്. `<div id="root">` ൽ ആണ് React ആപ്പ് വരുന്നത്. Outfit, Noto Sans Malayalam ഫോണ്ടുകളും favicon-ഉം ഇവിടെയാണ് ചേർത്തിരിക്കുന്നത്.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kalolsavam Results</title>
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8F%86%3C/text%3E%3C/svg%3E"
    />
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8F%86%3C/text%3E%3C/svg%3E"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+Malayalam:wght@400;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 5.4 `.env.example` (ഇത് പകർത്തി `.env` ആക്കുക)

- `VITE_FIREBASE_DATABASE_URL` → Firebase Console → Realtime Database പേജിന്റെ മുകളിൽ കാണുന്ന URL തന്നെ ആയിരിക്കണം.
- `VITE_RESULTS_PATH=kalo` → റിസൾട്ടുകൾ ഉള്ള നോഡിന്റെ പേര്. നിങ്ങളുടെ നോഡ് `kalo` അല്ലെങ്കിൽ ഇവിടെ മാറ്റുക.

```bash
# Copy this file to .env and fill in your values (Firebase console > Project settings)
# Realtime Database URL: shown at the top of the Realtime Database page
VITE_FIREBASE_DATABASE_URL=https://fir-app3-2144a-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=fir-app3-2144a
# Optional (not required for public-read databases)
VITE_FIREBASE_API_KEY=
# Database node that holds the results
VITE_RESULTS_PATH=kalo
```

### 5.5 `src/main.jsx`

ആപ്പ് ആരംഭിക്കുന്ന ഫയൽ. `App` ഘടകത്തെ `root` ൽ കാണിക്കുകയും `styles.css` ചേർക്കുകയും ചെയ്യുന്നു.

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Shows the real error on screen instead of a blank white page
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 24, color: "#fca5a5", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Something went wrong:{"\n"}
        {String(this.state.error?.message || this.state.error)}
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

### 5.6 `src/firebase.js`

Firebase-മായി ബന്ധിപ്പിക്കുന്നു. `kalo` നോഡിൽ ഇനങ്ങൾ ഇല്ലെങ്കിൽ ഡാറ്റാബേസ് root-ലും (ഒരു നില താഴെയും) സ്വയം തിരയും. `onValue` ഉപയോഗിക്കുന്നതിനാൽ ഡാറ്റാബേസിൽ ഏതൊരു മാറ്റവും വന്നാലും **റിഫ്രഷ് ചെയ്യാതെ തന്നെ** സ്ക്രീൻ മാറും. `subscribeResults` ഒരു unsubscribe ഫങ്ഷൻ തിരികെ നൽകുന്നു.

```js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Fallbacks are used when no .env exists (e.g. when GitHub builds the site).
// These values are public configuration, not secrets.
const DATABASE_URL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://fir-app3-2144a-default-rtdb.firebaseio.com";
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || "fir-app3-2144a";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || undefined,
  projectId: PROJECT_ID,
  databaseURL: DATABASE_URL,
});

const db = getDatabase(app);

const looksLikeItems = (d) =>
  !!d && typeof d === "object" && Object.keys(d).some((k) => /^\d+\s/.test(k));

// Finds the item list in the root snapshot, or one level inside it (e.g. under a differently named node)
function findItems(d) {
  if (looksLikeItems(d)) return d;
  if (d && typeof d === "object") {
    for (const v of Object.values(d)) if (looksLikeItems(v)) return v;
  }
  return {};
}

/** Subscribe to live results. Returns an unsubscribe function. */
export function subscribeResults(onData, onError) {
  // Results live under the "kalo" node of the Realtime Database
  const path = import.meta.env.VITE_RESULTS_PATH || "kalo";
  let stopRoot = null;

  const stop = onValue(
    ref(db, path),
    (snap) => {
      const val = snap.val();
      if (looksLikeItems(val)) {
        if (stopRoot) { stopRoot(); stopRoot = null; }
        onData(val);
        return;
      }
      // Nothing item-like at the configured path: look in the database root instead
      if (!stopRoot) {
        stopRoot = onValue(ref(db, "/"), (s) => onData(findItems(s.val())), () => onData({}));
      }
    },
    onError
  );

  return () => {
    stop();
    if (stopRoot) stopRoot();
  };
}
```

### 5.7 `src/parse.js`

- ഇനത്തിന്റെ key (`1000 NangiarKoothu HSS`) കോഡ് (1000), പേര് (NangiarKoothu), വിഭാഗം (HSS) എന്നിങ്ങനെ വേർതിരിക്കുന്നു.
- **351 ഇനങ്ങളുടെ പട്ടിക** `masterItems.json` ൽ നിന്നാണ് വരുന്നത്. അതിനാൽ ഡാറ്റാബേസിൽ കുറച്ച് ഇനങ്ങളേ ഉള്ളൂ എങ്കിലും Total items എപ്പോഴും 351 (LP 32, UP 70, HS 120, HSS 129) ആയിരിക്കും.
- ഡാറ്റാബേസിൽ നിന്നുള്ള `1`, `2`, `3` മൂല്യങ്ങൾ **ഇനത്തിന്റെ കോഡ്** വെച്ച് പൊരുത്തപ്പെടുത്തുന്നു.
- `1`, `2`, `3` ൽ ഏതെങ്കിലും ഒന്നിൽ പേര് ഉണ്ടെങ്കിൽ ആ ഇനം `published = true` ആകും.
- വിജയിയുടെ വരി (`16182 ARSHARAJ P 10 13070 - St.Thomas High School ...(134-Irikur) A`) `parseWinner` ഫങ്ഷൻ **ചെസ്റ്റ് നമ്പർ, പേര്, ക്ലാസ്, സ്കൂൾ, ഗ്രേഡ്** എന്നിങ്ങനെ വേർതിരിക്കുന്നു. പൊരുത്തപ്പെടാത്ത വരി അതേപടി കാണിക്കും.
- `Name` ഫീൽഡിൽ Google Drive ലിങ്ക് ഉണ്ടെങ്കിൽ കാർഡിൽ **▶ View media** ബട്ടൺ വരും.

```js
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
        published: Boolean(first || second || third),
      };
    })
    .sort((a, b) => Number(a.code) - Number(b.code));
}

export { CATEGORIES };
```

### 5.8 `src/App.jsx` (പ്രധാന സ്ക്രീൻ)

ഭാഗങ്ങൾ:
- **`Podium`** – 1st, 2nd, 3rd സ്ഥാനങ്ങൾ ഉയർന്നുവരുന്ന ആനിമേഷൻ.
- **`ResultCard`** – ഓരോ ഇനത്തിന്റെയും കാർഡ്; പുതിയ റിസൾട്ടിന് തിളങ്ങുന്ന **NEW** ബാഡ്ജ്.
- **`Modal`** – കാർഡിൽ ക്ലിക്ക് ചെയ്താൽ വലിയ പോഡിയം.
- **`Counter`** – സംഖ്യകൾ 0 മുതൽ എണ്ണിക്കയറുന്ന ആനിമേഷൻ.
- **`App`** – Firebase-ൽ നിന്ന് ഡാറ്റ വായിക്കുന്നു, **published ഇനങ്ങൾ മാത്രം** കാണിക്കുന്നു, സെർച്ച്, LP/UP/HS/HSS ഫിൽട്ടർ, പുതിയ റിസൾട്ട് വന്നാൽ അറിയിപ്പ് (toast).

```jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeResults } from "./firebase.js";
import { parseItems, CATEGORIES } from "./parse.js";

const MEDALS = [
  { pos: 1, label: "1st", icon: "🥇", cls: "gold" },
  { pos: 2, label: "2nd", icon: "🥈", cls: "silver" },
  { pos: 3, label: "3rd", icon: "🥉", cls: "bronze" },
];

function Podium({ item, big = false }) {
  const winners = item.winners;
  // visual order: 2nd, 1st, 3rd
  const order = [1, 0, 2];
  const heights = big ? [150, 210, 120] : [64, 92, 52];
  return (
    <div className={`podium ${big ? "podium-big" : ""}`}>
      {order.map((idx, i) => (
        <div className="podium-col" key={idx}>
          <motion.div
            className="podium-name"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
          >
            {winners[idx]?.name || "—"}
            {big && winners[idx]?.school && <small className="podium-school">{winners[idx].school}</small>}
          </motion.div>
          <motion.div
            className={`podium-bar ${MEDALS[idx].cls}`}
            initial={{ height: 0 }}
            animate={{ height: heights[i] }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: i * 0.12 }}
          >
            <span>{MEDALS[idx].icon}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function WinnerList({ item, detailed = false }) {
  return (
    <>
      <ol className="winners">
        {MEDALS.map((m, i) => {
          const w = item.winners[i];
          const sub = [detailed && w.chest && `Chest No. ${w.chest}`, w.cls && `Class ${w.cls}`, w.school]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={m.pos} className={m.cls}>
              <span className="medal">{m.icon}</span>
              <span className="w-info">
                <span className="w-name">{w.name || "—"}</span>
                {sub && <span className="w-sub">{sub}</span>}
              </span>
              {w.grade && <span className="grade">{w.grade}</span>}
            </li>
          );
        })}
      </ol>
      {item.link && (
        <a
          className="media-link"
          href={item.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          ▶ View media
        </a>
      )}
    </>
  );
}

function ResultCard({ item, fresh, onOpen }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`card ${item.published ? "" : "card-pending"} ${fresh ? "card-fresh" : ""}`}
      onClick={() => item.published && onOpen(item)}
    >
      <header>
        <span className="code">#{item.code}</span>
        {item.category && <span className={`tag tag-${item.category}`}>{item.category}</span>}
        {fresh && <span className="new-badge">NEW</span>}
      </header>
      <h3>{item.title}</h3>
      {item.published ? (
        <WinnerList item={item} />
      ) : (
        <div className="pending">
          <span className="pulse" /> Result awaited
        </div>
      )}
    </motion.article>
  );
}

function Modal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <span className="code">#{item.code}</span>
        <h2>{item.title} {item.category && <small>{item.category}</small>}</h2>
        <Podium item={item} big />
        <div className="modal-list"><WinnerList item={item} detailed /></div>
      </motion.div>
    </motion.div>
  );
}

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = n;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 700);
      setN(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{n}</>;
}

export default function App() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [fresh, setFresh] = useState({});
  const [toast, setToast] = useState(null);
  const prev = useRef(null);

  useEffect(() => {
    return subscribeResults(
      (data) => setRaw(data),
      (err) => setError(err.message)
    );
  }, []);

  const items = useMemo(() => (raw ? parseItems(raw) : []), [raw]);

  // detect newly published / changed results after first load
  useEffect(() => {
    if (!raw) return;
    const sig = Object.fromEntries(items.map((i) => [i.key, `${i.first}|${i.second}|${i.third}`]));
    if (prev.current) {
      const changed = items.filter((i) => i.published && sig[i.key] !== prev.current[i.key]);
      if (changed.length) {
        setFresh((f) => ({ ...f, ...Object.fromEntries(changed.map((c) => [c.key, true])) }));
        setToast(changed[0]);
        setTimeout(() => setToast(null), 6000);
        setTimeout(
          () => setFresh((f) => { const n = { ...f }; changed.forEach((c) => delete n[c.key]); return n; }),
          30000
        );
      }
    }
    prev.current = sig;
  }, [items, raw]);

  const published = items.filter((i) => i.published);
  // Dashboard shows published results only
  const filtered = published.filter((i) => {
    if (category !== "ALL" && i.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [i.code, i.title, i.first, i.second, i.third].join(" ").toLowerCase().includes(q);
  });

  const ticker = published.slice(-8).reverse();

  return (
    <div className="app">
      <div className="bg-orbs"><i /><i /><i /></div>

      <header className="hero">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="live"><b /> LIVE</span> Kalolsavam Results
        </motion.h1>
        <p>Results appear here the moment they are published.</p>
        <div className="stats">
          <div><strong><Counter value={items.length} /></strong><span>Total items</span></div>
          <div><strong className="ok"><Counter value={published.length} /></strong><span>Results published</span></div>
          {CATEGORIES.map((c) => (
            <div key={c}>
              <strong>
                <Counter value={published.filter((i) => i.category === c).length} />
                <small className="of">/{items.filter((i) => i.category === c).length}</small>
              </strong>
              <span>{c} published</span>
            </div>
          ))}
        </div>
      </header>

      {ticker.length > 0 && (
        <div className="ticker">
          <div className="ticker-track">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i}>🏆 {t.title} {t.category} — 🥇 {t.winners[0].name || "—"}</span>
            ))}
          </div>
        </div>
      )}

      <section className="controls">
        <input
          className="search"
          placeholder="Search item, code or winner…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {["ALL", ...CATEGORIES].map((c) => (
            <button key={c} className={`chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="msg error">Could not read database: {error}</div>}
      {!raw && !error && <div className="msg"><span className="spinner" /> Loading results…</div>}

      {raw && (
        <motion.main layout className="grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((it) => (
              <ResultCard key={it.key} item={it} fresh={!!fresh[it.key]} onOpen={setOpen} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="msg">
              {published.length === 0 ? "No results have been published yet." : "No published results match."}
            </div>
          )}
        </motion.main>
      )}

      <AnimatePresence>{open && <Modal item={open} onClose={() => setOpen(null)} />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => { setOpen(toast); setToast(null); }}
          >
            🎉 New result: <b>{toast.title} {toast.category}</b> — tap to view
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 5.9 `src/styles.css`

ഇരുണ്ട തീം, ഗ്ലാസ് ഇഫക്റ്റ് കാർഡുകൾ, ടിക്കർ, പോഡിയം നിറങ്ങൾ (സ്വർണ്ണം/വെള്ളി/വെങ്കലം), മൊബൈൽ ഫ്രണ്ട്‌ലി ഗ്രിഡ് എന്നിവ.

```css
:root {
  --bg: #0b1020;
  --panel: rgba(255, 255, 255, 0.06);
  --line: rgba(255, 255, 255, 0.12);
  --text: #eef1ff;
  --muted: #98a2c7;
  --accent: #7c5cff;
  --accent2: #22d3ee;
  --gold: #fbbf24;
  --silver: #cbd5e1;
  --bronze: #d9894a;
  --ok: #34d399;
  --warn: #fb923c;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Outfit", "Noto Sans Malayalam", system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
.app { position: relative; max-width: 1200px; margin: 0 auto; padding: 24px 16px 80px; overflow-x: clip; }

.bg-orbs { position: fixed; inset: 0; z-index: -1; overflow: hidden; }
.bg-orbs i { position: absolute; width: 480px; height: 480px; border-radius: 50%; filter: blur(110px); opacity: 0.35; animation: float 18s ease-in-out infinite; }
.bg-orbs i:nth-child(1) { background: var(--accent); top: -120px; left: -120px; }
.bg-orbs i:nth-child(2) { background: var(--accent2); bottom: -160px; right: -100px; animation-delay: -6s; }
.bg-orbs i:nth-child(3) { background: #f472b6; top: 40%; left: 55%; width: 320px; height: 320px; animation-delay: -12s; opacity: 0.2; }
@keyframes float { 50% { transform: translate(60px, 40px) scale(1.15); } }

.hero { text-align: center; padding: 28px 0 8px; }
.hero h1 { margin: 0; font-size: clamp(28px, 5vw, 52px); font-weight: 800; letter-spacing: -0.5px;
  background: linear-gradient(90deg, #fff, #c4b5fd 50%, #67e8f9); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero p { color: var(--muted); margin: 8px 0 20px; }
.live { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; vertical-align: middle; padding: 4px 10px; border-radius: 99px; background: rgba(239, 68, 68, 0.15); color: #fca5a5; -webkit-text-fill-color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); margin-right: 8px; }
.live b { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: blink 1.2s infinite; }
@keyframes blink { 50% { opacity: 0.2; transform: scale(0.7); } }

.stats { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }
.stats div { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 14px 28px; backdrop-filter: blur(10px); min-width: 130px; }
.stats strong { display: block; font-size: 34px; font-weight: 800; }
.stats .ok { color: var(--ok); } .stats .warn { color: var(--warn); }
.stats span { color: var(--muted); font-size: 13px; }

.ticker { margin: 22px 0; overflow: hidden; border-block: 1px solid var(--line); background: rgba(255,255,255,0.03); }
.ticker-track { display: inline-flex; gap: 48px; white-space: nowrap; padding: 10px 0; animation: marquee 40s linear infinite; }
.ticker-track span { color: #e9d5ff; font-size: 14px; }
.ticker:hover .ticker-track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }

.controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin: 12px 0 22px; }
.search { flex: 1 1 260px; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--line); background: var(--panel); color: var(--text); font: inherit; outline: none; transition: border-color .2s, box-shadow .2s; }
.search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.25); }
.chips { display: flex; gap: 6px; }
.chip { border: 1px solid var(--line); background: var(--panel); color: var(--muted); padding: 9px 14px; border-radius: 99px; cursor: pointer; font: inherit; font-weight: 600; transition: all .2s; }
.chip:hover { color: var(--text); }
.chip.on { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; border-color: transparent; }
.tabs { display: flex; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 4px; }
.tabs button { position: relative; border: 0; background: none; color: var(--muted); padding: 8px 16px; cursor: pointer; font: inherit; font-weight: 600; }
.tabs button.on { color: #fff; }
.tabs em { position: relative; z-index: 1; font-style: normal; }
.pill { position: absolute; inset: 0; background: var(--accent); border-radius: 10px; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 16px; cursor: pointer; backdrop-filter: blur(10px); position: relative; overflow: hidden; }
.card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 3px; background: linear-gradient(90deg, var(--gold), var(--accent), var(--accent2)); opacity: .8; }
.card-pending { cursor: default; opacity: 0.6; }
.card-pending::before { background: var(--line); }
.card-fresh { border-color: var(--gold); animation: glow 1.8s ease-in-out infinite; }
@keyframes glow { 50% { box-shadow: 0 0 28px rgba(251, 191, 36, 0.45); } }
.card header { display: flex; align-items: center; gap: 8px; }
.code { color: var(--muted); font-size: 13px; font-weight: 600; }
.card h3 { margin: 8px 0 12px; font-size: 18px; line-height: 1.25; }
.tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: rgba(255,255,255,.1); }
.tag-LP { background: rgba(52, 211, 153, .2); color: #6ee7b7; }
.tag-UP { background: rgba(96, 165, 250, .2); color: #93c5fd; }
.tag-HS { background: rgba(244, 114, 182, .2); color: #f9a8d4; }
.tag-HSS { background: rgba(167, 139, 250, .2); color: #c4b5fd; }
.new-badge { margin-left: auto; background: var(--gold); color: #1c1400; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 99px; animation: blink 1s infinite; }

.winners { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.winners li { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.05); }
.winners .gold { border-left: 3px solid var(--gold); } .winners .silver { border-left: 3px solid var(--silver); } .winners .bronze { border-left: 3px solid var(--bronze); }
.w-name { font-weight: 600; word-break: break-word; }
.pending { color: var(--warn); display: flex; align-items: center; gap: 8px; font-size: 14px; }
.pulse { width: 9px; height: 9px; border-radius: 50%; background: var(--warn); animation: blink 1.4s infinite; }

.overlay { position: fixed; inset: 0; background: rgba(5, 8, 20, 0.75); backdrop-filter: blur(6px); display: grid; place-items: center; z-index: 50; padding: 16px; }
.modal { position: relative; width: min(560px, 100%); background: linear-gradient(160deg, #1a1f3d, #0f1430); border: 1px solid var(--line); border-radius: 24px; padding: 28px 24px 20px; text-align: center; }
.modal h2 { margin: 6px 0 24px; } .modal h2 small { font-size: 14px; color: var(--accent2); }
.close { position: absolute; top: 10px; right: 14px; background: none; border: 0; color: var(--muted); font-size: 28px; cursor: pointer; }

.podium { display: flex; justify-content: center; align-items: flex-end; gap: 8px; }
.podium-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 0; }
.podium-name { font-weight: 700; margin-bottom: 8px; font-size: 14px; word-break: break-word; }
.podium-big .podium-name { font-size: 17px; }
.podium-bar { width: 100%; border-radius: 12px 12px 0 0; display: grid; place-items: start center; padding-top: 8px; font-size: 24px; overflow: hidden; }
.podium-bar.gold { background: linear-gradient(180deg, #fde68a, #f59e0b); }
.podium-bar.silver { background: linear-gradient(180deg, #f1f5f9, #94a3b8); }
.podium-bar.bronze { background: linear-gradient(180deg, #fdba74, #b45309); }
.podium-big .podium-bar { font-size: 38px; padding-top: 14px; }

.toast { position: fixed; bottom: 22px; left: 50%; translate: -50% 0; background: linear-gradient(135deg, var(--accent), var(--accent2)); padding: 14px 22px; border-radius: 16px; cursor: pointer; box-shadow: 0 10px 40px rgba(0,0,0,.5); z-index: 60; max-width: 92vw; }

.msg { text-align: center; color: var(--muted); padding: 40px; grid-column: 1 / -1; }
.msg.error { color: #fca5a5; }
.spinner { display: inline-block; width: 18px; height: 18px; border: 3px solid var(--line); border-top-color: var(--accent2); border-radius: 50%; animation: spin .8s linear infinite; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }

.stats .of { font-size: 16px; color: var(--muted); font-weight: 600; display: inline; }
.stats div { min-width: 110px; padding: 14px 20px; }

.w-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.w-sub { color: var(--muted); font-size: 12px; line-height: 1.3; margin-top: 2px; word-break: break-word; }
.grade { font-size: 12px; font-weight: 800; padding: 2px 8px; border-radius: 99px; background: rgba(52, 211, 153, .18); color: #6ee7b7; }
.winners li { text-align: left; }
.media-link { display: inline-block; margin-top: 12px; padding: 8px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; color: #fff; text-decoration: none; background: linear-gradient(135deg, var(--accent), var(--accent2)); }
.media-link:hover { filter: brightness(1.15); }
.podium-school { display: block; font-size: 11px; font-weight: 500; color: var(--muted); margin-top: 2px; }
.modal-list { margin-top: 22px; }
.modal-list .media-link { margin-top: 14px; }
```

### 5.10 `.github/workflows/deploy.yml` (GitHub Pages-ൽ സ്വയം പ്രസിദ്ധീകരിക്കാൻ)

`main` ബ്രാഞ്ചിലേക്ക് push ചെയ്യുമ്പോഴെല്ലാം GitHub സ്വയം `npm ci` + `npm run build` റൺ ചെയ്ത് **`dist` ഫോൾഡർ** സൈറ്റായി പ്രസിദ്ധീകരിക്കും. (`npm ci` ന് `package-lock.json` വേണം, അത് GitHub-ലേക്ക് അപ്‌ലോഡ് ചെയ്യണം.)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 5.11 `.gitignore`

`node_modules`, `dist`, `.env` എന്നിവ GitHub-ലേക്ക് പോകാതിരിക്കാൻ. `.env` അപ്‌ലോഡ് ചെയ്യാത്തതിനാൽ ആണ് `firebase.js` ൽ URL-ന് ഡിഫോൾട്ട് മൂല്യം നൽകിയിരിക്കുന്നത്.

```bash
node_modules
dist
.env
```

### 5.12 `src/masterItems.json`

351 ഇനങ്ങളുടെ key-കളുടെ പട്ടിക (ഉദാ: `"1000 NangiarKoothu HSS"`). വലിപ്പം കാരണം ഇവിടെ പകർത്തിയിട്ടില്ല, zip-ലെ `src/masterItems.json` ഫയൽ ഉപയോഗിക്കുക. പുതിയ ഇനം ചേർക്കണമെങ്കിൽ ഇതേ രീതിയിൽ ഒരു വരി ചേർത്താൽ മതി.

---

## 6. റിസൾട്ട് എങ്ങനെ പ്രസിദ്ധീകരിക്കാം

Firebase Console → Realtime Database → `kalo` → ഇനം തിരഞ്ഞെടുത്ത് ഇങ്ങനെ എഴുതുക:

```
"1000 NangiarKoothu HSS": { "1": "ഒന്നാം സ്ഥാനം", "2": "രണ്ടാം സ്ഥാനം", "3": "മൂന്നാം സ്ഥാനം", "Name": "" }
```

- `1`, `2`, `3` ൽ ഏതെങ്കിലും ഒന്നിൽ പേര് എഴുതിയാൽ ഉടൻ വെബ്‌സൈറ്റിൽ കാർഡ് വരും, റിഫ്രഷ് വേണ്ട.
- ഇനത്തിന്റെ key-യുടെ തുടക്കത്തിലെ **കോഡ് (ഉദാ: 1000)** ആണ് പൊരുത്തപ്പെടുത്താൻ ഉപയോഗിക്കുന്നത്.

## 7. Firebase Rules (വളരെ പ്രധാനം)

Realtime Database → **Rules** ടാബിൽ:

```json
{ "rules": { ".read": true, ".write": false } }
```

**Publish** അമർത്തുക. ഇല്ലെങ്കിൽ സൈറ്റിൽ "Could not read database" എന്ന എറർ വരും.

## 8. GitHub Pages-ൽ പ്രസിദ്ധീകരിക്കാൻ (വെള്ള സ്ക്രീൻ വരാതിരിക്കാൻ)

### വെള്ള സ്ക്രീൻ വരുന്നതിന്റെ കാരണങ്ങൾ
1. **സോഴ്സ് ഫയലുകൾ നേരിട്ട് പ്രസിദ്ധീകരിച്ചു.** `index.html` ൽ `/src/main.jsx` എന്നാണ് ഉള്ളത്. ബ്രൗസറിന് JSX മനസ്സിലാകില്ല. GitHub Pages-ൽ കാണിക്കേണ്ടത് `npm run build` ഉണ്ടാക്കുന്ന **`dist`** ഫോൾഡറാണ്.
2. **`.env` GitHub-ൽ ഇല്ല.** അതിനാൽ ബിൽഡിൽ Firebase URL ഇല്ലാതെ വരികയും ആപ്പ് തുടങ്ങുമ്പോൾത്തന്നെ crash ആകുകയും ചെയ്യും. ഈ പതിപ്പിൽ `firebase.js` ൽ URL ഡിഫോൾട്ട് ആയി ചേർത്തിട്ടുണ്ട്, അതിനാൽ ഇനി ഈ പ്രശ്നം വരില്ല.
3. ഇനി എന്തെങ്കിലും എറർ വന്നാൽ വെള്ള സ്ക്രീനിന് പകരം **എററിന്റെ സന്ദേശം സ്ക്രീനിൽ കാണിക്കും** (ErrorBoundary).

### രീതി A – സ്വയം പ്രസിദ്ധീകരണം (GitHub Actions) – ശുപാർശ ചെയ്യുന്നത്
1. പ്രോജക്റ്റ് മുഴുവൻ GitHub റെപ്പോയിലേക്ക് അപ്‌ലോഡ് ചെയ്യുക. `.github/workflows/deploy.yml`, `package-lock.json`, `src/masterItems.json` എന്നിവ ഉൾപ്പെടണം. `node_modules` വേണ്ട.
2. ബ്രാഞ്ചിന്റെ പേര് **`main`** ആയിരിക്കണം.
3. GitHub റെപ്പോ → **Settings → Pages → Build and deployment → Source: GitHub Actions** തിരഞ്ഞെടുക്കുക.
4. **Actions** ടാബിൽ "Deploy to GitHub Pages" പച്ച ടിക്ക് വരുന്നതുവരെ കാത്തിരിക്കുക.
5. സൈറ്റ്: `https://<യൂസർനെയിം>.github.io/<റെപ്പോ-പേര്>/`

### രീതി B – കൈകൊണ്ട്
```bash
npm run build
```
`dist` ഫോൾഡറിനുള്ളിലെ ഫയലുകൾ (ഫോൾഡർ അല്ല) ആണ് `gh-pages` ബ്രാഞ്ചിൽ വരേണ്ടത്. Pages Source: **Deploy from a branch → gh-pages / (root)**.

### പരിശോധന
- സൈറ്റ് തുറന്ന് `Ctrl + U` (View source) അമർത്തുക. `src="./assets/index-....js"` എന്നാണ് കാണുന്നതെങ്കിൽ ശരിയാണ്. `src="/src/main.jsx"` ആണെങ്കിൽ സോഴ്സ് ഫയലാണ് പ്രസിദ്ധീകരിച്ചിരിക്കുന്നത് (കാരണം 1).
- `F12 → Console` ൽ **`src/...` അല്ലെങ്കിൽ `assets/...` എന്ന് തുടങ്ങുന്ന** ചുവന്ന എററുകൾ മാത്രം നോക്കുക (Chrome Extension എററുകൾ അവഗണിക്കാം).
- Firebase Rules-ൽ `.read: true` ഉണ്ടോ എന്ന് ഉറപ്പാക്കുക (ഭാഗം 7).

### Firebase Hosting / Netlify
Firebase Hosting: `npm i -g firebase-tools` → `firebase login` → `firebase init hosting` (public: `dist`, SPA: Yes) → `firebase deploy`. Netlify: `dist` ഫോൾഡർ drag & drop ചെയ്യുക.

## 9. പ്രശ്നങ്ങളും പരിഹാരവും

| പ്രശ്നം | പരിഹാരം |
|---|---|
| Console-ൽ `chext_loader.js`, `chext_driver.js` എററുകൾ | Chrome Extension മൂലമാണ്. Incognito-ൽ തുറക്കുക അല്ലെങ്കിൽ എക്സ്റ്റൻഷൻ ഓഫ് ചെയ്യുക |
| "Could not read database" | Rules-ൽ `.read: true` നൽകുക, `.env` ലെ URL ശരിയാണോ എന്ന് നോക്കുക |
| ഒരു റിസൾട്ടും കാണുന്നില്ല | `1`,`2`,`3` ൽ പേര് ഉണ്ടോ എന്നും `VITE_RESULTS_PATH` ശരിയാണോ എന്നും നോക്കുക |
| `npm` കമാൻഡ് കണ്ടെത്തുന്നില്ല | Node.js ഇൻസ്റ്റാൾ ചെയ്ത് VS Code പുനരാരംഭിക്കുക |
| `.env` മാറ്റിയിട്ടും മാറ്റമില്ല | സെർവർ നിർത്തി `npm run dev` വീണ്ടും റൺ ചെയ്യുക |
| GitHub Pages-ൽ വെള്ള സ്ക്രീൻ | ഭാഗം 8 കാണുക: `dist` ആണോ പ്രസിദ്ധീകരിച്ചത്, Pages Source = GitHub Actions ആണോ എന്ന് നോക്കുക |
| Total 351 അല്ല | പഴയ പതിപ്പ് ആകാം; പുതിയ zip Extract ചെയ്ത് `npm run dev` റൺ ചെയ്യുക |

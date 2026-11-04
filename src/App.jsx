import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeResults } from "./firebase.js";
import { parseItems, CATEGORIES } from "./parse.js";
import logoImage from "./assets/logo.png";


const MEDALS = [
  { pos: 1, label: "1st", icon: "1", cls: "gold" },
  { pos: 2, label: "2nd", icon: "2", cls: "silver" },
  { pos: 3, label: "3rd", icon: "3", cls: "bronze" },
];

function Podium({ item, big = false }) {
  const winners = item.winners;
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
  const displayMedals = detailed ? MEDALS : [MEDALS[0]];

  return (
    <>
      <ol className="winners">
        {displayMedals.map((m, i) => {
          const w = item.winners[i];
          const sub = [w.cls && `Class ${w.cls}`, w.school]
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
        <span className="card-badge-left">• RESULT</span>
        <span className="code">#{item.code}</span>
        {item.category && <span className={`tag tag-${item.category}`}>{item.category}</span>}
        {fresh && <span className="new-badge">NEW</span>}
      </header>
      <h3>{item.title}</h3>
      {item.published ? (
        <WinnerList item={item} detailed={false} />
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
        <div className="modal-list"><WinnerList item={item} detailed={true} /></div>
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
  const updateTimes = useRef({});

  useEffect(() => {
    return subscribeResults(
      (data) => setRaw(data),
      (err) => setError(err.message)
    );
  }, []);

  const items = useMemo(() => (raw ? parseItems(raw) : []), [raw]);

  useEffect(() => {
    if (!raw) return;
    const sig = Object.fromEntries(items.map((i) => [i.key, `${i.first}|${i.second}|${i.third}`]));
    const now = Date.now();

    if (prev.current) {
      const changed = items.filter((i) => i.published && sig[i.key] !== prev.current[i.key]);
      if (changed.length) {
        changed.forEach((c) => {
          updateTimes.current[c.key] = now;
        });
        setFresh((f) => ({ ...f, ...Object.fromEntries(changed.map((c) => [c.key, true])) }));
        setToast(changed[0]);
        setTimeout(() => setToast(null), 6000);
        setTimeout(
          () => setFresh((f) => { const n = { ...f }; changed.forEach((c) => delete n[c.key]); return n; }),
          30000
        );
      }
    } else {
      items.forEach((i) => {
        if (i.published && !updateTimes.current[i.key]) {
          updateTimes.current[i.key] = i.publishedAt || now;
        }
      });
    }
    prev.current = sig;
  }, [items, raw]);

  const published = items.filter((i) => i.published);
  
  const filtered = published.filter((i) => {
    if (category !== "ALL" && i.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [i.code, i.title, i.first, i.second, i.third].join(" ").toLowerCase().includes(q);
  });

  const latestThree = useMemo(() => {
    return [...filtered]
      .sort((a, b) => {
        const timeA = updateTimes.current[a.key] || a.publishedAt || 0;
        const timeB = updateTimes.current[b.key] || b.publishedAt || 0;
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [filtered, raw]);

  const ticker = published.slice(-8).reverse();

  return (
    <div className="app">
      <div className="bg-orbs"><i /><i /><i /></div>

      {/* Top Header Navigation Bar */}
      <div className="top-nav-bar">
        <div className="top-brand">
          <span className="live"><b /> LIVE</span> Kalolsavam Results
        </div>
        <div className="top-logo-container">
          <img src="./logo.png" alt="Logo" className="top-logo" />
        </div>
      </div>

      <header className="hero">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Kalolsavam Results Dashboard
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
            {latestThree.map((it) => (
              <ResultCard key={it.key} item={it} fresh={!!fresh[it.key]} onOpen={setOpen} />
            ))}
          </AnimatePresence>
          {latestThree.length === 0 && (
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
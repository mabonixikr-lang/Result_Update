import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeResults, subscribeConnection } from "./firebase.js";
import { parseItems, CATEGORIES } from "./parse.js";

const MEDALS = [
  { pos: 1, label: "1st", icon: "🥇", cls: "gold" },
  { pos: 2, label: "2nd", icon: "🥈", cls: "silver" },
  { pos: 3, label: "3rd", icon: "🥉", cls: "bronze" },
];

/* ---------- Scoreboard-style rolling digits ---------- */
function Digit({ d }) {
  return (
    <span className="odo-digit">
      <motion.span
        className="odo-strip"
        initial={{ y: "0%" }}
        animate={{ y: `${-d * 10}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value }) {
  const s = String(value);
  return (
    <span className="odo" aria-label={s}>
      {s.split("").map((ch, i) => (
        <Digit key={s.length - i} d={Number(ch)} />
      ))}
    </span>
  );
}

/* ---------- Podium (used in the popup) ---------- */
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

/* ---------- 1st / 2nd / 3rd rows revealed like a scorecard ---------- */
function WinnerList({ item, detailed = false, baseDelay = 0.3 }) {
  return (
    <>
      <ol className="winners">
        {MEDALS.map((m, i) => {
          const w = item.winners[i];
          const sub = [detailed && w.chest && `Chest No. ${w.chest}`, w.cls && `Class ${w.cls}`, w.school]
            .filter(Boolean)
            .join(" · ");
          return (
            <motion.li
              key={m.pos}
              className={`row ${m.cls} ${w.name ? "" : "row-empty"}`}
              // 3rd is revealed first, 1st last - builds suspense like a wicket falling
              initial={{ x: -90, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: baseDelay + (2 - i) * 0.4, type: "spring", stiffness: 140, damping: 16 }}
            >
              <span className="rank">{m.pos}</span>
              <span className="w-info">
                <span className="w-name">{w.name || "—"}</span>
                {sub && <span className="w-sub">{sub}</span>}
              </span>
              {w.grade && <span className="grade-box">{w.grade}</span>}
            </motion.li>
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

/* ---------- Big scoreboard card ---------- */
function ResultCard({ item, fresh, onOpen, index }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 80, rotateX: -18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 160, damping: 20, delay: index * 0.15 }}
      className={`board ${fresh ? "board-fresh" : ""}`}
      onClick={() => onOpen(item)}
    >
      <div className="board-head">
        <span className="live-dot" />
        <span className="board-tag">RESULT</span>
        <span className="code">#{item.code}</span>
        {item.category && <span className={`tag tag-${item.category}`}>{item.category}</span>}
        {fresh && <span className="new-badge">NEW</span>}
      </div>
      <h3 className="board-title">{item.title}</h3>
      <WinnerList item={item} baseDelay={0.4 + index * 0.15} />
      <span className="shine" />
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

/* ---------- Bottom score bug: cycles through the latest results ---------- */
function ScoreBug({ items }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);
  const it = items[i % Math.max(items.length, 1)];
  if (!it) return null;
  return (
    <div className="bug">
      <span className="bug-label">LATEST</span>
      <div className="bug-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={it.key}
            className="bug-line"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <b>{it.title}</b> <i>{it.category}</i>
            <span>🥇 {it.winners[0].name || "—"}</span>
            {it.winners[1].name && <span>🥈 {it.winners[1].name}</span>}
            {it.winners[2].name && <span>🥉 {it.winners[2].name}</span>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Large stat tile with rolling number and progress bar ---------- */
function StatCard({ icon, label, value, total, tone, big = false, index = 0 }) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <motion.article
      className={`stat ${big ? "stat-big" : ""}`}
      style={{ "--tone": tone }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 170, damping: 18, delay: 0.1 + index * 0.08 }}
    >
      <span className="stat-icon">{icon}</span>
      <span className="stat-num">
        <Odometer value={value} />
        {total !== undefined && !big && <span className="stat-of">/{total}</span>}
      </span>
      <span className="stat-label">{label}</span>
      {total !== undefined && (
        <span className="stat-bar">
          <motion.span
            className="stat-fill"
            initial={{ width: 0 }}
            animate={{ width: `${value > 0 ? Math.max(pct, 3) : 0}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </span>
      )}
      {total !== undefined && big && <span className="stat-note">{value} of {total} items</span>}
    </motion.article>
  );
}

export default function App() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [fresh, setFresh] = useState({});
  const [banner, setBanner] = useState(null);
  const prev = useRef(null);
  // when each result appeared or changed on this device (kept in localStorage so a refresh doesn't lose the order)
  const seenAt = useRef(
    (() => {
      try { return JSON.parse(localStorage.getItem("kalo-changed-at") || "{}"); } catch { return {}; }
    })()
  );

  const [online, setOnline] = useState(false);
  const [syncedAt, setSyncedAt] = useState(null);

  useEffect(() => {
    const stopData = subscribeResults(
      (data) => {
        setError(null);
        setRaw(data);
        setSyncedAt(new Date()); // every change in the "kalo" node lands here
      },
      (err) => setError(err.message)
    );
    const stopConn = subscribeConnection(setOnline);
    return () => {
      stopData();
      stopConn();
    };
  }, []);

  const items = useMemo(() => (raw ? parseItems(raw) : []), [raw]);

  // detect newly published / changed results after first load
  useEffect(() => {
    if (!raw) return;
    const sig = Object.fromEntries(items.map((i) => [i.key, `${i.first}|${i.second}|${i.third}`]));
    if (prev.current) {
      const changed = items.filter((i) => i.published && sig[i.key] !== prev.current[i.key]);
      if (changed.length) {
        changed.forEach((c) => { seenAt.current[c.key] = Date.now(); });
        try { localStorage.setItem("kalo-changed-at", JSON.stringify(seenAt.current)); } catch { /* storage unavailable */ }
        setFresh((f) => ({ ...f, ...Object.fromEntries(changed.map((c) => [c.key, true])) }));
        setBanner(changed[0]);
        setTimeout(() => setBanner(null), 6000);
        setTimeout(
          () => setFresh((f) => { const n = { ...f }; changed.forEach((c) => delete n[c.key]); return n; }),
          30000
        );
      }
    }
    prev.current = sig;
  }, [items, raw]);

  const published = items.filter((i) => i.published);

  // Only the 3 most recently published results.
  // Recency = item's "publishedAt" time if present, else when it appeared on this page, else highest code.
  const stamp = (i) => i.publishedAt || seenAt.current[i.key] || 0;
  const latest = [...published]
    .sort((a, b) => stamp(b) - stamp(a) || Number(b.code) - Number(a.code))
    .slice(0, 3);

  return (
    <div className="app">
      <div className="bg-orbs"><i /><i /><i /></div>

      <div className="strip">
        <div className="strip-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>● LIVE RESULTS &nbsp; KALOLSAVAM &nbsp;</span>
          ))}
        </div>
      </div>

      <header className="hero">
        <motion.h1 initial={{ opacity: 0, y: -30, letterSpacing: "12px" }} animate={{ opacity: 1, y: 0, letterSpacing: "-0.5px" }} transition={{ duration: 0.9 }}>
          <span className="live"><b /> LIVE</span> Kalolsavam Results
        </motion.h1>
        <p className="sync-line">
          <span className={`sync-dot ${online ? "on" : ""}`} />
          {online ? "Connected" : "Connecting…"}
          {syncedAt && (
            <>
              {" · "}Last update{" "}
              <motion.b
                key={syncedAt.getTime()}
                initial={{ color: "#fbbf24", scale: 1.3 }}
                animate={{ color: "#e9d5ff", scale: 1 }}
                transition={{ duration: 1.4 }}
              >
                {syncedAt.toLocaleTimeString()}
              </motion.b>
            </>
          )}
        </p>
        <div className="stats">
          <StatCard big index={0} icon="📋" tone="#60a5fa" label="Total items" value={items.length} />
          <StatCard big index={1} icon="🏆" tone="#34d399" label="Results published" value={published.length} total={items.length} />
          {CATEGORIES.map((c, i) => (
            <StatCard
              key={c}
              index={i + 2}
              icon={{ LP: "🌱", UP: "📘", HS: "🎓", HSS: "🏅" }[c]}
              tone={{ LP: "#34d399", UP: "#60a5fa", HS: "#f472b6", HSS: "#a78bfa" }[c]}
              label={`${c} published`}
              value={published.filter((i2) => i2.category === c).length}
              total={items.filter((i2) => i2.category === c).length}
            />
          ))}
        </div>
      </header>

      <h2 className="section-title">Latest results</h2>

      {error && <div className="msg error">Could not read database: {error}</div>}
      {!raw && !error && <div className="msg"><span className="spinner" /> Loading results…</div>}

      {raw && (
        <main className="grid">
          <AnimatePresence mode="popLayout">
            {latest.map((it, idx) => (
              <ResultCard key={it.key} item={it} index={idx} fresh={!!fresh[it.key]} onOpen={setOpen} />
            ))}
          </AnimatePresence>
          {latest.length === 0 && <div className="msg">No results have been published yet.</div>}
        </main>
      )}

      <AnimatePresence>{open && <Modal item={open} onClose={() => setOpen(null)} />}</AnimatePresence>

      {/* Broadcast-style banner when a new result arrives */}
      <AnimatePresence>
        {banner && (
          <motion.div
            className="flash"
            initial={{ x: "-110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            onClick={() => { setOpen(banner); setBanner(null); }}
          >
            <span className="flash-burst" />
            <span className="flash-tag">🏏 NEW RESULT</span>
            <b>{banner.title} {banner.category}</b>
            <span>🥇 {banner.winners[0].name || "—"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ScoreBug items={latest} />
    </div>
  );
}

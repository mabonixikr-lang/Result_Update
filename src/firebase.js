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

/** Calls cb(true/false) whenever the connection to Firebase goes up or down. */
export function subscribeConnection(cb) {
  return onValue(ref(db, ".info/connected"), (snap) => cb(snap.val() === true));
}

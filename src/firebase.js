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

/** Subscribe to live results. Returns an unsubscribe function. */
export function subscribeResults(onData, onError) {
  // Results live under the "kalo" node of the Realtime Database
  const path = import.meta.env.VITE_RESULTS_PATH || "kalo";
  return onValue(ref(db, path), (snap) => onData(snap.val() || {}), onError);
}

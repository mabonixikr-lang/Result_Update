import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});

const db = getDatabase(app);

/** Subscribe to live results. Returns an unsubscribe function. */
export function subscribeResults(onData, onError) {
  // Results live under the "kalo" node of the Realtime Database
  const path = import.meta.env.VITE_RESULTS_PATH || "kalo";
  return onValue(ref(db, path), (snap) => onData(snap.val() || {}), onError);
}

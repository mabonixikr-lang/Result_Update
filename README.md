# Kalolsavam Results (React + Firebase Realtime Database)

Live, animated result publishing site. It listens to your Realtime Database, so a result
appears (with a "NEW" glow, toast and podium animation) the moment you fill `1`, `2`, `3`
under an item in the database.

## Run in VS Code

1. Open this folder in VS Code (`File > Open Folder`).
2. Open the terminal (`Ctrl + ~`) and run:
   ```bash
   npm install
   cp .env.example .env      # Windows: copy .env.example .env
   npm run dev
   ```
3. Open http://localhost:5173

## Firebase settings

- Edit `.env` if your database URL differs (Firebase console > Realtime Database > top of the page).
- **Rules:** the site only reads, so for public viewing use:
  ```json
  { "rules": { ".read": true, ".write": false } }
  ```
- Results are read from the `kalo` node (`VITE_RESULTS_PATH=kalo` in `.env`). Change it if your node name differs.
- The dashboard shows **published results only**; items with empty `1`, `2`, `3` are hidden until filled.

## Data format expected

```
"1000 NangiarKoothu HSS": { "1": "winner", "2": "winner", "3": "winner", "Name": "" }
```
- Key = `<code> <item title> <LP|UP|HS|HSS>` (category is read from the last word).
- An item counts as **published** once any of `1`, `2`, `3` is non-empty.
- The `Overall` node is ignored.

## Build / deploy

```bash
npm run build     # output in dist/ -> host on Firebase Hosting, GitHub Pages, Netlify...
```
For GitHub Pages set `base` in `vite.config.js` to `"/<repo-name>/"`.

## Files

- `src/firebase.js` – Firebase connection + live subscription
- `src/parse.js` – turns keys into code / title / category
- `src/App.jsx` – UI, filters, animations (framer-motion)
- `src/styles.css` – theme

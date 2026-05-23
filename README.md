# HaulSync 🛒

> India's quick-commerce price hunter. Compare Zepto, Blinkit, Instamart & JioMart — build your haul, pick the cheapest, checkout once.

## Tech Stack

- **React 18** + **Vite 5** — fast dev server & HMR
- **Tailwind CSS v3** — utility-first styling
- **lucide-react** — icon set
- **Google Fonts** — Unbounded (display) · Figtree (body) · Space Mono (prices)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (http://localhost:3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

## Project Structure

```
haulsync/
├── index.html              # Entry point — sets bg colour before React mounts
├── vite.config.js          # Vite + React plugin, /api proxy → localhost:5000
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx            # ReactDOM.createRoot
    ├── index.css           # Tailwind directives + scrollbar/selection styles
    ├── App.jsx             # Full application (Auth → Compare → Cart → Checkout → Hauls → Spends)
    ├── api.js              # Fetch wrapper for /api/* endpoints (graceful offline fallback)
    └── addresses.js        # localStorage-backed delivery address store
```

## Backend / API

The app runs fully offline in **mock mode** — no backend required to explore it.  
When a real backend is present on `http://localhost:5000`, Vite proxies `/api/*` to it automatically.

Expected endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| POST | `/api/users/signin` | `{ identifier, password }` → `{ user }` |
| POST | `/api/users/signup` | `{ identifier, password }` → `{ user }` |
| GET | `/api/orders` | Returns `{ orders: [...] }` |
| POST | `/api/orders` | Creates order(s) |

## Auth (Mock)

If the backend is unreachable, login auto-succeeds after 700 ms and creates a local user. Any identifier containing `"admin"` gets the admin role.

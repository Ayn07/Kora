/**
 * server.js — HaulSync Backend
 * ─────────────────────────────
 * Run:  npm install && npm run dev
 * Port: 4000 (override with PORT env var)
 *
 * Endpoints
 * ─────────────────────────────────────────
 *  GET  /api/health
 *  GET  /api/session/info
 *
 *  GET  /api/orders
 *  GET  /api/orders/:id
 *  POST /api/orders
 *
 *  GET    /api/addresses
 *  POST   /api/addresses
 *  PUT    /api/addresses/:id
 *  DELETE /api/addresses/:id
 *
 *  GET    /api/payments
 *  POST   /api/payments
 *  DELETE /api/payments/:id
 *
 *  GET    /api/apikeys
 *  POST   /api/apikeys
 *  DELETE /api/apikeys/:id
 *  POST   /api/apikeys/cookies
 *  GET    /api/apikeys/cookies/:platform
 */

const express      = require("express");
const cors         = require("cors");
const sessionMW    = require("./middleware/session");

const ordersRouter  = require("./routes/orders");
const addressRouter = require("./routes/addresses");
const paymentsRouter= require("./routes/payments");
const apikeysRouter = require("./routes/apikeys");

const PORT = process.env.PORT || 4000;
const app  = express();

// ── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    "http://localhost:5173",   // Vite dev server
    "http://localhost:3000",   // CRA / other dev server
    "http://127.0.0.1:5173",
  ],
  credentials: true,           // allow cookies cross-origin
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionMW);

// ── Request logger (dev) ─────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Session info (useful for debugging)
app.get("/api/session/info", (req, res) => {
  res.json({
    sessionId: req.session.id,
    cookie: {
      maxAge:  req.session.cookie.maxAge,
      expires: req.session.cookie.expires,
    },
  });
});

app.use("/api/orders",    ordersRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/payments",  paymentsRouter);
app.use("/api/apikeys",   apikeysRouter);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n HaulSync API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

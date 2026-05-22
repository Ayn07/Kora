/**
 * routes/apikeys.js
 *
 * Manages third-party platform API keys & cookies per session.
 * Keys are stored server-side; the client only ever sees metadata + a masked preview.
 *
 * GET    /api/apikeys               – list keys for this session
 * POST   /api/apikeys               – store a new key
 * DELETE /api/apikeys/:id           – revoke / remove a key
 * POST   /api/cookies               – store a raw cookie blob (for platform auth)
 * GET    /api/cookies/:platform     – retrieve cookie blob (server-use only)
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db, persist } = require("../db");

const router = express.Router();

const ALLOWED_PLATFORMS = ["zepto", "blinkit", "instamart", "jiomart", "custom"];

function mask(key) {
  if (!key || key.length < 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

function getKeyStore(req) {
  if (!db.apiKeys[req.session.id]) db.apiKeys[req.session.id] = [];
  return db.apiKeys[req.session.id];
}
function getCookieStore(req) {
  if (!db.cookies[req.session.id]) db.cookies[req.session.id] = {};
  return db.cookies[req.session.id];
}

// ── GET /api/apikeys ──────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const store = getKeyStore(req).map(({ rawKey, ...safe }) => safe); // strip raw value
  res.json({ success: true, keys: store });
});

// ── POST /api/apikeys ─────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { platform, label, rawKey, scopes } = req.body;

  if (!platform || !rawKey) {
    return res.status(400).json({ success: false, error: "platform and rawKey are required" });
  }
  if (!ALLOWED_PLATFORMS.includes(platform)) {
    return res.status(400).json({ success: false, error: `platform must be one of: ${ALLOWED_PLATFORMS.join(", ")}` });
  }

  const entry = {
    id:         uuidv4(),
    platform:   platform,
    label:      label    || `${platform} API Key`,
    rawKey:     rawKey,                 // stored server-side only
    maskedKey:  mask(rawKey),           // sent to client
    scopes:     Array.isArray(scopes) ? scopes : [],
    createdAt:  new Date().toISOString(),
    lastUsedAt: null,
  };

  getKeyStore(req).push(entry);
  persist();

  const { rawKey: _raw, ...safeEntry } = entry;
  res.status(201).json({ success: true, key: safeEntry });
});

// ── DELETE /api/apikeys/:id ───────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const store = getKeyStore(req);
  const before = store.length;
  db.apiKeys[req.session.id] = store.filter((k) => k.id !== req.params.id);
  persist();
  if (db.apiKeys[req.session.id].length === before) {
    return res.status(404).json({ success: false, error: "Key not found" });
  }
  res.json({ success: true });
});

// ── POST /api/cookies ─────────────────────────────────────────────────────────
router.post("/cookies", (req, res) => {
  const { platform, cookieBlob } = req.body;
  if (!platform || !cookieBlob) {
    return res.status(400).json({ success: false, error: "platform and cookieBlob are required" });
  }

  const store = getCookieStore(req);
  store[platform] = {
    blob:      cookieBlob,
    savedAt:   new Date().toISOString(),
  };
  persist();

  res.status(201).json({ success: true, platform, savedAt: store[platform].savedAt });
});

// ── GET /api/cookies/:platform ────────────────────────────────────────────────
// Intentionally returns the full blob — protect this endpoint with auth in production
router.get("/cookies/:platform", (req, res) => {
  const store = getCookieStore(req);
  const entry = store[req.params.platform];
  if (!entry) return res.status(404).json({ success: false, error: "No cookie stored for this platform" });
  res.json({ success: true, platform: req.params.platform, ...entry });
});

module.exports = router;

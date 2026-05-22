/**
 * routes/addresses.js
 *
 * GET    /api/addresses          – list saved addresses for session
 * POST   /api/addresses          – add a new address
 * PUT    /api/addresses/:id      – update an address
 * DELETE /api/addresses/:id      – remove an address
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db, persist } = require("../db");

const router = express.Router();

function getStore(req) {
  const sid = req.session.id;
  if (!db.addresses[sid]) db.addresses[sid] = [];
  return db.addresses[sid];
}

// ── GET ──────────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json({ success: true, addresses: getStore(req) });
});

// ── POST ─────────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { label, line, city, pincode, isDefault } = req.body;
  if (!line || !city) {
    return res.status(400).json({ success: false, error: "line and city are required" });
  }

  const store = getStore(req);

  // Only one default
  if (isDefault) store.forEach((a) => (a.isDefault = false));

  const address = {
    id:        uuidv4(),
    label:     label   || "Home",
    line:      line,
    city:      city,
    pincode:   pincode || "",
    isDefault: Boolean(isDefault) || store.length === 0,
    createdAt: new Date().toISOString(),
  };

  store.push(address);
  persist();

  res.status(201).json({ success: true, address });
});

// ── PUT ──────────────────────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const store = getStore(req);
  const idx = store.findIndex((a) => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ success: false, error: "Address not found" });

  if (req.body.isDefault) store.forEach((a) => (a.isDefault = false));

  store[idx] = { ...store[idx], ...req.body, id: req.params.id };
  persist();

  res.json({ success: true, address: store[idx] });
});

// ── DELETE ───────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const store = getStore(req);
  const before = store.length;
  db.addresses[req.session.id] = store.filter((a) => a.id !== req.params.id);
  persist();
  if (db.addresses[req.session.id].length === before) {
    return res.status(404).json({ success: false, error: "Address not found" });
  }
  res.json({ success: true });
});

module.exports = router;

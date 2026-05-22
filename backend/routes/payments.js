/**
 * routes/payments.js
 *
 * Stores saved payment method tokens per session.
 * In production, integrate with Razorpay / Stripe — never store raw card numbers.
 *
 * GET    /api/payments          – list saved payment methods
 * POST   /api/payments          – save a new method (masked details only)
 * DELETE /api/payments/:id      – remove a saved method
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db, persist } = require("../db");

const router = express.Router();

function getStore(req) {
  const sid = req.session.id;
  if (!db.paymentMethods[sid]) db.paymentMethods[sid] = [];
  return db.paymentMethods[sid];
}

// ── GET ──────────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json({ success: true, methods: getStore(req) });
});

// ── POST ─────────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  /**
   * Expected body (example for card):
   * {
   *   type: "card",           // "card" | "upi" | "wallet" | "cod"
   *   label: "HDFC Debit",
   *   maskedNumber: "•••• 4242",   // NEVER the full number
   *   upiId: "user@okaxis",        // for UPI
   *   walletName: "Paytm",         // for wallet
   *   isDefault: true
   * }
   */
  const { type, label, maskedNumber, upiId, walletName, isDefault } = req.body;

  if (!type) return res.status(400).json({ success: false, error: "type is required" });

  const store = getStore(req);
  if (isDefault) store.forEach((m) => (m.isDefault = false));

  const method = {
    id:           uuidv4(),
    type:         type,
    label:        label        || type,
    maskedNumber: maskedNumber || null,
    upiId:        upiId        || null,
    walletName:   walletName   || null,
    isDefault:    Boolean(isDefault) || store.length === 0,
    savedAt:      new Date().toISOString(),
  };

  store.push(method);
  persist();

  res.status(201).json({ success: true, method });
});

// ── DELETE ───────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const store = getStore(req);
  const before = store.length;
  db.paymentMethods[req.session.id] = store.filter((m) => m.id !== req.params.id);
  persist();
  if (db.paymentMethods[req.session.id].length === before) {
    return res.status(404).json({ success: false, error: "Method not found" });
  }
  res.json({ success: true });
});

module.exports = router;

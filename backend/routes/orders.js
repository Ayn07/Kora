/**
 * routes/orders.js
 *
 * GET  /api/orders          – list all orders (newest first)
 * GET  /api/orders/:id      – single order detail
 * POST /api/orders          – create a new order (checkout complete)
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { db, persist } = require("../db");

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildDateLabel(isoString) {
  const now  = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffH  = diffMs / (1000 * 60 * 60);

  if (diffH < 1)   return `${Math.round(diffMs / 60000)} mins ago`;
  if (diffH < 24) {
    return "Today, " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffH < 48) {
    return "Yesterday, " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    + ", " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── GET /api/orders ──────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  // Return orders sorted newest-first; refresh dateLabels on the fly.
  const hydrated = [...db.orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((o) => ({ ...o, dateLabel: buildDateLabel(o.date) }));

  res.json({ success: true, orders: hydrated });
});

// ── GET /api/orders/:id ──────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });
  res.json({ success: true, order: { ...order, dateLabel: buildDateLabel(order.date) } });
});

// ── POST /api/orders ─────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { platform, items, total, saved, couponUsed, paymentMethod, address } = req.body;

  if (!platform || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "platform and items[] are required" });
  }

  const now = new Date().toISOString();
  const order = {
    id:            "ORD-" + Math.floor(1000 + Math.random() * 9000),
    platform:      platform,
    date:          now,
    dateLabel:     buildDateLabel(now),
    total:         Number(total)  || 0,
    saved:         Number(saved)  || 0,
    couponUsed:    couponUsed     || null,
    paymentMethod: paymentMethod  || "upi",
    address:       address        || null,
    items:         items,
    sessionId:     req.session.id,
  };

  db.orders.unshift(order);
  persist();

  res.status(201).json({ success: true, order });
});

module.exports = router;

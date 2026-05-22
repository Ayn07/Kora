/**
 * db.js — Simple in-memory store with optional JSON-file persistence.
 *
 * Structure
 * ─────────
 *  db.orders          []        – placed orders / hauls
 *  db.addresses       {}        – keyed by sessionId → []
 *  db.paymentMethods  {}        – keyed by sessionId → []
 *  db.apiKeys         {}        – keyed by sessionId → []
 *  db.cookies         {}        – raw cookie blobs (per platform integration)
 */

const fs   = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

// ── Seed data (used when data.json doesn't exist yet) ───────────────────────
const SEED_ORDERS = [
  {
    id: "ORD-8821",
    platform: "zepto",
    date: "2025-05-22T05:00:00.000Z",
    dateLabel: "Today, 10:30 AM",
    total: 845,
    saved: 62,
    couponUsed: null,
    paymentMethod: "upi",
    address: { label: "Home", line: "12 Anand Nagar, Pune - 411007" },
    items: [
      { name: "Amul Taaza Toned Milk 1L",       qty: 2, price: 72  },
      { name: "Farmley Premium Makhana 100g",   qty: 1, price: 250 },
      { name: "Maggi 2-Minute Noodles 4-Pack",  qty: 1, price: 56  },
      { name: "Aashirvaad Whole Wheat Atta 5kg",qty: 1, price: 280 },
      { name: "Tata Salt 1kg",                  qty: 1, price: 26  },
    ],
  },
  {
    id: "ORD-4492",
    platform: "blinkit",
    date: "2025-05-21T12:45:00.000Z",
    dateLabel: "Yesterday, 6:15 PM",
    total: 420,
    saved: 0,
    couponUsed: null,
    paymentMethod: "card",
    address: { label: "Home", line: "12 Anand Nagar, Pune - 411007" },
    items: [
      { name: "Plum Tomatoes 1kg",          qty: 1, price: 80  },
      { name: "Mother Dairy Paneer 200g",   qty: 2, price: 85  },
      { name: "Fortune Sunflower Oil 1L",   qty: 1, price: 130 },
      { name: "Onion 1kg",                  qty: 1, price: 42  },
    ],
  },
  {
    id: "ORD-3301",
    platform: "instamart",
    date: "2025-05-18T10:30:00.000Z",
    dateLabel: "May 18, 4:00 PM",
    total: 612,
    saved: 38,
    couponUsed: "SAVE10",
    paymentMethod: "wallet",
    address: { label: "Office", line: "Plot 5, MIDC, Andheri East, Mumbai - 400093" },
    items: [
      { name: "Nestle KitKat 4-Finger",       qty: 3, price: 43  },
      { name: "Haldiram's Bhujia Sev 400g",   qty: 2, price: 108 },
      { name: "Britannia 5-Star Cake 6pc",    qty: 1, price: 72  },
      { name: "Surf Excel Easy Wash 1kg",     qty: 2, price: 132 },
    ],
  },
  {
    id: "ORD-2019",
    platform: "jiomart",
    date: "2025-05-15T05:30:00.000Z",
    dateLabel: "May 15, 11:00 AM",
    total: 398,
    saved: 45,
    couponUsed: "JIO15",
    paymentMethod: "upi",
    address: { label: "Home", line: "12 Anand Nagar, Pune - 411007" },
    items: [
      { name: "Fortune Sunflower Oil 1L",          qty: 2, price: 115 },
      { name: "Tata Salt 1kg",                     qty: 3, price: 24  },
      { name: "Fresho Banana 6pc",                 qty: 2, price: 35  },
      { name: "Aashirvaad Whole Wheat Atta 5kg",   qty: 1, price: 265 },
    ],
  },
];

// ── Load or initialise ───────────────────────────────────────────────────────
function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[db] Could not load data.json, starting fresh:", e.message);
  }
  return {
    orders:         SEED_ORDERS,
    addresses:      {},
    paymentMethods: {},
    apiKeys:        {},
    cookies:        {},
  };
}

const db = load();

// ── Persist to disk ──────────────────────────────────────────────────────────
function persist() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("[db] Persist failed:", e.message);
  }
}

module.exports = { db, persist };

/**
 * App.jsx — HaulSync Frontend v2
 *
 * Redesigned:
 * • Split-panel Auth screen (brand left, form right) with password toggle
 * • Per-user address persistence via addresses.js (localStorage, per-identifier)
 * • Typography: Syne (brand/headings) + Outfit (body) + JetBrains Mono (prices/data)
 * • Refined UI throughout — spacing, hierarchy, and micro-interactions
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingBag, Receipt, Search, ShoppingCart, Plus, Minus, Trash2,
  CheckCircle2, CreditCard, Smartphone, Wallet, Banknote, ChevronRight,
  ArrowLeft, Ticket, TrendingUp, Zap, Package, Clock, BarChart2,
  X, Check, Sparkles, MapPin, Wifi, WifiOff, RefreshCw, Home, Briefcase,
  LogOut, ShieldAlert, Eye, EyeOff,
} from "lucide-react";
import { api } from "./api.js";
import { getAddresses, saveAddress, removeAddress } from "./addresses.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PLATFORMS = {
  zepto: {
    name: "Zepto", short: "Z", bg: "bg-violet-600", ring: "ring-violet-500",
    text: "text-violet-400", badge: "bg-violet-500/15 text-violet-300 border-violet-500/25", bar: "bg-violet-500",
  },
  blinkit: {
    name: "Blinkit", short: "B", bg: "bg-yellow-400", ring: "ring-yellow-400",
    text: "text-yellow-400", badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/25", bar: "bg-yellow-400",
  },
  instamart: {
    name: "Instamart", short: "I", bg: "bg-orange-500", ring: "ring-orange-500",
    text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300 border-orange-500/25", bar: "bg-orange-500",
  },
  jiomart: {
    name: "JioMart", short: "J", bg: "bg-blue-600", ring: "ring-blue-500",
    text: "text-blue-400", badge: "bg-blue-500/15 text-blue-300 border-blue-500/25", bar: "bg-blue-500",
  },
};

const PRODUCTS = [
  { id: "p1",  name: "Aashirvaad Whole Wheat Atta 5kg",  category: "Staples",    emoji: "🌾", prices: { zepto: 280, blinkit: 285, instamart: 290, jiomart: 265 } },
  { id: "p2",  name: "Amul Taaza Toned Milk 1L",          category: "Dairy",      emoji: "🥛", prices: { zepto: 72,  blinkit: 70,  instamart: 70,  jiomart: 68  } },
  { id: "p3",  name: "Maggi 2-Minute Noodles 4-Pack",     category: "Snacks",     emoji: "🍜", prices: { zepto: 56,  blinkit: 56,  instamart: 56,  jiomart: 52  } },
  { id: "p4",  name: "Fortune Sunflower Oil 1L",          category: "Staples",    emoji: "🫙", prices: { zepto: 125, blinkit: 130, instamart: 128, jiomart: 115 } },
  { id: "p5",  name: "Mother Dairy Paneer 200g",          category: "Dairy",      emoji: "🧀", prices: { zepto: 85,  blinkit: 85,  instamart: 88,  jiomart: 82  } },
  { id: "p6",  name: "Haldiram's Bhujia Sev 400g",        category: "Snacks",     emoji: "🥨", prices: { zepto: 110, blinkit: 115, instamart: 108, jiomart: 105 } },
  { id: "p7",  name: "Surf Excel Easy Wash 1kg",          category: "Home",       emoji: "🧺", prices: { zepto: 130, blinkit: 130, instamart: 132, jiomart: 118 } },
  { id: "p8",  name: "Onion (Pyaz) 1kg",                  category: "Vegetables", emoji: "🧅", prices: { zepto: 35,  blinkit: 42,  instamart: 38,  jiomart: 29  } },
  { id: "p9",  name: "Britannia 5-Star Cake 6pc",         category: "Snacks",     emoji: "🎂", prices: { zepto: 75,  blinkit: 75,  instamart: 72,  jiomart: 70  } },
  { id: "p10", name: "Tata Salt 1kg",                     category: "Staples",    emoji: "🧂", prices: { zepto: 26,  blinkit: 26,  instamart: 25,  jiomart: 24  } },
  { id: "p11", name: "Fresho Banana 6pc",                 category: "Vegetables", emoji: "🍌", prices: { zepto: 40,  blinkit: 38,  instamart: 42,  jiomart: 35  } },
  { id: "p12", name: "Nestle KitKat 4-Finger",            category: "Snacks",     emoji: "🍫", prices: { zepto: 45,  blinkit: 45,  instamart: 43,  jiomart: 42  } },
];

const PAYMENT_METHODS_CONFIG = [
  { id: "upi",    label: "UPI",          sub: "GPay, PhonePe, Paytm",    icon: Smartphone },
  { id: "card",   label: "Cards",        sub: "Credit & Debit",          icon: CreditCard },
  { id: "wallet", label: "Wallets",      sub: "Amazon Pay, Mobikwik",    icon: Wallet },
  { id: "cod",    label: "Cash on Del.", sub: "Pay at door",             icon: Banknote },
];

const SEED_HAULS = [
  {
    id: "ORD-8821", platform: "zepto",   date: "2025-05-22T05:00:00.000Z",
    dateLabel: "Today, 10:30 AM",    total: 845, saved: 62, couponUsed: null,
    paymentMethod: "upi",
    items: [{ name: "Amul Taaza Toned Milk 1L", qty: 2, price: 72 }, { name: "Farmley Makhana 100g", qty: 1, price: 250 }],
  },
  {
    id: "ORD-4492", platform: "blinkit", date: "2025-05-21T12:45:00.000Z",
    dateLabel: "Yesterday, 6:15 PM", total: 420, saved: 0,  couponUsed: null,
    paymentMethod: "card",
    items: [{ name: "Plum Tomatoes 1kg", qty: 1, price: 80 }, { name: "Mother Dairy Paneer 200g", qty: 2, price: 85 }],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function cheapestEntry(prices) {
  return Object.entries(prices).reduce((a, b) => (b[1] < a[1] ? b : a));
}

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function nowIST() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function buildOrderId() {
  return "ORD-" + Math.floor(1000 + Math.random() * 9000);
}

function buildDateLabel(isoString) {
  const now  = new Date();
  const date = new Date(isoString);
  const diffH = (now - date) / 3600000;
  if (diffH < 1)  return `${Math.round((now - date) / 60000)} mins ago`;
  if (diffH < 24) return "Today, "     + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diffH < 48) return "Yesterday, " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
         ", " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ─── FONT HOOK ────────────────────────────────────────────────────────────────

function useFonts() {
  useEffect(() => {
    if (document.getElementById("hs-gfonts")) return;
    const link = document.createElement("link");
    link.id   = "hs-gfonts";
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const FONT_BODY    = "'Outfit', system-ui, sans-serif";
const FONT_BRAND   = "'Syne', system-ui, sans-serif";
const FONT_MONO    = "'JetBrains Mono', 'Courier New', monospace";

// ─── AUTH VIEW ────────────────────────────────────────────────────────────────

function AuthView({ onLogin }) {
  useFonts();
  const [mode, setMode]           = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/users/signin" : "/api/users/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || "Authentication failed. Please try again.");
        setLoading(false);
      }
    } catch {
      // Fallback: local simulation when backend is offline
      setTimeout(() => {
        onLogin({
          id:         generateId(),
          identifier,
          role: identifier.includes("admin") ? "admin" : "user",
        });
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-950 flex" style={{ fontFamily: FONT_BODY }}>

      {/* ── Left brand panel — desktop only ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-zinc-800/60 relative overflow-hidden p-10"
        style={{ background: "linear-gradient(160deg, #0f1a13 0%, #090c0a 100%)" }}>

        {/* Dot-grid background */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

        {/* Glow accent */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />

        {/* Brand top */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <ShoppingBag className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: FONT_BRAND }}>
              HaulSync
            </span>
          </div>

          <h1 className="text-[2.6rem] font-black text-white leading-[1.15] mb-5"
            style={{ fontFamily: FONT_BRAND }}>
            Smarter grocery,
            <br />
            <span className="text-emerald-400">best price.</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-xs">
            Compare across Zepto, Blinkit, Instamart & JioMart in real time.
            One cart, one checkout, maximum savings.
          </p>

          <div className="space-y-3.5">
            {[
              { icon: Search,       text: "Real-time price comparison" },
              { icon: ShoppingCart, text: "Multi-platform cart & checkout" },
              { icon: BarChart2,    text: "Spend analytics & haul history" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform badges bottom */}
        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-3">
            Supported platforms
          </p>
          <div className="flex gap-2.5">
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <div key={key}
                className={`w-10 h-10 ${p.bg} rounded-xl flex items-center justify-center text-xs font-black text-zinc-950 shadow-lg`}
                title={p.name}>
                {p.short}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-10">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShoppingBag className="w-4 h-4 text-zinc-950" />
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: FONT_BRAND }}>
              HaulSync
            </span>
          </div>

          {/* Tab toggle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 flex mb-8">
            {[["login", "Sign In"], ["signup", "Create Account"]].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: FONT_BRAND }}>
              {mode === "login" ? "Welcome back" : "Join HaulSync"}
            </h2>
            <p className="text-zinc-500 text-sm">
              {mode === "login"
                ? "Sign in to access your hauls and saved addresses."
                : "Create an account to start tracking your grocery savings."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Email or Phone
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210  or  you@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/8 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                <X className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-60 text-zinc-950 font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  Please wait…
                </>
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── SMALL ATOMS ──────────────────────────────────────────────────────────────

function PlatformDot({ platformKey, size = "sm" }) {
  const p = PLATFORMS[platformKey];
  const s = size === "sm" ? "w-5 h-5 text-[9px]" : "w-7 h-7 text-xs";
  return (
    <span className={`${s} ${p.bg} rounded-full flex items-center justify-center font-black text-zinc-950 shrink-0`}>
      {p.short}
    </span>
  );
}

function ClockDisplay({ compact = false }) {
  const [time, setTime] = useState(nowIST());
  useEffect(() => {
    const id = setInterval(() => setTime(nowIST()), 1000);
    return () => clearInterval(id);
  }, []);

  const mm      = String(time.getMinutes()).padStart(2, "0");
  const ss      = String(time.getSeconds()).padStart(2, "0");
  const period  = time.getHours() < 12 ? "AM" : "PM";
  const h12     = time.getHours() % 12 || 12;
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  if (compact) {
    return (
      <span className="text-xs text-zinc-500 tabular-nums" style={{ fontFamily: FONT_MONO }}>
        {String(h12).padStart(2, "0")}:{mm}:{ss} {period}
      </span>
    );
  }

  return (
    <div className="px-5 py-4 border-t border-zinc-900/80">
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="w-3 h-3 text-zinc-700" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">IST</span>
      </div>
      <div className="tabular-nums" style={{ fontFamily: FONT_MONO }}>
        <span className="text-[1.6rem] font-bold text-white leading-none">
          {String(h12).padStart(2, "0")}:{mm}
        </span>
        <span className="text-base text-zinc-600">:{ss}</span>
        <span className="text-xs text-zinc-700 ml-1.5">{period}</span>
      </div>
      <p className="text-[11px] text-zinc-700 mt-1">{dateStr}</p>
    </div>
  );
}

function BackendBadge({ online }) {
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
      online
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
        : "bg-zinc-800/80 text-zinc-500 border-zinc-700/60"
    }`}>
      {online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
      {online ? "Live" : "Offline"}
    </span>
  );
}

function SideNavItem({ icon: Icon, label, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
      }`}
    >
      <Icon className="w-[15px] h-[15px] shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-emerald-500 text-zinc-950 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function BottomNavItem({ icon: Icon, label, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all ${
        isActive ? "text-emerald-400" : "text-zinc-600"
      }`}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-zinc-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: FONT_BRAND }}>
        {title}
      </h2>
      {sub && <p className="text-zinc-500 text-sm mt-1">{sub}</p>}
    </div>
  );
}

// ─── COMPARE / SEARCH ────────────────────────────────────────────────────────

function CompareView({ onAddToCart }) {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

  const filtered = useMemo(() =>
    PRODUCTS.filter((p) =>
      (query === "" || p.name.toLowerCase().includes(query.toLowerCase())) &&
      (category === "All" || p.category === category)
    ), [query, category]
  );

  return (
    <div className="pb-8">
      <SectionHeader title="Find Best Price" sub="Compare across all 4 platforms in real time" />

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search atta, milk, maggi…"
          className="w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-6 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c
                ? "bg-emerald-500 text-zinc-950"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl text-sm">
          No products found for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [cheapPlat]     = cheapestEntry(product.prices);
  const [selected, setSelected] = useState(cheapPlat);
  const [added, setAdded]       = useState(false);

  const selectedPrice    = product.prices[selected];
  const isSelectedCheapest = selected === cheapPlat;

  const handleAdd = () => {
    onAddToCart(product, selected, selectedPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 flex flex-col transition-all duration-200 hover:bg-zinc-900/80">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-zinc-800/80 rounded-xl flex items-center justify-center text-xl shrink-0">
          {product.emoji}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-0.5 block">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug">{product.name}</h3>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: FONT_MONO }}>
            ₹{selectedPrice}
          </span>
          {isSelectedCheapest && (
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Best
            </span>
          )}
        </div>

        <div className="flex gap-1.5 mb-3">
          {Object.entries(product.prices).map(([plat, price]) => {
            const p      = PLATFORMS[plat];
            const isSel  = plat === selected;
            const isCheap = plat === cheapPlat;
            return (
              <button
                key={plat}
                onClick={() => setSelected(plat)}
                title={`${p.name}: ₹${price}`}
                className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl border transition-all ${
                  isSel
                    ? "border-zinc-600 bg-zinc-800 shadow-sm"
                    : "border-transparent bg-zinc-800/40 hover:bg-zinc-800/70 opacity-60 hover:opacity-90"
                }`}
              >
                <span className={`w-5 h-5 ${p.bg} rounded-full flex items-center justify-center text-[9px] font-black text-zinc-950 mb-1`}>
                  {p.short}
                </span>
                <span className={`text-[9px] font-bold tabular-nums ${isSel ? "text-zinc-100" : "text-zinc-500"}`}
                  style={{ fontFamily: FONT_MONO }}>
                  ₹{price}
                </span>
                {isCheap && !isSel && <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            added
              ? "bg-emerald-500 text-zinc-950"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:scale-[0.98]"
          }`}
        >
          {added
            ? <><Check className="w-4 h-4" /> Added!</>
            : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────

function CartView({ cart, updateQty, onCheckout }) {
  const grouped = useMemo(() =>
    cart.reduce((acc, item) => {
      if (!acc[item.platform]) acc[item.platform] = { items: [], subtotal: 0 };
      acc[item.platform].items.push(item);
      acc[item.platform].subtotal += item.price * item.qty;
      return acc;
    }, {}), [cart]
  );

  const grandTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-5">
          <ShoppingCart className="w-8 h-8 text-zinc-700" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: FONT_BRAND }}>Cart is empty</h2>
        <p className="text-zinc-500 text-sm max-w-xs">Use Search & Compare to find the best prices.</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <SectionHeader
        title="Multi-Store Cart"
        sub={`${cart.length} item${cart.length !== 1 ? "s" : ""} · ${Object.keys(grouped).length} platform${Object.keys(grouped).length !== 1 ? "s" : ""}`}
      />

      <div className="space-y-4 mb-6">
        {Object.entries(grouped).map(([platKey, { items, subtotal }]) => {
          const p = PLATFORMS[platKey];
          return (
            <div key={platKey} className="border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <PlatformDot platformKey={platKey} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-zinc-600">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${p.text} tabular-nums`} style={{ fontFamily: FONT_MONO }}>
                  {formatINR(subtotal)}
                </span>
              </div>

              {items.map((item) => (
                <div key={item.cartId} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 last:border-0 bg-zinc-950/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tabular-nums mr-1" style={{ fontFamily: FONT_MONO }}>
                      {formatINR(item.price * item.qty)}
                    </span>
                    <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.cartId, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        {item.qty === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.cartId, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-800">
          <span className="text-zinc-500 text-sm">Platforms</span>
          <div className="flex gap-1.5">{Object.keys(grouped).map((k) => <PlatformDot key={k} platformKey={k} />)}</div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-300 font-semibold text-sm">Grand Total</span>
          <span className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
            {formatINR(grandTotal)}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm"
      >
        <Zap className="w-4 h-4" /> Proceed to Checkout <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── ADDRESS SECTION ──────────────────────────────────────────────────────────
// Addresses are keyed per-user and persisted to localStorage via addresses.js.

function AddressSection({ backendOnline, onSelect, selectedId, currentUser }) {
  const userId = currentUser.identifier;

  // Load from localStorage on mount — addresses.js handles per-user isolation
  const [addressesMap, setAddressesMap] = useState(() => getAddresses(userId));
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({ label: "Home", line: "", city: "", pincode: "" });
  const [saving,  setSaving]  = useState(false);

  // If backend comes online, merge remote addresses (remote wins for backend-stored ones)
  useEffect(() => {
    if (!backendOnline) return;
    api.addresses?.list().then((r) => {
      if (r?.ok && r.addresses) {
        const merged = { ...getAddresses(userId) };
        r.addresses.forEach((addr) => { merged[addr.id] = addr; });
        setAddressesMap(merged);
      }
    }).catch(() => {});
  }, [backendOnline, userId]);

  const handleSave = async () => {
    if (!form.line || !form.city) return;
    setSaving(true);

    let newAddress;

    if (backendOnline) {
      try {
        const r = await fetch(`/api/users/${userId}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, isDefault: Object.keys(addressesMap).length === 0 }),
        });
        if (r.ok) {
          const data = await r.json();
          newAddress = { id: data.addressId, ...form };
        }
      } catch {}
    }

    // Fallback: local-only
    if (!newAddress) {
      newAddress = { id: "addr-" + generateId(), ...form };
    }

    // Persist to localStorage via addresses.js, keyed by userId
    const updated = saveAddress(userId, newAddress);
    setAddressesMap(updated);
    onSelect(newAddress.id);

    setAdding(false);
    setSaving(false);
    setForm({ label: "Home", line: "", city: "", pincode: "" });
  };

  const handleDelete = async (id) => {
    if (backendOnline) {
      try { await api.addresses?.remove(id); } catch {}
    }

    // O(1) delete via addresses.js
    const updated = removeAddress(userId, id);
    setAddressesMap(updated);
    if (selectedId === id) onSelect(null);
  };

  const labelIcons = {
    Home:   <Home className="w-3 h-3" />,
    Office: <Briefcase className="w-3 h-3" />,
    Other:  <MapPin className="w-3 h-3" />,
  };

  const hasAddresses = Object.keys(addressesMap).length > 0;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Delivery Address</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
        >
          {adding ? "Cancel" : "+ Add New"}
        </button>
      </div>

      {hasAddresses && (
        <div className="space-y-2 mb-3">
          {Object.entries(addressesMap).map(([id, addr]) => (
            <div
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedId === id
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                selectedId === id ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"
              }`}>
                {selectedId === id && <Check className="w-3 h-3 text-zinc-950" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  {labelIcons[addr.label] ?? <MapPin className="w-3 h-3" />}
                  {addr.label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                  {addr.line}, {addr.city} {addr.pincode}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(id); }}
                className="text-zinc-700 hover:text-red-400 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(adding || !hasAddresses) && (
        <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 space-y-3">
          <div className="flex gap-2">
            {["Home", "Office", "Other"].map((lbl) => (
              <button
                key={lbl}
                onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  form.label === lbl
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <input
            value={form.line}
            onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}
            placeholder="Street address, apartment, floor…"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <div className="flex gap-2">
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
              className="flex-1 bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <input
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
              placeholder="Pincode"
              maxLength={6}
              className="w-24 bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !form.line || !form.city}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg text-xs font-bold text-zinc-300 transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-3 h-3 border border-zinc-500 border-t-zinc-200 rounded-full animate-spin" /> Saving…</>
              : "Save Address"}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

function CheckoutView({ cart, onBack, onOrderComplete, backendOnline, currentUser }) {
  const grouped = useMemo(() =>
    cart.reduce((acc, item) => {
      if (!acc[item.platform]) acc[item.platform] = { items: [], subtotal: 0 };
      acc[item.platform].items.push(item);
      acc[item.platform].subtotal += item.price * item.qty;
      return acc;
    }, {}), [cart]
  );

  const platforms = Object.keys(grouped);

  const [coupons,     setCoupons]     = useState(() => platforms.reduce((a, p) => ({ ...a, [p]: "" }), {}));
  const [applied,     setApplied]     = useState({});
  const [payMethod,   setPayMethod]   = useState("upi");
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paying,      setPaying]      = useState(false);
  const [paid,        setPaid]        = useState(false);

  const applyCoupon = (plat) => {
    if (coupons[plat].trim().length >= 3) setApplied((p) => ({ ...p, [plat]: true }));
  };
  const removeCoupon = (plat) => {
    setApplied((p) => ({ ...p, [plat]: false }));
    setCoupons((p) => ({ ...p, [plat]: "" }));
  };

  const totalMRP      = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalDiscount = platforms.reduce((s, plat) =>
    s + (applied[plat] ? Math.round(grouped[plat].subtotal * 0.1) : 0), 0);
  const grandTotal    = totalMRP - totalDiscount;

  const handlePay = async () => {
    setPaying(true);

    const newOrders = await Promise.all(
      platforms.map(async (plat) => {
        const { items, subtotal } = grouped[plat];
        const saved = applied[plat] ? Math.round(subtotal * 0.1) : 0;
        const order = {
          id:            buildOrderId(),
          platform:      plat,
          date:          new Date().toISOString(),
          dateLabel:     "Just now",
          total:         subtotal - saved,
          saved,
          couponUsed:    applied[plat] ? coupons[plat].toUpperCase() : null,
          paymentMethod: payMethod,
          address:       selectedAddr ? { id: selectedAddr } : null,
          items:         items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        };

        if (backendOnline) {
          try {
            const r = await api.orders.create(order);
            return r.ok ? r.order : order;
          } catch {}
        }
        return order;
      })
    );

    setPaid(true);
    setTimeout(() => onOrderComplete(newOrders), 1000);
  };

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: FONT_BRAND }}>
          Order{platforms.length > 1 ? "s" : ""} Placed!
        </h2>
        <p className="text-zinc-500 text-sm">Redirecting to your hauls…</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <SectionHeader title="Checkout" sub="Review your order, then pay" />

      <AddressSection
        backendOnline={backendOnline}
        onSelect={setSelectedAddr}
        selectedId={selectedAddr}
        currentUser={currentUser}
      />

      {/* Platform coupons */}
      <section className="mb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Platform Coupons</h3>
        <div className="space-y-3">
          {platforms.map((plat) => {
            const p         = PLATFORMS[plat];
            const isApplied = applied[plat];
            return (
              <div
                key={plat}
                className={`border rounded-xl p-4 transition-colors ${
                  isApplied ? "border-emerald-500/25 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformDot platformKey={plat} />
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500 tabular-nums" style={{ fontFamily: FONT_MONO }}>
                    {formatINR(grouped[plat].subtotal)}
                  </span>
                </div>
                {isApplied ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        {coupons[plat].toUpperCase()} — 10% off applied!
                      </span>
                    </div>
                    <button onClick={() => removeCoupon(plat)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={coupons[plat]}
                      onChange={(e) => setCoupons((prev) => ({ ...prev, [plat]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon(plat)}
                      placeholder={`Enter ${p.name} coupon`}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button
                      onClick={() => applyCoupon(plat)}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment method */}
      <section className="mb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS_CONFIG.map(({ id, label, sub, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPayMethod(id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                payMethod === id
                  ? "border-emerald-500/50 bg-emerald-500/8"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2.5 ${payMethod === id ? "text-emerald-400" : "text-zinc-500"}`} />
              <p className={`text-xs font-bold ${payMethod === id ? "text-emerald-300" : "text-zinc-300"}`}>{label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="mb-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Order Summary</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Total MRP</span>
            <span className="text-zinc-300 tabular-nums" style={{ fontFamily: FONT_MONO }}>{formatINR(totalMRP)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Coupon Discount</span>
              <span className="text-emerald-400 font-semibold tabular-nums" style={{ fontFamily: FONT_MONO }}>
                −{formatINR(totalDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Delivery</span>
            <span className="text-emerald-400 font-semibold">FREE</span>
          </div>
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
            <span className="font-bold text-white text-sm">Grand Total</span>
            <span className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>
      </section>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 active:scale-[0.99] text-zinc-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-base"
      >
        {paying ? (
          <><span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" /> Processing…</>
        ) : (
          <>Pay {formatINR(grandTotal)}</>
        )}
      </button>
    </div>
  );
}

// ─── MY HAULS ─────────────────────────────────────────────────────────────────

function HaulsView({ hauls, loading, onRefresh }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const p = PLATFORMS[selected.platform];
    return (
      <div className="pb-8">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hauls
        </button>

        <div className="border border-zinc-800/50 rounded-2xl overflow-hidden mb-4">
          <div className="px-5 py-4 bg-zinc-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlatformDot platformKey={selected.platform} size="md" />
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: FONT_BRAND }}>{p.name} Order</p>
                  <p className="text-xs text-zinc-500">{selected.dateLabel || buildDateLabel(selected.date)}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-600 tabular-nums" style={{ fontFamily: FONT_MONO }}>
                {selected.id}
              </span>
            </div>
            {selected.couponUsed && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <Ticket className="w-3 h-3" /> Coupon: {selected.couponUsed}
              </div>
            )}
          </div>

          <div className="divide-y divide-zinc-800/60">
            {selected.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 bg-zinc-950/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-600 w-5 tabular-nums">{item.qty}×</span>
                  <span className="text-sm text-zinc-200">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
                  {formatINR(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-900/40">
            {selected.saved > 0 && (
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-zinc-500 text-sm">Saved</span>
                <span className="text-emerald-400 text-sm font-semibold tabular-nums" style={{ fontFamily: FONT_MONO }}>
                  −{formatINR(selected.saved)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800 mt-1">
              <span className="font-bold text-white text-sm">Total Paid</span>
              <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
                {formatINR(selected.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-7">
        <SectionHeader
          title="My Hauls"
          sub={`${hauls.length} order${hauls.length !== 1 ? "s" : ""} total`}
        />
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : hauls.length === 0 ? (
        <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl text-sm">
          No hauls yet — place your first order!
        </div>
      ) : (
        <div className="space-y-3">
          {hauls.map((haul) => {
            const p       = PLATFORMS[haul.platform];
            const preview = haul.items.slice(0, 2).map((i) => `${i.qty}× ${i.name.split(" ").slice(0, 2).join(" ")}`).join(", ");
            const more    = haul.items.length - 2;
            return (
              <button
                key={haul.id}
                onClick={() => setSelected(haul)}
                className="w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformDot platformKey={haul.platform} size="md" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        {haul.saved > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">
                            Saved {formatINR(haul.saved)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {haul.dateLabel || buildDateLabel(haul.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
                      {formatINR(haul.total)}
                    </p>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 ml-auto mt-1 transition-colors" />
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-3 pl-10 truncate">
                  {preview}{more > 0 ? ` +${more} more` : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SPENDS ───────────────────────────────────────────────────────────────────

function SpendsView({ hauls }) {
  const spendsByPlatform = hauls.reduce((acc, haul) => {
    acc[haul.platform] = (acc[haul.platform] || 0) + haul.total;
    return acc;
  }, {});

  const total      = Object.values(spendsByPlatform).reduce((a, b) => a + b, 0) || 0;
  const totalSaved = hauls.reduce((s, h) => s + (h.saved || 0), 0);
  const sorted     = Object.entries(spendsByPlatform).sort((a, b) => b[1] - a[1]);

  return (
    <div className="pb-8">
      <SectionHeader title="Spend Analytics" sub="Breakdown of your grocery spending" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Spent",  value: formatINR(total),      icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Saved",  value: formatINR(totalSaved), icon: Sparkles,   color: "text-violet-400",  bg: "bg-violet-500/10"  },
          { label: "Orders",       value: hauls.length,          icon: Package,    color: "text-blue-400",    bg: "bg-blue-500/10"    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3.5">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2.5`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-lg font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
              {value}
            </p>
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-5">By Platform</h3>
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">No spend data yet</p>
        ) : (
          <div className="space-y-5">
            {sorted.map(([platKey, amount]) => {
              const p   = PLATFORMS[platKey];
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              const cnt = hauls.filter((h) => h.platform === platKey).length;
              return (
                <div key={platKey}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PlatformDot platformKey={platKey} />
                      <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                      <span className="text-xs text-zinc-600">{cnt} order{cnt !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white tabular-nums" style={{ fontFamily: FONT_MONO }}>
                        {formatINR(amount)}
                      </span>
                      <span className="text-xs text-zinc-600 tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.bar} rounded-full`}
                      style={{ width: `${pct}%`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  useFonts();

  const [currentUser,   setCurrentUser]   = useState(null);
  const [tab,           setTab]           = useState("search");
  const [cart,          setCart]          = useState([]);
  const [hauls,         setHauls]         = useState(SEED_HAULS);
  const [haulsLoading,  setHaulsLoading]  = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    if (api?.health) {
      api.health().then((r) => setBackendOnline(r.ok)).catch(() => setBackendOnline(false));
    }
  }, []);

  const fetchHauls = useCallback(async () => {
    if (!backendOnline || !api?.orders) return;
    setHaulsLoading(true);
    try {
      const r = await api.orders.list();
      if (r.ok && r.orders) setHauls(r.orders);
    } catch {}
    setHaulsLoading(false);
  }, [backendOnline]);

  useEffect(() => {
    if (currentUser) fetchHauls();
  }, [fetchHauls, currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setTab("search");
  };

  if (!currentUser) {
    return <AuthView onLogin={setCurrentUser} />;
  }

  // ── Cart helpers ──────────────────────────────────────────────────────────

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product, platform, price) => {
    setCart((prev) => {
      const key = `${product.id}_${platform}`;
      const idx = prev.findIndex((i) => i.cartId === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { cartId: key, productId: product.id, name: product.name, platform, price, qty: 1 }];
    });
  };

  const updateQty = (cartId, delta) => {
    setCart((prev) =>
      prev.map((i) => i.cartId === cartId ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0)
    );
  };

  const handleOrderComplete = (newOrders) => {
    setHauls((prev) => [...newOrders, ...prev]);
    setCart([]);
    setTab("hauls");
  };

  // ── Nav config ────────────────────────────────────────────────────────────

  const NAV = [
    { id: "search",  label: "Compare",  icon: Search },
    { id: "cart",    label: "Cart",     icon: ShoppingCart, badge: cartCount },
    { id: "hauls",   label: "Hauls",    icon: Receipt },
    { id: "spends",  label: "Spends",   icon: BarChart2 },
  ];

  // User initial for avatar
  const userInitial = (currentUser.identifier?.[0] ?? "U").toUpperCase();

  return (
    <div
      className="flex h-dvh w-full bg-zinc-950 text-zinc-50 overflow-hidden"
      style={{ fontFamily: FONT_BODY }}
    >

      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-zinc-900/80 bg-zinc-950 z-20">

        {/* Logo + backend status */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShoppingBag className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-none"
                style={{ fontFamily: FONT_BRAND }}>
                HaulSync
              </h1>
              <p className="text-[9px] text-zinc-700 font-medium mt-0.5">Quick-commerce</p>
            </div>
          </div>
          <BackendBadge online={backendOnline} />
        </div>

        {/* User account section */}
        <div className="px-4 py-3.5 border-b border-zinc-900/80 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-zinc-300" style={{ fontFamily: FONT_BRAND }}>
              {userInitial}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider">Signed in as</p>
            <p className="text-xs font-medium text-zinc-300 truncate" title={currentUser.identifier}>
              {currentUser.identifier}
            </p>
            {currentUser.role === "admin" && (
              <span className="text-[9px] font-bold text-red-400 flex items-center gap-1 mt-0.5">
                <ShieldAlert className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-red-500/20 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SideNavItem icon={Search}       label="Compare Prices"   isActive={tab === "search"}                    onClick={() => setTab("search")} />
          <SideNavItem icon={ShoppingCart} label="Cart"             isActive={tab === "cart" || tab === "checkout"} onClick={() => setTab("cart")} badge={cartCount} />
          <div className="pt-4 pb-1 px-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">History</p>
          </div>
          <SideNavItem icon={Receipt}   label="My Hauls"         isActive={tab === "hauls"}  onClick={() => setTab("hauls")} />
          <SideNavItem icon={BarChart2} label="Spend Analytics"  isActive={tab === "spends"} onClick={() => setTab("spends")} />
        </nav>

        {/* Clock */}
        <ClockDisplay />
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
            </div>
            <h1 className="text-base font-bold text-white" style={{ fontFamily: FONT_BRAND }}>
              HaulSync
            </h1>
          </div>
          <button onClick={handleLogout} className="text-zinc-600 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6 pb-24 md:pb-6">
          {tab === "search"   && <CompareView onAddToCart={addToCart} />}
          {tab === "cart"     && <CartView cart={cart} updateQty={updateQty} onCheckout={() => setTab("checkout")} />}
          {tab === "checkout" && (
            <CheckoutView
              cart={cart}
              currentUser={currentUser}
              onBack={() => setTab("cart")}
              onOrderComplete={handleOrderComplete}
              backendOnline={backendOnline}
            />
          )}
          {tab === "hauls"  && <HaulsView hauls={hauls} loading={haulsLoading} onRefresh={fetchHauls} />}
          {tab === "spends" && <SpendsView hauls={hauls} />}
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900/80 z-50 flex safe-area-inset-bottom">
        {NAV.map(({ id, label, icon, badge }) => (
          <BottomNavItem
            key={id}
            icon={icon}
            label={label}
            isActive={tab === id || (id === "cart" && tab === "checkout")}
            onClick={() => setTab(id)}
            badge={badge}
          />
        ))}
      </nav>

    </div>
  );
}

/**
 * App.jsx — HaulSync Frontend v3
 *
 * Aesthetic: Warm Receipt Terminal
 * • Stone/warm-dark palette — amber accent, nothing cold
 * • Unbounded (display) + Figtree (body) + Space Mono (prices/data)
 * • Auth: massive stacked wordmark, platform battle cards
 * • Personality in copy, layout, and every micro-detail
 * • Per-user address persistence via addresses.js (localStorage)
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
  zepto:    { name: "Zepto",    short: "Z", bg: "bg-violet-600",  text: "text-violet-400",  bar: "bg-violet-500",  pill: "bg-violet-600/20 text-violet-300 border-violet-500/30" },
  blinkit:  { name: "Blinkit",  short: "B", bg: "bg-yellow-400",  text: "text-yellow-400",  bar: "bg-yellow-400",  pill: "bg-yellow-400/15 text-yellow-300 border-yellow-400/25" },
  instamart:{ name: "Instamart",short: "I", bg: "bg-orange-500",  text: "text-orange-400",  bar: "bg-orange-500",  pill: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  jiomart:  { name: "JioMart",  short: "J", bg: "bg-blue-600",    text: "text-blue-400",    bar: "bg-blue-500",    pill: "bg-blue-600/20 text-blue-300 border-blue-500/30"       },
};

const PRODUCTS = [
  { id:"p1",  name:"Aashirvaad Whole Wheat Atta 5kg", category:"Staples",    emoji:"🌾", prices:{ zepto:280, blinkit:285, instamart:290, jiomart:265 } },
  { id:"p2",  name:"Amul Taaza Toned Milk 1L",         category:"Dairy",      emoji:"🥛", prices:{ zepto:72,  blinkit:70,  instamart:70,  jiomart:68  } },
  { id:"p3",  name:"Maggi 2-Minute Noodles 4-Pack",    category:"Snacks",     emoji:"🍜", prices:{ zepto:56,  blinkit:56,  instamart:56,  jiomart:52  } },
  { id:"p4",  name:"Fortune Sunflower Oil 1L",          category:"Staples",    emoji:"🫙", prices:{ zepto:125, blinkit:130, instamart:128, jiomart:115 } },
  { id:"p5",  name:"Mother Dairy Paneer 200g",          category:"Dairy",      emoji:"🧀", prices:{ zepto:85,  blinkit:85,  instamart:88,  jiomart:82  } },
  { id:"p6",  name:"Haldiram's Bhujia Sev 400g",        category:"Snacks",     emoji:"🥨", prices:{ zepto:110, blinkit:115, instamart:108, jiomart:105 } },
  { id:"p7",  name:"Surf Excel Easy Wash 1kg",          category:"Home",       emoji:"🧺", prices:{ zepto:130, blinkit:130, instamart:132, jiomart:118 } },
  { id:"p8",  name:"Onion (Pyaz) 1kg",                  category:"Vegetables", emoji:"🧅", prices:{ zepto:35,  blinkit:42,  instamart:38,  jiomart:29  } },
  { id:"p9",  name:"Britannia 5-Star Cake 6pc",         category:"Snacks",     emoji:"🎂", prices:{ zepto:75,  blinkit:75,  instamart:72,  jiomart:70  } },
  { id:"p10", name:"Tata Salt 1kg",                     category:"Staples",    emoji:"🧂", prices:{ zepto:26,  blinkit:26,  instamart:25,  jiomart:24  } },
  { id:"p11", name:"Fresho Banana 6pc",                 category:"Vegetables", emoji:"🍌", prices:{ zepto:40,  blinkit:38,  instamart:42,  jiomart:35  } },
  { id:"p12", name:"Nestle KitKat 4-Finger",            category:"Snacks",     emoji:"🍫", prices:{ zepto:45,  blinkit:45,  instamart:43,  jiomart:42  } },
];

const PAYMENT_METHODS_CONFIG = [
  { id:"upi",    label:"UPI",          sub:"GPay · PhonePe · Paytm", icon:Smartphone },
  { id:"card",   label:"Card",         sub:"Credit & Debit",          icon:CreditCard },
  { id:"wallet", label:"Wallet",       sub:"Amazon Pay · Mobikwik",   icon:Wallet     },
  { id:"cod",    label:"Cash",         sub:"Pay at door",             icon:Banknote   },
];

const SEED_HAULS = [
  {
    id:"ORD-8821", platform:"zepto",   date:"2025-05-22T05:00:00.000Z",
    dateLabel:"Today, 10:30 AM",    total:845, saved:62, couponUsed:null, paymentMethod:"upi",
    items:[{ name:"Amul Taaza Toned Milk 1L", qty:2, price:72 }, { name:"Farmley Makhana 100g", qty:1, price:250 }],
  },
  {
    id:"ORD-4492", platform:"blinkit", date:"2025-05-21T12:45:00.000Z",
    dateLabel:"Yesterday, 6:15 PM", total:420, saved:0,  couponUsed:null, paymentMethod:"card",
    items:[{ name:"Plum Tomatoes 1kg", qty:1, price:80 }, { name:"Mother Dairy Paneer 200g", qty:2, price:85 }],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const cheapestEntry = (prices) => Object.entries(prices).reduce((a, b) => b[1] < a[1] ? b : a);
const formatINR     = (n)      => "₹" + Number(n).toLocaleString("en-IN");
const generateId    = ()       => Math.random().toString(36).substr(2, 9);

function nowIST() {
  const d = new Date();
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 5.5 * 3600000);
}

function buildDateLabel(iso) {
  const now = new Date(), d = new Date(iso), diffH = (now - d) / 3600000;
  if (diffH < 1)  return `${Math.round((now - d) / 60000)}m ago`;
  if (diffH < 24) return "Today, "     + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  if (diffH < 48) return "Yesterday, " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" }) + ", " +
         d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}

// ─── FONTS ────────────────────────────────────────────────────────────────────

const D = "'Unbounded', system-ui, sans-serif";   // Display — brand, headings
const B = "'Figtree', system-ui, sans-serif";      // Body — all readable text
const M = "'Space Mono', 'Courier New', monospace"; // Mono — every price, ID, time

function useFonts() {
  useEffect(() => {
    if (document.getElementById("hs-f")) return;
    const l = document.createElement("link");
    l.id  = "hs-f"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800;900&family=Figtree:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(l);
  }, []);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function AuthView({ onLogin }) {
  useFonts();
  const [mode, setMode]           = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch(mode === "login" ? "/api/users/signin" : "/api/users/signup", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) { onLogin(data.user); }
      else        { setError(data.error || "Something went wrong."); setLoading(false); }
    } catch {
      setTimeout(() => {
        onLogin({ id: generateId(), identifier, role: identifier.includes("admin") ? "admin" : "user" });
        setLoading(false);
      }, 700);
    }
  };

  return (
    <div className="min-h-dvh flex" style={{ fontFamily: B, background:"#0d0b09" }}>

      {/* ── LEFT: giant wordmark panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] shrink-0 p-12 relative overflow-hidden"
        style={{ borderRight:"1px solid #1f1c18" }}>

        {/* Faint diagonal stripe texture */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage:"repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)",
          backgroundSize:"24px 24px",
        }} />

        {/* Hero wordmark */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.3em] mb-4" style={{ color:"#6b5e4e", fontFamily:B }}>
              QUICK-COMMERCE · INDIA
            </p>
            <div style={{ fontFamily:D, letterSpacing:"-0.04em", lineHeight:1 }}>
              <div className="text-[6.5rem] xl:text-[7.5rem] font-black" style={{ color:"#faf7f4" }}>HAUL</div>
              <div className="w-full my-3" style={{ height:"3px", background:"#f59e0b" }} />
              <div className="text-[6.5rem] xl:text-[7.5rem] font-black" style={{ color:"#faf7f4" }}>SYNC</div>
            </div>
            <p className="text-lg mt-6" style={{ color:"#7a6e63", fontFamily:B, fontStyle:"italic" }}>
              Stop overpaying. Start hauling.
            </p>
          </div>

          {/* Platform battle cards 2×2 */}
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <div key={key} className={`${p.bg} rounded-xl px-4 py-3 flex items-center gap-2.5`}>
                <span className="text-lg font-black text-zinc-950 leading-none">{p.short}</span>
                <span className="text-sm font-bold text-zinc-950">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color:"#3d3530", fontFamily:M }}>
          v3.0 · Made for India
        </p>
      </div>

      {/* ── RIGHT: form ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background:"#100e0b" }}>
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="text-4xl font-black mb-1" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
              HAULSYNC
            </div>
            <div className="w-16 h-0.5 mx-auto mb-3" style={{ background:"#f59e0b" }} />
            <p className="text-sm" style={{ color:"#6b5e4e" }}>Stop overpaying. Start hauling.</p>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 border-b" style={{ borderColor:"#2a2420" }}>
            {[["login","Sign in"],["signup","Create account"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className="flex-1 pb-3 text-sm font-bold transition-all"
                style={{
                  fontFamily: B,
                  color:      mode === m ? "#f59e0b" : "#4a3f37",
                  borderBottom: mode === m ? "2px solid #f59e0b" : "2px solid transparent",
                  marginBottom: "-1px",
                }}>
                {label}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-black mb-1" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.03em" }}>
            {mode === "login" ? "Back in the game." : "Get in on it."}
          </h2>
          <p className="text-sm mb-7" style={{ color:"#5a5048", fontFamily:B }}>
            {mode === "login" ? "Your hauls and addresses are waiting." : "Takes 10 seconds. Saves way more."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {[
              { label:"Email or Phone", type:"text",     val:identifier, set:setIdentifier, ph:"+91 98765 43210" },
              { label:"Password",       type:"password", val:password,   set:setPassword,   ph:"••••••••",        pw:true },
            ].map(({ label, type, val, set, ph, pw }) => (
              <div key={label}>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color:"#4a3f37", fontFamily:B }}>
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={pw && !showPass ? "password" : "text"}
                    required value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-all"
                    style={{
                      fontFamily:       B,
                      background:       "#1a1612",
                      border:           "1px solid #2e2820",
                      color:            "#faf7f4",
                      caretColor:       "#f59e0b",
                    }}
                    onFocus={(e)  => e.target.style.borderColor = "#f59e0b66"}
                    onBlur={(e)   => e.target.style.borderColor = "#2e2820"}
                  />
                  {pw && (
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                      style={{ color:"#4a3f37" }}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ background:"#2a1010", border:"1px solid #5a1a1a", color:"#f87171", fontFamily:B }}>
                <X className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-black rounded-xl py-4 text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ fontFamily:D, background:"#f59e0b", color:"#0d0b09", letterSpacing:"-0.02em" }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-stone-900/40 border-t-stone-900 rounded-full animate-spin" /> Syncing…</>
                : <>{mode === "login" ? "Let's go" : "Start hauling"} →</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────

function PlatformChip({ platformKey, size = "sm" }) {
  const p  = PLATFORMS[platformKey];
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <span className={`${sz} ${p.bg} rounded-lg flex items-center justify-center font-black text-zinc-950 shrink-0`}>
      {p.short}
    </span>
  );
}

function BackendDot({ online }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{
        fontFamily: B,
        background: online ? "#1a2e1a" : "#1e1b17",
        color:      online ? "#4ade80" : "#57534e",
        border:     online ? "1px solid #166534" : "1px solid #292524",
      }}>
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-400" : "bg-stone-600"}`} />
      {online ? "Live" : "Offline"}
    </span>
  );
}

function ClockBlock() {
  const [t, setT] = useState(nowIST());
  useEffect(() => { const id = setInterval(() => setT(nowIST()), 1000); return () => clearInterval(id); }, []);
  const h12 = t.getHours() % 12 || 12;
  const mm  = String(t.getMinutes()).padStart(2, "0");
  const ss  = String(t.getSeconds()).padStart(2, "0");
  const ap  = t.getHours() < 12 ? "AM" : "PM";
  const day = t.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" });
  return (
    <div className="px-5 py-4" style={{ borderTop:"1px solid #1a1714" }}>
      <p className="text-[9px] font-bold tracking-[0.25em] mb-2" style={{ color:"#3a3028", fontFamily:B }}>IST</p>
      <div style={{ fontFamily:M }}>
        <span className="text-2xl font-bold" style={{ color:"#faf7f4" }}>{String(h12).padStart(2,"0")}:{mm}</span>
        <span className="text-base" style={{ color:"#3a3028" }}>:{ss}</span>
        <span className="text-xs ml-1.5" style={{ color:"#3a3028" }}>{ap}</span>
      </div>
      <p className="text-[10px] mt-1" style={{ color:"#3a3028", fontFamily:M }}>{day}</p>
    </div>
  );
}

function NavItem({ icon:Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
      style={{
        fontFamily:  B,
        color:       active ? "#f59e0b" : "#5a5048",
        background:  active ? "#1f1a0f" : "transparent",
        borderLeft:  active ? "2px solid #f59e0b" : "2px solid transparent",
      }}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
          style={{ background:"#f59e0b", color:"#0d0b09" }}>{badge}</span>
      )}
    </button>
  );
}

function MobileNavItem({ icon:Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
      style={{ color: active ? "#f59e0b" : "#4a3f37" }}>
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
            style={{ background:"#f59e0b", color:"#0d0b09" }}>{badge}</span>
        )}
      </div>
      <span className="text-[9px] font-bold tracking-wide" style={{ fontFamily:B }}>{label}</span>
      {active && <div className="w-1 h-1 rounded-full" style={{ background:"#f59e0b" }} />}
    </button>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
        {title}
      </h2>
      {sub && <p className="text-sm mt-1.5" style={{ color:"#5a5048", fontFamily:B }}>{sub}</p>}
    </div>
  );
}

// ─── COMPARE ──────────────────────────────────────────────────────────────────

function CompareView({ onAddToCart }) {
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("All");
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];

  const filtered = useMemo(() =>
    PRODUCTS.filter(p =>
      (!query || p.name.toLowerCase().includes(query.toLowerCase())) &&
      (category === "All" || p.category === category)
    ), [query, category]);

  return (
    <div className="pb-8">
      <PageHeader title="Price Hunt." sub="Every platform, every price, right now." />

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:"#4a3f37" }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search atta, milk, maggi…"
          className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none transition-all"
          style={{ fontFamily:B, background:"#1a1612", border:"1px solid #2e2820", color:"#faf7f4", caretColor:"#f59e0b" }}
          onFocus={e  => e.target.style.borderColor = "#f59e0b66"}
          onBlur={e   => e.target.style.borderColor = "#2e2820"}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-6 pb-1">
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
            style={{
              fontFamily:  B,
              background:  category === c ? "#f59e0b" : "#1a1612",
              color:       category === c ? "#0d0b09" : "#5a5048",
              border:      "1px solid",
              borderColor: category === c ? "#f59e0b" : "#2e2820",
            }}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm border border-dashed rounded-2xl"
          style={{ color:"#4a3f37", borderColor:"#2e2820" }}>
          Nothing found for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [cheapPlat]         = cheapestEntry(product.prices);
  const [selected, setSelected] = useState(cheapPlat);
  const [added, setAdded]   = useState(false);

  const selectedPrice = product.prices[selected];
  const cheapPrice    = product.prices[cheapPlat];
  const savings       = selectedPrice - cheapPrice;

  const handleAdd = () => {
    onAddToCart(product, selected, selectedPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="rounded-2xl flex flex-col overflow-hidden transition-all"
      style={{ background:"#14120f", border:"1px solid #222018" }}>

      {/* Top: emoji + name */}
      <div className="flex items-start gap-4 p-4 pb-3">
        <div className="text-4xl leading-none pt-0.5 shrink-0">{product.emoji}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest mb-0.5 uppercase" style={{ color:"#4a3f37", fontFamily:B }}>
            {product.category}
          </p>
          <h3 className="text-sm font-semibold leading-snug" style={{ color:"#e8e0d8", fontFamily:B }}>
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price hero */}
      <div className="px-4 pb-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold" style={{ fontFamily:M, color:"#faf7f4" }}>
          {formatINR(selectedPrice)}
        </span>
        {selected === cheapPlat ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"#1f2a0f", color:"#84cc16", border:"1px solid #365314" }}>
            cheapest
          </span>
        ) : savings > 0 ? (
          <span className="text-[10px] font-bold" style={{ color:"#5a5048", fontFamily:M }}>
            +₹{savings} vs best
          </span>
        ) : null}
      </div>

      {/* Platform selector */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-1.5">
        {Object.entries(product.prices).map(([plat, price]) => {
          const p      = PLATFORMS[plat];
          const isSel  = plat === selected;
          const isBest = plat === cheapPlat;
          return (
            <button key={plat} onClick={() => setSelected(plat)}
              className="flex flex-col items-center py-2 px-1 rounded-xl transition-all"
              style={{
                background:  isSel ? "#1f1a0f" : "#0d0b09",
                border:      `1px solid ${isSel ? "#f59e0b66" : "#1a1612"}`,
              }}>
              <span className={`w-5 h-5 ${p.bg} rounded-md flex items-center justify-center text-[9px] font-black text-zinc-950 mb-1`}>
                {p.short}
              </span>
              <span className="text-[9px] font-bold tabular-nums" style={{ fontFamily:M, color: isSel ? "#faf7f4" : "#4a3f37" }}>
                ₹{price}
              </span>
              {isBest && <span className="w-1 h-1 rounded-full mt-0.5" style={{ background:"#84cc16" }} />}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button onClick={handleAdd}
          className="w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            fontFamily:  D,
            letterSpacing: "-0.01em",
            background:  added ? "#1f2a0f" : "#1f1a0f",
            color:       added ? "#84cc16" : "#f59e0b",
            border:      `1px solid ${added ? "#365314" : "#3d3010"}`,
          }}>
          {added ? <><Check className="w-3.5 h-3.5" /> Hauled!</> : <><ShoppingCart className="w-3.5 h-3.5" /> Haul It</>}
        </button>
      </div>
    </div>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────

function CartView({ cart, updateQty, onCheckout }) {
  const grouped = useMemo(() =>
    cart.reduce((acc, item) => {
      if (!acc[item.platform]) acc[item.platform] = { items:[], subtotal:0 };
      acc[item.platform].items.push(item);
      acc[item.platform].subtotal += item.price * item.qty;
      return acc;
    }, {}), [cart]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (!cart.length) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-5">🛒</div>
      <h2 className="text-2xl font-black mb-2" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
        Nothing here yet.
      </h2>
      <p className="text-sm" style={{ color:"#5a5048", fontFamily:B }}>Go haul something.</p>
    </div>
  );

  return (
    <div className="pb-8">
      <PageHeader title="Your Haul."
        sub={`${cart.length} item${cart.length !== 1?"s":""} across ${Object.keys(grouped).length} platform${Object.keys(grouped).length!==1?"s":""}`} />

      <div className="space-y-4 mb-6">
        {Object.entries(grouped).map(([platKey, { items, subtotal }]) => {
          const p = PLATFORMS[platKey];
          return (
            <div key={platKey} className="rounded-2xl overflow-hidden" style={{ border:"1px solid #222018" }}>
              {/* Platform header */}
              <div className="flex items-center justify-between px-4 py-3.5"
                style={{ background:"#1a1612", borderBottom:"1px solid #222018" }}>
                <div className="flex items-center gap-2.5">
                  <PlatformChip platformKey={platKey} size="md" />
                  <div>
                    <p className="text-sm font-bold" style={{ color:"#e8e0d8", fontFamily:B }}>{p.name}</p>
                    <p className="text-[10px]" style={{ color:"#4a3f37", fontFamily:B }}>{items.length} item{items.length!==1?"s":""}</p>
                  </div>
                </div>
                <span className="text-base font-bold tabular-nums" style={{ fontFamily:M, color:"#f59e0b" }}>
                  {formatINR(subtotal)}
                </span>
              </div>
              {/* Items */}
              {items.map(item => (
                <div key={item.cartId} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom:"1px solid #1a1612", background:"#0f0d0b" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color:"#e8e0d8", fontFamily:B }}>{item.name}</p>
                    <p className="text-[11px] mt-0.5 tabular-nums" style={{ color:"#4a3f37", fontFamily:M }}>₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold tabular-nums" style={{ fontFamily:M, color:"#faf7f4" }}>
                      {formatINR(item.price * item.qty)}
                    </span>
                    <div className="flex items-center rounded-xl overflow-hidden" style={{ border:"1px solid #2e2820" }}>
                      <button onClick={() => updateQty(item.cartId, -1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ background:"#1a1612" }}>
                        {item.qty === 1
                          ? <Trash2 className="w-3 h-3" style={{ color:"#ef4444" }} />
                          : <Minus  className="w-3 h-3" style={{ color:"#5a5048" }} />}
                      </button>
                      <span className="w-7 text-center text-xs font-bold" style={{ fontFamily:M, color:"#faf7f4" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.cartId, 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ background:"#1a1612" }}>
                        <Plus className="w-3 h-3" style={{ color:"#5a5048" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Total + CTA */}
      <div className="rounded-2xl p-5 mb-4" style={{ background:"#14120f", border:"1px solid #222018" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold" style={{ color:"#5a5048", fontFamily:B }}>Total to pay</span>
          <div className="flex gap-1.5">
            {Object.keys(grouped).map(k => <PlatformChip key={k} platformKey={k} />)}
          </div>
        </div>
        <span className="text-4xl font-black tabular-nums" style={{ fontFamily:M, color:"#faf7f4", letterSpacing:"-0.04em" }}>
          {formatINR(total)}
        </span>
      </div>

      <button onClick={onCheckout}
        className="w-full font-black rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        style={{ fontFamily:D, background:"#f59e0b", color:"#0d0b09", letterSpacing:"-0.02em" }}>
        Checkout <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

function AddressSection({ backendOnline, onSelect, selectedId, currentUser }) {
  const userId = currentUser.identifier;
  const [map, setMap]     = useState(() => getAddresses(userId));
  const [adding, setAdding] = useState(false);
  const [form, setForm]   = useState({ label:"Home", line:"", city:"", pincode:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!backendOnline) return;
    api.addresses?.list().then(r => {
      if (r?.ok && r.addresses) {
        const merged = { ...getAddresses(userId) };
        r.addresses.forEach(a => { merged[a.id] = a; });
        setMap(merged);
      }
    }).catch(() => {});
  }, [backendOnline, userId]);

  const handleSave = async () => {
    if (!form.line || !form.city) return;
    setSaving(true);
    let addr;
    if (backendOnline) {
      try {
        const r = await fetch(`/api/users/${userId}/addresses`, {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ ...form, isDefault: !Object.keys(map).length }),
        });
        if (r.ok) { const d = await r.json(); addr = { id:d.addressId, ...form }; }
      } catch {}
    }
    if (!addr) addr = { id:"addr-" + generateId(), ...form };
    const updated = saveAddress(userId, addr);
    setMap(updated); onSelect(addr.id);
    setAdding(false); setSaving(false);
    setForm({ label:"Home", line:"", city:"", pincode:"" });
  };

  const handleDelete = async (id) => {
    if (backendOnline) { try { await api.addresses?.remove(id); } catch {} }
    setMap(removeAddress(userId, id));
    if (selectedId === id) onSelect(null);
  };

  const hasAddrs = !!Object.keys(map).length;
  const ICON = { Home:<Home className="w-3 h-3"/>, Office:<Briefcase className="w-3 h-3"/>, Other:<MapPin className="w-3 h-3"/> };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color:"#4a3f37", fontFamily:B }}>
          Delivery Address
        </p>
        <button onClick={() => setAdding(v => !v)}
          className="text-xs font-bold transition-colors"
          style={{ color:"#f59e0b", fontFamily:B }}>
          {adding ? "Cancel" : "+ New"}
        </button>
      </div>

      {hasAddrs && (
        <div className="space-y-2 mb-3">
          {Object.values(map).map(addr => (
            <div key={addr.id} onClick={() => onSelect(addr.id)}
              className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
              style={{
                border: `1px solid ${selectedId === addr.id ? "#f59e0b55" : "#222018"}`,
                background: selectedId === addr.id ? "#1f1a0f" : "#14120f",
              }}>
              <div className="w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: selectedId === addr.id ? "#f59e0b" : "#3a3028", background: selectedId === addr.id ? "#f59e0b" : "transparent" }}>
                {selectedId === addr.id && <Check className="w-3 h-3" style={{ color:"#0d0b09" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold flex items-center gap-1.5" style={{ color:"#e8e0d8", fontFamily:B }}>
                  {ICON[addr.label] ?? <MapPin className="w-3 h-3"/>} {addr.label}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color:"#5a5048", fontFamily:B }}>
                  {addr.line}, {addr.city} {addr.pincode}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(addr.id); }}
                className="shrink-0 mt-0.5 transition-colors hover:opacity-100 opacity-40"
                style={{ color:"#ef4444" }}>
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>
          ))}
        </div>
      )}

      {(adding || !hasAddrs) && (
        <div className="rounded-xl p-4 space-y-3" style={{ background:"#14120f", border:"1px solid #222018" }}>
          <div className="flex gap-2">
            {["Home","Office","Other"].map(lbl => (
              <button key={lbl} onClick={() => setForm(f => ({ ...f, label:lbl }))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  fontFamily: B,
                  background: form.label === lbl ? "#1f1a0f" : "#0d0b09",
                  color:      form.label === lbl ? "#f59e0b" : "#4a3f37",
                  border:     `1px solid ${form.label === lbl ? "#f59e0b55" : "#2e2820"}`,
                }}>
                {lbl}
              </button>
            ))}
          </div>
          {[
            { val:form.line,    set:v => setForm(f => ({...f,line:v})),    ph:"Street, apartment, floor…" },
          ].map(({ val, set, ph }) => (
            <input key={ph} value={val} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full rounded-lg px-3 py-2.5 text-xs focus:outline-none"
              style={{ fontFamily:B, background:"#0d0b09", border:"1px solid #2e2820", color:"#faf7f4" }}
              onFocus={e  => e.target.style.borderColor = "#f59e0b55"}
              onBlur={e   => e.target.style.borderColor = "#2e2820"}
            />
          ))}
          <div className="flex gap-2">
            {[
              { val:form.city, set:v=>setForm(f=>({...f,city:v})), ph:"City", cls:"flex-1" },
              { val:form.pincode, set:v=>setForm(f=>({...f,pincode:v})), ph:"Pincode", cls:"w-24", max:6 },
            ].map(({ val, set, ph, cls, max }) => (
              <input key={ph} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                maxLength={max} className={`${cls} rounded-lg px-3 py-2.5 text-xs focus:outline-none`}
                style={{ fontFamily:B, background:"#0d0b09", border:"1px solid #2e2820", color:"#faf7f4" }}
                onFocus={e  => e.target.style.borderColor = "#f59e0b55"}
                onBlur={e   => e.target.style.borderColor = "#2e2820"}
              />
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || !form.line || !form.city}
            className="w-full py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
            style={{ fontFamily:B, background:"#1f1a0f", color:"#f59e0b", border:"1px solid #3d3010" }}>
            {saving ? "Saving…" : "Save Address"}
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
      if (!acc[item.platform]) acc[item.platform] = { items:[], subtotal:0 };
      acc[item.platform].items.push(item);
      acc[item.platform].subtotal += item.price * item.qty;
      return acc;
    }, {}), [cart]);

  const platforms   = Object.keys(grouped);
  const [coupons,   setCoupons]   = useState(() => platforms.reduce((a,p) => ({...a,[p]:""}), {}));
  const [applied,   setApplied]   = useState({});
  const [payMethod, setPayMethod] = useState("upi");
  const [selAddr,   setSelAddr]   = useState(null);
  const [paying,    setPaying]    = useState(false);
  const [done,      setDone]      = useState(false);

  const applyCode  = (plat) => { if (coupons[plat].trim().length >= 3) setApplied(p => ({...p,[plat]:true})); };
  const removeCode = (plat) => { setApplied(p=>({...p,[plat]:false})); setCoupons(p=>({...p,[plat]:""})); };

  const totalMRP   = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const discount   = platforms.reduce((s,plat) => s + (applied[plat] ? Math.round(grouped[plat].subtotal * 0.1) : 0), 0);
  const grandTotal = totalMRP - discount;

  const pay = async () => {
    setPaying(true);
    const orders = await Promise.all(platforms.map(async plat => {
      const { items, subtotal } = grouped[plat];
      const saved   = applied[plat] ? Math.round(subtotal * 0.1) : 0;
      const order   = {
        id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        platform:plat, date:new Date().toISOString(), dateLabel:"Just now",
        total:subtotal - saved, saved, couponUsed: applied[plat] ? coupons[plat].toUpperCase() : null,
        paymentMethod:payMethod, address: selAddr ? { id:selAddr } : null,
        items: items.map(i => ({ name:i.name, qty:i.qty, price:i.price })),
      };
      if (backendOnline) { try { const r = await api.orders.create(order); return r.ok ? r.order : order; } catch {} }
      return order;
    }));
    setDone(true);
    setTimeout(() => onOrderComplete(orders), 900);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-5">🎉</div>
      <h2 className="text-3xl font-black mb-2" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
        Hauled!
      </h2>
      <p className="text-sm" style={{ color:"#5a5048", fontFamily:B }}>Taking you to your hauls…</p>
    </div>
  );

  return (
    <div className="pb-8">
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color:"#5a5048", fontFamily:B }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <PageHeader title="Checkout." sub="One last look before it ships." />

      <AddressSection backendOnline={backendOnline} onSelect={setSelAddr} selectedId={selAddr} currentUser={currentUser} />

      {/* Coupons */}
      <section className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"#4a3f37", fontFamily:B }}>
          Coupon Codes
        </p>
        <div className="space-y-3">
          {platforms.map(plat => {
            const p = PLATFORMS[plat];
            return (
              <div key={plat} className="rounded-xl p-4" style={{ background:"#14120f", border:`1px solid ${applied[plat]?"#3d3010":"#222018"}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformChip platformKey={plat} />
                    <span className="text-sm font-bold" style={{ color:"#e8e0d8", fontFamily:B }}>{p.name}</span>
                  </div>
                  <span className="text-sm tabular-nums" style={{ color:"#5a5048", fontFamily:M }}>
                    {formatINR(grouped[plat].subtotal)}
                  </span>
                </div>
                {applied[plat] ? (
                  <div className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background:"#1f2a0f", border:"1px solid #365314" }}>
                    <span className="text-xs font-bold" style={{ color:"#84cc16", fontFamily:B }}>
                      {coupons[plat].toUpperCase()} — 10% off ✓
                    </span>
                    <button onClick={() => removeCode(plat)} style={{ color:"#4a3f37" }}>
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={coupons[plat]} onChange={e => setCoupons(p => ({...p,[plat]:e.target.value}))}
                      onKeyDown={e => e.key==="Enter" && applyCode(plat)}
                      placeholder={`${p.name} code`}
                      className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                      style={{ fontFamily:B, background:"#0d0b09", border:"1px solid #2e2820", color:"#faf7f4" }}
                    />
                    <button onClick={() => applyCode(plat)}
                      className="px-3 py-2 rounded-lg text-xs font-bold"
                      style={{ fontFamily:B, background:"#1a1612", border:"1px solid #2e2820", color:"#e8e0d8" }}>
                      Apply
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment */}
      <section className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"#4a3f37", fontFamily:B }}>
          Payment
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS_CONFIG.map(({ id, label, sub, icon:Icon }) => (
            <button key={id} onClick={() => setPayMethod(id)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background:  payMethod===id ? "#1f1a0f" : "#14120f",
                border:      `1px solid ${payMethod===id ? "#f59e0b55" : "#222018"}`,
              }}>
              <Icon className="w-5 h-5 mb-2.5" style={{ color: payMethod===id ? "#f59e0b":"#4a3f37" }} />
              <p className="text-xs font-bold" style={{ color: payMethod===id ? "#f59e0b":"#e8e0d8", fontFamily:B }}>{label}</p>
              <p className="text-[10px] mt-0.5" style={{ color:"#4a3f37", fontFamily:B }}>{sub}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl p-5 mb-6" style={{ background:"#14120f", border:"1px solid #222018" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color:"#4a3f37", fontFamily:B }}>
          Order Summary
        </p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span style={{ color:"#5a5048", fontFamily:B }}>Subtotal</span>
            <span className="tabular-nums" style={{ color:"#e8e0d8", fontFamily:M }}>{formatINR(totalMRP)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color:"#5a5048", fontFamily:B }}>Coupon discount</span>
              <span className="font-bold tabular-nums" style={{ color:"#84cc16", fontFamily:M }}>−{formatINR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span style={{ color:"#5a5048", fontFamily:B }}>Delivery</span>
            <span className="font-bold" style={{ color:"#84cc16", fontFamily:B }}>Free</span>
          </div>
          <div className="pt-3 flex justify-between items-baseline" style={{ borderTop:"1px solid #222018" }}>
            <span className="text-sm font-bold" style={{ color:"#e8e0d8", fontFamily:B }}>Total</span>
            <span className="text-3xl font-black tabular-nums" style={{ fontFamily:M, color:"#faf7f4", letterSpacing:"-0.04em" }}>
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>
      </section>

      <button onClick={pay} disabled={paying}
        className="w-full font-black rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        style={{ fontFamily:D, background:"#f59e0b", color:"#0d0b09", letterSpacing:"-0.02em", fontSize:"1rem" }}>
        {paying
          ? <><span className="w-4 h-4 border-2 border-stone-900/40 border-t-stone-900 rounded-full animate-spin"/>Processing…</>
          : <>Pay {formatINR(grandTotal)}</>}
      </button>
    </div>
  );
}

// ─── HAULS ────────────────────────────────────────────────────────────────────

function HaulsView({ hauls, loading, onRefresh }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const p = PLATFORMS[selected.platform];
    return (
      <div className="pb-8">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm mb-6"
          style={{ color:"#5a5048", fontFamily:B }}>
          <ArrowLeft className="w-4 h-4" /> All hauls
        </button>

        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #222018" }}>
          {/* Receipt header */}
          <div className="px-5 py-4" style={{ background:"#1a1612" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <PlatformChip platformKey={selected.platform} size="md" />
                <div>
                  <p className="font-bold" style={{ color:"#faf7f4", fontFamily:B }}>{p.name}</p>
                  <p className="text-xs" style={{ color:"#4a3f37", fontFamily:B }}>
                    {selected.dateLabel || buildDateLabel(selected.date)}
                  </p>
                </div>
              </div>
              <span className="text-xs tabular-nums" style={{ color:"#3a3028", fontFamily:M }}>{selected.id}</span>
            </div>
            {selected.couponUsed && (
              <div className="flex items-center gap-1.5 text-xs font-bold mt-2"
                style={{ color:"#84cc16", fontFamily:B }}>
                <Ticket className="w-3 h-3" /> {selected.couponUsed} applied
              </div>
            )}
          </div>

          {/* Dashed divider — receipt style */}
          <div style={{ borderBottom:"2px dashed #1f1c18" }} />

          {selected.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom:"1px solid #1a1612", background:"#0f0d0b" }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tabular-nums w-6" style={{ color:"#4a3f37", fontFamily:M }}>{item.qty}×</span>
                <span className="text-sm" style={{ color:"#e8e0d8", fontFamily:B }}>{item.name}</span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ fontFamily:M, color:"#faf7f4" }}>
                {formatINR(item.price * item.qty)}
              </span>
            </div>
          ))}

          <div style={{ borderBottom:"2px dashed #1f1c18" }} />

          <div className="px-5 py-4" style={{ background:"#14120f" }}>
            {selected.saved > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color:"#5a5048", fontFamily:B }}>You saved</span>
                <span className="font-bold tabular-nums" style={{ color:"#84cc16", fontFamily:M }}>−{formatINR(selected.saved)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline">
              <span className="font-bold" style={{ color:"#e8e0d8", fontFamily:B }}>Total paid</span>
              <span className="text-3xl font-black tabular-nums" style={{ fontFamily:M, color:"#f59e0b", letterSpacing:"-0.04em" }}>
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
      <div className="flex items-start justify-between mb-8">
        <PageHeader title="Haul History." sub={`${hauls.length} order${hauls.length!==1?"s":""} on record`} />
        <button onClick={onRefresh} disabled={loading}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all mt-1"
          style={{ background:"#1a1612", border:"1px solid #2e2820", color:"#5a5048" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background:"#14120f", border:"1px solid #1a1612" }} />)}
        </div>
      ) : !hauls.length ? (
        <div className="text-center py-16 text-sm rounded-2xl border border-dashed"
          style={{ color:"#4a3f37", borderColor:"#2e2820", fontFamily:B }}>
          No hauls yet. Go make your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {hauls.map(haul => {
            const p       = PLATFORMS[haul.platform];
            const preview = haul.items.slice(0,2).map(i => `${i.qty}× ${i.name.split(" ").slice(0,2).join(" ")}`).join(" · ");
            const more    = haul.items.length - 2;
            return (
              <button key={haul.id} onClick={() => setSelected(haul)}
                className="w-full text-left rounded-2xl p-4 transition-all group"
                style={{ background:"#14120f", border:"1px solid #222018" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformChip platformKey={haul.platform} size="md" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-bold" style={{ color:"#e8e0d8", fontFamily:B }}>{p.name}</span>
                        {haul.saved > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background:"#1f2a0f", color:"#84cc16", border:"1px solid #365314" }}>
                            saved {formatINR(haul.saved)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px]" style={{ color:"#4a3f37", fontFamily:M }}>
                        {haul.dateLabel || buildDateLabel(haul.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black tabular-nums" style={{ fontFamily:M, color:"#faf7f4", letterSpacing:"-0.04em" }}>
                      {formatINR(haul.total)}
                    </p>
                    <ChevronRight className="w-4 h-4 ml-auto mt-1" style={{ color:"#3a3028" }} />
                  </div>
                </div>
                <p className="text-[11px] mt-3 pl-11 truncate" style={{ color:"#4a3f37", fontFamily:B }}>
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
  const byPlat    = hauls.reduce((acc, h) => ({ ...acc, [h.platform]: (acc[h.platform]||0) + h.total }), {});
  const total     = Object.values(byPlat).reduce((a,b) => a+b, 0) || 0;
  const saved     = hauls.reduce((s,h) => s + (h.saved||0), 0);
  const sorted    = Object.entries(byPlat).sort((a,b) => b[1]-a[1]);
  const topPlat   = sorted[0]?.[0];

  return (
    <div className="pb-8">
      <PageHeader title="Spends." sub="Where your money went and where you saved." />

      {/* Stat trio */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:"Spent",   val:formatINR(total),  accent:"#f59e0b" },
          { label:"Saved",   val:formatINR(saved),  accent:"#84cc16" },
          { label:"Orders",  val:hauls.length,      accent:"#60a5fa" },
        ].map(({ label, val, accent }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background:"#14120f", border:"1px solid #222018" }}>
            <p className="text-2xl font-black tabular-nums mb-1" style={{ fontFamily:M, color:accent, letterSpacing:"-0.04em" }}>
              {val}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"#4a3f37", fontFamily:B }}>{label}</p>
          </div>
        ))}
      </div>

      {topPlat && (
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{ background:"#1f1a0f", border:"1px solid #3d3010" }}>
          <PlatformChip platformKey={topPlat} size="md" />
          <div>
            <p className="text-xs font-bold" style={{ color:"#f59e0b", fontFamily:B }}>Most spent on</p>
            <p className="text-sm font-semibold" style={{ color:"#e8e0d8", fontFamily:B }}>
              {PLATFORMS[topPlat].name} — {formatINR(byPlat[topPlat])}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background:"#14120f", border:"1px solid #222018" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-5" style={{ color:"#4a3f37", fontFamily:B }}>
          By Platform
        </p>
        {!sorted.length ? (
          <p className="text-sm text-center py-4" style={{ color:"#4a3f37", fontFamily:B }}>No data yet.</p>
        ) : (
          <div className="space-y-5">
            {sorted.map(([platKey, amount]) => {
              const p   = PLATFORMS[platKey];
              const pct = total > 0 ? Math.round((amount/total)*100) : 0;
              const cnt = hauls.filter(h => h.platform === platKey).length;
              return (
                <div key={platKey}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PlatformChip platformKey={platKey} />
                      <span className="text-sm font-semibold" style={{ color:"#e8e0d8", fontFamily:B }}>{p.name}</span>
                      <span className="text-xs" style={{ color:"#4a3f37", fontFamily:B }}>{cnt} order{cnt!==1?"s":""}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold tabular-nums" style={{ fontFamily:M, color:"#faf7f4" }}>{formatINR(amount)}</span>
                      <span className="text-xs tabular-nums" style={{ color:"#4a3f37", fontFamily:M }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background:"#1a1612" }}>
                    <div className={`h-full ${p.bar} rounded-full`} style={{ width:`${pct}%`, transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }} />
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

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  useFonts();

  const [currentUser,   setCurrentUser]   = useState(null);
  const [tab,           setTab]           = useState("search");
  const [cart,          setCart]          = useState([]);
  const [hauls,         setHauls]         = useState(SEED_HAULS);
  const [haulsLoading,  setHaulsLoading]  = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    api?.health?.().then(r => setBackendOnline(r.ok)).catch(() => setBackendOnline(false));
  }, []);

  const fetchHauls = useCallback(async () => {
    if (!backendOnline || !api?.orders) return;
    setHaulsLoading(true);
    try { const r = await api.orders.list(); if (r.ok && r.orders) setHauls(r.orders); } catch {}
    setHaulsLoading(false);
  }, [backendOnline]);

  useEffect(() => { if (currentUser) fetchHauls(); }, [fetchHauls, currentUser]);

  const logout = () => { setCurrentUser(null); setCart([]); setTab("search"); };

  if (!currentUser) return <AuthView onLogin={setCurrentUser} />;

  const cartCount = cart.reduce((s,i) => s + i.qty, 0);

  const addToCart = (product, platform, price) => {
    setCart(prev => {
      const key = `${product.id}_${platform}`;
      const idx = prev.findIndex(i => i.cartId === key);
      if (idx >= 0) { const n=[...prev]; n[idx]={...n[idx],qty:n[idx].qty+1}; return n; }
      return [...prev, { cartId:key, productId:product.id, name:product.name, platform, price, qty:1 }];
    });
  };

  const updateQty = (cartId, delta) =>
    setCart(prev => prev.map(i => i.cartId===cartId ? {...i,qty:i.qty+delta} : i).filter(i => i.qty>0));

  const onOrderComplete = (orders) => { setHauls(p => [...orders,...p]); setCart([]); setTab("hauls"); };

  const NAV = [
    { id:"search", label:"Compare", icon:Search },
    { id:"cart",   label:"Cart",    icon:ShoppingCart, badge:cartCount },
    { id:"hauls",  label:"Hauls",   icon:Receipt },
    { id:"spends", label:"Spends",  icon:BarChart2 },
  ];

  const initial = (currentUser.identifier?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ fontFamily:B, background:"#0d0b09", color:"#faf7f4" }}>

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 z-20"
        style={{ background:"#100e0b", borderRight:"1px solid #1a1714" }}>

        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom:"1px solid #1a1714" }}>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
              HAULSYNC
            </h1>
            <div className="w-full h-px mt-1.5" style={{ background:"#f59e0b" }} />
          </div>
          <BackendDot online={backendOnline} />
        </div>

        {/* User strip */}
        <div className="px-4 py-3.5 flex items-center gap-3" style={{ borderBottom:"1px solid #1a1714" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
            style={{ background:"#1f1a0f", border:"1px solid #3d3010", color:"#f59e0b", fontFamily:D }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color:"#3a3028", fontFamily:B }}>Hauling as</p>
            <p className="text-xs font-semibold truncate" style={{ color:"#a8967e", fontFamily:B }}>
              {currentUser.identifier}
            </p>
            {currentUser.role === "admin" && (
              <span className="text-[9px] font-bold flex items-center gap-1 mt-0.5" style={{ color:"#ef4444" }}>
                <ShieldAlert className="w-2.5 h-2.5"/> Admin
              </span>
            )}
          </div>
          <button onClick={logout} title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color:"#3a3028" }}
            onMouseEnter={e => { e.currentTarget.style.color="#ef4444"; e.currentTarget.style.background="#2a1010"; }}
            onMouseLeave={e => { e.currentTarget.style.color="#3a3028"; e.currentTarget.style.background="transparent"; }}>
            <LogOut className="w-3.5 h-3.5"/>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavItem icon={Search}       label="Price Hunt"  active={tab==="search"}                    onClick={() => setTab("search")} />
          <NavItem icon={ShoppingCart} label="Your Haul"   active={tab==="cart"||tab==="checkout"}    onClick={() => setTab("cart")}   badge={cartCount} />
          <div className="pt-4 pb-1.5 px-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color:"#2e2820", fontFamily:B }}>
              History
            </p>
          </div>
          <NavItem icon={Receipt}   label="Haul History" active={tab==="hauls"}  onClick={() => setTab("hauls")} />
          <NavItem icon={BarChart2} label="Spends"       active={tab==="spends"} onClick={() => setTab("spends")} />
        </nav>

        <ClockBlock />
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 shrink-0 z-10"
          style={{ borderBottom:"1px solid #1a1714", background:"#0d0b09cc", backdropFilter:"blur(12px)" }}>
          <div>
            <h1 className="text-base font-black leading-none" style={{ fontFamily:D, color:"#faf7f4", letterSpacing:"-0.04em" }}>
              HAULSYNC
            </h1>
            <div className="w-full h-px mt-1" style={{ background:"#f59e0b" }} />
          </div>
          <button onClick={logout} style={{ color:"#4a3f37" }}>
            <LogOut className="w-4 h-4"/>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-7 pb-24 md:pb-8">
          {tab==="search"   && <CompareView onAddToCart={addToCart} />}
          {tab==="cart"     && <CartView cart={cart} updateQty={updateQty} onCheckout={() => setTab("checkout")} />}
          {tab==="checkout" && <CheckoutView cart={cart} currentUser={currentUser} onBack={() => setTab("cart")} onOrderComplete={onOrderComplete} backendOnline={backendOnline} />}
          {tab==="hauls"    && <HaulsView hauls={hauls} loading={haulsLoading} onRefresh={fetchHauls} />}
          {tab==="spends"   && <SpendsView hauls={hauls} />}
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background:"#0d0b09ee", backdropFilter:"blur(16px)", borderTop:"1px solid #1a1714" }}>
        {NAV.map(({ id, label, icon, badge }) => (
          <MobileNavItem key={id} icon={icon} label={label}
            active={tab===id||(id==="cart"&&tab==="checkout")}
            onClick={() => setTab(id)} badge={badge} />
        ))}
      </nav>
    </div>
  );
}

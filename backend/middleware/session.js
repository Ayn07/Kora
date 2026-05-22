/**
 * middleware/session.js
 * Configures express-session with secure defaults.
 * In production swap the MemoryStore for Redis / connect-pg-simple.
 */

const session = require("express-session");

module.exports = session({
  name: "haulsync.sid",
  secret: process.env.SESSION_SECRET || "change-me-in-production-please",
  resave: false,
  saveUninitialized: true,          // creates session on first request
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

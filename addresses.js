/**
 * addresses.js — Per-user delivery address persistence
 *
 * Addresses are stored in localStorage under the key
 * `haulsync_addresses_<userId>` so each account keeps its own list.
 * Falls back to a shared key when no userId is provided (e.g. during
 * the guest / mock-auth flow).
 */

const storageKey = (userId) =>
  userId ? `haulsync_addresses_${userId}` : "haulsync_addresses_guest";

/**
 * Returns the saved address list for a user.
 * @param {string} [userId]
 * @returns {Array<{ id: string, label: string, line1: string, line2?: string, pincode: string, type: "home"|"work"|"other" }>}
 */
export function getAddresses(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persists a new or updated address.
 * If the address already has an `id` that matches an existing entry, it
 * is replaced; otherwise it is appended.
 * @param {{ id?: string, label: string, line1: string, line2?: string, pincode: string, type: string }} address
 * @param {string} [userId]
 * @returns {{ id: string }} The saved address (with id guaranteed)
 */
export function saveAddress(address, userId) {
  const list = getAddresses(userId);
  const id = address.id || Math.random().toString(36).substr(2, 9);
  const entry = { ...address, id };
  const idx = list.findIndex((a) => a.id === id);
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.push(entry);
  }
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {
    // Storage full or unavailable — silently ignore
  }
  return entry;
}

/**
 * Removes an address by id.
 * @param {string} id
 * @param {string} [userId]
 */
export function removeAddress(id, userId) {
  const list = getAddresses(userId).filter((a) => a.id !== id);
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {}
}

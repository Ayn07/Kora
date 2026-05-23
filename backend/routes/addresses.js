/**
 * addresses.js — HaulSync
 *
 * Per-user address persistence using localStorage.
 * Each user's addresses are isolated by their identifier.
 *
 * Storage format: Hash Map (Object)  { [addressId]: AddressObject }
 * This gives O(1) lookup, insert, and delete by ID.
 */

const storageKey = (userId) => `haulsync:addresses:${userId}`;

/**
 * Retrieve all saved addresses for a user.
 * @param {string} userId — unique user identifier (email / phone)
 * @returns {Object} Hash Map of { [id]: address }
 */
export function getAddresses(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist a new or updated address for a user.
 * @param {string} userId
 * @param {{ id: string, label: string, line: string, city: string, pincode: string }} address
 * @returns {Object} Updated Hash Map
 */
export function saveAddress(userId, address) {
  const map = getAddresses(userId);
  map[address.id] = address;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch (err) {
    console.warn("[HaulSync] Address storage write failed:", err);
  }
  return { ...map };
}

/**
 * Remove an address by ID for a user. O(1) deletion.
 * @param {string} userId
 * @param {string} addressId
 * @returns {Object} Updated Hash Map
 */
export function removeAddress(userId, addressId) {
  const map = getAddresses(userId);
  delete map[addressId];
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch (err) {
    console.warn("[HaulSync] Address storage delete failed:", err);
  }
  return { ...map };
}

/**
 * Wipe all saved addresses for a user (e.g. on account deletion / logout).
 * @param {string} userId
 */
export function clearAddresses(userId) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch (err) {
    console.warn("[HaulSync] Address storage clear failed:", err);
  }
}

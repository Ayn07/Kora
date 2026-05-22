 const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Using Maps (Hash Maps) instead of Arrays for O(1) lookups
const usersDB = new Map();

// Initialize the default Admin account
const adminId = crypto.randomUUID();
usersDB.set('admin@haulsync.com', {
  id: adminId,
  identifier: 'admin@haulsync.com', // Can be email or phone
  password: 'secure-admin-password', // Note: Use bcrypt to hash passwords in production
  role: 'admin',
  addresses: new Map() // Addresses stored as a Map, keyed by addressId
});

// 1. Sign Up Route
router.post('/signup', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required.' });
  }

  if (usersDB.has(identifier)) {
    return res.status(409).json({ error: 'Account with this email or phone already exists.' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    identifier,
    password, 
    role: 'user',
    addresses: new Map()
  };

  usersDB.set(identifier, newUser);
  
  res.status(201).json({ 
    message: 'Account created successfully', 
    user: { id: newUser.id, identifier: newUser.identifier, role: newUser.role } 
  });
});

// 2. Sign In Route
router.post('/signin', (req, res) => {
  const { identifier, password } = req.body;

  const user = usersDB.get(identifier);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  res.status(200).json({ 
    message: 'Signed in successfully', 
    user: { id: user.id, identifier: user.identifier, role: user.role } 
  });
});

// 3. Add Address Route
router.post('/:identifier/addresses', (req, res) => {
  const { identifier } = req.params;
  const { street, city, zipCode } = req.body;

  const user = usersDB.get(identifier);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const addressId = crypto.randomUUID();
  const newAddress = { addressId, street, city, zipCode };

  // Store the address in the user's specific Address Map
  user.addresses.set(addressId, newAddress);

  res.status(201).json({ message: 'Address added', addressId });
});

module.exports = router;

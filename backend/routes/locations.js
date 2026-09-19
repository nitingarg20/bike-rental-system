const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/locations - list all locations
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Location ORDER BY City');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/locations - add a new location (admin)
router.post('/', async (req, res, next) => {
  try {
    const { City, State, Street, Latitude, Longitude } = req.body;
    if (!City || !State) {
      return res.status(400).json({ error: 'City and State are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO Location (City, State, Street, Latitude, Longitude) VALUES (?, ?, ?, ?, ?)',
      [City, State, Street || null, Latitude || null, Longitude || null]
    );
    res.status(201).json({ LocationID: result.insertId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

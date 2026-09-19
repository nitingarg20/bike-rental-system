const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/bikes - all bikes, with location info, optional ?status= filter
router.get('/', async (req, res, next) => {
  try {
    const { status, locationId } = req.query;
    let sql = `SELECT b.*, l.City, l.State
               FROM Bike b
               LEFT JOIN Location l ON l.LocationID = b.LocationID
               WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ' AND b.Status = ?';
      params.push(status);
    }
    if (locationId) {
      sql += ' AND b.LocationID = ?';
      params.push(locationId);
    }
    sql += ' ORDER BY b.BikeID';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/bikes/location/:locationId/available - uses GetAvailableBikesByLocation proc
router.get('/location/:locationId/available', async (req, res, next) => {
  try {
    const [rows] = await pool.query('CALL GetAvailableBikesByLocation(?)', [req.params.locationId]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/bikes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, l.City, l.State
       FROM Bike b LEFT JOIN Location l ON l.LocationID = b.LocationID
       WHERE b.BikeID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Bike not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/bikes - add a new bike, uses AddBike proc (admin)
router.post('/', async (req, res, next) => {
  try {
    const { Model, Brand, Status, LocationID, RatePerHour } = req.body;
    if (!Model || !Brand || !Status || !RatePerHour) {
      return res.status(400).json({ error: 'Model, Brand, Status and RatePerHour are required.' });
    }
    const [result] = await pool.query('CALL AddBike(?, ?, ?, ?, ?)', [
      Model,
      Brand,
      Status,
      LocationID || null,
      RatePerHour,
    ]);
    res.status(201).json(result[0][0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/bikes/:id - update a bike's editable fields (admin)
router.put('/:id', async (req, res, next) => {
  try {
    const { Model, Brand, Status, LocationID, RatePerHour } = req.body;
    await pool.query(
      `UPDATE Bike SET
         Model = COALESCE(?, Model),
         Brand = COALESCE(?, Brand),
         Status = COALESCE(?, Status),
         LocationID = COALESCE(?, LocationID),
         RatePerHour = COALESCE(?, RatePerHour)
       WHERE BikeID = ?`,
      [Model, Brand, Status, LocationID, RatePerHour, req.params.id]
    );
    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

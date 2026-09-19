const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/bookings - all bookings (admin view)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT bk.*, u.FirstName, u.LastName, k.Model, k.Brand
       FROM Booking bk
       JOIN User u ON u.UserID = bk.UserID
       JOIN Bike k ON k.BikeID = bk.BikeID
       ORDER BY bk.StartTime DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/user/:userId - uses GetUserBookingHistory proc
router.get('/user/:userId', async (req, res, next) => {
  try {
    const [rows] = await pool.query('CALL GetUserBookingHistory(?)', [req.params.userId]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings - uses BookBike proc
router.post('/', async (req, res, next) => {
  try {
    const { BikeID, UserID, StartTime, EndTime } = req.body;
    if (!BikeID || !UserID || !StartTime || !EndTime) {
      return res.status(400).json({ error: 'BikeID, UserID, StartTime and EndTime are required.' });
    }
    const [result] = await pool.query('CALL BookBike(?, ?, ?, ?)', [BikeID, UserID, StartTime, EndTime]);
    res.status(201).json(result[0][0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id/cancel - uses CancelBooking proc
router.put('/:id/cancel', async (req, res, next) => {
  try {
    await pool.query('CALL CancelBooking(?)', [req.params.id]);
    res.json({ status: 'Cancelled' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id/undo-cancel - uses UndoCancelBooking proc
router.put('/:id/undo-cancel', async (req, res, next) => {
  try {
    await pool.query('CALL UndoCancelBooking(?)', [req.params.id]);
    res.json({ status: 'Confirmed' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id/return - uses ReturnBike proc
router.put('/:id/return', async (req, res, next) => {
  try {
    await pool.query('CALL ReturnBike(?)', [req.params.id]);
    res.json({ status: 'Completed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

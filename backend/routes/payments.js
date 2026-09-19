const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/payments - all payments (admin view)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.FirstName, u.LastName
       FROM Payment p
       JOIN User u ON u.UserID = p.UserID
       ORDER BY p.PaymentID DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, bk.StartTime, bk.EndTime, k.Model, k.Brand
       FROM Payment p
       JOIN Booking bk ON bk.BooklogID = p.BooklogID
       JOIN Bike k ON k.BikeID = bk.BikeID
       WHERE p.UserID = ?
       ORDER BY p.PaymentID DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// POST /api/admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const [rows] = await pool.query(
      `SELECT a.AdminID, a.PasswordHash, e.Email
       FROM Admin a
       JOIN Admin_Email e ON e.AdminID = a.AdminID
       WHERE e.Email = ?`,
      [Email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(Password, admin.PasswordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ AdminID: admin.AdminID, Email: admin.Email });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats - simple dashboard counters
router.get('/stats', async (req, res, next) => {
  try {
    const [[bikeCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS TotalBikes,
         SUM(Status='Available') AS Available,
         SUM(Status='Rented') AS Rented,
         SUM(Status='Maintenance') AS Maintenance
       FROM Bike`
    );
    const [[bookingCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS TotalBookings,
         SUM(Status='Confirmed') AS Confirmed,
         SUM(Status='Completed') AS Completed,
         SUM(Status='Cancelled') AS Cancelled
       FROM Booking`
    );
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(Amount), 0) AS TotalRevenue
       FROM Payment WHERE PaymentStatus = 'Completed'`
    );
    res.json({ bikes: bikeCounts, bookings: bookingCounts, revenue: revenue.TotalRevenue });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

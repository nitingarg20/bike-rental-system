const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    const { FirstName, LastName, PhoneNumber, Email, Password } = req.body;
    if (!FirstName || !LastName || !Email || !Password) {
      return res.status(400).json({ error: 'FirstName, LastName, Email and Password are required.' });
    }

    const [existing] = await pool.query('SELECT EmailID FROM User_Email WHERE Email = ?', [Email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(Password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [userResult] = await conn.query(
        'INSERT INTO User (FirstName, LastName, PhoneNumber, PasswordHash) VALUES (?, ?, ?, ?)',
        [FirstName, LastName, PhoneNumber || null, passwordHash]
      );
      const userId = userResult.insertId;
      await conn.query('INSERT INTO User_Email (Email, UserID) VALUES (?, ?)', [Email, userId]);
      await conn.commit();
      res.status(201).json({ UserID: userId, FirstName, LastName, Email });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login
// Users can log in once they've signed up (or been seeded directly in the DB).
router.post('/login', async (req, res, next) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const [rows] = await pool.query(
      `SELECT u.UserID, u.FirstName, u.LastName, u.PasswordHash, e.Email
       FROM User u
       JOIN User_Email e ON e.UserID = u.UserID
       WHERE e.Email = ?`,
      [Email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(Password, user.PasswordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      UserID: user.UserID,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.UserID, u.FirstName, u.LastName, u.PhoneNumber, e.Email
       FROM User u
       LEFT JOIN User_Email e ON e.UserID = u.UserID
       WHERE u.UserID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
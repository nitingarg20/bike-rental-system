require('dotenv').config();
const express = require('express');
const cors = require('cors');

const locationsRoutes = require('./routes/locations');
const usersRoutes = require('./routes/users');
const bikesRoutes = require('./routes/bikes');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/locations', locationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bikes', bikesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler. Stored-procedure SIGNAL SQLSTATE '45000' errors
// surface here with a human-readable message in err.sqlMessage.
app.use((err, req, res, next) => {
  console.error(err);
  const message = err.sqlMessage || err.message || 'Server error';
  const status = err.sqlMessage ? 400 : 500;
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Bike Rental API listening on http://localhost:${PORT}`);
});

async function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  await Promise.all([loadStats(), loadLocationsIntoSelect(), loadFleet(), loadAllBookings()]);
}

async function loadStats() {
  const grid = document.getElementById('statGrid');
  try {
    const stats = await api.get('/admin/stats');
    grid.innerHTML = `
      <div class="stat-card"><div class="num">${stats.bikes.TotalBikes}</div><div class="label">Total bikes</div></div>
      <div class="stat-card"><div class="num">${stats.bikes.Available}</div><div class="label">Available</div></div>
      <div class="stat-card"><div class="num">${stats.bikes.Rented}</div><div class="label">Rented</div></div>
      <div class="stat-card"><div class="num">${stats.bookings.TotalBookings}</div><div class="label">Total bookings</div></div>
      <div class="stat-card"><div class="num">${fmtMoney(stats.revenue)}</div><div class="label">Revenue collected</div></div>
    `;
  } catch (err) {
    showMsg(document.getElementById('msg'), err.message);
  }
}

async function loadLocationsIntoSelect() {
  const select = document.getElementById('locationSelect');
  const locations = await api.get('/locations');
  select.innerHTML = locations.map((l) => `<option value="${l.LocationID}">${l.City}, ${l.State}</option>`).join('');
}

async function loadFleet() {
  const tbody = document.getElementById('fleetRows');
  const bikes = await api.get('/bikes');
  tbody.innerHTML = bikes.map((b) => `
    <tr>
      <td>#${b.BikeID}</td>
      <td>${b.Model}</td>
      <td>${b.Brand}</td>
      <td>${b.City ? `${b.City}, ${b.State}` : '&mdash;'}</td>
      <td>${fmtMoney(b.RatePerHour)}</td>
      <td><span class="badge ${b.Status}">${b.Status}</span></td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty">No bikes yet.</td></tr>';
}

async function loadAllBookings() {
  const tbody = document.getElementById('bookingRows');
  const bookings = await api.get('/bookings');
  tbody.innerHTML = bookings.map((b) => `
    <tr>
      <td>#${b.BooklogID}</td>
      <td>${b.FirstName} ${b.LastName}</td>
      <td>${b.Model}</td>
      <td>${fmtDate(b.StartTime)}</td>
      <td>${fmtDate(b.EndTime)}</td>
      <td>${fmtMoney(b.TotalCost)}</td>
      <td><span class="badge ${b.Status}">${b.Status}</span></td>
    </tr>`).join('') || '<tr><td colspan="7" class="empty">No bookings yet.</td></tr>';
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav('admin.html');

  const admin = Session.getAdmin();
  if (admin) {
    showDashboard();
  } else {
    document.getElementById('adminLogin').style.display = 'block';
  }

  document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Email = document.getElementById('email').value.trim();
    const Password = document.getElementById('password').value;
    try {
      const adminData = await api.post('/admin/login', { Email, Password });
      Session.setAdmin(adminData);
      renderNav('admin.html');
      showDashboard();
    } catch (err) {
      showMsg(document.getElementById('loginMsg'), err.message);
    }
  });

  document.getElementById('addBikeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg');
    try {
      await api.post('/bikes', {
        Model: document.getElementById('model').value.trim(),
        Brand: document.getElementById('brandInput').value.trim(),
        Status: document.getElementById('statusSelect').value,
        LocationID: document.getElementById('locationSelect').value,
        RatePerHour: document.getElementById('rate').value,
      });
      showMsg(msg, 'Bike added.', 'success');
      document.getElementById('addBikeForm').reset();
      loadFleet();
      loadStats();
    } catch (err) {
      showMsg(msg, err.message);
    }
  });
});

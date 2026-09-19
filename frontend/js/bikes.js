let currentBike = null;

async function loadLocations() {
  const select = document.getElementById('locationFilter');
  try {
    const locations = await api.get('/locations');
    for (const loc of locations) {
      const opt = document.createElement('option');
      opt.value = loc.LocationID;
      opt.textContent = `${loc.City}, ${loc.State}`;
      select.appendChild(opt);
    }
  } catch (err) {
    showMsg(document.getElementById('msg'), err.message);
  }
}

function bikeCardHtml(bike) {
  return `
    <div class="card bike-card">
      <span class="badge ${bike.Status}">${bike.Status}</span>
      <h3>${bike.Model}</h3>
      <div class="brand-line">${bike.Brand} &middot; ${bike.City ? `${bike.City}, ${bike.State}` : 'Unassigned'}</div>
      <div class="rate">${fmtMoney(bike.RatePerHour)} <small>/ hour</small></div>
      <div class="meta">Bike #${bike.BikeID}</div>
      <button class="btn small" ${bike.Status !== 'Available' ? 'disabled' : ''} data-bike-id="${bike.BikeID}" data-action="rent">
        ${bike.Status === 'Available' ? 'Rent this bike' : bike.Status}
      </button>
    </div>`;
}

async function loadBikes() {
  const grid = document.getElementById('bikeGrid');
  const locationId = document.getElementById('locationFilter').value;
  const status = document.getElementById('statusFilter').value;

  const params = new URLSearchParams();
  if (locationId) params.set('locationId', locationId);
  if (status) params.set('status', status);

  try {
    const bikes = await api.get(`/bikes?${params.toString()}`);
    grid.innerHTML = bikes.length
      ? bikes.map(bikeCardHtml).join('')
      : '<p class="empty">No bikes match those filters.</p>';

    grid.querySelectorAll('[data-action="rent"]').forEach((btn) => {
      btn.addEventListener('click', () => openBookingModal(btn.dataset.bikeId, bikes));
    });
  } catch (err) {
    showMsg(document.getElementById('msg'), err.message);
  }
}

function openBookingModal(bikeId, bikes) {
  const user = Session.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentBike = bikes.find((b) => String(b.BikeID) === String(bikeId));
  document.getElementById('bookTitle').textContent = `Book: ${currentBike.Model}`;
  document.getElementById('startTime').value = '';
  document.getElementById('endTime').value = '';
  showMsg(document.getElementById('bookMsg'), '');
  document.getElementById('estimateHint').textContent = `Rate: ${fmtMoney(currentBike.RatePerHour)}/hour`;
  document.getElementById('bookOverlay').style.display = 'flex';
}

function closeBookingModal() {
  document.getElementById('bookOverlay').style.display = 'none';
  currentBike = null;
}

async function submitBooking(e) {
  e.preventDefault();
  const user = Session.getUser();
  const bookMsg = document.getElementById('bookMsg');
  const start = document.getElementById('startTime').value;
  const end = document.getElementById('endTime').value;

  if (!start || !end || new Date(end) <= new Date(start)) {
    showMsg(bookMsg, 'End time must be after start time.');
    return;
  }

  try {
    const result = await api.post('/bookings', {
      BikeID: currentBike.BikeID,
      UserID: user.UserID,
      StartTime: start.replace('T', ' ') + ':00',
      EndTime: end.replace('T', ' ') + ':00',
    });
    showMsg(bookMsg, `Booked! Total cost: ${fmtMoney(result.TotalCost)}`, 'success');
    setTimeout(() => {
      closeBookingModal();
      loadBikes();
    }, 1200);
  } catch (err) {
    showMsg(bookMsg, err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav('index.html');
  loadLocations();
  loadBikes();
  document.getElementById('locationFilter').addEventListener('change', loadBikes);
  document.getElementById('statusFilter').addEventListener('change', loadBikes);
  document.getElementById('cancelBook').addEventListener('click', closeBookingModal);
  document.getElementById('bookForm').addEventListener('submit', submitBooking);
});

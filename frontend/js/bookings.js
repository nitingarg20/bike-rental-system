function actionButtonsHtml(booking) {
  const id = booking.BooklogID;
  if (booking.Status === 'Confirmed') {
    return `
      <button class="btn small" data-action="return" data-id="${id}">Return bike</button>
      <button class="btn small danger" data-action="cancel" data-id="${id}">Cancel</button>`;
  }
  if (booking.Status === 'Cancelled') {
    return `<button class="btn small secondary" data-action="undo" data-id="${id}">Undo cancel</button>`;
  }
  return '';
}

function bookingRowHtml(b) {
  return `
    <tr>
      <td>#${b.BooklogID}</td>
      <td>${b.Model} <span style="color:var(--muted)">(${b.Brand})</span></td>
      <td>${fmtDate(b.StartTime)}</td>
      <td>${fmtDate(b.EndTime)}</td>
      <td>${fmtMoney(b.TotalCost)}</td>
      <td><span class="badge ${b.Status}">${b.Status}</span></td>
      <td style="white-space:nowrap; display:flex; gap:6px;">${actionButtonsHtml(b)}</td>
    </tr>`;
}

async function loadBookings() {
  const user = Session.getUser();
  const msg = document.getElementById('msg');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const bookings = await api.get(`/bookings/user/${user.UserID}`);
    const tbody = document.getElementById('bookingRows');
    tbody.innerHTML = bookings.length
      ? bookings.map(bookingRowHtml).join('')
      : `<tr><td colspan="7" class="empty">You have no bookings yet. <a href="index.html">Browse bikes</a>.</td></tr>`;

    tbody.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action, btn.dataset.id));
    });
  } catch (err) {
    showMsg(msg, err.message);
  }
}

async function handleAction(action, id) {
  const msg = document.getElementById('msg');
  const endpointMap = { cancel: 'cancel', undo: 'undo-cancel', return: 'return' };
  try {
    await api.put(`/bookings/${id}/${endpointMap[action]}`);
    showMsg(msg, 'Updated.', 'success');
    loadBookings();
  } catch (err) {
    showMsg(msg, err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav('my-bookings.html');
  loadBookings();
});

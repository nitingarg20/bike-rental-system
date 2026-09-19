// Base URL of the Express backend (see backend/.env.example PORT)
const API_BASE = 'http://localhost:4000/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error((body && body.error) || `Request failed (${res.status})`);
  }
  return body;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, data) => apiRequest(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify(data || {}) }),
};

// ---------------- Session helpers ----------------
const Session = {
  getUser() {
    const raw = localStorage.getItem('brs_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    localStorage.setItem('brs_user', JSON.stringify(user));
  },
  getAdmin() {
    const raw = localStorage.getItem('brs_admin');
    return raw ? JSON.parse(raw) : null;
  },
  setAdmin(admin) {
    localStorage.setItem('brs_admin', JSON.stringify(admin));
  },
  logout() {
    localStorage.removeItem('brs_user');
    localStorage.removeItem('brs_admin');
  },
};

function showMsg(el, text, type = 'error') {
  if (!el) return;
  el.textContent = text;
  el.className = `msg ${type}`;
  el.style.display = text ? 'block' : 'none';
}

function fmtMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d.replace(' ', 'T')).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Renders the shared top navigation, adapting to logged-in state.
function renderNav(active) {
  const user = Session.getUser();
  const admin = Session.getAdmin();
  const mount = document.getElementById('nav');
  if (!mount) return;

  const links = [
    ['index.html', 'Bikes'],
  ];
  if (user) links.push(['my-bookings.html', 'My bookings']);
  if (admin) links.push(['admin.html', 'Admin']);

  const linkHtml = links
    .map(([href, label]) => `<a href="${href}" class="${active === href ? 'active' : ''}">${label}</a>`)
    .join('');

  let rightHtml;
  if (user) {
    rightHtml = `<span class="who">${user.FirstName} ${user.LastName}</span><button class="linklike" id="logoutBtn">Log out</button>`;
  } else if (admin) {
    rightHtml = `<span class="who">${admin.Email}</span><button class="linklike" id="logoutBtn">Log out</button>`;
  } else {
    rightHtml = `<a href="login.html">Log in</a><a href="register.html">Sign up</a><a href="admin.html">Admin</a>`;
  }

  mount.innerHTML = `${linkHtml}${rightHtml}`;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Session.logout();
      window.location.href = 'index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const msg = document.getElementById('msg');

  // Show a one-time flash message if we just arrived from a successful signup.
  const flash = sessionStorage.getItem('brs_flash');
  if (flash) {
    showMsg(msg, flash, 'success');
    sessionStorage.removeItem('brs_flash');
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Email = document.getElementById('email').value.trim();
    const Password = document.getElementById('password').value;

    try {
      const user = await api.post('/users/login', { Email, Password });
      Session.setUser(user);
      window.location.href = 'index.html';
    } catch (err) {
      showMsg(msg, err.message);
    }
  });
});

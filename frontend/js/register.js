document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const msg = document.getElementById('msg');

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      FirstName: document.getElementById('firstName').value.trim(),
      LastName: document.getElementById('lastName').value.trim(),
      Email: document.getElementById('email').value.trim(),
      PhoneNumber: document.getElementById('phone').value.trim(),
      Password: document.getElementById('password').value,
    };

    try {
      await api.post('/users/register', payload);
      // Account created - send them to the login page to sign in themselves,
      // rather than starting a session automatically.
      sessionStorage.setItem('brs_flash', 'Account created. Please log in.');
      window.location.href = 'login.html';
    } catch (err) {
      showMsg(msg, err.message);
    }
  });
});
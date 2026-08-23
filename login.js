document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorBox = document.getElementById('errorBox');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (errorBox) errorBox.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
          if (errorBox) {
            errorBox.textContent = data.error || 'Login failed.';
            errorBox.style.display = 'block';
          }
          return;
        }

        // Store JWT Token & redirect to Admin Portal
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        window.location.href = 'admin.html';
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = 'Server connection error. Please try again.';
          errorBox.style.display = 'block';
        }
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Security Check: Redirect if not logged in
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const userBadge = document.getElementById('userBadge');
  if (userBadge && user.username) {
    userBadge.textContent = 'User: ' + user.username;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = 'login.html';
    });
  }

  // Tab Switching
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Helper for Authenticated Fetch
  async function authFetch(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 400) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
    }
    return res;
  }

  // 1. Load Dashboard Stats
  async function loadStats() {
    try {
      const res = await authFetch('/api/admin/stats');
      const data = await res.json();
      const p = document.getElementById('statPending');
      const t = document.getElementById('statToday');
      const tot = document.getElementById('statTotalRes');
      const m = document.getElementById('statMenu');

      if (p) p.textContent = data.pendingReservations;
      if (t) t.textContent = data.todayReservations;
      if (tot) tot.textContent = data.totalReservations;
      if (m) m.textContent = data.totalMenuItems;
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  // 2. Load Reservations
  async function loadReservations() {
    try {
      const res = await authFetch('/api/admin/reservations');
      const items = await res.json();
      const body = document.getElementById('reservationsBody');
      if (!body) return;

      if (!items.length) {
        body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No reservations found.</td></tr>';
        return;
      }

      body.innerHTML = items.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td><strong>${r.name}</strong></td>
          <td>+91 ${r.phone}</td>
          <td>${r.date} @ ${r.time}</td>
          <td>${r.party_size} guests</td>
          <td>${r.notes || '—'}</td>
          <td><span class="status-badge status-${r.status}">${r.status}</span></td>
          <td>
            ${r.status !== 'confirmed' ? `<button class="act-btn act-approve" data-id="${r.id}" data-action="confirmed">Approve</button>` : ''}
            ${r.status !== 'cancelled' ? `<button class="act-btn act-cancel" data-id="${r.id}" data-action="cancelled">Cancel</button>` : ''}
          </td>
        </tr>
      `).join('');

      // Attach button listeners
      body.querySelectorAll('.act-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          updateStatus(btn.dataset.id, btn.dataset.action);
        });
      });
    } catch (err) {
      console.error('Failed to load reservations:', err);
    }
  }

  // Update Reservation Status
  async function updateStatus(id, status) {
    try {
      const res = await authFetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadReservations();
        loadStats();
      }
    } catch (err) {
      alert('Error updating status.');
    }
  }

  // 3. Load Menu Items
  async function loadMenu() {
    try {
      const res = await authFetch('/api/admin/menu');
      const items = await res.json();
      const body = document.getElementById('menuBody');
      if (!body) return;

      body.innerHTML = items.map(m => `
        <tr>
          <td>#${m.id}</td>
          <td><strong style="text-transform:capitalize;">${m.category}</strong></td>
          <td>${m.name}</td>
          <td>${m.description || '—'}</td>
          <td><strong>₹${m.price}</strong></td>
          <td><span class="status-badge status-confirmed">${m.tag || 'Standard'}</span></td>
          <td>
            <button class="act-btn act-delete" data-id="${m.id}">Delete</button>
          </td>
        </tr>
      `).join('');

      body.querySelectorAll('.act-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteMenuItem(btn.dataset.id);
        });
      });
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  }

  // Add Menu Item Form Submit
  const addMenuForm = document.getElementById('addMenuForm');
  if (addMenuForm) {
    addMenuForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('newItemCat').value;
      const name = document.getElementById('newItemName').value.trim();
      const price = document.getElementById('newItemPrice').value;
      const tag = document.getElementById('newItemTag').value.trim();
      const description = document.getElementById('newItemDesc').value.trim();

      try {
        const res = await authFetch('/api/admin/menu', {
          method: 'POST',
          body: JSON.stringify({ category, name, price, tag, description })
        });
        if (res.ok) {
          addMenuForm.reset();
          loadMenu();
          loadStats();
        }
      } catch (err) {
        alert('Error adding menu item.');
      }
    });
  }

  // Delete Menu Item
  async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await authFetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadMenu();
        loadStats();
      }
    } catch (err) {
      alert('Error deleting menu item.');
    }
  }

  // 4. Load Customer Reviews
  async function loadReviews() {
    try {
      const res = await authFetch('/api/reviews');
      const items = await res.json();
      const body = document.getElementById('reviewsBody');
      if (!body) return;

      body.innerHTML = items.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td><strong>${r.author}</strong></td>
          <td>${'★'.repeat(r.rating)}</td>
          <td>${r.comment}</td>
          <td>${r.source}</td>
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }

  // 5. Load System Audit Logs
  async function loadLogs() {
    try {
      const res = await authFetch('/api/admin/logs');
      const items = await res.json();
      const body = document.getElementById('logsBody');
      if (!body) return;

      if (!items.length) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;">No audit logs recorded yet.</td></tr>';
        return;
      }

      body.innerHTML = items.map(l => `
        <tr>
          <td>#${l.id}</td>
          <td><span class="status-badge status-confirmed">${l.event_type}</span></td>
          <td>${l.details}</td>
          <td><code>${l.ip_address || '127.0.0.1'}</code></td>
          <td>${new Date(l.created_at).toLocaleString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }

  // Initial Load
  loadStats();
  loadReservations();
  loadMenu();
  loadReviews();
  loadLogs();
});

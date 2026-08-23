document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const toggle = document.getElementById('menuToggle');
  const panel = document.getElementById('mobilePanel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => panel.classList.toggle('open'));
  }

  // 2. Menu Category Tabs Switching
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPanel = document.querySelector(`.menu-panel[data-panel="${tab.dataset.tab}"]`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // 3. Dynamic Menu Loading from Express REST API
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      const items = await res.json();

      const categories = ['bagels', 'coffee', 'plates', 'sweets'];
      categories.forEach(cat => {
        const listEl = document.getElementById(`list-${cat}`);
        if (!listEl) return;

        const catItems = items.filter(i => i.category === cat);
        listEl.innerHTML = catItems.map(item => `
          <div class="menu-item">
            <div>
              <div class="name">${item.name}</div>
              <div class="desc">${item.description || ''}</div>
            </div>
            <div class="menu-item-right">
              <div class="price">₹${item.price}</div>
              <span class="tag">${item.tag || 'Popular'}</span>
            </div>
          </div>
        `).join('');
      });
    } catch (err) {
      console.error('Failed to load menu from API:', err);
    }
  }

  // 4. Dynamic Customer Reviews Loading
  async function loadReviews() {
    try {
      const res = await fetch('/api/reviews');
      const reviews = await res.json();
      const track = document.getElementById('carouselTrack');
      if (!track) return;

      track.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p>${r.comment}</p>
          <span>${r.author} (${r.source})</span>
        </div>
      `).join('');

      initCarousel();
    } catch (err) {
      console.error('Failed to load reviews from API:', err);
    }
  }

  // 5. Customer Review Form Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('revAuthor').value.trim();
      const rating = document.getElementById('revRating').value;
      const comment = document.getElementById('revComment').value.trim();

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, rating, comment })
        });
        if (res.ok) {
          alert('Thank you for sharing your review!');
          reviewForm.reset();
          loadReviews();
        }
      } catch (err) {
        alert('Error submitting review.');
      }
    });
  }

  // 6. Carousel Pagination Logic
  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsWrap = document.getElementById('carouselDots');
    if (!track || !dotsWrap) return;
    const cards = track.querySelectorAll('.review-card');
    if (!cards.length) return;

    let perView = window.innerWidth > 860 ? 3 : 1;
    let current = 0;
    function totalPages() { return Math.max(1, cards.length - perView + 1); }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalPages(); i++) {
        const b = document.createElement('button');
        if (i === current) b.classList.add('active');
        b.addEventListener('click', () => { current = i; render(); });
        dotsWrap.appendChild(b);
      }
    }

    function render() {
      perView = window.innerWidth > 860 ? 3 : 1;
      const cardWidth = cards[0].getBoundingClientRect().width + 24;
      track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === current));
    }

    buildDots();
    render();
  }

  // 7. Scroll Reveal & Reading Progress Bar
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      progressBar.style.width = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100 + '%';
    });
  }

  // 8. Gallery Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxInner = document.getElementById('lightboxInner');
  const lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxInner && lightboxClose) {
    document.querySelectorAll('.gallery-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const img = tile.querySelector('img');
        if (img) {
          lightboxInner.innerHTML = `<img src="${img.src}" alt="Gallery Image">`;
          lightbox.classList.add('open');
        }
      });
    });
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  }

  // Initial Data Load
  loadMenu();
  loadReviews();
});

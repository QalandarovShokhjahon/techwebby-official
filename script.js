// Smooth scroll and active link handling
(function () {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const yearEl = document.getElementById('year');
  const formNote = document.getElementById('formNote');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const opened = navMenu.classList.toggle('open');
      document.body.classList.toggle('nav-open', opened);
      menuToggle.setAttribute('aria-expanded', String(opened));
    });
  }

  // Close menu on link click (mobile)
  links.forEach((a) =>
    a.addEventListener('click', () => {
      navMenu?.classList.remove('open');
      document.body.classList.remove('nav-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    })
  );

  // Smooth scrolling for in-page anchors (desktop only)
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('#')) {
      const id = target.getAttribute('href');
      const el = id ? document.querySelector(id) : null;
      if (el) {
        const isMobile = window.matchMedia('(max-width: 760px)').matches;
        if (isMobile) return; // allow default jump on mobile (no offset, no smooth)
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });

  // Sticky header shadow
  const onScroll = () => {
    const scrolled = window.scrollY > 6;
    header?.classList.toggle('scrolled', scrolled);
    updateActiveLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link based on section in viewport
  function updateActiveLink() {
    const sections = ['home', 'services', 'about', 'portfolio', 'blog', 'contact'];
    let current = 'home';
    const threshold = window.innerHeight * 0.3; // 30% from top
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= threshold && rect.bottom >= threshold) {
        current = id;
      }
    }
    links.forEach((a) => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${current}`);
    });
  }

  // Contact form -> POST to backend endpoint (for Telegram relay)
  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.getAttribute('data-endpoint') || '';

    const submitBtn = form.querySelector('button[type="submit"]');
    const getVal = (name) => (form.querySelector(`[name="${name}"]`)?.value || '').trim();
    const payload = {
      name: getVal('name'),
      email: getVal('email'),
      phone: getVal('phone'),
      service: getVal('service'),
      message: getVal('message'),
      page: window.location.href,
      ts: new Date().toISOString(),
    };

    if (!endpoint) {
      if (formNote) formNote.textContent = "Endpoint o'rnatilmagan. Iltimos, form[data-endpoint] qiymatini backend URL ga sozlang.";
      return;
    }

    try {
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Yuborilmoqda...'; }
      if (formNote) { formNote.textContent = ''; }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (formNote) {
        formNote.textContent = 'Xabar yuborildi! Tez orada javob beramiz.';
      }
      form.reset();
    } catch (err) {
      if (formNote) {
        formNote.textContent = 'Xatolik yuz berdi. Keyinroq urinib ko‘ring yoki Telegram orqali bog‘laning.';
        formNote.style.color = '#ff9a9a';
        setTimeout(() => { formNote.style.color = ''; }, 4000);
      }
      console.error('Form submit error:', err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Yuborish'; }
      setTimeout(() => { if (formNote) formNote.textContent = ''; }, 5000);
    }
  });
})();



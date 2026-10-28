// Shared behaviour for every page: footer year, theme toggle, mobile menu, scroll reveal, subscribe popup

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Theme toggle ----------
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
const updateToggleLabel = () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
};

updateToggleLabel();
prefersDark.addEventListener('change', updateToggleLabel);

themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  themeToggle.classList.remove('spin');
  void themeToggle.offsetWidth; // restart the spin animation
  themeToggle.classList.add('spin');
  updateToggleLabel();
});

// ---------- Mobile menu ----------
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

const setMenuOpen = (open) => {
  navLinks.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

menuToggle.addEventListener('click', () => setMenuOpen(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenuOpen(false); });

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// ---------- Subscribe popup ----------
// Saves the email to Supabase (config.js) via the REST API; RLS lets visitors insert but never read.
const subscribeDialog = document.getElementById('subscribe-dialog');

if (subscribeDialog) {
  const form = document.getElementById('subscribe-form');
  const emailInput = document.getElementById('subscribe-email');
  const honeypot = document.getElementById('subscribe-website');
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('subscribe-error');

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.append(toast);
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  };

  const setError = (message) => {
    errorEl.textContent = message;
    emailInput.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const setSending = (sending) => {
    submitBtn.disabled = sending;
    submitBtn.textContent = sending ? 'Subscribing…' : 'Subscribe';
  };

  const finish = (message) => {
    subscribeDialog.close();
    showToast(message);
  };

  document.querySelectorAll('[data-subscribe]').forEach((btn) => btn.addEventListener('click', () => {
    form.reset();
    setError('');
    setSending(false);
    subscribeDialog.showModal();
  }));

  subscribeDialog.querySelector('.dialog-close').addEventListener('click', () => subscribeDialog.close());
  // Clicking the dimmed backdrop (the dialog element itself, outside its content) closes it
  subscribeDialog.addEventListener('click', (e) => { if (e.target === subscribeDialog) subscribeDialog.close(); });
  emailInput.addEventListener('input', () => setError(''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    if (!emailInput.checkValidity() || !email.includes('.')) {
      setError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    // Bots fill every field; people never see this one. Pretend it worked.
    if (honeypot.value) return finish("You're subscribed. Thanks!");

    if (typeof SUPABASE_URL === 'undefined') {
      setError('Subscriptions are unavailable right now. Please try again later.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) return finish("You're subscribed. Thanks!");
      if (res.status === 409) return finish("You're already on the list.");
      setError('Something went wrong. Please try again.');
    } catch (err) {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  });
}

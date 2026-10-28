// Shared behaviour for every page: footer year, theme toggle, mobile menu, scroll reveal

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

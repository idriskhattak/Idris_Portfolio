const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

// Start from the top only on the first visit of the current browser session.
// Refreshing or using back/forward navigation can still preserve scroll position.
window.addEventListener('DOMContentLoaded', () => {
  const hasVisitedThisSession = sessionStorage.getItem('portfolioVisited');

  if (!hasVisitedThisSession && !window.location.hash) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    sessionStorage.setItem('portfolioVisited', 'true');
  }
});

// Mobile navigation menu
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');

    menuBtn.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  });

  // Close mobile menu after clicking a navigation link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Automatically update footer year
const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
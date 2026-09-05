const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

const navigationEntry = performance.getEntriesByType('navigation')[0];
const navigationType = navigationEntry ? navigationEntry.type : 'navigate';

// Only force the top on a fresh visit.
// Refresh and back/forward navigation keep their normal scroll behavior.
if (navigationType === 'navigate' && !window.location.hash) {

  // Temporarily stop the browser restoring an old scroll position
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Force top immediately
  window.scrollTo(0, 0);

  // Force top again after the page has rendered
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    setTimeout(() => {
      window.scrollTo(0, 0);

      // Return normal browser scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    }, 100);
  });

} else {

  // Refresh / back / forward should behave normally
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }
}


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

      menuBtn.setAttribute(
        'aria-expanded',
        'false'
      );
    });

  });
}


// Automatically update footer year
const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
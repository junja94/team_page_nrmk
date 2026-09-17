// layout.js — injects the shared header/footer partials and marks the current nav link.

// Pages that are not in the nav point at the nav entry they belong under.
const NAV_ALIASES = { 'post.html': 'index.html#research' };

function markCurrentNav(container) {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  const current = NAV_ALIASES[file] || file;
  container.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });
}

function loadPartial(hostId, path, onLoad) {
  const host = document.getElementById(hostId);
  if (!host) return;
  fetch(path)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(res.status))))
    .then((markup) => {
      host.innerHTML = markup;
      if (onLoad) onLoad(host);
    })
    .catch(() => {});
}

loadPartial('siteHeader', 'assets/header.html', markCurrentNav);
loadPartial('siteFooter', 'assets/footer.html');

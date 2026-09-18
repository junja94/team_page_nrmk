// layout.js — injects the shared header/footer partials and marks the current nav link.

function markCurrentNav(container) {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  // The home page marks no link as current (the design leaves Home unmarked
  // even though "Team" now points there); other pages mark their own link.
  if (file === 'index.html') return;
  container.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === file) link.setAttribute('aria-current', 'page');
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

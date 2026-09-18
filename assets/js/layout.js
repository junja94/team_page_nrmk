// layout.js — injects the shared header/footer partials and marks the current nav link.

function markCurrentNav(container) {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  container.querySelectorAll('nav a').forEach((link) => {
    // Only a link whose href is exactly this page counts; in-page anchors
    // such as index.html#team never mark Home as current.
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

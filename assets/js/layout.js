// layout.js — injects the shared header/footer partials and highlights the current nav link.

function setActiveNav(container) {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const activeHref = current === 'post.html' ? 'blog.html' : current;
  container.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === activeHref) link.classList.add('active');
  });

  // Hamburger toggle on narrow screens
  const toggle = container.querySelector('.nav-toggle');
  const nav = container.querySelector('#siteNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
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

loadPartial('siteHeader', 'assets/header.html', setActiveNav);
loadPartial('siteFooter', 'assets/footer.html');

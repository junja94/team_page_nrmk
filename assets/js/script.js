const homeConfigUrl = 'content/home.json';
const postsIndexUrl = 'posts/posts.json';
const defaultHeroCopyUrl = 'content/hero.md';
let heroCopyUrl = defaultHeroCopyUrl;
let aboutUrl = '';
let heroMedia = [];
let techItems = [];
let fallbackThumbnail = '';
const getLocalizedMarkdown = window.getLocalizedMarkdown || ((markdown) => markdown);

const heroMediaContainer = document.getElementById('heroMedia');
const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
let heroIndex = 0;
let heroSlides = [];

function buildHeroSlide(item) {
  const slide = document.createElement('div');
  slide.className = 'hero-media-slide';
  const mediaType = item.mediaType || (isVideoSource(item.path) ? 'video' : 'image');
  if (mediaType === 'video') {
    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('loop', '');
    video.loop = true;
    video.preload = 'auto';
    if (item.poster) video.poster = item.poster;
    video.src = item.path;
    slide.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.path;
    img.alt = item.alt || '';
    if (!item.alt) img.setAttribute('aria-hidden', 'true');
    slide.appendChild(img);
  }
  return slide;
}

function initHeroSlides() {
  if (!heroMediaContainer || heroMedia.length === 0) return;
  heroMediaContainer.innerHTML = '';
  heroSlides = heroMedia.map((item) => {
    const slide = buildHeroSlide(item);
    heroMediaContainer.appendChild(slide);
    return slide;
  });
  setHeroMedia(0);
}

function setHeroMedia(index) {
  heroSlides.forEach((slide, i) => {
    const isActive = i === index;
    slide.classList.toggle('active', isActive);
    const video = slide.querySelector('video');
    if (video) {
      if (isActive) {
        if (video.readyState === 0) video.load();
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  });
  heroIndex = index;
}

function nextHero(step = 1) {
  if (heroMedia.length === 0) return;
  const next = (heroIndex + step + heroMedia.length) % heroMedia.length;
  setHeroMedia(next);
}

// Auto-advance hero slider every 5 seconds
let heroAutoplayInterval;
function startHeroAutoplay() {
  stopHeroAutoplay();
  if (heroMedia.length <= 1) return;
  heroAutoplayInterval = setInterval(() => nextHero(1), 5000);
}
function stopHeroAutoplay() {
  if (heroAutoplayInterval) {
    clearInterval(heroAutoplayInterval);
    heroAutoplayInterval = null;
  }
}
heroPrev?.addEventListener('click', () => {
  nextHero(-1);
  stopHeroAutoplay();
  setTimeout(startHeroAutoplay, 10000);
});
heroNext?.addEventListener('click', () => {
  nextHero(1);
  stopHeroAutoplay();
  setTimeout(startHeroAutoplay, 10000);
});

function applyHomeConfig(config = {}) {
  heroCopyUrl = typeof config.heroCopyUrl === 'string' && config.heroCopyUrl.trim()
    ? config.heroCopyUrl.trim()
    : defaultHeroCopyUrl;
  aboutUrl = typeof config.aboutUrl === 'string' ? config.aboutUrl.trim() : '';
  heroMedia = Array.isArray(config.heroMedia) ? config.heroMedia : [];
  fallbackThumbnail = config.fallbackThumbnail || '';
}

function loadAbout(url) {
  if (!url) return;
  const target = document.getElementById('aboutContent');
  if (!target) return;
  fetch(url)
    .then((res) => res.text())
    .then((md) => { target.innerHTML = marked.parse(md); })
    .catch(() => {});
}

function parseHeroMarkdown(markdown) {
  const lines = markdown.split('\n');
  let maxWidth = '';
  const filtered = lines.filter((line) => {
    if (line.trim().toLowerCase().startsWith('maxwidth:')) {
      maxWidth = line.split(':').slice(1).join(':').trim();
      return false;
    }
    return true;
  });
  return { content: filtered.join('\n').trim(), maxWidth };
}

function loadHeroCopy(url) {
  fetch(url)
    .then((res) => res.text())
    .then((markdown) => {
      const target = document.getElementById('heroCopy');
      if (!target) return;
      const localized = getLocalizedMarkdown(markdown);
      const localizedData = parseHeroMarkdown(localized);
      const fallbackData = localizedData.maxWidth ? localizedData : parseHeroMarkdown(markdown);
      if (fallbackData.maxWidth) target.style.maxWidth = fallbackData.maxWidth;
      target.innerHTML = marked.parse(localizedData.content);
    })
    .catch(() => {}); // Silently fail if hero.md doesn't load
}

// Core technology carousel
const techTrack = document.getElementById('techTrack');
const techPrev = document.getElementById('techPrev');
const techNext = document.getElementById('techNext');
const techDots = document.getElementById('techDots');
let techIndex = 0;
const cardsPerView = () => (window.innerWidth < 480 ? 1 : window.innerWidth < 720 ? 2 : 3);

function resolveAppearAtHome(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  }
  return Boolean(value);
}

function buildTechCard(item) {
  const card = document.createElement('article');
  card.className = 'tech-card';
  const targetUrl = `post.html?file=${item.link}`;
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', item.title);
  card.addEventListener('click', () => { window.location.href = targetUrl; });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = targetUrl;
    }
  });
  const mediaType = item.thumbnailType || (isVideoSource(item.thumbnailPath) ? 'video' : 'image');
  const media = mediaType === 'video' ? document.createElement('video') : document.createElement('img');
  if (mediaType === 'video') {
    media.muted = true;
    media.setAttribute('muted', '');
    media.loop = true;
    media.autoplay = true;
    media.setAttribute('autoplay', '');
    media.playsInline = true;
    media.setAttribute('playsinline', '');
    media.setAttribute('webkit-playsinline', '');
    media.preload = 'auto';
    if (item.thumbnailPoster) media.poster = item.thumbnailPoster;
  }
  media.src = item.thumbnailPath;
  if (mediaType === 'image') { media.alt = item.title; }
  else { media.setAttribute('aria-label', item.title); }
  card.appendChild(media);
  const content = document.createElement('div');
  content.className = 'content';
  const title = document.createElement('h3');
  title.textContent = item.title;
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  meta.textContent = item.authors;
  const desc = document.createElement('p');
  desc.className = 'tech-card-desc';
  desc.textContent = item.description;
  content.append(title, meta, desc);
  card.appendChild(content);
  return card;
}

// Re-play any muted looping video when it scrolls into view
const videoVisibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.1 });

function observeTechVideos() {
  if (!techTrack) return;
  techTrack.querySelectorAll('video').forEach((v) => {
    videoVisibilityObserver.unobserve(v);
    videoVisibilityObserver.observe(v);
  });
}

function renderTechCards() {
  if (!techTrack) return;
  techTrack.innerHTML = '';
  techTrack.style.transform = '';
  techItems.forEach((item) => {
    const card = buildTechCard(item);
    techTrack.appendChild(card);
  });
  slideTechTo(techIndex, false);
  renderTechDots();
  observeTechVideos();
}

function slideTechTo(index, animate = true) {
  if (!techTrack) return;
  techIndex = index;
  const count = cardsPerView();
  const cardWidth = techTrack.parentElement.offsetWidth;
  const gap = 16; // 1rem gap
  const slideWidth = (cardWidth + gap) / count;
  techTrack.style.transition = animate ? '' : 'none';
  techTrack.style.transform = `translateX(${-techIndex * slideWidth}px)`;
  renderTechDots();
}

function renderTechDots() {
  if (!techDots) return;
  techDots.innerHTML = '';
  if (techItems.length === 0) return;
  const pages = Math.ceil(techItems.length / cardsPerView());
  for (let i = 0; i < pages; i++) {
    const dot = document.createElement('button');
    if (i === Math.floor(techIndex / cardsPerView())) dot.classList.add('active');
    dot.addEventListener('click', () => {
      stopTechAutoplay();
      slideTechTo(i * cardsPerView());
    });
    techDots.appendChild(dot);
  }
}

function nextTech(step = 1) {
  if (techItems.length === 0) return;
  const count = cardsPerView();
  const pages = Math.ceil(techItems.length / count);
  const currentPage = Math.floor(techIndex / count);
  const nextPage = (currentPage + step + pages) % pages;
  slideTechTo(nextPage * count);
}

function loadHomeConfig() {
  fetch(homeConfigUrl)
    .then((res) => res.json())
    .then((config) => applyHomeConfig(config))
    .catch(() => applyHomeConfig({}))
    .finally(() => {
      loadHeroCopy(heroCopyUrl);
      loadAbout(aboutUrl);
      initHeroSlides();
      startHeroAutoplay();
    });
}

function loadTechItemsFromPosts() {
  return fetch(postsIndexUrl)
    .then((res) => res.json())
    .then((index) => {
      const entries = Array.isArray(index) ? index : [];
      return Promise.all(entries.map((item) => {
        const filePath = `posts/${item.file}`;
        const appearAtHome = resolveAppearAtHome(item.appearAtHome);
        return fetch(filePath)
          .then((res) => res.text())
          .then((md) => {
            const { meta } = parsePost(getLocalizedMarkdown(md));
            return { ...buildPostData(meta, filePath, fallbackThumbnail), appearAtHome };
          })
          .catch(() => ({
            ...buildPostData({ title: item.file }, filePath, fallbackThumbnail),
            appearAtHome,
          }));
      }));
    })
    .then((items) => {
      const filtered = items.filter((item) => item.appearAtHome !== false);
      filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      techItems = filtered;
      renderTechCards();
    })
    .catch(() => {});
}

// Touch swipe for tech carousel
(function () {
  const el = document.getElementById('techCarousel');
  if (!el) return;
  let startX = 0;
  el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 40) return;
    stopTechAutoplay();
    nextTech(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// Touch swipe for hero slider
(function () {
  const el = document.getElementById('heroSlider');
  if (!el) return;
  let startX = 0;
  el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 40) return;
    stopHeroAutoplay();
    nextHero(dx < 0 ? 1 : -1);
    setTimeout(startHeroAutoplay, 10000);
  }, { passive: true });
})();

// Autoplay for tech carousel
let techAutoplayInterval;
function startTechAutoplay() {
  stopTechAutoplay();
  if (techItems.length <= cardsPerView()) return;
  techAutoplayInterval = setInterval(() => nextTech(1), 5000);
}
function stopTechAutoplay() {
  if (techAutoplayInterval) {
    clearInterval(techAutoplayInterval);
    techAutoplayInterval = null;
  }
}
techPrev?.addEventListener('click', () => {
  nextTech(-1);
  stopTechAutoplay();
});
techNext?.addEventListener('click', () => {
  nextTech(1);
  stopTechAutoplay();
});
// Also pause on hover
document.getElementById('techCarousel')?.addEventListener('mouseenter', stopTechAutoplay);

window.addEventListener('resize', () => { renderTechCards(); });
loadHomeConfig();
loadTechItemsFromPosts();

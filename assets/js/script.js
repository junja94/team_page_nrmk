// script.js — home page: hero slider, research-highlight carousel, about section.

const DEFAULT_HERO_COPY_URL = 'content/hero.md';
const HERO_INTERVAL_MS = 5000;
const HERO_RESUME_DELAY_MS = 10000; // autoplay resumes this long after manual navigation
const SWIPE_THRESHOLD_PX = 40;
const CAROUSEL_GAP_PX = 16; // must match the .carousel-track gap (1rem)

/** Left/right swipe on `el` calls onSwipe(1) or onSwipe(-1). */
function addSwipeHandler(el, onSwipe) {
  if (!el) return;
  let startX = 0;
  el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) onSwipe(dx < 0 ? 1 : -1);
  }, { passive: true });
}

// ---- Hero slider ------------------------------------------------------------

const heroMediaContainer = document.getElementById('heroMedia');
let heroSlides = [];
let heroIndex = 0;
let heroTimer = null;
let heroResumeTimer = null;

function buildHeroSlide(item) {
  const slide = document.createElement('div');
  slide.className = 'hero-media-slide';
  // Playback is driven by showHeroSlide, so hidden slides never play.
  slide.appendChild(createMediaElement({
    path: item.path, type: item.mediaType, poster: item.poster, label: item.alt, autoplay: false,
  }));
  return slide;
}

function showHeroSlide(index) {
  heroIndex = index;
  heroSlides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('active', active);
    const video = slide.querySelector('video');
    if (!video) return;
    if (active) {
      if (video.readyState === 0) video.load();
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function stepHero(step) {
  const count = heroSlides.length;
  if (count) showHeroSlide((heroIndex + step + count) % count);
}

function stopHeroAutoplay() {
  clearInterval(heroTimer);
  heroTimer = null;
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (heroSlides.length > 1) heroTimer = setInterval(() => stepHero(1), HERO_INTERVAL_MS);
}

function navigateHero(step) {
  stepHero(step);
  stopHeroAutoplay();
  clearTimeout(heroResumeTimer);
  heroResumeTimer = setTimeout(startHeroAutoplay, HERO_RESUME_DELAY_MS);
}

function initHero(heroMedia) {
  if (!heroMediaContainer || heroMedia.length === 0) return;
  heroMediaContainer.innerHTML = '';
  heroSlides = heroMedia.map((item) => heroMediaContainer.appendChild(buildHeroSlide(item)));
  showHeroSlide(0);
  startHeroAutoplay();
}

document.getElementById('heroPrev')?.addEventListener('click', () => navigateHero(-1));
document.getElementById('heroNext')?.addEventListener('click', () => navigateHero(1));
addSwipeHandler(document.getElementById('heroSlider'), navigateHero);

// ---- Hero copy and about text ----------------------------------------------

/** Strip an optional leading "MaxWidth: <css length>" line out of the hero markdown. */
function parseHeroMarkdown(markdown) {
  let maxWidth = '';
  const content = markdown.split('\n').filter((line) => {
    if (!line.trim().toLowerCase().startsWith('maxwidth:')) return true;
    maxWidth = line.split(':').slice(1).join(':').trim();
    return false;
  });
  return { content: content.join('\n').trim(), maxWidth };
}

function loadHeroCopy(url) {
  const target = document.getElementById('heroCopy');
  if (!target) return;
  fetchText(url)
    .then((markdown) => {
      const { content, maxWidth } = parseHeroMarkdown(markdown);
      if (maxWidth) target.style.maxWidth = maxWidth;
      target.innerHTML = marked.parse(content);
    })
    .catch(() => {});
}

function loadAbout(url) {
  const target = document.getElementById('aboutContent');
  if (!url || !target) return;
  fetchText(url)
    .then((markdown) => { target.innerHTML = marked.parse(markdown); })
    .catch(() => {});
}

// ---- Research-highlight carousel -------------------------------------------

const techTrack = document.getElementById('techTrack');
const techDots = document.getElementById('techDots');
let techItems = [];
let techIndex = 0;

// Mirrors the .tech-card breakpoints in styles.css.
const cardsPerView = () => (window.innerWidth < 480 ? 1 : window.innerWidth < 720 ? 2 : 3);

function buildTechCard(item) {
  const card = document.createElement('article');
  card.className = 'tech-card';
  makeCardNavigable(card, postUrl(item.link), item.title);
  card.appendChild(createMediaElement({
    path: item.thumbnailPath, type: item.thumbnailType, poster: item.thumbnailPoster, label: item.title,
  }));

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

// Play card videos only while they are on screen.
const videoVisibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target: video, isIntersecting }) => {
    if (isIntersecting) video.play().catch(() => {});
    else video.pause();
  });
}, { threshold: 0.1 });

function renderTechCards() {
  if (!techTrack) return;
  techTrack.innerHTML = '';
  techItems.forEach((item) => techTrack.appendChild(buildTechCard(item)));
  techTrack.querySelectorAll('video').forEach((video) => videoVisibilityObserver.observe(video));
  slideTechTo(techIndex, false);
}

function slideTechTo(index, animate = true) {
  if (!techTrack) return;
  techIndex = index;
  const slideWidth = (techTrack.parentElement.offsetWidth + CAROUSEL_GAP_PX) / cardsPerView();
  techTrack.style.transition = animate ? '' : 'none';
  techTrack.style.transform = `translateX(${-index * slideWidth}px)`;
  renderTechDots();
}

function renderTechDots() {
  if (!techDots) return;
  techDots.innerHTML = '';
  const perView = cardsPerView();
  const pages = Math.ceil(techItems.length / perView);
  const currentPage = Math.floor(techIndex / perView);
  for (let page = 0; page < pages; page += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${page + 1}`);
    dot.classList.toggle('active', page === currentPage);
    dot.addEventListener('click', () => slideTechTo(page * perView));
    techDots.appendChild(dot);
  }
}

function stepTech(step) {
  if (techItems.length === 0) return;
  const perView = cardsPerView();
  const pages = Math.ceil(techItems.length / perView);
  const page = (Math.floor(techIndex / perView) + step + pages) % pages;
  slideTechTo(page * perView);
}

document.getElementById('techPrev')?.addEventListener('click', () => stepTech(-1));
document.getElementById('techNext')?.addEventListener('click', () => stepTech(1));
addSwipeHandler(document.getElementById('techCarousel'), stepTech);

// Re-measure on resize without rebuilding the cards (which would reload their videos);
// snap to the start of the current page in case the cards-per-view count changed.
window.addEventListener('resize', () => {
  const perView = cardsPerView();
  slideTechTo(Math.floor(techIndex / perView) * perView, false);
});

// ---- Boot -------------------------------------------------------------------

loadHomeConfig()
  .then((config) => {
    const heroCopyUrl = typeof config.heroCopyUrl === 'string' && config.heroCopyUrl.trim()
      ? config.heroCopyUrl.trim()
      : DEFAULT_HERO_COPY_URL;
    loadHeroCopy(heroCopyUrl);
    if (typeof config.aboutUrl === 'string') loadAbout(config.aboutUrl.trim());
    initHero(Array.isArray(config.heroMedia) ? config.heroMedia : []);
    return loadPosts(config.fallbackThumbnail || '');
  })
  .then((posts) => {
    techItems = posts.filter((post) => post.appearAtHome);
    renderTechCards();
  })
  .catch(() => {});

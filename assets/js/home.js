// home.js — home page: hero, about section, and the full research list.

const DEFAULT_HERO_COPY_URL = 'content/hero.md';
const DEFAULT_HERO_IMAGE = 'media/hero/eir_gemini.jpg';

// ---- Hero and about ---------------------------------------------------------

function renderHero(config) {
  const image = document.getElementById('heroImage');
  if (image) {
    image.src = config.heroImage || DEFAULT_HERO_IMAGE;
    image.alt = config.heroImageAlt || '';
  }

  const url = typeof config.heroCopyUrl === 'string' && config.heroCopyUrl.trim()
    ? config.heroCopyUrl.trim()
    : DEFAULT_HERO_COPY_URL;

  return fetchText(url)
    .then((markdown) => {
      const { meta, body } = parseFrontMatter(markdown);
      const kicker = document.getElementById('heroKicker');
      const title = document.getElementById('heroTitle');
      const lead = document.getElementById('heroLead');
      if (kicker) kicker.textContent = meta.kicker || '';
      if (title) title.textContent = meta.title || '';
      if (lead) lead.innerHTML = marked.parse(body);
    })
    .catch(() => {});
}

function renderAbout(url) {
  const target = document.getElementById('aboutContent');
  if (!url || !target) return Promise.resolve();
  return fetchText(url)
    .then((markdown) => { target.innerHTML = marked.parse(markdown); })
    .catch(() => {});
}

// ---- Research list ----------------------------------------------------------

const postList = document.getElementById('postList');
const postCount = document.getElementById('postCount');

function buildPostRow(post) {
  const row = el('a', 'post-row');
  row.href = postUrl(post.link);

  const thumbnail = createThumbnail(post);
  if (thumbnail) {
    const media = el('div', 'post-row-media');
    media.appendChild(thumbnail);
    row.appendChild(media);
  }

  const body = el('div', 'post-row-body');
  body.appendChild(createMetaLine(post, 'post-row-meta'));
  body.appendChild(el('h3', '', post.title));
  if (post.description) body.appendChild(el('p', 'post-row-desc', post.description));
  if (post.publication) body.appendChild(el('div', 'post-row-publication', post.publication));
  row.appendChild(body);
  return row;
}

function renderPosts(posts) {
  if (!postList) return;
  postList.innerHTML = '';
  posts.forEach((post) => postList.appendChild(buildPostRow(post)));
  if (postCount) {
    postCount.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'} · newest first`;
  }
}

// ---- Boot -------------------------------------------------------------------

loadHomeConfig()
  .then((config) => {
    renderHero(config);
    renderAbout(typeof config.aboutUrl === 'string' ? config.aboutUrl.trim() : '');
    return loadPosts(config.fallbackThumbnail || '');
  })
  .then(renderPosts)
  .catch(() => {
    if (postList) {
      postList.appendChild(el('p', 'list-empty',
        'No posts yet. Add Markdown files under /posts and list them in posts/posts.json.'));
    }
  });

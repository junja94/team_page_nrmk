// shared.js — helpers used by the page scripts.
// Loaded after layout.js and before the page script; everything here is a plain global.

const HOME_CONFIG_URL = 'content/home.json';
const POSTS_INDEX_URL = 'posts/posts.json';
const POSTS_DIR = 'posts/';
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

// ---- Fetching ---------------------------------------------------------------

function checkResponse(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.url}`);
  return res;
}

function fetchText(url) {
  return fetch(url).then(checkResponse).then((res) => res.text());
}

function fetchJson(url) {
  return fetch(url).then(checkResponse).then((res) => res.json());
}

/** Load content/home.json; resolves to {} when it is missing or invalid. */
function loadHomeConfig() {
  return fetchJson(HOME_CONFIG_URL).catch(() => ({}));
}

// ---- Posts ------------------------------------------------------------------

function isVideoSource(path = '') {
  const normalized = path.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

/**
 * Parse a markdown post file.
 * Supports YAML-style front matter (--- ... ---) or the legacy layout
 * (# Title followed by key: value lines). Keys are lower-cased with spaces removed.
 * Returns { meta, body }.
 */
function parsePost(markdown) {
  const lines = markdown.split('\n');
  const meta = {};
  const metaLine = /^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/;
  const setMeta = (match) => {
    meta[match[1].trim().toLowerCase().replace(/\s+/g, '')] = match[2].trim();
  };
  let i = 0;

  while (i < lines.length && !lines[i].trim()) i += 1;

  if (i < lines.length && lines[i].trim() === '---') {
    i += 1;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line === '---') { i += 1; break; }
      const match = line && line.match(metaLine);
      if (match) setMeta(match);
      i += 1;
    }
  } else {
    if (i < lines.length && lines[i].trim().startsWith('#')) {
      meta.title = lines[i].replace(/^#+\s*/, '').trim();
      i += 1;
    }
    while (i < lines.length && !lines[i].trim()) i += 1;
    for (; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!line) { i += 1; break; }
      const match = line.match(metaLine);
      if (!match) break;
      setMeta(match);
    }
  }

  return { meta, body: lines.slice(i).join('\n').trim() };
}

/** Normalise parsed front matter into the shape the renderers expect. */
function buildPostData(meta = {}, link = '', fallbackThumbnail = '') {
  const thumbnailPath = meta.thumbnailpath || meta.thumbnail || meta.image || meta.video || meta.videopath || '';
  return {
    title: meta.title || link,
    description: meta.description || '',
    authors: meta.authors || meta.author || '',
    date: meta.date || '',
    publication: meta.publication || '',
    publicationLink: meta.publicationlink || '',
    doi: meta.doi || '',
    thumbnailPath: thumbnailPath || fallbackThumbnail,
    thumbnailType: meta.thumbnailtype || '',
    thumbnailPoster: meta.thumbnailposter || '',
    link,
  };
}

/** "Authors · Date", omitting whichever part is missing. */
function formatPostMeta(post) {
  return [post.authors, post.date].filter(Boolean).join(' · ');
}

function postUrl(filePath) {
  return `post.html?file=${filePath}`;
}

/** Accepts true/false, "yes"/"no", "1"/"0", "on"/"off"; missing values use the default. */
function parseBooleanFlag(value, defaultValue = true) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  }
  return Boolean(value);
}

/**
 * Load every post listed in posts/posts.json, newest first.
 * A post whose file fails to load is kept and titled by its file name.
 */
function loadPosts(fallbackThumbnail = '') {
  return fetchJson(POSTS_INDEX_URL)
    .then((index) => Promise.all((Array.isArray(index) ? index : []).map((entry) => {
      const filePath = POSTS_DIR + entry.file;
      return fetchText(filePath)
        .then((md) => parsePost(md).meta)
        .catch(() => ({ title: entry.file }))
        .then((meta) => ({
          ...buildPostData(meta, filePath, fallbackThumbnail),
          appearAtHome: parseBooleanFlag(entry.appearAtHome, true),
        }));
    })))
    .then((posts) => posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
}

// ---- DOM helpers ------------------------------------------------------------

/**
 * Build an <img> or a muted, looping, inline <video> for a thumbnail or hero slide.
 * `type` overrides the extension-based detection; `autoplay` is on unless disabled.
 */
function createMediaElement({ path, type, poster, label, autoplay = true, preload = 'auto' }) {
  const mediaType = type || (isVideoSource(path) ? 'video' : 'image');
  if (mediaType !== 'video') {
    const img = document.createElement('img');
    img.src = path;
    img.alt = label || '';
    return img;
  }
  const video = document.createElement('video');
  // Both the property and the attribute are set: mobile browsers only allow
  // autoplay when the attributes are present in the DOM.
  video.muted = true;
  video.setAttribute('muted', '');
  video.loop = true;
  video.setAttribute('loop', '');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  if (autoplay) {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
  }
  video.preload = preload;
  if (poster) video.poster = poster;
  if (label) video.setAttribute('aria-label', label);
  video.src = path;
  return video;
}

/** Make a whole card act as a link (click, Enter, Space) while real links inside it keep working. */
function makeCardNavigable(card, url, label) {
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  if (label) card.setAttribute('aria-label', label);
  const navigate = () => { window.location.href = url; };
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    navigate();
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate();
    }
  });
}

/**
 * Append a minimal subset of inline markdown to `parent` as DOM nodes:
 *   [text](url)  →  <a href="url" target="_blank">text</a>
 *   **text**     →  <strong>text</strong>
 * Everything else is inserted as plain text, so content never reaches innerHTML.
 */
function appendInlineMarkdown(parent, text) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parent.append(text.slice(last, match.index));
    if (match[1] !== undefined) {
      const link = document.createElement('a');
      link.href = match[2];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      appendInlineMarkdown(link, match[1]);
      parent.appendChild(link);
    } else {
      const strong = document.createElement('strong');
      appendInlineMarkdown(strong, match[3]);
      parent.appendChild(strong);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parent.append(text.slice(last));
}

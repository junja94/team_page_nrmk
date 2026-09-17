// shared.js — utilities used across multiple pages

const videoExtensions = ['.mp4', '.webm', '.ogg'];

function isVideoSource(path = '') {
  const normalized = path.split('?')[0].toLowerCase();
  return videoExtensions.some((ext) => normalized.endsWith(ext));
}

/**
 * Parse a markdown post file.
 * Supports YAML front matter (--- ... ---) or legacy (# Title + key: value lines).
 * Returns { meta, body }.
 */
function parsePost(markdown) {
  const lines = markdown.split('\n');
  const meta = {};
  let i = 0;

  while (i < lines.length && !lines[i].trim()) i += 1;

  if (i < lines.length && lines[i].trim() === '---') {
    i += 1;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line === '---') { i += 1; break; }
      if (line) {
        const match = line.match(/^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/);
        if (match) meta[match[1].trim().toLowerCase().replace(/\s+/g, '')] = match[2].trim();
      }
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
      const match = line.match(/^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/);
      if (!match) break;
      meta[match[1].trim().toLowerCase().replace(/\s+/g, '')] = match[2].trim();
    }
  }

  return { meta, body: lines.slice(i).join('\n').trim() };
}

/**
 * Build a normalised post data object from parsed front matter.
 * fallbackThumbnail is optional; pass it from the caller's config.
 */
function buildPostData(meta = {}, link = '', fallbackThumbnail = '') {
  const thumbnailPath = meta.thumbnailpath || meta.thumbnail || meta.image || meta.video || meta.videopath || '';
  return {
    title: meta.title || link,
    description: meta.description || '',
    authors: meta.authors || meta.author || '',
    date: meta.date || '',
    thumbnailPath: thumbnailPath || fallbackThumbnail,
    thumbnailType: meta.thumbnailtype || '',
    thumbnailPoster: meta.thumbnailposter || '',
    link,
  };
}

/**
 * Render a minimal subset of inline markdown to an HTML string:
 *   [text](url)  →  <a href="url">text</a>
 *   **text**     →  <strong>text</strong>
 */
function renderInlineMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Set the text/innerHTML of a list item, using innerHTML only when inline
 * markdown is present to avoid unnecessary XSS surface.
 */
function setListItemContent(li, text) {
  if (/\[.*\]\(.*\)|\*\*/.test(text)) {
    li.innerHTML = renderInlineMarkdown(text);
  } else {
    li.textContent = text;
  }
}

// profile.js — PI profile page, rendered from profile/profile.json.

const PROFILE_URL = 'profile/profile.json';

// Mosaic presets: [columns, rows] per tile on a 4-column grid.
// "custom" takes each tile's own cols/rows from profile.json instead, on
// mosaic.columns columns (default 4).
// "grid" is the other exception: every tile is the same size on a grid of
// `mosaic.columns` columns (default 3) with a fixed aspect ratio.
const MOSAIC_LAYOUTS = {
  custom: [[1, 1]],
  grid: [[1, 1]],
  hero: [[2, 2], [2, 1], [1, 1], [1, 1], [1, 1], [3, 1]],
  even: [[2, 1], [2, 1], [2, 1], [2, 1], [2, 1], [2, 1]],
  strip: [[1, 1], [1, 1], [1, 1], [1, 1], [2, 1], [2, 1]],
  feature: [[4, 2], [1, 1], [1, 1], [1, 1], [1, 1], [4, 1]],
};

function headWithMeta(title, metaNode) {
  const head = el('div', 'section-head');
  head.appendChild(el('h2', '', title));
  if (metaNode) head.appendChild(metaNode);
  return head;
}

function externalLink(label, href, className = '') {
  const link = el('a', className, label);
  link.href = href;
  if (/^https?:/i.test(href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

// ---- Header -----------------------------------------------------------------

function renderHead(profile) {
  const host = document.getElementById('profileHead');
  if (!host) return;
  document.title = `${profile.name} · Neuromeka AI Lab`;

  const photo = el('div', 'profile-photo');
  if (profile.photo) {
    const img = document.createElement('img');
    img.src = profile.photo;
    img.alt = profile.name;
    photo.appendChild(img);
  }
  host.appendChild(photo);

  const body = el('div', 'profile-body');
  const identity = el('div', 'profile-identity');
  identity.appendChild(el('h1', 'page-title', profile.name));
  if (profile.role) identity.appendChild(el('div', 'profile-role', profile.role));
  if (profile.status) identity.appendChild(el('div', 'profile-status', profile.status));
  body.appendChild(identity);
  if (profile.bio) body.appendChild(el('p', 'profile-bio', profile.bio));
  if (Array.isArray(profile.links) && profile.links.length) {
    const links = el('div', 'profile-links');
    profile.links.forEach((item) => links.appendChild(externalLink(item.label, item.href)));
    body.appendChild(links);
  }
  host.appendChild(body);
}

// ---- Research mosaic --------------------------------------------------------

let profileData = {};

function renderMosaic(mosaic = {}) {
  const host = document.getElementById('profileMosaic');
  if (!host) return;
  const tiles = Array.isArray(mosaic.tiles) ? mosaic.tiles : [];
  if (!tiles.length) { host.hidden = true; return; }

  const layout = MOSAIC_LAYOUTS[mosaic.layout] ? mosaic.layout : 'hero';
  const spans = MOSAIC_LAYOUTS[layout];
  if (layout === 'grid') {
    host.classList.add('mosaic-grid');
    host.style.setProperty('--mosaic-cols', String(Number(mosaic.columns) || 3));
    host.style.setProperty('--mosaic-aspect', mosaic.aspect || '4 / 3');
  } else {
    if (layout === 'custom') host.style.setProperty('--mosaic-cols', String(Number(mosaic.columns) || 4));
    const rowHeight = Number(mosaic.rowHeight) || 150;
    host.style.setProperty('--mosaic-row', `${rowHeight}px`);
    // Row height as a fraction of the 912px desktop content width, so narrow
    // screens can scale the same layout down instead of restacking it.
    host.style.setProperty('--mosaic-row-frac', String(rowHeight / 912));
  }

  // A tile links to its paper: an explicit href, else the project link of the
  // publication with the same title.
  const linkFor = (tile) => tile.href
    || ((profileData.publications || []).find((pub) => pub.title === tile.caption) || {}).link
    || '';

  tiles.forEach((tile, i) => {
    const preset = spans[i % spans.length];
    const cols = layout === 'custom' ? Number(tile.cols) || 1 : preset[0];
    const rows = layout === 'custom' ? Number(tile.rows) || 1 : preset[1];
    const href = linkFor(tile);
    const cell = el(href ? 'a' : 'div', 'mosaic-tile');
    if (href) {
      cell.href = href;
      if (/^https?:/i.test(href)) {
        cell.target = '_blank';
        cell.rel = 'noopener noreferrer';
      }
      cell.setAttribute('aria-label', tile.caption || 'Paper');
    }
    cell.style.gridColumn = `span ${cols}`;
    cell.style.gridRow = `span ${rows}`;
    cell.dataset.cols = String(cols);

    const media = createMediaElement({ src: tile.src, poster: tile.poster, alt: tile.caption || '' });
    if (media) {
      // Per-tile framing: fit "contain" letterboxes instead of cropping;
      // position e.g. "top" or "50% 30%" chooses which part survives a crop.
      if (tile.fit) media.style.objectFit = tile.fit;
      if (tile.position) media.style.objectPosition = tile.position;
      cell.appendChild(media);
    }
    else cell.appendChild(el('span', 'mosaic-placeholder', `Research image ${i + 1}`));
    if (tile.caption) {
      const caption = el('div', 'mosaic-caption');
      caption.appendChild(el('div', 'mosaic-caption-title', tile.caption));
      if (tile.sub) caption.appendChild(el('div', 'mosaic-caption-sub', tile.sub));
      cell.appendChild(caption);
    }
    host.appendChild(cell);
  });
  observeVideos(host);
}

// ---- Two-column list blocks -------------------------------------------------

function dateRow(when, primary, secondary, dateClass = 'date-120') {
  const row = el('div', `dated-row ${dateClass}`);
  row.appendChild(el('div', 'dated-row-when', when));
  const body = el('div');
  body.appendChild(el('div', 'dated-row-primary', primary));
  if (secondary) body.appendChild(el('div', 'dated-row-secondary', secondary));
  row.appendChild(body);
  return row;
}

function column(title, rows) {
  const col = el('div', 'section-rows');
  col.appendChild(headWithMeta(title));
  rows.forEach((row) => col.appendChild(row));
  return col;
}

function renderCareer(profile) {
  const host = document.getElementById('profileCareer');
  if (!host) return;
  host.appendChild(column('Experience',
    (profile.experience || []).map((w) => dateRow(w.when, w.org, w.role))));
  host.appendChild(column('Education',
    (profile.education || []).map((e) => dateRow(e.when, e.org, e.degree))));
}

function renderHonors(profile) {
  const host = document.getElementById('profileHonors');
  if (!host) return;
  host.appendChild(column('Awards',
    (profile.awards || []).map((h) => dateRow(String(h.year), h.title, h.by, 'date-48'))));

  const students = el('div', 'section-rows');
  students.appendChild(headWithMeta('Former students & mentees'));
  (profile.students || []).forEach((s) => {
    const row = el('div', 'student-row');
    row.appendChild(el('div', 'student-name', s.name));
    if (s.note) row.appendChild(el('div', 'student-note', s.note));
    students.appendChild(row);
  });
  host.appendChild(students);
}

// ---- Funding ----------------------------------------------------------------

function renderFunding(profile) {
  const host = document.getElementById('profileFunding');
  const grants = profile.funding || [];
  if (!host) return;
  if (!grants.length) { host.hidden = true; return; }
  host.appendChild(headWithMeta('Funding'));
  grants.forEach((g) => {
    const row = el('div', 'funding-row');
    row.appendChild(el('div', 'dated-row-when', g.when || ''));
    const body = el('div', 'funding-body');
    body.appendChild(g.link ? externalLink(g.title, g.link, 'funding-title') : el('div', 'funding-title', g.title));
    if (g.program) body.appendChild(el('div', 'funding-program', g.program));
    const meta = el('div', 'funding-meta');
    [g.role, g.partners].filter(Boolean).forEach((text) => meta.appendChild(el('span', '', text)));
    if (meta.childNodes.length) body.appendChild(meta);
    row.appendChild(body);
    if (g.amount) row.appendChild(el('div', 'funding-amount', g.amount));
    host.appendChild(row);
  });
}

// ---- Publications -----------------------------------------------------------

function renderPublications(profile) {
  const host = document.getElementById('profilePubs');
  if (!host) return;
  const scholar = profile.scholarUrl
    ? externalLink('Full list on Google Scholar →', profile.scholarUrl, 'section-head-link')
    : null;
  host.appendChild(headWithMeta('Selected publications', scholar));

  (profile.publications || []).forEach((pub) => {
    const row = el('div', 'pub-row');
    row.appendChild(el('div', 'pub-year', String(pub.year)));
    const body = el('div', 'pub-body');
    body.appendChild(el('div', 'pub-title', pub.title));
    if (pub.authors) body.appendChild(el('div', 'pub-authors', pub.authors));
    const meta = el('div', 'pub-meta');
    if (pub.venue) meta.appendChild(el('span', 'pub-venue', pub.venue));
    if (pub.award) meta.appendChild(el('span', 'badge', pub.award));
    if (pub.link) meta.appendChild(externalLink('Project page', pub.link));
    body.appendChild(meta);
    row.appendChild(body);
    host.appendChild(row);
  });
}

// ---- Talks ------------------------------------------------------------------

function renderTalks(profile) {
  const host = document.getElementById('profileTalks');
  if (!host) return;
  const talks = profile.talks || [];
  host.appendChild(headWithMeta('Invited talks & lectures',
    el('span', 'section-meta', `${talks.length} talk${talks.length === 1 ? '' : 's'}`)));
  talks.forEach((t) => {
    const row = el('div', 'talk-row');
    row.appendChild(el('div', 'talk-date', t.date));
    row.appendChild(el('div', 'talk-title', t.title));
    const venue = el('div', 'talk-venue', t.venue || '');
    if (t.country) venue.appendChild(el('span', 'talk-country', t.country));
    row.appendChild(venue);
    host.appendChild(row);
  });
}

// ---- Boot -------------------------------------------------------------------

fetchJson(PROFILE_URL)
  .then((profile) => {
    profileData = profile;
    renderHead(profile);
    renderMosaic(profile.mosaic);
    renderCareer(profile);
    renderFunding(profile);
    renderPublications(profile);
    renderHonors(profile);
    renderTalks(profile);
  })
  .catch(() => {
    const host = document.getElementById('profileHead');
    if (host) host.appendChild(el('p', 'list-empty', 'Could not load profile/profile.json.'));
  });

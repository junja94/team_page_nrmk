// team.js — the Team blocks on the home page: team/team.md for the people,
// team/hiring.md for the openings. Rendered into #teamContent.
//
// Markdown schema
//   # Group name            a section; the first one becomes the page heading
//     Meta: Seoul           optional, shown at the right of the first section's heading
//     Contact: text         optional, the line beside an "Open positions" heading
//   ## Name | Role          a person row, or an opening in the positions section
//     Image: path           person photo
//     Link: [Label](url)    optional external link, shown after the credentials
//     Profile: profile.html optional in-site profile page, shown as "Profile →"
//     Location: Seoul       opening location badge
//     - bullet              credentials; for an opening, the first bullet is the
//                           requirement and the rest are joined with " · "
//   ### Partner labs        a labelled sub-block, one bullet per lab:
//     - [Name](url) | Institution | optional/logo.svg  (shown small, right of the name)

const TEAM_URL = 'team/team.md';
const HIRING_URL = 'team/hiring.md';
const PARTNER_LABS_LABEL = 'partner labs';
const POSITIONS_GROUP = 'open positions';
const teamContent = document.getElementById('teamContent');

/** Line-based parse into [{ name, meta, entries, lists }]. */
function parseTeamMarkdown(markdown) {
  const groups = [];
  let group = null;
  let entry = null;
  let list = null;

  markdown.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('<!--')) return;

    if (line.startsWith('### ')) {
      entry = null;
      list = { title: line.slice(4).trim(), bullets: [] };
      if (group) group.lists.push(list);
      return;
    }
    if (line.startsWith('## ')) {
      const [name, role = ''] = splitPipes(line.slice(3));
      list = null;
      entry = { name, role, meta: {}, bullets: [] };
      if (group && name) group.entries.push(entry);
      return;
    }
    if (line.startsWith('# ')) {
      entry = null;
      list = null;
      group = { name: line.slice(2).trim(), meta: {}, entries: [], lists: [] };
      groups.push(group);
      return;
    }
    if (line.startsWith('- ')) {
      const bullet = line.slice(2).trim();
      if (list) list.bullets.push(bullet);
      else if (entry) entry.bullets.push(bullet);
      return;
    }

    const match = line.match(META_LINE);
    if (!match) return;
    const target = entry || group;
    if (target) target.meta[metaKey(match[1])] = match[2].trim();
  });

  return groups;
}

function buildSectionHead(title, metaText) {
  const head = el('div', 'section-head');
  head.appendChild(el('h2', '', title));
  if (metaText) head.appendChild(el('span', 'section-meta', metaText));
  return head;
}

function buildPersonRow(person) {
  const row = el('div', 'person-row');

  const photo = el('div', 'person-photo');
  if (person.meta.image) {
    const img = document.createElement('img');
    img.src = person.meta.image;
    img.alt = person.name;
    img.loading = 'lazy';
    photo.appendChild(img);
  }
  row.appendChild(photo);

  const identity = el('div', 'person-identity');
  identity.appendChild(el('div', 'person-name', person.name));
  if (person.role) identity.appendChild(el('div', 'person-role', person.role));
  row.appendChild(identity);

  const credentials = el('div', 'person-credentials');
  person.bullets.forEach((bullet) => {
    const span = el('span');
    appendInlineMarkdown(span, bullet);
    credentials.appendChild(span);
  });
  if (person.meta.link) {
    const span = el('span');
    appendInlineMarkdown(span, person.meta.link);
    credentials.appendChild(span);
  }
  if (person.meta.profile) {
    const link = el('a', '', 'Profile →');
    link.href = person.meta.profile;
    credentials.appendChild(link);
  }
  row.appendChild(credentials);
  return row;
}

function buildPartnerLab(bullet) {
  const [nameField, institution = '', logo = ''] = splitPipes(bullet);
  const link = parseMarkdownLink(nameField);
  const name = link ? link.label : nameField;

  const lab = el('div', 'partner-lab');
  const label = el(link ? 'a' : 'div', 'partner-lab-link');
  if (link) {
    label.href = link.href;
    label.target = '_blank';
    label.rel = 'noopener noreferrer';
  }
  label.appendChild(el('span', 'partner-lab-name', name));
  if (institution) label.appendChild(el('span', 'partner-lab-inst', institution));
  lab.appendChild(label);

  // Small institution mark to the right of the name; nothing when no logo is given.
  if (logo) {
    const img = document.createElement('img');
    img.className = 'partner-lab-mark';
    img.src = logo;
    img.alt = `${institution || name} logo`;
    img.loading = 'lazy';
    lab.appendChild(img);
  }
  return lab;
}

function buildPartnerLabs(list) {
  const block = el('div', 'partner-labs');
  const head = el('div', 'section-head partner-labs-head');
  head.appendChild(el('h3', 'kicker kicker-muted', list.title));
  block.appendChild(head);

  const grid = el('div', 'partner-labs-grid');
  list.bullets.forEach((bullet) => grid.appendChild(buildPartnerLab(bullet)));
  block.appendChild(grid);
  return block;
}

function buildPeopleSection(group, metaText) {
  const section = el('div', 'section-rows');
  section.appendChild(buildSectionHead(group.name, metaText));
  group.entries.forEach((person) => section.appendChild(buildPersonRow(person)));
  group.lists
    .filter((list) => list.title.toLowerCase() === PARTNER_LABS_LABEL)
    .forEach((list) => section.appendChild(buildPartnerLabs(list)));
  return section;
}

function buildPositionRow(opening) {
  const row = el('div', 'position-row');
  row.appendChild(el('div', 'position-title', opening.name));

  const detail = el('div', 'position-detail');
  const [requirement, ...rest] = opening.bullets;
  if (requirement) {
    const strong = el('strong');
    appendInlineMarkdown(strong, requirement);
    detail.appendChild(strong);
  }
  if (rest.length) {
    detail.append(requirement ? ' · ' : '');
    appendInlineMarkdown(detail, rest.join(' · '));
  }
  row.appendChild(detail);

  if (opening.meta.location) row.appendChild(el('div', 'position-location', opening.meta.location));
  return row;
}

function buildPositionsSection(group) {
  const section = el('div', 'positions');

  const head = el('div', 'positions-head');
  head.appendChild(el('h2', '', group.name));
  if (group.meta.contact) {
    const contact = el('p', 'positions-contact');
    appendInlineMarkdown(contact, group.meta.contact);
    head.appendChild(contact);
  }
  section.appendChild(head);

  const list = el('div', 'positions-list');
  group.entries.forEach((opening) => list.appendChild(buildPositionRow(opening)));
  section.appendChild(list);
  return section;
}

function renderTeamPage(groups) {
  teamContent.innerHTML = '';
  const peopleGroups = groups.filter((group) => group.name.toLowerCase() !== POSITIONS_GROUP);
  const headcount = peopleGroups.reduce((total, group) => total + group.entries.length, 0);

  groups.forEach((group) => {
    if (group.name.toLowerCase() === POSITIONS_GROUP) {
      teamContent.appendChild(buildPositionsSection(group));
      return;
    }
    const isFirst = group === peopleGroups[0];
    const metaText = isFirst && group.meta.meta
      ? `${headcount} members · ${group.meta.meta}`
      : '';
    teamContent.appendChild(buildPeopleSection(group, metaText));
  });
}

if (teamContent) {
  Promise.all([fetchText(TEAM_URL), fetchText(HIRING_URL)])
    .then(([teamMd, hiringMd]) => [...parseTeamMarkdown(teamMd), ...parseTeamMarkdown(hiringMd)])
    .then(renderTeamPage)
    .catch(() => {
      teamContent.appendChild(el('p', 'list-empty',
        'Add team members in team/team.md and openings in team/hiring.md.'));
    });
}

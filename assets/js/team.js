// team.js — Team page: renders team/hiring.md followed by team/team.md.
//
// Markdown layout:  # Group          → a section (a group named "Open …" is styled as a callout)
//                   ## Name | Role   → a member card, with an optional "Image:" line and "- " bullets
//                   ### Label        → a bullet list (a "### Contact" list becomes the callout text)

const TEAM_URL = 'team/team.md';
const HIRING_URL = 'team/hiring.md';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80';
const teamGrid = document.getElementById('teamGrid');

function parseBullets(lines) {
  return lines.filter((line) => line.trim().startsWith('- ')).map((line) => line.replace(/^\s*-\s*/, '').trim());
}

function parseTeam(markdown) {
  const groups = [];
  markdown.split(/\n# (?!#)/).filter(Boolean).forEach((groupBlock) => {
    const lines = groupBlock.split('\n');
    const groupName = lines.shift().replace(/^#\s*/, '').trim();
    const groupText = lines.join('\n');

    // Pull out the "### Label" lists first so they do not bleed into member parsing.
    const listSections = [];
    const subSection = /\n### ([^\n]+)\n([\s\S]*?)(?=\n### |\n## |$)/g;
    let memberText = groupText;
    let match;
    while ((match = subSection.exec(groupText)) !== null) {
      listSections.push({ title: match[1].trim(), bullets: parseBullets(match[2].split('\n')) });
      memberText = memberText.replace(match[0], '');
    }

    const members = [];
    memberText.split(/\n## /).filter(Boolean).forEach((block) => {
      const blockLines = block.split('\n').filter(Boolean);
      const header = blockLines.shift().replace(/^##\s*/, '');
      const [name, role = ''] = header.split('|').map((s) => s.trim());
      if (!name) return;
      const imageLine = blockLines.find((line) => line.toLowerCase().startsWith('image:'));
      const image = imageLine ? imageLine.slice(imageLine.indexOf(':') + 1).trim() : null;
      members.push({ name, role, image, bullets: parseBullets(blockLines) });
    });

    if (members.length || listSections.length) groups.push({ groupName, members, listSections });
  });
  return groups;
}

function buildBulletList(bullets) {
  const list = document.createElement('ul');
  bullets.forEach((point) => {
    const li = document.createElement('li');
    appendInlineMarkdown(li, point);
    list.appendChild(li);
  });
  return list;
}

function buildListSection({ title, bullets }) {
  const section = document.createElement('div');
  section.className = 'team-list-section';
  const heading = document.createElement('h3');
  heading.className = 'team-list-label';
  heading.textContent = title;
  section.append(heading, buildBulletList(bullets));
  return section;
}

function buildMemberCard(member, withImage) {
  const card = document.createElement('article');
  card.className = 'team-card';
  if (withImage) {
    const img = document.createElement('img');
    img.src = member.image || DEFAULT_AVATAR;
    img.alt = member.name;
    card.appendChild(img);
  }
  const body = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = member.name;
  const role = document.createElement('div');
  role.className = 'post-meta';
  role.textContent = member.role;
  body.append(name, role, buildBulletList(member.bullets));
  card.appendChild(body);
  return card;
}

function buildContactCallout(title, lines) {
  const callout = document.createElement('div');
  callout.className = 'team-open-callout';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const text = document.createElement('p');
  lines.forEach((line, i) => {
    if (i) text.appendChild(document.createElement('br'));
    appendInlineMarkdown(text, line);
  });
  callout.append(heading, text);
  return callout;
}

function buildGroupSection({ groupName, members, listSections }) {
  const key = groupName.toLowerCase();
  const isOpen = key.includes('open');
  const isAlumni = key.includes('alumni');
  const isContact = (section) => section.title.toLowerCase() === 'contact';

  const container = document.createElement('div');
  container.className = isOpen ? 'team-section team-section-open' : 'team-section';

  if (isOpen) {
    const contact = listSections.find(isContact);
    if (contact) container.appendChild(buildContactCallout(groupName, contact.bullets));
  } else if (!isAlumni) {
    const label = document.createElement(key === 'team' ? 'h1' : 'h2');
    label.className = 'team-group-label';
    label.textContent = groupName;
    container.appendChild(label);
  }

  if (members.length) {
    const grid = document.createElement('div');
    grid.className = isOpen ? 'team-cards team-cards-open' : 'team-cards';
    members.forEach((member) => grid.appendChild(buildMemberCard(member, !isOpen)));
    container.appendChild(grid);
  }

  listSections
    .filter((section) => !isContact(section))
    .forEach((section) => container.appendChild(buildListSection(section)));

  return container;
}

if (teamGrid) {
  Promise.all([fetchText(HIRING_URL), fetchText(TEAM_URL)])
    .then(([hiringMd, teamMd]) => [...parseTeam(hiringMd), ...parseTeam(teamMd)])
    .then((groups) => {
      teamGrid.innerHTML = '';
      groups.forEach((group) => teamGrid.appendChild(buildGroupSection(group)));
    })
    .catch(() => {
      teamGrid.textContent = 'Add team members in team/team.md using Markdown headings.';
    });
}

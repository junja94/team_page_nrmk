const teamMarkdownUrl = 'team/team.md';
const hiringMarkdownUrl = 'team/hiring.md';
const teamGrid = document.getElementById('teamGrid');

function parseTeam(markdown) {
  const groups = [];
  // Split on h1 headings (group labels)
  const groupBlocks = markdown.split(/\n# (?!#)/).filter(Boolean);
  groupBlocks.forEach((groupBlock) => {
    const lines = groupBlock.split('\n');
    let groupName = lines.shift().replace(/^#\s*/, '').trim();
    const memberText = lines.join('\n');
    const members = [];
    const listSections = [];

    // Split member blocks (##) from list sub-sections (###)
    // First extract ### sub-sections
    const subSectionRegex = /\n### ([^\n]+)\n([\s\S]*?)(?=\n### |\n## |$)/g;
    let sectionMatch;
    let memberOnlyText = memberText;
    while ((sectionMatch = subSectionRegex.exec(memberText)) !== null) {
      const title = sectionMatch[1].trim();
      const bullets = sectionMatch[2]
        .split('\n')
        .filter((l) => l.trim().startsWith('- '))
        .map((l) => l.replace(/^-\s*/, '').trim());
      listSections.push({ title, bullets });
      // Remove from memberOnlyText so it doesn't bleed into member parsing
      memberOnlyText = memberOnlyText.replace(sectionMatch[0], '');
    }

    const memberBlocks = memberOnlyText.split(/\n## /).filter(Boolean);
    memberBlocks.forEach((block) => {
      const blines = block.split('\n').filter(Boolean);
      let header = blines.shift().replace(/^##\s*/, '');
      const [name, role] = header.split('|').map((s) => s.trim());
      const bullets = blines.filter((line) => line.startsWith('- ')).map((line) => line.replace(/^-\s*/, ''));
      const imageLine = blines.find((line) => line.toLowerCase().startsWith('image:'));
      const image = imageLine ? imageLine.slice(imageLine.indexOf(':') + 1).trim() : null;
      if (name) members.push({ name, role, bullets, image });
    });
    if (members.length || listSections.length) groups.push({ groupName, members, listSections });
  });
  return groups;
}

function renderListSection({ title, bullets }) {
  const section = document.createElement('div');
  section.className = 'team-list-section';
  const heading = document.createElement('h3');
  heading.className = 'team-list-label';
  heading.textContent = title;
  const ul = document.createElement('ul');
  bullets.forEach((point) => {
    const li = document.createElement('li');
    setListItemContent(li, point);
    ul.appendChild(li);
  });
  section.append(heading, ul);
  return section;
}

function renderTeam(groups) {
  if (!teamGrid) return;
  teamGrid.innerHTML = '';

  groups.forEach(({ groupName, members, listSections }) => {
    const isOpenSection = groupName.toLowerCase().includes('open');

    // Outer container
    const container = document.createElement('div');
    container.className = isOpenSection ? 'team-section team-section-open' : 'team-section';

    if (isOpenSection) {
      // Contact callout rendered from the ### Contact sub-section in team.md
      const contactSection = listSections.find((ls) => ls.title.toLowerCase() === 'contact');
      if (contactSection) {
        const callout = document.createElement('div');
        callout.className = 'team-open-callout';
        const h3 = document.createElement('h3');
        h3.textContent = groupName;
        const p = document.createElement('p');
        p.innerHTML = contactSection.bullets
          .map((line) => renderInlineMarkdown(line))
          .join('<br>');
        callout.append(h3, p);
        container.appendChild(callout);
      }
    }

    if (!isOpenSection) {
      const isTeam = groupName.toLowerCase() === 'team';
      const isAlumni = groupName.toLowerCase().includes('alumni');
      if (!isAlumni) {
        const groupLabel = document.createElement(isTeam ? 'h1' : 'h2');
        groupLabel.className = 'team-group-label';
        groupLabel.textContent = groupName;
        container.appendChild(groupLabel);
      }
    }

    if (members.length) {
      const grid = document.createElement('div');
      grid.className = isOpenSection ? 'team-cards team-cards-open' : 'team-cards';
      members.forEach((member) => {
        const card = document.createElement('article');
        card.className = 'team-card';

        const img = document.createElement('img');
        img.src = member.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80';
        img.alt = member.name;

        const body = document.createElement('div');
        const name = document.createElement('h3');
        name.textContent = member.name;
        const role = document.createElement('div');
        role.className = 'post-meta';
        role.textContent = member.role;
        const list = document.createElement('ul');
        member.bullets.forEach((point) => {
          const li = document.createElement('li');
          setListItemContent(li, point);
          list.appendChild(li);
        });

        body.append(name, role, list);
        if (!isOpenSection) card.append(img, body);
        else card.append(body);
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }

    // Render list sub-sections (Interns, Alumni, Collaborators, ...)
    // Skip 'Contact' — already rendered as callout above
    listSections.forEach((ls) => {
      if (ls.title.toLowerCase() === 'contact') return;
      container.appendChild(renderListSection(ls));
    });

    teamGrid.appendChild(container);
  });
}

Promise.all([
  fetch(hiringMarkdownUrl).then((r) => r.text()),
  fetch(teamMarkdownUrl).then((r) => r.text()),
])
  .then(([hiringMd, teamMd]) => [
    ...parseTeam(hiringMd),
    ...parseTeam(teamMd),
  ])
  .then((groups) => renderTeam(groups))
  .catch(() => {
    if (teamGrid) teamGrid.textContent = 'Add team members in team/team.md using Markdown headings.';
  });

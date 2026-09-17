// sources.js — Open Sources page: lists repositories from sources/repos.json.
// Standalone (this page does not load shared.js).

const repoList = document.getElementById('repoList');

function buildRepoCard(repo) {
  const card = document.createElement('article');
  card.className = 'repo-card';
  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = repo.url;
  link.textContent = repo.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  title.appendChild(link);

  const desc = document.createElement('p');
  desc.textContent = repo.description || '';
  const tags = document.createElement('div');
  tags.className = 'post-meta';
  tags.textContent = (repo.topics || []).join(' · ');

  card.append(title, desc, tags);
  return card;
}

if (repoList) {
  fetch('sources/repos.json')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
    .then((repos) => {
      repoList.innerHTML = '';
      repos.forEach((repo) => repoList.appendChild(buildRepoCard(repo)));
    })
    .catch(() => {
      repoList.textContent = 'Add repositories in sources/repos.json.';
    });
}

// sources.js — Open Sources page: lists repositories from sources/repos.json.
// Not linked from the nav; standalone (this page does not load shared.js).

const SOURCES_URL = 'sources/repos.json';
const repoList = document.getElementById('repoList');
const repoCount = document.getElementById('repoCount');

function buildRepoRow(repo) {
  const row = document.createElement('div');
  row.className = 'repo-row';

  const heading = document.createElement('h2');
  const link = document.createElement('a');
  link.href = repo.url;
  link.textContent = repo.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  heading.appendChild(link);
  row.appendChild(heading);

  if (repo.description) {
    const desc = document.createElement('p');
    desc.textContent = repo.description;
    row.appendChild(desc);
  }
  if (repo.topics?.length) {
    const topics = document.createElement('div');
    topics.className = 'repo-topics';
    topics.textContent = repo.topics.join(' · ');
    row.appendChild(topics);
  }
  return row;
}

if (repoList) {
  fetch(SOURCES_URL)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
    .then((repos) => {
      repoList.innerHTML = '';
      repos.forEach((repo) => repoList.appendChild(buildRepoRow(repo)));
      if (repoCount) {
        repoCount.textContent = `${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'}`;
      }
    })
    .catch(() => {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'Add repositories in sources/repos.json.';
      repoList.appendChild(empty);
    });
}

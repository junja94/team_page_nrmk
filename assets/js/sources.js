const repoList = document.getElementById('repoList');
const sourcesUrl = 'sources/repos.json';

fetch(sourcesUrl)
  .then((res) => res.json())
  .then((repos) => {
    if (!repoList) return;
    repoList.innerHTML = '';
    repos.forEach((repo) => {
      const card = document.createElement('article');
      card.className = 'repo-card';
      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.href = repo.url;
      link.textContent = repo.name;
      link.target = '_blank';
      link.rel = 'noopener';
      title.appendChild(link);

      const desc = document.createElement('p');
      desc.textContent = repo.description;
      const tags = document.createElement('div');
      tags.className = 'post-meta';
      tags.textContent = repo.topics?.join(' · ') || '';

      card.append(title, desc, tags);
      repoList.appendChild(card);
    });
  })
  .catch(() => {
    if (repoList) repoList.textContent = 'Add repositories in sources/repos.json.';
  });

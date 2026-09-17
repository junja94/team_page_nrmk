// post.js — renders one Markdown post, chosen with ?file=posts/<name>.md

const postContainer = document.getElementById('post');
const postFile = new URLSearchParams(window.location.search).get('file');

function buildPaperCard(post) {
  const card = document.createElement('div');
  card.className = 'paper-card';

  if (post.publication) {
    const line = document.createElement('div');
    line.className = 'paper-title';
    const label = document.createElement('strong');
    label.textContent = 'Publication: ';
    line.append(label, post.publication);
    card.appendChild(line);
  }

  const links = document.createElement('div');
  links.className = 'paper-meta';
  if (post.publicationLink) appendInlineMarkdown(links, post.publicationLink);
  if (post.doi) links.append(`${post.publicationLink ? ' · ' : ''}DOI: ${post.doi}`);
  card.appendChild(links);
  return card;
}

function renderPost(post) {
  document.title = `${post.title} · Neuromeka AI Lab`;
  postContainer.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'post-header';
  const title = document.createElement('h1');
  title.textContent = post.title;
  header.appendChild(title);
  if (post.description) {
    const desc = document.createElement('p');
    desc.className = 'post-header-description';
    desc.textContent = post.description;
    header.appendChild(desc);
  }
  const metaText = formatPostMeta(post);
  if (metaText) {
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    meta.textContent = metaText;
    header.appendChild(meta);
  }
  postContainer.appendChild(header);

  if (post.publication || post.publicationLink || post.doi) {
    postContainer.appendChild(buildPaperCard(post));
  }

  const body = document.createElement('div');
  body.className = 'markdown';
  body.innerHTML = marked.parse(post.body);
  postContainer.appendChild(body);
}

if (postContainer && !postFile) {
  postContainer.textContent = 'No post specified. Use ?file=posts/your-post.md';
} else if (postContainer) {
  fetchText(postFile)
    .then((markdown) => {
      const { meta, body } = parsePost(markdown);
      renderPost({ ...buildPostData(meta, postFile), body });
    })
    .catch(() => {
      postContainer.textContent = 'Could not load this post.';
    });
}

const postsIndexUrl = 'posts/posts.json';
const postList = document.getElementById('postList');
const getLocalizedMarkdown = window.getLocalizedMarkdown || ((markdown) => markdown);

function renderPostCard(post, file) {
  const card = document.createElement('article');
  card.className = 'post-card';
  const targetUrl = `post.html?file=${file}`;
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    window.location.href = targetUrl;
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = targetUrl;
    }
  });

  const mediaPath = post.thumbnailPath;
  const mediaType = post.thumbnailType || (isVideoSource(mediaPath) ? 'video' : 'image');
  const media = mediaType === 'video' ? document.createElement('video') : document.createElement('img');
  if (mediaType === 'video') {
    media.muted = true;
    media.setAttribute('muted', '');
    media.loop = true;
    media.playsInline = true;
    media.setAttribute('playsinline', '');
    media.setAttribute('webkit-playsinline', '');
    media.autoplay = true;
    media.setAttribute('autoplay', '');
    media.preload = 'auto';
    if (post.thumbnailPoster) media.poster = post.thumbnailPoster;
    media.src = mediaPath;
    media.setAttribute('aria-label', post.title);
  } else {
    media.src = mediaPath;
    media.alt = post.title;
  }
  card.appendChild(media);

  const content = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = post.title;
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  const metaParts = [];
  if (post.authors) metaParts.push(post.authors);
  if (post.date) metaParts.push(post.date);
  if (metaParts.length) meta.textContent = metaParts.join(' · ');
  const desc = document.createElement('p');
  desc.className = 'post-description';
  desc.textContent = post.description;

  content.append(title, meta, desc);
  card.appendChild(content);
  postList?.appendChild(card);
}

function loadPosts(fallbackThumbnail) {
  fetch(postsIndexUrl)
    .then((res) => res.json())
    .then((index) => {
      const entries = Array.isArray(index) ? index : [];
      return Promise.all(entries.map((item) => {
        const filePath = `posts/${item.file}`;
        return fetch(filePath)
          .then((res) => res.text())
          .then((md) => parsePost(getLocalizedMarkdown(md)))
          .then(({ meta }) => ({ post: buildPostData(meta, filePath, fallbackThumbnail), filePath }))
          .catch(() => ({
            post: buildPostData({ title: item.file }, filePath, fallbackThumbnail),
            filePath,
          }));
      }));
    })
    .then((items) => {
      if (postList) postList.innerHTML = '';
      items
        .sort((a, b) => new Date(b.post.date || 0) - new Date(a.post.date || 0))
        .forEach(({ post, filePath }) => renderPostCard(post, filePath));
    })
    .catch(() => {
      if (postList) postList.textContent = 'No posts yet. Add Markdown files under /posts and list them in posts/posts.json.';
    });
}

fetch('content/home.json')
  .then((res) => res.json())
  .then((config) => loadPosts(config.fallbackThumbnail || ''))
  .catch(() => loadPosts(''));

// blog.js — Technology page: lists every post, newest first.

const postList = document.getElementById('postList');

function buildPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  makeCardNavigable(card, postUrl(post.link));
  card.appendChild(createMediaElement({
    path: post.thumbnailPath, type: post.thumbnailType, poster: post.thumbnailPoster, label: post.title,
  }));

  const content = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = post.title;
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  meta.textContent = formatPostMeta(post);
  const desc = document.createElement('p');
  desc.className = 'post-description';
  desc.textContent = post.description;
  content.append(title, meta, desc);
  card.appendChild(content);
  return card;
}

if (postList) {
  loadHomeConfig()
    .then((config) => loadPosts(config.fallbackThumbnail || ''))
    .then((posts) => {
      postList.innerHTML = '';
      posts.forEach((post) => postList.appendChild(buildPostCard(post)));
    })
    .catch(() => {
      postList.textContent = 'No posts yet. Add Markdown files under /posts and list them in posts/posts.json.';
    });
}

const postContainer = document.getElementById('post');
const params = new URLSearchParams(window.location.search);
const file = params.get('file');
const getLocalizedMarkdown = window.getLocalizedMarkdown || ((markdown) => markdown);
function renderPost(post) {
  if (!postContainer) return;
  postContainer.innerHTML = '';
  
  // Main header (clean, no background)
  const header = document.createElement('div');
  header.className = 'post-header';
  
  const title = document.createElement('h1');
  title.textContent = post.title || '';
  header.appendChild(title);
  
  if (post.description) {
    const desc = document.createElement('p');
    desc.className = 'post-header-description';
    desc.textContent = post.description;
    header.appendChild(desc);
  }
  
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  const metaParts = [];
  if (post.authors) metaParts.push(post.authors);
  if (post.date) metaParts.push(post.date);
  if (metaParts.length) {
    meta.textContent = metaParts.join(' · ');
    header.appendChild(meta);
  }
  
  postContainer.appendChild(header);

  // Paper card (visually separated with background)
  if (post.publication || post.publicationlink || post.doi || post.cite) {
    const paperCard = document.createElement('div');
    paperCard.className = 'paper-card';
    
    if (post.publication) {
      const pubTitle = document.createElement('div');
      pubTitle.className = 'paper-title';
      const pubLabel = document.createElement('strong');
      pubLabel.textContent = 'Publication: ';
      pubTitle.appendChild(pubLabel);
      const pubText = document.createTextNode(post.publication);
      pubTitle.appendChild(pubText);
      paperCard.appendChild(pubTitle);
    }
    
    // Paper links and metadata line
    const paperMeta = document.createElement('div');
    paperMeta.className = 'paper-meta';
    
    // Parse publication links
    if (post.publicationlink) {
      const pubText = post.publicationlink;
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match;
      
      while ((match = linkPattern.exec(pubText)) !== null) {
        if (match.index > lastIndex) {
          const textNode = document.createTextNode(pubText.substring(lastIndex, match.index));
          paperMeta.appendChild(textNode);
        }
        
        const link = document.createElement('a');
        link.href = match[2];
        link.textContent = match[1];
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        paperMeta.appendChild(link);
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < pubText.length) {
        const textNode = document.createTextNode(pubText.substring(lastIndex));
        paperMeta.appendChild(textNode);
      }
    }
    
    // Add DOI if present
    if (post.doi) {
      if (post.publicationlink) {
        paperMeta.appendChild(document.createTextNode(' · '));
      }
      paperMeta.appendChild(document.createTextNode('DOI: ' + post.doi));
    }
    
    paperCard.appendChild(paperMeta);
    postContainer.appendChild(paperCard);
  }

  const mediaPath = post.thumbnailPath;
  if (mediaPath) {
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'post-header-media';
    const mediaType = post.thumbnailType || (isVideoSource(mediaPath) ? 'video' : 'image');
    const media = mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    if (mediaType === 'video') {
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.autoplay = true;
      media.preload = 'metadata';
      if (post.thumbnailPoster) media.poster = post.thumbnailPoster;
      media.src = mediaPath;
      media.setAttribute('aria-label', post.title);
    } else {
      media.src = mediaPath;
      media.alt = post.title;
    }
    mediaWrap.appendChild(media);
    postContainer.appendChild(mediaWrap);
  }

  const body = document.createElement('div');
  body.className = 'markdown';
  body.innerHTML = marked.parse(post.body);
  postContainer.appendChild(body);
}

if (file) {
  fetch(file)
    .then((res) => res.text())
    .then((md) => parsePost(getLocalizedMarkdown(md)))
    .then(({ meta, body }) => {
      const thumbnailPath = meta.thumbnailpath || meta.thumbnail || meta.image || meta.video || meta.videopath || '';
      const thumbnailType = meta.thumbnailtype || '';
      const thumbnailPoster = meta.thumbnailposter || '';
      const publication = meta.publication || '';
      const publicationlink = meta.publicationlink || '';
      const doi = meta.doi || '';
      const cite = meta.cite || '';
      renderPost({
        title: meta.title || file,
        authors: meta.authors || meta.author || '',
        date: meta.date || '',
        description: meta.description || '',
        publication,
        publicationlink,
        doi,
        cite,
        thumbnailPath,
        thumbnailType,
        thumbnailPoster,
        body,
      });
    })
    .catch(() => {
      if (postContainer) postContainer.textContent = 'Could not load this post.';
    });
} else if (postContainer) {
  postContainer.textContent = 'No post specified. Use ?file=posts/your-post.md';
}

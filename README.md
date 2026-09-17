# Neuromeka AI Lab pages

Static site hosted on GitHub Pages (moved from the internal GitLab on 2026-09-17). Content is markdown-first so updates are simple:

- **Home config**: `content/home.json` (hero media + core tech items; supports images/videos via `mediaType` or file extension, using `path`, plus optional `poster` and `heroCopyUrl`)
- **Hero copy**: `content/hero.md` (optional first line `MaxWidth: 900px` to control hero text width)
- **About**: `content/about.md`
- **Header/nav**: `assets/header.html` (shared top bar across pages); footer in `assets/footer.html`
- **Media assets**: `media/` (logo, hero images, post images, team photos, video thumbnails)
- **Blog**: add Markdown posts under `posts/` and list them in `posts/posts.json`. Each post should include a `# Title`, `Authors:`, `Date:`, and `Image:` line followed by the content body.
- **Team**: edit `team/team.md` using `## Name | Role`, optional `Image:`, and bullet points. Hiring notes live in `team/hiring.md`.
- **Open sources**: update `sources/repos.json`.
- **Scripts**: `assets/js/shared.js` holds the helpers (post loading, media elements, inline markdown); each page has its own small script. Markdown is rendered in the browser by [marked](https://github.com/markedjs/marked), pinned to v15 on jsDelivr in `index.html` and `post.html`.

Pages are optimized for a wide layout, white background, and a configurable blue accent via the `--color-accent` CSS variable in `assets/css/styles.css`.

## Hosting (GitHub Pages)

The site is served straight from the `main` branch root; there is no build step.

- Repository settings → **Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.
- Published URL: `https://junja94.github.io/team_page_nrmk/`
- `.nojekyll` at the root tells GitHub to publish the files as-is instead of running Jekyll.
- All links and fetches are relative, so the site works under the repository sub-path without any base-URL config.
- Videos are committed as regular files. Do **not** put them in Git LFS: GitHub Pages serves LFS pointer files, not the media.

Every push to `main` redeploys the site within a minute or two.

## Run locally

This site is static. Serve the repo root with any local web server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

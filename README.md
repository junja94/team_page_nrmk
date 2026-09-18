# Neuromeka AI Lab pages

Static two-page site hosted on GitHub Pages (moved from the internal GitLab on 2026-09-17): **Home** (hero, about, research list) and **Team** (people, collaborators, partner labs, open positions). Individual research posts open on `post.html`. Content is markdown-first so updates are simple.

## Editing content

- **Hero**: `content/hero.md`. First line `# Title`, then `Kicker: …`, a blank line, and the lead paragraph (markdown; `**bold**` renders in the accent colour). The hero image(s) are set in `content/home.json` as `heroImages: [{ "src": "...", "alt": "..." }, ...]`; with two or more entries the images crossfade automatically every 5s (disabled for viewers who set `prefers-reduced-motion`). A single entry — or the older `heroImage`/`heroImageAlt` keys — shows a static image.
- **About**: `content/about.md`, rendered as-is; `**bold**` renders in the accent colour.
- **Research posts**: add a Markdown file under `posts/` and list it in `posts/posts.json`. Front matter keys: `Title`, `Date` (YYYY-MM-DD, used for newest-first ordering), `Author`, `Description`, `Image` (a poster `.jpg`, or a video plus `ThumbnailPoster`), optional `Publication`, `Publication Link` (`[Label](url)`, comma-separated), `DOI`.
- **Team**: `team/team.md`
  - `# Group` starts a section (the first group is the page heading; `Meta: Seoul` adds the "N members · Seoul" note).
  - `## Name | Role` starts a person, followed by `Image: path`, optional `Link: [Google Scholar](url)`, and `- credential` bullets.
  - `### Partner labs` starts the logo grid; one bullet per lab: `- [Name](url) | Institution | media/partner_logos/x.png` (the logo path is optional; without it the tile shows the institution name).
- **Open positions**: `team/hiring.md`. `# Open positions` with a `Contact: …` line, then `## Title` per opening with `Location: …` and bullets: the first bullet is the requirement, the rest are joined with " · ".
- **Header/footer**: `assets/header.html`, `assets/footer.html`.
- **Scripts**: `assets/js/shared.js` holds the helpers; `home.js`, `team.js`, `post.js` render their pages. Markdown is rendered in the browser by [marked](https://github.com/markedjs/marked), pinned to v15 on jsDelivr in `index.html` and `post.html`.
- **Design tokens** (colours, fonts, 960px column) live at the top of `assets/css/styles.css`. Fonts are Barlow and Barlow Condensed from Google Fonts.

`sources.html` (open-source repositories from `sources/repos.json`) is kept but not linked from the navigation.

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

# Neuromeka AI Lab pages

Static two-page site hosted on GitHub Pages (moved from the internal GitLab on 2026-09-17):

- **Home** (`index.html`): hero with image slider and about copy, PI card, research list (`#research`), and the team blocks (`#team`: team, collaborators and partner labs, open positions).
- **PI Profile** (`profile.html`): header, research mosaic, experience and education, selected publications, awards and students, invited talks.

Individual research posts open on `post.html`. Content is markdown-first so updates are simple.

## Editing content

- **Hero**: `content/hero.md` holds `# Title` and `Kicker: …`. The paragraphs beside it come from `content/about.md` (markdown; `**bold**` renders in the accent colour). Slider images are `heroImages: [{ "src", "alt" }, …]` in `content/home.json`; with two or more the slider auto-advances (`heroIntervalMs`, default 6000), pauses on hover, and shows dots.
- **PI card** under the hero: the `piCard` object in `content/home.json` (photo, kicker, name, summary, link).
- **Research posts**: add a Markdown file under `posts/` and list it in `posts/posts.json`. Front matter keys: `Title`, `Date` (YYYY-MM-DD, used for newest-first ordering), `Author`, `Description`, `Image` (a still, or an `.mp4` that plays muted in the list, with `ThumbnailPoster` as its poster), optional `Publication`, `Publication Link` (`[Label](url)`, comma-separated), `DOI`.
- **Team**: `team/team.md`
  - `# Group` starts a block (the first block's heading gets the "N members · Seoul" note from `Meta: Seoul`).
  - `## Name | Role` starts a person, followed by `Image: path`, optional `Link: [Google Scholar](url)`, optional `Profile: profile.html` (rendered as "Profile →"), and `- credential` bullets.
  - `### Partner labs` starts the logo grid; one bullet per lab: `- [Name](url) | Institution | media/partner_logos/x.png` (the logo path is optional; without it the tile shows the institution name).
- **Open positions**: `team/hiring.md`. `# Open positions` with a `Contact: …` line, then `## Title` per opening with `Location: …` and bullets: the first bullet is the requirement, the rest are joined with " · ".
- **PI profile**: `profile/profile.json`. Header fields (`name`, `photo`, `role`, `bio`, `links`, `scholarUrl`), then `experience`, `education`, `publications` (year, title, authors, venue, optional award and link), `awards`, `students`, `talks`. The `mosaic` block lists six tiles with a `caption` and an optional `src` (image or `.mp4`, plus `poster`); tiles without a source show a placeholder. `mosaic.layout` is `custom` (each tile sets its own `cols`/`rows` on a grid of `mosaic.columns` columns, default 4, whose row height is `mosaic.rowHeight` px; optional `position` such as `"top"` picks the part of a photo that survives cropping, `fit: "contain"` letterboxes instead), `grid` (equal tiles, `mosaic.columns` per row, `mosaic.aspect`), or one of the fixed mosaics `hero`, `even`, `strip`, `feature`. Photos go under `media/profile/`, downscaled to about 1600px wide. The CV is `media/cv.pdf`.
- **Header/footer**: `assets/header.html`, `assets/footer.html`.
- **Scripts**: `assets/js/shared.js` holds the helpers; `home.js` + `team.js` render the home page, `profile.js` the profile, `post.js` a post. Markdown is rendered in the browser by [marked](https://github.com/markedjs/marked), pinned to v15 on jsDelivr in `index.html` and `post.html`.
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

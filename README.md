# t13a.com

A one-page introduction, built with [Astro](https://astro.build/) as a static site and published to GitHub Pages.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static site in `dist/` |
| `npm run preview` | Serves `dist/` |
| `npm run check` | Type-checks `.astro` and `.ts` files |
| `npm run fetch` | Refreshes the profile photo, `src/assets/avatar.png`, from GitHub (uses `$GITHUB_TOKEN`, or `gh auth token`) |
| `npm run og` | Renders the link preview image, `public/og.png`, from `src/assets/og.svg` in headless Chrome |

Node 22.18 or later is required; `npm run fetch` runs TypeScript directly.

## Where things are

- `src/config.ts`: what to tune: the year the career began, the GitHub account, slide duration.
- `src/pages/index.astro`: the page, composed from components, with the slides written out in it.
- `src/components/`: the card parts, the ticker and its controls, and one file per kind of slide in `slides/`.
- `src/styles/global.css`: colours and spacing as custom properties.
- `src/lib/`: build-time geometry for the contour background and rasters for the icons.
- `.github/workflows/pages.yml`: builds and deploys on push; on the 1st of each month it refreshes the photo, commits even when nothing changed so the schedule stays alive, then deploys.

Without JavaScript the ticker is a CSS scroll-snap carousel of every slide. With it, the ticker shows the slides one at a time, in order, with a progress bar; Show all, or a segment of the bar, lays them all out in a list. On paper they are always listed.

# t13a.com

A one-page introduction, built with [Astro](https://astro.build/) as a static site and published to GitHub Pages.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static site in `dist/` |
| `npm run preview` | Serves `dist/` |
| `npm run check` | Type-checks `.astro` and `.ts` files |
| `npm run fetch` | Refreshes `src/data/github.json` and `src/assets/avatar.png` from GitHub (uses `$GITHUB_TOKEN`, or `gh auth token`) |

Node 22.18 or later is required; `npm run fetch` runs TypeScript directly.

## Where things are

- `src/config.ts`: the numbers to tune: how many repositories are featured and shown, slide duration.
- `src/pages/index.astro`: the page, composed from components.
- `src/components/`: the card parts, the ticker and one file per slide in `slides/`.
- `src/styles/global.css`: colours and spacing as custom properties.
- `src/lib/`: the data schema and build-time SVG geometry.
- `.github/workflows/pages.yml`: builds and deploys on push; on the 1st of each month it refreshes the data, commits it, then deploys.

Without JavaScript the ticker is a CSS scroll-snap carousel of every slide. With it, the ticker keeps a random few repositories, shuffles the slides and advances on its own.

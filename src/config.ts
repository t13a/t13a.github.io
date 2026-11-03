// Everything tunable about what the page shows lives here.

/** The year the career began; the page shows the years since, rolling over on 1 January. */
export const CAREER_START_YEAR = 2008;

/** The GitHub account this page introduces. */
export const GITHUB_LOGIN = 't13a';

/** Which repositories `npm run fetch` writes to src/data/github.json as featured. */
export const FEATURED = {
  /** Repositories with at least one star or fork, most stars + forks first. */
  popular: 5,
  /** Repositories committed to within `recentDays`, most recent first. */
  recent: 5,
  recentDays: 365,
};

/** What the carousel shows on each page load. */
export const CAROUSEL = {
  /** Random picks from the pinned repositories. */
  pinnedPicks: 2,
  /** Random picks from the popular and recent repositories that are not pinned. */
  otherPicks: 2,
  /** How long each slide stays before the next one. */
  slideSeconds: 7,
};

// The shape of src/data/github.json. `npm run fetch` validates against it before writing,
// and the build validates again when reading, so a bad fetch never reaches the page.
import { z } from 'astro/zod';

export const repo = z.object({
  nameWithOwner: z.string(),
  url: z.url(),
  description: z.string(),
  stars: z.int(),
  forks: z.int(),
  /** Latest commit on the default branch; null for an empty repository. */
  committedAt: z.iso.datetime().nullable(),
});

export const githubData = z.object({
  generatedAt: z.iso.datetime(),
  login: z.string(),
  createdAt: z.iso.datetime(),
  /** Public repositories the account owns, forks and archived ones included. */
  repositories: z.int(),
  /** Stars across those repositories. */
  stars: z.int(),
  contributions: z.object({
    /** Contributions per calendar year, keyed by year. */
    yearly: z.record(z.string(), z.int()),
    /** The profile's contribution calendar: one level digit (0-4) per day from `start`. */
    lastYear: z.object({
      start: z.iso.date(),
      total: z.int(),
      levels: z.string().regex(/^[0-4]*$/),
    }),
  }),
  featured: z.object({
    pinned: z.array(repo),
    popular: z.array(repo),
    recent: z.array(repo),
  }),
});

export type Repo = z.infer<typeof repo>;
export type GitHubData = z.infer<typeof githubData>;

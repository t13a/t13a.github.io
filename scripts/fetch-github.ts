// Fetches the public GitHub data the page shows and writes src/data/github.json and
// src/assets/avatar.png. Run with `npm run fetch`; it uses $GITHUB_TOKEN, or the GitHub
// CLI's token when that is unset.
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { FEATURED, GITHUB_LOGIN } from '../src/config.ts';
import { githubData, type Repo } from '../src/lib/github.ts';

type RawRepo = {
  nameWithOwner: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  isFork?: boolean;
  defaultBranchRef: { target: { committedDate?: string } } | null;
};

type Level = 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';

const LEVELS: Record<Level, number> = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const REPO_FIELDS = `nameWithOwner url description stargazerCount forkCount
  defaultBranchRef { target { ... on Commit { committedDate } } }`;

const token = process.env.GITHUB_TOKEN || execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GitHub GraphQL failed: ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

function toRepo(r: RawRepo): Repo {
  return {
    nameWithOwner: r.nameWithOwner,
    url: r.url,
    description: r.description ?? '',
    stars: r.stargazerCount,
    forks: r.forkCount,
    committedAt: r.defaultBranchRef?.target.committedDate ?? null,
  };
}

const { user } = await graphql<{
  user: {
    createdAt: string;
    avatarUrl: string;
    pinnedItems: { nodes: RawRepo[] };
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: { date: string; contributionLevel: Level }[] }[];
      };
    };
  };
}>(
  `query ($login: String!) {
    user(login: $login) {
      createdAt
      avatarUrl(size: 400)
      pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { ${REPO_FIELDS} } } }
      contributionsCollection {
        contributionCalendar { totalContributions weeks { contributionDays { date contributionLevel } } }
      }
    }
  }`,
  { login: GITHUB_LOGIN },
);

// Every public repository the account owns, forks and archived ones included.
type RepoPage = {
  user: { repositories: { totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: RawRepo[] } };
};
const owned: RawRepo[] = [];
let ownedCount = 0;
for (let after: string | null = null; ; ) {
  const { user: page }: RepoPage = await graphql<RepoPage>(
    `query ($login: String!, $after: String) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC, first: 100, after: $after) {
          totalCount pageInfo { hasNextPage endCursor } nodes { isFork ${REPO_FIELDS} }
        }
      }
    }`,
    { login: GITHUB_LOGIN, after },
  );
  owned.push(...page.repositories.nodes);
  ownedCount = page.repositories.totalCount;
  if (!page.repositories.pageInfo.hasNextPage) break;
  after = page.repositories.pageInfo.endCursor;
}

// Contributions per calendar year since the account was created.
const firstYear = new Date(user.createdAt).getUTCFullYear();
const years = Array.from({ length: new Date().getUTCFullYear() - firstYear + 1 }, (_, i) => firstYear + i);
const { user: perYear } = await graphql<{ user: Record<string, { contributionCalendar: { totalContributions: number } }> }>(
  `query ($login: String!) {
    user(login: $login) {
      ${years.map((y) => `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`).join('\n')}
    }
  }`,
  { login: GITHUB_LOGIN },
);

const now = Date.now();
// Forks are other people's work, and this site's own repository is always "recent" because of
// the monthly data commit, so neither is featured.
const site = `${GITHUB_LOGIN}/${GITHUB_LOGIN}.github.io`;
const mine = owned.filter((r) => !r.isFork && r.nameWithOwner !== site).map(toRepo);
const calendar = user.contributionsCollection.contributionCalendar;
const days = calendar.weeks.flatMap((w) => w.contributionDays);

const data = githubData.parse({
  generatedAt: new Date(now).toISOString(),
  login: GITHUB_LOGIN,
  createdAt: user.createdAt,
  repositories: ownedCount,
  stars: owned.reduce((sum, r) => sum + r.stargazerCount, 0),
  contributions: {
    yearly: Object.fromEntries(years.map((y) => [y, perYear[`y${y}`].contributionCalendar.totalContributions])),
    lastYear: {
      start: days[0].date,
      total: calendar.totalContributions,
      levels: days.map((d) => LEVELS[d.contributionLevel]).join(''),
    },
  },
  featured: {
    pinned: user.pinnedItems.nodes.map(toRepo),
    popular: mine
      .filter((r) => r.stars + r.forks > 0)
      .sort((a, b) => b.stars + b.forks - (a.stars + a.forks))
      .slice(0, FEATURED.popular),
    recent: mine
      .filter((r) => r.committedAt && now - Date.parse(r.committedAt) <= FEATURED.recentDays * 86_400_000)
      .sort((a, b) => Date.parse(b.committedAt!) - Date.parse(a.committedAt!))
      .slice(0, FEATURED.recent),
  },
});

await writeFile(new URL('../src/data/github.json', import.meta.url), JSON.stringify(data, null, 2) + '\n');

// GitHub serves whatever format was uploaded; store it as PNG so the import path never changes.
const avatar = await fetch(user.avatarUrl);
if (!avatar.ok) throw new Error(`Avatar download failed: ${avatar.status}`);
await sharp(Buffer.from(await avatar.arrayBuffer())).png().toFile(new URL('../src/assets/avatar.png', import.meta.url).pathname);

const { pinned, popular, recent } = data.featured;
console.log(`Wrote ${data.repositories} repositories; featured ${pinned.length} pinned, ${popular.length} popular, ${recent.length} recent.`);

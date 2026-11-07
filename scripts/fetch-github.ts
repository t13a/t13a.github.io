// Fetches the GitHub profile photo the page shows and writes it to src/assets/avatar.png. Run
// with `npm run fetch`; it uses $GITHUB_TOKEN, or the GitHub CLI's token when that is unset.
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { GITHUB_LOGIN } from '../src/config.ts';

const token = process.env.GITHUB_TOKEN || execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({
    query: 'query ($login: String!) { user(login: $login) { avatarUrl(size: 400) } }',
    variables: { login: GITHUB_LOGIN },
  }),
});
const body = await res.json();
if (!res.ok || body.errors) throw new Error(`GitHub GraphQL failed: ${JSON.stringify(body.errors ?? body)}`);

// GitHub serves whatever format was uploaded; store it as PNG so the import path never changes.
const avatar = await fetch(body.data.user.avatarUrl);
if (!avatar.ok) throw new Error(`Avatar download failed: ${avatar.status}`);
await sharp(Buffer.from(await avatar.arrayBuffer())).png().toFile(new URL('../src/assets/avatar.png', import.meta.url).pathname);

console.log('Wrote src/assets/avatar.png.');

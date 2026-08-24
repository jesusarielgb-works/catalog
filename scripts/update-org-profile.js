const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const org = process.env.ORG_NAME || 'jesusarielgb-works';
const CONTENT = `# jesusarielgb-works

Open-source frameworks, books, manuals, research and standards by **Jesus Ariel Gonzalez Bonilla**.

All works MIT licensed. Catalog auto-generated nightly from GitHub Topics.

**13 domains:** architecture · data · devops · security · api · testing · backend · frontend · ai · quality · education · project · research

[View full catalog](https://jesusarielgb-works.github.io/catalog)
`;
async function main() {
  let sha;
  try {
    const { data } = await octokit.rest.repos.getContent(
      { owner: org, repo: '.github', path: 'profile/README.md' });
    sha = data.sha;
  } catch (e) { if (e.status !== 404) throw e; }
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: org, repo: '.github', path: 'profile/README.md',
    message: 'chore: update org profile [skip ci]',
    content: Buffer.from(CONTENT).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  console.log('Org profile updated.');
}
main().catch(err => { console.error(err); process.exit(1); });

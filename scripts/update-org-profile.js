const fs = require('fs');

function profileMarkdown(works) {
  const rows = works.map(w => `| [${w.name}](${w.url}) | ${w.type} | ${w.version} | ${w.description.replace(/\|/g, '\\|')} |`);
  return [
    '# jesusarielgb-works', '',
    'Open-source frameworks, standards, books and research by **Jesús Ariel González Bonilla**.', '',
    '| Work | Type | Version | Description |', '|------|------|---------|-------------|',
    ...rows, '',
    'Each repository states its own license. Rules in the frameworks cite the verified records of the',
    '[engineering casebook](https://github.com/jesusarielgb-works/engineering-casebook).', '',
    '[Full catalog](https://jesusarielgb-works.github.io/catalog)', '',
  ].join('\n');
}

async function main() {
  const { Octokit } = require('@octokit/rest');
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const org = process.env.ORG_NAME || 'jesusarielgb-works';
  if (!fs.existsSync('works.json')) {
    console.log('No works.json: catalog unchanged, profile left as is.');
    return;
  }
  const content = profileMarkdown(JSON.parse(fs.readFileSync('works.json', 'utf8')));
  let sha, current = '';
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: org, repo: '.github', path: 'profile/README.md' });
    sha = data.sha;
    current = Buffer.from(data.content, 'base64').toString('utf8');
  } catch (e) { if (e.status !== 404) throw e; }
  if (current === content) {
    console.log('Org profile unchanged.');
    return;
  }
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: org, repo: '.github', path: 'profile/README.md',
    message: 'chore: update org profile [skip ci]',
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  console.log('Org profile updated.');
}

module.exports = { profileMarkdown };

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

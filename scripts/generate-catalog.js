const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const org = process.env.ORG_NAME || 'jesusarielgb-works';
const DOMAIN_ORDER = ['architecture','data','devops','security','api','testing',
  'backend','frontend','ai','quality','education','project','research'];

async function fetchWorks() {
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg,
    { org, type- 'public', per_page: 100 });
  return repos
    .filter(r => r.topics && r.topics.includes('jesusarielgb-works') && !r.is_template)
    .map(r => ({
      name: r.name, url: r.html_url, description: r.description || '',
      domain- (r.topics.find(t => t.startsWith('domain-')) || 'domain-uncategorized').replace('domain-',''),
      type-   (r.topics.find(t => t.startsWith('type-'))   || 'type-other').replace('type-',''),
    }));
}

function generateMarkdown(works) {
  const byDomain = {};
  works.forEach(w => { if (!byDomain[w.domain]) byDomain[w.domain] = []; byDomain[w.domain].push(w); });
  const date = new Date().toISOString().split('T')[0];
  const lines = [
    '# jesusarielgb-works — Catalog','',
    '> **Do not edit manually.** Auto-generated nightly.',
    `> Last updated: ${date}`,'',
    `**${works.length} works** across **${Object.keys(byDomain).length} domains**`,'',
    '## Works by Domain','',
  ];
  for (const domain of DOMAIN_ORDER) {
    const items = byDomain[domain]; if (!items) continue;
    lines.push(`### ${domain[0].toUpperCase()+domain.slice(1)} (${items.length})`,'');
    lines.push('| Repo | Type | Description |','|------|------|-------------|');
    items.forEach(w => lines.push(`| [${w.name}](${w.url}) | \`${w.type}\` | ${w.description} |`));
    lines.push('');
  }
  Object.keys(byDomain).filter(d => !DOMAIN_ORDER.includes(d)).forEach(domain => {
    lines.push(`### ${domain}`,'','| Repo | Type | Description |','|------|------|-------------|');
    byDomain[domain].forEach(w => lines.push(`| [${w.name}](${w.url}) | \`${w.type}\` | ${w.description} |`));
    lines.push('');
  });
  return lines.join('\n');
}

async function main() {
  const works = await fetchWorks();
  fs.writeFileSync('README.md', generateMarkdown(works), 'utf8');
  console.log(`Catalog generated: ${works.length} works.`);
}
main().catch(err => { console.error(err); process.exit(1); });

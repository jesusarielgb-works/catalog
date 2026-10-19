const fs = require('fs');

const DOMAIN_ORDER = ['architecture','data','devops','security','api','testing',
  'backend','frontend','ai','quality','education','project','research'];

async function fetchWorks(octokit, org) {
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg,
    { org, type: 'public', per_page: 100 });
  const works = repos
    .filter(r => r.topics && r.topics.includes('jesusarielgb-works') && !r.is_template && !r.archived)
    .map(r => ({
      name: r.name, url: r.html_url, description: r.description || '',
      domain: (r.topics.find(t => t.startsWith('domain-')) || 'domain-uncategorized').replace('domain-',''),
      type:   (r.topics.find(t => t.startsWith('type-'))   || 'type-other').replace('type-',''),
      status: (r.topics.find(t => t.startsWith('status-')) || 'status-unknown').replace('status-',''),
    }));
  for (const w of works) {
    try {
      const { data } = await octokit.rest.repos.getLatestRelease({ owner: org, repo: w.name });
      w.version = data.tag_name;
    } catch (e) {
      if (e.status !== 404) throw e;
      w.version = '—';
    }
  }
  return works.sort((a, b) => a.name.localeCompare(b.name));
}

function cell(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function generateMarkdown(works, date) {
  const byDomain = {};
  works.forEach(w => { (byDomain[w.domain] = byDomain[w.domain] || []).push(w); });
  const lines = [
    '# jesusarielgb-works — Catalog', '',
    '> **Do not edit manually.** Generated from GitHub topics; committed only when a work changes.',
    `> Last updated: ${date}`, '',
    `**${works.length} works** across **${Object.keys(byDomain).length} domains**`, '',
    '## Works by Domain', '',
  ];
  const domains = DOMAIN_ORDER.filter(d => byDomain[d])
    .concat(Object.keys(byDomain).filter(d => !DOMAIN_ORDER.includes(d)).sort());
  for (const domain of domains) {
    const items = byDomain[domain];
    lines.push(`### ${domain[0].toUpperCase() + domain.slice(1)} (${items.length})`, '');
    lines.push('| Repo | Type | Version | Status | Description |', '|------|------|---------|--------|-------------|');
    items.forEach(w => lines.push(
      `| [${cell(w.name)}](${w.url}) | \`${cell(w.type)}\` | ${cell(w.version)} | ${cell(w.status)} | ${cell(w.description)} |`));
    lines.push('');
  }
  return lines.join('\n');
}

function withoutDate(markdown) {
  return markdown.replace(/^> Last updated: .*$/m, '');
}

async function main() {
  const { Octokit } = require('@octokit/rest');
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const org = process.env.ORG_NAME || 'jesusarielgb-works';
  const works = await fetchWorks(octokit, org);
  const next = generateMarkdown(works, new Date().toISOString().split('T')[0]);
  const current = fs.existsSync('README.md') ? fs.readFileSync('README.md', 'utf8') : '';
  if (withoutDate(current) === withoutDate(next)) {
    console.log(`Catalog unchanged: ${works.length} works.`);
    return;
  }
  fs.writeFileSync('README.md', next, 'utf8');
  fs.writeFileSync('works.json', JSON.stringify(works, null, 2) + '\n', 'utf8');
  console.log(`Catalog generated: ${works.length} works.`);
}

module.exports = { fetchWorks, generateMarkdown, withoutDate, cell };

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}

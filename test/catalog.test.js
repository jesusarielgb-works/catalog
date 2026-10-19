const test = require('node:test');
const assert = require('node:assert');
const { generateMarkdown, withoutDate, cell } = require('../scripts/generate-catalog.js');
const { profileMarkdown } = require('../scripts/update-org-profile.js');

const works = [
  { name: 'b-framework', url: 'https://x/b', description: 'B | pipe', domain: 'data', type: 'framework', version: 'v1.0.0', status: 'stable' },
  { name: 'a-framework', url: 'https://x/a', description: 'A', domain: 'architecture', type: 'framework', version: '—', status: 'draft' },
  { name: 'z-other', url: 'https://x/z', description: 'Z', domain: 'zzz', type: 'other', version: '—', status: 'unknown' },
];

test('domains follow the fixed order, unknown domains last', () => {
  const md = generateMarkdown(works, '2026-10-18');
  assert.ok(md.indexOf('### Architecture') < md.indexOf('### Data'));
  assert.ok(md.indexOf('### Data') < md.indexOf('### Zzz'));
  assert.match(md, /\*\*3 works\*\* across \*\*3 domains\*\*/);
});

test('a pipe in a description does not break the table', () => {
  assert.strictEqual(cell('a | b'), 'a \\| b');
  assert.match(generateMarkdown(works, '2026-10-18'), /B \\\| pipe/);
});

test('only the date changing is not a change', () => {
  const a = generateMarkdown(works, '2026-10-18');
  const b = generateMarkdown(works, '2026-10-19');
  assert.notStrictEqual(a, b);
  assert.strictEqual(withoutDate(a), withoutDate(b));
});

test('a new work is a change', () => {
  const a = generateMarkdown(works, '2026-10-18');
  const b = generateMarkdown(works.slice(1), '2026-10-18');
  assert.notStrictEqual(withoutDate(a), withoutDate(b));
});

test('the profile lists every work with its version', () => {
  const md = profileMarkdown(works);
  for (const w of works) assert.ok(md.includes(`[${w.name}](${w.url})`));
  assert.match(md, /v1\.0\.0/);
});

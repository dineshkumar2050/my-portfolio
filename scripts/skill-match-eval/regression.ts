// Regression gate for skill matching — deterministic, no API calls:
//   npm run test:skills
// Checks the taxonomy matcher (the offline half of the shipped taxonomy ∪ Claude strategy) on the labelled set.
import { readFileSync } from 'fs';
import path from 'path';
import { combine, knowledgeMatch, type MatchLabel } from '../../src/lib/resumeAgents/skillMatch';

const data: { keyword: string; label: MatchLabel }[] = JSON.parse(readFileSync(path.join(process.cwd(), 'scripts/skill-match-eval/dataset.json'), 'utf8'));
const preds = new Map(data.map((d) => [d.keyword, combine('taxonomy', d.keyword, knowledgeMatch(d.keyword), undefined).label]));

const labels: MatchLabel[] = ['claim', 'related', 'none'];
const f1 = (L: MatchLabel) => {
  const tp = data.filter((d) => d.label === L && preds.get(d.keyword) === L).length;
  const fp = data.filter((d) => d.label !== L && preds.get(d.keyword) === L).length;
  const fn = data.filter((d) => d.label === L && preds.get(d.keyword) !== L).length;
  const p = tp + fp ? tp / (tp + fp) : 0;
  const r = tp + fn ? tp / (tp + fn) : 0;
  return { p, f1: p + r ? (2 * p * r) / (p + r) : 0 };
};
const macroF1 = labels.reduce((s, L) => s + f1(L).f1, 0) / labels.length;
const claimPrecision = f1('claim').p;
const falseClaims = data.filter((d) => d.label === 'none' && preds.get(d.keyword) === 'claim').map((d) => d.keyword);

const checks = [
  { name: 'macro-F1 ≥ 85%', ok: macroF1 >= 0.85, value: `${(macroF1 * 100).toFixed(1)}%` },
  { name: 'claim precision ≥ 92%', ok: claimPrecision >= 0.92, value: `${(claimPrecision * 100).toFixed(1)}%` },
  { name: 'no false claims (none → claim)', ok: falseClaims.length === 0, value: falseClaims.join(', ') || '0' },
];
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  (${c.value})`);
process.exit(checks.every((c) => c.ok) ? 0 : 1);

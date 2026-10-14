// Skill-matching evaluation: compares matching algorithms on a labelled test set.
//   npx tsx --env-file=.env.local --tsconfig tsconfig.json scripts/skill-match-eval/run.ts [--no-llm] [--no-embeddings]
// dataset.json was labelled independently (by a separate agent that only read src/data/profile.ts).
// Primary metric: macro-F1 over claim/related/none; claim precision is reported separately because
// a false claim on a resume is the costliest error.

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import {
  combine, knowledgeMatch, lexicalMatch, llmMatch, norm, PROFILE_PHRASES,
  type MatchLabel, type SkillMatch, type Strategy,
} from '../../src/lib/resumeAgents/skillMatch';

interface Item { keyword: string; label: MatchLabel; category: string; rationale: string }
type Preds = Map<string, MatchLabel>;

const DIR = path.join(process.cwd(), 'scripts/skill-match-eval');
const data: Item[] = JSON.parse(readFileSync(path.join(DIR, 'dataset.json'), 'utf8'));
const args = new Set(process.argv.slice(2));
const LABELS: MatchLabel[] = ['claim', 'related', 'none'];
// Dev half: errors may be inspected and the taxonomy improved from them. Test half: never inspected — the verdict.
const DEV = data.filter((_, i) => i % 2 === 0);
const TEST = data.filter((_, i) => i % 2 === 1);

// ── Metrics ─────────────────────────────────────────────────────────────────

function metrics(preds: Preds, items = data) {
  const f1s: number[] = [];
  const per: Record<string, { p: number; r: number; f1: number; f05: number }> = {};
  for (const L of LABELS) {
    const tp = items.filter((d) => d.label === L && preds.get(d.keyword) === L).length;
    const fp = items.filter((d) => d.label !== L && preds.get(d.keyword) === L).length;
    const fn = items.filter((d) => d.label === L && preds.get(d.keyword) !== L).length;
    const p = tp + fp ? tp / (tp + fp) : 0;
    const r = tp + fn ? tp / (tp + fn) : 0;
    const f1 = p + r ? (2 * p * r) / (p + r) : 0;
    const f05 = p + r ? (1.25 * p * r) / (0.25 * p + r) : 0;
    per[L] = { p, r, f1, f05 };
    f1s.push(f1);
  }
  const accuracy = items.filter((d) => preds.get(d.keyword) === d.label).length / items.length;
  const falseClaims = items.filter((d) => d.label === 'none' && preds.get(d.keyword) === 'claim').length;
  return { accuracy, macroF1: f1s.reduce((a, b) => a + b, 0) / f1s.length, per, falseClaims };
}

// ── Vector matchers (evaluation only) ───────────────────────────────────────

type Vec = number[];
const cosine = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + x * b[i], 0);

/** Character 3–5-gram TF-IDF (fuzzy string similarity). */
function charTfidfScores(keywords: string[]) {
  const grams = (t: string) => {
    const s = ` ${norm(t)} `;
    const out: string[] = [];
    for (let n = 3; n <= 5; n++) for (let i = 0; i + n <= s.length; i++) out.push(s.slice(i, i + n));
    return out;
  };
  const docs = [...PROFILE_PHRASES, ...keywords].map(grams);
  const df = new Map<string, number>();
  docs.forEach((d) => new Set(d).forEach((g) => df.set(g, (df.get(g) ?? 0) + 1)));
  const N = docs.length;
  const vecs = docs.map((d) => {
    const tf = new Map<string, number>();
    d.forEach((g) => tf.set(g, (tf.get(g) ?? 0) + 1));
    const v = new Map<string, number>();
    let n2 = 0;
    tf.forEach((c, g) => { const w = (1 + Math.log(c)) * Math.log((N + 1) / ((df.get(g) ?? 0) + 1) + 1); v.set(g, w); n2 += w * w; });
    const n = Math.sqrt(n2) || 1;
    v.forEach((w, g) => v.set(g, w / n));
    return v;
  });
  const phraseVecs = vecs.slice(0, PROFILE_PHRASES.length);
  return new Map(keywords.map((k, i) => {
    const kv = vecs[PROFILE_PHRASES.length + i];
    let best = 0;
    for (const pv of phraseVecs) { let dot = 0; kv.forEach((w, g) => { dot += w * (pv.get(g) ?? 0); }); best = Math.max(best, dot); }
    return [k, best];
  }));
}

async function localEmbeddingScores(model: string, keywords: string[]) {
  // Optional, heavy (~300MB with onnxruntime) — install ad hoc: npm i --no-save @huggingface/transformers
  const pkg = '@huggingface/transformers';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { pipeline, env } = (await import(pkg)) as any;
  env.cacheDir = process.env.HF_CACHE_DIR || path.join(DIR, '.hf-cache');
  const embed = await pipeline('feature-extraction', model, { dtype: 'q8' });
  const run = async (texts: string[]): Promise<Vec[]> => (await embed(texts, { pooling: 'mean', normalize: true })).tolist();
  const phraseVecs = await run(PROFILE_PHRASES);
  const kwVecs = await run(keywords);
  return new Map(keywords.map((k, i) => [k, Math.max(...phraseVecs.map((p) => cosine(kwVecs[i], p)))]));
}

async function geminiEmbeddingScores(keywords: string[]) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const embedAll = async (texts: string[]) => {
    const out: Vec[] = [];
    for (let i = 0; i < texts.length; i += 100) {
      const res = await ai.models.embedContent({ model: 'gemini-embedding-001', contents: texts.slice(i, i + 100), config: { taskType: 'SEMANTIC_SIMILARITY' } });
      for (const e of res.embeddings ?? []) {
        const v = e.values ?? [];
        const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
        out.push(v.map((x) => x / n));
      }
    }
    return out;
  };
  const phraseVecs = await embedAll(PROFILE_PHRASES);
  const kwVecs = await embedAll(keywords);
  return new Map(keywords.map((k, i) => [k, Math.max(...phraseVecs.map((p) => cosine(kwVecs[i], p)))]));
}

/** Two thresholds (claim ≥ tc > related ≥ tr), tuned by 5-fold cross-validation on macro-F1. */
function crossValidatedPreds(scores: Map<string, number>) {
  const toLabel = (s: number, tc: number, tr: number): MatchLabel => (s >= tc ? 'claim' : s >= tr ? 'related' : 'none');
  const values = Array.from(new Set(Array.from(scores.values()).map((v) => Math.round(v * 100) / 100))).sort((a, b) => a - b);
  const order = data.map((d, i) => ({ d, r: Math.sin(i * 9301 + 49297) })).sort((a, b) => a.r - b.r).map((x) => x.d);
  const folds = 5;
  const preds: Preds = new Map();
  const chosen: string[] = [];
  for (let f = 0; f < folds; f++) {
    const test = order.filter((_, i) => i % folds === f);
    const train = order.filter((_, i) => i % folds !== f);
    let best = { score: -1, tc: 1, tr: 1 };
    for (const tc of values) for (const tr of values) {
      if (tr > tc) continue;
      const p: Preds = new Map(train.map((d) => [d.keyword, toLabel(scores.get(d.keyword)!, tc, tr)]));
      const m = metrics(p, train).macroF1;
      if (m > best.score) best = { score: m, tc, tr };
    }
    chosen.push(`${best.tc}/${best.tr}`);
    for (const d of test) preds.set(d.keyword, toLabel(scores.get(d.keyword)!, best.tc, best.tr));
  }
  return { preds, thresholds: chosen.join(' ') };
}

// ── Run ─────────────────────────────────────────────────────────────────────

(async () => {
  const keywords = data.map((d) => d.keyword);
  const results: { name: string; preds: Preds; ms: number; note?: string }[] = [];
  const time = async <T>(fn: () => Promise<T> | T) => { const t = Date.now(); const r = await fn(); return { r, ms: Date.now() - t }; };

  const lex = await time(() => new Map(keywords.map((k) => [k, lexicalMatch(k).label])));
  results.push({ name: 'Lexical (exact words) — baseline', preds: lex.r, ms: lex.ms });

  const known = await time(() => new Map(keywords.map((k) => [k, knowledgeMatch(k)])));
  results.push({ name: 'Skill taxonomy graph', preds: new Map(keywords.map((k) => [k, combine('taxonomy', k, known.r.get(k)!, undefined).label])), ms: known.ms, note: `${keywords.filter((k) => known.r.get(k)).length}/${keywords.length} known` });

  const ct = await time(() => charTfidfScores(keywords));
  const ctCv = crossValidatedPreds(ct.r);
  results.push({ name: 'Char n-gram TF-IDF (fuzzy)', preds: ctCv.preds, ms: ct.ms, note: `CV thresholds ${ctCv.thresholds}` });

  if (!args.has('--no-embeddings')) {
    for (const model of ['Xenova/all-MiniLM-L6-v2', 'Xenova/bge-small-en-v1.5']) {
      try {
        const e = await time(() => localEmbeddingScores(model, keywords));
        const cv = crossValidatedPreds(e.r);
        results.push({ name: `Embeddings: ${model.split('/')[1]}`, preds: cv.preds, ms: e.ms, note: `CV thresholds ${cv.thresholds}` });
      } catch (err) { console.warn(`skip ${model}:`, (err as Error).message.slice(0, 120)); }
    }
    try {
      const g = await time(() => geminiEmbeddingScores(keywords));
      const cv = crossValidatedPreds(g.r);
      results.push({ name: 'Embeddings: gemini-embedding-001', preds: cv.preds, ms: g.ms, note: `CV thresholds ${cv.thresholds}` });
    } catch (err) { console.warn('skip gemini embeddings:', (err as Error).message.slice(0, 160)); }
  }

  if (!args.has('--no-llm')) {
    const runs: Map<string, SkillMatch>[] = [];
    for (let i = 0; i < 2; i++) {
      const r = await time(() => llmMatch(keywords, { useCache: false }));
      runs.push(r.r);
      results.push({ name: `LLM judge (Claude Haiku) run ${i + 1}`, preds: new Map(keywords.map((k) => [k, r.r.get(k)!.label])), ms: r.ms });
    }
    const agree = keywords.filter((k) => runs[0].get(k)!.label === runs[1].get(k)!.label).length;
    console.log(`LLM run-to-run agreement: ${agree}/${keywords.length}`);
    for (const s of ['taxonomy+llm-fallback', 'llm+taxonomy-veto', 'taxonomy∪llm'] as Strategy[]) {
      results.push({ name: `Hybrid: ${s}`, preds: new Map(keywords.map((k) => [k, combine(s, k, known.r.get(k)!, runs[0].get(k)).label])), ms: 0 });
    }
  }

  // ── Report ──
  const rows = results.map((r) => ({ ...r, m: metrics(r.preds), test: metrics(r.preds, TEST), dev: metrics(r.preds, DEV) })).sort((a, b) => b.test.macroF1 - a.test.macroF1);
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
  console.log('\n| Algorithm | TEST macro-F1 | dev macro-F1 | All: accuracy | Claim precision | Claim recall | Claim F0.5 | False claims | Time |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    console.log(`| ${r.name} | **${pct(r.test.macroF1)}** | ${pct(r.dev.macroF1)} | ${pct(r.m.accuracy)} | ${pct(r.m.per.claim.p)} | ${pct(r.m.per.claim.r)} | ${pct(r.m.per.claim.f05)} | ${r.m.falseClaims} | ${r.ms}ms${r.note ? ` (${r.note})` : ''} |`);
  }

  const categories = Array.from(new Set(data.map((d) => d.category)));
  console.log('\nAccuracy by category (top 4):');
  console.log(`| Category (n) | ${rows.slice(0, 4).map((r) => r.name).join(' | ')} |`);
  for (const c of categories) {
    const items = data.filter((d) => d.category === c);
    console.log(`| ${c} (${items.length}) | ${rows.slice(0, 4).map((r) => pct(metrics(r.preds, items).accuracy)).join(' | ')} |`);
  }

  const best = rows[0];
  const inspect = process.env.INSPECT || best.name;
  const target = rows.find((r) => r.name === inspect) ?? best;
  console.log(`\nDEV-half errors of: ${target.name}`);
  for (const d of DEV) {
    const p = target.preds.get(d.keyword);
    if (p !== d.label) console.log(`  ${d.keyword.padEnd(32)} expected ${d.label.padEnd(7)} got ${p}  [${d.category}]`);
  }

  writeFileSync(path.join(DIR, 'results.json'), JSON.stringify(rows.map((r) => ({ name: r.name, ms: r.ms, note: r.note, all: r.m, test: r.test, dev: r.dev, predictions: Object.fromEntries(r.preds) })), null, 2));
})();

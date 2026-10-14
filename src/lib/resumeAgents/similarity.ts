import { PROFILE } from '@/data/profile';

// TF-IDF + cosine similarity between a job description and Dinesh's profile (classic NLP,
// unsupervised — no training data needed). Runs locally: no API calls, deterministic.
// The corpus is one document per PROFILE job plus one for the skills taxonomy, so IDF
// down-weights terms that appear everywhere in his profile and rewards distinctive overlap.

const STOPWORDS = new Set(
  ('a an and are as at be by for from has have in is it its of on or that the this to was were will with we you your our ' +
    'their they them who which what when where how all any can may must should would could about into over under using use used ' +
    'work working experience years year strong good great ability skills skill team teams role job candidate looking etc also ' +
    'including such other more most well new across within based plus required preferred responsibilities requirements').split(' ')
);

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  // Bigrams catch multi-word terms ("react native", "event driven", "spring boot").
  const bigrams = words.slice(1).map((w, i) => `${words[i]}_${w}`);
  return [...words, ...bigrams];
}

type Vector = Map<string, number>;

function termFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function cosine(a: Vector, b: Vector) {
  let dot = 0;
  a.forEach((weight, term) => { dot += weight * (b.get(term) ?? 0); });
  return dot; // vectors are L2-normalised
}

const PROFILE_DOCS = [
  ...PROFILE.jobs.map((j) => ({ id: j.id, tokens: tokenize([j.role, j.context, ...j.bullets].join(' ')) })),
  { id: 'skills', tokens: tokenize(PROFILE.skills.flatMap((g) => g.items).join(' ')) },
];

export interface SimilarityResult {
  overall: number; // 0-1: mean cosine of the 3 best-matching profile documents
  byJob: Map<string, number>; // per PROFILE job id
}

export function profileSimilarity(jobText: string): SimilarityResult {
  const docs = [...PROFILE_DOCS.map((d) => termFrequencies(d.tokens)), termFrequencies(tokenize(jobText))];

  const df = new Map<string, number>();
  docs.forEach((doc) => doc.forEach((_, term) => df.set(term, (df.get(term) ?? 0) + 1)));
  const n = docs.length;

  // Sublinear TF × smoothed IDF, L2-normalised.
  const vectors: Vector[] = docs.map((tf) => {
    const v: Vector = new Map();
    let norm = 0;
    tf.forEach((count, term) => {
      const w = (1 + Math.log(count)) * (Math.log((n + 1) / ((df.get(term) ?? 0) + 1)) + 1);
      v.set(term, w);
      norm += w * w;
    });
    norm = Math.sqrt(norm) || 1;
    v.forEach((w, term) => v.set(term, w / norm));
    return v;
  });

  const jd = vectors[vectors.length - 1];
  const scores = PROFILE_DOCS.map((d, i) => ({ id: d.id, score: cosine(jd, vectors[i]) }));
  const top = [...scores].sort((a, b) => b.score - a.score).slice(0, 3);

  return {
    overall: top.reduce((sum, s) => sum + s.score, 0) / top.length,
    byJob: new Map(scores.filter((s) => s.id !== 'skills').map((s) => [s.id, s.score])),
  };
}

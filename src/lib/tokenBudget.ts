// Site-wide daily AI token budget, shared by every visitor and every AI feature (chat + tailored resume).
// Once the day's total reaches the limit, all AI calls are refused until the next UTC day.
//
// Storage: Upstash Redis over REST (Vercel Marketplace "Upstash Redis" sets KV_REST_API_URL / KV_REST_API_TOKEN;
// UPSTASH_REDIS_REST_URL / _TOKEN also work). Serverless instances don't share memory, so without Redis the
// counter falls back to per-instance memory — fine for local dev, only best-effort in production.

export const DAILY_TOKEN_LIMIT = Number(process.env.DAILY_TOKEN_LIMIT) || 150_000;
export const TOKEN_LIMIT_MESSAGE = 'Token limit reached for today, please try again tomorrow.';

export class TokenLimitError extends Error {
  constructor() {
    super(TOKEN_LIMIT_MESSAGE);
    this.name = 'TokenLimitError';
  }
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const memory = new Map<string, number>();
let warned = false;

function todayKey() {
  return `portfolio:ai-tokens:${new Date().toISOString().slice(0, 10)}`;
}

async function redis<T>(command: (string | number)[][]): Promise<T[]> {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token store responded ${res.status}`);
  const rows = (await res.json()) as { result: T; error?: string }[];
  const failed = rows.find((r) => r.error);
  if (failed) throw new Error(`Token store error: ${failed.error}`);
  return rows.map((r) => r.result);
}

export async function tokensUsedToday(): Promise<number> {
  const key = todayKey();
  if (REDIS_URL && REDIS_TOKEN) {
    const [value] = await redis<string | null>([['GET', key]]);
    return Number(value) || 0;
  }
  if (!warned && process.env.NODE_ENV === 'production') {
    warned = true;
    console.warn('[token-budget] No Redis configured (KV_REST_API_URL / UPSTASH_REDIS_REST_URL): the daily limit is only enforced per server instance.');
  }
  return memory.get(key) ?? 0;
}

/** True when fewer than `needed` tokens are left today — lets a big job refuse up front instead of dying halfway. */
export async function hasTokensLeft(needed: number) {
  try {
    return DAILY_TOKEN_LIMIT - (await tokensUsedToday()) >= needed;
  } catch {
    return false;
  }
}

/** Throws TokenLimitError once today's usage has reached the limit. Fails closed if the store is unreachable. */
export async function assertTokenBudget() {
  if ((await tokensUsedToday()) >= DAILY_TOKEN_LIMIT) throw new TokenLimitError();
}

export async function isTokenBudgetExhausted() {
  try {
    return (await tokensUsedToday()) >= DAILY_TOKEN_LIMIT;
  } catch {
    return true;
  }
}

/** Adds the tokens a finished model call actually used (input + output) to today's total. */
export async function recordTokens(tokens: number) {
  if (!Number.isFinite(tokens) || tokens <= 0) return;
  const key = todayKey();
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await redis([['INCRBY', key, Math.round(tokens)], ['EXPIRE', key, 3 * 24 * 3600]]);
    } catch (err) {
      console.error('[token-budget] could not record usage:', err);
    }
    return;
  }
  memory.set(key, (memory.get(key) ?? 0) + Math.round(tokens));
}

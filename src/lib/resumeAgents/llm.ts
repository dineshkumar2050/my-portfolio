import { ChatAnthropic } from '@langchain/anthropic';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import type { LLMResult } from '@langchain/core/outputs';
import { RunnableLambda, type Runnable } from '@langchain/core/runnables';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { z } from 'zod';
import { assertTokenBudget, recordTokens, TokenLimitError } from '@/lib/tokenBudget';

// Claude Haiku 5.5 — Anthropic's cheapest model — is the only model used, so every token is counted against the
// site-wide daily budget (see lib/tokenBudget.ts). No Gemini/Groq fallbacks: they would bypass that budget.
const CLAUDE_MODEL = process.env.RESUME_AGENT_CLAUDE_MODEL || 'claude-haiku-5-5';
// Haiku thinks before answering by default, and thinking tokens are billed as output. Always run at "low" effort
// (extraction and short writing measured just as accurate); RESUME_AGENT_EFFORT overrides it globally.
type Effort = 'low' | 'medium' | 'high';
const EFFORT_OVERRIDE = process.env.RESUME_AGENT_EFFORT as Effort | undefined;
const MAX_OUTPUT_TOKENS = 4_000;

// Rate-limit / overload errors are retried with backoff.
const RETRY_WAITS_MS = [3_000, 10_000, 20_000];

export function isTransient(err: unknown) {
  const e = err as { status?: number; message?: string };
  // Daily quotas reset in hours — retrying for seconds won't help.
  if (/PerDay|retry in \d+h/i.test(String(e?.message))) return false;
  return e?.status === 429 || e?.status === 500 || e?.status === 503 || /rate limit|high demand|overloaded|try again/i.test(String(e?.message));
}

/** Any quota / rate-limit / overload error, including daily quotas (used for the visitor-facing message). */
export function isCapacityError(err: unknown) {
  const e = err as { status?: number; message?: string };
  return isTransient(err) || e?.status === 429 || /quota|rate limit|credit balance/i.test(String(e?.message));
}

export { TokenLimitError };

function usableKey(key: string | undefined) {
  return key && key !== 'your-key-here' ? key : undefined;
}

export function agentsConfigured() {
  return Boolean(usableKey(process.env.ANTHROPIC_API_KEY));
}

/** Sums the tokens (input + output, thinking included) of every model call made while it is attached. */
class UsageCounter extends BaseCallbackHandler {
  name = 'token-usage-counter';
  awaitHandlers = true;
  tokens = 0;
  handleLLMEnd(output: LLMResult) {
    for (const generation of output.generations.flat()) {
      const usage = (generation as { message?: { usage_metadata?: { total_tokens?: number } } }).message?.usage_metadata;
      if (usage?.total_tokens) this.tokens += usage.total_tokens;
    }
  }
}

/** A Claude Haiku chat model bound to a zod schema. `name` shows up in LangSmith traces. Every call is metered. */
export function structuredModel<S extends z.ZodType>(schema: S, name: string, __temperature = 0.3, _effort: Effort = 'low') {
  type Out = z.infer<S> & Record<string, unknown>;
  const anthropicKey = usableKey(process.env.ANTHROPIC_API_KEY);
  if (!anthropicKey) throw new Error('No AI provider configured (ANTHROPIC_API_KEY).');

  // Haiku 5.5 rejects non-default temperature, so none is set; "jsonSchema" (native structured outputs)
  // is used instead of forced tool calling, which conflicts with thinking.
  const model: Runnable<BaseLanguageModelInput, Out> = new ChatAnthropic({
    model: CLAUDE_MODEL,
    apiKey: anthropicKey,
    maxTokens: MAX_OUTPUT_TOKENS,
    maxRetries: 1,
    outputConfig: { effort: EFFORT_OVERRIDE ?? 'low' },
  }).withStructuredOutput<Out>(schema as never, { name, method: 'jsonSchema' });

  return RunnableLambda.from(async (input: BaseLanguageModelInput, config) => {
    const usage = new UsageCounter();
    try {
      for (let attempt = 0; ; attempt++) {
        await assertTokenBudget(); // also stops a run midway once the day's budget is spent
        try {
          return await model.invoke(input, { ...config, callbacks: [...(Array.isArray(config?.callbacks) ? config.callbacks : []), usage] });
        } catch (err) {
          if (attempt >= RETRY_WAITS_MS.length || !isTransient(err)) throw err;
          console.warn(`[resume-agents] ${name}: provider busy, retrying in ${RETRY_WAITS_MS[attempt] / 1000}s`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_WAITS_MS[attempt]));
        }
      }
    } finally {
      await recordTokens(usage.tokens);
    }
  }).withConfig({ runName: name });
}

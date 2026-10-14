import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { RunnableLambda, type Runnable } from '@langchain/core/runnables';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { z } from 'zod';

// Claude (Haiku) is the primary model; Gemini and Groq remain as fallbacks.
const CLAUDE_MODEL = process.env.RESUME_AGENT_CLAUDE_MODEL || 'claude-haiku-5-5';
// Haiku thinks before answering by default (effort "medium"). These agents do extraction and short writing,
// where low effort measured just as accurate and much faster; RESUME_AGENT_EFFORT overrides it globally.
type Effort = 'low' | 'medium' | 'high';
const EFFORT_OVERRIDE = process.env.RESUME_AGENT_EFFORT as Effort | undefined;
const GEMINI_MODEL = process.env.RESUME_AGENT_GEMINI_MODEL || 'gemini-3.6-flash';
const GROQ_MODEL = process.env.RESUME_AGENT_GROQ_MODEL || 'openai/gpt-oss-20b';

// Free-tier quotas (Gemini RPM, Groq TPM) are easily hit when agents run in parallel.
// Rate-limit / overload errors are retried across the whole provider chain with backoff.
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

function usableKey(key: string | undefined) {
  return key && key !== 'your-key-here' ? key : undefined;
}

export function agentsConfigured() {
  return Boolean(usableKey(process.env.ANTHROPIC_API_KEY) || usableKey(process.env.GOOGLE_API_KEY) || usableKey(process.env.GROQ_API_KEY));
}

/** A chat model bound to a zod schema, with provider fallback. `name` shows up in LangSmith traces. */
export function structuredModel<S extends z.ZodType>(schema: S, name: string, temperature = 0.3, effort: Effort = 'low') {
  type Out = z.infer<S> & Record<string, unknown>;
  const anthropicKey = usableKey(process.env.ANTHROPIC_API_KEY);
  const googleKey = usableKey(process.env.GOOGLE_API_KEY);
  const groqKey = usableKey(process.env.GROQ_API_KEY);

  const models: Runnable<BaseLanguageModelInput, Out>[] = [];
  if (anthropicKey) {
    // Haiku 5.5 rejects non-default temperature, and thinks by default — so no temperature here, and
    // "jsonSchema" (native structured outputs) instead of forced tool calling, which conflicts with thinking.
    models.push(
      new ChatAnthropic({ model: CLAUDE_MODEL, apiKey: anthropicKey, maxTokens: 16_000, maxRetries: 1, outputConfig: { effort: EFFORT_OVERRIDE ?? effort } })
        .withStructuredOutput<Out>(schema as never, { name, method: 'jsonSchema' })
    );
  }
  if (googleKey) {
    models.push(
      new ChatGoogleGenerativeAI({ model: GEMINI_MODEL, apiKey: googleKey, temperature, maxRetries: 1 })
        .withStructuredOutput<Out>(schema as never, { name })
    );
  }
  if (groqKey) {
    models.push(
      new ChatGroq({ model: GROQ_MODEL, apiKey: groqKey, temperature, maxRetries: 1 })
        .withStructuredOutput<Out>(schema as never, { name })
    );
  }
  if (!models.length) throw new Error('No AI provider configured (ANTHROPIC_API_KEY, GOOGLE_API_KEY or GROQ_API_KEY).');

  const [primary, ...fallbacks] = models;
  const chain = fallbacks.length ? primary.withFallbacks({ fallbacks }) : primary;

  return RunnableLambda.from(async (input: BaseLanguageModelInput, config) => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await chain.invoke(input, config);
      } catch (err) {
        if (attempt >= RETRY_WAITS_MS.length || !isTransient(err)) throw err;
        console.warn(`[resume-agents] ${name}: provider busy, retrying in ${RETRY_WAITS_MS[attempt] / 1000}s`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_WAITS_MS[attempt]));
      }
    }
  }).withConfig({ runName: name });
}

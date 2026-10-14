# Deployment

## GitHub Repository

Target GitHub account:

```text
https://github.com/dineshkumar2050
```

Suggested repository name:

```text
my-portfolio
```

Create and push after `git` is available on the machine:

```bash
git init
git branch -M main
git add .
git commit -m "Initial portfolio deployment setup"
git remote add origin https://github.com/dineshkumar2050/my-portfolio.git
git push -u origin main
```

## GitHub Actions

This project includes:

- `.github/workflows/ci.yml` - installs dependencies and runs `npm run build`.
- `.github/workflows/vercel-production.yml` - deploys to Vercel on pushes to `main`.

## Required GitHub Secrets

Add these in GitHub:

`Repository Settings -> Secrets and variables -> Actions -> New repository secret`

```text
GOOGLE_API_KEY
GROQ_API_KEY
EMAIL_USER
EMAIL_APP_PASSWORD
RESEND_API_KEY
RESEND_FROM_EMAIL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are optional if Gmail SMTP is your only email sender.

## Runtime Environment Variables (Vercel)

The GitHub Action pulls runtime variables from Vercel (`vercel pull`), so set these in Vercel Project Settings → Environment Variables:

```text
ANTHROPIC_API_KEY                       # tailored-resume agents (Claude Haiku, primary)
GOOGLE_API_KEY, GROQ_API_KEY            # chat widget + agent fallbacks
EMAIL_USER, EMAIL_APP_PASSWORD          # Gmail SMTP for OTP + resume emails
OTP_SIGNING_SECRET                      # signs OTP + session tokens
APIFY_API_TOKEN, SCRAPINGBEE_API_KEY,   # optional: read job URLs that block direct fetches
SCRAPERAPI_KEY                          #   (tried in that order; empty = skipped)
LANGSMITH_TRACING=true                  # optional: trace the resume agents
LANGSMITH_API_KEY, LANGSMITH_PROJECT
```

## Tailored Resume Agents

`/api/tailored-resume` runs a LangGraph multi-agent pipeline (`src/lib/resumeAgents/graph.ts`):
Job Scout → JD Analyst → Fit Assessor (skill judge ∥ related-skill picker) → (Summary Writer ∥ Skills Curator ∥ Project Writer × 5)
→ Fact Checker × (summary + each project) → ATS Reviewer → Section Editor × (flagged sections only) → finalize.
Fan-outs use LangGraph `Send`; the graph state is the agents' shared memory (project drafts upserted by jobId, findings appended).
Claude skill verdicts are cached per warm instance, and a low-fit "yes" reuses the job analysis via a signed token.
Agents run Claude Haiku at low effort (writers at medium) — typical runs take ~20–25s (previously ~25–57s).
The Fit Assessor scores the job against `src/data/profile.ts` (60% skill coverage + 40% TF-IDF cosine similarity, computed
locally in `similarity.ts`). Skill coverage is weighted by priority — language 50, framework 40, library 30, tool 20,
concept 10 (tiers tagged by the JD Analyst), nice-to-haves count half, and "any one of" groups ("Python, Java or Go") count
once. Per requirement: exact match 1.0, equivalent 0.9, related 0.5. Matching uses a skill taxonomy graph (synonyms,
broad→specific hierarchy, siblings — `skillTaxonomy.ts`) united with a Claude judge whose evidence quotes are verified
verbatim against the profile (`skillMatch.ts`). This combination won an evaluation of 10 algorithm variants (lexical,
fuzzy n-grams, MiniLM/BGE embeddings, taxonomy, LLM, hybrids) on an independently labelled 150-keyword set:
85.7% macro-F1 on the held-out half, 100% claim recall, 0 false claims (`npm run eval:skills`; `npm run test:skills` in CI). At ≥50% (`RESUME_FLEX_THRESHOLD`) agents write freely and may claim related JD
skills that fit Dinesh's stack. Below it the run pauses and the visitor is asked whether they still want the resume; on
"yes" it is generated in strict mode (profile facts only). Employers, titles, dates, education and achievements always
come from `profile.ts`. A run makes 5–6 LLM calls (~12k input tokens) on Claude Haiku 5.5
(`claude-haiku-5-5`, $0.10 / $0.50 per MTok — well under a cent per resume). Gemini and Groq are fallbacks only; their
free tiers (Gemini 5 req/min + 20/day, Groq 8k tokens/min) can't run the pipeline on their own.
Job URLs are read cheapest-first: LinkedIn guest API / Naukri job API (free) → direct fetch → Apify (Indeed) →
ScrapingBee → ScraperAPI. When every source fails or is out of credits, the visitor is asked to paste the JD.
The function needs up to ~60s, so `maxDuration` is 180 (requires Vercel Fluid compute, the default for new projects).

## Vercel Setup

Production URL (stable alias — per-deployment URLs expire):

```text
https://my-portfolio-dinesh-portfolio2.vercel.app
```

Project:

```text
dinesh-portfolio2/my-portfolio
```

The project can be deployed by GitHub Actions using the configured repository secrets. Native Vercel Git integration requires connecting the GitHub account inside Vercel first.

Manual setup/reference steps:

1. Go to Vercel and import `dineshkumar2050/my-portfolio`.
2. Set Framework Preset to `Next.js`.
3. Add the same runtime environment variables in Vercel Project Settings.
4. Deploy once from Vercel.
5. Copy `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `.vercel/project.json` after running:

```bash
npx vercel link
```

6. Create a Vercel token from account settings and save it as `VERCEL_TOKEN` in GitHub Actions secrets.

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

## Vercel Setup

1. Go to Vercel and import `dineshkumar2050/my-portfolio`.
2. Set Framework Preset to `Next.js`.
3. Add the same runtime environment variables in Vercel Project Settings.
4. Deploy once from Vercel.
5. Copy `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `.vercel/project.json` after running:

```bash
npx vercel link
```

6. Create a Vercel token from account settings and save it as `VERCEL_TOKEN` in GitHub Actions secrets.

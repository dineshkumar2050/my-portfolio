# Portfolio App — Setup & Deployment Guide

## Prerequisites

- Node.js 18+ — https://nodejs.org
- npm 9+ (comes with Node.js)
- Git

---

## 1. Local Development

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure environment variables
```bash
cp .env.local.example .env.local   # if .env.local doesn't exist yet
```
Then open `.env.local` and fill in your keys (see Environment Variables section below).

### Step 3 — Run the dev server
```bash
npm run dev
```
App runs at: **http://localhost:3000**

### Step 4 — Build check (optional, catches type errors)
```bash
npm run build
```

---

## 2. Environment Variables

All keys live in `.env.local`. The app works without any keys — features degrade gracefully.

### Email (OTP verification before resume download)
Choose ONE option:

**Option A — Gmail SMTP (no signup needed)**
```
EMAIL_USER=dineshkumarjhangra@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```
> Get app password: myaccount.google.com → Security → 2-Step Verification → App Passwords

**Option B — Resend (free 3000 emails/month)**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```
> Get key: resend.com → sign up free → API Keys

**No key set → Dev mode:** OTP is displayed directly in the modal UI (for local testing).

---

### AI Chatbot
Only ONE provider active at a time. Toggle the active block in `src/app/api/chat/route.ts`.

| Provider | Key | Where to get |
|---|---|---|
| OpenAI (default) | `OPENAI_API_KEY` | platform.openai.com/api-keys |
| Anthropic/Claude | `ANTHROPIC_API_KEY` | console.anthropic.com |
| Google Gemini | `GOOGLE_API_KEY` | aistudio.google.com/app/apikey |
| Grok/xAI | `XAI_API_KEY` | console.x.ai |
| Perplexity | `PERPLEXITY_API_KEY` | perplexity.ai/settings/api |
| Meta/Llama (Groq) | `GROQ_API_KEY` | console.groq.com (free tier) |
| Azure OpenAI | `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_ENDPOINT` | portal.azure.com |

> Switching providers also requires `npm i @anthropic-ai/sdk` (Anthropic) or `npm i @google/genai` (Gemini). All others use the already-installed `openai` SDK.

---

### Portfolio URL (used in email links)
```
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000        # local
NEXT_PUBLIC_PORTFOLIO_URL=https://yourdomain.com       # production
```

---

## 3. Deploy to Vercel (Recommended — free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Select your repo → Deploy

### Step 3 — Add environment variables in Vercel
1. Vercel dashboard → your project → Settings → Environment Variables
2. Add each key from `.env.local` (never commit `.env.local` to git)

### Step 4 — Update portfolio URL
```
NEXT_PUBLIC_PORTFOLIO_URL=https://your-project.vercel.app
```

> **Note:** File-based analytics (`data/analytics/*.json/.txt`) do NOT persist on Vercel (serverless = read-only filesystem). For production analytics, switch to a database (Supabase, PlanetScale, Upstash Redis). Locally, file analytics work perfectly.

---

## 4. Deploy to a VPS / Self-hosted (Ubuntu/Debian)

### Step 1 — On your server
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### Step 2 — Create production env file
```bash
cp .env.local.example .env.local
nano .env.local   # fill in your keys
```

### Step 3 — Build
```bash
npm run build
```

### Step 4 — Run with PM2 (keeps app alive after server restart)
```bash
npm install -g pm2
pm2 start npm --name "portfolio" -- start
pm2 save
pm2 startup
```
App runs on port 3000 by default.

### Step 5 — Nginx reverse proxy (serves on port 80/443)
```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then enable HTTPS with: `sudo certbot --nginx -d yourdomain.com`

---

## 5. Adding Your Photos to the Hero Carousel

1. Put your photos in `public/images/` (e.g. `photo1.jpg`, `photo2.jpg`, `photo3.jpg`)
2. Open `src/components/HeroCarousel.tsx`
3. Replace the `image` field in each slide:
```typescript
image: '/images/photo1.jpg',   // slide 1
image: '/images/photo2.jpg',   // slide 2
image: '/images/photo3.jpg',   // slide 3
```

---

## 6. Updating Social Profile Links

Open `src/components/SocialSection.tsx` and update the `PROFILES` object with your real handles.

---

## 7. Analytics Data

Download/OTP tracking is stored locally in:
```
data/analytics/otp-requests.json     ← who requested OTPs
data/analytics/otp-requests.txt      ← human-readable log
data/analytics/resume-downloads.json ← who downloaded & how many times
data/analytics/resume-downloads.txt  ← human-readable log
```
These files update automatically — no action needed.

---

## 8. Key Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server (hot reload) |
| `npm run build` | Production build (catches errors) |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint checks |

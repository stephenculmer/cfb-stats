# Deploying CFB Stats to Vercel

## Prerequisites

- A [Vercel](https://vercel.com) account connected to your GitHub account
- A [Neon](https://neon.tech) Postgres database (or use Vercel's Neon integration)
- An [Anthropic API key](https://console.anthropic.com)
- A [College Football Data API key](https://collegefootballdata.com/key) (free)

---

## 1. Set up the database

### Option A — Vercel Postgres (recommended)

Vercel has a built-in Neon integration that auto-populates `POSTGRES_URL` in your project environment:

1. In your Vercel project dashboard, go to **Storage → Create Database → Postgres (Neon)**
2. Follow the prompts — Vercel will provision the database and automatically add `POSTGRES_URL` to your project's environment variables

### Option B — Bring your own Neon database

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from **Dashboard → Connection Details** (use the pooled connection string)
3. Add it as `POSTGRES_URL` in your Vercel project environment variables (see step 3)

> The `shares` table is created automatically on first use — no migration step needed.

---

## 2. Deploy to Vercel

### Via the Vercel dashboard (easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `cfb-stats` repository from GitHub
3. Leave the framework preset as **Next.js** — Vercel detects it automatically
4. Add environment variables (see step 3) before clicking **Deploy**

### Via the Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 3. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Apply them to **Production**, **Preview**, and **Development** as appropriate.

| Variable | Where to get it | Environments |
|---|---|---|
| `POSTGRES_URL` | Neon dashboard or Vercel Postgres integration | Production, Preview |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Production, Preview |
| `CFBD_API_KEY` | [collegefootballdata.com/key](https://collegefootballdata.com/key) | Production, Preview |

> Never commit real secrets to the repo — `.env` and `.env.local` are in `.gitignore`. Use `.env.example` as the reference template.

---

## 4. CI/CD with GitHub Actions

Vercel's GitHub integration handles continuous deployment automatically once the repo is connected — every push to `main` triggers a production deployment, and every pull request gets a preview deployment URL posted as a comment.

For additional checks (type checking, linting) before Vercel builds, create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint
```

This runs on every push and PR. Vercel will still deploy, but you'll see the CI status on the PR before merging.

### Blocking deploys on CI failure (optional)

In your Vercel project settings, go to **Git → Ignored Build Step** and set it to check for a passing CI status, or use [Vercel's GitHub deployment protection](https://vercel.com/docs/deployments/deployment-protection) to require passing checks before production deploys.

---

## 5. Preview deployments

Every pull request automatically gets a unique preview URL from Vercel. To make preview deployments fully functional, add all three environment variables to the **Preview** environment in Vercel settings (a separate Neon branch or the same database is fine for low-traffic previews).

---

## 6. Custom domain (optional)

1. In Vercel → Project → **Settings → Domains**, add your domain
2. Update your DNS with the CNAME or A records Vercel provides
3. Vercel provisions a TLS certificate automatically

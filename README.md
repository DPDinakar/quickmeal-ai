# QuickMeal AI

Full-stack AI web app that suggests quick, healthy meal plans for busy professionals.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

Set `OPENROUTER_API_KEY` to your OpenRouter key.

3. Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Auth + database (Supabase)

This project supports user accounts and saving generated meal plans per user.

### 1) Create a Supabase project

- Create a project in Supabase
- In **Project Settings → API**, copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add them to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2) Create tables + RLS policies

Run the SQL in `supabase.sql` using **Supabase → SQL Editor**.

### 3) Enable Email/Password Auth

In **Supabase → Authentication → Providers**, enable **Email**.

### 4) Pages

- `GET /login`: signup/login
- `GET /history`: saved meal plans (protected)
- `GET /logout`: sign out

## Tech

- Next.js (App Router) + Tailwind CSS
- API route: `POST /api/mealplan`
- AI: OpenRouter
- Structured output: validated with Zod
- Auth + DB: Supabase

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import repo → Deploy.
3. In Vercel: **Project → Settings → Environment Variables**, add:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (optional)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy.

### Production notes (recommended)

- Turn on **email confirmations** (Supabase Auth settings)
- Add **rate limiting** (so users can’t spam OpenRouter)


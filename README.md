# JustSeen

**Movies are better with friends.** JustSeen is a simple place to share quick reviews of what you watch and see what your friends are watching. No critic scores or giant databases: you decide what to watch next from the people whose taste you trust.

## Features

- **Feed** of your reviews and those of the people you follow, newest first, filterable by genre
- **Reviews** with half-star ratings, a short review (up to 250 characters) and the date you watched
- **Watchlist** for movies you want to see; reviewing a movie takes it off the list
- **Movie pages** with cast, runtime and what people on JustSeen thought (friends first, no critic scores)
- **Search** any movie through [TMDB](https://www.themoviedb.org/)
- **Follow** people, browse their profiles, watched movies and watchlists
- **Reactions** (agree / not sure / disagree) on reviews, with real-time notifications
- **Year in Film**: movies and hours watched, top genres, month-by-month chart, favourites
- Light and dark mode, animal avatars, editable profile, email + password accounts with password rules

## Tech

- **Website:** React 19, Vite, React Router, Tailwind CSS 4 + daisyUI
- **Database, login and real-time:** [Supabase](https://supabase.com) (Postgres with Row Level Security)
- **Hosting:** [Netlify](https://www.netlify.com), plus one Netlify Function that keeps the TMDB key off the browser
- **Movie data:** [TMDB API](https://developer.themoviedb.org/)

## Running it locally

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
# 1. Install
npm run setup

# 2. Settings: copy the example and fill in your keys
cp client/.env.example client/.env

# 3. Start the website on http://localhost:5173
npm run dev
```

### First-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: paste `supabase/migrations/0001_init.sql` and run it.
3. **Authentication → URL Configuration**: set the Site URL to `http://localhost:5173`
   and add `http://localhost:5173/**` to the Redirect URLs.
4. **Project Settings → API**: copy the Project URL and the publishable (anon) key into `client/.env`.

## Deploying to Netlify

1. In Netlify: **Add new site → Import an existing project** and pick this repository.
   `netlify.toml` already holds the build settings.
2. **Site configuration → Environment variables**: add `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY` and `TMDB_TOKEN`.
3. In Supabase **Authentication → URL Configuration**, add your Netlify address
   (for example `https://justseen.netlify.app/**`) to the Redirect URLs and make it the Site URL.

## Project structure

```
client/
  src/pages/          one file per page
  src/components/     shared pieces (MovieCard, ReviewModal, Header, ...)
  src/data/           every Supabase query, one file per table
  src/auth/           login state, username rules, the "must be logged in" gate
  src/library/        my reviews, watchlist and follows, shared across the app
  src/lib/            Supabase client, TMDB helper, dates, Year in Film maths
  netlify/functions/  the TMDB proxy
supabase/migrations/  the database: tables, security rules, triggers
```

This product uses the TMDB API but is not endorsed or certified by TMDB.

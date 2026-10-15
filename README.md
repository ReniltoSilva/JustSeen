# JustSeen

**Movies are better with friends.** JustSeen is a simple place to share quick reviews of what you watch and see what your friends are watching. No critic scores or giant databases: you decide what to watch next from the people whose taste you trust.

## Features

- **Feed** of your reviews and those of the people you follow, newest first, filterable by genre
- **Reviews** with half-star ratings, a short review (up to 250 characters) and the date you watched
- **Movies and TV shows**: review either, told apart by `media_type`
- **Watchlist** for what you want to see; reviewing something takes it off the list
- **Movie and show pages** with cast, runtime or seasons, and what people on JustSeen thought (friends first, no critic scores)
- **Search** any movie or TV show through [TMDB](https://www.themoviedb.org/)
- **Follow** people, browse their profiles, what they watched and their watchlists, with suggestions based on friends in common and shared taste
- **Reactions** (agree / not sure / disagree) on reviews, with real-time notifications
- **Year in Film**: movies, shows and hours watched, top genres, month-by-month chart, favourites
- Light and dark mode, animal avatars, editable profile, email + password accounts with password rules

## Tech

- **Website:** React 19, Vite, React Router, Tailwind CSS 4 + daisyUI
- **Database, login and real-time:** [Supabase](https://supabase.com) (Postgres with Row Level Security)
- **Hosting:** [Netlify](https://www.netlify.com), plus one Netlify Function that keeps the TMDB key off the browser
- **Movie and TV data:** [TMDB API](https://developer.themoviedb.org/)

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

## The mobile app

`mobile/` is a React Native app built with Expo, using the same Supabase project, so
the same accounts, reviews and rules. It has everything the website has: the feed,
search, reviews, reactions, profiles, following, the watchlist, notifications, Year in
Film, sharing, and signing up or in with email or Google.

1. Install **Expo Go** on your phone (App Store / Google Play).
2. `npm run setup:mobile`, then copy `mobile/.env.example` to `mobile/.env` and fill in the
   same Supabase URL and publishable key as the website (with the `EXPO_PUBLIC_` prefix).
3. `npm run mobile` and scan the QR code: with the Camera app on iPhone, or from Expo Go on Android.
   The phone and the computer need to be on the same Wi-Fi.
4. For **Continue with Google** in the app, add these in Supabase -> Authentication ->
   URL Configuration -> Redirect URLs: `exp://**` (Expo Go while developing) and
   `justseen://**` (the installed app).

## Project structure

```
client/
  src/pages/          one file per page
  src/components/     shared pieces (MovieCard, ReviewModal, Header, ...)
  src/data/           every Supabase query, one file per table
  src/auth/           login state, username rules, the "must be logged in" gate
  src/library/        my reviews, watchlist and follows, shared across the app
  src/lib/            Supabase client, TMDB helper, Year in Film maths, monitoring
  netlify/functions/  the TMDB proxy
mobile/src/app/       the app's screens (Expo Router: one file per screen)
mobile/src/           the app's components, queries and login state, like client/src
shared/               plain JavaScript both apps use (dates, genres, avatars, rules, stats)
supabase/migrations/  the database: tables, security rules, triggers
```

This product uses the TMDB API but is not endorsed or certified by TMDB.

# github-repository-explorer

A responsive, accessible public GitHub repository explorer built with Vite, React, strict TypeScript, Tailwind CSS v4, and lucide-react. No backend, authentication, or client tokens.

## Run

Requires Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and produces `dist/`; `npm run preview` serves that production build. `npm run typecheck` checks types independently. The built `dist/` can be deployed to a static host.

## Features

- Submit a keyword or click an example; no requests on typing or initial load.
- Filter by language; sort by relevance, stars, or update time. Changing a filter resets pagination and uses the last submitted query.
- Ten results per page, skeleton loading, empty and error states, and explicit 403/429 messaging.
- Stale requests are cancelled with AbortController; all network logic and API types live in `src/api.ts`.
- Keyboard controls, labelled inputs, live announcements, reduced-motion support, and protected external links.

## GitHub API limitations

Uses the actual `GET https://api.github.com/search/repositories` endpoint with URLSearchParams and GitHub API version 2022-11-28. No fabricated or fallback results. Queries support GitHub syntax such as `topic:creative-coding` and `stars:>100`; the language dropdown appends a language qualifier, so avoid a conflicting language qualifier in your text.

Unauthenticated search is typically limited to 10 requests/minute; other unauthenticated REST endpoints generally allow 60/hour. Limits are shared by IP, and secondary restrictions may apply. This app displays retry guidance from rate-limit headers when available and never retries automatically. Requests only occur on explicit searches, filter changes, pagination, or retry. GitHub exposes at most 1,000 results per search, and may return incomplete results; both conditions are surfaced. Search data can be delayed by GitHub indexing. Network access and GitHub availability are required.

See [GitHub search documentation](https://docs.github.com/en/rest/search) and [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api). Never add a private token to this frontend or a Vite environment variable: client values are public.

## Screenshot

<img width="1900" height="907" alt="image" src="https://github.com/user-attachments/assets/e3c33027-81bd-443a-af16-88bb42381dca" />


## Verification

No automated tests are included, as requested. Verified on October 16, 2026: `npm run build` passed (strict TypeScript and Vite production bundle). A separate unauthenticated live API request for `react language:TypeScript`, sorted by stars with 10 results per page, returned HTTP 200 and 10 real repositories. Full browser interaction testing was not performed.

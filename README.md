# Lina

An editorial hotel site for [nadavi256.github.io/dil-lina](https://nadavi256.github.io/dil-lina/). Static Astro build, Tailwind, GitHub Pages. Hosting cost is zero.

The brief is hotels that look like luxury at about $80–150, plus one true-luxury hotel in each city. Hotels with `tier` set to `edit` must be verified at $150 or under and a Booking.com score of 8.5 or higher. `tier` set to `true-luxury` is the single splurge for that city, labeled “The splurge” on the page. A nightly rate is printed only when `price.status` is `verified`. The public line is “from $X / night” with “Checked Nov 10–11, 2026 · prices change”.

## Add a hotel

Copy a file in `src/content/hotels/` and point `city` at `paris`, `rome`, or `barcelona`. Set `price.status` to `verified` only after you have read a live Booking.com rate for a specific date, room, and occupancy. Put that same day’s Booking.com score and review count on `review`. Leave `review` as `null` and the price as `TODO` if you have not checked.

Set `featured` to `true` to show it on the home page. City pages list every hotel for that city, ordered by `cityOrder`.

## Add a city

Add `src/content/cities/<id>.json`, a credited photograph in `src/lib/photos.ts`, and hotels whose `city` matches the file id.

## Commands

```bash
npm install
npm run dev
npm run build
npm run content
npm run links
```

Booking.com buttons are ordinary hotel URLs. The Stay22 Let Me Allez loader in `src/components/Stay22.astro` uses `aid=dillina` and rewrites those links after the page loads.

City photographs are from Unsplash and credited on the page. Hotel cards do not use another property’s photo.

## Deploy

GitHub Pages publishes the root of `main`. The Actions workflow in `.github/workflows/pages.yml` builds with Node 24, checks content and links, then commits that output to the repository root. The commit message includes `[skip pages]` so the workflow does not run again on its own push. `public/.nojekyll` is copied into the build so Pages uploads the files as they are, including `_astro`. Hosting stays on the free GitHub Pages plan.

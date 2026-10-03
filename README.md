# Idris Khattak Portfolio

A responsive portfolio site built with plain HTML, CSS and JavaScript. No build step.

## Run
Open `index.html` directly in your browser, or use the Live Server extension in VS Code.

## Structure

```
index.html                          home — hero, work index, about, journey, contact
style.css                           one stylesheet for every page
script.js                           nav, footer year, chat widget
projects/<slug>/index.html          one page per project
```

The home page shows **one featured card** plus a **work index** — one row per project.
The index grows without redesign; the featured card carries the hierarchy.

## Adding a project

1. Copy `projects/awkum-assistant/index.html` to `projects/<new-slug>/index.html`.
2. Replace the head metadata (`title`, `description`, `og:*`, `canonical`) and the content.
3. Add a `<li class="work-item">` to the work index in `index.html`.
4. Update the `.project-next` link at the bottom of the neighbouring project pages.

Keep the result on the index row, not only on the detail page — that row is what
decides whether anyone clicks through.

Page sections, in the order they get read: the problem, what I built, the numbers,
what went wrong, example runs, what I would do differently.

## Assets still missing
Referenced by the pages but not in the repo:

- `og-image.png` (1200×630) — without it, LinkedIn shares render as a blank card
- `projects/awkum-assistant/og-image.png`, `projects/people-counting/og-image.png`
- `cv.pdf` — linked from the contact section
- `portrait.jpg` (square, 600px+) — markup is in `index.html`, commented out

## Content still to fill
Search for `TODO(Idris)`:

- Example runs on both project pages
- The 2024–2026 gap in the timeline
- Confirm the internship term in the contact section

## Next improvements
- Add figures to the hand gesture case study
- Add an evaluation set to the university assistant rebuild
- Re-index the chat assistant's corpus so it covers the project pages
- Deploy to GitHub Pages, Vercel, or Netlify

# tools

## og-template.html

The three Open Graph share cards, laid out at exactly 1200×630 — the size
LinkedIn, Slack and X expect.

Each `<section class="card">` maps to one PNG:

| Element | Save as |
| --- | --- |
| `#card-home` | `og-image.png` |
| `#card-awkum` | `projects/awkum-assistant/og-image.png` |
| `#card-counting` | `projects/people-counting/og-image.png` |

### Regenerating

Open the file in a browser, then screenshot each card at 1:1. In Chrome DevTools:
right-click the element → **Capture node screenshot**.

### Adding a card for a new project

Copy the `#card-awkum` section, change the kicker, headline and the three stats,
and give it a new id. Use the project's own surface colour — `card-forest` or
`card-ink`, or neither for paper — so the card matches its page.

Keep the headline under about 60 characters. Longer than that and it either
wraps past three lines or has to be set too small to read in a feed.

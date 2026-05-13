## Design Context

### Users

Devoted theater-goers and completionists. People chasing all 39 plays as a long, slow personal project — many across years and cities. They open the app immediately after a show (or while planning one), often on phone, sometimes one-handed. They are not casual; they care that the artifact holds up. The completed book is the point — the app is the vessel.

### Brand Personality

Three words: **archival, earned, theatrical-restrained.**

Voice is institutional and registry-dry. Lines like "AWAITING INSPECTION", "ATTESTED · 02 VIEWINGS", "NO PRODUCTIONS ON RECORD". Never "you haven't seen this yet." Never emoji. Never marketing-cheerful.

The interface should evoke **earned prestige** — pride in the artifact, not celebration of the task. Stamping is an act, not a tap. The book is doing the talking; the UI gets out of the way.

### Aesthetic Direction

Already established and intentional — preserve, don't redirect:

- **Palette (light edition):** cream paper `#ece4d0`, ink blue `#1b2742`, vermilion accent `#c43d2c`. Dark edition: soot, bone, warmer red. Both are canonical.
- **Type:** EB Garamond (display), IBM Plex Sans (body), IBM Plex Mono (registry marks, specs, runners). The mono is _literally a passport stamp_ aesthetic — not "developer vibes."
- **Texture:** subtle paper grain, hairline rules, dotted borders, crop ticks on plates, rough-edge stamps via SVG filter. These exist; they should not multiply.
- **Format:** mobile-first, 360×740 framed card on desktop. The page is a physical leaf.

**Anti-references (explicit):**

- **Not a SaaS dashboard.** No KPI tiles, no sidebar nav, no settings gear in the corner, no card-grid metric layouts.
- **Not a kid's sticker book.** No bouncy animation, no cute rounded illustration, no celebration toasts, no Duolingo-style streaks.

### Design Principles

These guide every cut, every addition, every microcopy choice:

1. **Every datum must mean something.** No fake registry numbers, no decorative "REF-04 / SECT-II" labels, no telemetry-flavored fields that look like data but aren't. If a number isn't real, remove it. If a label has no referent, kill it.

2. **The page is a leaf, not a screen.** Page furniture (runner, chrome, ticks, rules) earns its place by reinforcing the document metaphor — not by filling space. If two registry textures are doing the same job, keep one.

3. **Type and texture do the talking; don't add chrome to compensate.** Borders, dotted rules, and mini-marks are seasoning. When something feels weak, fix the typography or the spacing — don't wrap it in a box.

4. **Voice is institutional, not friendly.** Short, declarative, registry-dry. Past tense or imperative. No second-person reassurance. No celebration. The book records; it does not congratulate.

5. **Nothing wraps that shouldn't.** Specs, stamp meta, runner lines — these are typeset, not laid out. Anything that bumps to two lines, overflows the plate, or breaks the grid is broken. Pick fewer fields over crowded fields.

6. **Earned, not generated.** Stamps come from seeing a play. The interface should make that feel weighty. Empty states are honest ("AWAITING INSPECTION") — not bait ("Add your first!").

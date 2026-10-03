# Mobile course correction, 2026-10-03

Reference: the owner's 380×3107 Figma PNG, with the revised lesson copy supplied in the accompanying screenshots. The PNG is a layout reference, not permission to restore obsolete copy or placeholder contact details.

Direction: existing brown/cream course identity, Miama headings, Montserrat captions. ENERGY 2 / RHYTHM 1 / MOTION 1. The repeated lesson layout expresses the actual lesson sequence. No new visual theme or motion system.

Changes and reasons:

- Two-line mobile course heading, smaller responsive type and tighter caption spacing restore the reference's compact composition.
- Revised lesson descriptions remain in document flow; their different lengths are not cropped to old PNG rectangles.
- SVG play triangles replace a Unicode glyph that iOS rendered as a blue emoji. The whole poster remains a labeled, keyboard-operable button.
- Short hyphens replace long dashes on the course page, as requested.
- Caption ornaments reuse the project's existing Figma wave path instead of an oval border.
- The legal safety notice and real footer contacts are retained. These intentionally differ from the old PNG. Body copy remains at least 12px and zoom is not disabled.

Scoped delivery checks:

- PASS, layout: browser checks at 320, 375, 380, 390, 430, 767, 820 and 1440px found no horizontal overflow or heading/poster/caption overlap. Mobile heading is two lines.
- PASS, interaction: menu opens and closes with Escape; each of eight lesson poster buttons displays its existing clearly worded video-placeholder notice. No paid video was exposed.
- PASS, copy: `scripts/test-page-assets.mjs` checks the approved motto and all eight revised descriptions, updated lesson titles, absence of long dashes and eight vector play controls.
- PASS, identity: existing fonts, palette, photos and repeated course composition are preserved; only sizing, spacing, ornaments and play controls change. No invented claims, testimonials or new navigation.
- PASS, keyboard/semantics: poster buttons retain descriptive accessible labels and visible focus styling; decorative SVGs are hidden from assistive technology. The tap area is the full poster, not the small triangle.
- Scope: Chromium responsive emulation is not a claim of testing a physical iPhone. SVG markup removes the emoji-font dependency directly.

Screenshots and browser scripts are retained locally under the ignored `output/playwright/` directory.

## Follow-up: supplied mobile SVG and typography inspector screenshots

The owner's SVG export and 18 screenshots now identify the heading font as
**Snell Roundhand**, not Miama. The earlier direction above describes the interim
implementation; it is not a claim of exact font fidelity.

- Captions now use the actual locally hosted Montserrat Italic 400 face, 12px at
  the 380px reference width, with 15px line spacing. The original screenshot boxes
  are 45px for three lines and 60px for four. Content starts at x=35px; the first
  three captions have a 305px text measure and later ones 325px. A 12px minimum
  prevents unreadably shrinking the body copy on narrower screens.
- Mobile poster gutters are 20px, corner radii 10px, and caption top gaps 10px
  at the reference width. Revised copy remains in normal flow. Desktop styles
  and copy are unchanged.
- `lessons-background-mobile.svg` is a background-only derivative of the supplied
  export: original #482817 base, eleven radius-98.5 circles, #FFFFC9 to #FF3B00
  radial stops and 50px sRGB blur. No old text, photos, or placeholder contacts
  are embedded. `optimize-site-assets.mjs` renders the background once to a
  15,192-byte WebP, avoiding live mobile Gaussian filter work. Background height
  adapts to the revised content, so its vertical placement is not pixel-identical
  to the old fixed-height composition.
- Approved motto, all eight revised descriptions, lesson names and short dashes
  remain guarded by `test-page-assets.mjs`. CSS-linked assets and their size
  budgets are checked too.

Remaining fidelity blocker: no Snell Roundhand font file is present in the
project or supplied files. Its glyph outlines in the SVG do not provide a usable
web font for the revised lesson titles. Do not silently rename Miama, reconstruct
a font from outlines, or claim exact typography. A web-licensed font file is
needed before applying the source heading settings: h1 32px/16px, centered in
314px; lesson headings 30px/21px, weight 500, at x=20px. These very tight line
boxes must be checked with the real font to avoid glyph overlap.

UI/UX guidance was used for overflow checks, preserving usable controls and
minimum body size. It did not replace the owner's supplied design or copy.

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
